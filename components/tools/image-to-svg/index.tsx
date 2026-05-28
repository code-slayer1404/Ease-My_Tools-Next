"use client";

import {
  useCallback,
  useState,
} from "react";

import { useDropzone } from "react-dropzone";

import { motion } from "framer-motion";

import ImageTracer from "imagetracerjs";

import styles from "./styles.module.css";

type TraceMode =
  | "logo"
  | "detailed"
  | "sketch"
  | "anime"
  | "icon"
  | "blackwhite"
  | "smooth"
  | "minimal";

export default function ImageToSvg() {
  const [preview, setPreview] =
    useState<string>("");

  const [svgCode, setSvgCode] =
    useState<string>("");

  const [svgUrl, setSvgUrl] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(false);

  const [mode, setMode] =
    useState<TraceMode>("logo");

  const [quality, setQuality] =
    useState<number>(5);

  const [recommendedMode,
    setRecommendedMode] =
    useState<string>("");

  const [file, setFile] =
    useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile =
        acceptedFiles?.[0];

      if (!selectedFile)
        return;

      // 10MB LIMIT
      if (
        selectedFile.size >
        10 * 1024 * 1024
      ) {
        alert(
          "Please upload image smaller than 10MB"
        );

        return;
      }

      setFile(selectedFile);

      const imageUrl =
        URL.createObjectURL(
          selectedFile
        );

      setPreview(imageUrl);

      setSvgCode("");

      setSvgUrl("");

      // SMART MODE DETECTION
      const fileName =
        selectedFile.name.toLowerCase();

      if (
        fileName.includes("logo") ||
        fileName.includes("icon")
      ) {
        setMode("logo");

        setQuality(5);

        setRecommendedMode(
          "Recommended: Logo Mode"
        );
      } else if (
        fileName.includes("anime") ||
        fileName.includes("cartoon")
      ) {
        setMode("anime");

        setQuality(6);

        setRecommendedMode(
          "Recommended: Anime Mode"
        );
      } else if (
        fileName.includes("sketch") ||
        fileName.includes("drawing")
      ) {
        setMode("sketch");

        setQuality(2);

        setRecommendedMode(
          "Recommended: Sketch Mode"
        );
      } else if (
        selectedFile.size >
        4 * 1024 * 1024
      ) {
        setMode("minimal");

        setQuality(3);

        setRecommendedMode(
          "Recommended: Minimal Mode"
        );
      } else {
        setMode("detailed");

        setQuality(6);

        setRecommendedMode(
          "Recommended: Detailed Mode"
        );
      }
    },
    []
  );

  const {
    getRootProps,
    getInputProps,
  } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
      "image/webp": [],
      "image/gif": [],
      "image/bmp": [],
      "image/tiff": [],
      "image/avif": [],
      "image/x-icon": [],
    },

    multiple: false,

    onDrop,
  });

  const getModeSettings =
    (): Record<
      string,
      number | boolean
    > => {
      switch (mode) {
        // LOGO
        case "logo":
          return {
            ltres: 0.1,
            qtres: 0.1,
            pathomit: 1,
            colorsampling: 2,
            numberofcolors:
              quality,
            mincolorratio: 0,
            colorquantcycles: 3,
            scale: 1,
            strokewidth: 1,
            blurradius: 0,
            blurdelta: 4,
            roundcoords: 1,
          };

        // DETAILED
        case "detailed":
          return {
            ltres: 1,
            qtres: 1,
            pathomit: 6,
            colorsampling: 2,
            numberofcolors:
              quality + 1,
            mincolorratio: 0,
            colorquantcycles: 2,
            scale: 1,
            strokewidth: 1,
            blurradius: 1,
            blurdelta: 10,
          };

        // SKETCH
        case "sketch":
          return {
            ltres: 4,
            qtres: 4,
            pathomit: 12,
            colorsampling: 0,
            numberofcolors: 2,
            colorquantcycles: 1,
            scale: 1,
            strokewidth: 2,
            blurradius: 0,
            blurdelta: 20,
          };

        // ANIME
        case "anime":
          return {
            ltres: 0.5,
            qtres: 0.5,
            pathomit: 2,
            colorsampling: 2,
            numberofcolors: 8,
            colorquantcycles: 2,
            scale: 1,
            strokewidth: 1,
            blurradius: 1,
            blurdelta: 6,
          };

        // ICON
        case "icon":
          return {
            ltres: 0.1,
            qtres: 0.1,
            pathomit: 0,
            colorsampling: 0,
            numberofcolors: 4,
            colorquantcycles: 1,
            scale: 1,
            strokewidth: 1,
          };

        // BLACK & WHITE
        case "blackwhite":
          return {
            ltres: 1,
            qtres: 1,
            pathomit: 1,
            colorsampling: 0,
            numberofcolors: 2,
            colorquantcycles: 1,
            scale: 1,
            strokewidth: 1,
          };

        // SMOOTH
        case "smooth":
          return {
            ltres: 2,
            qtres: 2,
            pathomit: 8,
            colorsampling: 2,
            numberofcolors:
              quality,
            colorquantcycles: 2,
            scale: 1,
            strokewidth: 1,
            blurradius: 2,
            blurdelta: 12,
            roundcoords: 2,
          };

        // MINIMAL
        case "minimal":
          return {
            ltres: 4,
            qtres: 4,
            pathomit: 20,
            colorsampling: 0,
            numberofcolors: 3,
            colorquantcycles: 1,
            scale: 1,
            strokewidth: 1,
          };

        default:
          return {};
      }
    };

  // IMAGE ENHANCEMENT API
  const enhanceImage =
    async (): Promise<string> => {
      if (!file) {
        throw new Error(
          "No file selected"
        );
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/image-to-svg",
          {
            method: "POST",
            body: formData,
          }
        );

      if (!response.ok) {
        throw new Error(
          "Enhancement failed"
        );
      }

      const blob =
        await response.blob();

      return URL.createObjectURL(
        blob
      );
    };

  // SVG CONVERSION
  const convertToSvg =
    async (): Promise<void> => {
      if (!preview) return;

      try {
        setLoading(true);

        const enhancedImage =
          await enhanceImage();

        ImageTracer.imageToSVG(
          enhancedImage,
          (
            svgString: string
          ) => {
            setSvgCode(
              svgString
            );

            const blob =
              new Blob(
                [svgString],
                {
                  type:
                    "image/svg+xml",
                }
              );

            const url =
              URL.createObjectURL(
                blob
              );

            setSvgUrl(url);

            setLoading(false);
          },
          getModeSettings()
        );
      } catch (
        error: unknown
      ) {
        console.error(error);

        setLoading(false);

        alert(
          "SVG conversion failed"
        );
      }
    };

  // COPY SVG
  const copySvg =
    async (): Promise<void> => {
      if (!svgCode) return;

      await navigator.clipboard.writeText(
        svgCode
      );

      alert("SVG copied");
    };

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {/* LEFT PANEL */}

        <div className={styles.card}>
          <div
            {...getRootProps()}
            className={
              styles.dropzone
            }
          >
            <input
              {...getInputProps()}
            />

            <div
              className={styles.icon}
            >
              🖼️
            </div>

            <h2>
              Upload Image
            </h2>

            <p>
              Drag & Drop or Click
            </p>

            <button
              type="button"
              className={
                styles.uploadBtn
              }
            >
              Choose File
            </button>
          </div>

          {/* MODE */}

          <div className={styles.section}>
            <label>
              Conversion Mode
            </label>

            <select
              value={mode}
              onChange={(e) =>
                setMode(
                  e.target
                    .value as TraceMode
                )
              }
              className={
                styles.select
              }
            >
              <option value="logo">
                Logo
              </option>

              <option value="detailed">
                Detailed
              </option>

              <option value="sketch">
                Sketch
              </option>

              <option value="anime">
                Anime
              </option>

              <option value="icon">
                Icon
              </option>

              <option value="blackwhite">
                Black & White
              </option>

              <option value="smooth">
                Smooth
              </option>

              <option value="minimal">
                Minimal
              </option>
            </select>

            {recommendedMode && (
              <p
                style={{
                  marginTop: "10px",
                  fontSize: "14px",
                  opacity: 0.7,
                }}
              >
                {recommendedMode}
              </p>
            )}
          </div>

          {/* QUALITY */}

          <div className={styles.section}>
            <label>
              SVG Quality (
              {quality} Colors )
            </label>

            <input
              type="range"
              min="2"
              max="6"
              value={quality}
              onChange={(e) =>
                setQuality(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              className={
                styles.range
              }
            />
          </div>

          {/* CONVERT */}

          <button
            type="button"
            onClick={
              convertToSvg
            }
            disabled={
              !preview ||
              loading
            }
            className={
              styles.convertBtn
            }
          >
            {loading
              ? "Converting..."
              : "Convert to SVG"}
          </button>

          <div className={styles.note}>
            Best results:
            <br />
            • logos
            <br />
            • icons
            <br />
            • illustrations
            <br />
            • anime
            <br />
            • signatures
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className={styles.card}>
          <div
            className={
              styles.previewGrid
            }
          >
            {/* ORIGINAL */}

            <div>
              <h3>Original</h3>

              <div
                className={
                  styles.previewBox
                }
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className={
                      styles.previewImage
                    }
                  />
                ) : (
                  <p>
                    No Image
                  </p>
                )}
              </div>
            </div>

            {/* SVG */}

            <div>
              <h3>
                SVG Result
              </h3>

              <div
                className={
                  styles.previewBox
                }
              >
                {svgUrl ? (
                  <img
                    src={svgUrl}
                    alt="SVG"
                    className={
                      styles.previewImage
                    }
                  />
                ) : (
                  <p>
                    SVG Preview
                  </p>
                )}
              </div>
            </div>
          </div>

          {svgUrl && (
            <>
              <div
                className={
                  styles.actions
                }
              >
                <a
                  href={svgUrl}
                  download="converted.svg"
                  className={
                    styles.downloadBtn
                  }
                >
                  Download SVG
                </a>

                <button
                  type="button"
                  onClick={
                    copySvg
                  }
                  className={
                    styles.copyBtn
                  }
                >
                  Copy SVG
                </button>
              </div>

              <textarea
                readOnly
                value={svgCode}
                className={
                  styles.code
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
