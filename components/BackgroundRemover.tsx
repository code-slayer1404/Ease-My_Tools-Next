// 'use client';

// import React, { useState, ChangeEvent, DragEvent } from 'react';
// import { useBackgroundRemover } from '../hooks/useBackgroundRemover';
// import { Upload, Download, RefreshCw, Layers, Sparkles, Image as ImageIcon } from 'lucide-react';

// export default function BackgroundRemover() {
//     const [originalUrl, setOriginalUrl] = useState<string | null>(null);
//     const { removeBackground, resetState, state, resultUrl } = useBackgroundRemover();

//     const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             processFile(e.target.files[0]);
//         }
//     };

//     const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
//         e.preventDefault();
//     };

//     const handleDrop = (e: DragEvent<HTMLDivElement>) => {
//         e.preventDefault();
//         if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//             processFile(e.dataTransfer.files[0]);
//         }
//     };

//     const processFile = (file: File) => {
//         const localUrl = URL.createObjectURL(file);
//         setOriginalUrl(localUrl);
//         removeBackground(file);
//     };

//     const triggerDownload = () => {
//         if (!resultUrl) return;
//         const link = document.createElement('a');
//         link.href = resultUrl;
//         link.download = 'no_bg_output.png';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     const handleReset = () => {
//         if (originalUrl) URL.revokeObjectURL(originalUrl);
//         setOriginalUrl(null);
//         resetState();
//     };

//     return (
//         <div className="w-full max-w-5xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
//             {/* Panel Header */}
//             <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
//                 <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
//                     <Layers className="w-6 h-6" />
//                 </div>
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
//                         AI Background Remover <span className="text-xs px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium">Hardware Accelerated</span>
//                     </h2>
//                     <p className="text-sm text-slate-500 dark:text-slate-400">
//                         Isolate target subjects safely with permanent local caching features.
//                     </p>
//                 </div>
//             </div>

//             {/* Main Workspace Dashboard */}
//             {state.status === 'idle' && !originalUrl ? (
//                 <div
//                     onDragOver={handleDragOver}
//                     onDrop={handleDrop}
//                     className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-12 text-center transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 min-h-[350px]"
//                 >
//                     <input
//                         type="file"
//                         accept="image/*"
//                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                         onChange={handleFileChange}
//                     />
//                     <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-md group-hover:scale-110 transition-transform mb-4">
//                         <Upload className="w-8 h-8 text-indigo-500" />
//                     </div>
//                     <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
//                         Drag and drop target asset here
//                     </h3>
//                     <p className="text-sm text-slate-400 mt-1">Supports standard image files up to 10MB</p>
//                     <button className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors">
//                         Browse System Directory
//                     </button>
//                 </div>
//             ) : (
//                 <div className="space-y-8">
//                     {/* Progress Tracker Card */}
//                     {(state.status === 'loading' || state.status === 'downloading' || state.status === 'processing') && (
//                         <div className="p-6 bg-indigo-50/50 dark:bg-slate-800/50 rounded-xl border border-indigo-100/50 dark:border-slate-700">
//                             <div className="flex items-center justify-between mb-3">
//                                 <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
//                                     <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
//                                     {state.message}
//                                 </span>
//                                 <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{state.progress}%</span>
//                             </div>
//                             <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
//                                 <div
//                                     className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300"
//                                     style={{ width: `${state.progress}%` }}
//                                 />
//                             </div>
//                         </div>
//                     )}

//                     {/* Error View Frame */}
//                     {state.status === 'error' && (
//                         <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-center">
//                             <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-4">{state.message}</p>
//                             <button
//                                 onClick={handleReset}
//                                 className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors"
//                             >
//                                 Reinitialize Workspace
//                             </button>
//                         </div>
//                     )}

//                     {/* Comparison Monitor Display */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="flex flex-col space-y-2">
//                             <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
//                                 <ImageIcon className="w-3.5 h-3.5" /> Source Workspace
//                             </span>
//                             <div className="relative border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[450px]">
//                                 {originalUrl && (
//                                     // eslint-disable-next-line @next/next/no-img-element
//                                     <img src={originalUrl} alt="Source original preview" className="object-contain max-h-[450px] w-full" />
//                                 )}
//                             </div>
//                         </div>

