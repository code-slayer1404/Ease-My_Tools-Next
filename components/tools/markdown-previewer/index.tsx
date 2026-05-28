"use client";

import React, {
  ChangeEvent,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";

import { marked } from "marked";
import DOMPurify from "dompurify";

import styles from "./styles.module.css";

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

const MarkdownPreviewer: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(`# Welcome to the Markdown Previewer

## Get started with these examples:

### Text Formatting
You can make text **bold**, *italic*, or **_both_**. 
Create ~~strikethrough~~ and \`inline code\` too.

### Lists
**Unordered list:**
- First item
- Second item
  - Nested item
  - Another nested item

**Ordered list:**
1. Step one
2. Step two
3. Step three

### Links & Images
[Visit GitHub](https://github.com)
![Placeholder Image](https://via.placeholder.com/150x100?text=Markdown)

### Code Blocks
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("Developer"));
\`\`\`

### Blockquotes
> This is a blockquote.
> It can span multiple lines.

### Tables
| Feature | Status |
|---------|--------|
| Bold    | ✅     |
| Italic  | ✅     |
| Lists   | ✅     |
| Tables  | ✅     |

### Horizontal Rule
---

**Start typing or editing the markdown!** 🚀`);

  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Count words and characters
  useEffect(() => {
    const text = markdown;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);
  }, [markdown]);

  // Copy markdown to clipboard
  const copyMarkdown = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Clear all content
  const clearContent = (): void => {
    if (confirm("Are you sure you want to clear all content?")) {
      setMarkdown("");
    }
  };

  // Insert template
  const insertTemplate = (template: string): void => {
    const templates: Record<string, string> = {
      heading: "\n## New Heading\n",
      bold: " **bold text** ",
      italic: " *italic text* ",
      link: " [link text](https://example.com) ",
      image: " ![alt text](https://via.placeholder.com/150) ",
      code: "\n```javascript\n// Your code here\n```\n",
      list: "\n- Item 1\n- Item 2\n- Item 3\n",
      table: "\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n",
      quote: "\n> Quote text here\n",
    };

    const insertion = templates[template] || "";
    setMarkdown(prev => prev + insertion);
    
    // Focus on textarea
    textareaRef.current?.focus();
  };

  // Download markdown file
  const downloadMarkdown = (): void => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `markdown-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print preview
  const printPreview = (): void => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Markdown Preview</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            ${getPreviewStyles()}
          </style>
        </head>
        <body>
          ${parsedMarkdown}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Get preview styles for print
  const getPreviewStyles = (): string => {
    return `
      h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      h1 { font-size: 2em; border-bottom: 1px solid #eaecef; }
      h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; }
      code {
        padding: 0.2em 0.4em;
        background: #f6f8fa;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }
      pre {
        padding: 16px;
        background: #f6f8fa;
        border-radius: 6px;
        overflow-x: auto;
      }
      blockquote {
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      th, td {
        border: 1px solid #dfe2e5;
        padding: 8px 12px;
      }
      th {
        background: #f6f8fa;
      }
    `;
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Ctrl + B for bold
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        insertTemplate('bold');
      }
      // Ctrl + I for italic
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        insertTemplate('italic');
      }
      // Ctrl + K for link
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        insertTemplate('link');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // INPUT CHANGE
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setMarkdown(e.target.value);
  };

  // MARKDOWN HTML
  const parsedMarkdown = useMemo(() => {
    try {
      const rawHtml = marked.parse(markdown) as string;
      return DOMPurify.sanitize(rawHtml, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
      });
    } catch (error) {
      console.error("Markdown parsing error:", error);
      return "<p>Error parsing markdown</p>";
    }
  }, [markdown]);

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={styles.toolBtn}
            title="Toggle Sidebar"
          >
            {showSidebar ? "📖" : "📚"}
          </button>
          
          <div className={styles.divider} />
          
          <button
            onClick={() => insertTemplate("heading")}
            className={styles.toolBtn}
            title="Heading (Ctrl+H)"
          >
            H1
          </button>
          <button
            onClick={() => insertTemplate("bold")}
            className={styles.toolBtn}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => insertTemplate("italic")}
            className={styles.toolBtn}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => insertTemplate("link")}
            className={styles.toolBtn}
            title="Link (Ctrl+K)"
          >
            🔗
          </button>
          <button
            onClick={() => insertTemplate("image")}
            className={styles.toolBtn}
            title="Image"
          >
            🖼️
          </button>
          <button
            onClick={() => insertTemplate("code")}
            className={styles.toolBtn}
            title="Code Block"
          >
            &lt;/&gt;
          </button>
          <button
            onClick={() => insertTemplate("list")}
            className={styles.toolBtn}
            title="List"
          >
            📋
          </button>
          <button
            onClick={() => insertTemplate("table")}
            className={styles.toolBtn}
            title="Table"
          >
            📊
          </button>
          <button
            onClick={() => insertTemplate("quote")}
            className={styles.toolBtn}
            title="Quote"
          >
            💬
          </button>
        </div>
        
        <div className={styles.toolbarRight}>
          <span className={styles.stat}>
            📊 {wordCount} words
          </span>

          <span className={styles.stat}>
            🔤 {charCount} chars
          </span>

          <div className={styles.divider} />

          <button
            onClick={copyMarkdown}
            className={styles.toolBtn}
            title="Copy Markdown"
          >
            {isCopied ? "✅" : "📋"}
          </button>

          <button
            onClick={downloadMarkdown}
            className={styles.toolBtn}
            title="Download Markdown"
          >
            💾
          </button>

          <button
            onClick={printPreview}
            className={styles.toolBtn}
            title="Print Preview"
          >
            🖨️
          </button>

          <button
            onClick={clearContent}
            className={`${styles.toolBtn} ${styles.dangerBtn}`}
            title="Clear All"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Tabs for mobile */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "write" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("write")}
        >
          ✏️ Write
        </button>
        <button
          className={`${styles.tab} ${activeTab === "preview" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("preview")}
        >
          👁️ Preview
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Sidebar */}
        {showSidebar && (
          <div className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <h3>📚 Quick Guide</h3>
              <div className={styles.guideItem}>
                <code># Heading 1</code>
                <span>#</span>
              </div>
              <div className={styles.guideItem}>
                <code>## Heading 2</code>
                <span>##</span>
              </div>
              <div className={styles.guideItem}>
                <code>**bold**</code>
                <span>**</span>
              </div>
              <div className={styles.guideItem}>
                <code>*italic*</code>
                <span>*</span>
              </div>
              <div className={styles.guideItem}>
                <code>[link](url)</code>
                <span>[]()</span>
              </div>
              <div className={styles.guideItem}>
                <code>![alt](url)</code>
                <span>![]()</span>
              </div>
              <div className={styles.guideItem}>
                <code>`inline code`</code>
                <span>`</span>
              </div>
              <div className={styles.guideItem}>
                <code>```code block```</code>
                <span>```</span>
              </div>
              <div className={styles.guideItem}>
                <code>- list item</code>
                <span>-</span>
              </div>
              <div className={styles.guideItem}>
                <code>1. numbered list</code>
                <span>1.</span>
              </div>
              <div className={styles.guideItem}>
                <code>&gt; quote</code>
                <span>&gt;</span>
              </div>
              <div className={styles.guideItem}>
                <code>---</code>
                <span>---</span>
              </div>
            </div>
            
            <div className={styles.sidebarSection}>
              <h3>⚡ Shortcuts</h3>
              <div className={styles.shortcutItem}>
                <span>Ctrl+B</span>
                <span>Bold</span>
              </div>
              <div className={styles.shortcutItem}>
                <span>Ctrl+I</span>
                <span>Italic</span>
              </div>
              <div className={styles.shortcutItem}>
                <span>Ctrl+K</span>
                <span>Link</span>
              </div>
            </div>
          </div>
        )}

        {/* Editor and Preview */}
        <div className={`${styles.editorPreview} ${!showSidebar ? styles.expanded : ""}`}>
          <div className={`${styles.editor} ${activeTab === "preview" ? styles.hideMobile : ""}`}>
            <div className={styles.panelHeader}>
              <span>✏️ Markdown Editor</span>
              <span className={styles.panelHint}>Type your markdown here...</span>
            </div>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={markdown}
              onChange={handleChange}
              placeholder="Type Markdown here..."
            />
          </div>

          <div className={`${styles.preview} ${activeTab === "write" ? styles.hideMobile : ""}`}>
            <div className={styles.panelHeader}>
              <span>👁️ Live Preview</span>
              <span className={styles.panelHint}>Rendered HTML output</span>
            </div>
            <div
              ref={previewRef}
              className={styles.markdownPreview}
              dangerouslySetInnerHTML={{ __html: parsedMarkdown }}
            />
          </div>
        </div>
      </div>
   {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span>✨ Powered by Marked.js</span>
          <span>🛡️ Sanitized with DOMPurify</span>
        </div>
        <div className={styles.footerRight}>
          <a 
            href="https://www.markdownguide.org/cheat-sheet/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            📖 Markdown Cheat Sheet
          </a>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreviewer;