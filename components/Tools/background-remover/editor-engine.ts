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

const MIN_ZOOM = 0.15
const MAX_ZOOM = 8
const HISTORY_LIMIT = 24

export class BackgroundEditorEngine {
    private readonly canvas: HTMLCanvasElement
    private readonly ctx: CanvasRenderingContext2D
    private original: HTMLImageElement | null = null
    private result: HTMLImageElement | null = null
    private maskCanvas: HTMLCanvasElement | null = null
    private maskCtx: CanvasRenderingContext2D | null = null
    private view: ViewState = { zoom: 1, offsetX: 0, offsetY: 0 }
    private brush: BrushSettings = { size: 44, tool: "erase" }
    private drawing = false
    private panning = false
    private lastImagePoint: Point | null = null
    private lastScreenPoint: Point | null = null
    private history: ImageData[] = []
    private historyIndex = -1
    private animationFrame = 0
    private onHistoryChange:
        | ((canUndo: boolean, canRedo: boolean) => void)
        | null = null

    constructor(canvas: HTMLCanvasElement) {
        const context = canvas.getContext("2d", { alpha: true })
        if (!context) {
            throw new Error("Unable to initialize editor canvas")
        }
        this.canvas = canvas
        this.ctx = context
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
        this.maskCanvas = document.createElement("canvas")
        this.maskCanvas.width = result.naturalWidth
        this.maskCanvas.height = result.naturalHeight
        this.maskCtx = this.maskCanvas.getContext("2d", {
            willReadFrequently: true,
        })

        if (!this.maskCtx) {
            throw new Error("Unable to initialize mask canvas")
        }

        this.maskCtx.clearRect(
            0,
            0,
            this.maskCanvas.width,
            this.maskCanvas.height
        )
        this.maskCtx.drawImage(result, 0, 0)
        this.history = []
        this.historyIndex = -1
        this.fitToScreen()
        this.pushHistory()
        this.requestRender()
    }

    resize(width: number, height: number) {
        const ratio = window.devicePixelRatio || 1
        this.canvas.width = Math.max(1, Math.floor(width * ratio))
        this.canvas.height = Math.max(1, Math.floor(height * ratio))
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
        this.requestRender()
    }

    fitToScreen() {
        if (!this.maskCanvas) return
        const cssWidth = this.canvas.clientWidth || 1
        const cssHeight = this.canvas.clientHeight || 1
        const scale = Math.min(
            cssWidth / this.maskCanvas.width,
            cssHeight / this.maskCanvas.height
        )
        this.view.zoom = clamp(scale * 0.92, MIN_ZOOM, MAX_ZOOM)
        this.view.offsetX =
            (cssWidth - this.maskCanvas.width * this.view.zoom) / 2
        this.view.offsetY =
            (cssHeight - this.maskCanvas.height * this.view.zoom) / 2
        this.requestRender()
    }

    setBrush(settings: BrushSettings) {
        this.brush = settings
        this.requestRender()
    }

    zoom(delta: number, center: Point) {
        if (!this.maskCanvas) return
        const before = this.screenToImage(center)
        this.view.zoom = clamp(this.view.zoom * delta, MIN_ZOOM, MAX_ZOOM)
        this.view.offsetX = center.x - before.x * this.view.zoom
        this.view.offsetY = center.y - before.y * this.view.zoom
        this.requestRender()
    }

    startBrush(point: Point) {
        if (!this.maskCtx) return
        this.drawing = true
        this.lastImagePoint = this.screenToImage(point)
        this.paint(this.lastImagePoint, this.lastImagePoint)
    }

    moveBrush(point: Point) {
        if (!this.drawing || !this.lastImagePoint) return
        const next = this.screenToImage(point)
        this.paint(this.lastImagePoint, next)
        this.lastImagePoint = next
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
        if (!this.maskCtx || this.historyIndex <= 0) return
        this.historyIndex -= 1
        const snapshot = this.history[this.historyIndex]
        if (!snapshot) return
        this.maskCtx.putImageData(snapshot, 0, 0)
        this.emitHistory()
        this.requestRender()
    }

