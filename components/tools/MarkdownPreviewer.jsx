"use client";

import React, { useState } from "react";
import "../../styles/tools/MarkdownPreviewer.css";
import { marked } from "marked";

const MarkdownPreviewer = () => {
    const [markdown, setMarkdown] = useState(
        `# Markdown Previewer

Type your **Markdown** text here and see the _live preview_ on the right.

- Supports **headings**
- **Bold** and _italic_
- [Links](https://example.com)
- Lists
- Code blocks

\`\`\`javascript
console.log("Hello World");
\`\`\`
`
    );

    const handleChange = (e) => setMarkdown(e.target.value);

    return (
        <div className="markdown-container">
            <textarea
                className="markdown-input"
                value={markdown}
                onChange={handleChange}
                placeholder="Type Markdown here..."
            />
            <div
                className="markdown-preview"
                dangerouslySetInnerHTML={{ __html: marked(markdown) }}
            />
        </div>
    );
};

export default MarkdownPreviewer;
