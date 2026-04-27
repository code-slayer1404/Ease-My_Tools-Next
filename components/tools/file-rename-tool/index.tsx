"use client";

import React, { useState, useRef, useCallback } from 'react';
import styles from './styles.module.css';

const t = (key: string, fallback?: string) => fallback ?? key;

const FileRenameTool = () => {
  
  const [files, setFiles] = useState([]);
  const [originalFiles, setOriginalFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [renameHistory, setRenameHistory] = useState([]);

  const fileInputRef = useRef();

  // Renaming strategies
  const [namingStrategy, setNamingStrategy] = useState({
    method: 'sequential', // sequential, custom, pattern, metadata
    baseName: 'file',
    startNumber: 1,
    padding: 3,
    customPattern: '[name]_[counter]',
    case: 'original', // original, lowercase, uppercase, titlecase
    separator: '_'
  });

  // Advanced options
  const [advancedOptions, setAdvancedOptions] = useState({
    removeSpaces: false,
    replaceSpacesWith: '_',
    removeSpecialChars: false,
    allowedChars: 'a-zA-Z0-9-_ .',
    addPrefix: '',
    addSuffix: '',
    preserveExtension: true,
    dateFormat: 'YYYY-MM-DD',
    addTimestamp: false
  });

  // Handle file upload
  const handleFileUpload = useCallback((uploadedFiles) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    
    const validFiles = Array.from(uploadedFiles).filter(file => 
      file.size <= 100 * 1024 * 1024 // 100MB limit
    );

    if (validFiles.length === 0) {
      alert(t('fileTooLarge'));
      return;
    }

    const fileObjects = validFiles.map((file, index) => ({
      id: index + 1,
      originalName: file.name,
      newName: file.name,
      file: file,
      extension: file.name.split('.').pop() || '',
      nameWithoutExtension: file.name.replace(/\.[^/.]+$/, ""),
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      status: 'pending'
    }));

    setFiles(fileObjects);
    setOriginalFiles([...fileObjects]);
    generatePreview(fileObjects);
  }, [t]);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const uploadedFiles = e.dataTransfer.files;
    handleFileUpload(uploadedFiles);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Generate new names based on strategy
  const generateNewNames = useCallback((fileList) => {
    return fileList.map((file, index) => {
      let newName = '';
      const counter = (namingStrategy.startNumber + index).toString().padStart(namingStrategy.padding, '0');
      
      switch (namingStrategy.method) {
        case 'sequential':
          newName = `${namingStrategy.baseName}${namingStrategy.separator}${counter}`;
          break;
        
        case 'custom':
          newName = namingStrategy.customPattern
            .replace('[name]', file.nameWithoutExtension)
            .replace('[counter]', counter)
            .replace('[date]', new Date().toISOString().split('T')[0])
            .replace('[timestamp]', Date.now().toString());
          break;
        
        case 'pattern':
          newName = file.nameWithoutExtension;
          break;
        
        case 'metadata':
          // This would require additional metadata extraction
          newName = `${namingStrategy.baseName}_${counter}`;
          break;
        
        default:
          newName = file.nameWithoutExtension;
      }

      // Apply case transformation
      switch (namingStrategy.case) {
        case 'lowercase':
          newName = newName.toLowerCase();
          break;
        case 'uppercase':
          newName = newName.toUpperCase();
          break;
        case 'titlecase':
          newName = newName.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          break;
        default:
          // Keep original case
          break;
      }

      // Apply advanced transformations
      if (advancedOptions.removeSpaces) {
        newName = newName.replace(/\s+/g, advancedOptions.replaceSpacesWith);
      }

      if (advancedOptions.removeSpecialChars) {
        const regex = new RegExp(`[^${advancedOptions.allowedChars}]`, 'g');
        newName = newName.replace(regex, '');
      }

      if (advancedOptions.addPrefix) {
        newName = advancedOptions.addPrefix + newName;
      }

      if (advancedOptions.addSuffix) {
        newName = newName + advancedOptions.addSuffix;
      }

      if (advancedOptions.addTimestamp) {
        const timestamp = new Date().getTime();
        newName = `${newName}_${timestamp}`;
      }

      // Add extension
      if (advancedOptions.preserveExtension && file.extension) {
        newName += `.${file.extension}`;
      }

      return {
        ...file,
        newName,
        status: newName !== file.originalName ? 'modified' : 'pending'
      };
    });
  }, [namingStrategy, advancedOptions]);

  // Generate preview
  const generatePreview = useCallback((fileList = files) => {
    const updatedFiles = generateNewNames(fileList);
    setFiles(updatedFiles);
    setPreviewMode(true);
  }, [files, generateNewNames]);

  // Apply renaming
  const applyRenaming = async () => {
    if (files.length === 0) return;

    setProcessing(true);

    try {
      // In a real application, this would be an API call to rename files on the server
      // For this client-side demo, we'll simulate the process
      
      const renamedFiles = files.map(file => ({
        ...file,
        status: 'renamed',
        originalName: file.originalName // Keep track of original name
      }));

      // Add to history
      setRenameHistory(prev => [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        files: renamedFiles.map(f => ({
          original: f.originalName,
          new: f.newName
        }))
      }, ...prev]);

      setFiles(renamedFiles);
      
      // Create download package
      await createDownloadPackage(renamedFiles);
      
    } catch (error) {
      console.error('Renaming error:', error);
      alert(t('renameError'));
    } finally {
      setProcessing(false);
    }
  };

  // Create downloadable package
  const createDownloadPackage = async (renamedFiles) => {
    // Create a JSON file with renaming instructions
    const renameData = {
      timestamp: new Date().toISOString(),
      totalFiles: renamedFiles.length,
      operations: renamedFiles.map(file => ({
        originalName: file.originalName,
        newName: file.newName,
        status: file.status
      }))
    };

    const dataStr = JSON.stringify(renameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // In a real application, you would:
    // 1. Send files to server for actual renaming
    // 2. Download renamed files or get a zip package
    // 3. Handle actual file system operations
    
    console.log('Renaming operations:', renameData);
    alert(t('renameComplete'));
  };

  // Download rename report
  const downloadReport = () => {
    const report = {
      renameSession: {
        timestamp: new Date().toISOString(),
        strategy: namingStrategy,
        options: advancedOptions,
        files: files.map(f => ({
          original: f.originalName,
          new: f.newName,
          status: f.status
        }))
      }
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rename-report-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset to original names
  const resetNames = () => {
    setFiles([...originalFiles]);
    setPreviewMode(false);
  };

  // Clear all files
  const clearAll = () => {
    setFiles([]);
    setOriginalFiles([]);
    setPreviewMode(false);
    setRenameHistory([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manual name editing
  const updateFileName = (fileId, newName) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, newName, status: newName !== file.originalName ? 'modified' : 'pending' }
        : file
    ));
  };

  // Sort files
  const sortFiles = (criteria) => {
    const sortedFiles = [...files].sort((a, b) => {
      switch (criteria) {
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'size':
          return a.size - b.size;
        case 'date':
          return a.lastModified - b.lastModified;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
    setFiles(sortedFiles);
  };

  // Filter files by type
  const filterFiles = (fileType) => {
    if (fileType === 'all') {
      setFiles([...originalFiles]);
    } else {
      const filteredFiles = originalFiles.filter(file => 
        file.type.startsWith(fileType) || file.extension === fileType
      );
      setFiles(filteredFiles);
    }
  };

  // Count files by status
  const getStatusCounts = () => {
    return files.reduce((acc, file) => {
      acc[file.status] = (acc[file.status] || 0) + 1;
      return acc;
    }, {});
  };

  const statusCounts = getStatusCounts();

  return (
    <div className={styles["file-rename-tool"]}>
      <div className={styles["tool-header"]}>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </div>

      <div className={styles["rename-container"]}>
        {/* Upload Section */}
        <div className={styles["upload-section"]}>
          <div 
            className={styles["upload-area"]}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {files.length === 0 ? (
              <div className={styles["upload-content"]}>
                <div className={styles["upload-icon"]}>📁</div>
                <h3>{t('uploadArea')}</h3>
                <p>{t('dragDrop')}</p>
                <small>{t('supportedFiles')}</small>
                <small>{t('maxSize')}</small>
              </div>
            ) : (
              <div className={styles["files-summary"]}>
                <div className={styles["summary-icon"]}>📁</div>
                <div className={styles["summary-info"]}>
                  <strong>{files.length} {t('filesSelected')}</strong>
                  <div className={styles["file-stats"]}>
                    <span>📝 {statusCounts.modified || 0} {t('modified')}</span>
                    <span>⏳ {statusCounts.pending || 0} {t('pending')}</span>
                    <span>✅ {statusCounts.renamed || 0} {t('renamed')}</span>
                  </div>
                </div>
                <button 
                  className={styles["clear-btn"]}
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* File Actions */}
        {files.length > 0 && (
          <div className={styles["file-actions-section"]}>
            <div className={styles["action-buttons"]}>
              <button 
                className={`${styles["btn"]} ${styles["secondary"]}`}
                onClick={() => sortFiles('name')}
              >
                🔤 {t('sortByName')}
              </button>
              <button 
                className={`${styles["btn"]} ${styles["secondary"]}`}
                onClick={() => sortFiles('size')}
              >
                📊 {t('sortBySize')}
              </button>
              <button 
                className={`${styles["btn"]} ${styles["secondary"]}`}
                onClick={() => sortFiles('date')}
              >
                📅 {t('sortByDate')}
              </button>
              
              <select 
                className={styles["filter-select"]}
                onChange={(e) => filterFiles(e.target.value)}
                defaultValue="all"
              >
                <option value="all">📁 {t('allFiles')}</option>
                <option value="image">🖼️ {t('images')}</option>
                <option value="video">🎥 {t('videos')}</option>
                <option value="audio">🎵 {t('audio')}</option>
                <option value="pdf">📄 PDF</option>
                <option value="document">📝 {t('documents')}</option>
              </select>
            </div>
          </div>
        )}

        {/* Naming Strategy Section */}
        {files.length > 0 && (
          <div className={styles["strategy-section"]}>
            <h3>{t('namingStrategy')}</h3>
            
            <div className={styles["strategy-grid"]}>
              {/* Method Selection */}
              <div className={styles["strategy-group"]}>
                <label>{t('renameMethod')}</label>
                <div className={styles["method-options"]}>
                  {[
                    { value: 'sequential', label: t('sequential'), icon: '🔢', description: t('sequentialDesc') },
                    { value: 'custom', label: t('customPattern'), icon: '🎨', description: t('customDesc') },
                    { value: 'pattern', label: t('keepPattern'), icon: '📝', description: t('patternDesc') },
                    { value: 'metadata', label: t('metadata'), icon: '🏷️', description: t('metadataDesc') }
                  ].map(method => (
                    <div
                      key={method.value}
                      className={`${styles["method-option"]} ${namingStrategy.method === method.value ? styles["active"] : ""}`}
                      onClick={() => setNamingStrategy(prev => ({ ...prev, method: method.value }))}
                    >
                      <span className={styles["method-icon"]}>{method.icon}</span>
                      <div className={styles["method-info"]}>
                        <span className={styles["method-label"]}>{method.label}</span>
                        <span className={styles["method-description"]}>{method.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Method-specific settings */}
              {namingStrategy.method === 'sequential' && (
                <div className={styles["method-settings"]}>
                  <div className={styles["setting-row"]}>
                    <label>{t('baseName')}</label>
                    <input
                      type="text"
                      value={namingStrategy.baseName}
                      onChange={(e) => setNamingStrategy(prev => ({ ...prev, baseName: e.target.value }))}
                      placeholder={t('baseNamePlaceholder')}
                    />
                  </div>
                  <div className={styles["setting-row"]}>
                    <label>{t('startNumber')}</label>
                    <input
                      type="number"
                      value={namingStrategy.startNumber}
                      onChange={(e) => setNamingStrategy(prev => ({ ...prev, startNumber: parseInt(e.target.value) }))}
                      min="1"
                    />
                  </div>
                  <div className={styles["setting-row"]}>
                    <label>{t('numberPadding')}</label>
                    <input
                      type="number"
                      value={namingStrategy.padding}
                      onChange={(e) => setNamingStrategy(prev => ({ ...prev, padding: parseInt(e.target.value) }))}
                      min="1"
                      max="6"
                    />
                  </div>
                </div>
              )}

              {namingStrategy.method === 'custom' && (
                <div className={styles["method-settings"]}>
                  <div className={styles["setting-row"]}>
                    <label>{t('customPattern')}</label>
                    <input
                      type="text"
                      value={namingStrategy.customPattern}
                      onChange={(e) => setNamingStrategy(prev => ({ ...prev, customPattern: e.target.value }))}
                      placeholder="[name]_[counter]_[date]"
                    />
                  </div>
                  <div className={styles["pattern-help"]}>
                    <small>{t('patternHelp')}: [name], [counter], [date], [timestamp]</small>
                  </div>
                </div>
              )}

              {/* Case Transformation */}
              <div className={styles["strategy-group"]}>
                <label>{t('caseTransformation')}</label>
                <div className={styles["case-options"]}>
                  {[
                    { value: 'original', label: t('originalCase') },
                    { value: 'lowercase', label: t('lowercase') },
                    { value: 'uppercase', label: t('uppercase') },
                    { value: 'titlecase', label: t('titleCase') }
                  ].map(caseOption => (
                    <button
                      key={caseOption.value}
                      className={`${styles["case-btn"]} ${namingStrategy.case === caseOption.value ? styles["active"] : ""}`}
                      onClick={() => setNamingStrategy(prev => ({ ...prev, case: caseOption.value }))}
                    >
                      {caseOption.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className={styles["advanced-section"]}>
              <h4>{t('advancedOptions')}</h4>
              <div className={styles["advanced-grid"]}>
                <div className={styles["advanced-option"]}>
                  <label className={styles["checkbox-label"]}>
                    <input
                      type="checkbox"
                      checked={advancedOptions.removeSpaces}
                      onChange={(e) => setAdvancedOptions(prev => ({ ...prev, removeSpaces: e.target.checked }))}
                    />
                    <span className={styles["checkmark"]}></span>
                    {t('removeSpaces')}
                  </label>
                  {advancedOptions.removeSpaces && (
                    <select
                      value={advancedOptions.replaceSpacesWith}
                      onChange={(e) => setAdvancedOptions(prev => ({ ...prev, replaceSpacesWith: e.target.value }))}
                    >
                      <option value="_">Underscore (_)</option>
                      <option value="-">Hyphen (-)</option>
                      <option value="">Remove completely</option>
                    </select>
                  )}
                </div>

                <div className={styles["advanced-option"]}>
                  <label className={styles["checkbox-label"]}>
                    <input
                      type="checkbox"
                      checked={advancedOptions.removeSpecialChars}
                      onChange={(e) => setAdvancedOptions(prev => ({ ...prev, removeSpecialChars: e.target.checked }))}
                    />
                    <span className={styles["checkmark"]}></span>
                    {t('removeSpecialChars')}
                  </label>
                </div>

                <div className={styles["advanced-option"]}>
                  <label>{t('addPrefix')}</label>
                  <input
                    type="text"
                    value={advancedOptions.addPrefix}
                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, addPrefix: e.target.value }))}
                    placeholder={t('prefixPlaceholder')}
                  />
                </div>

                <div className={styles["advanced-option"]}>
                  <label>{t('addSuffix')}</label>
                  <input
                    type="text"
                    value={advancedOptions.addSuffix}
                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, addSuffix: e.target.value }))}
                    placeholder={t('suffixPlaceholder')}
                  />
                </div>

                <div className={styles["advanced-option"]}>
                  <label className={styles["checkbox-label"]}>
                    <input
                      type="checkbox"
                      checked={advancedOptions.preserveExtension}
                      onChange={(e) => setAdvancedOptions(prev => ({ ...prev, preserveExtension: e.target.checked }))}
                    />
                    <span className={styles["checkmark"]}></span>
                    {t('preserveExtension')}
                  </label>
                </div>

                <div className={styles["advanced-option"]}>
                  <label className={styles["checkbox-label"]}>
                    <input
                      type="checkbox"
                      checked={advancedOptions.addTimestamp}
                      onChange={(e) => setAdvancedOptions(prev => ({ ...prev, addTimestamp: e.target.checked }))}
                    />
                    <span className={styles["checkmark"]}></span>
                    {t('addTimestamp')}
                  </label>
                </div>
              </div>
            </div>

            {/* Preview & Apply Buttons */}
            <div className={styles["action-section"]}>
              <button 
                className={`${styles["btn"]} ${styles["primary"]} ${styles["preview-btn"]}`}
                onClick={() => generatePreview()}
                disabled={processing}
              >
                👁️ {t('previewChanges')}
              </button>
              
              {previewMode && (
                <button 
                  className={`${styles["btn"]} ${styles["success"]} ${styles["apply-btn"]}`}
                  onClick={applyRenaming}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className={styles["spinner"]}></span>
                      {t('applying')}...
                    </>
                  ) : (
                    `✅ ${t('applyRenaming')}`
                  )}
                </button>
              )}
              
              <button 
                className={`${styles["btn"]} ${styles["outline"]} ${styles["reset-btn"]}`}
                onClick={resetNames}
                disabled={processing}
              >
                🔄 {t('reset')}
              </button>
            </div>
          </div>
        )}

        {/* Files Preview */}
        {files.length > 0 && previewMode && (
          <div className={styles["files-preview-section"]}>
            <div className={styles["preview-header"]}>
              <h3>{t('preview')} ({files.length} {t('files')})</h3>
              <div className={styles["preview-actions"]}>
                <button 
                  className={`${styles["btn"]} ${styles["outline"]}`}
                  onClick={downloadReport}
                >
                  📊 {t('downloadReport')}
                </button>
              </div>
            </div>

            <div className={styles["files-list"]}>
              {files.map((file) => (
                <div key={file.id} className={`${styles["file-item"]} ${file.status}`}>
                  <div className={styles["file-icon"]}>
                    {file.type.startsWith('image') ? '🖼️' : 
                     file.type.startsWith('video') ? '🎥' : 
                     file.type.startsWith('audio') ? '🎵' : 
                     file.type.includes('pdf') ? '📄' : 
                     file.type.includes('document') ? '📝' : '📁'}
                  </div>
                  
                  <div className={styles["file-names"]}>
                    <div className={styles["original-name"]}>
                      <span className={styles["name-label"]}>{t('original')}:</span>
                      <span className={styles["name-value"]}>{file.originalName}</span>
                    </div>
                    <div className={styles["new-name"]}>
                      <span className={styles["name-label"]}>{t('new')}:</span>
                      <input
                        type="text"
                        value={file.newName}
                        onChange={(e) => updateFileName(file.id, e.target.value)}
                        className={styles["name-input"]}
                      />
                    </div>
                  </div>

                  <div className={styles["file-info"]}>
                    <span className={styles["file-size"]}>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <span className={`${styles["file-status"]} ${file.status}`}>
                      {file.status === 'modified' && '✏️'}
                      {file.status === 'pending' && '⏳'}
                      {file.status === 'renamed' && '✅'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {renameHistory.length > 0 && (
          <div className={styles["history-section"]}>
            <h3>{t('renameHistory')}</h3>
            <div className={styles["history-list"]}>
              {renameHistory.slice(0, 5).map(record => (
                <div key={record.id} className={styles["history-item"]}>
                  <div className={styles["history-header"]}>
                    <span className={styles["history-time"]}>
                      {new Date(record.timestamp).toLocaleString()}
                    </span>
                    <span className={styles["history-count"]}>
                      {record.files.length} {t('files')}
                    </span>
                  </div>
                  <div className={styles["history-preview"]}>
                    {record.files.slice(0, 3).map((file, idx) => (
                      <div key={idx} className={styles["history-file"]}>
                        <span className={styles["original"]}>"{file.original}"</span>
                        <span className={styles["arrow"]}>→</span>
                        <span className={styles["new"]}>"{file.new}"</span>
                      </div>
                    ))}
                    {record.files.length > 3 && (
                      <div className={styles["history-more"]}>
                        +{record.files.length - 3} more files
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className={styles["tips-section"]}>
          <h3>💡 {t('professionalTips')}</h3>
          <div className={styles["tips-grid"]}>
            <div className={styles["tip-card"]}>
              <div className={styles["tip-icon"]}>📁</div>
              <div className={styles["tip-content"]}>
                <h4>{t('tip1Title')}</h4>
                <p>{t('tip1Description')}</p>
              </div>
            </div>
            <div className={styles["tip-card"]}>
              <div className={styles["tip-icon"]}>🔢</div>
              <div className={styles["tip-content"]}>
                <h4>{t('tip2Title')}</h4>
                <p>{t('tip2Description')}</p>
              </div>
            </div>
            <div className={styles["tip-card"]}>
              <div className={styles["tip-icon"]}>🎯</div>
              <div className={styles["tip-content"]}>
                <h4>{t('tip3Title')}</h4>
                <p>{t('tip3Description')}</p>
              </div>
            </div>
            <div className={styles["tip-card"]}>
              <div className={styles["tip-icon"]}>💾</div>
              <div className={styles["tip-content"]}>
                <h4>{t('tip4Title')}</h4>
                <p>{t('tip4Description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileRenameTool;