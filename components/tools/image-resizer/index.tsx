// "use client";

// import React, { useState, useRef, useEffect } from "react";

// function formatSize(bytes: number): string {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
// }

// export default function ImageResizer() {
//     const [file, setFile] = useState<File | null>(null);
//     const [originalImage, setOriginalImage] = useState<string>("");
//     const [resizedImage, setResizedImage] = useState<string>("");
//     const [width, setWidth] = useState(800);
//     const [height, setHeight] = useState(600);
//     const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
//     const [quality, setQuality] = useState(0.8);
//     const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

//     const fileInputRef = useRef<HTMLInputElement | null>(null);
//     const canvasRef = useRef<HTMLCanvasElement | null>(null);

//     useEffect(() => {
//         return () => {
//             if (originalImage && originalImage.startsWith("blob:")) URL.revokeObjectURL(originalImage);
//             if (resizedImage && resizedImage.startsWith("blob:")) URL.revokeObjectURL(resizedImage);
//         };
//     }, [originalImage, resizedImage]);

//     const handleFileUpload = (uploadedFile: File | null | undefined) => {
//         if (!uploadedFile) return;

//         if (!uploadedFile.type.startsWith("image/")) {
//             alert("Please select an image file");
//             return;
//         }

//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const result = e.target?.result;
//             if (typeof result !== "string") return;

//             const img = new Image();
//             img.onload = () => {
//                 if (originalImage && originalImage.startsWith("blob:")) URL.revokeObjectURL(originalImage);
//                 if (resizedImage && resizedImage.startsWith("blob:")) URL.revokeObjectURL(resizedImage);
//                 setOriginalImage(result);
//                 setOriginalSize({ width: img.width, height: img.height });
//                 setWidth(img.width);
//                 setHeight(img.height);
//                 setResizedImage("");
//                 setFile(uploadedFile);
//             };
//             img.src = result;
//         };
//         reader.readAsDataURL(uploadedFile);
//     };

//     const handleDrop = (e: React.DragEvent) => {
//         e.preventDefault();
//         const uploadedFile = e.dataTransfer.files[0];
//         handleFileUpload(uploadedFile);
//     };

//     const handleDragOver = (e: React.DragEvent) => {
//         e.preventDefault();
//     };

//     const resizeImage = () => {
//         if (!originalImage) {
//             alert("Please upload an image first");
//             return;
//         }

//         const canvas = canvasRef.current;
//         if (!canvas) return;
//         const ctx = canvas.getContext("2d");
//         if (!ctx) return;

//         const img = new Image();
//         img.onload = () => {
//             let newWidth = width;
//             let newHeight = height;

//             if (maintainAspectRatio) {
//                 const aspectRatio = img.width / img.height;
//                 if (newWidth / newHeight > aspectRatio) {
//                     newWidth = newHeight * aspectRatio;
//                 } else {
//                     newHeight = newWidth / aspectRatio;
//                 }
//             }

//             canvas.width = newWidth;
//             canvas.height = newHeight;

//             ctx.imageSmoothingEnabled = true;
//             ctx.imageSmoothingQuality = "high";
//             ctx.drawImage(img, 0, 0, newWidth, newHeight);

//             const resizedDataURL = canvas.toDataURL("image/jpeg", quality);
//             if (resizedImage && resizedImage.startsWith("blob:")) URL.revokeObjectURL(resizedImage);
//             setResizedImage(resizedDataURL);
//         };
//         img.src = originalImage;
//     };

//     const handleWidthChange = (newWidth: number) => {
//         setWidth(newWidth);
//         if (maintainAspectRatio && originalSize.width > 0) {
//             const aspectRatio = originalSize.width / originalSize.height;
//             setHeight(Math.round(newWidth / aspectRatio));
//         }
//     };

//     const handleHeightChange = (newHeight: number) => {
//         setHeight(newHeight);
//         if (maintainAspectRatio && originalSize.height > 0) {
//             const aspectRatio = originalSize.width / originalSize.height;
//             setWidth(Math.round(newHeight * aspectRatio));
//         }
//     };

//     const toggleAspectRatio = (checked: boolean) => {
//         setMaintainAspectRatio(checked);
//         // When enabling aspect ratio, recalc height based on current width and original ratio
//         if (checked && originalSize.width > 0 && originalSize.height > 0) {
//             const aspectRatio = originalSize.width / originalSize.height;
//             setHeight(Math.round(width / aspectRatio));
//         }
//     };

