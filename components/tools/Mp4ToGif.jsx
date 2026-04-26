"use client";

// // // import React, { useState, useRef } from 'react';
// // // 
// // // import { useTheme } from '../../contexts/ThemeContext';
// // // import '../../styles/tools/Mp4ToGif.css';

// // // const Mp4ToGif = () => {
// // //     const { t } = useTranslation('mp4ToGif');
// // //     const { theme } = useTheme();
// // //     const [videoFile, setVideoFile] = useState(null);
// // //     const [videoUrl, setVideoUrl] = useState('');
// // //     const [gifUrl, setGifUrl] = useState('');
// // //     const [isConverting, setIsConverting] = useState(false);
// // //     const [isDragging, setIsDragging] = useState(false);
// // //     const [conversionInfo, setConversionInfo] = useState(null);
    
// // //     const [settings, setSettings] = useState({
// // //         startTime: 0,
// // //         duration: 5,
// // //         width: 400,
// // //         frameRate: 10,
// // //         quality: 'medium'
// // //     });

// // //     const videoRef = useRef();
// // //     const fileInputRef = useRef();

// // //     const handleFileSelect = (event) => {
// // //         const file = event.target.files[0];
// // //         if (file) {
// // //             processVideoFile(file);
// // //         }
// // //     };

// // //     const processVideoFile = (file) => {
// // //         if (!file.type.startsWith('video/')) {
// // //             alert('Please select a video file');
// // //             return;
// // //         }

// // //         if (file.size > 50 * 1024 * 1024) {
// // //             alert('File size must be less than 50MB');
// // //             return;
// // //         }

// // //         setVideoFile(file);
// // //         const url = URL.createObjectURL(file);
// // //         setVideoUrl(url);
// // //         setGifUrl('');
// // //         setConversionInfo(null);
// // //     };

// // //     const handleDragOver = (e) => {
// // //         e.preventDefault();
// // //         setIsDragging(true);
// // //     };

// // //     const handleDragLeave = (e) => {
// // //         e.preventDefault();
// // //         setIsDragging(false);
// // //     };

// // //     const handleDrop = (e) => {
// // //         e.preventDefault();
// // //         setIsDragging(false);
// // //         const file = e.dataTransfer.files[0];
// // //         if (file) {
// // //             processVideoFile(file);
// // //         }
// // //     };

// // //     const convertToGif = async () => {
// // //         if (!videoFile) {
// // //             alert('Please upload a video file first');
// // //             return;
// // //         }

// // //         setIsConverting(true);
        
// // //         try {
// // //             // Simulate conversion process (in real app, you'd use FFmpeg or similar)
// // //             await new Promise(resolve => setTimeout(resolve, 3000));
            
// // //             // Create a mock GIF (in real app, this would be the actual converted GIF)
// // //             const mockGifUrl = 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Converted+GIF+Preview';
            
// // //             setGifUrl(mockGifUrl);
// // //             setConversionInfo({
// // //                 originalSize: formatFileSize(videoFile.size),
// // //                 gifSize: '1.2 MB',
// // //                 duration: `${settings.duration}s`,
// // //                 compression: '75%'
// // //             });
// // //         } catch (error) {
// // //             alert('Error converting video to GIF: ' + error.message);
// // //         } finally {
// // //             setIsConverting(false);
// // //         }
// // //     };

// // //     const clearAll = () => {
// // //         setVideoFile(null);
// // //         setVideoUrl('');
// // //         setGifUrl('');
// // //         setConversionInfo(null);
// // //         if (fileInputRef.current) {
// // //             fileInputRef.current.value = '';
// // //         }
// // //         if (videoRef.current) {
// // //             videoRef.current.load();
// // //         }
// // //     };

// // //     const downloadGif = () => {
// // //         if (gifUrl) {
// // //             const a = document.createElement('a');
// // //             a.href = gifUrl;
// // //             a.download = 'converted.gif';
// // //             a.click();
// // //         }
// // //     };

