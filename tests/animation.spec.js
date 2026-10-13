import { test, expect } from '@playwright/test';

async function setup(page) {
 // Freeze browser time to inspect genuine intermediate frames deterministically.
 await page.clock.install({time:new Date('2026-10-13T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-10-13T12:00:01Z'));
 await page.goto('./');
 await page.locator('[data-lang="javascript"]').click({force:true});
}
async function start(page) {
 await page.locator('#run').click({force:true});
 await expect(page.locator('#status')).toContainText('Черепашка малює');
}
async function position(page) {
 return page.locator('.turtle-icon').evaluate(el=> {
  const m=el.transform.baseVal.consolidate().matrix;
  return {x:m.e,y:m.f,rotation:Math.atan2(m.b,m.a)*180/Math.PI};
 });
}

test('square draws one side at a time and turtle travels and turns',async ({page})=> {
 await setup(page);await start(page);
 await expect(page.locator('.turtle-line')).toHaveCount(1);
 await expect(page.locator('#run')).toBeDisabled();
 await page.clock.runFor(360);
 const middle=await position(page);
 expect(middle.x).toBeCloseTo(0);expect(middle.y).toBeLessThan(-30);expect(middle.y).toBeGreaterThan(-60);
 const firstLength=await page.locator('.turtle-line').first().evaluate(el=>el.getTotalLength());
 expect(firstLength).toBeGreaterThan(30);expect(firstLength).toBeLessThan(60);
 await page.clock.runFor(400);
 const turning=await position(page);
 expect(turning.y).toBeCloseTo(-90);expect(turning.rotation).toBeGreaterThan(0);expect(turning.rotation).toBeLessThan(90);
 await page.clock.runFor(250);
 const next=await position(page);
 expect(next.x).toBeGreaterThan(0);expect(next.y).toBeCloseTo(-90);
 await expect(page.locator('.turtle-line')).toHaveCount(2);
 await page.clock.runFor(3200);
 await expect(page.locator('#run')).toBeEnabled();await expect(page.locator('#status')).toContainText('✓');
 await expect(page.locator('.turtle-line')).toHaveCount(4);
 const end=await position(page);expect(end.x).toBeCloseTo(0);expect(end.y).toBeCloseTo(0);
 expect(await page.locator('.turtle-line').evaluateAll(lines=>lines.every(line=>Math.abs(line.getTotalLength()-90)<.01))).toBe(true);
});

test('Stop freezes a partial drawing and a new run starts cleanly',async ({page})=> {
 await setup(page);await start(page);await page.clock.runFor(360);
 await page.locator('#stop').click({force:true});
 await expect(page.locator('#run')).toBeEnabled();await expect(page.locator('#status')).toHaveText('Малювання зупинено');
 const stopped=await position(page);
 const partial=await page.locator('.turtle-line').first().getAttribute('d');
 await page.clock.runFor(5000);
 expect(await position(page)).toEqual(stopped);await expect(page.locator('.turtle-line').first()).toHaveAttribute('d',partial);
 await start(page);await page.clock.runFor(4500);
 await expect(page.locator('#status')).toContainText('✓');await expect(page.locator('.turtle-line')).toHaveCount(4);
});

test('reduced-motion defaults to static but explicit choice enables movement',async ({page})=> {
 await page.emulateMedia({reducedMotion:'reduce'});await setup(page);
 await expect(page.locator('#animate')).not.toBeChecked();
 await page.locator('#run').click({force:true});await expect(page.locator('#run')).toBeEnabled();
 await expect(page.locator('.turtle-line')).toHaveCount(4);
 await page.locator('#animate').check({force:true});await start(page);await page.clock.runFor(360);
 expect((await position(page)).y).toBeGreaterThan(-60);
 await expect(page.locator('.turtle-line')).toHaveCount(1);
 await page.clock.runFor(4500);await expect(page.locator('#run')).toBeEnabled();
});

test('pen-up travel, left turn, reverse movement and colors keep correct geometry',async ({page})=> {
 await setup(page);
 await page.locator('#code').fill('turtle.color("#E60036"); turtle.forward(40); turtle.penup(); turtle.forward(30); turtle.left(90); turtle.pendown(); turtle.color("#00A6EB"); turtle.forward(-20);');
 await start(page);await page.clock.runFor(400);
 await expect(page.locator('.turtle-line')).toHaveCount(1);
 expect((await position(page)).y).toBeLessThan(-40);
 await page.clock.runFor(1500);await expect(page.locator('#run')).toBeEnabled();
 await expect(page.locator('.turtle-line')).toHaveCount(2);
 await expect(page.locator('.turtle-line').first()).toHaveAttribute('stroke','#E60036');
 await expect(page.locator('.turtle-line').last()).toHaveAttribute('stroke','#00A6EB');
 const end=await position(page);expect(end.x).toBeCloseTo(20);expect(end.y).toBeCloseTo(-70);
});
