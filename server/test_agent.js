import { setWorkingDir, createFile } from './services/fileManager.js';
import path from 'path';

// emulate file saving to see if throwing happens
const workingDirTest = path.resolve('projects', 'test_agent_save');
setWorkingDir(workingDirTest);

const testFiles = [
    { path: 'server/package.json', content: '{}' },
    { path: 'client/package.json', content: '{}' },
    { path: '/server/package.json', content: '{}' }, // maybe the AI adds a leading slash?
];

testFiles.forEach(f => {
    try {
        console.log(`Trying: ${f.path}`);
        createFile(f.path, f.content);
        console.log(`✅ Success`);
    } catch(err) {
        console.error(`❌ Error: ${err.message}`);
    }
});
