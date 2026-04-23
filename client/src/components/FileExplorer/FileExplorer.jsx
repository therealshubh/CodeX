import { useState, useEffect, useCallback, useRef } from 'react';
import {
    VscChevronRight,
    VscNewFile,
    VscNewFolder,
    VscRefresh,
    VscFolder,
    VscFolderOpened,
    VscFile,
    VscJson,
    VscSymbolMisc,
    VscEdit,
    VscTrash,
} from 'react-icons/vsc';
import { useFiles } from '../../context/FileContext.jsx';
import './FileExplorer.css';

/* ── Helpers ────────────────────────────────────────── */
function getFileIcon(name) {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'js':
        case 'jsx':
            return <VscSymbolMisc style={{ color: '#f0db4f' }} />;
        case 'json':
            return <VscJson style={{ color: '#5bb85d' }} />;
        case 'css':
            return <VscFile style={{ color: '#58a6ff' }} />;
        case 'html':
            return <VscFile style={{ color: '#e44d26' }} />;
        case 'md':
            return <VscFile style={{ color: '#58a6ff' }} />;
        default:
            return <VscFile />;
    }
}

/* ── Tree Item ──────────────────────────────────────── */
function TreeItem({ node, depth = 0, onContextMenu }) {
    const { openFile, activeFile } = useFiles();
    const [expanded, setExpanded] = useState(depth < 2);

    const isFolder = node.type === 'folder';
    const isActive = !isFolder && activeFile === node.path;

    const handleClick = () => {
        if (isFolder) {
            setExpanded((prev) => !prev);
        } else {
            openFile(node.path);
        }
    };

    return (
        <>
            <div
                className={`tree-item ${isActive ? 'tree-item--active' : ''}`}
                style={{ '--depth': depth }}
                onClick={handleClick}
                onContextMenu={(e) => onContextMenu(e, node)}
            >
                {isFolder && (
                    <span className={`tree-item__icon tree-item__icon--chevron ${expanded ? 'open' : ''}`}>
                        <VscChevronRight />
                    </span>
                )}
                {!isFolder && <span style={{ width: 14 }} />}
                <span className={`tree-item__icon ${isFolder ? 'tree-item__icon--folder' : 'tree-item__icon--file'}`}>
                    {isFolder ? (expanded ? <VscFolderOpened /> : <VscFolder />) : getFileIcon(node.name)}
                </span>
                <span className="tree-item__name">{node.name}</span>
            </div>
            {isFolder && expanded && node.children && (
                node.children
                    .sort((a, b) => {
                        // Folders first, then files, alphabetical
                        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                        return a.name.localeCompare(b.name);
                    })
                    .map((child) => (
                        <TreeItem
                            key={child.path}
                            node={child}
                            depth={depth + 1}
                            onContextMenu={onContextMenu}
                        />
                    ))
            )}
        </>
    );
}

