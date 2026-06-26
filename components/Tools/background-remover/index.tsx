"use client"

import {
    ChangeEvent,
    KeyboardEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import {
    Brush,
    CheckCircle2,
    Download,
    Eraser,
    ImagePlus,
    Layers,
    Loader2,
    Package,
    RefreshCcw,
    RotateCcw,
    RotateCw,
    SlidersHorizontal,
    Trash2,
    Upload,
    ZoomIn,
    ZoomOut,
} from "lucide-react"

import {
    ProcessedItem,
    useBackgroundRemover,
} from "@/hooks/useBackgroundRemover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { BackgroundEditorEngine, EditorTool } from "./editor-engine"

type PointerMode = "brush" | "pan"

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
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const completed = queue.filter((item) => item.status === "completed")
    const selected = useMemo(
        () =>
            completed.find((item) => item.id === selectedId) ??
            completed[0] ??
            null,
        [completed, selectedId]
    )
    const totalProgress = queue.length
        ? Math.round((completed.length / queue.length) * 100)
        : 0

    const handleFiles = (files: FileList | File[]) => {
        removeBackground(files)
    }

    return (
        <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 overflow-hidden bg-slate-50 p-3 text-slate-950 sm:p-4 lg:min-h-[760px] dark:bg-slate-950 dark:text-slate-50">
            <StudioHeader
                count={queue.length}
                completedCount={completed.length}
                isProcessing={isProcessing}
                engineDevice={engine.device}
                onFiles={handleFiles}
                onDownloadAll={downloadAllCompleted}
                onReset={() => {
                    resetState()
                    setSelectedId(null)
                }}
            />

            {engine.loading ? (
                <Card className="border-indigo-200 bg-indigo-50/80 dark:border-indigo-900 dark:bg-indigo-950/40">
                    <CardContent className="space-y-2 p-4">
                        <div className="flex items-center justify-between text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <Loader2 className="size-4 animate-spin" />{" "}
                                Preparing AI engine
                            </span>
                            <span>{Math.round(engine.progress)}%</span>
                        </div>
                        <Progress value={engine.progress} />
                    </CardContent>
                </Card>
            ) : null}

            {queue.length === 0 ? (
                <UploadStage onFiles={handleFiles} />
            ) : (
                <div className="grid min-h-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <QueuePanel
                        items={queue}
                        selectedId={selected?.id ?? null}
                        totalProgress={totalProgress}
                        onSelect={setSelectedId}
                        onRemove={removeSingleFile}
                        onFiles={handleFiles}
                    />
                    {selected ? (
                        <EditorWorkspace
                            item={selected}
                            onSave={(url) =>
                                updateItemResultUrl(selected.id, url)
                            }
                        />
                    ) : (
                        <EmptyEditor isProcessing={isProcessing} />
                    )}
                </div>
            )}
        </section>
    )
}

function StudioHeader({
    count,
    completedCount,
    isProcessing,
    engineDevice,
    onFiles,
    onDownloadAll,
    onReset,
}: {
    count: number
    completedCount: number
    isProcessing: boolean
    engineDevice: "webgpu" | "wasm" | null
    onFiles: (files: FileList | File[]) => void
    onDownloadAll: () => void
    onReset: () => void
}) {
    return (
        <div className="flex flex-col gap-3 rounded-3xl border bg-white/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:bg-slate-900/80">
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-3 text-white shadow-lg shadow-indigo-600/20">
                    <Layers className="size-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                        Background Remover Studio
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Upload → AI Processing → Queue → Gallery → Editor →
                        Download
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {engineDevice ? (
                    <Badge variant="secondary">
                        {engineDevice === "webgpu" ? "WebGPU" : "WASM"}
                    </Badge>
                ) : null}
                {isProcessing ? (
                    <Badge>Processing</Badge>
                ) : count > 0 ? (
                    <Badge variant="secondary">
                        {completedCount}/{count} ready
                    </Badge>
                ) : null}
                <UploadButton
                    id="studio-upload"
                    onFiles={onFiles}
                    label={count ? "Add images" : "Upload images"}
                />
                {completedCount > 0 ? (
                    <Button onClick={onDownloadAll}>
                        <Package className="size-4" /> Download all
                    </Button>
                ) : null}
                {count > 0 ? (
                    <Button variant="destructive" onClick={onReset}>
                        <Trash2 className="size-4" /> Reset
                    </Button>
                ) : null}
            </div>
        </div>
    )
}

