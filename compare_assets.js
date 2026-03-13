const fs = require('fs');
const path = require('path');

const sourceDir = 'D:/Jhonny Xprite - 2026/AIOX-CORE (PACKAGE)/aiox-core/.aiox-core';
const targetDir = 'D:/Jhonny Xprite - 2026/AIOX-CORE (PACKAGE)/Xprite-Sync-True/.aiox-core';

function getFiles(dir, baseDir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules') return;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(filePath, baseDir));
        } else {
            results.push(path.relative(baseDir, filePath));
        }
    });
    return results;
}

const sourceCore = 'D:/Jhonny Xprite - 2026/AIOX-CORE (PACKAGE)/aiox-core/.aiox-core';
const targetCore = 'D:/Jhonny Xprite - 2026/AIOX-CORE (PACKAGE)/Xprite-Sync-True/.aiox-core';
const sourceCodex = 'D:/Jhonny Xprite - 2026/AIOX-CORE (PACKAGE)/aiox-core/.codex';
const targetCodex = 'D:/Jhonny Xprite - 2026/AIOX-CORE (PACKAGE)/Xprite-Sync-True/.codex';

try {
    const sourceFiles = getFiles(sourceCore, sourceCore).map(f => '.aiox-core/' + f)
        .concat(getFiles(sourceCodex, sourceCodex).map(f => '.codex/' + f));
    
    const targetFiles = getFiles(targetCore, targetCore).map(f => '.aiox-core/' + f)
        .concat(getFiles(targetCodex, targetCodex).map(f => '.codex/' + f));

    const missingFiles = sourceFiles.filter(f => !targetFiles.includes(f));
    
    console.log(`Summary:`);
    console.log(`Source files (total): ${sourceFiles.length}`);
    console.log(`Target files (total): ${targetFiles.length}`);
    console.log(`Missing files: ${missingFiles.length}`);
    console.log(`\nList of missing files:`);
    console.log(missingFiles.join('\n'));
} catch (err) {
    console.error(err);
}
