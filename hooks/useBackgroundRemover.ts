'use client';

import { useState, useEffect, useRef } from 'react';

export interface ProcessedItem {
    id: string;
    fileName: string;
    status: 'queued' | 'loading' | 'downloading' | 'processing' | 'completed' | 'error';
    message: string;
    progress: number;
    resultUrl: string | null;
    originalUrl: string | null;
    error?: string;
}

export interface RemoverState {
    status: 'idle' | 'loading' | 'downloading' | 'processing' | 'completed' | 'error';
    message: string;
    progress: number;
}

export function useBackgroundRemover() {
    const [queue, setQueue] = useState<ProcessedItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const [state, setState] = useState<RemoverState>({ status: 'idle', message: '', progress: 0 });
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const workerRef = useRef<Worker | null>(null);
    const filesMapRef = useRef<Map<string, File>>(new Map());
    const currentProcessingIdRef = useRef<string | null>(null);
    const activeInputUrlRef = useRef<string | null>(null);
    const queueRef = useRef<ProcessedItem[]>([]);

    useEffect(() => {
        queueRef.current = queue;

        if (queue.length === 1) {
            const item = queue[0];
            setState({
                status: item.status === 'queued' ? 'loading' : (item.status as any),
                message: item.message,
                progress: item.progress
            });
            setResultUrl(item.resultUrl);
        }
    }, [queue]);

    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../workers/image-ai.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (e: MessageEvent) => {
            const { status, id, bitmap, error, message, progress } = e.data;

            switch (status) {
                case 'loading':
                case 'downloading':
                case 'processing':
                    setQueue((prev) =>
                        prev.map((item) =>
                            item.id === id ? { ...item, status, message: message || 'Processing...', progress: progress || 0 } : item
                        )
                    );
                    break;

                case 'complete':
                    if (bitmap) {
                        const hostCanvas = document.createElement('canvas');
                        hostCanvas.width = bitmap.width;
                        hostCanvas.height = bitmap.height;
                        const ctx = hostCanvas.getContext('2d');

                        if (ctx) {
                            ctx.drawImage(bitmap, 0, 0);
                            bitmap.close();

                            hostCanvas.toBlob((blob) => {
                                if (blob) {
                                    const url = URL.createObjectURL(blob);

                                    // Retain original source url context for localized manual brush overlays
                                    const rawFile = filesMapRef.current.get(id);
                                    const origUrl = rawFile ? URL.createObjectURL(rawFile) : null;

                                    setQueue((prev) =>
                                        prev.map((item) =>
                                            item.id === id
                                                ? { ...item, status: 'completed', message: 'Success', progress: 100, resultUrl: url, originalUrl: origUrl }
                                                : item
                                        )
                                    );
                                    currentProcessingIdRef.current = null;
                                    setTimeout(() => processNextQueueItem(), 0);
                                }
                            }, 'image/png');
                        }
                    }
                    break;

                case 'error':
                    setQueue((prev) =>
                        prev.map((item) =>
                            item.id === id
                                ? { ...item, status: 'error', message: 'Error encountered.', error: error || 'Pipeline failed.' }
                                : item
                        )
                    );
                    currentProcessingIdRef.current = null;
                    setTimeout(() => processNextQueueItem(), 0);
                    break;
            }
        };

        return () => {
            if (workerRef.current) workerRef.current.terminate();
        };
    }, []);

    const processNextQueueItem = () => {
        if (!workerRef.current || currentProcessingIdRef.current) return;

        const nextItem = queueRef.current.find((item) => item.status === 'queued');
        if (!nextItem) {
            setIsProcessing(false);
            return;
        }

        setIsProcessing(true);
        currentProcessingIdRef.current = nextItem.id;

        setQueue((prev) =>
            prev.map((item) =>
                item.id === nextItem.id ? { ...item, status: 'loading', message: 'Spawning pipelines...' } : item
            )
        );

        const file = filesMapRef.current.get(nextItem.id);
        if (file) {
            const sourceUrl = URL.createObjectURL(file);
            activeInputUrlRef.current = sourceUrl;
            workerRef.current.postMessage({ imageSrc: sourceUrl, id: nextItem.id });
        } else {
            currentProcessingIdRef.current = null;
            setIsProcessing(false);
        }
    };

    const removeBackground = (files: File | FileList | File[]) => {
        let fileArray: File[] = [];
        if (files instanceof File) {
            fileArray = [files];
        } else {
            fileArray = Array.isArray(files) ? files : Array.from(files);
        }

        const newItems: ProcessedItem[] = fileArray.map((file) => {
            const id = Math.random().toString(36).substring(2, 11);
            filesMapRef.current.set(id, file);

            return {
                id,
                fileName: file.name,
                status: 'queued',
                message: 'Waiting in queue...',
                progress: 0,
                resultUrl: null,
                originalUrl: null,
            };
        });

        setQueue((prev) => [...prev, ...newItems]);
    };

    useEffect(() => {
        if (!isProcessing) {
            processNextQueueItem();
        }
    }, [queue, isProcessing]);

    const updateItemResultUrl = (id: string, newUrl: string) => {
        setQueue((prev) =>
            prev.map((item) => (item.id === id ? { ...item, resultUrl: newUrl } : item))
        );
    };

    const resetState = () => {
        queue.forEach((item) => {
            if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
            if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        });
        filesMapRef.current.clear();
        setQueue([]);
        setIsProcessing(false);
        currentProcessingIdRef.current = null;
        setState({ status: 'idle', message: '', progress: 0 });
        setResultUrl(null);
    };

    const removeSingleFile = (id: string) => {
        setQueue((prev) => {
            const target = prev.find((item) => item.id === id);
            if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
            if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
            filesMapRef.current.delete(id);
            const filtered = prev.filter((item) => item.id !== id);
            if (filtered.length === 0) {
                setState({ status: 'idle', message: '', progress: 0 });
                setResultUrl(null);
            }
            return filtered;
        });
    };

    return { queue, removeBackground, isProcessing, resetState, removeSingleFile, state, resultUrl, updateItemResultUrl };
}