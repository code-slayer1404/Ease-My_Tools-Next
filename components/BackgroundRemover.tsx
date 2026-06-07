'use client';

import React, { ChangeEvent, DragEvent, useState, useRef, useEffect } from 'react';
import { useBackgroundRemover, ProcessedItem } from '../hooks/useBackgroundRemover';
import { Upload, Download, RefreshCw, Layers, CheckCircle2, AlertCircle, Loader2, Trash2, Sliders, Undo2, Redo2, Brush, Eraser, ArrowLeft } from 'lucide-react';

export default function BackgroundRemover() {
    const { queue, removeBackground, isProcessing, resetState, removeSingleFile, updateItemResultUrl } = useBackgroundRemover();

    // State to track which item is currently being focused for manual canvas editing
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            removeBackground(e.target.files);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            removeBackground(e.dataTransfer.files);
        }
    };

    const totalItems = queue.length;
    const completedItems = queue.filter((i) => i.status === 'completed').length;
    const macroProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Fall back to auto-selecting the only item if there's exactly one file uploaded
    const isSingleView = totalItems === 1;
    const activeItem = isSingleView
        ? queue[0]
        : queue.find((item) => item.id === selectedItemId);

    // Auto-clear selection state if the focused item gets removed from the workbench
    useEffect(() => {
        if (selectedItemId && !queue.some(item => item.id === selectedItemId)) {
            setSelectedItemId(null);
        }
    }, [queue, selectedItemId]);

    return (
        <div className="w-full max-w-7xl mx-auto p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200 selection:bg-indigo-500/30">

            {/* Upper Control Bar */}
            <div className="flex flex-wrap items-center justify-between mb-8 pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Neural Isolation Studio</h1>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hardware accelerated WebGPU client-side background eraser layer.</p>
                    </div>
                </div>

                {totalItems > 0 && (
                    <div className="flex items-center gap-3">
                        <label className="px-5 py-2.5 text-xs font-black tracking-wider uppercase text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10">
                            Upload More Files
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                        <button
                            onClick={() => {
                                resetState();
                                setSelectedItemId(null);
                            }}
                            className="px-5 py-2.5 text-xs font-black tracking-wider uppercase text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200/60 dark:border-rose-900/30"
                        >
                            Reset Workbench
                        </button>
                    </div>
                )}
            </div>

            {/* Dropzone Landing View */}
            {totalItems === 0 && (
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-12 text-center transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-sm min-h-[450px]"
                >
                    <input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-inner group-hover:scale-110 transition-transform mb-4 border border-slate-100 dark:border-slate-700">
                        <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Drop your production images here</h3>
                    <p className="text-sm text-slate-400 max-w-sm mt-2">Process a single high-definition photo or a massive batch simultaneously through localized execution layers.</p>
                </div>
            )}

            {totalItems > 0 && (
                <div className="space-y-6">

                    {/* Global Queue Progress Indicator */}
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                Pipeline Status: {completedItems} / {totalItems} Files Completed
                            </span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{macroProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${macroProgress}%` }} />
                        </div>
                    </div>

                    {/* Conditional Workspaces */}
                    {activeItem ? (
                        <div className="space-y-4">
                            {/* Navigation out of deep inspection workspace back to batch system */}
                            {!isSingleView && (
                                <button
                                    onClick={() => setSelectedItemId(null)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl shadow-sm transition-all group"
                                >
                                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                    Return to Batch Gallery
                                </button>
                            )}
                            <InteractiveCanvasEditor
                                item={activeItem}
                                onSaveMask={(newUrl) => updateItemResultUrl(activeItem.id, newUrl)}
                            />
                        </div>
                    ) : (
                        /* BATCH PRODUCTION GALLERY GRID VIEW */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {queue.map((item) => (
                                <div
                                    key={item.id}
                                    className={`relative border flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all shadow-sm ${item.status === 'loading' || item.status === 'processing' || item.status === 'downloading'
                                        ? 'border-indigo-500 ring-2 ring-indigo-600/10 shadow-md'
                                        : 'border-slate-200 dark:border-slate-800'
                                        }`}
                                >
                                    <div className="relative aspect-square w-full bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0] dark:bg-slate-950 flex items-center justify-center p-3 border-b border-slate-100 dark:border-slate-800/60">
                                        {item.status === 'completed' && item.resultUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.resultUrl} alt={item.fileName} className="max-h-full max-w-full object-scale-down rounded-lg shadow-sm" />
                                        ) : item.status === 'error' ? (
                                            <div className="flex flex-col items-center space-y-1 text-rose-500 p-4 text-center">
                                                <AlertCircle className="w-7 h-7" />
                                                <span className="text-xs font-black uppercase tracking-wider">Failed</span>
                                            </div>
                                        ) : item.status === 'queued' ? (
                                            <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-800">
                                                Queued
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-2 text-indigo-600 dark:text-indigo-400">
                                                <Loader2 className="w-7 h-7 animate-spin" />
                                                <span className="text-[10px] font-black tracking-widest uppercase animate-pulse">Processing...</span>
                                            </div>
                                        )}

                                        {(item.status === 'processing' || item.status === 'downloading' || item.status === 'loading') && (
                                            <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <span className="truncate max-w-[100px]">{item.message}</span>
                                                <span className="font-black text-indigo-600">{item.progress}%</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => removeSingleFile(item.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md border border-slate-200/60 transition-colors shadow-sm dark:bg-slate-900/80 dark:border-slate-800 dark:hover:bg-rose-950/40"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 gap-2 flex-1">
                                        <div className="truncate min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" title={item.fileName}>
                                                {item.fileName}
                                            </p>
                                            <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
                                                {item.status === 'completed' ? 'Isolated Matte' : item.status}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {item.status === 'completed' && (
                                                <button
                                                    onClick={() => setSelectedItemId(item.id)}
                                                    className="p-2 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/40 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all shadow-sm"
                                                    title="Refine Asset Matte"
                                                >
                                                    <Sliders className="w-3.5 h-3.5" />
                                                </button>
                                            )}

                                            {item.status === 'completed' && item.resultUrl && (
                                                <a
                                                    href={item.resultUrl}
                                                    download={`matte_${item.fileName.replace(/\.[^/.]+$/, "")}.png`}
                                                    className="p-2 bg-white hover:bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/40 dark:text-indigo-400 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all shadow-sm"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface EditorProps {
    item: ProcessedItem;
    onSaveMask: (newUrl: string) => void;
}

function InteractiveCanvasEditor({ item, onSaveMask }: EditorProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const initializedIdRef = useRef<string | null>(null);

    const [brushMode, setBrushMode] = useState<'remove' | 'restore'>('remove');
    const [brushSize, setBrushSize] = useState<number>(40);
    const [isDrawing, setIsDrawing] = useState(false);

    // Real-time Canvas Display coordinates to scale and track high-contrast brush bounds
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
    const [displayScaleFactor, setDisplayScaleFactor] = useState<number>(1);

    // Undo / Redo Memory Framework
    const [history, setHistory] = useState<ImageData[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const isLoaded = item.status === 'completed' && item.resultUrl && item.originalUrl;

    useEffect(() => {
        if (!isLoaded) return;

        // Safety Guard: Stop reactive component re-renders from wiping canvas/history arrays when selecting a new item
        if (initializedIdRef.current === item.id) return;

        const mainCanvas = canvasRef.current;
        const origCanvas = originalCanvasRef.current;
        if (!mainCanvas || !origCanvas) return;

        const ctx = mainCanvas.getContext('2d');
        const oCtx = origCanvas.getContext('2d');
        if (!ctx || !oCtx) return;

        const baseImg = new Image();
        const origImg = new Image();

        let assetsLoaded = 0;
        const onAssetLoad = () => {
            assetsLoaded++;
            if (assetsLoaded === 2) {
                mainCanvas.width = baseImg.naturalWidth;
                mainCanvas.height = baseImg.naturalHeight;
                origCanvas.width = baseImg.naturalWidth;
                origCanvas.height = baseImg.naturalHeight;

                ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
                ctx.drawImage(baseImg, 0, 0);

                oCtx.clearRect(0, 0, origCanvas.width, origCanvas.height);
                oCtx.drawImage(origImg, 0, 0);

                const initialFrame = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
                setHistory([initialFrame]);
                setHistoryIndex(0);
                initializedIdRef.current = item.id;

                recalculateDisplayScale();
            }
        };

        baseImg.crossOrigin = 'anonymous';
        origImg.crossOrigin = 'anonymous';
        baseImg.src = item.resultUrl!;
        origImg.src = item.originalUrl!;

        baseImg.onload = onAssetLoad;
        origImg.onload = onAssetLoad;
    }, [isLoaded, item.id, item.resultUrl, item.originalUrl]);

    // Recalculates canvas layout scaling variables dynamically for cursor tracking precision
    const recalculateDisplayScale = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            setDisplayScaleFactor(rect.width / canvas.width);
        }
    };

    useEffect(() => {
        window.addEventListener('resize', recalculateDisplayScale);
        return () => window.removeEventListener('resize', recalculateDisplayScale);
    }, []);

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursorPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        if (isDrawing) {
            draw(e);
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isLoaded || historyIndex === -1) return;
        setIsDrawing(true);
        draw(e);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const oCanvas = originalCanvasRef.current;
        if (!canvas || !ctx || !oCanvas) return;

        const coords = getCoordinates(e);
        if (!coords) return;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;

        if (brushMode === 'remove') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(oCanvas, 0, 0);
        }
        ctx.restore();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const nextFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const updatedHistory = history.slice(0, historyIndex + 1);

        setHistory([...updatedHistory, nextFrame]);
        setHistoryIndex(updatedHistory.length);

        canvas.toBlob((blob) => {
            if (blob) {
                const nextUrl = URL.createObjectURL(blob);
                onSaveMask(nextUrl);
            }
        }, 'image/png');
    };

    const undo = () => {
        if (historyIndex <= 0) return;
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        applyHistoryState(nextIdx);
    };

    const redo = () => {
        if (historyIndex >= history.length - 1) return;
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        applyHistoryState(nextIdx);
    };

    const applyHistoryState = (index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(history[index], 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                const revisedUrl = URL.createObjectURL(blob);
                onSaveMask(revisedUrl);
            }
        }, 'image/png');
    };

    const calculatedBrushDiameter = brushSize * displayScaleFactor;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Primary Canvas Container Area */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-xs font-bold tracking-wide text-slate-500 truncate max-w-md">{item.fileName}</span>
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                        {item.status}
                    </span>
                </div>

                <div className="relative aspect-video w-full bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] dark:bg-slate-950 min-h-[440px] flex items-center justify-center p-6 overflow-hidden select-none">

                    <div className="relative group/canvas" onMouseEnter={recalculateDisplayScale}>
                        {item.status === 'completed' ? (
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={handleMouseMove}
                                onMouseUp={stopDrawing}
                                onMouseLeave={() => { stopDrawing(); setCursorPos(null); }}
                                className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-md cursor-none"
                            />
                        ) : item.status === 'error' ? (
                            <div className="flex flex-col items-center space-y-2 text-rose-500 max-w-sm text-center">
                                <AlertCircle className="w-12 h-12" />
                                <p className="text-sm font-bold">Inference Error</p>
                                <p className="text-xs text-slate-400">{item.error}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">Progress: {item.progress}%</p>
                                </div>
                            </div>
                        )}

                        {/* Inverted high-contrast brush diameter indicator overlay */}
                        {cursorPos && item.status === 'completed' && (
                            <div
                                className="pointer-events-none absolute rounded-full border border-white mix-blend-difference shadow-[0_0_0_1px_rgba(0,0,0,0.6)] transition-shadow duration-75"
                                style={{
                                    width: `${calculatedBrushDiameter}px`,
                                    height: `${calculatedBrushDiameter}px`,
                                    left: `${cursorPos.x}px`,
                                    top: `${cursorPos.y}px`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            />
                        )}
                    </div>
                </div>
                <canvas ref={originalCanvasRef} className="hidden" />
            </div>

            {/* Manual Refinement Controls Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-4">
                        <Sliders className="w-4 h-4" /> Workspace Refinement Lab
                    </h3>

                    {/* Undo / Redo Control Strip */}
                    <div className="grid grid-cols-2 gap-2 mb-5">
                        <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-30 disabled:pointer-events-none text-xs font-black rounded-xl transition-all shadow-sm"
                        >
                            <Undo2 className="w-4 h-4" /> Undo Step
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-30 disabled:pointer-events-none text-xs font-black rounded-xl transition-all shadow-sm"
                        >
                            <Redo2 className="w-4 h-4" /> Redo Step
                        </button>
                    </div>

                    {/* Brush Operations Selection Group */}
                    <div className="flex flex-col gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl mb-5">
                        <button
                            onClick={() => setBrushMode('remove')}
                            className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 text-xs font-black tracking-wide uppercase rounded-xl transition-all ${brushMode === 'remove'
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-transparent'
                                }`}
                        >
                            <Eraser className="w-4 h-4" /> Eraser (Remove Layer)
                        </button>
                        <button
                            onClick={() => setBrushMode('restore')}
                            className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 text-xs font-black tracking-wide uppercase rounded-xl transition-all ${brushMode === 'restore'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-transparent'
                                }`}
                        >
                            <Brush className="w-4 h-4" /> Restore (Reveal Original)
                        </button>
                    </div>

                    {/* Dynamic Brush Size Selection Slider */}
                    <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                            <span className="text-slate-400 dark:text-slate-500">Brush Calibration</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{brushSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="2"
                            max="250"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-full accent-indigo-600 dark:accent-indigo-400 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer transition-colors"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                            <span>2px</span>
                            <span>125px</span>
                            <span>250px</span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                {item.status === 'completed' && item.resultUrl && (
                    <a
                        href={item.resultUrl}
                        download={`matte_${item.fileName.replace(/\.[^/.]+$/, "")}.png`}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-sm tracking-wide rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all text-center"
                    >
                        <Download className="w-4 h-4" /> Download Production Asset
                    </a>
                )}
            </div>
        </div>
    );
}