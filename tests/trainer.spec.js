import { test, expect } from '@playwright/test';
const languages=['python','javascript','java','cpp','php'];
async function run(page) {
 await page.locator('#run').click();
 await expect(page.locator('#run')).toBeEnabled({timeout:120000});
}

test('ten drawing lessons execute on static Pages and edits change drawings',async ({page})=> {
 const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({method:r.method(),url:r.url()}));
 await page.goto('./');
 for(const level of [1,2]) {
  await page.locator(`[data-level="${level}"]`).click();
  for(const language of languages) {
   await page.locator(`[data-lang="${language}"]`).click();await run(page);
   await expect(page.locator('#status')).toContainText('✓');
   await expect(page.locator('#visual .turtle-line')).toHaveCount(level===1?4:20);
   await expect(page.locator('#visual .turtle-icon')).toHaveCount(1);
   const code=await page.locator('#code').inputValue();
   await page.locator('#code').fill(level===1?code.replace('#00A6EB','#EF958C'):code.replace('steps = 20','steps = 12'));
   await run(page);await expect(page.locator('#status')).toContainText('✓');
   if(level===1)await expect(page.locator('#visual .turtle-line').first()).toHaveAttribute('stroke','#EF958C');
   else await expect(page.locator('#visual .turtle-line')).toHaveCount(12);
  }
 }
 expect(errors).toEqual([]);expect(requests.filter(r=>r.method!=='GET')).toEqual([]);
 expect(requests.filter(r=>!r.url.startsWith('http://127.0.0.1:8002/'))).toEqual([]);
});

test('TypeScript demonstrates real typechecking and Ruby executes the example',async ({page})=> {
 await page.goto('./');
 await page.locator('[data-demo="typescript"]').click();
 await expect(page.locator('[data-demo="typescript"]')).toBeEnabled({timeout:120000});
 await expect(page.locator('#typescript-status')).toContainText('✓');
 await expect(page.locator('#typescript-output')).toContainText('Привіт, Олено!');
 await expect(page.locator('#typescript-compiled')).toContainText('function greet');
 expect(await page.locator('#typescript-compiled').textContent()).not.toContain('type Friend');
 await page.locator('#ts-error-toggle').check();await page.locator('[data-demo="typescript"]').click();
 await expect(page.locator('[data-demo="typescript"]')).toBeEnabled({timeout:120000});
 await expect(page.locator('#typescript-error')).toContainText('TS2322');
 await expect(page.locator('#typescript-output .result-card')).toHaveCount(0);
 await page.locator('#ts-error-toggle').uncheck();await page.locator('[data-demo="typescript"]').click();
 await expect(page.locator('[data-demo="typescript"]')).toBeEnabled({timeout:120000});
 await expect(page.locator('#typescript-status')).toContainText('✓');
 await page.locator('[data-demo="ruby"]').click();
 await expect(page.locator('[data-demo="ruby"]')).toBeEnabled({timeout:120000});
 await expect(page.locator('#ruby-output .result-card')).toHaveCount(2);
 await expect(page.locator('#ruby-output')).toContainText('Привіт, Тарасе!');
});

test('arbitrary programs, errors, output escaping and stopping work',async ({page})=> {
 await page.goto('./');
 for(const [lang,code] of [['python','print('],['javascript','console.log('],['java','public class Main {broken}'],['cpp','int main( {'],['php','<?php echo ;']]) {
  await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#code').fill(code);await run(page);
  await expect(page.locator('#error')).toBeVisible();await expect(page.locator('#status')).toContainText('Спробуй');
 }
 await page.locator('[data-lang="javascript"]').click();
 await page.locator('#code').fill("function sayHi(){console.log('Hi!');} sayHi();");await run(page);
 await expect(page.locator('#visual')).toContainText('Hi!');
 await page.locator('#code').fill('console.log("<img src=x onerror=alert(1)>");');await run(page);
 await expect(page.locator('#visual img')).toHaveCount(0);
 for(const [lang,code] of [['javascript','while(true) {}'],['python','while True: pass'],['java','public class Main {public static void main(String[] args) {while(true) {}}}'],['cpp','int main(){while(true){}}'],['php','<?php while(true) {}']]) {
  await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#code').fill(code);await page.locator('#run').click();
  await expect(page.locator('#status')).toHaveText('Твій код працює…',{timeout:120000});
  await page.locator('#stop').click();await expect(page.locator('#run')).toBeEnabled();
  await expect(page.locator('#error')).toContainText('зупинено');await page.locator('#reset').click();await run(page);
  await expect(page.locator('#status')).toContainText('✓');
 }
});

test('automatic timeout and bounded output',async ({page})=> {
 await page.goto('./');await page.locator('[data-lang="javascript"]').click();
 await page.locator('#code').fill('while(true) {}');await run(page);await expect(page.locator('#error')).toContainText('Час виконання');
 await page.locator('#code').fill('for(let i=0;i<10000;i++) console.log("hello");');await run(page);
 await expect(page.locator('#error')).toContainText('забагато тексту');
});

test('mobile layout, disclaimer, drafts and all resource links',async ({page})=> {
 await page.setViewportSize({width:390,height:844});await page.goto('./');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.locator('.sandbox-note')).toContainText('пісочниці');
 await expect(page.locator('.sandbox-note')).toContainText('IDE');
 await expect(page.locator('.resource-card')).toHaveCount(4);
 for(const url of ['https://dou.ua/lenta/articles/language-rating-2026/?from=doufp','https://survey.stackoverflow.co/2026','https://www.w3schools.com/','https://www.nixsolutions.com/ua/study-center/resursy-obucheniya/'])
  await expect(page.locator(`a[href="${url}"]`)).toHaveAttribute('target','_blank');
 await page.locator('#code').fill('print("Моя чернетка")');
 await page.locator('[data-lang="cpp"]').click();await page.locator('[data-lang="python"]').click();
 await expect(page.locator('#code')).toHaveValue('print("Моя чернетка")');
});
