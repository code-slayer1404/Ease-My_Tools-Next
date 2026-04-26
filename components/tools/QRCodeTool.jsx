"use client";

import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import jsQR from "jsqr";
import "../../styles/tools/QRCodeTool.css";

const QRCodeTool = () => {
    const [inputText, setInputText] = useState("");
    const [decodedText, setDecodedText] = useState("");
    const [fileError, setFileError] = useState("");
    const canvasRef = useRef(null);
    const svgRef = useRef(null);

    const handleDecode = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileError("");
        setDecodedText("");

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            // @ts-ignore
            img.src = event.target.result;
            img.onload = () => {
                const canvas = canvasRef.current;
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);
                if (code) setDecodedText(code.data);
                else setFileError("No QR code found in image.");
            };
        };
        reader.readAsDataURL(file);
    };

    const handleDownload = () => {
        if (!inputText || !svgRef.current) return;

        const svg = svgRef.current.querySelector("svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "qr-code.svg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="qr-container">
            <h2>QR Code Generator & Decoder</h2>

            <div className="generator" ref={svgRef}>
                <h3>Generate QR Code</h3>
                <input
                    type="text"
                    placeholder="Enter text or URL"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                {inputText && (
                    <>
                        <div className="qr-preview">
                            <QRCodeSVG value={inputText} size={200} />
                        </div>
                        <button className="download-btn" onClick={handleDownload}>
                            Download QR Code
                        </button>
                    </>
                )}
            </div>

            <div className="decoder">
                <h3>Decode QR Code</h3>
                <input type="file" accept="image/*" onChange={handleDecode} />
                {fileError && <p className="error">{fileError}</p>}
                {decodedText && (
                    <p>
                        <strong>Decoded Text:</strong> {decodedText}
                    </p>
                )}
            </div>

            {/* Hidden canvas for decoding */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
};

export default QRCodeTool;
