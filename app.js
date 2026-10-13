import { runCode, stopCode } from './runner.js';
import { languages, lesson, demos } from './lessons.js';
import { emptyOutput, renderOutput } from './drawing.js';
const $=id=>document.getElementById(id);
let language='python',level=1,busy=false,drawingController;
const drafts={};
function key(){return `${language}-${level}`;}
function controls(disabled) {
 document.querySelectorAll('[data-lang],[data-level],#reset,#run,[data-demo],#ts-error-toggle,#animate').forEach(b=>b.disabled=disabled);
}
function renderLesson() {
 const current=lesson(language,level);
 document.querySelectorAll('[data-lang]').forEach(b=>{const active=b.dataset.lang===language;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
 document.querySelectorAll('[data-level]').forEach(b=>{const active=Number(b.dataset.level)===level;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
 for(const [id,value] of [['lesson-tag',current.tag],['lesson-title',current.title],['task',current.task],['hint',current.hint],['challenge',current.challenge],['filename',languages[language].file],['active-language',languages[language].name]])$(id).textContent=value;
 $('syntax').replaceChildren();
 current.syntax.forEach(([code,description])=> {
  const div=document.createElement('div');div.className='syntax-item';const c=document.createElement('code');c.textContent=code;const p=document.createElement('div');p.textContent=description;div.append(c,p);$('syntax').append(div);
 });
 $('code').value=drafts[key()]??current.code;
 emptyOutput($('visual'));$('stdout').textContent='Поки що порожньо.';$('error').hidden=true;$('status').textContent='Очікуємо на твій код';
}
document.querySelectorAll('[data-lang],[data-level]').forEach(b=>b.onclick=()=> {
 if(busy)return;drafts[key()]=$('code').value;
 if(b.dataset.lang)language=b.dataset.lang;else level=Number(b.dataset.level);renderLesson();
});
$('reset').onclick=()=>{if(!busy){delete drafts[key()];renderLesson();}};
$('code').addEventListener('keydown',e=> {
 if(e.key==='Tab'){e.preventDefault();const t=e.target;t.setRangeText('    ',t.selectionStart,t.selectionEnd,'end');}
 if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run();}
});
function errorText(result) {
 return 'Це підказка, а не поразка. Перевір вибрану мову, лапки, дужки та відступи.\n\n'+result.stderr;
}
async function run() {
 if(busy)return;busy=true;controls(true);$('stop').hidden=false;$('run').textContent='Виконуємо…';$('error').hidden=true;$('status').textContent='Готуємо запуск…';
 try {
  const result=await runCode(language,$('code').value,text=>{$('status').textContent=text;});
  $('stdout').textContent=result.stdout || '(Програма нічого не вивела)';
  drawingController=new AbortController();
  let revealed=false;
  const playback=await renderOutput($('visual'),result,{signal:drawingController.signal,animate:$('animate').checked,onProgress:text=>{
   $('status').textContent=text;
   if(!revealed){revealed=true;$('visual').scrollIntoView({behavior:'instant',block:'nearest'});}
  }});
  $('status').textContent=playback.cancelled?'Малювання зупинено':result.ok?'✓ Виконано — результат нижче':'Спробуй ще раз';
  if(!result.ok){$('error').hidden=false;$('error').textContent=errorText(result);}
 } catch(error) {
  $('status').textContent='Не вдалося запустити';$('error').hidden=false;$('error').textContent='Перевір з’єднання, онови сторінку й спробуй ще раз.';
 } finally {drawingController=undefined;busy=false;controls(false);$('stop').hidden=true;$('run').textContent='▷ Запустити код';}
}
$('stop').onclick=()=>{stopCode();drawingController?.abort();};$('run').onclick=run;
$('animate').checked=!matchMedia('(prefers-reduced-motion: reduce)').matches;
for(const [id,demo] of Object.entries(demos))$(`${id}-code`).textContent=demo.code;
$('ts-error-toggle').onchange=()=> {
 $('typescript-code').textContent=$('ts-error-toggle').checked?demos.typescript.code.replace('name: "Олено"','name: 42'):demos.typescript.code;
};
document.querySelectorAll('[data-demo-stop]').forEach(button=>button.onclick=stopCode);
document.querySelectorAll('[data-demo]').forEach(button=>button.onclick=async()=> {
 if(busy)return;busy=true;controls(true);
 const id=button.dataset.demo,status=$(`${id}-status`),error=$(`${id}-error`),stop=document.querySelector(`[data-demo-stop="${id}"]`);
 error.hidden=true;stop.hidden=false;status.textContent='Готуємо демонстрацію…';
 try {
  const result=await runCode(id,$(`${id}-code`).textContent,text=>{status.textContent=text;});
  await renderOutput($(`${id}-output`),result,{animate:false});
  status.textContent=result.ok?'✓ Демонстрацію виконано':'Перевірка виявила помилку';
  if(id==='typescript') {
   $('typescript-compiled').textContent=result.compiledCode || 'Код не перетворено: спочатку виправ помилку типу.';
   $('typescript-transpilation').hidden=false;
  }
  if(!result.ok){error.hidden=false;error.textContent=result.stderr;}
 } catch(e){status.textContent='Не вдалося завантажити середовище';error.hidden=false;error.textContent='Перевір з’єднання й спробуй ще раз.';}
 finally {busy=false;controls(false);stop.hidden=true;}
});
renderLesson();
