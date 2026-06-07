// export class BackgroundRemover {
//     private worker: Worker;
//     private onStatusChange: (status: string, message?: string, progress?: number) => void;
//     private onComplete: (transparentImgUrl: string) => void;
//     private currentOriginalUrl: string | null = null;

//     constructor(
//         onStatusChange: (status: string, message?: string, progress?: number) => void,
//         onComplete: (transparentImgUrl: string) => void
//     ) {
//         this.onStatusChange = onStatusChange;
//         this.onComplete = onComplete;

//         this.worker = new Worker(new URL('../workers/image-ai.worker.ts', import.meta.url), {
//             type: 'module',
//         });

//         this.worker.onmessage = (event) => this.handleWorkerMessage(event);
//     }

//     public process(imageSrc: string) {
//         this.currentOriginalUrl = imageSrc;
//         this.worker.postMessage({ imageSrc });
//     }

//     private handleWorkerMessage(event: MessageEvent) {
//         const { status, message, progress, maskData, width, height, error } = event.data;

//         if (status === 'loading' || status === 'processing') {
//             this.onStatusChange(status, message);
//             return;
//         }

//         if (status === 'downloading') {
//             this.onStatusChange('downloading', message, progress);
//             return;
//         }

//         if (status === 'error') {
//             this.onStatusChange('error', error);
//             return;
//         }

//         if (status === 'complete' && this.currentOriginalUrl) {
//             this.applyAlphaMask(this.currentOriginalUrl, maskData, width, height);
//         }
//     }

//     private applyAlphaMask(originalSrc: string, maskData: Uint8Array, width: number, height: number) {
//         const canvas = document.createElement('canvas');
//         canvas.width = width;
//         canvas.height = height;
//         const ctx = canvas.getContext('2d');

//         if (!ctx) {
//             this.onStatusChange('error', 'Failed to anchor canvas rendering pipelines.');
//             return;
//         }

//         const img = new Image();
//         img.crossOrigin = 'anonymous';
//         img.src = originalSrc;

//         img.onload = () => {
//             ctx.drawImage(img, 0, 0, width, height);
//             const imgData = ctx.getImageData(0, 0, width, height);

//             for (let i = 0; i < maskData.length; i++) {
//                 imgData.data[i * 4 + 3] = maskData[i];
//             }

//             ctx.putImageData(imgData, 0, 0);
//             const transparentDataUrl = canvas.toDataURL('image/png');

//             this.onStatusChange('ready');
//             this.onComplete(transparentDataUrl);
//         };

//         img.onerror = () => {
//             this.onStatusChange('error', 'Failed reading image properties on assembly.');
//         };
//     }

//     public terminate() {
//         this.worker.terminate();
//     }
// }


export class BackgroundRemover {
    private worker: Worker;
    private onStatusChange: (status: string, message?: string, progress?: number) => void;
    private onComplete: (transparentImgUrl: string) => void;
    private currentOriginalUrl: string | null = null;

    constructor(
        onStatusChange: (status: string, message?: string, progress?: number) => void,
        onComplete: (transparentImgUrl: string) => void
    ) {
        this.onStatusChange = onStatusChange;
        this.onComplete = onComplete;

        this.worker = new Worker(new URL('../workers/image-ai.worker.ts', import.meta.url), {
            type: 'module',
        });

        this.worker.onmessage = (event) => this.handleWorkerMessage(event);
    }

    public process(imageSrc: string) {
        this.currentOriginalUrl = imageSrc;
        this.worker.postMessage({ imageSrc });
    }

    private handleWorkerMessage(event: MessageEvent) {
        const { status, message, progress, maskData, width, height, error } = event.data;

        if (status === 'loading' || status === 'processing') {
            this.onStatusChange(status, message);
            return;
        }

        if (status === 'downloading') {
            this.onStatusChange('downloading', message, progress);
            return;
        }

        if (status === 'error') {
            this.onStatusChange('error', error);
            return;
        }

        if (status === 'complete' && this.currentOriginalUrl) {
            this.applyAlphaMaskWithFeathering(this.currentOriginalUrl, maskData, width, height);
        }
    }

    private applyAlphaMaskWithFeathering(originalSrc: string, maskData: Uint8Array, width: number, height: number) {
        // Main target composition canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Secondary isolated offscreen stencil mask canvas
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');

        if (!ctx || !maskCtx) {
            this.onStatusChange('error', 'Failed to anchor hardware graphics contexts.');
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = originalSrc;

        img.onload = () => {
            // 1. Build a black and white grayscale matte stencil on our secondary canvas
            const maskImgData = maskCtx.createImageData(width, height);
            for (let i = 0; i < maskData.length; i++) {
                const grayscaleVal = maskData[i];
                const idx = i * 4;
                maskImgData.data[idx] = grayscaleVal;       // Red channel stencil
                maskImgData.data[idx + 1] = grayscaleVal;   // Green channel stencil
                maskImgData.data[idx + 2] = grayscaleVal;   // Blue channel stencil
                maskImgData.data[idx + 3] = grayscaleVal;   // Alpha value intensity map
            }
            maskCtx.putImageData(maskImgData, 0, 0);

            // 2. Clear out any hanging noise and paint the original source asset down onto primary canvas
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // 3. Execute STEP 2: Smooth and feather edge structures using compositing
            // Destination-In keeps source pixels only where both images overlap.
            ctx.globalCompositeOperation = 'destination-in';

            // Apply a subtle hardware-accelerated blur to anti-alias the rough edge boundaries
            ctx.filter = 'blur(1.2px)';
            ctx.drawImage(maskCanvas, 0, 0);

            // Restore default canvas state configurations safely
            ctx.filter = 'none';
            ctx.globalCompositeOperation = 'source-over';

            // 4. Generate pure output clean image asset data URLs
            const transparentDataUrl = canvas.toDataURL('image/png');

            this.onStatusChange('ready');
            this.onComplete(transparentDataUrl);
        };

        img.onerror = () => {
            this.onStatusChange('error', 'Failed reading source parameters during stencil mask composition.');
        };
    }

    public terminate() {
        this.worker.terminate();
    }
}