//                         <div className="flex flex-col space-y-2">
//                             <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
//                                 <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Isolated Foreground Alpha
//                             </span>
//                             <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[450px] bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] dark:bg-slate-950">
//                                 {resultUrl ? (
//                                     // eslint-disable-next-line @next/next/no-img-element
//                                     <img src={resultUrl} alt="Processed target output preview" className="object-contain max-h-[450px] w-full drop-shadow-lg" />
//                                 ) : state.status !== 'completed' && originalUrl ? (
//                                     <div className="flex flex-col items-center text-slate-400 p-4">
//                                         <RefreshCw className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
//                                         <span className="text-sm font-medium">Extracting foreground boundaries...</span>
//                                     </div>
//                                 ) : null}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Bottom Execution Bar Control */}
//                     {state.status === 'completed' && (
//                         <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
//                             <button
//                                 onClick={handleReset}
//                                 className="flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl transition-colors"
//                             >
//                                 <RefreshCw className="w-4 h-4" />
//                                 <span>Process Another Image</span>
//                             </button>

//                             <button
//                                 onClick={triggerDownload}
//                                 className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
//                             >
//                                 <Download className="w-4 h-4" />
//                                 <span>Export Transparent PNG</span>
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }










// works. has erase and restore features working

// 'use client';

// import React, { useState, ChangeEvent, DragEvent, useRef, useEffect } from 'react';
// import { useBackgroundRemover } from '../hooks/useBackgroundRemover';
// import { Upload, Download, RefreshCw, Layers, Sparkles, Image as ImageIcon, Eraser, Paintbrush } from 'lucide-react';

// export default function BackgroundRemover() {
//     const [originalUrl, setOriginalUrl] = useState<string | null>(null);
//     const { removeBackground, resetState, state, resultUrl } = useBackgroundRemover();

//     // Manual touch-up brush configurations
//     const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
//     const [brushSize, setBrushSize] = useState<number>(30);
//     const [isDrawing, setIsDrawing] = useState<boolean>(false);

//     // Structural Workspace Canvas Anchors
//     const canvasRef = useRef<HTMLCanvasElement | null>(null);
//     const brushPatternRef = useRef<CanvasPattern | null>(null); // High-performance native pixel map
//     const resultImageRef = useRef<HTMLImageElement | null>(null);
//     const workspaceContainerRef = useRef<HTMLDivElement | null>(null);
//     const customCursorRef = useRef<HTMLDivElement | null>(null);

//     // High-frequency performance cache refs (Prevents Layout Thrashing)
//     const workspaceRectRef = useRef<DOMRect | null>(null);
//     const canvasRectRef = useRef<DOMRect | null>(null);
//     const lastCoords = useRef<{ x: number; y: number } | null>(null);
//     const scaleRatioRef = useRef<number>(1);

//     useEffect(() => {
//         if (resultUrl && canvasRef.current && resultImageRef.current) {
//             const canvas = canvasRef.current;
//             const ctx = canvas.getContext('2d');
//             const img = resultImageRef.current;

//             const setupWorkspaceMatrices = () => {
//                 // Step 1: Align viewport canvas with original asset dimensions
//                 canvas.width = img.naturalWidth;
//                 canvas.height = img.naturalHeight;

//                 if (ctx) {
//                     ctx.clearRect(0, 0, canvas.width, canvas.height);
//                     ctx.drawImage(img, 0, 0);
//                 }

//                 // Step 2: Bake original pixels into a native GPU pattern layer
//                 if (originalUrl) {
//                     const originalImg = new Image();
//                     originalImg.crossOrigin = 'anonymous';
//                     originalImg.src = originalUrl;
//                     originalImg.onload = () => {
//                         const backingCanvas = document.createElement('canvas');
//                         backingCanvas.width = canvas.width;
//                         backingCanvas.height = canvas.height;
//                         const backingCtx = backingCanvas.getContext('2d');

