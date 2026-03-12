import { Router } from 'express';
import { chatWithAI } from '../services/grok.js';
import { processAgentRequest } from '../services/agent.js';

/**
 * Factory — creates AI routes with access to Socket.IO
 */
export default function createAIRoutes(io) {
    const router = Router();

    // ── Chat with AI ───────────────────────────────────────
    router.post('/chat', async (req, res) => {
        try {
            const { message, context } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            const response = await chatWithAI(message, context);
            res.json(response);
        } catch (error) {
            console.error('AI Chat Error:', error);
            res.status(500).json({ error: 'Failed to get AI response' });
        }
    });

    // ── Generate / modify code via agent ───────────────────
    router.post('/generate', async (req, res) => {
        try {
            const { prompt, files } = req.body;

            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }

            const result = await processAgentRequest(prompt, files);

            // Broadcast file changes if the agent produced files
            if (result.files && Array.isArray(result.files)) {
                const changedPaths = result.files
                    .filter((f) => f.success)
                    .map((f) => f.path);

                if (changedPaths.length > 0) {
                    io.emit('files:changed', {
                        action: 'generate',
                        paths: changedPaths,
                    });
                }
            }

            res.json(result);
        } catch (error) {
            console.error('AI Generate Error:', error);
            res.status(500).json({ error: 'Failed to generate code' });
        }
    });

    // ── Debug assistance ───────────────────────────────────
    router.post('/debug', async (req, res) => {
        try {
            const { error: errorMsg, code, filename } = req.body;

            if (!errorMsg) {
                return res.status(400).json({ error: 'Error message is required' });
            }

            const response = await chatWithAI(
                `Debug this error in ${filename || 'the code'}:\n\nError: ${errorMsg}\n\nCode:\n${code || 'Not provided'}`,
                { mode: 'debug' }
            );
            res.json(response);
        } catch (error) {
            console.error('AI Debug Error:', error);
            res.status(500).json({ error: 'Failed to debug' });
        }
    });

    return router;
}
