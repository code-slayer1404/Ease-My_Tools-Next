// import { useState, useEffect, useRef } from 'react';
// import { BackgroundRemover } from '../utils/BackgroundRemover';

// export interface ProcessingState {
//     status: 'idle' | 'loading' | 'downloading' | 'processing' | 'completed' | 'error';
//     message: string;
//     progress: number;
// }

// export const useBackgroundRemover = () => {
//     const [state, setState] = useState<ProcessingState>({
//         status: 'idle',
//         message: '',
//         progress: 0,
//     });
//     const [resultUrl, setResultUrl] = useState<string | null>(null);

//     // Storing the BackgroundRemover class instance in a persistent reference container
//     // to ensure it survives React state re-renders without recreation.
//     const engineRef = useRef<BackgroundRemover | null>(null);

//     useEffect(() => {
//         engineRef.current = new BackgroundRemover(
//             (status, message, progress) => {
//                 setState((prev) => {
//                     let uiStatus = status as ProcessingState['status'];
//                     let progressValue = prev.progress;

//                     if (status === 'loading') {
//                         progressValue = 5;
//                     } else if (status === 'downloading') {
//                         progressValue = progress ? Math.round(progress) : prev.progress;
//                     } else if (status === 'processing') {
//                         progressValue = 90;
//                     } else if (status === 'ready') {
//                         uiStatus = 'completed';
//                         progressValue = 100;
//                     } else if (status === 'error') {
//                         progressValue = 0;
//                     }

//                     return {
//                         status: uiStatus,
//                         message: message || '',
//                         progress: progressValue,
//                     };
//                 });
//             },
//             (transparentImgUrl) => {
//                 setResultUrl(transparentImgUrl);
//             }
//         );

//         return () => {
//             engineRef.current?.terminate();
//         };
//     }, []);

//     const removeBackground = (imageFile: File) => {
//         setState({ status: 'loading', message: 'Analyzing local file buffers...', progress: 0 });
//         setResultUrl(null);

//         const reader = new FileReader();
//         reader.onload = () => {
//             if (typeof reader.result === 'string') {
//                 engineRef.current?.process(reader.result);
//             }
//         };
//         reader.readAsDataURL(imageFile);
//     };

//     const resetState = () => {
//         setState({ status: 'idle', message: '', progress: 0 });
//         setResultUrl(null);
//     };

//     return {
//         removeBackground,
//         resetState,
//         state,
//         resultUrl,
//     };
// };


'use client';

import { useState, useEffect, useRef } from 'react';

export interface RemoverState {
    status: 'idle' | 'loading' | 'downloading' | 'processing' | 'completed' | 'error';
    message: string;
    progress: number;
}

export function useBackgroundRemover() {
    const [state, setState] = useState<RemoverState>({
        status: 'idle',
        message: '',
        progress: 0,
    });
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Spin up the background thread configuration
        workerRef.current = new Worker(
            new URL('../workers/image-ai.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (e: MessageEvent) => {
            const { status, message, progress, bitmap, error } = e.data;

            switch (status) {
                case 'downloading':
                case 'loading':
                case 'processing':
                    setState({
                        status: status,
                        message: message || 'Analyzing data layers...',
                        progress: progress || 0,
                    });
                    break;

                case 'complete':
                    if (bitmap) {
                        // Receive the zero-copy bitmap directly from the worker with zero loop calculations
                        const hostCanvas = document.createElement('canvas');
                        hostCanvas.width = bitmap.width;
                        hostCanvas.height = bitmap.height;
                        const ctx = hostCanvas.getContext('2d');

                        if (ctx) {
                            ctx.drawImage(bitmap, 0, 0);
                            bitmap.close(); // Purge resources immediately to prevent memory leaks

                            hostCanvas.toBlob((blob) => {
                                if (blob) {
                                    const url = URL.createObjectURL(blob);
                                    setResultUrl(url);
                                    setState({
                                        status: 'completed', // Map 'complete' seamlessly to the UI component state expectation
                                        message: 'Matte isolation completed smoothly.',
                                        progress: 100,
                                    });
                                }
                            }, 'image/png');
                        }
                    }
                    break;

                case 'error':
                    setState({
                        status: 'error',
                        message: error || 'Execution pipeline error.',
                        progress: 0,
                    });
                    break;
            }
        };

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const removeBackground = (file: File) => {
        if (!workerRef.current) return;

        setState({
            status: 'loading',
            message: 'Initializing neural background processing runtime...',
            progress: 5,
        });

        // Create a local blob URL for the worker to load efficiently
        const sourceUrl = URL.createObjectURL(file);

        workerRef.current.postMessage({
            imageSrc: sourceUrl
        });
    };

    const resetState = () => {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(null);
        setState({ status: 'idle', message: '', progress: 0 });
    };

    return { removeBackground, resetState, state, resultUrl };
}