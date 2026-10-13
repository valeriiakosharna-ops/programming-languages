importScripts('../vendor/typescript/typescript.js');
const libs = new Map();
const loading = new Map();
async function loadLib(name) {
 if(loading.has(name))return loading.get(name);
 const promise=(async () => {
  const response=await fetch(new URL(`../vendor/typescript/${name}`,self.location.href));
  if(!response.ok)throw Error('Не вдалося завантажити TypeScript.');
  const text=await response.text();libs.set(name,text);
  const references=[...text.matchAll(/<reference lib="([^"]+)"/g)].map(m=>`lib.${m[1]}.d.ts`);
  await Promise.all(references.map(loadLib));
 })();loading.set(name,promise);return promise;
}
self.onmessage=async ({data})=> {
 let stdout='', emitted='';
 try {
  postMessage({type:'status',text:'TypeScript перевіряє типи…'});
  await loadLib('lib.es2020.full.d.ts');
  const read=name=>name.endsWith('/demo.ts') || name==='demo.ts' ? data.code : libs.get(name.split('/').at(-1));
  const host={
   getSourceFile:(name,version)=>{const source=read(name);return source===undefined ? undefined : ts.createSourceFile(name,source,version);},
   getDefaultLibFileName:()=>'/lib.es2020.full.d.ts',
   writeFile:(_,text)=>{emitted=text;},getCurrentDirectory:()=> '/',getDirectories:()=>[],
   fileExists:name=>read(name)!==undefined,readFile:read,getCanonicalFileName:name=>name,useCaseSensitiveFileNames:()=>true,getNewLine:()=> '\n'
  };
  const program=ts.createProgram(['/demo.ts'],{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.None,strict:true,noEmitOnError:true},host);
  const diagnostics=ts.getPreEmitDiagnostics(program);
  if(diagnostics.length) {
   const messages=diagnostics.map(d=>d.code===2322 ? 'TS2322: число не можна присвоїти полю, яке очікує текст (string).' : ts.flattenDiagnosticMessageText(d.messageText,'\n'));
   postMessage({type:'result',result:{ok:false,stdout:'',stderr:messages.join('\n'),compiledCode:''}});return;
  }
  program.emit();
  postMessage({type:'executing',text:'Виконуємо отриманий JavaScript…'});
  const write=(...values)=>{stdout+=values.join(' ')+'\n';if(stdout.length>12000){postMessage({type:'limit'});throw Error('Забагато тексту.');}};
  await new (Object.getPrototypeOf(async function(){}).constructor)('console',emitted)({log:write});
  postMessage({type:'result',result:{ok:true,stdout,stderr:'',compiledCode:emitted}});
 } catch(error) {postMessage({type:'result',result:{ok:false,stdout,stderr:String(error.message || error)}});}
};
