"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { 
  Key, 
  Unlock, 
  Copy, 
  Trash2, 
  Check, 
  ShieldAlert, 
  Clock, 
  Terminal, 
  Cpu, 
  Layers 
} from "lucide-react"
import { ToolHeroProps } from "../../../types/tool"
import ToolHero from "../../tool-page-helpers/ToolHero"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

function safeAtob(str: string): string {
    try {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/")
        while (base64.length % 4) {
            base64 += "="
        }
        return decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        )
    } catch {
        throw new Error("Failed to decode token segments. Base64 structure is invalid.")
    }
}

export default function JwtDebugger({ tool }: ToolHeroProps) {
    const [jwtToken, setJwtToken] = useState("")
    const [decoded, setDecoded] = useState<any | null>(null)
    const [error, setError] = useState("")
    const [copyState, setCopyState] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const trimmedToken = jwtToken.trim()
        if (!trimmedToken) {
            setDecoded(null)
            setError("")
            return
        }

        try {
            setError("")
            const parts = trimmedToken.split(".")
            if (parts.length !== 3) {
                throw new Error("Invalid JWT layout. Token must contain exactly 3 dot-separated components.")
            }

            const header = JSON.parse(safeAtob(parts[0] || ""))
            const payload = JSON.parse(safeAtob(parts[1] || ""))
            const signature = parts[2] || ""

            const now = Math.floor(Date.now() / 1000)
            const isExpired = payload.exp && payload.exp < now
            const expiresIn = payload.exp ? payload.exp - now : null

            setDecoded({
                header,
                payload,
                signature,
                isExpired,
                expiresIn,
            })
        } catch (err) {
            if (err instanceof Error) setError(err.message)
            setDecoded(null)
        }
    }, [jwtToken])

    const clearAll = () => {
        setJwtToken("")
        setDecoded(null)
        setError("")
        setCopyState({})
    }

    const copySegmentToClipboard = (text: any, key: string) => {
        const payload = typeof text === "string" ? text : JSON.stringify(text, null, 2)
        void navigator.clipboard.writeText(payload).then(() => {
            setCopyState((prev) => ({ ...prev, [key]: true }))
            setTimeout(() => {
                setCopyState((prev) => ({ ...prev, [key]: false }))
            }, 1800)
        })
    }

    const formatTimestamp = (timestamp: number | undefined) => {
        if (!timestamp) return "N/A"
        const date = new Date(timestamp * 1000)
        return date.toLocaleString()
    }

    const formatTimeRemaining = (seconds: number | null) => {
        if (seconds === null) return "N/A"
        if (seconds < 0) return "Expired"

        const days = Math.floor(seconds / (3600 * 24))
        const hours = Math.floor((seconds % (3600 * 24)) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (days > 0) return `${days}d ${hours}h ${minutes}m`
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    const tokenPartsPreview = useMemo(() => {
        if (!jwtToken.trim()) return null
        const parts = jwtToken.split(".")
        return (
            <div className="text-xs font-mono break-all p-3 border rounded-xl bg-slate-50 dark:bg-slate-950/60 leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                <span className="text-rose-500 font-semibold">{parts[0]}</span>
                {parts[1] && <span className="text-slate-400">.</span>}
                <span className="text-purple-500 font-semibold">{parts[1]}</span>
                {parts[2] && <span className="text-slate-400">.</span>}
                <span className="text-cyan-500 font-semibold">{parts[2]}</span>
            </div>
        )
    }, [jwtToken])

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-7xl space-y-8">
                <ToolHero tool={tool} />

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
                    <div className="p-6 sm:p-8 space-y-6">
                        
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                            
                            <div className="space-y-4 flex flex-col h-full">
                                <Card className="border-slate-200 dark:border-slate-800 flex flex-col flex-1">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <Cpu className="h-4 w-4 text-indigo-500" />
                                                Encoded Token Stream
                                            </span>
                                            {jwtToken && (
                                                <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg">
                                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                                                </Button>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="text-xs">Paste token here. Decodes automatically.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                                        <Textarea
                                            value={jwtToken}
                                            onChange={(e) => setJwtToken(e.target.value)}
                                            placeholder="Paste encoded eyJhbGciOi... JWT token payload strings..."
                                            className={cn(
                                                "min-h-[260px] flex-1 font-mono text-xs resize-none rounded-xl bg-transparent",
                                                error ? "border-rose-300 focus-visible:ring-rose-400" : "border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                                            )}
                                        />

                                        {tokenPartsPreview && (
                                            <div className="space-y-1.5 pt-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Structural Components Splitter</div>
                                                {tokenPartsPreview}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {error && (
                                    <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2 shadow-sm animate-in fade-in-50">
                                        <ShieldAlert className="h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 h-full">
                                {decoded ? (
                                    <div className="space-y-4 animate-in fade-in-40 duration-200">
                                        
                                        <Card className="border-slate-200 dark:border-slate-800">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Layers className="h-4 w-4 text-indigo-500" /> Claims Matrix Summary
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                                                <div className="p-2.5 rounded-xl border bg-slate-50/40 dark:bg-slate-950/20">
                                                    <span className="text-slate-400 block mb-0.5">Algorithm</span>
                                                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{decoded.header.alg || "N/A"}</span>
                                                </div>
                                                <div className="p-2.5 rounded-xl border bg-slate-50/40 dark:bg-slate-950/20">
                                                    <span className="text-slate-400 block mb-0.5">Type</span>
                                                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{decoded.header.typ || "N/A"}</span>
                                                </div>
                                                <div className="p-2.5 rounded-xl border bg-slate-50/40 dark:bg-slate-950/20 col-span-2 sm:col-span-1">
                                                    <span className="text-slate-400 block mb-0.5">Validation</span>
                                                    <Badge variant={decoded.isExpired ? "destructive" : "success"} className="text-[10px] font-bold h-5 uppercase">
                                                        {decoded.isExpired ? "Expired" : "Active Shield"}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="space-y-4">
                                            {[
                                                { key: "header", name: "Header Parameters", color: "border-rose-500/20 dark:border-rose-500/10", data: decoded.header },
                                                { key: "payload", name: "Payload Claims", color: "border-purple-500/20 dark:border-purple-500/10", data: decoded.payload },
                                            ].map((section) => {
                                                const isCopied = !!copyState[section.key]
                                                return (
                                                    <Card key={section.key} className={cn("border bg-transparent shadow-sm overflow-hidden", section.color)}>
                                                        <CardHeader className="py-2.5 px-4 bg-slate-50/60 dark:bg-slate-950/20 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                                <Terminal className="h-3.5 w-3.5 text-slate-400" /> {section.name}
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => copySegmentToClipboard(section.data, section.key)}
                                                                className="h-7 text-xs rounded-lg gap-1 px-2 border border-slate-200/60 dark:border-slate-800"
                                                            >
                                                                {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                                <span className="text-[11px]">{isCopied ? "Copied!" : "Copy"}</span>
                                                            </Button>
                                                        </CardHeader>
                                                        <CardContent className="p-0">
                                                            <pre className="p-4 font-mono text-[11px] leading-relaxed break-all bg-white dark:bg-slate-950 max-h-[180px] overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 shadow-inner">
                                                                {JSON.stringify(section.data, null, 2)}
                                                            </pre>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}

                                            <Card className="border-cyan-500/20 dark:border-cyan-500/10 shadow-sm overflow-hidden bg-transparent">
                                                <CardHeader className="py-2.5 px-4 bg-slate-50/60 dark:bg-slate-950/20 border-b flex flex-row items-center justify-between space-y-0">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                        <Key className="h-3.5 w-3.5 text-cyan-500" /> Cryptographic Verify Signature
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => copySegmentToClipboard(decoded.signature, "sig")}
                                                        className="h-7 text-xs rounded-lg gap-1 px-2 border border-slate-200/60 dark:border-slate-800"
                                                    >
                                                        {copyState["sig"] ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                        <span className="text-[11px]">{copyState["sig"] ? "Copied!" : "Copy"}</span>
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-3 bg-white dark:bg-slate-950 font-mono text-[10px] break-all text-slate-400 max-h-[80px] overflow-y-auto custom-scrollbar shadow-inner">
                                                    {decoded.signature || "Empty / Unsigned Segment Token"}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <Card className="border-slate-200 dark:border-slate-800">
                                            <CardContent className="p-4 text-xs space-y-2.5 leading-relaxed text-slate-500">
                                                <div className="flex justify-between border-b border-dashed pb-1.5"><span>• Issuer (iss):</span> <strong className="text-slate-700 dark:text-slate-300">{decoded.payload.iss || "N/A"}</strong></div>
                                                <div className="flex justify-between border-b border-dashed pb-1.5"><span>• Subject (sub):</span> <strong className="text-slate-700 dark:text-slate-300">{decoded.payload.sub || "N/A"}</strong></div>
                                                <div className="flex justify-between border-b border-dashed pb-1.5"><span>• Audience (aud):</span> <strong className="text-slate-700 dark:text-slate-300">{decoded.payload.aud || "N/A"}</strong></div>
                                                <div className="flex justify-between border-b border-dashed pb-1.5"><span>• Issued At (iat):</span> <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatTimestamp(decoded.payload.iat)}</strong></div>
                                                <div className="flex justify-between">
                                                    <span>• Expiration (exp):</span> 
                                                    <span className="text-right font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                        {formatTimestamp(decoded.payload.exp)} 
                                                        {decoded.expiresIn && (
                                                            <span className={cn("text-[10px] px-1 rounded ml-1 font-semibold flex items-center gap-0.5", decoded.isExpired ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40")}>
                                                                <Clock className="h-3 w-3" /> {formatTimeRemaining(decoded.expiresIn)}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="h-full border border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 py-36 select-none">
                                        <Unlock className="h-7 w-7 text-slate-300 dark:text-slate-700 mb-2 animate-pulse" />
                                        <p className="text-sm font-medium">Engine Monitor Waiting</p>
                                        <p className="text-xs text-slate-400 max-w-xs mt-1">Paste a valid three-part JSON Web Token into the input workspace layer to begin validation mapping.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-3 pt-2">
                            {[
                                { title: "Standard Layout Dot Slicing", icon: "📋", desc: "JSON Web Tokens split structurally via periods into three discrete distinct vector matrices: Header, Claims Payload, and Verify Cryptographic Signature hashes." },
                                { title: "Claims Vector Mapping", icon: "🧠", desc: "Decoded claims display target data scopes instantly, unpacking expiration timestamps (exp), user scopes, and token tracking IDs (jti) correctly." },
                                { title: "Native Browser Memory Processing", icon: "🔒", desc: "Token segments parse inside safe browser frame sandboxes using custom UTF-8 algorithms. Key variables never process on network routing layers." }
                            ].map((info) => (
                                <div key={info.title} className="p-4 rounded-xl border border-slate-200/70 bg-white/40 dark:border-slate-800/60 dark:bg-slate-950/10 flex gap-3 shadow-sm">
                                    <div className="text-lg select-none">{info.icon}</div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{info.title}</h4>
                                        <p className="text-[11px] text-slate-400 leading-normal">{info.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div> */}

                    </div>
                </div>
            </div>
        </div>
    )
}