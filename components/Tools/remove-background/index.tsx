// "use client"

// import {
//     ChangeEvent,
//     DragEvent,
//     useState,
//     useEffect,
//     useRef,
// } from "react"
// import {
//     useBackgroundRemover,
//     ProcessedItem,
// } from "../../../hooks/useBackgroundRemover"
// import {
//     Upload,
//     Download,
//     RefreshCw,
//     Layers,
//     CheckCircle2,
//     AlertCircle,
//     Loader2,
//     Trash2,
//     Sliders,
//     Undo2,
//     Redo2,
//     Brush,
//     Eraser,
//     ArrowLeft,
//     Package,
// } from "lucide-react"

// // shadcn imports
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
// import { Badge } from "@/components/ui/badge"
// import { Slider } from "@/components/ui/slider"
// import { Input } from "@/components/ui/input"
// import { Separator } from "@/components/ui/separator"
// import { cn } from "@/lib/utils"

// export default function BackgroundRemover() {
//     const {
//         queue,
//         removeBackground,
//         isProcessing,
//         resetState,
//         removeSingleFile,
//         updateItemResultUrl,
//         engine,
//         downloadAllCompleted,
//     } = useBackgroundRemover()

//     const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

//     const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files.length > 0) {
//             removeBackground(e.target.files)
//         }
//     }

//     const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault()

//     const handleDrop = (e: DragEvent<HTMLDivElement>) => {
//         e.preventDefault()
//         if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//             removeBackground(e.dataTransfer.files)
//         }
//     }

//     const totalItems = queue.length
//     const completedItems = queue.filter((i) => i.status === "completed").length
//     const macroProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

//     const isSingleView = totalItems === 1
//     const activeItem = isSingleView
//         ? queue[0]
//         : queue.find((item) => item.id === selectedItemId)

//     useEffect(() => {
//         if (selectedItemId && !queue.some((item) => item.id === selectedItemId)) {
//             setSelectedItemId(null)
//         }
//     }, [queue, selectedItemId])

//     return (
//         <div className="mx-auto w-full max-w-7xl bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-6 transition-colors duration-200 selection:bg-indigo-500/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
//             {/* Header */}
//             <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
//                 <div className="flex items-center space-x-4">
//                     <div className="rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-3 text-white shadow-lg shadow-indigo-500/20">
//                         <Layers className="h-6 w-6" />
//                     </div>
//                     <div>
//                         <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
//                             Neural Isolation Studio
//                         </h1>
//                         <p className="text-xs font-semibold text-muted-foreground">
//                             Hardware accelerated client-side background eraser layer.
//                         </p>
//                     </div>
//                 </div>

//                 <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
//                     {engine.device && (
//                         <Badge
//                             variant={engine.device === "webgpu" ? "default" : "secondary"}
//                             className="whitespace-nowrap"
//                         >
//                             {engine.device === "webgpu" ? "⚡ WebGPU" : "🧠 WASM"}
//                         </Badge>
//                     )}
//                     {totalItems > 0 && (
//                         <>
//                             <Button asChild variant="default" size="sm" className="flex-1 sm:flex-none">
//                                 <label htmlFor="upload-more" className="cursor-pointer">
//                                     Upload More Files
//                                 </label>
//                             </Button>
//                             <Input
//                                 id="upload-more"
//                                 type="file"
//                                 multiple
//                                 accept="image/*"
//                                 className="hidden"
//                                 onChange={handleFileChange}
//                             />
//                             {completedItems > 0 && (
//                                 <Button
//                                     onClick={downloadAllCompleted}
//                                     size="sm"
//                                     className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
//                                 >
//                                     <Package className="mr-1.5 h-4 w-4" /> Download All ({completedItems})
//                                 </Button>
//                             )}
//                             <Button
//                                 onClick={() => {
//                                     resetState()
//                                     setSelectedItemId(null)
//                                 }}
//                                 variant="destructive"
//                                 size="sm"
//                                 className="flex-1 sm:flex-none"
//                             >
//                                 Reset
//                             </Button>
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* Engine loading bar */}
//             {engine.loading && (
//                 <Card className="mb-6 border-border bg-card shadow-sm">
//                     <CardContent className="p-4">
//                         <div className="mb-2 flex items-center justify-between">
//                             <span className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-muted-foreground uppercase">
//                                 <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
//                                 Downloading AI Model
//                             </span>
//                             <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
//                                 {Math.round(engine.progress)}%
//                             </span>
//                         </div>
//                         <Progress value={engine.progress} className="w-full [&>div]:bg-gradient-to-r [&>div]:from-indigo-600 [&>div]:to-violet-600" />
//                     </CardContent>
//                 </Card>
//             )}

//             {/* Dropzone */}
//             {totalItems === 0 && (
//                 <Card
//                     onDragOver={handleDragOver}
//                     onDrop={handleDrop}
//                     className="relative flex min-h-[300px] sm:min-h-[450px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border bg-card p-6 sm:p-12 text-center shadow-sm hover:border-indigo-500 transition-all"
//                 >
//                     <CardContent className="flex flex-col items-center">
//                         <Input
//                             type="file"
//                             multiple
//                             accept="image/*"
//                             className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
//                             onChange={handleFileChange}
//                         />
//                         <div className="mb-4 rounded-2xl border border-border bg-muted p-5 shadow-inner transition-transform group-hover:scale-110">
//                             <Upload className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
//                         </div>
//                         <h3 className="text-xl font-bold text-foreground">
//                             Drop your production images here
//                         </h3>
//                         <p className="mt-2 max-w-sm text-sm text-muted-foreground">
//                             Process a single high-definition photo or a massive batch simultaneously through localized execution layers.
//                         </p>
//                     </CardContent>
//                 </Card>
//             )}

