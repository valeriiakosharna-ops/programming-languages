import { test, expect } from '@playwright/test';

async function run(page) {
 await page.locator('#run').click();
 await expect(page.locator('#run')).toBeEnabled({timeout:120000});
}

test('six examples work on static Pages, including modified programs', async ({page}) => {
 const errors=[];const requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>requests.push({method:r.method(),url:r.url()}));
 await page.goto('./');
 for(const level of [1,2]) {
  await page.locator(`[data-level="${level}"]`).click();
  for(const language of ['python','javascript','java']) {
   await page.locator(`[data-lang="${language}"]`).click();
   await run(page);
   await expect(page.locator('#status')).toContainText('✓');
   await expect(page.locator('.result-card')).toHaveCount(level===1 ? 2 : 5);
   const code=await page.locator('#code').inputValue();
   await page.locator('#code').fill(level===1 ? code.replace('Привіт, світе!', 'Вітаю, Олено!') : code.replace('count = 5', 'count = 7'));
   await run(page);
   await expect(page.locator('#status')).toContainText('✓');
   if(level===1)await expect(page.locator('.result-card').first()).toContainText('Вітаю, Олено!');
   else await expect(page.locator('.result-card')).toHaveCount(7);
  }
 }
 expect(errors).toEqual([]);
 expect(requests.filter(r=>r.method!=='GET')).toEqual([]);
 expect(requests.filter(r=>!r.url.startsWith('http://127.0.0.1:8002/'))).toEqual([]);
});

test('compile errors, HTML escaping, stopping and recovery',async ({page}) => {
 await page.goto('./');
 for(const [lang,code] of [['python','print('],['javascript','console.log('],['java','public class Main {broken}']]) {
  await page.locator(`[data-lang="${lang}"]`).click();
  await page.locator('#code').fill(code);await run(page);
  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#status')).toContainText('Спробуй');
 }
 await page.locator('[data-lang="javascript"]').click();
 await page.locator('#code').fill('console.log("<img src=x onerror=alert(1)>");');
 await run(page);await expect(page.locator('#visual img')).toHaveCount(0);
 for(const [lang,loop] of [['javascript','while(true) {}'],['python','while True: pass'],['java','public class Main {public static void main(String[] args) {while(true) {}}}']]) {
  await page.locator(`[data-lang="${lang}"]`).click();
  await page.locator('#code').fill(loop);await page.locator('#run').click();
  await expect(page.locator('#status')).toHaveText('Твій код працює…',{timeout:120000});
  await expect(page.locator('#stop')).toBeVisible();await page.locator('#stop').click();
  await expect(page.locator('#run')).toBeEnabled();await expect(page.locator('#error')).toContainText('зупинено');
  await page.locator('#reset').click();await run(page);
  await expect(page.locator('#status')).toContainText('✓');
 }
});

test('automatic timeout and bounded output',async ({page}) => {
 await page.goto('./');
 await page.locator('[data-lang="javascript"]').click();
 await page.locator('#code').fill('while(true) {}');await run(page);
 await expect(page.locator('#error')).toContainText('Час виконання');
 await page.locator('#code').fill('for(let i=0;i<10000;i++) console.log("hello");');await run(page);
 await expect(page.locator('#error')).toContainText('забагато тексту');
});

test('mobile layout and separate drafts',async ({page}) => {
 await page.setViewportSize({width:390,height:844});await page.goto('./');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#code').fill('print("Моя чернетка")');
 await page.locator('[data-lang="java"]').click();await page.locator('[data-lang="python"]').click();
 await expect(page.locator('#code')).toHaveValue('print("Моя чернетка")');
});
