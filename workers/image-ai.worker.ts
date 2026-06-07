// import { env, AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';

// // 1. Configure the caching pipeline properly before execution loops begin
// env.allowLocalModels = false;
// env.useBrowserCache = true;

// // Force the WASM CPU engine to utilize all available physical cores if WebGPU is absent
// if (env.backends?.onnx?.wasm) {
//     env.backends.onnx.wasm.numThreads = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
// }

// let model: any = null;
// let processor: any = null;
// let activeDevice = 'wasm';

// async function initializeEngine() {
//     if (model && processor) {
//         return { model, processor, device: activeDevice };
//     }

//     let device = 'wasm';
//     if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
//         try {
//             const adapter = await (navigator as any).gpu.requestAdapter();
//             if (adapter) {
//                 device = 'webgpu';
//             }
//         } catch (e) {
//             console.warn("WebGPU adapter initialization bypassed. Falling back to multi-threaded WASM.", e);
//         }
//     }

//     activeDevice = device;

//     // Use native fp16 weights (88MB) on WebGPU, or full precision fp32 weights (176MB) on WASM CPU paths
//     const preferredDtype = activeDevice === 'webgpu' ? 'fp16' : 'fp32';

//     if (!model) {
//         // briaai/RMBG-1.4 includes a standard config.json now—we do not need to pass manual overrides
//         model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
//             device: activeDevice,
//             dtype: preferredDtype,
//             progress_callback: (data: any) => {
//                 if (data.status === 'progress') {
//                     self.postMessage({
//                         status: 'downloading',
//                         progress: data.progress,
//                         message: `Loading engine weights (${activeDevice.toUpperCase()} - ${preferredDtype}): ${Math.round(data.progress)}%`
//                     });
//                 }
//             }
//         });
//     }

//     if (!processor) {
//         processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');
//     }

//     return { model, processor, device: activeDevice };
// }

// self.onmessage = async (event: MessageEvent) => {
//     const { imageSrc } = event.data;
//     if (!imageSrc) return;

//     try {
//         self.postMessage({ status: 'loading', message: 'Checking engine local cache structures...' });

//         const { model, processor, device } = await initializeEngine();

//         self.postMessage({
//             status: 'processing',
//             message: `Processing neural tensor channels via local ${device.toUpperCase()}...`
//         });

//         const image = await RawImage.fromURL(imageSrc);
//         const { pixel_values } = await processor(image);

//         const { output } = await model({ input: pixel_values });

//         const alphaMatte = await RawImage.fromTensor(
//             output[0].mul(255).to('uint8')
//         ).resize(image.width, image.height);

//         // Transfer raw memory array allocations across threads instantly without copying data
//         self.postMessage({
//             status: 'complete',
//             maskData: alphaMatte.data,
//             width: image.width,
//             height: image.height
//         }, [alphaMatte.data.buffer]);

//     } catch (error: any) {
//         self.postMessage({ status: 'error', error: error.message || error });
//     }
// };

import { env, AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';

// Configure the caching pipeline properly before execution loops begin
env.allowLocalModels = false;
env.useBrowserCache = true;

// Force the WASM CPU engine to utilize all available physical cores if WebGPU is absent
if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.numThreads = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
}

let model: any = null;
let processor: any = null;
let activeDevice = 'wasm';

async function initializeEngine() {
    if (model && processor) {
        return { model, processor, device: activeDevice };
    }

    let device = 'wasm';
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
        try {
            const adapter = await (navigator as any).gpu.requestAdapter();
            if (adapter) {
                device = 'webgpu';
            }
        } catch (e) {
            console.warn("WebGPU adapter initialization bypassed. Falling back to multi-threaded WASM.", e);
        }
    }

    activeDevice = device;

    // Use native fp16 weights (88MB) on WebGPU, or full precision fp32 weights (176MB) on WASM CPU paths
    const preferredDtype = activeDevice === 'webgpu' ? 'fp16' : 'fp32';

    if (!model) {
        model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
            device: activeDevice,
            dtype: preferredDtype,
            progress_callback: (data: any) => {
                if (data.status === 'progress') {
                    self.postMessage({
                        status: 'downloading',
                        progress: data.progress,
                        message: `Loading engine weights (${activeDevice.toUpperCase()} - ${preferredDtype}): ${Math.round(data.progress)}%`
                    });
                }
            }
        });
    }

    if (!processor) {
        processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');
    }

    return { model, processor, device: activeDevice };
}

self.onmessage = async (event: MessageEvent) => {
    const { imageSrc } = event.data;
    if (!imageSrc) return;

    try {
        self.postMessage({ status: 'loading', message: 'Checking engine local cache structures...', progress: 10 });

        const { model, processor, device } = await initializeEngine();

        self.postMessage({
            status: 'processing',
            message: `Processing neural tensor channels via local ${device.toUpperCase()}...`,
            progress: 50
        });

        // 1. Run inference via Hugging Face Transformers
        const image = await RawImage.fromURL(imageSrc);
        const { pixel_values } = await processor(image);
        const { output } = await model({ input: pixel_values });

        const alphaMatte = await RawImage.fromTensor(
            output[0].mul(255).to('uint8')
        ).resize(image.width, image.height);

        self.postMessage({ status: 'processing', message: 'Compositing alpha channels in background memory...', progress: 90 });

        // 2. Background Compositing Pipeline (Moves loop completely off the main thread)
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const originalBitmap = await createImageBitmap(blob);

        const offscreen = new OffscreenCanvas(image.width, image.height);
        const osCtx = offscreen.getContext('2d');
        if (!osCtx) throw new Error('Failed to claim background canvas allocation context.');

        // Draw the full baseline source image
        osCtx.drawImage(originalBitmap, 0, 0);
        originalBitmap.close(); // Immediately purge source bitmap to save memory

        // Inject alpha channel transparent matte mappings directly
        const imgData = osCtx.getImageData(0, 0, image.width, image.height);
        const pixels = imgData.data;
        const mask = alphaMatte.data;

        for (let i = 0; i < mask.length; i++) {
            pixels[i * 4 + 3] = mask[i]; // Bind raw transparency values directly inside worker
        }

        osCtx.putImageData(imgData, 0, 0);

        // 3. Extract as a completely standalone zero-copy transferable reference
        const outputBitmap = offscreen.transferToImageBitmap();

        // Pass ownership of the compiled bitmap image to the main thread instantly
        self.postMessage({
            status: 'complete',
            bitmap: outputBitmap,
            progress: 100
        }, [outputBitmap]);

    } catch (error: any) {
        self.postMessage({ status: 'error', error: error.message || error });
    }
};