//             {totalItems > 0 && (
//                 <div className="space-y-6">
//                     {/* Global queue progress */}
//                     <Card className="border-border bg-card shadow-sm">
//                         <CardContent className="p-4">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <span className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-muted-foreground uppercase">
//                                     {isProcessing ? (
//                                         <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
//                                     ) : (
//                                         <CheckCircle2 className="h-4 w-4 text-emerald-500" />
//                                     )}
//                                     Pipeline: {completedItems} / {totalItems} Completed
//                                 </span>
//                                 <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
//                                     {macroProgress}%
//                                 </span>
//                             </div>
//                             <Progress value={macroProgress} className="w-full [&>div]:bg-gradient-to-r [&>div]:from-indigo-600 [&>div]:to-violet-600" />
//                         </CardContent>
//                     </Card>

//                     {activeItem ? (
//                         <div className="space-y-4">
//                             {!isSingleView && (
//                                 <Button
//                                     onClick={() => setSelectedItemId(null)}
//                                     variant="outline"
//                                     size="sm"
//                                     className="group"
//                                 >
//                                     <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
//                                     Return to Batch Gallery
//                                 </Button>
//                             )}
//                             <InteractiveCanvasEditor
//                                 item={activeItem}
//                                 onSaveMask={(newUrl) => {
//                                     if (activeItem.resultUrl) URL.revokeObjectURL(activeItem.resultUrl)
//                                     updateItemResultUrl(activeItem.id, newUrl)
//                                 }}
//                             />
//                         </div>
//                     ) : (
//                         /* Batch gallery grid */
//                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                             {queue.map((item) => (
//                                 <Card
//                                     key={item.id}
//                                     className={cn(
//                                         "overflow-hidden border-border bg-card shadow-sm transition-all",
//                                         (item.status === "loading" || item.status === "processing" || item.status === "downloading") &&
//                                         "border-indigo-500 shadow-md ring-2 ring-indigo-600/10"
//                                     )}
//                                 >
//                                     <div className="relative aspect-square border-b border-border bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0] p-3 dark:bg-slate-950">
//                                         {item.status === "completed" && item.resultUrl ? (
//                                             <img
//                                                 src={item.resultUrl}
//                                                 alt={item.fileName}
//                                                 className="max-h-full max-w-full rounded-lg object-scale-down shadow-sm"
//                                             />
//                                         ) : item.status === "error" ? (
//                                             <div className="flex flex-col items-center space-y-1 p-4 text-center text-rose-500">
//                                                 <AlertCircle className="h-7 w-7" />
//                                                 <span className="text-xs font-black tracking-wider uppercase">Failed</span>
//                                             </div>
//                                         ) : item.status === "queued" ? (
//                                             <Badge variant="outline" className="mx-auto">Queued</Badge>
//                                         ) : (
//                                             <div className="flex flex-col items-center space-y-2 text-indigo-600 dark:text-indigo-400">
//                                                 <Loader2 className="h-7 w-7 animate-spin" />
//                                                 <span className="animate-pulse text-[10px] font-black tracking-widest uppercase">
//                                                     Processing...
//                                                 </span>
//                                             </div>
//                                         )}

//                                         {(item.status === "processing" || item.status === "loading") && (
//                                             <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded-lg border border-border bg-background/95 px-2 py-1 text-[9px] font-bold text-foreground shadow-sm backdrop-blur-sm">
//                                                 <span className="max-w-[100px] truncate">{item.message}</span>
//                                                 <span className="font-black text-indigo-600">{item.progress}%</span>
//                                             </div>
//                                         )}

//                                         <Button
//                                             onClick={() => removeSingleFile(item.id)}
//                                             variant="ghost"
//                                             size="icon"
//                                             className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
//                                         >
//                                             <Trash2 className="h-3.5 w-3.5" />
//                                         </Button>
//                                     </div>

//                                     <div className="flex flex-1 items-center justify-between gap-2 bg-muted/30 p-3.5">
//                                         <div className="min-w-0 flex-1 truncate">
//                                             <p className="truncate text-xs font-bold text-foreground" title={item.fileName}>
//                                                 {item.fileName}
//                                             </p>
//                                             <p className="mt-0.5 text-[9px] font-extrabold tracking-widest text-muted-foreground uppercase">
//                                                 {item.status === "completed" ? "Isolated Matte" : item.status}
//                                             </p>
//                                         </div>

//                                         <div className="flex items-center gap-1.5">
//                                             {item.status === "completed" && (
//                                                 <Button
//                                                     onClick={() => setSelectedItemId(item.id)}
//                                                     variant="outline"
//                                                     size="icon"
//                                                     className="h-7 w-7"
//                                                     title="Refine Asset Matte"
//                                                 >
//                                                     <Sliders className="h-3.5 w-3.5" />
//                                                 </Button>
//                                             )}
//                                             {item.status === "completed" && item.resultUrl && (
//                                                 <Button asChild variant="outline" size="icon" className="h-7 w-7 text-indigo-600 hover:text-indigo-700">
//                                                     <a
//                                                         href={item.resultUrl}
//                                                         download={`matte_${item.fileName.replace(/\.[^/.]+$/, "")}.png`}
//                                                     >
//                                                         <Download className="h-3.5 w-3.5" />
//                                                     </a>
//                                                 </Button>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </Card>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     )
// }