//     const clearAll = () => {
//         if (originalImage && originalImage.startsWith("blob:")) URL.revokeObjectURL(originalImage);
//         if (resizedImage && resizedImage.startsWith("blob:")) URL.revokeObjectURL(resizedImage);
//         setFile(null);
//         setOriginalImage("");
//         setResizedImage("");
//         setOriginalSize({ width: 0, height: 0 });
//         setWidth(800);
//         setHeight(600);
//         if (fileInputRef.current) fileInputRef.current.value = "";
//     };

//     const downloadResizedImage = () => {
//         if (!resizedImage) return;
//         const link = document.createElement("a");
//         link.href = resizedImage;
//         link.download = `resized-${width}x${height}.jpg`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     const applyPreset = (preset: string) => {
//         if (maintainAspectRatio) return; // prevent when aspect ratio locked
//         switch (preset) {
//             case "facebook":
//                 setWidth(1200);
//                 setHeight(630);
//                 break;
//             case "instagram":
//                 setWidth(1080);
//                 setHeight(1080);
//                 break;
//             case "twitter":
//                 setWidth(1200);
//                 setHeight(675);
//                 break;
//             case "thumbnail":
//                 setWidth(300);
//                 setHeight(300);
//                 break;
//             case "hd":
//                 setWidth(1920);
//                 setHeight(1080);
//                 break;
//             default:
//                 break;
//         }
//     };

//     const presetOptions = [
//         { key: "facebook", label: "Facebook (1200×630)" },
//         { key: "instagram", label: "Instagram (1080×1080)" },
//         { key: "twitter", label: "Twitter (1200×675)" },
//         { key: "thumbnail", label: "Thumbnail (300×300)" },
//         { key: "hd", label: "HD (1920×1080)" },
//     ];

//     const hasFile = !!file;

//     return (
//         <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 sm:px-4 sm:py-10">
//             <div className="w-full max-w-6xl">
//                 <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
//                     <div className="grid gap-6 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[1fr_1.1fr]">
//                         {/* LEFT PANEL - Upload & Settings */}
//                         <div className="space-y-5">
//                             {!hasFile ? (
//                                 // Upload dropzone (dashed border, camera icon)
//                                 <div
//                                     onDrop={handleDrop}
//                                     onDragOver={handleDragOver}
//                                     onClick={() => fileInputRef.current?.click()}
//                                     className="group relative rounded-xl border-2 border-dashed border-slate-300 transition-all duration-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600 cursor-pointer bg-white/50 dark:bg-slate-900/50 p-5 text-center"
//                                 >
//                                     <input
//                                         ref={fileInputRef}
//                                         type="file"
//                                         accept="image/*"
//                                         className="hidden"
//                                         onChange={(e) => handleFileUpload(e.target.files?.[0])}
//                                     />
//                                     <div className="flex flex-col items-center justify-center">
//                                         <div className="mb-3 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-3 shadow-inner dark:from-slate-800/60 dark:to-slate-900/60">
//                                             <svg className="h-7 w-7 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
//                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
//                                             </svg>
//                                         </div>
//                                         <p className="text-base font-semibold tracking-tight text-slate-800 dark:text-white">
//                                             Upload Image
//                                         </p>
//                                         <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                                             Drag & drop or click to browse
//                                         </p>
//                                         <div className="mt-3 flex flex-wrap justify-center gap-1.5">
//                                             <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">JPG</span>
//                                             <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">PNG</span>
//                                             <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">GIF</span>
//                                             <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">WebP</span>
//                                         </div>
//                                         <p className="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider dark:text-slate-500">
//                                             Max file size: no limit (but large files may take time)
//                                         </p>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 // Compact preview card after upload
//                                 <div className="rounded-xl border border-slate-200/80 bg-white/50 p-3 dark:border-slate-800/60 dark:bg-slate-900/50">
//                                     <div className="flex items-center gap-4">
//                                         <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
//                                             {originalImage && <img src={originalImage} alt="Preview" className="h-full w-full object-cover" />}
//                                         </div>
//                                         <div className="min-w-0 flex-1">
//                                             <div className="flex items-start justify-between gap-3">
//                                                 <div className="min-w-0">
//                                                     <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
//                                                         {file.name}
//                                                     </p>
//                                                     <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
//                                                         {file.type.split("/")[1]?.toUpperCase() || "IMG"} · {formatSize(file.size)}
//                                                         {originalSize.width > 0 && <> · {originalSize.width}×{originalSize.height}</>}
//                                                     </p>
//                                                 </div>
//                                                 <button
//                                                     onClick={clearAll}
//                                                     className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-rose-800/40 dark:hover:bg-rose-950/20 dark:hover:text-rose-300"
//                                                 >
//                                                     <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                                                     </svg>
//                                                     Remove
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Settings - only visible when file exists */}
//                             {hasFile && (
//                                 <>
//                                     {/* Quick Presets - disabled when maintainAspectRatio is true */}
//                                     <div>
//                                         <label className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
//                                             Quick Presets
//                                         </label>
//                                         <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
//                                             {presetOptions.map(({ key, label }) => (
//                                                 <button
//                                                     key={key}
//                                                     onClick={() => applyPreset(key)}
//                                                     disabled={maintainAspectRatio}
//                                                     className={`rounded-lg border px-2 py-1.5 text-xs transition ${maintainAspectRatio
//                                                             ? "cursor-not-allowed border-slate-200/50 bg-white/30 text-slate-400 opacity-50 dark:border-slate-800/40 dark:bg-slate-800/20 dark:text-slate-500"
//                                                             : "border-slate-200/80 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-slate-800/60 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800"
//                                                         }`}
//                                                 >
//                                                     {label}
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     </div>