// // //     const formatFileSize = (bytes) => {
// // //         if (bytes === 0) return '0 Bytes';
// // //         const k = 1024;
// // //         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
// // //         const i = Math.floor(Math.log(bytes) / Math.log(k));
// // //         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// // //     };

// // //     const updateSetting = (key, value) => {
// // //         setSettings(prev => ({
// // //             ...prev,
// // //             [key]: value
// // //         }));
// // //     };

// // //     return (
// // //         <div className={`mp4-to-gif ${theme}`}>
// // //             <div className="tool-header">
// // //                 <h1>{"MP4 to GIF Converter"}</h1>
// // //                 <p>{"Convert MP4 videos to animated GIFs"}</p>
// // //             </div>

// // //             <div className="converter-container">
// // //                 <div className="upload-section">
// // //                     <div 
// // //                         className={`drop-zone ${isDragging ? 'dragging' : ''} ${videoFile ? 'has-file' : ''}`}
// // //                         onDragOver={handleDragOver}
// // //                         onDragLeave={handleDragLeave}
// // //                         onDrop={handleDrop}
// // //                     >
// // //                         <input
// // //                             ref={fileInputRef}
// // //                             type="file"
// // //                             accept="video/*"
// // //                             onChange={handleFileSelect}
// // //                             className="file-input"
// // //                         />
// // //                         {!videoFile ? (
// // //                             <div className="upload-content">
// // //                                 <div className="upload-icon">🎥</div>
// // //                                 <span className="upload-text">{"Upload MP4 Video"}</span>
// // //                                 <span className="drag-text">{"or drag and drop MP4 file here"}</span>
// // //                                 <div className="file-info">
// // //                                     <span>{"Supported formats: MP4, MOV, AVI"}</span>
// // //                                     <span>{"Max file size: 50MB"}</span>
// // //                                 </div>
// // //                             </div>
// // //                         ) : (
// // //                             <div className="file-preview">
// // //                                 <div className="file-icon">✅</div>
// // //                                 <span className="file-name">{videoFile.name}</span>
// // //                                 <span className="file-size">{formatFileSize(videoFile.size)}</span>
// // //                             </div>
// // //                         )}
// // //                     </div>
// // //                 </div>

// // //                 {videoUrl && (
// // //                     <div className="video-preview">
// // //                         <h3>{"Preview"}</h3>
// // //                         <video
// // //                             ref={videoRef}
// // //                             src={videoUrl}
// // //                             controls
// // //                             className="video-player"
// // //                         />
// // //                     </div>
// // //                 )}

// // //                 <div className="settings-section">
// // //                     <h3>{"Conversion Settings"}</h3>
// // //                     <div className="settings-grid">
// // //                         <div className="setting-group">
// // //                             <label>{"Start Time (seconds)"}</label>
// // //                             <input
// // //                                 type="number"
// // //                                 value={settings.startTime}
// // //                                 onChange={(e) => updateSetting('startTime', parseInt(e.target.value) || 0)}
// // //                                 min="0"
// // //                                 step="1"
// // //                             />
// // //                         </div>

// // //                         <div className="setting-group">
// // //                             <label>{"Duration (seconds)"}</label>
// // //                             <input
// // //                                 type="number"
// // //                                 value={settings.duration}
// // //                                 onChange={(e) => updateSetting('duration', parseInt(e.target.value) || 1)}
// // //                                 min="1"
// // //                                 max="30"
// // //                                 step="1"
// // //                             />
// // //                         </div>

// // //                         <div className="setting-group">
// // //                             <label>{"GIF Width (pixels)"}</label>
// // //                             <input
// // //                                 type="number"
// // //                                 value={settings.width}
// // //                                 onChange={(e) => updateSetting('width', parseInt(e.target.value) || 100)}
// // //                                 min="100"
// // //                                 max="800"
// // //                                 step="50"
// // //                             />
// // //                         </div>

// // //                         <div className="setting-group">
// // //                             <label>{"Frame Rate (FPS)"}</label>
// // //                             <select 
// // //                                 value={settings.frameRate} 
// // //                                 onChange={(e) => updateSetting('frameRate', parseInt(e.target.value))}
// // //                             >
// // //                                 <option value={5}>5 FPS</option>
// // //                                 <option value={10}>10 FPS</option>
// // //                                 <option value={15}>15 FPS</option>
// // //                                 <option value={24}>24 FPS</option>
// // //                                 <option value={30}>30 FPS</option>
// // //                             </select>
// // //                         </div>

