import { generateCode } from './grok.js';
import { getFileTree, getFileContent, createFile, updateFile, deleteFile, createFolder } from './fileManager.js';

/**
 * Process an AI agent request.
 * Takes a user prompt + current file state, asks Grok, and applies changes.
 */
export async function processAgentRequest(prompt, providedFiles = null) {
    // Build current project context from virtual FS
    const projectFiles = {};

    if (providedFiles) {
        Object.assign(projectFiles, providedFiles);
    } else {
        const tree = getFileTree();
        const collectFiles = (nodes, basePath = '') => {
            for (const node of nodes) {
                const fullPath = basePath ? `${basePath}/${node.name}` : node.name;
                if (node.type === 'file') {
                    projectFiles[fullPath] = getFileContent(fullPath);
                } else if (node.children) {
                    collectFiles(node.children, fullPath);
                }
            }
        };
        collectFiles(tree);
    }

    // Ask Grok to generate code
    const aiResponse = await generateCode(prompt, projectFiles);

    // If it returned structured files, apply them
    if (aiResponse.files && Array.isArray(aiResponse.files)) {
        const appliedFiles = [];

        for (const file of aiResponse.files) {
            try {
                // Ensure content is a string (AI sometimes returns raw JSON objects for package.json)
                const finalContent = typeof file.content === 'object'
                    ? JSON.stringify(file.content, null, 2)
                    : String(file.content || '');

                switch (file.action) {
                    case 'create':
                        // Ensure parent folders exist
                        const parts = file.path.split('/');
                        if (parts.length > 1) {
                            let folderPath = '';
                            for (let i = 0; i < parts.length - 1; i++) {
                                folderPath = folderPath ? `${folderPath}/${parts[i]}` : parts[i];
                                try {
                                    createFolder(folderPath);
                                } catch {
                                    // Folder may already exist
                                }
                            }
                        }
                        try {
                            createFile(file.path, finalContent);
                        } catch {
                            updateFile(file.path, finalContent);
                        }
                        break;

                    case 'update':
                        updateFile(file.path, finalContent);
                        break;

                    case 'delete':
                        deleteFile(file.path);
                        break;

                    default:
                        // Default to create
                        try {
                            createFile(file.path, finalContent);
                        } catch {
                            updateFile(file.path, finalContent);
                        }
                }

                appliedFiles.push({
                    path: file.path,
                    action: file.action || 'create',
                    success: true,
                });
            } catch (err) {
                console.error(`💥 Failed to save ${file.path}: ${err.message}`);
                appliedFiles.push({
                    path: file.path,
                    action: file.action || 'create',
                    success: false,
                    error: err.message,
                });
            }
        }

        return {
            explanation: aiResponse.explanation || 'Changes applied.',
            files: appliedFiles,
            raw: aiResponse,
        };
    }

    // Plain text response (question or debug)
    return {
        message: aiResponse.message || JSON.stringify(aiResponse),
    };
}