//                                     {/* Width & Height */}
//                                     <div className="grid grid-cols-2 gap-3">
//                                         <div>
//                                             <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Width (px)</label>
//                                             <input
//                                                 type="number"
//                                                 value={width}
//                                                 onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
//                                                 min="1"
//                                                 max="5000"
//                                                 className="w-full rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 transition focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Height (px)</label>
//                                             <input
//                                                 type="number"
//                                                 value={height}
//                                                 onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
//                                                 min="1"
//                                                 max="5000"
//                                                 className="w-full rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 transition focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
//                                             />
//                                         </div>
//                                     </div>

//                                     {/* Maintain Aspect Ratio Checkbox */}
//                                     <div className="flex items-center gap-2">
//                                         <input
//                                             type="checkbox"
//                                             id="maintainAspect"
//                                             checked={maintainAspectRatio}
//                                             onChange={(e) => toggleAspectRatio(e.target.checked)}
//                                             className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
//                                         />
//                                         <label htmlFor="maintainAspect" className="text-xs text-slate-600 dark:text-slate-300">
//                                             Maintain aspect ratio
//                                         </label>
//                                     </div>

//                                     {/* Quality Slider */}
//                                     <div>
//                                         <div className="mb-2 flex items-center justify-between">
//                                             <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
//                                                 Quality
//                                             </label>
//                                             <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
//                                                 {Math.round(quality * 100)}%
//                                             </span>
//                                         </div>
//                                         <input
//                                             type="range"
//                                             min="0.1"
//                                             max="1"
//                                             step="0.1"
//                                             value={quality}
//                                             onChange={(e) => setQuality(parseFloat(e.target.value))}
//                                             className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500 dark:bg-slate-800"
//                                         />
//                                     </div>

//                                     {/* Resize & Clear Buttons */}
//                                     <div className="flex gap-3 pt-2">
//                                         <button
//                                             onClick={resizeImage}
//                                             className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-bold tracking-wide text-white shadow-sm shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow active:scale-[0.98]"
//                                         >
//                                             Resize Image
//                                         </button>
//                                         <button
//                                             onClick={clearAll}
//                                             className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
//                                         >
//                                             Clear
//                                         </button>
//                                     </div>
//                                 </>
//                             )}
//                         </div>

//                         {/* RIGHT PANEL - Previews */}
//                         <div className="space-y-5">
//                             {/* Original Preview */}
//                             {originalImage ? (
//                                 <div>
//                                     <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
//                                         Original
//                                     </h3>
//                                     <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
//                                         <img src={originalImage} alt="Original" className="max-h-48 object-contain" />
//                                     </div>
//                                     <div className="mt-1 text-center text-[10px] text-slate-400">
//                                         {originalSize.width} × {originalSize.height} px
//                                     </div>
//                                 </div>
//                             ) : (
//                                 /* Placeholder for original image - only visible on desktop */
//                                 <div className="hidden lg:block rounded-xl border border-dashed border-slate-300 bg-white/40 p-6 text-center backdrop-blur-sm transition-all dark:border-slate-700 dark:bg-slate-900/30">
//                                     <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
//                                         <svg className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
//                                         </svg>
//                                     </div>
//                                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
//                                         Original image will appear here
//                                     </p>
//                                     <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
//                                         Upload an image to get started
//                                     </p>
//                                 </div>
//                             )}