// // //                         <div className="setting-group">
// // //                             <label>{"Quality"}</label>
// // //                             <select 
// // //                                 value={settings.quality} 
// // //                                 onChange={(e) => updateSetting('quality', e.target.value)}
// // //                             >
// // //                                 <option value="low">{"Low"}</option>
// // //                                 <option value="medium">{"Medium"}</option>
// // //                                 <option value="high">{"High"}</option>
// // //                             </select>
// // //                         </div>
// // //                     </div>
// // //                 </div>

// // //                 <div className="action-buttons">
// // //                     <button 
// // //                         onClick={convertToGif} 
// // //                         className="primary-btn"
// // //                         disabled={!videoFile || isConverting}
// // //                     >
// // //                         {isConverting ? "Converting..." : "Convert to GIF"}
// // //                     </button>
// // //                     <button onClick={clearAll} className="secondary-btn">
// // //                         {"Clear"}
// // //                     </button>
// // //                 </div>

// // //                 {conversionInfo && (
// // //                     <div className="conversion-info">
// // //                         <h3>{"Conversion Information"}</h3>
// // //                         <div className="info-grid">
// // //                             <div className="info-item">
// // //                                 <span className="info-label">{"Original Size"}:</span>
// // //                                 <span className="info-value">{conversionInfo.originalSize}</span>
// // //                             </div>
// // //                             <div className="info-item">
// // //                                 <span className="info-label">{"GIF Size"}:</span>
// // //                                 <span className="info-value">{conversionInfo.gifSize}</span>
// // //                             </div>
// // //                             <div className="info-item">
// // //                                 <span className="info-label">{"Duration"}:</span>
// // //                                 <span className="info-value">{conversionInfo.duration}</span>
// // //                             </div>
// // //                             <div className="info-item">
// // //                                 <span className="info-label">{"Compression"}:</span>
// // //                                 <span className="info-value">{conversionInfo.compression}</span>
// // //                             </div>
// // //                         </div>
// // //                     </div>
// // //                 )}

// // //                 {gifUrl && (
// // //                     <div className="gif-result">
// // //                         <h3>Converted GIF</h3>
// // //                         <div className="gif-preview">
// // //                             <img src={gifUrl} alt="Converted GIF" className="gif-image" />
// // //                             <button onClick={downloadGif} className="download-btn">
// // //                                 {"Download GIF"}
// // //                             </button>
// // //                         </div>
// // //                     </div>
// // //                 )}

// // //                 <div className="conversion-tips">
// // //                     <h4>{"Conversion Tips"}</h4>
// // //                     <ul>
// // //                         <li>{"Shorter durations and lower frame rates create smaller GIFs"}</li>
// // //                         <li>{"Reduce width to decrease file size"}</li>
// // //                         <li>{"Higher quality settings produce larger files"}</li>
// // //                         <li>{"GIF format is best for short, simple animations"}</li>
// // //                     </ul>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default Mp4ToGif;


// // // import React, { useState, useRef } from 'react';
// // // 
// // // import { useTheme } from '../../contexts/ThemeContext';
// // // import '../../styles/tools/Mp4ToGif.css';

// // // const Mp4ToGif = () => {
// // //   // safe translation & theme fallbacks so component doesn't crash if contexts/namespaces are missing
// // //   const translation = (typeof useTranslation === 'function') ? useTranslation('mp4ToGif') : null;
// // //   const t = translation?.t ?? ((k) => k);
// // //   const themeContext = (typeof useTheme === 'function') ? useTheme() : { theme: 'light' };
// // //   const theme = themeContext?.theme ?? 'light';

