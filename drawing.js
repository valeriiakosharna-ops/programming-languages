const NS='http://www.w3.org/2000/svg';
let canvasId=0;
function svgElement(tag,attributes={}) {
 const el=document.createElementNS(NS,tag);
 for(const [key,value] of Object.entries(attributes))el.setAttribute(key,String(value));
 return el;
}
function turtleCanvas(commands) {
 let x=0,y=0,angle=-90,pen=true,color='#00A6EB';
 const points=[[0,0]],steps=[];
 for(const command of commands) {
  const value=command.value;
  if(command.cmd==='color' && typeof value==='string' && /^#[0-9a-f]{6}$/i.test(value))color=value;
  else if(command.cmd==='penup')pen=false;
  else if(command.cmd==='pendown')pen=true;
  else if(['forward','right','left'].includes(command.cmd) && typeof value==='number' && Number.isFinite(value) && Math.abs(value)<=1000) {
   if(command.cmd==='forward') {
    const nx=x+Math.cos(angle*Math.PI/180)*value,ny=y+Math.sin(angle*Math.PI/180)*value;
    steps.push({type:'move',x,y,nx,ny,angle,pen,color});
    x=nx;y=ny;points.push([x,y]);
   } else {
    const nextAngle=angle+(command.cmd==='right'?value:-value);
    steps.push({type:'turn',x,y,angle,nextAngle});angle=nextAngle;
   }
  }
 }
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const span=Math.max(maxX-minX,maxY-minY,100),margin=span*.2;
 const svg=svgElement('svg',{viewBox:`${minX-margin} ${minY-margin} ${maxX-minX+margin*2} ${maxY-minY+margin*2}`,role:'img',class:'turtle-canvas'});
 const title=svgElement('title');title.textContent='Черепашка послідовно малює фігуру.';svg.append(title);
 const gridId=`turtle-grid-${++canvasId}`,gridSize=span/10;
 const defs=svgElement('defs'),pattern=svgElement('pattern',{id:gridId,width:gridSize,height:gridSize,patternUnits:'userSpaceOnUse'});
 pattern.append(svgElement('path',{d:`M ${gridSize} 0 H 0 V ${gridSize}`,fill:'none',stroke:'#d9ecf6','stroke-width':'.6','vector-effect':'non-scaling-stroke'}));defs.append(pattern);svg.append(defs);
 svg.append(svgElement('rect',{x:minX-margin,y:minY-margin,width:maxX-minX+margin*2,height:maxY-minY+margin*2,fill:`url(#${gridId})`}));
 const turtle=svgElement('g',{'aria-hidden':'true',class:'turtle-icon'});
 const position=(px,py,heading)=>turtle.setAttribute('transform',`translate(${px} ${py}) rotate(${heading+90}) scale(${span/270})`);
 position(0,0,-90);
 turtle.innerHTML='<ellipse cx="-9" cy="-6" rx="5" ry="3" fill="#2A668E"/><ellipse cx="9" cy="-6" rx="5" ry="3" fill="#2A668E"/><ellipse cx="-9" cy="7" rx="5" ry="3" fill="#2A668E"/><ellipse cx="9" cy="7" rx="5" ry="3" fill="#2A668E"/><circle cy="-15" r="6" fill="#81D0F4" stroke="#2A668E" stroke-width="2"/><ellipse rx="10" ry="13" fill="#00A6EB" stroke="#302A40" stroke-width="2"/><path d="M-5-5 L0-8 L5-5 L5 3 L0 7 L-5 3Z" fill="#81D0F4"/><circle cx="-2" cy="-17" r="1" fill="#302A40"/><circle cx="2" cy="-17" r="1" fill="#302A40"/>';
 svg.append(turtle);
 const wrapper=document.createElement('figure');wrapper.className='drawing';
 const caption=document.createElement('figcaption');caption.textContent='Черепашка готується малювати…';
 wrapper.append(svg,caption);
 async function play({signal,animate=true,onProgress=()=>{}}={}) {
  let drawn=0;
  svg.dataset.animation='playing';
  for(let i=0;i<steps.length;i++) {
   if(signal?.aborted)break;
   const step=steps[i];
   const progress=`Черепашка малює · крок ${i+1} із ${steps.length}`;
   caption.textContent=progress;onProgress(progress);
   let path;
   if(step.type==='move' && step.pen) {
    path=svgElement('path',{d:`M ${step.x} ${step.y} L ${step.x} ${step.y}`,fill:'none',stroke:step.color,'stroke-width':span/90,'stroke-linecap':'round',class:'turtle-line'});
    svg.insertBefore(path,turtle);
   }
   const duration=step.type==='move'
    ? Math.max(250,Math.min(1000,Math.hypot(step.nx-step.x,step.ny-step.y)*8))
    : Math.max(120,Math.min(400,Math.abs(step.nextAngle-step.angle)*2.5));
   const completed=await animateStep(animate?duration:0,amount=> {
    if(step.type==='move') {
     const px=step.x+(step.nx-step.x)*amount,py=step.y+(step.ny-step.y)*amount;
     position(px,py,step.angle);
     path?.setAttribute('d',`M ${step.x} ${step.y} L ${px} ${py}`);
    } else position(step.x,step.y,step.angle+(step.nextAngle-step.angle)*amount);
   },signal,wrapper);
   if(!completed)break;
   if(path)drawn++;
  }
  const cancelled=Boolean(signal?.aborted || !wrapper.isConnected);
  svg.dataset.animation=cancelled?'stopped':'finished';
  title.textContent=cancelled?'Малювання черепашки зупинено.':`Малюнок черепашки. Намальованих ліній: ${drawn}.`;
  caption.textContent=cancelled?'Малювання зупинено. Можеш запустити код ще раз.':`Ліній: ${drawn} · Твій код створив цей малюнок`;
  return {cancelled};
 }
 return {element:wrapper,play};
}
function animateStep(duration,update,signal,element) {
 if(signal?.aborted || !element.isConnected)return Promise.resolve(false);
 if(!duration){update(1);return Promise.resolve(true);}
 return new Promise(resolve=> {
  let frame;
  const started=performance.now();
  const finish=completed=>{cancelAnimationFrame(frame);signal?.removeEventListener('abort',abort);resolve(completed);};
  const abort=()=>finish(false);
  const tick=now=> {
   if(signal?.aborted || !element.isConnected){finish(false);return;}
   const amount=Math.min(1,(now-started)/duration);
   update(amount);
   if(amount>=1)finish(true);else frame=requestAnimationFrame(tick);
  };
  update(0);signal?.addEventListener('abort',abort,{once:true});frame=requestAnimationFrame(tick);
 });
}
export function emptyOutput(container) {
 container.replaceChildren();
 const div=document.createElement('div');div.className='empty';
 div.innerHTML='<span>✧</span><h4>Тут оживе твоя програма</h4><p>Черепашка чекає на твої команди. Натисни «Запустити код».</p>';
 container.append(div);
}
export async function renderOutput(container,result,options={}) {
 container.replaceChildren();
 const lines=(result.stdout || '').replace(/\r/g,'').split('\n');
 if(lines.at(-1)==='')lines.pop();
 const commands=[],text=[];
 for(const line of lines) {
  if(line.startsWith('__NIX_TURTLE__:')) {
   try {
    const command=JSON.parse(line.slice('__NIX_TURTLE__:'.length));
    if(command && ['forward','right','left','color','penup','pendown'].includes(command.cmd)) {commands.push(command);continue;}
   } catch {}
  }
  text.push(line);
 }
 const drawing=commands.length?turtleCanvas(commands.slice(0,200)):null;
 if(drawing)container.append(drawing.element);
 text.slice(0,40).forEach((line,i)=> {
  const card=document.createElement('div');card.className='result-card';
  const label=document.createElement('small');label.textContent=`РЯДОК ${i+1}`;
  const value=document.createElement('strong');value.textContent=line || ' ';card.append(label,value);container.append(card);
 });
 if(!commands.length && !text.length) {
  const p=document.createElement('p');p.textContent=result.ok ? 'Програму виконано без виведення. Щоб побачити результат, додай команду малювання або виведення тексту.' : 'Поки що без результату. Перевір повідомлення нижче.';container.append(p);
 }
 if(text.length>40 || commands.length>200) {
  const p=document.createElement('p');p.textContent='Малюнок обмежено 200 командами, картки — 40 рядками. Повний вивід доступний у консолі.';container.append(p);
 }
 return drawing?drawing.play(options):{cancelled:false};
}