function UploadStage({
    onFiles,
}: {
    onFiles: (files: FileList | File[]) => void
}) {
    const [active, setActive] = useState(false)
    return (
        <Card
            onDragOver={(event) => {
                event.preventDefault()
                setActive(true)
            }}
            onDragLeave={() => setActive(false)}
            onDrop={(event) => {
                event.preventDefault()
                setActive(false)
                onFiles(event.dataTransfer.files)
            }}
            className={cn(
                "relative min-h-[520px] border-2 border-dashed bg-white/90 transition dark:bg-slate-900/70",
                active && "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
            )}
        >
            <CardContent className="flex min-h-[520px] flex-col items-center justify-center gap-6 p-6 text-center">
                <Input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 h-full opacity-0"
                    onChange={(event) =>
                        event.target.files && onFiles(event.target.files)
                    }
                />
                <div className="rounded-[2rem] bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-6 text-white shadow-2xl shadow-indigo-600/20">
                    <Upload className="size-12" />
                </div>
                <div className="max-w-xl space-y-3">
                    <h3 className="text-3xl font-black tracking-tight">
                        Create clean transparent cutouts in batches.
                    </h3>
                    <p className="text-base text-muted-foreground">
                        Drop product shots, portraits, or design assets.
                        Processing runs locally, then each image opens in a
                        touch-first editor with erase and restore brushes.
                    </p>
                </div>
                <Button size="lg" className="min-h-12">
                    <ImagePlus className="size-5" /> Choose images
                </Button>
            </CardContent>
        </Card>
    )
}

function QueuePanel({
    items,
    selectedId,
    totalProgress,
    onSelect,
    onRemove,
    onFiles,
}: {
    items: ProcessedItem[]
    selectedId: string | null
    totalProgress: number
    onSelect: (id: string) => void
    onRemove: (id: string) => void
    onFiles: (files: FileList | File[]) => void
}) {
    return (
        <aside className="flex min-h-0 flex-col gap-3 rounded-3xl border bg-white p-3 shadow-sm lg:max-h-[680px] dark:bg-slate-900">
            <div className="space-y-2 p-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Batch queue</span>
                    <span>{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} />
            </div>
            <UploadButton
                id="queue-upload"
                onFiles={onFiles}
                label="Upload more"
                className="w-full"
            />
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                            item.status === "completed" && onSelect(item.id)
                        }
                        className={cn(
                            "w-full rounded-2xl border p-2 text-left transition hover:bg-muted/70",
                            item.id === selectedId &&
                                "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                        )}
                    >
                        <div className="flex gap-3">
                            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]">
                                {item.resultUrl ? (
                                    // Object URLs from local processing should not go through next/image.
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.resultUrl}
                                        alt=""
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="truncate text-sm font-semibold">
                                    {item.fileName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {item.message}
                                </div>
                                {item.status !== "completed" ? (
                                    <Progress value={item.progress} />
                                ) : (
                                    <Badge variant="secondary">
                                        <CheckCircle2 className="size-3" />{" "}
                                        Ready
                                    </Badge>
                                )}
                            </div>
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onRemove(item.id)
                                }}
                                onKeyDown={(
                                    event: KeyboardEvent<HTMLSpanElement>
                                ) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    )
                                        onRemove(item.id)
                                }}
                                className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                                <Trash2 className="size-4" />
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </aside>
    )
}

