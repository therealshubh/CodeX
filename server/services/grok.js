import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

// ── Groq client ──────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an expert MERN stack developer assistant embedded in a web-based IDE called "Codex".
Your job is to help users build full-stack applications by generating high-quality, production-ready code.

Rules:
1. Always generate complete, working files — never use placeholders or "// TODO" comments.
2. Use modern JavaScript/React best practices (functional components, hooks, ES modules).
3. For the backend, use Express.js with ES module syntax (import/export), proper modular architecture (routes, controllers, models), and comprehensive error handling.
4. For the frontend, use React with Vite. Create sophisticated, beautiful, and highly interactive UI components.
5. Prioritize modern aesthetics: use vibrant colors, sleek dark modes, glassmorphism, dynamic gradients, and micro-animations to create a premium user experience. Avoid generic designs.
6. Use Tailwind CSS for styling if appropriate (ensure tailwind configuration is included), or highly structured modular CSS with CSS variables. Ensure components are responsive and look professional.
7. Include robust, realistic dummy data and comprehensive UI elements instead of bare-bones structures. The result should look like a finished, premium product.
8. When generating multiple files, clearly separate them, use a logical folder structure (e.g., components/, pages/, utils/), and specify their file paths.
9. CRITICAL: When generating a Node.js or React project, you MUST ALWAYS generate the \`package.json\` file with all required dependencies, for BOTH the client and server directories. Include UI libraries like 'framer-motion', 'lucide-react', 'clsx', 'tailwind-merge' if needed.
10. CRITICAL: When specifying dependency versions in package.json, ALWAYS use "latest" as the version (e.g., "react": "latest", "lucide-react": "latest"). NEVER guess or fabricate version numbers — incorrect versions will cause npm install to fail with ETARGET errors.
11. CRITICAL: If the project requires a build tool like Vite, you MUST generate its configuration file (e.g., \`vite.config.js\`).
12. CRITICAL: The Codex IDE server strictly runs on port 3001. When generating backend services (like Express), you MUST use a different port (e.g., 5000, 8080) to avoid \`EADDRINUSE\` conflicts. Never use port 3001.
13. CRITICAL: For React frontend code, you MUST use the \`.jsx\` file extension for any file containing JSX syntax (e.g., \`App.jsx\`, \`main.jsx\`). Vite will fail to parse JSX if the file extension is strictly \`.js\`.

Response Format:
When generating code, respond with a JSON object:
{
  "explanation": "Brief description of what was created/changed",
  "files": [
    {
      "path": "server/package.json",
      "content": "{\n  \"name\": \"my-app-server\",\n  \"dependencies\": { ... }\n}",
      "action": "create"
    },
    {
      "path": "relative/path/to/file.js",
      "content": "// file content here",
      "action": "create" | "update" | "delete"
    }
  ]
}

When answering questions or debugging, respond with plain text markdown.`;

/**
 * Retry wrapper — handles 429 rate-limit errors with exponential backoff
 */
async function withRetry(fn, retries = 3) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const is429 = err?.status === 429 ||
                err?.message?.includes('429') ||
                err?.message?.includes('Too Many Requests') ||
                err?.message?.includes('RESOURCE_EXHAUSTED') ||
                err?.message?.includes('rate_limit');

            if (is429 && attempt < retries) {
                const delay = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
                console.log(`⏳ Rate limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${retries})...`);
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
}

/**
 * Chat with Groq AI — general conversation / debugging
 */
export async function chatWithAI(message, context = {}) {
    return withRetry(async () => {
        const userMessage = context.mode === 'debug'
            ? message
            : `${message}`;

        const chatCompletion = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 4096,
        });

        const text = chatCompletion.choices[0]?.message?.content || '';
        return { message: text };
    });
}

/**
 * Generate code — structured output for the agent
 */
export async function generateCode(prompt, projectFiles = {}) {
    return withRetry(async () => {
        const fileContext = Object.keys(projectFiles).length > 0
            ? `\n\nCurrent project files:\n${Object.entries(projectFiles)
                .map(([path, content]) => `--- ${path} ---\n${content}`)
                .join('\n\n')}`
            : '';

        const fullPrompt = `${fileContext}\n\nUser request: ${prompt}\n\nRespond ONLY with valid JSON matching the response format described above.`;

        const chatCompletion = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: fullPrompt },
            ],
            temperature: 0.7,
            max_tokens: 8192,
        });

        const text = chatCompletion.choices[0]?.message?.content || '';

        // Try to parse as JSON, fall back to raw text
        try {
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleaned);
        } catch {
            return { message: text };
        }
    });
}