// // //   const [videoFile, setVideoFile] = useState(null);
// // //   const [videoUrl, setVideoUrl] = useState('');
// // //   const [gifUrl, setGifUrl] = useState('');
// // //   const [isConverting, setIsConverting] = useState(false);
// // //   const [isDragging, setIsDragging] = useState(false);
// // //   const [conversionInfo, setConversionInfo] = useState(null);
// // //   const [error, setError] = useState('');

// // //   const [settings, setSettings] = useState({
// // //     startTime: 0,
// // //     duration: 5,
// // //     width: 400,
// // //     frameRate: 10,
// // //     quality: 'medium'
// // //   });

// // //   const videoRef = useRef(null);
// // //   const fileInputRef = useRef(null);

// // //   const handleFileSelect = (event) => {
// // //     setError('');
// // //     const file = event.target.files?.[0];
// // //     if (file) processVideoFile(file);
// // //   };

// // //   const processVideoFile = (file) => {
// // //     if (!file?.type || !file.type.startsWith('video/')) {
// // //       setError('Please select a video file');
// // //       return;
// // //     }

// // //     if (file.size > 50 * 1024 * 1024) {
// // //       setError('File size must be less than 50MB');
// // //       return;
// // //     }

// // //     setVideoFile(file);
// // //     const url = URL.createObjectURL(file);
// // //     setVideoUrl(url);
// // //     setGifUrl('');
// // //     setConversionInfo(null);
// // //   };

// // //   const handleDragOver = (e) => {
// // //     e.preventDefault();
// // //     e.dataTransfer.dropEffect = 'copy';
// // //     setIsDragging(true);
// // //   };

// // //   const handleDragLeave = (e) => {
// // //     e.preventDefault();
// // //     setIsDragging(false);
// // //   };

// // //   const handleDrop = (e) => {
// // //     e.preventDefault();
// // //     setIsDragging(false);
// // //     const file = e.dataTransfer.files?.[0];
// // //     if (file) processVideoFile(file);
// // //   };

// // //   // open native file dialog when drop zone is clicked
// // //   const openFileDialog = () => {
// // //     fileInputRef.current?.click();
// // //   };

// // //   const convertToGif = async () => {
// // //     if (!videoFile) {
// // //       setError('Please upload a video file first');
// // //       return;
// // //     }

// // //     setError('');
// // //     setIsConverting(true);

// // //     try {
// // //       // --- NOTE ---
// // //       // This example simulates conversion. For a real conversion you would use
// // //       // client-side ffmpeg.wasm or (recommended) send the file to a server
// // //       // that runs FFmpeg and returns the GIF.
// // //       await new Promise((resolve) => setTimeout(resolve, 1500));

// // //       // Use a tiny valid GIF data URL as a safe demo placeholder (no CORS issues)
// // //       const mockGifDataUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

// // //       setGifUrl(mockGifDataUrl);
// // //       setConversionInfo({
// // //         originalSize: formatFileSize(videoFile.size),
// // //         gifSize: '~1 KB (demo)',
// // //         duration: `${settings.duration}s`,
// // //         compression: '75% (est.)'
// // //       });
// // //     } catch (err) {
// // //       setError('Error converting video to GIF: ' + (err?.message ?? err));
// // //     } finally {
// // //       setIsConverting(false);
// // //     }
// // //   };

// // //   const clearAll = () => {
// // //     setVideoFile(null);
// // //     setVideoUrl('');
// // //     setGifUrl('');
// // //     setConversionInfo(null);
// // //     setError('');

// // //     if (fileInputRef.current) fileInputRef.current.value = null;

// // //     if (videoRef.current) {
// // //       try {
// // //         videoRef.current.pause();
// // //         videoRef.current.removeAttribute('src');
// // //         // only call .load if available
// // //         videoRef.current.load && videoRef.current.load();
// // //       } catch (e) {
// // //         // ignore
// // //       }
// // //     }
// // //   };

// // //   const downloadGif = () => {
// // //     if (!gifUrl) return;
// // //     const a = document.createElement('a');
// // //     a.href = gifUrl;
// // //     a.download = 'converted.gif';
// // //     document.body.appendChild(a);
// // //     a.click();
// // //     a.remove();
// // //   };