//                         if (backingCtx && ctx) {
//                             backingCtx.drawImage(originalImg, 0, 0, backingCanvas.width, backingCanvas.height);
//                             // Create full-frame pattern aligned 1:1 with primary workspace
//                             const pattern = ctx.createPattern(backingCanvas, 'no-repeat');
//                             brushPatternRef.current = pattern;
//                         }
//                         recacheWorkspaceDimensions();
//                     };
//                 }
//             };

//             img.onload = setupWorkspaceMatrices;
//             if (img.complete) setupWorkspaceMatrices();
//         }
//     }, [resultUrl, originalUrl]);

//     // Caches viewport scales to keep calculations entirely inside memory
//     const recacheWorkspaceDimensions = () => {
//         if (workspaceContainerRef.current) {
//             workspaceRectRef.current = workspaceContainerRef.current.getBoundingClientRect();
//         }
//         if (canvasRef.current) {
//             canvasRectRef.current = canvasRef.current.getBoundingClientRect();
//             scaleRatioRef.current = canvasRectRef.current.width / canvasRef.current.width;
//         }
//         updateCursorDimensions();
//     };

//     useEffect(() => {
//         window.addEventListener('resize', recacheWorkspaceDimensions);
//         return () => window.removeEventListener('resize', recacheWorkspaceDimensions);
//     }, [brushSize, state.status]);

//     const updateCursorDimensions = () => {
//         if (customCursorRef.current) {
//             const visualDiameter = brushSize * scaleRatioRef.current;
//             customCursorRef.current.style.width = `${visualDiameter}px`;
//             customCursorRef.current.style.height = `${visualDiameter}px`;
//         }
//     };

//     const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             processFile(e.target.files[0]);
//         }
//     };

//     const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
//         e.preventDefault();
//     };

//     const handleDrop = (e: DragEvent<HTMLDivElement>) => {
//         e.preventDefault();
//         if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//             processFile(e.dataTransfer.files[0]);
//         }
//     };

//     const processFile = (file: File) => {
//         const localUrl = URL.createObjectURL(file);
//         setOriginalUrl(localUrl);
//         removeBackground(file);
//     };

//     // Uses memory-cached dimensions instead of triggering browser style layout calculations
//     const getCanvasCoordinates = (clientX: number, clientY: number) => {
//         if (!canvasRef.current || !canvasRectRef.current) return null;
//         const canvas = canvasRef.current;
//         const rect = canvasRectRef.current;

//         const x = (clientX - rect.left) * (canvas.width / rect.width);
//         const y = (clientY - rect.top) * (canvas.height / rect.height);

//         return { x, y };
//     };

//     const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//         if (!workspaceRectRef.current || !canvasRectRef.current || !customCursorRef.current) return;

//         const containerRect = workspaceRectRef.current;
//         const canvasRect = canvasRectRef.current;

//         if (
//             e.clientX >= canvasRect.left &&
//             e.clientX <= canvasRect.right &&
//             e.clientY >= canvasRect.top &&
//             e.clientY <= canvasRect.bottom
//         ) {
//             customCursorRef.current.style.opacity = '1';
//             const posX = e.clientX - containerRect.left;
//             const posY = e.clientY - containerRect.top;

//             customCursorRef.current.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
//         } else {
//             customCursorRef.current.style.opacity = '0';
//         }

//         if (isDrawing) draw(e);
//     };

//     const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
//         if (state.status !== 'completed') return;
//         recacheWorkspaceDimensions(); // Lock positions down on user input down-press
//         const coords = getCanvasCoordinates(e.clientX, e.clientY);
//         if (!coords) return;
//         setIsDrawing(true);
//         lastCoords.current = coords;
//         executeStrokeSegment(coords, coords);
//     };

//     const draw = (e: React.MouseEvent<HTMLDivElement>) => {
//         if (!isDrawing || !lastCoords.current) return;
//         const currentCoords = getCanvasCoordinates(e.clientX, e.clientY);
//         if (!currentCoords) return;

