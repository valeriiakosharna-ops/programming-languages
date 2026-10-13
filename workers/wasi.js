import { WASI } from '../vendor/wasi/wasi.js';
const loaded = new Map();
async function asset(name) {
 if(!loaded.has(name))loaded.set(name,fetch(new URL(`../vendor/wasi/${name}`,import.meta.url)).then(r=>{
  if(!r.ok)throw Error('Не вдалося завантажити середовище. Перевір інтернет-з’єднання.');return r;
 }));
 return (await loaded.get(name)).clone();
}
function file(path,content,mode='string') {
 const now=new Date();return {path,content,mode,timestamps:{access:now,modification:now,change:now}};
}
let clangFiles;
async function filesystem(name) {
 const files=await (await asset(name)).json();
 return Object.fromEntries(Object.entries(files).map(([path,value])=>[path,file(path,Uint8Array.from(atob(value),c=>c.charCodeAt(0)),'binary')]));
}
async function helper(name) {
 const r=await fetch(new URL(`../turtle/${name}`,import.meta.url));
 if(!r.ok)throw Error('Не вдалося завантажити команди черепашки.');return r.text();
}
self.onmessage = async ({data}) => {
 let stdout='',stderr='',limited=false;
 const capture = target => text => {
  if(limited)return;
  if(target==='out')stdout+=text;else stderr+=text;
  if(stdout.length+stderr.length>12000){limited=true;postMessage({type:'limit'});}
 };
 const stdoutFn=capture('out'),stderrFn=capture('err');
 const execute=(binary,args,fs,env={})=>WASI.start(binary,{args,fs,env,stdin:()=>null,stdout:stdoutFn,stderr:stderrFn,isTTY:false});
 try {
  const language=data.language;
  postMessage({type:'status',text:language==='cpp'?'Завантажуємо C++ та компілятор…':language==='php'?'Завантажуємо PHP…':'Завантажуємо Ruby…'});
  let result;
  if(language==='cpp') {
   clangFiles ||= await filesystem('clang-fs.json');
   let fs={...clangFiles,'/main.cpp':file('/main.cpp',data.code),'/sys/include/turtle.h':file('/sys/include/turtle.h',await helper('turtle.h'))};
   const compiler=await asset('clang.wasm'), linker=await asset('wasm-ld.wasm');
   postMessage({type:'status',text:'Компілюємо твою C++ програму…'});
   result=await execute(compiler,['clang','-cc1','-triple','wasm32-unknown-wasi','-emit-obj','-isysroot','/sys','-internal-isystem','/sys/include/c++/v1','-internal-isystem','/sys/include','-internal-isystem','/sys/lib/clang/8.0.1/include','-ferror-limit','4','-std=c++17','-O0','-o','/main.o','-x','c++','/main.cpp'],fs);
   if(result.exitCode!==0) {postMessage({type:'result',result:{ok:false,stdout,stderr}});return;}
   result=await execute(linker,['wasm-ld','--no-threads','--export-dynamic','-z','stack-size=1048576','-L/sys/lib/wasm32-wasi','/sys/lib/wasm32-wasi/crt1.o','/main.o','-lc','-lc++','-lc++abi','-o','/program.wasm'],result.fs);
   if(result.exitCode!==0) {postMessage({type:'result',result:{ok:false,stdout,stderr}});return;}
   const compiled=new Response(result.fs['/program.wasm'].content,{headers:{'Content-Type':'application/wasm'}});
   postMessage({type:'executing',text:'Твій код працює…'});
   result=await execute(compiled,['program'],result.fs);
  } else if(language==='php') {
   const fs={'/main.php':file('/main.php',data.code),'/turtle.php':file('/turtle.php',await helper('turtle.php'))};
   const binary=await asset('php-cgi-8.2.0.wasm');
   postMessage({type:'executing',text:'Твій код працює…'});
   result=await execute(binary,['php','-f','/main.php'],fs);
   // CGI runtime emits HTTP headers before the script output.
   stdout=stdout.replace(/^(?:X-Powered-By:[^\n]*\r?\n)?Content-type:[^\n]*\r?\n\r?\n/i,'');
  } else if(language==='ruby') {
   const fs={...await filesystem('ruby-3.2.0.json'),'/main.rb':file('/main.rb',data.code)};
   const binary=await asset('ruby-3.2.0.wasm');
   postMessage({type:'executing',text:'Твій код працює…'});
   result=await execute(binary,['ruby','-r','/ruby-3.2.0/.rubyopts.rb','/main.rb'],fs);
  } else throw Error('Невідома мова');
  postMessage({type:'result',result:{ok:result.exitCode===0,stdout,stderr}});
 } catch(error) {postMessage({type:'result',result:{ok:false,stdout,stderr:stderr+'\n'+String(error.message || error)}});}
};