// // //   const formatFileSize = (bytes) => {
// // //     if (!bytes) return '0 Bytes';
// // //     const k = 1024;
// // //     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
// // //     const i = Math.floor(Math.log(bytes) / Math.log(k));
// // //     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// // //   };

// // //   const updateSetting = (key, value) => {
// // //     setSettings((prev) => ({ ...prev, [key]: value }));
// // //   };

// // //   return (
// // //     <div className={`mp4-to-gif ${theme}`}>
// // //       <div className="tool-header">
// // //         <h1>{"MP4 to GIF Converter"}</h1>
// // //         <p>{"Convert MP4 videos to animated GIFs"}</p>
// // //       </div>

// // //       <div className="converter-container">
// // //         <div className="upload-section">
// // //           <div
// // //             role="button"
// // //             tabIndex={0}
// // //             className={`drop-zone ${isDragging ? 'dragging' : ''} ${videoFile ? 'has-file' : ''}`}
// // //             onDragOver={handleDragOver}
// // //             onDragLeave={handleDragLeave}
// // //             onDrop={handleDrop}
// // //             onClick={openFileDialog}
// // //             onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFileDialog(); }}
// // //           >
// // //             <input
// // //               ref={fileInputRef}
// // //               type="file"
// // //               accept="video/*"
// // //               onChange={handleFileSelect}
// // //               className="file-input"
// // //             />

// // //             {!videoFile ? (
// // //               <div className="upload-content">
// // //                 <div className="upload-icon">🎥</div>
// // //                 <span className="upload-text">{"Upload MP4 Video"}</span>
// // //                 <span className="drag-text">{"or drag and drop MP4 file here"}</span>
// // //                 <div className="file-info">
// // //                   <span>{"Supported formats: MP4, MOV, AVI"}</span>
// // //                   <span>{"Max file size: 50MB"}</span>
// // //                 </div>
// // //               </div>
// // //             ) : (
// // //               <div className="file-preview">
// // //                 <div className="file-icon">✅</div>
// // //                 <span className="file-name">{videoFile.name}</span>
// // //                 <span className="file-size">{formatFileSize(videoFile.size)}</span>
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>

// // //         {videoUrl && (
// // //           <div className="video-preview">
// // //             <h3>{"Preview"}</h3>
// // //             <video ref={videoRef} src={videoUrl} controls className="video-player" />
// // //           </div>
// // //         )}

// // //         <div className="settings-section">
// // //           <h3>{"Conversion Settings"}</h3>
// // //           <div className="settings-grid">
// // //             <div className="setting-group">
// // //               <label>{"Start Time (seconds)"}</label>
// // //               <input
// // //                 type="number"
// // //                 value={settings.startTime}
// // //                 onChange={(e) => updateSetting('startTime', Number(e.target.value) || 0)}
// // //                 min="0"
// // //                 step="1"
// // //               />
// // //             </div>

// // //             <div className="setting-group">
// // //               <label>{"Duration (seconds)"}</label>
// // //               <input
// // //                 type="number"
// // //                 value={settings.duration}
// // //                 onChange={(e) => updateSetting('duration', Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
// // //                 min="1"
// // //                 max="30"
// // //                 step="1"
// // //               />
// // //             </div>

// // //             <div className="setting-group">
// // //               <label>{"GIF Width (pixels)"}</label>
// // //               <input
// // //                 type="number"
// // //                 value={settings.width}
// // //                 onChange={(e) => updateSetting('width', Math.min(800, Math.max(100, Number(e.target.value) || 100)))}
// // //                 min="100"
// // //                 max="800"
// // //                 step="50"
// // //               />
// // //             </div>

// // //             <div className="setting-group">
// // //               <label>{"Frame Rate (FPS)"}</label>
// // //               <select value={settings.frameRate} onChange={(e) => updateSetting('frameRate', Number(e.target.value))}>
// // //                 <option value={5}>5 FPS</option>
// // //                 <option value={10}>10 FPS</option>
// // //                 <option value={15}>15 FPS</option>
// // //                 <option value={24}>24 FPS</option>
// // //                 <option value={30}>30 FPS</option>
// // //               </select>
// // //             </div>

