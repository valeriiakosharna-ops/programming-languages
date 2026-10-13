self.onmessage = async ({data}) => {
 let stdout = '', stderr = '';
 const write = (...values) => {
  const line = values.map(value => typeof value === 'string' ? value : JSON.stringify(value) ?? String(value)).join(' ') + '\n';
  stdout += line;
  if(stdout.length > 12000) {postMessage({type:'limit'});throw Error('Забагато тексту.');}
 };
 try {
  postMessage({type:'executing',text:'Твій код працює…'});
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  await new AsyncFunction('console', '"use strict";\n' + data.code)({log:write,info:write,warn:write,error:write});
  postMessage({type:'result',result:{ok:true,stdout,stderr}});
 } catch(error) {postMessage({type:'result',result:{ok:false,stdout:stdout.slice(0,12000),stderr:`${error.name}: ${error.message}`}});}
};
