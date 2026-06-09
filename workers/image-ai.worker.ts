
// import { env, AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';

// env.allowLocalModels = false;

// let initPromise: Promise<{ model: any; processor: any; device: string }> | null = null;

// async function initializeEngine() {
//     let device = 'wasm';
//     let supportsF16 = false;

//     if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
//         try {
//             const adapter = await navigator.gpu.requestAdapter();
//             if (adapter) {
//                 device = 'webgpu';
//                 if (adapter.features?.has('shader-f16')) {
//                     supportsF16 = true;
//                 }
//             }
//         } catch (e) {
//             console.warn("WebGPU not available, using WASM", e);
//         }
//     }

//     // FIX: Fall back to 'q8' (8-bit quantization) instead of 'fp32' to load the ~45MB model asset on WASM
//     const preferredDtype = (device === 'webgpu' && supportsF16) ? 'fp16' : 'q8';

//     const progressCallback = (data: any) => {
//         if (data.status === 'progress') {
//             self.postMessage({
//                 type: 'engine',
//                 status: 'downloading',
//                 progress: data.progress,
//                 device,
//             });
//         }
//     };

//     const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
//         device,
//         dtype: preferredDtype,
//         progress_callback: progressCallback,
//     });

//     const processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');

//     return { model, processor, device };
// }

// self.onmessage = async (e: MessageEvent) => {
//     const { imageSrc, id } = e.data;
//     if (!imageSrc) return;

//     // Engine init (once)
//     if (!initPromise) {
//         initPromise = initializeEngine();
//     }

//     try {
//         const { model, processor, device } = await initPromise;

//         // Engine ready
//         self.postMessage({ type: 'engine', status: 'ready', device });

//         self.postMessage({ id, type: 'item', status: 'loading', message: 'Spawning pipelines...' });

//         // Load image from URL (original behaviour)
//         const image = await RawImage.fromURL(imageSrc);

//         // Preprocess
//         const { pixel_values } = await processor(image);

//         // Predict alpha matte
//         const { output } = await model({ input: pixel_values });

//         // Resize mask to original size
//         const alphaMatte = await RawImage.fromTensor(
//             output[0].mul(255).to('uint8')
//         ).resize(image.width, image.height);

//         // Create an offscreen canvas to composite the image with transparency
//         const canvas = new OffscreenCanvas(image.width, image.height);
//         const ctx = canvas.getContext('2d');
//         if (!ctx) throw new Error('Could not get 2D context');

//         // Draw original image using a fresh ImageBitmap from the same URL
//         const imgBitmap = await createImageBitmap(await fetch(imageSrc).then(r => r.blob()));
//         ctx.drawImage(imgBitmap, 0, 0);

//         // Get image data
//         const imgData = ctx.getImageData(0, 0, image.width, image.height);

//         // Apply alpha matte
//         for (let i = 0; i < imgData.data.length; i += 4) {
//             imgData.data[i + 3] = alphaMatte.data[i / 4];
//         }

//         // Put image data back
//         ctx.putImageData(imgData, 0, 0);

//         // Convert to ImageBitmap and transfer back
//         const resultBitmap = canvas.transferToImageBitmap();

//         self.postMessage({
//             id,
//             type: 'item',
//             status: 'complete',
//             bitmap: resultBitmap,
//             device,
//         }, [resultBitmap]);

//     } catch (error: any) {
//         console.error("Worker Error:", error);
//         self.postMessage({
//             id,
//             type: 'item',
//             status: 'error',
//             message: error.message || 'Failed to process image',
//         });
//     }
// };

import { env, pipeline } from "@huggingface/transformers";

env.allowLocalModels = false;

let initPromise: Promise<{
    segmenter: any;
    device: string;
}> | null = null;

async function initializeEngine() {
    let device = "wasm";
    let supportsF16 = false;

    if (typeof navigator !== "undefined" && "gpu" in navigator) {
        try {
            const adapter = await navigator.gpu.requestAdapter();

            if (adapter) {
                device = "webgpu";

                if (adapter.features?.has("shader-f16")) {
                    supportsF16 = true;
                }
            }
        } catch (e) {
            console.warn("WebGPU not available, using WASM", e);
        }
    }

    const preferredDtype =
        device === "webgpu" && supportsF16 ? "fp16" : "q8";

    let lastProgressTime = 0;

    const progressCallback = (data: any) => {
        if (data.status === "progress") {
            const now = performance.now();
            // Limit message channel pressure to prevent rendering performance drops
            if (now - lastProgressTime > 60 || data.progress === 100) {
                lastProgressTime = now;
                self.postMessage({
                    type: "engine",
                    status: "downloading",
                    progress: data.progress,
                    device,
                });
            }
        }
    };

    const segmenter = await pipeline(
        "background-removal",
        "onnx-community/ISNet-ONNX",
        {
            device,
            dtype: preferredDtype,
            progress_callback: progressCallback,
        }
    );

    return { segmenter, device };
}

self.onmessage = async (e: MessageEvent) => {
    const { imageSrc, id } = e.data;
    if (!imageSrc) return;

    if (!initPromise) {
        initPromise = initializeEngine();
    }

    try {
        const { segmenter, device } = await initPromise;

        self.postMessage({
            type: "engine",
            status: "ready",
            device,
        });

        self.postMessage({
            id,
            type: "item",
            status: "loading",
            message: "Spawning pipelines...",
        });

        const output = await segmenter([imageSrc]);

        const blob = await output[0].toBlob();

        const resultBitmap = await createImageBitmap(blob);

        self.postMessage(
            {
                id,
                type: "item",
                status: "complete",
                bitmap: resultBitmap,
                device,
            },
            [resultBitmap]
        );
    } catch (error: any) {
        console.error("Worker Error:", error);

        self.postMessage({
            id,
            type: "item",
            status: "error",
            message: error.message || "Failed to process image",
        });
    }
};