import { runCode, stopCode } from './runner.js';
const $ = id => document.getElementById(id);
let language = 'python', level = 1, busy = false;
const drafts = {};
const examples = {
 python: [
  '# Напиши своє привітання між лапками\nprint("Привіт, світе! 💙")\nprint("Я створюю свою першу програму!")',
  '# Змінна зберігає число. Цикл повторює команду.\ncount = 5\nfor i in range(1, count + 1):\n    print("⭐" * i)'
 ],
 javascript: [
  '// Напиши своє привітання між лапками\nconsole.log("Привіт, світе! 💙");\nconsole.log("Я створюю свою першу програму!");',
  '// Змінна зберігає число. Цикл повторює команду.\nconst count = 5;\nfor (let i = 1; i <= count; i++) {\n    console.log("⭐".repeat(i));\n}'
 ],
 java: [
  '// Java починає виконання з методу main\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Привіт, світе! 💙");\n        System.out.println("Я створюю свою першу програму!");\n    }\n}',
  '// Змінна зберігає число. Цикл повторює команду.\npublic class Main {\n    public static void main(String[] args) {\n        int count = 5;\n        String stars = "";\n        for (int i = 1; i <= count; i++) {\n            stars = stars + "⭐";\n            System.out.println(stars);\n        }\n    }\n}'
 ]
};
const syntax = {
 python: [
  [['print("Привіт!")', 'print виводить текст. Дужки містять те, що треба показати.'], ['"Твій текст"', 'Текст пишемо в парних лапках. Українські літери й емодзі теж працюють.'], ['# Коментар', 'Рядок після # — пояснення для людини. Комп’ютер його пропускає.']],
  [['count = 5', 'Змінна count зберігає кількість рядків. Знак = присвоює значення.'], ['range(1, count + 1)', 'Числа від 1 до count включно: верхня межа range не входить у послідовність.'], ['for i in …:', 'Цикл: i отримує наступне число. Після двокрапки потрібен відступ у 4 пробіли.'], ['"⭐" * i', 'Повторює текст i разів.']]
 ],
 javascript: [
  [['console.log("Привіт!");', 'console.log виводить текст. Дужки містять значення, а ; завершує команду.'], ['"Твій текст"', 'Текст пишемо в парних лапках.'], ['// Коментар', 'Рядок після // — пояснення, яке не виконується.']],
  [['const count = 5;', 'const створює змінну, значення якої не переприсвоюємо.'], ['let i = 1; i <= count; i++', 'Починаємо з 1; повторюємо, поки i не більше count; збільшуємо i на 1.'], ['for (…) { … }', 'Фігурні дужки об’єднують команди циклу.'], ['"⭐".repeat(i)', 'Повторює текст i разів.']]
 ],
 java: [
  [['public class Main { … }', 'Клас — оболонка програми. Тут він має називатися Main.'], ['public static void main(String[] args)', 'Точка старту програми. Поки залиш цей рядок без змін.'], ['System.out.println("Привіт!");', 'Виводить текст і переходить на новий рядок. Команду завершує ;.'], ['"Текст" та { }', 'Текст — у подвійних лапках, команди — всередині фігурних дужок. // починає коментар.']],
  [['int count = 5;', 'int — ціле число. Змінна count зберігає кількість рядків.'], ['int i = 1; i <= count; i++', 'Початок, умова продовження й збільшення числа на 1.'], ['for (…) { … }', 'Повторює команди в дужках. Залиш оболонку Main і main без змін.'], ['stars = stars + "⭐";', 'Додає одну зірку до тексту на кожному кроці. String — тип для тексту.']]
 ]
};
function key() { return `${language}-${level}`; }
function renderLesson() {
 document.querySelectorAll('[data-lang]').forEach(b => {b.classList.toggle('active', b.dataset.lang === language);b.setAttribute('aria-pressed', b.dataset.lang === language);});
 document.querySelectorAll('[data-level]').forEach(b => {b.classList.toggle('active', Number(b.dataset.level) === level);b.setAttribute('aria-pressed', Number(b.dataset.level) === level);});
 $('lesson-tag').textContent = level === 1 ? 'РІВЕНЬ 01 · ВИВЕДЕННЯ' : 'РІВЕНЬ 02 · ЗМІННІ ТА ЦИКЛИ';
 $('lesson-title').textContent = level === 1 ? 'Скажи світові «Привіт!»' : 'Побудуй сходинки із зірок';
 $('task').textContent = level === 1 ? 'Запусти приклад, а потім заміни привітання на своє ім’я або улюблену фразу. Кожна команда виведення створить нову картку.' : 'Запусти програму й побач 5 сходинок. Потім зміни count на 7. Цикл повторює команду, а змінна визначає кількість рядків.';
 $('syntax').replaceChildren();
 syntax[language][level - 1].forEach(([code, description]) => {const div = document.createElement('div');div.className = 'syntax-item';const c = document.createElement('code');c.textContent = code;const p = document.createElement('div');p.textContent = description;div.append(c,p);$('syntax').append(div);});
 $('hint').textContent = level === 1 ? 'Зміни тільки текст усередині лапок. Залиш обидві лапки та дужки. Натисни «Запустити код».' : 'Знайди рядок count = 5 і заміни тільки число. Не змінюй назву count. Спробуй значення від 1 до 10.';
 $('challenge').textContent = level === 1 ? 'Додай третю команду виведення зі своїм улюбленим емодзі. Чи з’явиться третя картка?' : 'Заміни ⭐ на 💙. А що буде, якщо count дорівнює 0? Поверни 5 і порівняй результат.';
 $('filename').textContent = {python:'main.py',javascript:'main.js',java:'Main.java'}[language];
 $('code').value = drafts[key()] ?? examples[language][level - 1];
 clearResult();
}
function clearResult() {
 $('visual').innerHTML = '<div class="empty"><span>✧</span><h4>Тут оживе твоя програма</h4><p>Натисни «Запустити код» й подивись, що вийде.</p></div>';
 $('stdout').textContent = 'Поки що порожньо.';$('error').hidden = true;$('status').textContent = 'Очікуємо на твій код';
}
document.querySelectorAll('[data-lang], [data-level]').forEach(b => b.addEventListener('click', () => {if(busy)return;drafts[key()] = $('code').value;if(b.dataset.lang)language = b.dataset.lang;else level = Number(b.dataset.level);renderLesson();}));
$('reset').onclick = () => {if(busy)return;delete drafts[key()];renderLesson();};
$('code').addEventListener('keydown', e => {if(e.key === 'Tab'){e.preventDefault();const t=e.target,start=t.selectionStart,end=t.selectionEnd;t.setRangeText('    ',start,end,'end');}if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){e.preventDefault();run();}});
async function run(){
 if(busy)return;busy=true;$('run').disabled=true;$('run').textContent='Виконуємо…';$('status').textContent='Готуємо запуск…';$('error').hidden=true;$('stop').hidden=false;
 document.querySelectorAll('[data-lang], [data-level], #reset').forEach(b => b.disabled=true);
 try {
  const result = await runCode(language, $('code').value, text => {$('status').textContent=text;});$('stdout').textContent=result.stdout || '(Програма нічого не вивела)';$('visual').replaceChildren();
  const lines=(result.stdout || '').replace(/\r/g,'').split('\n');if(lines.at(-1)==='')lines.pop();
  lines.slice(0,40).forEach((line,i)=>{const card=document.createElement('div');card.className='result-card';card.style.animationDelay=`${Math.min(i * .04, .6)}s`;const label=document.createElement('small');label.textContent=`РЯДОК ${i+1}`;const text=document.createElement('strong');text.textContent=line || ' ';card.append(label,text);$('visual').append(card);});
  if(!lines.length){const p=document.createElement('p');p.textContent=result.ok ? 'Код виконано, але тексту немає. Додай команду виведення або перевір кількість повторень.' : 'Поки що без результату. Перевір повідомлення нижче.';$('visual').append(p);}
  if(lines.length>40){const p=document.createElement('p');p.textContent='Показано перші 40 рядків. Більше — у консолі.';$('visual').append(p);}
  $('status').textContent=result.ok ? '✓ Виконано — ти молодець!' : 'Спробуй ще раз';
  if(!result.ok){$('error').hidden=false;$('error').textContent='Помилка — це підказка, а не поразка. Перевір лапки, дужки й відступи.\n\n'+result.stderr;}
 } catch(e){$('visual').replaceChildren();$('stdout').textContent='Результат не отримано.';$('status').textContent='Не вдалося запустити';$('error').hidden=false;$('error').textContent='Не вдалося завантажити середовище. Перевір інтернет-з’єднання, онови сторінку й спробуй ще раз.';}
 finally {busy=false;$('stop').hidden=true;$('run').disabled=false;$('run').textContent='▶︎ Запустити код';document.querySelectorAll('[data-lang], [data-level], #reset').forEach(b => b.disabled=false);}
}
$('stop').onclick=stopCode;
$('run').onclick=run;renderLesson();
