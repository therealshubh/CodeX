import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { bootWebContainer, buildFileSystemTree, writeFilesToWebContainer } from '../../services/webcontainer.js';
import { fetchAllFiles } from '../../services/api.js';
import socket from '../../services/socket.js';
import './Terminal.css';

export default function Terminal() {
    const terminalRef = useRef(null);
    const xtermInstanceRef = useRef(null);
    const processRef = useRef(null);
    const hasInitializedRef = useRef(false);
    const webcontainerRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Prevent double initialization in React Strict Mode
        if (hasInitializedRef.current || !terminalRef.current) return;
        hasInitializedRef.current = true;

        // Initialize xterm.js
        const terminal = new XTerm({
            cursorBlink: true,
            theme: {
                background: '#1e1e1e', // VSCode style dark theme
                foreground: '#cccccc',
                cursor: '#ffffff',
                black: '#000000',
                red: '#cd3131',
                green: '#0dbc79',
                yellow: '#e5e510',
                blue: '#2472c8',
                magenta: '#bc3fbc',
                cyan: '#11a8cd',
                white: '#e5e5e5',
                brightBlack: '#666666',
                brightRed: '#f14c4c',
                brightGreen: '#23d18b',
                brightYellow: '#f5f543',
                brightBlue: '#3b8eea',
                brightMagenta: '#d670d6',
                brightCyan: '#29b8db',
                brightWhite: '#ffffff'
            },
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: 14,
            convertEol: true, // Treat \n as \r\n
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        // Attach to DOM
        terminal.open(terminalRef.current);
        fitAddon.fit();

        xtermInstanceRef.current = terminal;

        const handleResizeWindow = () => {
            if (fitAddon && terminalRef.current) {
                fitAddon.fit();
            }
        };

        window.addEventListener('resize', handleResizeWindow);

        /**
         * Sync project files from the server into the WebContainer.
         * This ensures `ls`, `cd`, `cat`, etc. see the real project files.
         */
        const syncFilesToWebContainer = async (wc) => {
            try {
                const allFiles = await fetchAllFiles();
                if (allFiles && Object.keys(allFiles).length > 0) {
                    const tree = buildFileSystemTree(allFiles);
                    await writeFilesToWebContainer(wc, tree);
                    console.log(`[Terminal] Synced ${Object.keys(allFiles).length} files into WebContainer`);
                }
            } catch (err) {
                console.warn('[Terminal] Failed to sync files:', err.message);
            }
        };

        // Boot WebContainer and spawn shell
        const initShell = async () => {
            try {
                terminal.write('\x1b[33m⏳ Booting terminal environment...\x1b[0m\r\n');

                // We rely on preview to mount files, or if this opens first, boot WebContainer
                const wc = await bootWebContainer();
                webcontainerRef.current = wc;

                // Sync project files into WebContainer BEFORE spawning the shell
                terminal.write('\x1b[33m📂 Syncing project files...\x1b[0m\r\n');
                await syncFilesToWebContainer(wc);

                // Spawn an interactive jsh (JavaScript Shell) process
                const process = await wc.spawn('jsh', {
                    terminal: {
                        cols: terminal.cols,
                        rows: terminal.rows,
                    },
                });

                processRef.current = process;

                // Pipe WebContainer output to Terminal
                process.output.pipeTo(
                    new WritableStream({
                        write(data) {
                            terminal.write(data);
                        },
                    })
                );

                // Pipe Terminal input to WebContainer process
                const writeStream = process.input.getWriter();
                terminal.onData((data) => {
                    writeStream.write(data);
                });

                // Handle Terminal resizing and notify process
                terminal.onResize((size) => {
                    process.resize({
                        cols: size.cols,
                        rows: size.rows,
                    });
                });
                
                // When window resizes, we fit the addon which will trigger onResize event automatically
                window.addEventListener('resize', handleResizeWindow);

                // Listen for file changes from the server and re-sync into WebContainer
                const handleFilesChanged = () => {
                    syncFilesToWebContainer(wc);
                };
                socket.on('files:changed', handleFilesChanged);

                // Store cleanup reference for unmount
                terminal._socketCleanup = () => {
                    socket.off('files:changed', handleFilesChanged);
                };

            } catch (err) {
                console.error('[Terminal] Startup error:', err);
                setError('Failed to start terminal: ' + err.message);
                terminal.write(`\r\n\x1b[31mTerminal Startup Error: ${err.message}\x1b[0m\r\n`);
            }
        };

        // Ensure page has COOP/COEP for WebContainers
        if (window.crossOriginIsolated) {
            initShell();
        } else {
            setError('Cross-Origin Isolation is missing. Live Terminal will not work.');
            terminal.write('\r\n\x1b[31mError: SharedArrayBuffer is not available. Please ensure the dev server uses COOP/COEP headers and do a hard refresh (Ctrl+Shift+R).\x1b[0m\r\n');
        }

        // Cleanup function for unmount
        return () => {
            window.removeEventListener('resize', handleResizeWindow);
            if (terminal._socketCleanup) {
                terminal._socketCleanup();
            }
            if (processRef.current) {
                processRef.current.kill();
            }
            terminal.dispose();
            hasInitializedRef.current = false;
        };
    }, []);

    return (
        <div className="terminal">
            {error && (
                <div className="terminal__error">
                    <span>{error}</span>
                </div>
            )}
            <div
                className="terminal-container"
                ref={terminalRef}
                style={{ 
                    display: error ? 'none' : 'block',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden'
                 }}
            />
        </div>
    );
}