// /* ============ InteractiveCanvasEditor (Ultimate Mobile-Proof Version) ============ */
// interface EditorProps {
//     item: ProcessedItem
//     onSaveMask: (newUrl: string) => void
// }

// function InteractiveCanvasEditor({ item, onSaveMask }: EditorProps) {
//     const canvasRef = useRef<HTMLCanvasElement | null>(null)
//     const originalCanvasRef = useRef<HTMLCanvasElement | null>(null)
//     const initializedIdRef = useRef<string | null>(null)

//     const [brushMode, setBrushMode] = useState<"remove" | "restore">("remove")
//     const [brushSize, setBrushSize] = useState<number>(40)
//     const [isDrawing, setIsDrawing] = useState(false)
//     const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
//     const [displayScaleFactor, setDisplayScaleFactor] = useState<number>(1)
//     const [history, setHistory] = useState<ImageData[]>([])
//     const [historyIndex, setHistoryIndex] = useState<number>(-1)

//     const isLoaded = item.status === "completed" && item.resultUrl && item.originalUrl

//     useEffect(() => {
//         if (!isLoaded) return
//         if (initializedIdRef.current === item.id) return

//         const mainCanvas = canvasRef.current
//         const origCanvas = originalCanvasRef.current
//         if (!mainCanvas || !origCanvas) return

//         const ctx = mainCanvas.getContext("2d")
//         const oCtx = origCanvas.getContext("2d")
//         if (!ctx || !oCtx) return

//         const baseImg = new Image()
//         const origImg = new Image()

//         let assetsLoaded = 0
//         const onAssetLoad = () => {
//             assetsLoaded++
//             if (assetsLoaded === 2) {
//                 mainCanvas.width = baseImg.naturalWidth
//                 mainCanvas.height = baseImg.naturalHeight
//                 origCanvas.width = baseImg.naturalWidth
//                 origCanvas.height = baseImg.naturalHeight

//                 ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
//                 ctx.drawImage(baseImg, 0, 0)

//                 oCtx.clearRect(0, 0, origCanvas.width, origCanvas.height)
//                 oCtx.drawImage(origImg, 0, 0)

//                 const initialFrame = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height)
//                 setHistory([initialFrame])
//                 setHistoryIndex(0)
//                 initializedIdRef.current = item.id

//                 recalculateDisplayScale()
//             }
//         }

//         baseImg.crossOrigin = "anonymous"
//         origImg.crossOrigin = "anonymous"
//         baseImg.src = item.resultUrl!
//         origImg.src = item.originalUrl!

//         baseImg.onload = onAssetLoad
//         origImg.onload = onAssetLoad
//     }, [isLoaded, item.id, item.resultUrl, item.originalUrl])

//     const recalculateDisplayScale = () => {
//         const canvas = canvasRef.current
//         if (canvas) {
//             const rect = canvas.getBoundingClientRect()
//             setDisplayScaleFactor(rect.width / canvas.width)
//         }
//     }

//     useEffect(() => {
//         window.addEventListener("resize", recalculateDisplayScale)
//         return () => window.removeEventListener("resize", recalculateDisplayScale)
//     }, [])

//     // ----- POINTER EVENT HANDLERS (with mobile touch blockers) -----
//     const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
//         const canvas = canvasRef.current
//         const ctx = canvas?.getContext("2d")
//         const oCanvas = originalCanvasRef.current
//         if (!canvas || !ctx || !oCanvas) return

//         const rect = canvas.getBoundingClientRect()
//         const scaleX = canvas.width / rect.width
//         const scaleY = canvas.height / rect.height
//         const x = (e.clientX - rect.left) * scaleX
//         const y = (e.clientY - rect.top) * scaleY

//         if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) return

//         ctx.save()
//         ctx.lineCap = "round"
//         ctx.lineJoin = "round"
//         ctx.lineWidth = brushSize

//         if (brushMode === "remove") {
//             ctx.globalCompositeOperation = "destination-out"
//             ctx.beginPath()
//             ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
//             ctx.fill()
//         } else {
//             ctx.globalCompositeOperation = "source-over"
//             ctx.beginPath()
//             ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
//             ctx.clip()
//             ctx.drawImage(oCanvas, 0, 0)
//         }
//         ctx.restore()
//     }

//     const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
//         if (!isLoaded || historyIndex === -1) return
//         e.preventDefault()
//         e.currentTarget.setPointerCapture(e.pointerId)
//         setIsDrawing(true)
//         draw(e)
//     }

//     const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
//         const rect = e.currentTarget.getBoundingClientRect()
//         setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
//         if (isDrawing) draw(e)
//     }

//     const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
//         e.currentTarget.releasePointerCapture(e.pointerId)
//         if (!isDrawing) return
//         setIsDrawing(false)

//         const canvas = canvasRef.current
//         const ctx = canvas?.getContext("2d")
//         if (!canvas || !ctx) return

//         const nextFrame = ctx.getImageData(0, 0, canvas.width, canvas.height)
//         const updatedHistory = history.slice(0, historyIndex + 1)
//         setHistory([...updatedHistory, nextFrame])
//         setHistoryIndex(updatedHistory.length)

//         canvas.toBlob((blob) => {
//             if (blob) {
//                 const nextUrl = URL.createObjectURL(blob)
//                 onSaveMask(nextUrl)
//             }
//         }, "image/png")
//     }

//     const handlePointerLeave = () => {
//         setCursorPos(null)
//         // isDrawing stays true because of setPointerCapture
//     }

//     // --- EXPLICIT TOUCH PREVENT DEFAULTS (Ultimate Scroll/Zoom Stopper) ---
//     const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
//         e.preventDefault() // Stops page from panning
//     }

