import { Router } from 'express';
import { getAllFiles } from '../services/fileManager.js';

/**
 * Factory — creates preview routes with access to Socket.IO
 */
export default function createPreviewRoutes(_io) {
    const router = Router();

    // ── Build preview bundle with smart HTML inlining ──────
    router.get('/bundle', (_req, res) => {
        try {
            const files = getAllFiles();
            const fileKeys = Object.keys(files);

            // Find an index.html (prefer root-level, then client/)
            const htmlKey =
                fileKeys.find((k) => k === 'index.html') ||
                fileKeys.find((k) => k === 'client/index.html') ||
                fileKeys.find((k) => k.endsWith('/index.html')) ||
                fileKeys.find((k) => k.endsWith('.html'));

            if (!htmlKey) {
                return res.json({
                    html: null,
                    files,
                    error: 'No HTML file found in the project.',
                });
            }

            let html = files[htmlKey];
            const htmlDir = htmlKey.includes('/')
                ? htmlKey.substring(0, htmlKey.lastIndexOf('/'))
                : '';

            // ── Detect if this is a framework project ──────────
            const isFramework = detectFrameworkProject(files, html);

            if (isFramework) {
                // For framework projects (React, Vue, etc.), we can't
                // simply inline imports — build a info page instead
                html = buildFrameworkPreview(files, htmlKey);
            } else {
                // For simple HTML+CSS+JS projects, inline everything
                html = inlineAssets(html, htmlDir, files);
            }

            // ── Inject error-capture script ────────────────────
            html = injectErrorCapture(html);

            res.json({ html, files });
        } catch (error) {
            console.error('Preview Bundle Error:', error);
            res.status(500).json({ error: 'Failed to build preview bundle' });
        }
    });

    return router;
}

// ═══════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════

/**
 * Detect if the project uses a JS framework (React, Vue, etc.)
 * that requires a build step.
 */
