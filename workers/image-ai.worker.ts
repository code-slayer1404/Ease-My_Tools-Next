// import { env, pipeline } from "@huggingface/transformers";

// env.allowLocalModels = false;

// let initPromise: Promise<{
//     segmenter: any;
//     device: string;
// }> | null = null;

// async function initializeEngine() {
//     let device = "wasm";
//     let supportsF16 = false;

//     if (typeof navigator !== "undefined" && "gpu" in navigator) {
//         try {
//             const adapter = await navigator.gpu.requestAdapter();

//             if (adapter) {
//                 device = "webgpu";

//                 if (adapter.features?.has("shader-f16")) {
//                     supportsF16 = true;
//                 }
//             }
//         } catch (e) {
//             console.warn("WebGPU not available, using WASM", e);
//         }
//     }

//     const preferredDtype =
//         device === "webgpu" && supportsF16 ? "fp16" : "q8";

//     const progressCallback = (data: any) => {
//         if (data.status === "progress") {
//             self.postMessage({
//                 type: "engine",
//                 status: "downloading",
//                 progress: data.progress,
//                 device,
//             });
//         }
//     };

//     const segmenter = await pipeline(
//         "background-removal",
//         "onnx-community/ISNet-ONNX",
//         {
//             device,
//             dtype: preferredDtype,
//             progress_callback: progressCallback,
//         }
//     );

//     return { segmenter, device };
// }

// self.onmessage = async (e: MessageEvent) => {
//     const { imageSrc, id } = e.data;
//     if (!imageSrc) return;

//     if (!initPromise) {
//         initPromise = initializeEngine();
//     }

//     try {
//         const { segmenter, device } = await initPromise;

//         self.postMessage({
//             type: "engine",
//             status: "ready",
//             device,
//         });

//         self.postMessage({
//             id,
//             type: "item",
//             status: "loading",
//             message: "Spawning pipelines...",
//         });

//         // Important: pass an array
//         const output = await segmenter([imageSrc]);

//         const blob = await output[0].toBlob();

//         const resultBitmap = await createImageBitmap(blob);

//         self.postMessage(
//             {
//                 id,
//                 type: "item",
//                 status: "complete",
//                 bitmap: resultBitmap,
//                 device,
//             },
//             [resultBitmap]
//         );
//     } catch (error: any) {
//         console.error("Worker Error:", error);

//         self.postMessage({
//             id,
//             type: "item",
//             status: "error",
//             message: error.message || "Failed to process image",
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