//     const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
//         e.preventDefault() // Stops page from zooming/scrolling while drawing
//     }

//     const undo = () => {
//         if (historyIndex <= 0) return
//         const nextIdx = historyIndex - 1
//         setHistoryIndex(nextIdx)
//         applyHistoryState(nextIdx)
//     }

//     const redo = () => {
//         if (historyIndex >= history.length - 1) return
//         const nextIdx = historyIndex + 1
//         setHistoryIndex(nextIdx)
//         applyHistoryState(nextIdx)
//     }

//     const applyHistoryState = (index: number) => {
//         const canvas = canvasRef.current
//         const ctx = canvas?.getContext("2d")
//         if (!canvas || !ctx) return

//         ctx.clearRect(0, 0, canvas.width, canvas.height)
//         ctx.putImageData(history[index], 0, 0)

//         canvas.toBlob((blob) => {
//             if (blob) {
//                 const revisedUrl = URL.createObjectURL(blob)
//                 onSaveMask(revisedUrl)
//             }
//         }, "image/png")
//     }

//     const calculatedBrushDiameter = brushSize * displayScaleFactor

//     return (
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//             {/* Canvas Column */}
//             <Card className="overflow-hidden border-border bg-card shadow-sm lg:col-span-2">
//                 <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/20 p-3 sm:p-4">
//                     <CardTitle className="max-w-md truncate text-xs font-bold tracking-wide text-muted-foreground">
//                         {item.fileName}
//                     </CardTitle>
//                     <Badge variant={item.status === 'completed' ? 'default' : 'secondary'} className="uppercase">
//                         {item.status}
//                     </Badge>
//                 </CardHeader>
//                 <CardContent className="p-0">
//                     {/* Wrapper with touch-action-none to prevent page scroll/zoom */}
//                     <div className="relative flex w-full items-center justify-center min-h-[200px] bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] p-1 sm:p-2 select-none dark:bg-slate-950">
//                         <div className="group/canvas relative inline-block touch-action-none">
//                             {item.status === "completed" ? (
//                                 <canvas
//                                     ref={canvasRef}
//                                     onPointerDown={handlePointerDown}
//                                     onPointerMove={handlePointerMove}
//                                     onPointerUp={handlePointerUp}
//                                     onPointerLeave={handlePointerLeave}
//                                     // 🛡️ EXTRA SAFEGUARDS FOR MOBILE:
//                                     onTouchStart={handleTouchStart}
//                                     onTouchMove={handleTouchMove}
//                                     style={{ touchAction: "none" }} // Inline fallback for stubborn browsers
//                                     // Added border to clearly show image bounds
//                                     className="w-full h-auto max-w-full max-h-[500px] cursor-none rounded-xl shadow-md border-2 border-border/50 touch-action-none"
//                                 />
//                             ) : item.status === "error" ? (
//                                 <div className="flex max-w-sm flex-col items-center space-y-2 text-center text-rose-500 p-8">
//                                     <AlertCircle className="h-12 w-12" />
//                                     <p className="text-sm font-bold">Inference Error</p>
//                                     <p className="text-xs text-muted-foreground">{item.error}</p>
//                                 </div>
//                             ) : (
//                                 <div className="flex flex-col items-center space-y-4 p-8">
//                                     <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
//                                     <div className="text-center">
//                                         <p className="text-sm font-bold text-foreground">{item.message}</p>
//                                         <p className="mt-1 text-xs text-muted-foreground">Progress: {item.progress}%</p>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Cursor Overlay */}
//                             {cursorPos && item.status === "completed" && (
//                                 <div
//                                     className={cn(
//                                         "pointer-events-none absolute rounded-full border-2 transition-colors duration-75 shadow-[0_0_8px_rgba(0,0,0,0.2)]",
//                                         brushMode === "remove"
//                                             ? "border-destructive bg-destructive/30"
//                                             : "border-primary bg-primary/30"
//                                     )}
//                                     style={{
//                                         width: `${calculatedBrushDiameter}px`,
//                                         height: `${calculatedBrushDiameter}px`,
//                                         left: `${cursorPos.x}px`,
//                                         top: `${cursorPos.y}px`,
//                                         transform: "translate(-50%, -50%)",
//                                     }}
//                                 />
//                             )}
//                         </div>
//                     </div>
//                     <canvas ref={originalCanvasRef} className="hidden" />
//                 </CardContent>
//             </Card>

//             {/* Controls Column */}
//             <Card className="border-border bg-card shadow-sm">
//                 <CardContent className="p-4 sm:p-6 space-y-6">
//                     <div>
//                         <h3 className="mb-4 flex items-center gap-2 text-xs font-black tracking-wider text-muted-foreground uppercase">
//                             <Sliders className="h-4 w-4" /> Workspace Refinement Lab
//                         </h3>

//                         <div className="mb-5 grid grid-cols-2 gap-2">
//                             <Button
//                                 onClick={undo}
//                                 disabled={historyIndex <= 0}
//                                 variant="outline"
//                                 size="sm"
//                                 className="w-full"
//                             >
//                                 <Undo2 className="mr-1.5 h-4 w-4" /> Undo Step
//                             </Button>
//                             <Button
//                                 onClick={redo}
//                                 disabled={historyIndex >= history.length - 1}
//                                 variant="outline"
//                                 size="sm"
//                                 className="w-full"
//                             >
//                                 <Redo2 className="mr-1.5 h-4 w-4" /> Redo Step
//                             </Button>
//                         </div>

