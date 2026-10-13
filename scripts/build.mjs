import { mkdir, cp, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
process.chdir(root);
const url = 'https://github.com/plasma-umass/doppio_jcl/releases/download/v3.2/java_home.tar.gz';
const checksum = 'bee079d16b8631ff56d3bdc66b4d03e0ecbf9ee46baeef9b041c0bc497f25c34';
await mkdir('.cache', { recursive: true });
const archive = '.cache/java-home-v3.2.tar.gz';
if (!existsSync(archive)) execFileSync('curl', ['--fail', '--location', '--retry', '2', url, '--output', archive], {stdio:'inherit'});
const actual = createHash('sha256').update(await readFile(archive)).digest('hex');
if (actual !== checksum) throw new Error('Java runtime checksum mismatch. Remove the cached archive and retry.');
await rm('dist', {recursive:true, force:true});
await mkdir('dist/vendor', {recursive:true});
for (const file of ['index.html','style.css','app.js','runner.js']) await copyFile(file, `dist/${file}`);
for (const dir of ['assets','workers']) await cp(dir, `dist/${dir}`, {recursive:true});
await cp('node_modules/pyodide', 'dist/vendor/pyodide', {recursive:true});
await cp('node_modules/@fontsource-variable/manrope', 'dist/vendor/fonts', {recursive:true});
await copyFile('node_modules/browserfs/dist/browserfs.min.js', 'dist/vendor/browserfs.min.js');
await copyFile('node_modules/doppiojvm/dist/release/doppio.js', 'dist/vendor/doppio.js');
await mkdir('.cache/jcl', {recursive:true});
execFileSync('tar', ['-xzf', archive, '-C', '.cache/jcl']);
await copyFile('node_modules/doppiojvm/dist/doppio.jar', '.cache/jcl/java_home/lib/doppio.jar');
// BrowserFS reads Java's virtual filesystem from a single local ZIP.
execFileSync('python3', ['-c', `
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path('.cache/jcl')
with ZipFile('dist/vendor/java-home.zip','w',ZIP_DEFLATED,compresslevel=6) as z:
    for file in sorted(root.rglob('*')):
        if file.is_file(): z.write(file,file.relative_to(root))
`], {stdio:'inherit'});
await cp('licenses', 'dist/licenses', {recursive:true});
for (const [name, file] of [['Manrope','node_modules/@fontsource-variable/manrope/LICENSE'],['Doppio','node_modules/doppiojvm/LICENSE'],['BrowserFS','node_modules/browserfs/LICENSE'],['Pyodide','node_modules/pyodide/LICENSE'],['OpenJDK','LICENSE'],['OpenJDK-assembly','ASSEMBLY_EXCEPTION'],['OpenJDK-third-party','THIRD_PARTY_README']]) {
 const source=name.startsWith('OpenJDK') ? `.cache/jcl/java_home/${file}` : file;
 if (existsSync(source)) await copyFile(source, `dist/licenses/${name}.txt`);
}
await writeFile('dist/.nojekyll','');
console.log('Built static site in dist/; no application server required.');