//         executeStrokeSegment(lastCoords.current, currentCoords);
//         lastCoords.current = currentCoords;
//     };

//     const executeStrokeSegment = (from: { x: number; y: number }, to: { x: number; y: number }) => {
//         if (!canvasRef.current) return;
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext('2d');
//         if (!ctx) return;

//         ctx.save();
//         ctx.lineCap = 'round';
//         ctx.lineJoin = 'round';
//         ctx.lineWidth = brushSize;

//         if (brushMode === 'erase') {
//             ctx.globalCompositeOperation = 'destination-out';
//             ctx.strokeStyle = 'rgba(0,0,0,1)';
//         } else {
//             if (!brushPatternRef.current) {
//                 ctx.restore();
//                 return;
//             }
//             // Source-over stamps our background pattern seamlessly over empty transparency gaps
//             ctx.globalCompositeOperation = 'source-over';
//             ctx.strokeStyle = brushPatternRef.current;
//         }

//         ctx.beginPath();
//         ctx.moveTo(from.x, from.y);
//         ctx.lineTo(to.x, to.y);
//         ctx.stroke();
//         ctx.restore();
//     };

//     const stopDrawing = () => {
//         setIsDrawing(false);
//         lastCoords.current = null;
//     };

//     const triggerDownload = () => {
//         if (!canvasRef.current) return;
//         const exportUrl = canvasRef.current.toDataURL('image/png');
//         const link = document.createElement('a');
//         link.href = exportUrl;
//         link.download = 'refined_no_bg.png';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     const handleReset = () => {
//         if (originalUrl) URL.revokeObjectURL(originalUrl);
//         setOriginalUrl(null);
//         brushPatternRef.current = null;
//         workspaceRectRef.current = null;
//         canvasRectRef.current = null;
//         resetState();
//     };

//     return (
//         <div className="w-full max-w-6xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">

//             {/* Hidden processing reference layer */}
//             {resultUrl && (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img ref={resultImageRef} src={resultUrl} alt="hidden-res" className="hidden" crossOrigin="anonymous" />
//             )}

//             {/* Main Panel Layout Header */}
//             <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
//                 <div className="flex items-center space-x-3">
//                     <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
//                         <Layers className="w-6 h-6" />
//                     </div>
//                     <div>
//                         <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Studio Workspace</h2>
//                         <p className="text-sm text-slate-500 dark:text-slate-400">Hardware accelerated canvas-pattern recovery brush.</p>
//                     </div>
//                 </div>
//             </div>

//             {state.status === 'idle' && !originalUrl ? (
//                 <div
//                     onDragOver={handleDragOver}
//                     onDrop={handleDrop}
//                     className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-12 text-center transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 min-h-[350px]"
//                 >
//                     <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
//                     <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-md group-hover:scale-110 transition-transform mb-4">
//                         <Upload className="w-8 h-8 text-indigo-500" />
//                     </div>
//                     <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Drag and drop assets here</h3>
//                     <p className="text-sm text-slate-400 mt-1">Supports images up to 10MB</p>
//                     <button className="mt-6 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl">Browse Directory</button>
//                 </div>
//             ) : (
//                 <div className="space-y-6">
//                     {/* Tracking Bar Loader */}
//                     {(state.status === 'loading' || state.status === 'downloading' || state.status === 'processing') && (
//                         <div className="p-6 bg-indigo-50/50 dark:bg-slate-800/50 rounded-xl border border-indigo-100/50 dark:border-slate-700">
//                             <div className="flex items-center justify-between mb-3">
//                                 <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
//                                     <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
//                                     {state.message}
//                                 </span>
//                                 <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{state.progress}%</span>
//                             </div>
//                             <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
//                                 <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300" style={{ width: `${state.progress}%` }} />
//                             </div>
//                         </div>
//                     )}