// // //             <div className="setting-group">
// // //               <label>{"Quality"}</label>
// // //               <select value={settings.quality} onChange={(e) => updateSetting('quality', e.target.value)}>
// // //                 <option value="low">{"Low"}</option>
// // //                 <option value="medium">{"Medium"}</option>
// // //                 <option value="high">{"High"}</option>
// // //               </select>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         <div className="action-buttons">
// // //           <button
// // //             onClick={convertToGif}
// // //             className="primary-btn"
// // //             disabled={!videoFile || isConverting}
// // //           >
// // //             {isConverting ? "Converting..." : "Convert to GIF"}
// // //           </button>

// // //           <button onClick={clearAll} className="secondary-btn">{"Clear"}</button>
// // //         </div>

// // //         {error && <div className="error-message" role="alert">{error}</div>}

// // //         {conversionInfo && (
// // //           <div className="conversion-info">
// // //             <h3>{"Conversion Information"}</h3>
// // //             <div className="info-grid">
// // //               <div className="info-item">
// // //                 <span className="info-label">{"Original Size"}:</span>
// // //                 <span className="info-value">{conversionInfo.originalSize}</span>
// // //               </div>

// // //               <div className="info-item">
// // //                 <span className="info-label">{"GIF Size"}:</span>
// // //                 <span className="info-value">{conversionInfo.gifSize}</span>
// // //               </div>

// // //               <div className="info-item">
// // //                 <span className="info-label">{"Duration"}:</span>
// // //                 <span className="info-value">{conversionInfo.duration}</span>
// // //               </div>

// // //               <div className="info-item">
// // //                 <span className="info-label">{"Compression"}:</span>
// // //                 <span className="info-value">{conversionInfo.compression}</span>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {gifUrl && (
// // //           <div className="gif-result">
// // //             <h3>{t('convertedGif') || 'Converted GIF'}</h3>
// // //             <div className="gif-preview">
// // //               <img src={gifUrl} alt="Converted GIF" className="gif-image" />
// // //               <button onClick={downloadGif} className="download-btn">{"Download GIF"}</button>
// // //             </div>
// // //           </div>
// // //         )}

// // //         <div className="conversion-tips">
// // //           <h4>{"Conversion Tips"}</h4>
// // //           <ul>
// // //             <li>{"Shorter durations and lower frame rates create smaller GIFs"}</li>
// // //             <li>{"Reduce width to decrease file size"}</li>
// // //             <li>{"Higher quality settings produce larger files"}</li>
// // //             <li>{"GIF format is best for short, simple animations"}</li>
// // //           </ul>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Mp4ToGif;





// import { useState, useRef } from "react";
// import { useTheme } from "../../contexts/ThemeContext";
// 
// import { FFmpeg } from "@ffmpeg/ffmpeg";
// import { fetchFile } from "@ffmpeg/util";

// import "../../styles/tools/mp4togif.css";

// const ffmpeg = createFFmpeg({ log: true });

// export default function Mp4ToGif() {
//   const { t } = useTranslation();
//   const { theme } = useTheme();

//   const [file, setFile] = useState(null);
//   const [gifUrl, setGifUrl] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [progress, setProgress] = useState(0);

//   const videoRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Settings
//   const [settings, setSettings] = useState({
//     width: 320,
//     height: 240,
//     fps: 10,
//     start: 0,
//     duration: 5,
//   });

//   // File select
//   const handleFileChange = (e) => {
//     const uploadedFile = e.target.files[0];
//     if (uploadedFile && uploadedFile.type.startsWith("video/")) {
//       if (uploadedFile.size > 50 * 1024 * 1024) {
//         setError("File size must be less than 50MB");
//         return;
//       }
//       setFile(uploadedFile);
//       setGifUrl(null);
//       setError("");
//       if (videoRef.current) {
//         videoRef.current.load();
//       }
//     } else {
//       setError("Please upload a valid video file");
//     }
//   };

