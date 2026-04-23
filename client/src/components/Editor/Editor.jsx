import { useCallback, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { VscCode } from 'react-icons/vsc';
import { useFiles } from '../../context/FileContext.jsx';
import './Editor.css';

/* ── Language detection from file extension ──────────── */
function getLanguage(filename) {
    if (!filename) return 'plaintext';
    const ext = filename.split('.').pop()?.toLowerCase();
    const map = {
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        json: 'json',
        css: 'css',
        scss: 'scss',
        html: 'html',
        htm: 'html',
        md: 'markdown',
        py: 'python',
        rb: 'ruby',
        java: 'java',
        go: 'go',
        rs: 'rust',
        sh: 'shell',
        bash: 'shell',
        yml: 'yaml',
        yaml: 'yaml',
        xml: 'xml',
        sql: 'sql',
        env: 'ini',
        gitignore: 'plaintext',
    };
    return map[ext] || 'plaintext';
}

export default function Editor() {
    const { activeFile, fileContents, updateContent, loading } = useFiles();
    const debounceTimer = useRef(null);

    const content = activeFile ? (fileContents[activeFile] ?? '') : '';
    const language = activeFile ? getLanguage(activeFile) : 'plaintext';

    const handleChange = useCallback((value) => {
        if (!activeFile) return;

        // Debounce content updates (300ms)
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            updateContent(activeFile, value || '');
        }, 300);
    }, [activeFile, updateContent]);

    /* ── Empty state ──────────────────────────────────── */
    if (!activeFile) {
        return (
            <div className="editor-container">
                <div className="editor-empty">
                    <VscCode className="editor-empty__icon" />
                    <div className="editor-empty__title">Codex</div>
                    <div className="editor-empty__hint">
                        Open a file from the explorer, or use the AI chat to generate a new project.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="editor-container">
            {loading ? (
                <div className="editor-empty">
                    <div className="editor-empty__hint">Loading file...</div>
                </div>
            ) : (
                <MonacoEditor
                    height="100%"
                    theme="vs-dark"
                    language={language}
                    value={content}
                    onChange={handleChange}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontLigatures: true,
                        minimap: { enabled: true, scale: 1 },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        tabSize: 2,
                        renderWhitespace: 'selection',
                        bracketPairColorization: { enabled: true },
                        autoIndent: 'full',
                        formatOnPaste: true,
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        padding: { top: 12 },
                    }}
                />
            )}
        </div>
    );
}