function EditorWorkspace({
    item,
    onSave,
}: {
    item: ProcessedItem
    onSave: (url: string) => void
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const engineRef = useRef<BackgroundEditorEngine | null>(null)
    const [tool, setTool] = useState<EditorTool>("erase")
    const [brushSize, setBrushSize] = useState(44)
    const [pointerMode, setPointerMode] = useState<PointerMode>("brush")
    const [history, setHistory] = useState({ canUndo: false, canRedo: false })
    const [drawerOpen, setDrawerOpen] = useState(false)
    const activeInteractionRef = useRef<PointerMode | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !item.originalUrl || !item.resultUrl) return
        const engine = new BackgroundEditorEngine(canvas)
        engineRef.current = engine
        engine.setHistoryListener((canUndo, canRedo) =>
            setHistory({ canUndo, canRedo })
        )
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (!entry) return
            engine.resize(entry.contentRect.width, entry.contentRect.height)
        })
        observer.observe(canvas)
        void engine.load(item.originalUrl, item.resultUrl)
        return () => {
            observer.disconnect()
            engine.destroy()
            engineRef.current = null
        }
    }, [item.id, item.originalUrl, item.resultUrl])

    useEffect(() => {
        engineRef.current?.setBrush({ size: brushSize, tool })
    }, [brushSize, tool])

    useEffect(() => {
        const handler = (event: globalThis.KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === "z"
            ) {
                event.preventDefault()
                if (event.shiftKey) engineRef.current?.redo()
                else engineRef.current?.undo()
            }
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === "y"
            ) {
                event.preventDefault()
                engineRef.current?.redo()
            }
            if (event.key.toLowerCase() === "e") setTool("erase")
            if (event.key.toLowerCase() === "r") setTool("restore")
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    const canvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    const download = async () => {
        const blob = await engineRef.current?.exportPng()
        if (!blob) return
        const url = URL.createObjectURL(blob)
        onSave(url)
        const link = document.createElement("a")
        link.href = url
        link.download = `cutout_${item.fileName.replace(/\.[^/.]+$/, "")}.png`
        link.click()
    }

    const controls = (
        <EditorControls
            tool={tool}
            brushSize={brushSize}
            pointerMode={pointerMode}
            history={history}
            onTool={setTool}
            onBrushSize={setBrushSize}
            onPointerMode={setPointerMode}
            onUndo={() => engineRef.current?.undo()}
            onRedo={() => engineRef.current?.redo()}
            onReset={() => engineRef.current?.reset()}
            onFit={() => engineRef.current?.fitToScreen()}
            onZoomIn={() => engineRef.current?.stepZoom("in")}
            onZoomOut={() => engineRef.current?.stepZoom("out")}
            onDownload={download}
        />
    )

    return (
        <main className="grid min-h-[620px] gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="relative overflow-hidden rounded-3xl border bg-slate-200 shadow-inner dark:bg-slate-900">
                <div className="absolute top-3 left-3 z-10 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow">
                    {item.fileName}
                </div>
                <div className="absolute top-3 right-3 z-10 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow">
                    {pointerMode === "pan"
                        ? "Pan mode"
                        : `${tool} · ${brushSize}px`}
                </div>
                <canvas
                    ref={canvasRef}
                    className={cn(
                        "h-[calc(100vh-220px)] min-h-[460px] w-full touch-none lg:h-full",
                        pointerMode === "pan"
                            ? "cursor-grab active:cursor-grabbing"
                            : "cursor-crosshair"
                    )}
                    onWheel={(event) => {
                        event.preventDefault()
                        const rect = event.currentTarget.getBoundingClientRect()
                        engineRef.current?.zoomBy(event.deltaY, {
                            x: event.clientX - rect.left,
                            y: event.clientY - rect.top,
                        })
                    }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId)
                        const point = canvasPoint(event)
                        const mode =
                            pointerMode === "pan" ||
                            event.button === 1 ||
                            event.altKey
                                ? "pan"
                                : "brush"
                        activeInteractionRef.current = mode
                        if (mode === "pan") engineRef.current?.startPan(point)
                        else engineRef.current?.startBrush(point)
                    }}
                    onPointerMove={(event) => {
                        const point = canvasPoint(event)
                        if (activeInteractionRef.current === "brush") {
                            engineRef.current?.moveBrush(point)
                        }
                        if (activeInteractionRef.current === "pan") {
                            engineRef.current?.movePan(point)
                        }
                    }}
                    onPointerUp={(event) => {
                        event.currentTarget.releasePointerCapture(
                            event.pointerId
                        )
                        if (activeInteractionRef.current === "brush") {
                            engineRef.current?.endBrush()
                        }
                        if (activeInteractionRef.current === "pan") {
                            engineRef.current?.endPan()
                        }
                        activeInteractionRef.current = null
                    }}
                    onPointerCancel={() => {
                        engineRef.current?.endBrush()
                        engineRef.current?.endPan()
                        activeInteractionRef.current = null
                    }}
                />
                <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-2 rounded-2xl border bg-background/95 p-2 shadow-xl lg:hidden">
                    <Button
                        variant={tool === "erase" ? "default" : "secondary"}
                        onClick={() => setTool("erase")}
                    >
                        <Eraser className="size-4" /> Erase
                    </Button>
                    <Button
                        variant={tool === "restore" ? "default" : "secondary"}
                        onClick={() => setTool("restore")}
                    >
                        <Brush className="size-4" /> Restore
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setDrawerOpen(true)}
                    >
                        <SlidersHorizontal className="size-4" /> More
                    </Button>
                    <Button onClick={download}>
                        <Download className="size-4" />
                    </Button>
                </div>
            </div>
            <aside className="hidden rounded-3xl border bg-white p-3 shadow-sm lg:block dark:bg-slate-900">
                {controls}
            </aside>
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent side="bottom" className="rounded-t-3xl">
                    <SheetHeader>
                        <SheetTitle>Editor controls</SheetTitle>
                    </SheetHeader>
                    <div className="p-4 pt-0">{controls}</div>
                </SheetContent>
            </Sheet>
        </main>
    )
}