//                     {/* Configuration Tool Deck */}
//                     {state.status === 'completed' && (
//                         <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 gap-6 select-none">
//                             <div className="flex items-center space-x-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => setBrushMode('erase')}
//                                     className={`flex items-center space-x-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${brushMode === 'erase'
//                                             ? 'bg-rose-500 text-white shadow-md ring-4 ring-rose-500/20 scale-105'
//                                             : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
//                                         }`}
//                                 >
//                                     <Eraser className="w-4 h-4" />
//                                     <span>Eraser Mode</span>
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => setBrushMode('restore')}
//                                     className={`flex items-center space-x-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${brushMode === 'restore'
//                                             ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-600/20 scale-105'
//                                             : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
//                                         }`}
//                                 >
//                                     <Paintbrush className="w-4 h-4" />
//                                     <span>Restore Brush</span>
//                                 </button>
//                             </div>

//                             <div className="flex items-center space-x-4 flex-1 max-w-xs">
//                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
//                                     Size: {brushSize}px
//                                 </span>
//                                 <input
//                                     type="range"
//                                     min="6"
//                                     max="100"
//                                     value={brushSize}
//                                     onChange={(e) => {
//                                         setBrushSize(Number(e.target.value));
//                                         setTimeout(updateCursorDimensions, 0);
//                                     }}
//                                     className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
//                                 />
//                             </div>
//                         </div>
//                     )}

//                     {/* Dual Aspect Screen Interfaces */}
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         <div className="flex flex-col space-y-2">
//                             <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
//                                 <ImageIcon className="w-3.5 h-3.5" /> Source Baseline
//                             </span>
//                             <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[350px] max-h-[500px]">
//                                 {originalUrl && (
//                                     // eslint-disable-next-line @next/next/no-img-element
//                                     <img src={originalUrl} alt="Source master" className="max-h-[480px] w-auto h-auto object-scale-down rounded shadow-sm" />
//                                 )}
//                             </div>
//                         </div>

//                         <div className="flex flex-col space-y-2">
//                             <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
//                                 <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Live Matte Terminal
//                             </span>

//                             <div
//                                 ref={workspaceContainerRef}
//                                 onMouseEnter={recacheWorkspaceDimensions}
//                                 onMouseMove={handleMouseMove}
//                                 onMouseUp={stopDrawing}
//                                 onMouseLeave={() => {
//                                     if (customCursorRef.current) customCursorRef.current.style.opacity = '0';
//                                     stopDrawing();
//                                 }}
//                                 className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[350px] max-h-[500px] bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] dark:bg-slate-950"
//                             >
//                                 {/* 144Hz Hardware-Accelerated Dynamic Brush Ring */}
//                                 <div
//                                     ref={customCursorRef}
//                                     className={`absolute pointer-events-none rounded-full border-2 border-solid shadow-xl opacity-0 z-50 will-change-transform ${brushMode === 'erase'
//                                             ? 'border-rose-500 bg-rose-500/10'
//                                             : 'border-emerald-500 bg-emerald-500/15'
//                                         }`}
//                                     style={{ left: 0, top: 0 }}
//                                 />

//                                 {/* Primary workspace canvas viewport */}
//                                 <canvas
//                                     ref={canvasRef}
//                                     onMouseDown={startDrawing}
//                                     className={`max-h-[480px] w-auto h-auto object-scale-down rounded select-none ${state.status === 'completed' ? 'cursor-none' : 'hidden'
//                                         }`}
//                                 />

//                                 {state.status !== 'completed' && originalUrl && (
//                                     <div className="flex flex-col items-center text-slate-400 p-4 absolute pointer-events-none">
//                                         <RefreshCw className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
//                                         <span className="text-sm font-medium">Isolating target structures...</span>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Action Footer Bar */}
//                     {state.status === 'completed' && (
//                         <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
//                             <button
//                                 onClick={handleReset}
//                                 className="flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl transition-colors"
//                             >
//                                 <RefreshCw className="w-4 h-4" />
//                                 <span>Process New Asset</span>
//                             </button>

//                             <button
//                                 onClick={triggerDownload}
//                                 className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
//                             >
//                                 <Download className="w-4 h-4" />
//                                 <span>Export Polished PNG</span>
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }






