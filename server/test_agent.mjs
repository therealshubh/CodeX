import { setWorkingDir, createFile, updateFile } from './services/fileManager.js';

// Try the exact behavior of `agent.js` with `package.json`
const testDir = 'C:\\Users\\hp\\Desktop\\test3';
setWorkingDir(testDir);

const filesToTest = [
    { path: 'server/package.json', content: '{}' },
    { path: 'client/package.json', content: '{}' },
    { path: 'package.json', content: '{}' },
    { path: '/server/package.json', content: '{}' }
];

for (const f of filesToTest) {
    try {
        console.log(`\nTesting: ${f.path}`);
        
        try {
            console.log(`  creataFile attempt:`);
            createFile(f.path, f.content);
            console.log(`  ✅ created successfully`);
        } catch (e) {
            console.error(`  ❌ createFile failed: ${e.message}`);
            console.log(`  updateFile attempt:`);
            updateFile(f.path, f.content);
            console.log(`  ✅ updated successfully`);
        }
    } catch(err) {
        console.error(`  ❌ FATAL FAIL: ${err.message}`);
    }
}
