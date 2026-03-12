import { useState } from 'react';
import { VscCode, VscSettingsGear, VscRemote, VscFolderOpened } from 'react-icons/vsc';
import { useFiles } from '../../context/FileContext.jsx';
import FileExplorer from '../FileExplorer/FileExplorer.jsx';
import TabBar from '../Editor/TabBar.jsx';
import Editor from '../Editor/Editor.jsx';
import Chat from '../Chat/Chat.jsx';
import Preview from '../Preview/Preview.jsx';
import Terminal from '../Terminal/Terminal.jsx';
import './Layout.css';

export default function Layout() {
    const [bottomTab, setBottomTab] = useState('terminal');
    const { projectRoot } = useFiles();

    return (
        <div className="layout">
            {/* ── Header ──────────────────────────────────── */}
            <header className="layout__header">
                <div className="layout__logo">
                    <div className="layout__logo-icon">C</div>
                    <span>Codex</span>
                </div>
                <div className="layout__header-actions">
                    <button className="icon-btn" title="Settings">
                        <VscSettingsGear size={16} />
                    </button>
                </div>
            </header>

            {/* ── Sidebar ─────────────────────────────────── */}
            <aside className="layout__sidebar">
                <FileExplorer />
            </aside>

            {/* ── Editor area ─────────────────────────────── */}
            <main className="layout__editor">
                <div className="layout__editor-main">
                    <TabBar />
                    <Editor />
                </div>
                <div className="layout__editor-bottom">
                    <div className="panel-header">
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                className={`bottom-tab-btn ${bottomTab === 'terminal' ? 'bottom-tab-btn--active' : ''}`}
                                onClick={() => setBottomTab('terminal')}
                            >
                                Terminal
                            </button>
                            <button
                                className={`bottom-tab-btn ${bottomTab === 'preview' ? 'bottom-tab-btn--active' : ''}`}
                                onClick={() => setBottomTab('preview')}
                            >
                                Preview
                            </button>
                        </div>
                    </div>
                    {bottomTab === 'terminal' ? <Terminal /> : <Preview />}
                </div>
            </main>

            {/* ── Right panel (Chat) ──────────────────────── */}
            <aside className="layout__right">
                <Chat />
            </aside>

            {/* ── Status bar ──────────────────────────────── */}
            <footer className="layout__statusbar">
                <div className="layout__statusbar-left">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <VscRemote size={14} /> Codex
                    </span>
                </div>
                <div className="layout__statusbar-right">
                    {projectRoot && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                            <VscFolderOpened size={12} />
                            {projectRoot.split(/[\\/]/).pop()}
                        </span>
                    )}
                    <span>Ready</span>
                </div>
            </footer>
        </div>
    );
}
