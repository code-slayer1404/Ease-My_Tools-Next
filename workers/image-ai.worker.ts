import { env, AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';

env.allowLocalModels = false;

let model: any = null;
let processor: any = null;
let activeDevice = 'wasm';

async function initializeEngine() {
    let device = 'wasm';
    let supportsF16 = false;

    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                device = 'webgpu';
                // Verify if the hardware profile supports 16-bit float shaders
                if (adapter.features?.has('shader-f16')) {
                    supportsF16 = true;
                }
            }
        } catch (e) {
            console.warn("WebGPU not available, using WASM", e);
        }
    }

    activeDevice = device;
    // Fix: Fall back gracefully to fp32 if WebGPU is available but missing shader-f16 
    // to prevent the pipeline initializer from deadlocking.
    const preferredDtype = (activeDevice === 'webgpu' && supportsF16) ? 'fp16' : 'fp32';

    if (!model) {
        model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
            device: activeDevice,
            dtype: preferredDtype,
            progress_callback: (data: any) => {
                if (data.status === 'progress') {
                    self.postMessage({
                        status: 'downloading',
                        progress: data.progress,
                        message: `Loading model weights (${activeDevice.toUpperCase()}): ${Math.round(data.progress)}%`
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

self.onmessage = async (e: MessageEvent) => {
    const { imageSrc, id } = e.data;
    if (!imageSrc) return;

    try {
        self.postMessage({ id, status: 'loading', message: 'Spawning pipelines...' });
        const { device } = await initializeEngine();

        self.postMessage({ id, status: 'processing', message: 'Extracting subject...' });

        // Load image
        const image = await RawImage.fromURL(imageSrc);

        // Preprocess image
        const { pixel_values } = await processor(image);

        // Predict alpha matte
        const { output } = await model({ input: pixel_values });

        // Resize mask to original image size
        const alphaMatte = await RawImage.fromTensor(
            output[0].mul(255).to('uint8')
        ).resize(image.width, image.height);

        // Create an offscreen canvas to composition the image with transparent background
        const canvas = new OffscreenCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context');

        // Draw original image
        const imgBitmap = await createImageBitmap(await fetch(imageSrc).then(r => r.blob()));
        ctx.drawImage(imgBitmap, 0, 0);

        // Get image data
        const imgData = ctx.getImageData(0, 0, image.width, image.height);

        // Apply alpha matte
        for (let i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i + 3] = alphaMatte.data[i / 4];
        }

        // Put image data back
        ctx.putImageData(imgData, 0, 0);

        // Convert to ImageBitmap to transfer back to main thread
        const bitmap = canvas.transferToImageBitmap();

        self.postMessage({
            id,
            status: 'complete',
            bitmap,
            device
        }, [bitmap]);

    } catch (error: any) {
        console.error("Worker Error:", error);
        self.postMessage({
            id,
            status: 'error',
            message: error.message || 'Failed to process image'
        });
    }
};