//                             {/* Resized Preview */}
//                             {resizedImage ? (
//                                 <div>
//                                     <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
//                                         Resized
//                                     </h3>
//                                     <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
//                                         <img src={resizedImage} alt="Resized" className="max-h-48 object-contain" />
//                                     </div>
//                                     <div className="mt-1 text-center text-[10px] text-slate-400">
//                                         {width} × {height} px
//                                     </div>
//                                     <button
//                                         onClick={downloadResizedImage}
//                                         className="mt-4 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-xs font-semibold tracking-wide text-white shadow-sm transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md active:scale-[0.98]"
//                                     >
//                                         Download Resized Image
//                                     </button>
//                                 </div>
//                             ) : (
//                                 hasFile && (
//                                     /* Placeholder for resized image - only visible on desktop */
//                                     <div className="hidden lg:block rounded-xl border border-dashed border-slate-300 bg-white/40 p-6 text-center backdrop-blur-sm transition-all dark:border-slate-700 dark:bg-slate-900/30">
//                                         <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
//                                             <svg className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.75 7.5l-.937 3.281a4.5 4.5 0 01-3.031 3.032L11.25 14.25l3.281.937a4.5 4.5 0 013.032 3.031L18.75 21.75l.937-3.281a4.5 4.5 0 013.032-3.032L26.25 14.25l-3.281-.937a4.5 4.5 0 01-3.032-3.031L18.75 7.5z" />
//                                             </svg>
//                                         </div>
//                                         <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
//                                             Resized image will appear here
//                                         </p>
//                                         <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
//                                             Adjust settings and click &quot;Resize Image&quot;
//                                         </p>
//                                     </div>
//                                 )
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Hidden canvas for resizing */}
//             <canvas ref={canvasRef} style={{ display: "none" }} />
//         </div>
//     );
// }


"use client"

