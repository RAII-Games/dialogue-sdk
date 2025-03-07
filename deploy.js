import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });

if (!fs.existsSync('dist')) {
    console.error('Error: dist directory not found. Build may have failed.');
    process.exit(1);
}

fs.writeFileSync(path.join('dist', '.nojekyll'), '');
let branchExists = false;
try {
    execSync('git show-ref --verify --quiet refs/heads/gh-pages');
    branchExists = true;
} catch (e) {}

console.log('Deploying to GitHub Pages...');

if (branchExists) 
{
    try {
        execSync('git add dist -f');
        execSync('git commit -m "chore: update build for gh-pages"');
        execSync('git subtree push --prefix dist origin gh-pages');
        console.log('Deployed successfully!');
    } catch (e) {
        console.error('Error deploying to GitHub Pages:', e);
    } finally {
        execSync('git reset HEAD~1');
    }
} else {
    try {
        execSync('git checkout --orphan gh-pages');
        execSync('git --work-tree=dist add --all');
        execSync('git --work-tree=dist commit -m "chore: init gh-pages commit"');
        execSync('git push origin HEAD:gh-pages --force');
        execSync('git checkout -f main');
        execSync('git branch -D gh-pages');
        console.log('Deployed successfully!');
    } catch (e) {
        console.error('Error deploying to GitHub Pages:', e);
    }
}