//                         <div className="mb-5 flex flex-col gap-1.5 rounded-2xl border border-border/50 bg-muted/30 p-1.5">
//                             <Button
//                                 onClick={() => setBrushMode("remove")}
//                                 variant={brushMode === "remove" ? "default" : "ghost"}
//                                 size="sm"
//                                 className="w-full justify-center"
//                             >
//                                 <Eraser className="mr-2 h-4 w-4" /> Eraser (Remove Layer)
//                             </Button>
//                             <Button
//                                 onClick={() => setBrushMode("restore")}
//                                 variant={brushMode === "restore" ? "default" : "ghost"}
//                                 size="sm"
//                                 className="w-full justify-center"
//                             >
//                                 <Brush className="mr-2 h-4 w-4" /> Restore (Reveal Original)
//                             </Button>
//                         </div>

//                         <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
//                             <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase">
//                                 <span className="text-muted-foreground">Brush Calibration</span>
//                                 <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
//                                     {brushSize}px
//                                 </span>
//                             </div>
//                             <Slider
//                                 value={[brushSize]}
//                                 onValueChange={(val) => setBrushSize(val[0])}
//                                 min={2}
//                                 max={250}
//                                 step={1}
//                                 className="py-1"
//                             />
//                             <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
//                                 <span>2px</span>
//                                 <span>125px</span>
//                                 <span>250px</span>
//                             </div>
//                         </div>
//                     </div>

//                     <Separator />

//                     {item.status === "completed" && item.resultUrl && (
//                         <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-600/20">
//                             <a
//                                 href={item.resultUrl}
//                                 download={`matte_${item.fileName.replace(/\.[^/.]+$/, "")}.png`}
//                             >
//                                 <Download className="mr-2 h-4 w-4" /> Download Production Asset
//                             </a>
//                         </Button>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     )
// }

// components/BackgroundRemover.tsx
"use client"

