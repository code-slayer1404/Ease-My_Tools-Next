// "use client"

// import React, { useState } from "react"
// import styles from "./styles.module.css"

// const CaseConverter = () => {
//     // <-- i18next
//     const [inputText, setInputText] = useState("")
//     const [convertedText, setConvertedText] = useState("")

//     const convertToUpperCase = () => {
//         setConvertedText(inputText.toUpperCase())
//     }

//     const convertToLowerCase = () => {
//         setConvertedText(inputText.toLowerCase())
//     }

//     const convertToSentenceCase = () => {
//         const sentences = inputText.toLowerCase().split(". ")
//         const sentenceCase = sentences
//             .map(
//                 (sentence) =>
//                     sentence.charAt(0).toUpperCase() + sentence.slice(1)
//             )
//             .join(". ")
//         setConvertedText(sentenceCase)
//     }

//     const convertToTitleCase = () => {
//         const titleCase = inputText
//             .toLowerCase()
//             .split(" ")
//             .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(" ")
//         setConvertedText(titleCase)
//     }

//     const copyToClipboard = () => {
//         navigator.clipboard.writeText(convertedText)
//         alert("Text copied to clipboard!")
//     }

//     const clearText = () => {
//         setInputText("")
//         setConvertedText("")
//     }

//     return (
//         <div className={styles["case-converter"]}>
//             {/* <div className={styles["converter-header"]}>
//                 <h1>{"Text Case Converter"}</h1>
//                 <p>{"Convert text between different cases instantly"}</p>
//             </div> */}

//             <div className={styles["converter-container"]}>
//                 <div className={styles["input-section"]}>
//                     <label>{"Input Text"}</label>
//                     <textarea
//                         value={inputText}
//                         onChange={(e) => setInputText(e.target.value)}
//                         placeholder={"Enter your text here..."}
//                         className={styles["text-input"]}
//                         rows={6}
//                     />
//                 </div>

//                 <div className={styles["button-group"]}>
//                     <button
//                         onClick={convertToUpperCase}
//                         className={styles["convert-btn"]}
//                     >
//                         {"UPPERCASE"}
//                     </button>
//                     <button
//                         onClick={convertToLowerCase}
//                         className={styles["convert-btn"]}
//                     >
//                         {"lowercase"}
//                     </button>
//                     <button
//                         onClick={convertToSentenceCase}
//                         className={styles["convert-btn"]}
//                     >
//                         {"Sentence case"}
//                     </button>
//                     <button
//                         onClick={convertToTitleCase}
//                         className={styles["convert-btn"]}
//                     >
//                         {"Title Case"}
//                     </button>
//                     <button onClick={clearText} className={styles["clear-btn"]}>
//                         {"Clear"}
//                     </button>
//                 </div>

//                 <div className={styles["output-section"]}>
//                     <label>{"Converted Text"}</label>
//                     <textarea
//                         value={convertedText}
//                         readOnly
//                         placeholder={"Converted text will appear here..."}
//                         className={styles["text-output"]}
//                         rows={6}
//                     />
//                 </div>

//                 {convertedText && (
//                     <div className={styles["action-buttons"]}>
//                         <button
//                             onClick={copyToClipboard}
//                             className={styles["copy-btn"]}
//                         >
//                             {"Copy to Clipboard"}
//                         </button>
//                         <div className={styles["text-stats"]}>
//                             <span>
//                                 {"Characters"}: {convertedText.length}
//                             </span>
//                             <span>
//                                 {"Words"}:{" "}
//                                 {
//                                     convertedText
//                                         .split(/\s+/)
//                                         .filter((word) => word.length > 0)
//                                         .length
//                                 }
//                             </span>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }

// export default CaseConverter




"use client"

import React, { useState, useRef, useCallback } from "react"
import {
  ArrowUp,
  ArrowDown,
  Text,
  Heading,
  Trash2,
  Copy,
  Check,
  FileText,
  BarChart,
} from "lucide-react"

const CaseConverter = () => {
  const [inputText, setInputText] = useState("")
  const [convertedText, setConvertedText] = useState("")
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const convertToUpperCase = () => {
    setConvertedText(inputText.toUpperCase())
  }

  const convertToLowerCase = () => {
    setConvertedText(inputText.toLowerCase())
  }

  const convertToSentenceCase = () => {
    const sentences = inputText.toLowerCase().split(". ")
    const sentenceCase = sentences
      .map(
        (sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1)
      )
      .join(". ")
    setConvertedText(sentenceCase)
  }

  const convertToTitleCase = () => {
    const titleCase = inputText
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
    setConvertedText(titleCase)
  }

  const handleCopy = async () => {
    if (!convertedText) return
    try {
      await navigator.clipboard.writeText(convertedText)
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      setCopied(false)
    }
  }

  const clearText = () => {
    setInputText("")
    setConvertedText("")
  }

  const wordCount = convertedText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  return (
    <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900 sm:px-6 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-300/90 bg-slate-100/50 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6 dark:border-slate-600/80 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={convertToUpperCase}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ArrowUp className="h-4 w-4" />
                UPPER
              </button>
              <button
                onClick={convertToLowerCase}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ArrowDown className="h-4 w-4" />
                lower
              </button>
              <button
                onClick={convertToSentenceCase}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Text className="h-4 w-4" />
                Sentence
              </button>
              <button
                onClick={convertToTitleCase}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Heading className="h-4 w-4" />
                Title
              </button>
            </div>
            <button
              onClick={clearText}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:gap-8">
            {/* Input */}
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Input Text
                </h3>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                rows={8}
              />
            </div>

            {/* Output */}
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Converted Text
                  </h3>
                </div>
                {convertedText && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {convertedText.length.toLocaleString()} chars • {wordCount} words
                  </span>
                )}
              </div>
              <textarea
                value={convertedText}
                readOnly
                placeholder="Converted text will appear here..."
                className="w-full rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                rows={8}
              />
              {convertedText && (
                <button
                  onClick={handleCopy}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy to Clipboard
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseConverter