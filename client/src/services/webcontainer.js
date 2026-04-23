import { WebContainer } from '@webcontainer/api';

/** @type {WebContainer}  */
let webcontainerInstance;

/**
 * Boot WebContainer and return instance
 */
export async function bootWebContainer() {
    if (!webcontainerInstance) {
        // Call only once
        webcontainerInstance = await WebContainer.boot();
    }
    return webcontainerInstance;
}

/**
 * Format project files into WebContainer FileSystemTree.
 *
 * @param {Array} fileTree An array from the server representing the flat file paths or deep tree.
 * @param {Object} fileContents A dictionary mapping full path -> string content.
 * @returns {Object} WebContainer FileSystemTree
 */
export function buildFileSystemTree(fileContents) {
    const tree = {};

    // Helper to deeply merge paths into the tree object
    const addFileToTree = (pathParts, content, currentLevel) => {
        const part = pathParts[0];

        if (pathParts.length === 1) {
            // It's a file
            currentLevel[part] = {
                file: {
                    contents: content || '',
                },
            };
        } else {
            // It's a directory
            if (!currentLevel[part]) {
                currentLevel[part] = {
                    directory: {},
                };
            }
            addFileToTree(pathParts.slice(1), content, currentLevel[part].directory);
        }
    };

    // fileContents is a { 'path/to/file': 'content' } object
    for (const [filePath, content] of Object.entries(fileContents)) {
        const parts = filePath.split('/');
        addFileToTree(parts, content, tree);
    }

    return tree;
}

export async function writeFilesToWebContainer(webcontainer, tree) {
    await webcontainer.mount(tree);
}

export async function runCommand(webcontainer, cmd, args, terminalEl) {
    const process = await webcontainer.spawn(cmd, args);

    process.output.pipeTo(
        new WritableStream({
            write(data) {
                if (terminalEl) {
                    terminalEl.write(data);
                } else {
                    console.log(`[WC] ${data}`);
                }
            },
        })
    );

    return process;
}