function detectFrameworkProject(files, html) {
    const fileKeys = Object.keys(files);

    // Check for framework markers in any JS/JSX file
    const jsFiles = fileKeys.filter((k) =>
        /\.(js|jsx|ts|tsx)$/.test(k) && !k.includes('vite.config')
    );

    for (const key of jsFiles) {
        const content = files[key] || '';
        if (
            content.includes('import React') ||
            content.includes('from \'react\'') ||
            content.includes('from "react"') ||
            content.includes('createApp(') ||
            content.includes('from \'vue\'') ||
            content.includes('from "vue"') ||
            content.includes('ReactDOM') ||
            content.includes('from \'@angular')
        ) {
            return true;
        }
    }

    // Check for JSX files
    if (fileKeys.some((k) => /\.jsx$|\.tsx$/.test(k))) {
        return true;
    }

    // Check for package.json with framework deps
    const pkgKey = fileKeys.find((k) => k.endsWith('package.json'));
    if (pkgKey && files[pkgKey]) {
        try {
            const pkg = JSON.parse(files[pkgKey]);
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (deps.react || deps.vue || deps['@angular/core'] || deps.svelte) {
                return true;
            }
        } catch { /* ignore parse error */ }
    }

    // Check if HTML references module scripts with bare imports
    if (html.includes('type="module"') || html.includes("type='module'")) {
        // Module scripts that import from bare specifiers need a bundler
        for (const key of jsFiles) {
            const content = files[key] || '';
            // Bare import specifiers (not starting with . or /)
            if (/import\s+.*\s+from\s+['"][^./]/.test(content)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * For framework projects, build a helpful preview page showing
 * the project structure and instructions.
 */
function buildFrameworkPreview(files, htmlKey) {
    const fileKeys = Object.keys(files);

    // Try to find meaningful content to show
    const htmlContent = files[htmlKey] || '';

    // Try extracting just the HTML body content without scripts
    let bodyContent = '';
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        // Remove script tags but keep static HTML
        bodyContent = bodyMatch[1]
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .trim();
    }

    const cssFiles = fileKeys.filter((k) => /\.css$/.test(k));
    let combinedCSS = '';
    for (const cssKey of cssFiles) {
        combinedCSS += `/* ${cssKey} */\n${files[cssKey]}\n\n`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Preview</title>
    <style>
        ${combinedCSS}

        /* Preview info styles */
        .preview-info {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 480px;
            margin: 40px auto;
            padding: 24px;
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 10px;
            color: #e6edf3;
        }
        .preview-info h3 {
            margin: 0 0 8px;
            color: #FF9933;
            font-size: 14px;
        }
        .preview-info p {
            margin: 0 0 16px;
            font-size: 12px;
            color: #8b949e;
            line-height: 1.6;
        }
        .preview-info .file-list {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #58a6ff;
            list-style: none;
            padding: 0;
        }
        .preview-info .file-list li {
            padding: 3px 0;
        }
        .preview-info .file-list li::before {
            content: "📄 ";
        }
        body {
            background: #0d1117;
            margin: 0;
        }
    </style>
</head>
<body>
    ${bodyContent || '<div id="root"></div>'}
    <div class="preview-info">
        <h3>⚡ Framework Project Detected</h3>
        <p>This project uses a JavaScript framework (React, Vue, etc.) that requires a build tool like Vite or Webpack to run. The preview shows the static HTML and CSS content.</p>
        <p><strong>Project files (${fileKeys.length}):</strong></p>
        <ul class="file-list">
            ${fileKeys.slice(0, 15).map((f) => `<li>${f}</li>`).join('\n            ')}
            ${fileKeys.length > 15 ? `<li>… and ${fileKeys.length - 15} more</li>` : ''}
        </ul>
    </div>
</body>
</html>`;
}

/**
 * Inline CSS <link> tags and <script src> tags for simple projects.
 */
function inlineAssets(html, htmlDir, files) {
    // ── Inline <link rel="stylesheet" href="..."> ──────
    html = html.replace(
        /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
        (_match, href) => {
            const cssPath = resolvePath(htmlDir, href);
            if (files[cssPath]) {
                return `<style>/* ${href} */\n${files[cssPath]}\n</style>`;
            }
            return _match;
        }
    );

    // Also handle href before rel
    html = html.replace(
        /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*\/?>/gi,
        (_match, href) => {
            const cssPath = resolvePath(htmlDir, href);
            if (files[cssPath]) {
                return `<style>/* ${href} */\n${files[cssPath]}\n</style>`;
            }
            return _match;
        }
    );

    // ── Inline <script src="..."> ──────────────────────
    html = html.replace(
        /<script\s+([^>]*)src=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
        (_match, before, src, after) => {
            const jsPath = resolvePath(htmlDir, src);
            if (files[jsPath]) {
                // Preserve type="module" and other attributes
                const attrs = (before + after).trim();
                const attrStr = attrs ? ` ${attrs}` : '';
                return `<script${attrStr}>/* ${src} */\n${files[jsPath]}\n</script>`;
            }
            return _match;
        }
    );

    return html;
}

/**
 * Inject an error-capture script into the HTML for debugging.
 */
function injectErrorCapture(html) {
    const errorScript = `
<script>
window.addEventListener('error', function(e) {
    window.parent.postMessage({
        type: 'preview-error',
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
    }, '*');
});
window.addEventListener('unhandledrejection', function(e) {
    window.parent.postMessage({
        type: 'preview-error',
        message: e.reason?.message || String(e.reason),
    }, '*');
});
</script>`;

    if (html.includes('</head>')) {
        return html.replace('</head>', `${errorScript}\n</head>`);
    } else if (html.includes('<body')) {
        return html.replace(/<body([^>]*)>/i, `<body$1>\n${errorScript}`);
    }
    return errorScript + '\n' + html;
}

/**
 * Resolve a relative path from an HTML file's directory.
 */
function resolvePath(base, href) {
    const cleaned = href.replace(/^\.\//, '');
    return base ? `${base}/${cleaned}` : cleaned;
}
