import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3001/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// Add a request interceptor to include the Auth token
API.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch (e) {
            // ignore
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/* ── File operations ──────────────────────────────────── */

export const fetchFileTree = () =>
    API.get('/files/tree').then((r) => r.data);

export const fetchFileContent = (path) =>
    API.get('/files/content', { params: { path } }).then((r) => r.data.content);

export const createFileAPI = (path, content = '') =>
    API.post('/files/create', { path, content }).then((r) => r.data);

export const updateFileAPI = (path, content) =>
    API.put('/files/update', { path, content }).then((r) => r.data);

export const deleteFileAPI = (path) =>
    API.delete('/files/delete', { data: { path } }).then((r) => r.data);

export const createFolderAPI = (path) =>
    API.post('/files/folder', { path }).then((r) => r.data);

export const renameItemAPI = (oldPath, newPath) =>
    API.put('/files/rename', { oldPath, newPath }).then((r) => r.data);

export const openFolderAPI = (folderPath) =>
    API.post('/files/open-folder', { folderPath }).then((r) => r.data);

export const importFolderAPI = (folderName, files) =>
    API.post('/files/import-folder', { folderName, files }, { timeout: 60000 }).then((r) => r.data);

export const fetchProjectInfo = () =>
    API.get('/files/project-info').then((r) => r.data);

export const fetchAllFiles = () =>
    API.get('/files/all').then((r) => r.data);

/* ── AI operations ────────────────────────────────────── */

export const chatWithAI = (message, context = {}) =>
    API.post('/ai/chat', { message, context }).then((r) => r.data);

export const generateCode = (prompt, files = null) =>
    API.post('/ai/generate', { prompt, files }).then((r) => r.data);

export const debugCode = (error, code, filename) =>
    API.post('/ai/debug', { error, code, filename }).then((r) => r.data);

/* ── Preview ──────────────────────────────────────────── */

export const fetchPreviewBundle = () =>
    API.get('/preview/bundle').then((r) => r.data);

export default API;