    redo() {
        if (!this.maskCtx || this.historyIndex >= this.history.length - 1)
            return
        this.historyIndex += 1
        const snapshot = this.history[this.historyIndex]
        if (!snapshot) return
        this.maskCtx.putImageData(snapshot, 0, 0)
        this.emitHistory()
        this.requestRender()
    }

    reset() {
        if (!this.maskCtx || !this.result || !this.maskCanvas) return
        this.maskCtx.clearRect(
            0,
            0,
            this.maskCanvas.width,
            this.maskCanvas.height
        )
        this.maskCtx.drawImage(this.result, 0, 0)
        this.pushHistory()
        this.requestRender()
    }

    exportPng(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.maskCanvas) {
                reject(new Error("No edited image available"))
                return
            }
            this.maskCanvas.toBlob((blob) => {
                if (blob) resolve(blob)
                else reject(new Error("Unable to export PNG"))
            }, "image/png")
        })
    }

    private paint(from: Point, to: Point) {
        if (!this.maskCtx || !this.original) return
        this.maskCtx.save()
        this.maskCtx.lineCap = "round"
        this.maskCtx.lineJoin = "round"
        this.maskCtx.lineWidth = this.brush.size
        this.maskCtx.beginPath()
        this.maskCtx.moveTo(from.x, from.y)
        this.maskCtx.lineTo(to.x, to.y)
        if (this.brush.tool === "erase") {
            this.maskCtx.globalCompositeOperation = "destination-out"
            this.maskCtx.strokeStyle = "rgba(0,0,0,1)"
            this.maskCtx.stroke()
        } else {
            this.maskCtx.globalCompositeOperation = "source-over"
            this.maskCtx.strokeStyle =
                this.maskCtx.createPattern(this.original, "no-repeat") ??
                "transparent"
            this.maskCtx.stroke()
        }
        this.maskCtx.restore()
        this.requestRender()
    }

    private pushHistory() {
        if (!this.maskCtx || !this.maskCanvas) return
        const snapshot = this.maskCtx.getImageData(
            0,
            0,
            this.maskCanvas.width,
            this.maskCanvas.height
        )
        this.history = this.history.slice(0, this.historyIndex + 1)
        this.history.push(snapshot)
        if (this.history.length > HISTORY_LIMIT) {
            this.history.shift()
        }
        this.historyIndex = this.history.length - 1
        this.emitHistory()
    }

    private emitHistory() {
        this.onHistoryChange?.(
            this.historyIndex > 0,
            this.historyIndex < this.history.length - 1
        )
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
        const width = this.canvas.clientWidth || 1
        const height = this.canvas.clientHeight || 1
        this.ctx.clearRect(0, 0, width, height)
        this.drawCheckerboard(width, height)
        if (!this.maskCanvas) return
        this.ctx.save()
        this.ctx.imageSmoothingEnabled = true
        this.ctx.setTransform(
            this.view.zoom,
            0,
            0,
            this.view.zoom,
            this.view.offsetX,
            this.view.offsetY
        )
        this.ctx.shadowColor = "rgba(15, 23, 42, 0.22)"
        this.ctx.shadowBlur = 24 / this.view.zoom
        this.ctx.drawImage(this.maskCanvas, 0, 0)
        this.ctx.restore()
    }

    private drawCheckerboard(width: number, height: number) {
        const size = 18
        this.ctx.fillStyle = "#f8fafc"
        this.ctx.fillRect(0, 0, width, height)
        this.ctx.fillStyle = "#e2e8f0"
        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                if ((x / size + y / size) % 2 === 0) {
                    this.ctx.fillRect(x, y, size, size)
                }
            }
        }
    }
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