'use client';

import React, { useState, ChangeEvent, DragEvent, useRef, useEffect } from 'react';
import { useBackgroundRemover } from '../hooks/useBackgroundRemover';
import { Upload, Download, RefreshCw, Layers, Sparkles, Image as ImageIcon, Eraser, Paintbrush, Undo2, Redo2 } from 'lucide-react';

export default function BackgroundRemover() {
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const { removeBackground, resetState, state, resultUrl } = useBackgroundRemover();

    // Manual touch-up brush configurations
    const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
    const [brushSize, setBrushSize] = useState<number>(30);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);

    // Undo / Redo History States
    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);

    // Structural Workspace Canvas Anchors
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const brushPatternRef = useRef<CanvasPattern | null>(null);
    const resultImageRef = useRef<HTMLImageElement | null>(null);
    const workspaceContainerRef = useRef<HTMLDivElement | null>(null);
    const customCursorRef = useRef<HTMLDivElement | null>(null);

    // History Management Memory Ref Stacks
    const historyStackRef = useRef<ImageData[]>([]);
    const historyIndexRef = useRef<number>(-1);

    // High-frequency performance cache refs (Prevents Layout Thrashing)
    const workspaceRectRef = useRef<DOMRect | null>(null);
    const canvasRectRef = useRef<DOMRect | null>(null);
    const lastCoords = useRef<{ x: number; y: number } | null>(null);
    const scaleRatioRef = useRef<number>(1);

    useEffect(() => {
        if (resultUrl && canvasRef.current && resultImageRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = resultImageRef.current;

            const setupWorkspaceMatrices = () => {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);

                    // Initialize history tracking with the raw AI isolation output
                    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    historyStackRef.current = [initialData];
                    historyIndexRef.current = 0;
                    updateHistoryControls();
                }

                if (originalUrl) {
                    const originalImg = new Image();
                    originalImg.crossOrigin = 'anonymous';
                    originalImg.src = originalUrl;
                    originalImg.onload = () => {
                        const backingCanvas = document.createElement('canvas');
                        backingCanvas.width = canvas.width;
                        backingCanvas.height = canvas.height;
                        const backingCtx = backingCanvas.getContext('2d');

                        if (backingCtx && ctx) {
                            backingCtx.drawImage(originalImg, 0, 0, backingCanvas.width, backingCanvas.height);
                            const pattern = ctx.createPattern(backingCanvas, 'no-repeat');
                            brushPatternRef.current = pattern;
                        }
                        recacheWorkspaceDimensions();
                    };
                }
            };

            img.onload = setupWorkspaceMatrices;
            if (img.complete) setupWorkspaceMatrices();
        }
    }, [resultUrl, originalUrl]);

    const recacheWorkspaceDimensions = () => {
        if (workspaceContainerRef.current) {
            workspaceRectRef.current = workspaceContainerRef.current.getBoundingClientRect();
        }
        if (canvasRef.current) {
            canvasRectRef.current = canvasRef.current.getBoundingClientRect();
            scaleRatioRef.current = canvasRectRef.current.width / canvasRef.current.width;
        }
        updateCursorDimensions();
    };

    useEffect(() => {
        window.addEventListener('resize', recacheWorkspaceDimensions);
        return () => window.removeEventListener('resize', recacheWorkspaceDimensions);
    }, [brushSize, state.status]);

    const updateCursorDimensions = () => {
        if (customCursorRef.current) {
            const visualDiameter = brushSize * scaleRatioRef.current;
            customCursorRef.current.style.width = `${visualDiameter}px`;
            customCursorRef.current.style.height = `${visualDiameter}px`;
        }
    };

    // History Management Pipelines
    const saveHistoryState = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Chop off any redo states if user draws a new line after undoing
        const workingStack = historyStackRef.current.slice(0, historyIndexRef.current + 1);
        const newState = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Cap memory history stack at 30 entries to prevent tab crashes
        if (workingStack.length >= 30) {
            workingStack.shift();
        } else {
            historyIndexRef.current += 1;
        }

        workingStack.push(newState);
        historyStackRef.current = workingStack;
        updateHistoryControls();
    };

    const executeUndo = () => {
        if (historyIndexRef.current <= 0 || !canvasRef.current) return;
        historyIndexRef.current -= 1;
        applyHistoryStateAtIndex();
    };

    const executeRedo = () => {
        if (historyIndexRef.current >= historyStackRef.current.length - 1 || !canvasRef.current) return;
        historyIndexRef.current += 1;
        applyHistoryStateAtIndex();
    };

    const applyHistoryStateAtIndex = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const targetState = historyStackRef.current[historyIndexRef.current];
        if (ctx && targetState) {
            ctx.putImageData(targetState, 0, 0);
            updateHistoryControls();
        }
    };

    const updateHistoryControls = () => {
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(historyIndexRef.current < historyStackRef.current.length - 1);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const processFile = (file: File) => {
        const localUrl = URL.createObjectURL(file);
        setOriginalUrl(localUrl);
        removeBackground(file);
    };

    const getCanvasCoordinates = (clientX: number, clientY: number) => {
        if (!canvasRef.current || !canvasRectRef.current) return null;
        const canvas = canvasRef.current;
        const rect = canvasRectRef.current;

        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        return { x, y };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!workspaceRectRef.current || !canvasRectRef.current || !customCursorRef.current) return;

        const containerRect = workspaceRectRef.current;
        const canvasRect = canvasRectRef.current;

        if (
            e.clientX >= canvasRect.left &&
            e.clientX <= canvasRect.right &&
            e.clientY >= canvasRect.top &&
            e.clientY <= canvasRect.bottom
        ) {
            customCursorRef.current.style.opacity = '1';
            const posX = e.clientX - containerRect.left;
            const posY = e.clientY - containerRect.top;

            customCursorRef.current.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
        } else {
            customCursorRef.current.style.opacity = '0';
        }

        if (isDrawing) draw(e);
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (state.status !== 'completed') return;
        recacheWorkspaceDimensions();
        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        if (!coords) return;
        setIsDrawing(true);
        lastCoords.current = coords;
        executeStrokeSegment(coords, coords);
    };

    const draw = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !lastCoords.current) return;
        const currentCoords = getCanvasCoordinates(e.clientX, e.clientY);
        if (!currentCoords) return;

        executeStrokeSegment(lastCoords.current, currentCoords);
        lastCoords.current = currentCoords;
    };

    const executeStrokeSegment = (from: { x: number; y: number }, to: { x: number; y: number }) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;

        if (brushMode === 'erase') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            if (!brushPatternRef.current) {
                ctx.restore();
                return;
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = brushPatternRef.current;
        }

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.restore();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            lastCoords.current = null;
            saveHistoryState(); // Commit the completed line path to memory history
        }
    };

    const triggerDownload = () => {
        if (!canvasRef.current) return;
        const exportUrl = canvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = exportUrl;
        link.download = 'refined_no_bg.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        if (originalUrl) URL.revokeObjectURL(originalUrl);
        setOriginalUrl(null);
        brushPatternRef.current = null;
        workspaceRectRef.current = null;
        canvasRectRef.current = null;
        historyStackRef.current = [];
        historyIndexRef.current = -1;
        setCanUndo(false);
        setCanRedo(false);
        resetState();
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">

            {/* Hidden processing reference layer */}
            {resultUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img ref={resultImageRef} src={resultUrl} alt="hidden-res" className="hidden" crossOrigin="anonymous" />
            )}

            {/* Main Panel Layout Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Studio Workspace</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Hardware accelerated canvas-pattern recovery brush.</p>
                    </div>
                </div>
            </div>

            {state.status === 'idle' && !originalUrl ? (
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-12 text-center transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 min-h-[350px]"
                >
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-md group-hover:scale-110 transition-transform mb-4">
                        <Upload className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Drag and drop assets here</h3>
                    <p className="text-sm text-slate-400 mt-1">Supports images up to 10MB</p>
                    <button className="mt-6 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl">Browse Directory</button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tracking Bar Loader */}
                    {(state.status === 'loading' || state.status === 'downloading' || state.status === 'processing') && (
                        <div className="p-6 bg-indigo-50/50 dark:bg-slate-800/50 rounded-xl border border-indigo-100/50 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                                    {state.message}
                                </span>
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{state.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300" style={{ width: `${state.progress}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Configuration Tool Deck */}
                    {state.status === 'completed' && (
                        <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 gap-6 select-none">
                            <div className="flex items-center space-x-6">
                                {/* Mode Selectors */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setBrushMode('erase')}
                                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${brushMode === 'erase'
                                                ? 'bg-rose-500 text-white shadow-md ring-4 ring-rose-500/20'
                                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Eraser className="w-4 h-4" />
                                        <span>Eraser</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBrushMode('restore')}
                                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${brushMode === 'restore'
                                                ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-600/20'
                                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Paintbrush className="w-4 h-4" />
                                        <span>Restore</span>
                                    </button>
                                </div>

                                {/* History Action Group */}
                                <div className="flex items-center border-l border-slate-200 dark:border-slate-600 pl-6 space-x-1.5">
                                    <button
                                        type="button"
                                        disabled={!canUndo}
                                        onClick={executeUndo}
                                        className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-700 hover:bg-slate-100 transition-colors"
                                        title="Undo Stroke"
                                    >
                                        <Undo2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!canRedo}
                                        onClick={executeRedo}
                                        className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-700 hover:bg-slate-100 transition-colors"
                                        title="Redo Stroke"
                                    >
                                        <Redo2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 flex-1 max-w-xs">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                    Size: {brushSize}px
                                </span>
                                <input
                                    type="range"
                                    min="6"
                                    max="100"
                                    value={brushSize}
                                    onChange={(e) => {
                                        setBrushSize(Number(e.target.value));
                                        setTimeout(updateCursorDimensions, 0);
                                    }}
                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>
                    )}

                    {/* Dual Aspect Screen Interfaces */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="flex flex-col space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <ImageIcon className="w-3.5 h-3.5" /> Source Baseline
                            </span>
                            <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[350px] max-h-[500px]">
                                {originalUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={originalUrl} alt="Source master" className="max-h-[480px] w-auto h-auto object-scale-down rounded shadow-sm" />
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Live Matte Terminal
                            </span>

                            <div
                                ref={workspaceContainerRef}
                                onMouseEnter={recacheWorkspaceDimensions}
                                onMouseMove={handleMouseMove}
                                onMouseUp={stopDrawing}
                                onMouseLeave={() => {
                                    if (customCursorRef.current) customCursorRef.current.style.opacity = '0';
                                    stopDrawing();
                                }}
                                className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[350px] max-h-[500px] bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] dark:bg-slate-950"
                            >
                                {/* 144Hz Hardware-Accelerated Dynamic Brush Ring */}
                                <div
                                    ref={customCursorRef}
                                    className={`absolute pointer-events-none rounded-full border-2 border-solid shadow-xl opacity-0 z-50 will-change-transform ${brushMode === 'erase'
                                            ? 'border-rose-500 bg-rose-500/10'
                                            : 'border-emerald-500 bg-emerald-500/15'
                                        }`}
                                    style={{ left: 0, top: 0 }}
                                />

                                {/* Primary workspace canvas viewport */}
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    className={`max-h-[480px] w-auto h-auto object-scale-down rounded select-none ${state.status === 'completed' ? 'cursor-none' : 'hidden'
                                        }`}
                                />

                                {state.status !== 'completed' && originalUrl && (
                                    <div className="flex flex-col items-center text-slate-400 p-4 absolute pointer-events-none">
                                        <RefreshCw className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                                        <span className="text-sm font-medium">Isolating target structures...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Footer Bar */}
                    {state.status === 'completed' && (
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleReset}
                                className="flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Process New Asset</span>
                            </button>

                            <button
                                onClick={triggerDownload}
                                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export Polished PNG</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}