export type EditorTool = "erase" | "restore"

export interface BrushSettings {
    size: number
    tool: EditorTool
}

export interface ViewState {
    zoom: number
    offsetX: number
    offsetY: number
}

interface Point {
    x: number
    y: number
}

type HistorySnapshot = HTMLCanvasElement

const MIN_ZOOM = 0.05
const MAX_ZOOM = 6
const HISTORY_LIMIT = 18

export class BackgroundEditorEngine {
    private readonly canvas: HTMLCanvasElement
    private readonly ctx: CanvasRenderingContext2D
    private original: HTMLImageElement | null = null
    private result: HTMLImageElement | null = null
    private editCanvas: HTMLCanvasElement | null = null
    private editCtx: CanvasRenderingContext2D | null = null
    private view: ViewState = { zoom: 1, offsetX: 0, offsetY: 0 }
    private brush: BrushSettings = { size: 36, tool: "erase" }
    private drawing = false
    private panning = false
    private lastImagePoint: Point | null = null
    private lastScreenPoint: Point | null = null
    private cursorPoint: Point | null = null
    private history: HistorySnapshot[] = []
    private historyIndex = -1
    private animationFrame = 0
    private width = 1
    private height = 1
    private dpr = 1
    private onHistoryChange:
        | ((canUndo: boolean, canRedo: boolean) => void)
        | null = null

    constructor(canvas: HTMLCanvasElement) {
        const context = canvas.getContext("2d", { alpha: false })
        if (!context) throw new Error("Unable to initialize editor canvas")
        this.canvas = canvas
        this.ctx = context
    }

