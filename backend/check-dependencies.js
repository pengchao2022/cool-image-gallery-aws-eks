import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function extractImports(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
    const packages = new Set();
    
    imports.forEach(imp => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        if (match && !match[1].startsWith('.') && !match[1].startsWith('/')) {
            packages.add(match[1]);
        }
    });
    
    return packages;
}

function traverseDirectory(dir, allPackages) {
    const files = readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory() && file !== 'node_modules') {
            traverseDirectory(fullPath, allPackages);
        } else if (file.endsWith('.js')) {
            const packages = extractImports(fullPath);
            packages.forEach(pkg => allPackages.add(pkg));
        }
    });
}

function checkAllDependencies() {
    console.log('=== 检查所有依赖 ===\n');
    
    const allPackages = new Set();
    traverseDirectory('src', allPackages);
    
    // 读取 package.json
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    console.log('找到的包导入:');
    const missing = [];
    
    allPackages.forEach(pkg => {
        if (dependencies.includes(pkg)) {
            console.log(`✅ ${pkg}`);
        } else {
            console.log(`❌ ${pkg} - 缺失!`);
            missing.push(pkg);
        }
    });
    
    if (missing.length > 0) {
        console.log(`\n运行此命令安装缺失的包:`);
        console.log(`npm install ${missing.join(' ')}`);
    } else {
        console.log('\n🎉 所有依赖都已安装!');
    }
}

checkAllDependencies();
