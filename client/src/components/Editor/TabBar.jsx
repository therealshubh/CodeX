import { VscClose } from 'react-icons/vsc';
import { useFiles } from '../../context/FileContext.jsx';

export default function TabBar() {
    const { openFiles, activeFile, setActiveFile, closeFile, modifiedFiles } = useFiles();

    if (openFiles.length === 0) return null;

    return (
        <div className="tab-bar">
            {openFiles.map((path) => {
                const filename = path.split('/').pop();
                const isActive = path === activeFile;
                const isModified = modifiedFiles.has(path);

                return (
                    <div
                        key={path}
                        className={`tab ${isActive ? 'tab--active' : ''}`}
                        onClick={() => setActiveFile(path)}
                    >
                        {isModified && <span className="tab__modified" />}
                        <span className="truncate">{filename}</span>
                        <button
                            className="tab__close"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeFile(path);
                            }}
                            title="Close"
                        >
                            <VscClose />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