import React, { useState, useRef, useEffect } from "react"

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ImageResizer() {
    const [file, setFile] = useState<File | null>(null)
    const [originalImage, setOriginalImage] = useState<string>("")
    const [resizedImage, setResizedImage] = useState<string>("")
    const [width, setWidth] = useState(800)
    const [height, setHeight] = useState(600)
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
    const [quality, setQuality] = useState(0.8)
    const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        return () => {
            if (originalImage && originalImage.startsWith("blob:"))
                URL.revokeObjectURL(originalImage)
            if (resizedImage && resizedImage.startsWith("blob:"))
                URL.revokeObjectURL(resizedImage)
        }
    }, [originalImage, resizedImage])

    const handleFileUpload = (uploadedFile: File | null | undefined) => {
        if (!uploadedFile) return

        if (!uploadedFile.type.startsWith("image/")) {
            alert("Please select an image file")
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const result = e.target?.result
            if (typeof result !== "string") return

            const img = new Image()
            img.onload = () => {
                if (originalImage && originalImage.startsWith("blob:"))
                    URL.revokeObjectURL(originalImage)
                if (resizedImage && resizedImage.startsWith("blob:"))
                    URL.revokeObjectURL(resizedImage)
                setOriginalImage(result)
                setOriginalSize({ width: img.width, height: img.height })
                setWidth(img.width)
                setHeight(img.height)
                setResizedImage("")
                setFile(uploadedFile)
            }
            img.src = result
        }
        reader.readAsDataURL(uploadedFile)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const uploadedFile = e.dataTransfer.files[0]
        handleFileUpload(uploadedFile)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const resizeImage = () => {
        if (!originalImage) {
            alert("Please upload an image first")
            return
        }

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = new Image()
        img.onload = () => {
            let newWidth = width
            let newHeight = height

            if (maintainAspectRatio) {
                const aspectRatio = img.width / img.height
                if (newWidth / newHeight > aspectRatio) {
                    newWidth = newHeight * aspectRatio
                } else {
                    newHeight = newWidth / aspectRatio
                }
            }

            canvas.width = newWidth
            canvas.height = newHeight

            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
            ctx.drawImage(img, 0, 0, newWidth, newHeight)

            const resizedDataURL = canvas.toDataURL("image/jpeg", quality)
            if (resizedImage && resizedImage.startsWith("blob:"))
                URL.revokeObjectURL(resizedImage)
            setResizedImage(resizedDataURL)
        }
        img.src = originalImage
    }

    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth)
        if (maintainAspectRatio && originalSize.width > 0) {
            const aspectRatio = originalSize.width / originalSize.height
            setHeight(Math.round(newWidth / aspectRatio))
        }
    }

    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight)
        if (maintainAspectRatio && originalSize.height > 0) {
            const aspectRatio = originalSize.width / originalSize.height
            setWidth(Math.round(newHeight * aspectRatio))
        }
    }

    const toggleAspectRatio = (checked: boolean) => {
        setMaintainAspectRatio(checked)
        if (checked && originalSize.width > 0 && originalSize.height > 0) {
            const aspectRatio = originalSize.width / originalSize.height
            setHeight(Math.round(width / aspectRatio))
        }
    }

    const clearAll = () => {
        if (originalImage && originalImage.startsWith("blob:"))
            URL.revokeObjectURL(originalImage)
        if (resizedImage && resizedImage.startsWith("blob:"))
            URL.revokeObjectURL(resizedImage)
        setFile(null)
        setOriginalImage("")
        setResizedImage("")
        setOriginalSize({ width: 0, height: 0 })
        setWidth(800)
        setHeight(600)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const downloadResizedImage = () => {
        if (!resizedImage) return
        const link = document.createElement("a")
        link.href = resizedImage
        link.download = `resized-${width}x${height}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const applyPreset = (preset: string) => {
        if (maintainAspectRatio) return
        switch (preset) {
            case "facebook":
                setWidth(1200)
                setHeight(630)
                break
            case "instagram":
                setWidth(1080)
                setHeight(1080)
                break
            case "twitter":
                setWidth(1200)
                setHeight(675)
                break
            case "thumbnail":
                setWidth(300)
                setHeight(300)
                break
            case "hd":
                setWidth(1920)
                setHeight(1080)
                break
            default:
                break
        }
    }

    const presetOptions = [
        { key: "facebook", label: "Facebook (1200×630)" },
        { key: "instagram", label: "Instagram (1080×1080)" },
        { key: "twitter", label: "Twitter (1200×675)" },
        { key: "thumbnail", label: "Thumbnail (300×300)" },
        { key: "hd", label: "HD (1920×1080)" },
    ]

    const hasFile = !!file

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-6xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    <div className="grid gap-6 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[1fr_1.1fr]">
                        {/* LEFT PANEL - Upload & Settings */}
                        <div className="space-y-5 min-w-0">
                            {!hasFile ? (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white/50 p-5 text-center transition-all duration-200 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e.target.files?.[0])}
                                    />
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="mb-3 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-3 shadow-inner dark:from-slate-800/60 dark:to-slate-900/60">
                                            <svg
                                                className="h-7 w-7 text-slate-500 dark:text-slate-400"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.5}
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-base font-semibold tracking-tight text-slate-800 dark:text-white">
                                            Upload Image
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Drag & drop or click to browse
                                        </p>
                                        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                JPG
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                PNG
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                GIF
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                WebP
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[10px] font-medium tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                            Max file size: no limit (but large files may take time)
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-slate-200/80 bg-white/50 p-3 dark:border-slate-800/60 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                            {originalImage && (
                                                <img
                                                    src={originalImage}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                                                        {file.name}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                        {file.type.split("/")[1]?.toUpperCase() || "IMG"} ·{" "}
                                                        {formatSize(file.size)}
                                                        {originalSize.width > 0 && (
                                                            <>
                                                                {" "}
                                                                · {originalSize.width}×{originalSize.height}
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={clearAll}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-rose-800/40 dark:hover:bg-rose-950/20 dark:hover:text-rose-300 flex-shrink-0"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Settings - only visible when file exists */}
                            {hasFile && (
                                <>
                                    {/* Quick Presets */}
                                    <div className="min-w-0">
                                        <label className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                            Quick Presets
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 min-w-0">
                                            {presetOptions.map(({ key, label }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => applyPreset(key)}
                                                    disabled={maintainAspectRatio}
                                                    className={`rounded-lg border px-2 py-1.5 text-xs transition truncate ${maintainAspectRatio
                                                        ? "cursor-not-allowed border-slate-200/50 bg-white/30 text-slate-400 opacity-50 dark:border-slate-800/40 dark:bg-slate-800/20 dark:text-slate-500"
                                                        : "border-slate-200/80 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-slate-800/60 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800"
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Width & Height */}
                                    <div className="grid grid-cols-2 gap-3 min-w-0">
                                        <div className="min-w-0">
                                            <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                                Width (px)
                                            </label>
                                            <input
                                                type="number"
                                                value={width}
                                                onChange={(e) =>
                                                    handleWidthChange(parseInt(e.target.value) || 1)
                                                }
                                                min="1"
                                                max="5000"
                                                className="w-full min-w-0 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                                Height (px)
                                            </label>
                                            <input
                                                type="number"
                                                value={height}
                                                onChange={(e) =>
                                                    handleHeightChange(parseInt(e.target.value) || 1)
                                                }
                                                min="1"
                                                max="5000"
                                                className="w-full min-w-0 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                            />
                                        </div>
                                    </div>

                                    {/* Maintain Aspect Ratio Checkbox */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="maintainAspect"
                                            checked={maintainAspectRatio}
                                            onChange={(e) => toggleAspectRatio(e.target.checked)}
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                        />
                                        <label
                                            htmlFor="maintainAspect"
                                            className="text-xs text-slate-600 dark:text-slate-300"
                                        >
                                            Maintain aspect ratio
                                        </label>
                                    </div>

                                    {/* Quality Slider */}
                                    <div className="min-w-0">
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                Quality
                                            </label>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                {Math.round(quality * 100)}%
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                            value={quality}
                                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                                            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500 dark:bg-slate-800"
                                        />
                                    </div>

                                    {/* Resize & Clear Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={resizeImage}
                                            className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-bold tracking-wide text-white shadow-sm shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow active:scale-[0.98]"
                                        >
                                            Resize Image
                                        </button>
                                        <button
                                            onClick={clearAll}
                                            className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* RIGHT PANEL - Previews */}
                        <div className="space-y-5 min-w-0">
                            {/* Original Preview */}
                            {originalImage ? (
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Original
                                    </h3>
                                    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 p-4 min-w-0 dark:border-slate-800/60 dark:bg-slate-800/30">
                                        <img
                                            src={originalImage}
                                            alt="Original"
                                            className="max-h-48 object-contain max-w-full"
                                        />
                                    </div>
                                    <div className="mt-1 text-center text-[10px] text-slate-400">
                                        {originalSize.width} × {originalSize.height} px
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden rounded-xl border border-dashed border-slate-300 bg-white/40 p-6 text-center backdrop-blur-sm transition-all lg:block dark:border-slate-700 dark:bg-slate-900/30">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                        <svg
                                            className="h-6 w-6 text-slate-400 dark:text-slate-500"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Original image will appear here
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                        Upload an image to get started
                                    </p>
                                </div>
                            )}

                            {/* Resized Preview */}
                            {resizedImage ? (
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Resized
                                    </h3>
                                    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 p-4 min-w-0 dark:border-slate-800/60 dark:bg-slate-800/30">
                                        <img
                                            src={resizedImage}
                                            alt="Resized"
                                            className="max-h-48 object-contain max-w-full"
                                        />
                                    </div>
                                    <div className="mt-1 text-center text-[10px] text-slate-400">
                                        {width} × {height} px
                                    </div>
                                    <button
                                        onClick={downloadResizedImage}
                                        className="mt-4 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-xs font-semibold tracking-wide text-white shadow-sm transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md active:scale-[0.98]"
                                    >
                                        Download Resized Image
                                    </button>
                                </div>
                            ) : (
                                hasFile && (
                                    <div className="hidden rounded-xl border border-dashed border-slate-300 bg-white/40 p-6 text-center backdrop-blur-sm transition-all lg:block dark:border-slate-700 dark:bg-slate-900/30">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                            <svg
                                                className="h-6 w-6 text-slate-400 dark:text-slate-500"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.5}
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.75 7.5l-.937 3.281a4.5 4.5 0 01-3.031 3.032L11.25 14.25l3.281.937a4.5 4.5 0 013.032 3.031L18.75 21.75l.937-3.281a4.5 4.5 0 013.032-3.032L26.25 14.25l-3.281-.937a4.5 4.5 0 01-3.032-3.031L18.75 7.5z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Resized image will appear here
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                            Adjust settings and click &quot;Resize Image&quot;
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden canvas for resizing */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    )
}