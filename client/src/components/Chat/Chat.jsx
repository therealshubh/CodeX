import { useState, useRef, useCallback } from 'react';
import { VscSend, VscWand, VscComment, VscClearAll } from 'react-icons/vsc';
import { useChat } from '../../context/ChatContext.jsx';
import { useFiles } from '../../context/FileContext.jsx';
import './Chat.css';

export default function Chat() {
    const { messages, isLoading, sendMessage, sendGenerateRequest, clearChat, bottomRef } = useChat();
    const { applyGeneratedFiles, fileContents } = useFiles();
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('chat'); // 'chat' | 'generate'
    const textareaRef = useRef(null);

    const handleSend = useCallback(async () => {
        const text = input.trim();
        if (!text) return;
        setInput('');

        if (mode === 'generate') {
            const result = await sendGenerateRequest(text, fileContents);
            if (result?.files) {
                await applyGeneratedFiles(result.files);
            }
        } else {
            await sendMessage(text);
        }

        textareaRef.current?.focus();
    }, [input, mode, sendMessage, sendGenerateRequest, fileContents, applyGeneratedFiles]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat">
            <div className="panel-header">
                <span>AI Assistant</span>
                <div className="panel-header__actions">
                    <button className="icon-btn" title="Clear Chat" onClick={clearChat}>
                        <VscClearAll size={14} />
                    </button>
                </div>
            </div>

            {/* ── Messages ────────────────────────────────── */}
            <div className="chat__messages">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`chat-msg chat-msg--${msg.role} ${msg.isError ? 'chat-msg--error' : ''}`}
                    >
                        <div className="chat-msg__bubble">{msg.content}</div>
                        <span className="chat-msg__time">{formatTime(msg.timestamp)}</span>
                    </div>
                ))}

                {isLoading && (
                    <div className="chat__loading">
                        <div className="chat__loading-dots">
                            <span /><span /><span />
                        </div>
                        <span>AI is thinking...</span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── Input ───────────────────────────────────── */}
            <div className="chat__input-area">
                <div className="chat__mode-toggle">
                    <button
                        className={`chat__mode-btn ${mode === 'chat' ? 'chat__mode-btn--active' : ''}`}
                        onClick={() => setMode('chat')}
                    >
                        <VscComment size={12} /> Chat
                    </button>
                    <button
                        className={`chat__mode-btn ${mode === 'generate' ? 'chat__mode-btn--active' : ''}`}
                        onClick={() => setMode('generate')}
                    >
                        <VscWand size={12} /> Generate
                    </button>
                </div>
                <div className="chat__input-row">
                    <textarea
                        ref={textareaRef}
                        className="chat__textarea"
                        placeholder={mode === 'generate' ? 'Describe what you want to build...' : 'Ask anything about your code...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                    <button
                        className="chat__send-btn"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        title="Send"
                    >
                        <VscSend size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