//   // Drop Zone
//   const handleDrop = (e) => {
//     e.preventDefault();
//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile && droppedFile.type.startsWith("video/")) {
//       setFile(droppedFile);
//       setGifUrl(null);
//       setError("");
//       if (videoRef.current) {
//         videoRef.current.load();
//       }
//     }
//   };

//   // Convert function
//   const convertToGif = async () => {
//     if (!file) {
//       setError("Please upload a video first");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       setProgress(0);

//       if (!ffmpeg.isLoaded()) {
//         await ffmpeg.load();
//       }

//       ffmpeg.setProgress(({ ratio }) => {
//         setProgress(Math.round(ratio * 100));
//       });

//       ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));

//       await ffmpeg.run(
//         "-ss",
//         `${settings.start}`, // start time
//         "-t",
//         `${settings.duration}`, // duration
//         "-i",
//         "input.mp4",
//         "-vf",
//         `fps=${settings.fps},scale=${settings.width}:${settings.height}:flags=lanczos`,
//         "-f",
//         "gif",
//         "output.gif"
//       );

//       const data = ffmpeg.FS("readFile", "output.gif");
//       const url = URL.createObjectURL(new Blob([data.buffer], { type: "image/gif" }));
//       setGifUrl(url);
//     } catch (err) {
//       console.error(err);
//       setError("Conversion failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadGif = () => {
//     if (gifUrl) {
//       const a = document.createElement("a");
//       a.href = gifUrl;
//       a.download = "output.gif";
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     }
//   };

//   return (
//     <div className={`mp4-to-gif ${theme}`}>
//       <h2>{"MP4 to GIF Converter"}</h2>

//       <div
//         className="drop-zone"
//         onDrop={handleDrop}
//         onDragOver={(e) => e.preventDefault()}
//         onClick={() => fileInputRef.current?.click()}
//         tabIndex={0}
//         role="button"
//       >
//         {file ? (
//           <p>{file.name}</p>
//         ) : (
//           <p>{"Drag & Drop or Click to Upload Video"}</p>
//         )}
//         <input
//           type="file"
//           accept="video/*"
//           onChange={handleFileChange}
//           ref={fileInputRef}
//           style={{ display: "none" }}
//         />
//       </div>

//       {file && (
//         <div className="video-preview">
//           <video ref={videoRef} controls>
//             <source src={URL.createObjectURL(file)} type={file.type} />
//           </video>
//         </div>
//       )}

//       {/* Settings */}
//       <div className="settings">
//         <label>
//           Width:
//           <input
//             type="number"
//             value={settings.width}
//             onChange={(e) => setSettings({ ...settings, width: Number(e.target.value) })}
//           />
//         </label>
//         <label>
//           Height:
//           <input
//             type="number"
//             value={settings.height}
//             onChange={(e) => setSettings({ ...settings, height: Number(e.target.value) })}
//           />
//         </label>
//         <label>
//           FPS:
//           <input
//             type="number"
//             value={settings.fps}
//             onChange={(e) =>
//               setSettings({
//                 ...settings,
//                 fps: Math.max(1, Number(e.target.value)),
//               })
//             }
//           />
//         </label>
//         <label>
//           Start Time (s):
//           <input
//             type="number"
//             value={settings.start}
//             onChange={(e) => setSettings({ ...settings, start: Number(e.target.value) })}
//           />
//         </label>
//         <label>
//           Duration (s):
//           <input
//             type="number"
//             value={settings.duration}
//             onChange={(e) => setSettings({ ...settings, duration: Number(e.target.value) })}
//           />
//         </label>
//       </div>

//       {error && <p className="error">{error}</p>}
//       {loading && <p>Converting... {progress}%</p>}

//       <div className="actions">
//         <button onClick={convertToGif} disabled={loading}>
//           {loading ? "Converting..." : "Convert to GIF"}
//         </button>
//         {gifUrl && (
//           <button onClick={downloadGif}>
//             {"Download GIF"}
//           </button>
//         )}
//       </div>

//       {gifUrl && (
//         <div className="gif-preview">
//           <img src={gifUrl} alt="GIF Preview" />
//         </div>
//       )}
//     </div>
//   );
// }