/* ── File Explorer ──────────────────────────────────── */
export default function FileExplorer() {
    const { fileTree, refreshTree, createNewFile, createNewFolder, deleteItem, renameItem, projectRoot, openFolder } = useFiles();
    const [contextMenu, setContextMenu] = useState(null);
    const [inputMode, setInputMode] = useState(null);
    const [importStatus, setImportStatus] = useState(null); // null | 'picking' | 'reading' | 'uploading' | 'error'
    const [importError, setImportError] = useState('');
    const inputRef = useRef(null);

    /* ── Context menu ─────────────────────────────────── */
    const handleContextMenu = useCallback((e, node) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    }, []);

    const closeContextMenu = useCallback(() => setContextMenu(null), []);

    useEffect(() => {
        const handler = () => closeContextMenu();
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [closeContextMenu]);

    /* ── Input handling ───────────────────────────────── */
    useEffect(() => {
        if (inputMode && inputRef.current) {
            inputRef.current.focus();
            if (inputMode.type === 'rename') {
                inputRef.current.value = inputMode.node.name;
                inputRef.current.select();
            }
        }
    }, [inputMode]);

    const handleInputSubmit = async (value) => {
        if (!value.trim()) {
            setInputMode(null);
            return;
        }

        if (inputMode.type === 'newFile') {
            const path = inputMode.parentPath ? `${inputMode.parentPath}/${value}` : value;
            await createNewFile(path);
        } else if (inputMode.type === 'newFolder') {
            const path = inputMode.parentPath ? `${inputMode.parentPath}/${value}` : value;
            await createNewFolder(path);
        } else if (inputMode.type === 'rename') {
            const parts = inputMode.node.path.split('/');
            parts.pop();
            const newPath = parts.length > 0 ? `${parts.join('/')}/${value}` : value;
            await renameItem(inputMode.node.path, newPath);
        }

        setInputMode(null);
    };

    /* ── Native OS folder picker ────────────── */
    const openLocalFolder = useCallback(async () => {
        const defaultPath = 'C:\\Users\\hp\\Desktop\\CodeX-main';
        const absolutePath = prompt('Enter the absolute path to your local project folder:', defaultPath);
        
        if (!absolutePath || !absolutePath.trim()) return;

        try {
            setImportStatus('reading');
            setImportError('');
            
            // Call the backend to mount this literal directory on disk
            await openFolder(absolutePath.trim());
            setImportStatus(null);
        } catch (err) {
            console.error('Open folder error:', err);
            setImportError(err?.response?.data?.error || err.message || 'Failed to open folder');
            setImportStatus('error');
        }
    }, [openFolder]);

    /* ── Root-level context ───────────────────────────── */
    const handleRootContext = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, node: null });
    };

    return (
        <div className="file-explorer">
            <div className="panel-header">
                <span>Explorer</span>
                <div className="panel-header__actions">
                    <button
                        className="icon-btn"
                        title="Open Local Folder"
                        onClick={openLocalFolder}
                        disabled={importStatus === 'reading' || importStatus === 'uploading'}
                    >
                        <VscFolderOpened size={14} />
                    </button>
                    <button
                        className="icon-btn"
                        title="New File"
                        onClick={() => setInputMode({ type: 'newFile', parentPath: '' })}
                    >
                        <VscNewFile size={14} />
                    </button>
                    <button
                        className="icon-btn"
                        title="New Folder"
                        onClick={() => setInputMode({ type: 'newFolder', parentPath: '' })}
                    >
                        <VscNewFolder size={14} />
                    </button>
                    <button className="icon-btn" title="Refresh" onClick={refreshTree}>
                        <VscRefresh size={14} />
                    </button>
                </div>
            </div>

            {/* ── Import progress banner */}
            {importStatus && importStatus !== 'error' && (
                <div style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--accent)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {importStatus === 'picking' && '📂 Opening folder picker...'}
                    {importStatus === 'reading' && '📖 Reading project files...'}
                    {importStatus === 'uploading' && '⬆️ Importing to Codex...'}
                </div>
            )}
            {importStatus === 'error' && (
                <div style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--error, #f47174)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>⚠️ {importError}</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => setImportStatus(null)}>✕</button>
                </div>
            )}

            <div className="file-explorer__tree" onContextMenu={handleRootContext}>
                {/* Project root label */}
                {projectRoot && (
                    <div className="file-explorer__project-root">
                        <VscFolderOpened size={13} />
                        <span title={projectRoot}>{projectRoot.split(/[\\/]/).pop()}</span>
                    </div>
                )}

                {fileTree.length === 0 && (
                    <div style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
                        No files yet. Click 📂 to open a folder, or use AI chat to generate a project.
                    </div>
                )}

                {fileTree
                    .sort((a, b) => {
                        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                        return a.name.localeCompare(b.name);
                    })
                    .map((node) => (
                        <TreeItem
                            key={node.path}
                            node={node}
                            depth={0}
                            onContextMenu={handleContextMenu}
                        />
                    ))}

                {/* Inline input for new file/folder */}
                {inputMode && (
                    <div className="tree-item" style={{ '--depth': 0 }}>
                        <span style={{ width: 14 }} />
                        <span className="tree-item__icon tree-item__icon--file">
                            {inputMode.type === 'newFolder' ? <VscFolder /> : <VscFile />}
                        </span>
                        <input
                            ref={inputRef}
                            className="tree-item__input"
                            placeholder={inputMode.type === 'rename' ? 'New name' : inputMode.type === 'newFolder' ? 'folder name' : 'filename.ext'}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInputSubmit(e.target.value);
                                if (e.key === 'Escape') setInputMode(null);
                            }}
                            onBlur={(e) => handleInputSubmit(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* ── Context Menu ────────────────────────────── */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    <button
                        className="context-menu__item"
                        onClick={() => {
                            const parentPath = contextMenu.node?.type === 'folder' ? contextMenu.node.path : '';
                            setInputMode({ type: 'newFile', parentPath });
                            closeContextMenu();
                        }}
                    >
                        <VscNewFile size={14} /> New File
                    </button>
                    <button
                        className="context-menu__item"
                        onClick={() => {
                            const parentPath = contextMenu.node?.type === 'folder' ? contextMenu.node.path : '';
                            setInputMode({ type: 'newFolder', parentPath });
                            closeContextMenu();
                        }}
                    >
                        <VscNewFolder size={14} /> New Folder
                    </button>
                    {contextMenu.node && (
                        <>
                            <div className="context-menu__separator" />
                            <button
                                className="context-menu__item"
                                onClick={() => {
                                    setInputMode({ type: 'rename', node: contextMenu.node });
                                    closeContextMenu();
                                }}
                            >
                                <VscEdit size={14} /> Rename
                            </button>
                            <button
                                className="context-menu__item context-menu__item--danger"
                                onClick={() => {
                                    deleteItem(contextMenu.node.path);
                                    closeContextMenu();
                                }}
                            >
                                <VscTrash size={14} /> Delete
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
