"use client"

import React, { useState } from "react"

const HashGenerator = () => {
    const [inputText, setInputText] = useState("")
    const [hashes, setHashes] = useState({ md5: "", sha1: "", sha256: "" })
    const [isProcessing, setIsProcessing] = useState(false)

    // Mock hash generation – replace with real crypto if needed
    const generateMockHash = (text: string, algorithm: string): string => {
        const encoder = new TextEncoder()
        const data = encoder.encode(text + algorithm)
        let hash = ""
        for (let i = 0; i < 32; i++) {
            hash += Math.floor(Math.random() * 16).toString(16)
        }
        return hash
    }

    const generateHashes = async () => {
        if (!inputText.trim()) {
            alert("Please enter some text")
            return
        }

        setIsProcessing(true)

        // Simulate async hash generation
        setTimeout(() => {
            setHashes({
                md5: generateMockHash(inputText, "md5"),
                sha1: generateMockHash(inputText, "sha1"),
                sha256: generateMockHash(inputText, "sha256"),
            })
            setIsProcessing(false)
        }, 500)
    }

    const clearAll = () => {
        setInputText("")
        setHashes({ md5: "", sha1: "", sha256: "" })
    }

    const copyToClipboard = (hash: string) => {
        navigator.clipboard.writeText(hash)
        alert("Copied to clipboard!")
    }

    const hasAnyHash = hashes.md5 || hashes.sha1 || hashes.sha256

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-2xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    <div className="space-y-5 p-5 sm:p-6">
                        {/* Input Section */}
                        <div>
                            <label className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Input Text
                            </label>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Enter text to generate hashes..."
                                rows={4}
                                className="w-full rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={generateHashes}
                                disabled={isProcessing}
                                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold tracking-wide text-white transition-all active:scale-[0.98] ${
                                    isProcessing
                                        ? "cursor-not-allowed bg-slate-400 dark:bg-slate-700"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 hover:shadow"
                                }`}
                            >
                                {isProcessing
                                    ? "Generating..."
                                    : "Generate Hashes"}
                            </button>
                            <button
                                onClick={clearAll}
                                className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Results Section */}
                        {hasAnyHash && (
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Generated Hashes
                                </h3>

                                <div className="space-y-3">
                                    {/* MD5 */}
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                            MD5
                                        </label>
                                        <div className="flex gap-2">
                                            <code className="flex-1 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 font-mono text-xs break-all text-slate-800 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100">
                                                {hashes.md5}
                                            </code>
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(hashes.md5)
                                                }
                                                className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    {/* SHA-1 */}
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                            SHA-1
                                        </label>
                                        <div className="flex gap-2">
                                            <code className="flex-1 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 font-mono text-xs break-all text-slate-800 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100">
                                                {hashes.sha1}
                                            </code>
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(hashes.sha1)
                                                }
                                                className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    {/* SHA-256 */}
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                            SHA-256
                                        </label>
                                        <div className="flex gap-2">
                                            <code className="flex-1 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 font-mono text-xs break-all text-slate-800 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100">
                                                {hashes.sha256}
                                            </code>
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(
                                                        hashes.sha256
                                                    )
                                                }
                                                className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HashGenerator