function EditorControls(props: {
    tool: EditorTool
    brushSize: number
    pointerMode: PointerMode
    history: { canUndo: boolean; canRedo: boolean }
    onTool: (tool: EditorTool) => void
    onBrushSize: (size: number) => void
    onPointerMode: (mode: PointerMode) => void
    onUndo: () => void
    onRedo: () => void
    onReset: () => void
    onFit: () => void
    onZoomIn: () => void
    onZoomOut: () => void
    onDownload: () => void
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant={props.tool === "erase" ? "default" : "secondary"}
                    onClick={() => props.onTool("erase")}
                >
                    <Eraser className="size-4" /> Erase
                </Button>
                <Button
                    variant={props.tool === "restore" ? "default" : "secondary"}
                    onClick={() => props.onTool("restore")}
                >
                    <Brush className="size-4" /> Restore
                </Button>
            </div>
            <div className="space-y-3 rounded-2xl bg-muted/60 p-3">
                <div className="flex items-center justify-between text-sm font-medium">
                    <span>Brush size</span>
                    <span>{props.brushSize}px</span>
                </div>
                <Slider
                    value={[props.brushSize]}
                    min={8}
                    max={160}
                    step={2}
                    onValueChange={(values) =>
                        props.onBrushSize(values[0] ?? props.brushSize)
                    }
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant={
                        props.pointerMode === "brush" ? "default" : "secondary"
                    }
                    onClick={() => props.onPointerMode("brush")}
                >
                    Brush
                </Button>
                <Button
                    variant={
                        props.pointerMode === "pan" ? "default" : "secondary"
                    }
                    onClick={() => props.onPointerMode("pan")}
                >
                    Pan
                </Button>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant="secondary"
                    disabled={!props.history.canUndo}
                    onClick={props.onUndo}
                >
                    <RotateCcw className="size-4" /> Undo
                </Button>
                <Button
                    variant="secondary"
                    disabled={!props.history.canRedo}
                    onClick={props.onRedo}
                >
                    <RotateCw className="size-4" /> Redo
                </Button>
                <Button variant="secondary" onClick={props.onZoomOut}>
                    <ZoomOut className="size-4" /> Zoom
                </Button>
                <Button variant="secondary" onClick={props.onZoomIn}>
                    <ZoomIn className="size-4" /> Zoom
                </Button>
                <Button variant="secondary" onClick={props.onFit}>
                    Fit
                </Button>
                <Button variant="secondary" onClick={props.onReset}>
                    <RefreshCcw className="size-4" /> Reset
                </Button>
            </div>
            <Button className="w-full" size="lg" onClick={props.onDownload}>
                <Download className="size-4" /> Download PNG
            </Button>
            <p className="text-xs text-muted-foreground">
                Desktop shortcuts: E erase, R restore, Ctrl/⌘+Z undo,
                Shift+Ctrl/⌘+Z redo. Wheel zoom is damped; choose Pan mode or
                hold Alt while dragging to move the image.
            </p>
        </div>
    )
}

function EmptyEditor({ isProcessing }: { isProcessing: boolean }) {
    return (
        <div className="grid min-h-[520px] place-items-center rounded-3xl border bg-white p-8 text-center shadow-sm dark:bg-slate-900">
            <div className="max-w-sm space-y-3">
                {isProcessing ? (
                    <Loader2 className="mx-auto size-8 animate-spin text-indigo-600" />
                ) : (
                    <CheckCircle2 className="mx-auto size-8 text-emerald-600" />
                )}
                <h3 className="text-xl font-bold">
                    {isProcessing
                        ? "AI is preparing your gallery"
                        : "Select a completed image"}
                </h3>
                <p className="text-sm text-muted-foreground">
                    Completed images appear in the queue. Pick one to open the
                    editor and refine the cutout.
                </p>
            </div>
        </div>
    )
}

function UploadButton({
    id,
    label,
    onFiles,
    className,
}: {
    id: string
    label: string
    onFiles: (files: FileList | File[]) => void
    className?: string
}) {
    return (
        <Button asChild variant="secondary" className={className}>
            <label htmlFor={id} className="cursor-pointer">
                <ImagePlus className="size-4" /> {label}
                <Input
                    id={id}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        event.target.files && onFiles(event.target.files)
                    }
                />
            </label>
        </Button>
    )
}