import {
    ChangeEvent,
    DragEvent,
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react"
import {
    useBackgroundRemover,
    ProcessedItem,
} from "../../../hooks/useBackgroundRemover"
import {
    Upload,
    Download,
    RefreshCw,
    Layers,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2,
    Sliders,
    Undo2,
    Redo2,
    Brush,
    Eraser,
    ArrowLeft,
    Package,
} from "lucide-react"

// shadcn imports
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Simple debounce helper (no lodash dependency)
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timer: NodeJS.Timeout | null = null
    return (...args: Parameters<T>) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

export default function BackgroundRemover() {
    const {
        queue,
        removeBackground,
        isProcessing,
        resetState,
        removeSingleFile,
        updateItemResultUrl,
        engine,
        downloadAllCompleted,
    } = useBackgroundRemover()

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            removeBackground(e.target.files)
        }
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault()

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            removeBackground(e.dataTransfer.files)
        }
    }

    const totalItems = queue.length
    const completedItems = queue.filter((i) => i.status === "completed").length
    const macroProgress =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    const isSingleView = totalItems === 1
    const activeItem = isSingleView
        ? queue[0]
        : queue.find((item) => item.id === selectedItemId)

    useEffect(() => {
        if (
            selectedItemId &&
            !queue.some((item) => item.id === selectedItemId)
        ) {
            setSelectedItemId(null)
        }
    }, [queue, selectedItemId])

    return (
        <div className="mx-auto w-full max-w-7xl bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 transition-colors duration-200 selection:bg-indigo-500/30 sm:p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
                <div className="flex items-center space-x-4">
                    <div className="rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-3 text-white shadow-lg shadow-indigo-500/20">
                        <Layers className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                            Neural Isolation Studio
                        </h1>
                        <p className="text-xs font-semibold text-muted-foreground">
                            Hardware accelerated client-side background eraser
                            layer.
                        </p>
                    </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    {engine.device && (
                        <Badge
                            variant={
                                engine.device === "webgpu"
                                    ? "default"
                                    : "secondary"
                            }
                            className="whitespace-nowrap"
                        >
                            {engine.device === "webgpu"
                                ? "⚡ WebGPU"
                                : "🧠 WASM"}
                        </Badge>
                    )}
                    {totalItems > 0 && (
                        <>
                            <Button
                                asChild
                                variant="default"
                                size="sm"
                                className="flex-1 sm:flex-none"
                            >
                                <label
                                    htmlFor="upload-more"
                                    className="cursor-pointer"
                                >
                                    Upload More Files
                                </label>
                            </Button>
                            <Input
                                id="upload-more"
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {completedItems > 0 && (
                                <Button
                                    onClick={downloadAllCompleted}
                                    size="sm"
                                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 sm:flex-none"
                                >
                                    <Package className="mr-1.5 h-4 w-4" />{" "}
                                    Download All ({completedItems})
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    resetState()
                                    setSelectedItemId(null)
                                }}
                                variant="destructive"
                                size="sm"
                                className="flex-1 sm:flex-none"
                            >
                                Reset
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Engine loading bar */}
            {engine.loading && (
                <Card className="mb-6 border-border bg-card shadow-sm">
                    <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-muted-foreground uppercase">
                                <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                                Downloading AI Model
                            </span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                {Math.round(engine.progress)}%
                            </span>
                        </div>
                        <Progress
                            value={engine.progress}
                            className="w-full [&>div]:bg-gradient-to-r [&>div]:from-indigo-600 [&>div]:to-violet-600"
                        />
                    </CardContent>
                </Card>
            )}

            {/* Dropzone */}
            {totalItems === 0 && (
                <Card
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border bg-card p-6 text-center shadow-sm transition-all hover:border-indigo-500 sm:min-h-[450px] sm:p-12"
                >
                    <CardContent className="flex flex-col items-center">
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            onChange={handleFileChange}
                        />
                        <div className="mb-4 rounded-2xl border border-border bg-muted p-5 shadow-inner transition-transform group-hover:scale-110">
                            <Upload className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                            Drop your production images here
                        </h3>
                        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                            Process a single high-definition photo or a massive
                            batch simultaneously through localized execution
                            layers.
                        </p>
                    </CardContent>
                </Card>
            )}

            {totalItems > 0 && (
                <div className="space-y-6">
                    {/* Global queue progress */}
                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-muted-foreground uppercase">
                                    {isProcessing ? (
                                        <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    )}
                                    Pipeline: {completedItems} / {totalItems}{" "}
                                    Completed
                                </span>
                                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                    {macroProgress}%
                                </span>
                            </div>
                            <Progress
                                value={macroProgress}
                                className="w-full [&>div]:bg-gradient-to-r [&>div]:from-indigo-600 [&>div]:to-violet-600"
                            />
                        </CardContent>
                    </Card>

                    {activeItem ? (
                        <div className="space-y-4">
                            {!isSingleView && (
                                <Button
                                    onClick={() => setSelectedItemId(null)}
                                    variant="outline"
                                    size="sm"
                                    className="group"
                                >
                                    <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                    Return to Batch Gallery
                                </Button>
                            )}
                            <InteractiveCanvasEditor
                                item={activeItem}
                                onSaveMask={(newUrl) => {
                                    if (activeItem.resultUrl)
                                        URL.revokeObjectURL(
                                            activeItem.resultUrl
                                        )
                                    updateItemResultUrl(activeItem.id, newUrl)
                                }}
                            />
                        </div>
                    ) : (
                        /* Batch gallery grid */
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {queue.map((item) => (
                                <Card
                                    key={item.id}
                                    className={cn(
                                        "overflow-hidden border-border bg-card shadow-sm transition-all",
                                        (item.status === "loading" ||
                                            item.status === "processing" ||
                                            item.status === "downloading") &&
                                            "border-indigo-500 shadow-md ring-2 ring-indigo-600/10"
                                    )}
                                >
                                    <div className="relative aspect-square border-b border-border bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0] p-3 dark:bg-slate-950">
                                        {item.status === "completed" &&
                                        item.resultUrl ? (
                                            <img
                                                src={item.resultUrl}
                                                alt={item.fileName}
                                                className="max-h-full max-w-full rounded-lg object-scale-down shadow-sm"
                                            />
                                        ) : item.status === "error" ? (
                                            <div className="flex flex-col items-center space-y-1 p-4 text-center text-rose-500">
                                                <AlertCircle className="h-7 w-7" />
                                                <span className="text-xs font-black tracking-wider uppercase">
                                                    Failed
                                                </span>
                                            </div>
                                        ) : item.status === "queued" ? (
                                            <Badge
                                                variant="outline"
                                                className="mx-auto"
                                            >
                                                Queued
                                            </Badge>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-2 text-indigo-600 dark:text-indigo-400">
                                                <Loader2 className="h-7 w-7 animate-spin" />
                                                <span className="animate-pulse text-[10px] font-black tracking-widest uppercase">
                                                    Processing...
                                                </span>
                                            </div>
                                        )}

                                        {(item.status === "processing" ||
                                            item.status === "loading") && (
                                            <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded-lg border border-border bg-background/95 px-2 py-1 text-[9px] font-bold text-foreground shadow-sm backdrop-blur-sm">
                                                <span className="max-w-[100px] truncate">
                                                    {item.message}
                                                </span>
                                                <span className="font-black text-indigo-600">
                                                    {item.progress}%
                                                </span>
                                            </div>
                                        )}

                                        <Button
                                            onClick={() =>
                                                removeSingleFile(item.id)
                                            }
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-1 items-center justify-between gap-2 bg-muted/30 p-3.5">
                                        <div className="min-w-0 flex-1 truncate">
                                            <p
                                                className="truncate text-xs font-bold text-foreground"
                                                title={item.fileName}
                                            >
                                                {item.fileName}
                                            </p>
                                            <p className="mt-0.5 text-[9px] font-extrabold tracking-widest text-muted-foreground uppercase">
                                                {item.status === "completed"
                                                    ? "Isolated Matte"
                                                    : item.status}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {item.status === "completed" && (
                                                <Button
                                                    onClick={() =>
                                                        setSelectedItemId(
                                                            item.id
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    title="Refine Asset Matte"
                                                >
                                                    <Sliders className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                            {item.status === "completed" &&
                                                item.resultUrl && (
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7 text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        <a
                                                            href={
                                                                item.resultUrl
                                                            }
                                                            download={`matte_${item.fileName.replace(/\.[^/.]+$/, "")}.png`}
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                        </a>
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ============ InteractiveCanvasEditor – Blob‑Based History ============ */
interface EditorProps {
    item: ProcessedItem
    onSaveMask: (newUrl: string) => void
}

function InteractiveCanvasEditor({ item, onSaveMask }: EditorProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const originalCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const initializedIdRef = useRef<string | null>(null)

    const [brushMode, setBrushMode] = useState<"remove" | "restore">("remove")
    const [brushSize, setBrushSize] = useState<number>(40)
    const [isDrawing, setIsDrawing] = useState(false)
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
        null
    )
    const [displayScaleFactor, setDisplayScaleFactor] = useState<number>(1)

    // History stored as blob URLs (PNG compressed)
    const [history, setHistory] = useState<string[]>([])
    const [historyIndex, setHistoryIndex] = useState<number>(-1)
    const MAX_HISTORY = 50 // safe with blob compression

    const isLoaded =
        item.status === "completed" && item.resultUrl && item.originalUrl

    // Debounced save to avoid heavy PNG encoding on every stroke
    const saveMaskDebounced = useRef(
        debounce((canvas: HTMLCanvasElement) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    onSaveMask(URL.createObjectURL(blob))
                }
            }, "image/png")
        }, 300)
    )

    // Cleanup debounce and blob URLs on unmount
    useEffect(() => {
        return () => {
            saveMaskDebounced.current.cancel?.()
            history.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [history])

    // 🟢 Moved BEFORE the image-loading useEffect
    const recalculateDisplayScale = useCallback(() => {
        const canvas = canvasRef.current
        if (canvas) {
            const rect = canvas.getBoundingClientRect()
            setDisplayScaleFactor(rect.width / canvas.width)
        }
    }, [])

    // Throttle drawing with requestAnimationFrame
    const drawRAF = useRef<number | null>(null)

    // --- Load images and initialise canvas ---
    useEffect(() => {
        if (!isLoaded) return
        if (initializedIdRef.current === item.id) return

        const mainCanvas = canvasRef.current
        const origCanvas = originalCanvasRef.current
        if (!mainCanvas || !origCanvas) return

        const ctx = mainCanvas.getContext("2d")
        const oCtx = origCanvas.getContext("2d")
        if (!ctx || !oCtx) return

        const baseImg = new Image()
        const origImg = new Image()

        let assetsLoaded = 0
        const onAssetLoad = () => {
            assetsLoaded++
            if (assetsLoaded === 2) {
                mainCanvas.width = baseImg.naturalWidth
                mainCanvas.height = baseImg.naturalHeight
                origCanvas.width = baseImg.naturalWidth
                origCanvas.height = baseImg.naturalHeight

                ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
                ctx.drawImage(baseImg, 0, 0)

                oCtx.clearRect(0, 0, origCanvas.width, origCanvas.height)
                oCtx.drawImage(origImg, 0, 0)

                // Save initial state as a compressed blob URL
                mainCanvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob)
                        setHistory([url])
                        setHistoryIndex(0)
                    }
                }, "image/png")

                initializedIdRef.current = item.id
                recalculateDisplayScale() // ✅ now defined
            }
        }

        baseImg.crossOrigin = "anonymous"
        origImg.crossOrigin = "anonymous"
        baseImg.src = item.resultUrl!
        origImg.src = item.originalUrl!

        baseImg.onload = onAssetLoad
        origImg.onload = onAssetLoad
    }, [
        isLoaded,
        item.id,
        item.resultUrl,
        item.originalUrl,
        recalculateDisplayScale,
    ])

    // Cleanup resize listener
    useEffect(() => {
        window.addEventListener("resize", recalculateDisplayScale)
        return () =>
            window.removeEventListener("resize", recalculateDisplayScale)
    }, [recalculateDisplayScale])

    // ---- Drawing logic ----
    const draw = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current
            const ctx = canvas?.getContext("2d")
            const oCanvas = originalCanvasRef.current
            if (!canvas || !ctx || !oCanvas) return

            const rect = canvas.getBoundingClientRect()
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height
            const x = (e.clientX - rect.left) * scaleX
            const y = (e.clientY - rect.top) * scaleY

            if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) return

            ctx.save()
            ctx.lineCap = "round"
            ctx.lineJoin = "round"
            ctx.lineWidth = brushSize

            if (brushMode === "remove") {
                ctx.globalCompositeOperation = "destination-out"
                ctx.beginPath()
                ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
                ctx.fill()
            } else {
                ctx.globalCompositeOperation = "source-over"
                ctx.beginPath()
                ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
                ctx.clip()
                ctx.drawImage(oCanvas, 0, 0)
            }
            ctx.restore()
        },
        [brushMode, brushSize]
    )

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            if (!isLoaded || historyIndex === -1) return
            e.preventDefault()
            e.currentTarget.setPointerCapture(e.pointerId)
            setIsDrawing(true)
            draw(e)
        },
        [isLoaded, historyIndex, draw]
    )

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })

            if (!isDrawing) return
            if (drawRAF.current !== null) return // skip if already queued

            drawRAF.current = requestAnimationFrame(() => {
                draw(e)
                drawRAF.current = null
            })
        },
        [isDrawing, draw]
    )

    const handlePointerUp = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            e.currentTarget.releasePointerCapture(e.pointerId)
            if (!isDrawing) return
            setIsDrawing(false)

            const canvas = canvasRef.current
            if (!canvas) return

            // Capture current canvas as compressed PNG blob and add to history
            canvas.toBlob((blob) => {
                if (!blob) return
                const url = URL.createObjectURL(blob)

                setHistory((prev) => {
                    // Slice up to current index + 1, then append new state
                    let updated = [...prev.slice(0, historyIndex + 1), url]
                    if (updated.length > MAX_HISTORY) {
                        // Revoke oldest URL before discarding
                        URL.revokeObjectURL(updated[0])
                        updated = updated.slice(1)
                        setHistoryIndex((prevIdx) => Math.max(0, prevIdx - 1))
                    } else {
                        setHistoryIndex(updated.length - 1)
                    }
                    return updated
                })

                // Also update the parent via debounced save
                saveMaskDebounced.current(canvas)
            }, "image/png")
        },
        [isDrawing, historyIndex, saveMaskDebounced]
    )

    const handlePointerLeave = useCallback(() => {
        setCursorPos(null)
    }, [])

    // ---- Undo / Redo ----
    const applyHistoryState = useCallback(
        (index: number) => {
            const canvas = canvasRef.current
            const ctx = canvas?.getContext("2d")
            if (!canvas || !ctx) return

            const url = history[index]
            if (!url) return

            const img = new Image()
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)

                // Sync the parent with the restored state
                canvas.toBlob((blob) => {
                    if (blob) {
                        const revisedUrl = URL.createObjectURL(blob)
                        onSaveMask(revisedUrl)
                    }
                }, "image/png")
            }
            img.src = url
        },
        [history, onSaveMask]
    )

    const undo = useCallback(() => {
        if (historyIndex <= 0) return
        const nextIdx = historyIndex - 1
        setHistoryIndex(nextIdx)
        applyHistoryState(nextIdx)
    }, [historyIndex, applyHistoryState])

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return
        const nextIdx = historyIndex + 1
        setHistoryIndex(nextIdx)
        applyHistoryState(nextIdx)
    }, [historyIndex, history.length, applyHistoryState])

    const calculatedBrushDiameter = brushSize * displayScaleFactor

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Canvas Column */}
            <Card className="overflow-hidden border-border bg-card shadow-sm lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/20 p-3 sm:p-4">
                    <CardTitle className="max-w-md truncate text-xs font-bold tracking-wide text-muted-foreground">
                        {item.fileName}
                    </CardTitle>
                    <Badge
                        variant={
                            item.status === "completed"
                                ? "default"
                                : "secondary"
                        }
                        className="uppercase"
                    >
                        {item.status}
                    </Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative flex min-h-[200px] w-full items-center justify-center bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] p-1 select-none sm:p-2 dark:bg-slate-950">
                        <div className="group/canvas touch-action-none relative inline-block">
                            {item.status === "completed" ? (
                                <canvas
                                    ref={canvasRef}
                                    onPointerDown={handlePointerDown}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerLeave={handlePointerLeave}
                                    style={{ touchAction: "none" }}
                                    className="touch-action-none h-auto max-h-[500px] w-full max-w-full cursor-none rounded-xl border-2 border-border/50 shadow-md"
                                />
                            ) : item.status === "error" ? (
                                <div className="flex max-w-sm flex-col items-center space-y-2 p-8 text-center text-rose-500">
                                    <AlertCircle className="h-12 w-12" />
                                    <p className="text-sm font-bold">
                                        Inference Error
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.error}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-4 p-8">
                                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-foreground">
                                            {item.message}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Progress: {item.progress}%
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Cursor Overlay */}
                            {cursorPos && item.status === "completed" && (
                                <div
                                    className={cn(
                                        "pointer-events-none absolute rounded-full border-2 shadow-[0_0_8px_rgba(0,0,0,0.2)] transition-colors duration-75",
                                        brushMode === "remove"
                                            ? "border-destructive bg-destructive/30"
                                            : "border-primary bg-primary/30"
                                    )}
                                    style={{
                                        width: `${calculatedBrushDiameter}px`,
                                        height: `${calculatedBrushDiameter}px`,
                                        left: `${cursorPos.x}px`,
                                        top: `${cursorPos.y}px`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <canvas ref={originalCanvasRef} className="hidden" />
                </CardContent>
            </Card>

            {/* Controls Column */}
            <Card className="border-border bg-card shadow-sm">
                <CardContent className="space-y-6 p-4 sm:p-6">
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-black tracking-wider text-muted-foreground uppercase">
                            <Sliders className="h-4 w-4" /> Workspace Refinement
                            Lab
                        </h3>

                        <div className="mb-5 grid grid-cols-2 gap-2">
                            <Button
                                onClick={undo}
                                disabled={historyIndex <= 0}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <Undo2 className="mr-1.5 h-4 w-4" /> Undo Step
                            </Button>
                            <Button
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <Redo2 className="mr-1.5 h-4 w-4" /> Redo Step
                            </Button>
                        </div>

                        <div className="mb-5 flex flex-col gap-1.5 rounded-2xl border border-border/50 bg-muted/30 p-1.5">
                            <Button
                                onClick={() => setBrushMode("remove")}
                                variant={
                                    brushMode === "remove" ? "default" : "ghost"
                                }
                                size="sm"
                                className="w-full justify-center"
                            >
                                <Eraser className="mr-2 h-4 w-4" /> Eraser
                                (Remove Layer)
                            </Button>
                            <Button
                                onClick={() => setBrushMode("restore")}
                                variant={
                                    brushMode === "restore"
                                        ? "default"
                                        : "ghost"
                                }
                                size="sm"
                                className="w-full justify-center"
                            >
                                <Brush className="mr-2 h-4 w-4" /> Restore
                                (Reveal Original)
                            </Button>
                        </div>

                        <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
                            <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase">
                                <span className="text-muted-foreground">
                                    Brush Calibration
                                </span>
                                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                    {brushSize}px
                                </span>
                            </div>
                            <Slider
                                value={[brushSize]}
                                onValueChange={(val) => setBrushSize(val[0])}
                                min={2}
                                max={500}
                                step={1}
                                className="py-1"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                <span>2px</span>
                                <span>250px</span>
                                <span>500px</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {item.status === "completed" && item.resultUrl && (
                        <Button
                            asChild
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-violet-700"
                        >
                            <a
                                href={item.resultUrl}
                                download={`matte_${item.fileName.replace(/\.[^/.]+$/, "")}.png`}
                            >
                                <Download className="mr-2 h-4 w-4" /> Download
                                Production Asset
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
