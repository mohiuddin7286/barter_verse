const fs = require('fs');
const path = require('path');

// Configuration
const outputFile = 'full_project_code.txt';
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.vscode'];
const ignoreFiles = ['package-lock.json', '.env', 'bundle.js', 'logo.png', '.DS_Store', 'README.md'];
const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.prisma', '.sql'];

// Clear output file
fs.writeFileSync(outputFile, '');

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        // Check if ignored
        if (ignoreDirs.includes(file) || ignoreFiles.includes(file)) return;

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else {
            // Check extension
            const ext = path.extname(file);
            if (allowedExtensions.includes(ext)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const header = `\n\n================================================\nFILE: ${fullPath}\n================================================\n`;
                    fs.appendFileSync(outputFile, header + content);
                    console.log(`Added: ${fullPath}`);
                } catch (err) {
                    console.error(`Skipped (error): ${fullPath}`);
                }
            }
        }
    });
}

console.log('📦 Bundling project code...');
scanDirectory(__dirname);
console.log(`✅ Done! Code saved to ${outputFile}`);