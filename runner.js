// Disposable workers keep user code away from the page and allow Stop/time limits.
const workers = new Map();
let activeRun;
const errors = {
 timeout:'Час виконання вичерпано. Перевір умову циклу й спробуй ще раз.',
 stop:'Виконання зупинено. Можеш змінити код і запустити його знову.',
 limit:'Програма вивела забагато тексту. Зменш кількість повторень.'
};
function destroy(language) {
 workers.get(language)?.terminate();
 workers.delete(language);
}
export function stopCode() {activeRun?.abort('stop');}
export function runCode(language,code,onStatus) {
 return new Promise(resolve => {
  const worker = workers.get(language) || new Worker(new URL(`workers/${language}.js`,import.meta.url));
  workers.set(language,worker);
  let finished=false;
  // Loading/Java compilation may take longer; execution itself has a short limit.
  let timer=setTimeout(() => abort('timeout'),120000);
  const finish = result => {
   if(finished)return;finished=true;clearTimeout(timer);
   worker.onmessage=null;worker.onerror=null;activeRun=null;
   // JS is fresh each run. Python/Java keep downloaded runtimes warm.
   if(language==='javascript')destroy(language);
   resolve(result);
  };
  const abort = reason => {
   destroy(language);
   finish({ok:false,stdout:'',stderr:errors[reason]});
  };
  activeRun={abort};
  worker.onmessage=({data}) => {
   if(data.type==='status')onStatus(data.text);
   else if(data.type==='executing') {
    clearTimeout(timer);timer=setTimeout(() => abort('timeout'),7000);onStatus(data.text);
   } else if(data.type==='limit')abort('limit');
   else if(data.type==='result')finish(data.result);
  };
  worker.onerror=event => {
   event.preventDefault();destroy(language);
   finish({ok:false,stdout:'',stderr:'Не вдалося запустити середовище. Онови сторінку й спробуй ще раз.\n'+event.message});
  };
  worker.postMessage({code});
 });
}