    destroy() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
        this.animationFrame = 0
        this.onHistoryChange = null
        this.history = []
    }

    setHistoryListener(listener: (canUndo: boolean, canRedo: boolean) => void) {
        this.onHistoryChange = listener
        this.emitHistory()
    }

    async load(originalUrl: string, resultUrl: string) {
        const [original, result] = await Promise.all([
            loadImage(originalUrl),
            loadImage(resultUrl),
        ])

        this.original = original
        this.result = result
        this.editCanvas = document.createElement("canvas")
        this.editCanvas.width = result.naturalWidth
        this.editCanvas.height = result.naturalHeight
        this.editCtx = this.editCanvas.getContext("2d")
        if (!this.editCtx) throw new Error("Unable to initialize edit canvas")

        this.editCtx.clearRect(
            0,
            0,
            this.editCanvas.width,
            this.editCanvas.height
        )
        this.editCtx.drawImage(result, 0, 0)
        this.history = []
        this.historyIndex = -1
        this.fitToScreen()
        this.pushHistory()
        this.requestRender()
    }

    resize(width: number, height: number) {
        this.width = Math.max(1, Math.round(width))
        this.height = Math.max(1, Math.round(height))
        this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
        this.canvas.width = Math.round(this.width * this.dpr)
        this.canvas.height = Math.round(this.height * this.dpr)
        this.canvas.style.width = `${this.width}px`
        this.canvas.style.height = `${this.height}px`
        if (this.editCanvas) this.fitToScreen()
        else this.requestRender()
    }

    fitToScreen() {
        if (!this.editCanvas) return
        const scale = Math.min(
            this.width / this.editCanvas.width,
            this.height / this.editCanvas.height
        )
        this.view.zoom = clamp(scale * 0.9, MIN_ZOOM, MAX_ZOOM)
        this.view.offsetX =
            (this.width - this.editCanvas.width * this.view.zoom) / 2
        this.view.offsetY =
            (this.height - this.editCanvas.height * this.view.zoom) / 2
        this.requestRender()
    }

    setBrush(settings: BrushSettings) {
        this.brush = settings
        this.requestRender()
    }

    setCursor(point: Point | null) {
        this.cursorPoint = point
        this.requestRender()
    }

    zoomBy(delta: number, center: Point) {
        if (!this.editCanvas) return
        const before = this.screenToImage(center)
        const normalizedDelta = clamp(delta, -600, 600)
        const factor = Math.exp(-normalizedDelta * 0.0015)
        this.view.zoom = clamp(this.view.zoom * factor, MIN_ZOOM, MAX_ZOOM)
        this.view.offsetX = center.x - before.x * this.view.zoom
        this.view.offsetY = center.y - before.y * this.view.zoom
        this.requestRender()
    }

    stepZoom(direction: "in" | "out") {
        this.zoomBy(direction === "in" ? -120 : 120, {
            x: this.width / 2,
            y: this.height / 2,
        })
    }

    startBrush(point: Point) {
        if (!this.editCtx || !this.editCanvas) return
        this.drawing = true
        this.lastImagePoint = this.clampImagePoint(this.screenToImage(point))
        this.paintDot(this.lastImagePoint)
        this.requestRender()
    }

    moveBrush(point: Point) {
        if (!this.drawing || !this.lastImagePoint) return
        const next = this.clampImagePoint(this.screenToImage(point))
        this.paintLine(this.lastImagePoint, next)
        this.lastImagePoint = next
        this.requestRender()
    }

    endBrush() {
        if (!this.drawing) return
        this.drawing = false
        this.lastImagePoint = null
        this.pushHistory()
    }

    startPan(point: Point) {
        this.panning = true
        this.lastScreenPoint = point
    }

    movePan(point: Point) {
        if (!this.panning || !this.lastScreenPoint) return
        this.view.offsetX += point.x - this.lastScreenPoint.x
        this.view.offsetY += point.y - this.lastScreenPoint.y
        this.lastScreenPoint = point
        this.requestRender()
    }

    endPan() {
        this.panning = false
        this.lastScreenPoint = null
    }

    undo() {
        if (!this.editCtx || this.historyIndex <= 0) return
        this.historyIndex -= 1
        this.restoreSnapshot()
    }

    redo() {
        if (!this.editCtx || this.historyIndex >= this.history.length - 1)
            return
        this.historyIndex += 1
        this.restoreSnapshot()
    }

    reset() {
        if (!this.editCtx || !this.result || !this.editCanvas) return
        this.editCtx.clearRect(
            0,
            0,
            this.editCanvas.width,
            this.editCanvas.height
        )
        this.editCtx.drawImage(this.result, 0, 0)
        this.pushHistory()
        this.requestRender()
    }

    exportPng(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.editCanvas) {
                reject(new Error("No edited image available"))
                return
            }
            this.editCanvas.toBlob((blob) => {
                if (blob) resolve(blob)
                else reject(new Error("Unable to export PNG"))
            }, "image/png")
        })
    }

    private paintDot(point: Point) {
        this.paintPath(point, point, true)
    }

    private paintLine(from: Point, to: Point) {
        this.paintPath(from, to, false)
    }

    private paintPath(from: Point, to: Point, dotOnly: boolean) {
        if (!this.editCtx || !this.original) return
        const radius = this.brush.size / 2
        this.editCtx.save()
        this.editCtx.lineCap = "round"
        this.editCtx.lineJoin = "round"
        this.editCtx.lineWidth = this.brush.size

        if (this.brush.tool === "erase") {
            this.editCtx.globalCompositeOperation = "destination-out"
            this.editCtx.strokeStyle = "#000"
            this.editCtx.fillStyle = "#000"
        } else {
            this.editCtx.globalCompositeOperation = "source-over"
            const pattern = this.editCtx.createPattern(
                this.original,
                "no-repeat"
            )
            this.editCtx.strokeStyle = pattern ?? "transparent"
            this.editCtx.fillStyle = pattern ?? "transparent"
        }

        if (dotOnly || distance(from, to) < 0.5) {
            this.editCtx.beginPath()
            this.editCtx.arc(to.x, to.y, radius, 0, Math.PI * 2)
            this.editCtx.fill()
        } else {
            this.editCtx.beginPath()
            this.editCtx.moveTo(from.x, from.y)
            this.editCtx.lineTo(to.x, to.y)
            this.editCtx.stroke()
        }
        this.editCtx.restore()
    }

    private pushHistory() {
        if (!this.editCanvas) return
        this.history = this.history.slice(0, this.historyIndex + 1)
        this.history.push(cloneCanvas(this.editCanvas))
        if (this.history.length > HISTORY_LIMIT) this.history.shift()
        this.historyIndex = this.history.length - 1
        this.emitHistory()
    }

    private restoreSnapshot() {
        if (!this.editCanvas || !this.editCtx) return
        const snapshot = this.history[this.historyIndex]
        if (!snapshot) return
        this.editCtx.clearRect(
            0,
            0,
            this.editCanvas.width,
            this.editCanvas.height
        )
        this.editCtx.drawImage(snapshot, 0, 0)
        this.emitHistory()
        this.requestRender()
    }

    private emitHistory() {
        this.onHistoryChange?.(
            this.historyIndex > 0,
            this.historyIndex < this.history.length - 1
        )
    }

    private clampImagePoint(point: Point): Point {
        if (!this.editCanvas) return point
        return {
            x: clamp(point.x, 0, this.editCanvas.width),
            y: clamp(point.y, 0, this.editCanvas.height),
        }
    }

    private screenToImage(point: Point): Point {
        return {
            x: (point.x - this.view.offsetX) / this.view.zoom,
            y: (point.y - this.view.offsetY) / this.view.zoom,
        }
    }

    private requestRender() {
        if (this.animationFrame) return
        this.animationFrame = requestAnimationFrame(() => {
            this.animationFrame = 0
            this.render()
        })
    }

    private render() {
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.drawCheckerboard(this.width, this.height)
        if (!this.editCanvas) return

        this.ctx.save()
        this.ctx.translate(this.view.offsetX, this.view.offsetY)
        this.ctx.scale(this.view.zoom, this.view.zoom)
        this.ctx.imageSmoothingEnabled = true
        this.ctx.shadowColor = "rgba(15, 23, 42, 0.25)"
        this.ctx.shadowBlur = 18 / this.view.zoom
        this.ctx.drawImage(this.editCanvas, 0, 0)
        this.ctx.restore()
        this.drawBrushPreview()
    }

    private drawBrushPreview() {
        if (!this.cursorPoint || !this.editCanvas) return
        const imagePoint = this.screenToImage(this.cursorPoint)
        if (
            imagePoint.x < 0 ||
            imagePoint.y < 0 ||
            imagePoint.x > this.editCanvas.width ||
            imagePoint.y > this.editCanvas.height
        ) {
            return
        }

        const radius = Math.max(4, (this.brush.size * this.view.zoom) / 2)
        this.ctx.save()
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
        this.ctx.beginPath()
        this.ctx.arc(
            this.cursorPoint.x,
            this.cursorPoint.y,
            radius,
            0,
            Math.PI * 2
        )
        this.ctx.lineWidth = 2
        this.ctx.strokeStyle =
            this.brush.tool === "erase" ? "#ef4444" : "#22c55e"
        this.ctx.fillStyle =
            this.brush.tool === "erase"
                ? "rgba(239,68,68,0.10)"
                : "rgba(34,197,94,0.10)"
        this.ctx.fill()
        this.ctx.stroke()
        this.ctx.setLineDash([5, 4])
        this.ctx.strokeStyle = "rgba(15, 23, 42, 0.75)"
        this.ctx.stroke()
        this.ctx.restore()
    }

    private drawCheckerboard(width: number, height: number) {
        const size = 16
        this.ctx.fillStyle = "#f8fafc"
        this.ctx.fillRect(0, 0, width, height)
        this.ctx.fillStyle = "#e2e8f0"
        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                if ((x / size + y / size) % 2 === 0)
                    this.ctx.fillRect(x, y, size, size)
            }
        }
    }
}

function cloneCanvas(source: HTMLCanvasElement) {
    const copy = document.createElement("canvas")
    copy.width = source.width
    copy.height = source.height
    const context = copy.getContext("2d")
    context?.drawImage(source, 0, 0)
    return copy
}

function distance(a: Point, b: Point) {
    return Math.hypot(a.x - b.x, a.y - b.y)
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("Image failed to load"))
        image.src = src
    })
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}
