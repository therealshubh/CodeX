import { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { VscClearAll } from 'react-icons/vsc';
import './Terminal.css';

export default function Terminal() {
    const { logs, clearLogs } = useChat();
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="terminal">
            {logs.length === 0 ? (
                <div className="terminal__empty">
                    Logs will appear here when you interact with the AI...
                </div>
            ) : (
                <div className="terminal__output">
                    {logs.map((log, i) => (
                        <div key={i} className={`terminal__line terminal__line--${log.type}`}>
                            <span className="terminal__time">{formatTime(log.timestamp)}</span>
                            <span className="terminal__text">{log.text}</span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
}
