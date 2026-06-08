'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface ProcessedItem {
    id: string;
    fileName: string;
    status: 'queued' | 'loading' | 'processing' | 'completed' | 'error';
    message: string;
    progress: number;
    resultUrl: string | null;
    originalUrl: string | null;
    error?: string;
}

export interface EngineState {
    loading: boolean;
    progress: number;
    device: 'webgpu' | 'wasm' | null;
}

export function useBackgroundRemover() {
    const [queue, setQueue] = useState<ProcessedItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [engine, setEngine] = useState<EngineState>({ loading: false, progress: 0, device: null });

    const workerRef = useRef<Worker | null>(null);
    const filesMapRef = useRef<Map<string, File>>(new Map());
    const currentProcessingIdRef = useRef<string | null>(null);
    const queueRef = useRef<ProcessedItem[]>([]);
    const activeSourceUrlRef = useRef<string | null>(null);

    // Keep queueRef in sync
    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    // Engine message handler
    const handleEngineMessage = useCallback((data: any) => {
        if (data.type === 'engine') {
            setEngine({
                loading: data.status === 'downloading',
                progress: data.progress || 0,
                device: data.device || null,
            });
        }
    }, []);

    // Spawn worker once
    useEffect(() => {
        const worker = new Worker(
            new URL('../workers/image-ai.worker.ts', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = (e: MessageEvent) => {
            const data = e.data;

            if (data.type === 'engine') {
                handleEngineMessage(data);
                return;
            }

            // item messages
            const { status, id, bitmap, message, progress } = data;

            switch (status) {
                case 'loading':
                case 'processing':
                    setQueue((prev) =>
                        prev.map((item) =>
                            item.id === id
                                ? { ...item, status, message: message || 'Processing...', progress: progress || 0 }
                                : item
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

                                    const rawFile = filesMapRef.current.get(id);
                                    const origUrl = rawFile ? URL.createObjectURL(rawFile) : null;

                                    setQueue((prev) =>
                                        prev.map((item) => {
                                            if (item.id === id) {
                                                if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
                                                return {
                                                    ...item,
                                                    status: 'completed',
                                                    message: 'Success',
                                                    progress: 100,
                                                    resultUrl: url,
                                                    originalUrl: origUrl,
                                                };
                                            }
                                            return item;
                                        })
                                    );

                                    // Revoke the temporary source URL used for the worker
                                    if (activeSourceUrlRef.current) {
                                        URL.revokeObjectURL(activeSourceUrlRef.current);
                                        activeSourceUrlRef.current = null;
                                    }
                                    currentProcessingIdRef.current = null;
                                }
                            }, 'image/png');
                        }
                    }
                    break;

                case 'error':
                    setQueue((prev) =>
                        prev.map((item) =>
                            item.id === id
                                ? { ...item, status: 'error', message: 'Error encountered.', error: data.message }
                                : item
                        )
                    );
                    // Revoke source URL even on error
                    if (activeSourceUrlRef.current) {
                        URL.revokeObjectURL(activeSourceUrlRef.current);
                        activeSourceUrlRef.current = null;
                    }
                    currentProcessingIdRef.current = null;
                    break;
            }
        };

        workerRef.current = worker;

        return () => {
            worker.terminate();
            // Clean up any dangling source URL
            if (activeSourceUrlRef.current) {
                URL.revokeObjectURL(activeSourceUrlRef.current);
            }
        };
    }, [handleEngineMessage]);

    // Process next item when queue changes and no current item is being processed
    useEffect(() => {
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
                item.id === nextItem.id
                    ? { ...item, status: 'loading', message: 'Initialising...' }
                    : item
            )
        );

        const file = filesMapRef.current.get(nextItem.id);
        if (file) {
            const sourceUrl = URL.createObjectURL(file);
            activeSourceUrlRef.current = sourceUrl;
            workerRef.current.postMessage({ imageSrc: sourceUrl, id: nextItem.id });
        } else {
            currentProcessingIdRef.current = null;
            setIsProcessing(false);
        }
    }, [queue]);

    const removeBackground = useCallback((files: File | FileList | File[]) => {
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
                status: 'queued' as const,
                message: 'Waiting in queue...',
                progress: 0,
                resultUrl: null,
                originalUrl: null,
            };
        });

        setQueue((prev) => [...prev, ...newItems]);
    }, []);

    const updateItemResultUrl = useCallback((id: string, newUrl: string) => {
        setQueue((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
                    return { ...item, resultUrl: newUrl };
                }
                return item;
            })
        );
    }, []);

    const resetState = useCallback(() => {
        queue.forEach((item) => {
            if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
            if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        });
        if (activeSourceUrlRef.current) {
            URL.revokeObjectURL(activeSourceUrlRef.current);
            activeSourceUrlRef.current = null;
        }
        filesMapRef.current.clear();
        setQueue([]);
        setIsProcessing(false);
        currentProcessingIdRef.current = null;
    }, [queue]);

    const removeSingleFile = useCallback((id: string) => {
        setQueue((prev) => {
            const target = prev.find((item) => item.id === id);
            if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
            if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
            filesMapRef.current.delete(id);
            return prev.filter((item) => item.id !== id);
        });
    }, []);

    const downloadAllCompleted = useCallback(() => {
        const completed = queue.filter((item) => item.status === 'completed' && item.resultUrl);
        completed.forEach((item, index) => {
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = item.resultUrl!;
                a.download = `matte_${item.fileName.replace(/\.[^/.]+$/, '')}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }, index * 100);
        });
    }, [queue]);

    return {
        queue,
        removeBackground,
        isProcessing,
        resetState,
        removeSingleFile,
        updateItemResultUrl,
        engine,
        downloadAllCompleted,
    };
}