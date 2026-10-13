// OpenJDK 8 compiler and DoppioJVM run entirely in this disposable worker.
const immediateTasks = new Map();
let immediateId = 0;
const channel = new MessageChannel();
channel.port1.onmessage = ({data}) => {
 const task = immediateTasks.get(data);
 if(task) {immediateTasks.delete(data);task();}
};
self.setImmediate = (fn, ...args) => {
 const id = ++immediateId;
 immediateTasks.set(id, () => fn(...args));
 channel.port2.postMessage(id);
 return id;
};
self.clearImmediate = id => immediateTasks.delete(id);
importScripts('../vendor/browserfs.min.js', '../vendor/doppio.js');
let runtime;
async function initialize() {
 if(runtime)return runtime;
 runtime=(async () => {
  postMessage({type:'status',text:'Завантажуємо Java для першого запуску…'});
  const response = await fetch('../vendor/java-home.zip');
  if (!response.ok) throw Error('Не вдалося завантажити Java. Перевір з’єднання й спробуй ще раз.');
  const buffer = BrowserFS.BFSRequire('buffer').Buffer.from(await response.arrayBuffer());
  await new Promise((resolve,reject) => BrowserFS.configure({fs:'MountableFileSystem',options:{
   '/sys':{fs:'ZipFS',options:{zipData:buffer}},
   '/tmp':{fs:'InMemory'}, '/home':{fs:'InMemory'}
  }}, e => e ? reject(e) : resolve()));
  const fs = BrowserFS.BFSRequire('fs');
  const process = BrowserFS.BFSRequire('process');
  process.initializeTTYs();
  return {fs,process};
 })();
 try {return await runtime;} catch(error) {runtime=undefined;throw error;}
}
self.onmessage = async ({data}) => {
 let stdout='', stderr='', limited=false;
 try {
  const {fs,process} = await initialize();
  fs.getRootFS().umount('/home');
  fs.getRootFS().umount('/tmp');
  fs.getRootFS().mount('/home',new BrowserFS.FileSystem.InMemory());
  fs.getRootFS().mount('/tmp',new BrowserFS.FileSystem.InMemory());
  process.chdir('/home');
  process.stdout.removeAllListeners('data');
  process.stderr.removeAllListeners('data');
  const append = (target,chunk) => {
   if(limited)return;
   if(target==='out')stdout+=chunk.toString();else stderr+=chunk.toString();
   if(stdout.length+stderr.length>12000) {limited=true;postMessage({type:'limit'});}
  };
  process.stdout.on('data',chunk => append('out',chunk));
  process.stderr.on('data',chunk => append('err',chunk));
  fs.writeFileSync('/home/Main.java',data.code,'utf8');
  const helper=await fetch(new URL('../turtle/Turtle.java',self.location.href));
  if(!helper.ok)throw Error('Не вдалося завантажити черепашку.');
  fs.writeFileSync('/home/Turtle.java',await helper.text(),'utf8');
  const opts = {doppioHomePath:'/sys',javaHomePath:'/sys/java_home',
   bootstrapClasspath:['/sys/java_home/lib/rt.jar','/sys/java_home/lib/doppio.jar','/sys/java_home/lib/charsets.jar'],
   classpath:['/sys/java_home/lib/tools.jar','/home'],tmpDir:'/tmp',enableAssertions:false,properties:{'java.ext.dirs':''}};
  const invoke = (name,args) => new Promise((resolve,reject) => new Doppio.VM.JVM(opts, (err,jvm) => {
   if(err)reject(err);else jvm.runClass(name,args,resolve);
  }));
  postMessage({type:'status',text:'Компілюємо твою Java-програму…'});
  const compiled = await invoke('com.sun.tools.javac.Main',['-encoding','UTF-8','-source','8','-target','8','/home/Main.java','/home/Turtle.java']);
  if(compiled!==0) {postMessage({type:'result',result:{ok:false,stdout,stderr}});return;}
  stdout='';stderr='';
  postMessage({type:'executing',text:'Твій код працює…'});
  const exited = await invoke('Main',[]);
  postMessage({type:'result',result:{ok:exited===0,stdout,stderr}});
 } catch(error) {postMessage({type:'result',result:{ok:false,stdout:stdout.slice(0,12000),stderr:String(error.message || error)}});}
};
