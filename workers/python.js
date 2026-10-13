importScripts('../vendor/pyodide/pyodide.js');
let runtime;
self.onmessage = async ({data}) => {
 let stdout='', stderr='';
 try {
  if(!runtime) {
   postMessage({type:'status',text:'Завантажуємо Python для першого запуску…'});
   runtime = await loadPyodide({indexURL:new URL('../vendor/pyodide/',self.location.href).href});
   const helper=await fetch(new URL('../turtle/python.py',self.location.href));
   if(!helper.ok)throw Error('Не вдалося завантажити черепашку.');
   runtime.FS.writeFile('/home/pyodide/turtle.py',await helper.text());
  }
  const write = (target, text) => {
   if(target==='out') stdout += text+'\n';else stderr += text+'\n';
   if(stdout.length + stderr.length>12000) {postMessage({type:'limit'});throw Error('Забагато тексту.');}
  };
  runtime.setStdout({batched:text => write('out',text)});
  runtime.setStderr({batched:text => write('err',text)});
  const globals = runtime.runPython('dict(__name__="__main__")');
  try {
   postMessage({type:'executing',text:'Твій код працює…'});
   await runtime.runPythonAsync(data.code,{globals});
  } finally {globals.destroy();}
  postMessage({type:'result',result:{ok:true,stdout,stderr}});
 } catch(error) {postMessage({type:'result',result:{ok:false,stdout:stdout.slice(0,12000),stderr:String(error.message || error)}});}
};
