const SHOP='https://olivialondonswimwear.com/product/';
const ALL=window.LOOKDATA;
const P={};ALL.forEach(l=>P[l.k]=l);
P.sanaa={k:'sanaa',name:'Sanaa Tote',kind:'Handcrafted in Marrakesh',price:'$225',url:'sanaa-tote',cats:[]};
const pad=n=>String(n).padStart(2,'0');
const $=s=>document.querySelector(s);
const stage=$('#stage'),rail=$('#rail');
const fr=(k,i)=>'frames/'+k+'_'+i+'.webp';
const SPIN=[[0,0],[1,0],[2,0],[3,0],[2,1],[1,1]];
let view=ALL.map((_,i)=>i), pos=0, wearing=ALL[0].k, angle=0;
const cur=()=>view[pos];

/* models */
const models=ALL.map(l=>{
  const m=document.createElement('div');m.className='model';
  m.innerHTML=`<div class="fig"><img alt="Model wearing ${l.name}" draggable="false" decoding="async"></div>
  <div class="cap"><em></em><b>${l.name.toUpperCase()}</b><span>${l.price}</span></div>
  <div class="spinhint"><span>Drag to turn</span><button type="button" class="auto">360°</button></div>`;
  stage.appendChild(m);return m;
});
function setImg(i,src){const img=models[i].querySelector('img');if(img.getAttribute('src')!==src)img.src=src;}

/* odometer */
const odo=$('#odo');
const digits=[0,1].map(()=>{const d=document.createElement('span');d.className='digit';d.innerHTML=[...Array(10)].map((_,i)=>`<span>${i}</span>`).join('');odo.appendChild(d);return d;});

/* rail: pieces for the current look */
function pairFor(l){
  const c=l.cats.find(x=>x!=='Best Sellers'&&x!=='New Releases')||l.cats[0];
  const i=ALL.indexOf(l);
  for(let d=1;d<ALL.length;d++){const o=ALL[(i+d)%ALL.length];if(o.cats.includes(c))return o.k;}
  return ALL[(i+1)%ALL.length].k;
}
function renderRail(){
  const l=ALL[cur()];const items=[l.k,pairFor(l),'sanaa'];
  rail.innerHTML=`<div class="group"><div class="ghead"><span>Look ${pad(cur()+1)}</span><span>${items.length} pieces</span></div>`+
  items.map(k=>{const p=P[k];const wearable=k!=='sanaa';return `<div class="prod${k===wearing?' wearing':''}" data-key="${k}">
    <a class="pimg" href="${SHOP+p.url}/" target="_blank" rel="noopener"><img alt="${p.name}" src="prod/${k}.jpg" loading="lazy"></a>
    <button class="heart" aria-label="Save ${p.name}"><svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg></button>
    <div class="pinfo"><div><b>${p.name.toUpperCase()}</b><small>${p.kind}</small><div class="price">${p.price}${p.code?`<em>${p.code}</em>`:''}</div></div>
    <div class="acts">${wearable?`<button class="tryon" data-key="${k}">Try on</button>`:''}<button class="add" data-name="${p.name}" aria-label="Add ${p.name} to bag">+</button></div></div></div>`}).join('')+'</div>';
  rail.scrollTo({top:0,left:0,behavior:'smooth'});
}
rail.addEventListener('click',e=>{
  const h=e.target.closest('.heart');if(h){h.classList.toggle('on');return;}
  const t=e.target.closest('.tryon');if(t){wear(t.dataset.key);pause(true);return;}
  const a=e.target.closest('.add');if(a){const b=$('#bagCount');b.textContent=+b.textContent+1;b.classList.add('pop');setTimeout(()=>b.classList.remove('pop'),250);toast(a.dataset.name+' added to bag');}
});
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),1800);}

function paintFront(fade){
  const m=models[cur()],img=m.querySelector('img');
  const src=fr(wearing,SPIN[angle][0]),flip=SPIN[angle][1]===1;
  const apply=()=>{img.src=src;img.classList.toggle('flip',flip);};
  if(fade){img.classList.add('swap');setTimeout(()=>{apply();img.classList.remove('swap');},220);}else apply();
  const own=wearing===ALL[cur()].k;
  m.querySelector('.cap em').textContent=own?'':'Now wearing';
  m.querySelector('.cap b').textContent=P[wearing].name.toUpperCase();
  m.querySelector('.cap span').textContent=P[wearing].price;
  rail.querySelectorAll('.prod').forEach(p=>p.classList.toggle('wearing',p.dataset.key===wearing));
}
function wear(k){
  if(k===wearing){toast(P[k].name+' is on');return;}
  wearing=k;angle=0;paintFront(true);
  $('#lookmeta').textContent='Now wearing '+P[k].name+' · '+P[k].price;
  $('#shoplink').href=SHOP+P[k].url+'/';
  toast('Trying on '+P[k].name);
}
// preload the angle frames for the front look
function preload(k){for(let i=1;i<4;i++){const im=new Image();im.src=fr(k,i);}}

function layout(){
  const W=stage.clientWidth,H=stage.clientHeight,mobile=innerWidth<=820;
  const mh=H*(mobile?.66:.8),mw=mh*520/910;
  const fx=W*(mobile?.6:.56),base=H*(mobile?.78:.9);
  const gap=W*(mobile?.2:.12),visible=mobile?3:6,N=view.length;
  models.forEach((m,i)=>{
    const vi=view.indexOf(i);
    m.style.width=mw+'px';m.style.height=mh+'px';
    if(vi<0){m.style.opacity=0;m.style.visibility='hidden';m.classList.remove('front');return;}
    let s=(vi-pos+N)%N;
    let slot=(s===N-1&&N>2)?-1:(s>=visible?visible:s);
    let x,y,sc,blur,op,z;
    if(slot===-1){x=fx+W*.45;y=base;sc=1.04;blur=4;op=0;z=60;}
    else{x=fx-gap*slot*(1-slot*.045);y=base-H*.03*slot;sc=Math.pow(.84,slot);blur=slot?1.2+slot*1.4:0;op=slot===visible?0:1-slot*.1;z=40-slot;}
    if(slot>=-1&&slot<visible)setImg(i,fr(ALL[i].k,0));
    m.style.visibility=op>0||slot===-1?'visible':'hidden';
    m.style.transform=`translate(${x-mw/2}px,${y-mh}px) scale(${sc})`;
    m.style.filter=`blur(${blur}px) saturate(${slot<=0?1:.8}) brightness(${slot<=0?1:1.04})`;
    m.style.opacity=op;m.style.zIndex=z;
    m.classList.toggle('front',slot===0);
  });
}
function render(dir=1){
  models.forEach((m,i)=>{if(i!==cur())m.querySelector('img').classList.remove('flip');});
  wearing=ALL[cur()].k;angle=0;stopAuto();
  layout();paintFront(false);preload(wearing);
  const n=pad(cur()+1);digits.forEach((d,i)=>d.style.transform=`translateY(-${n[i]}em)`);
  const p=P[wearing];
  const ln=$('#lookname');const olds=[...ln.querySelectorAll('span:not(.out)')];olds.forEach(o=>o.classList.add('out'));
  const nw=document.createElement('span');nw.textContent=p.name.toUpperCase();
  nw.style.transform=`translateY(${dir*100}%)`;nw.style.opacity=0;ln.appendChild(nw);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{nw.style.transform='none';nw.style.opacity=1;olds.forEach(old=>{old.style.position='absolute';old.style.top='0';old.style.transform=`translateY(${-dir*100}%)`;old.style.opacity=0;setTimeout(()=>old.remove(),700);});}));
  $('#lookmeta').textContent=p.kind+' · '+p.price;
  $('#shoplink').href=SHOP+p.url+'/';
  $('#count').textContent=pad(pos+1)+' / '+pad(view.length);
  renderRail();
}
function go(d){pos=(pos+d+view.length)%view.length;render(d);}

/* filters */
document.querySelectorAll('.sub .f').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();document.querySelectorAll('.sub .f').forEach(x=>x.classList.remove('on'));a.classList.add('on');
  const f=a.dataset.f;view=ALL.map((l,i)=>(!f||l.cats.includes(f))?i:-1).filter(i=>i>=0);
  pos=0;render(1);pause(true);
}));

/* spin */
let autoSpin=null;
function turn(d){angle=(angle+d+SPIN.length)%SPIN.length;paintFront(false);}
function stopAuto(){clearInterval(autoSpin);autoSpin=null;document.querySelectorAll('.auto').forEach(b=>b.classList.remove('on'));}
document.addEventListener('click',e=>{const b=e.target.closest('.auto');if(!b)return;e.stopPropagation();
  if(autoSpin){stopAuto();angle=0;paintFront(false);}else{b.classList.add('on');autoSpin=setInterval(()=>turn(1),420);pause(true);}});

/* input */
let lock=0;function step(d){const now=Date.now();if(now-lock<650)return;lock=now;go(d);pause();}
$('#prev').onclick=e=>{e.stopPropagation();step(-1);};
$('#next').onclick=e=>{e.stopPropagation();step(1);};
stage.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)+Math.abs(e.deltaX)<12)return;e.preventDefault();step((e.deltaY||e.deltaX)>0?1:-1);},{passive:false});
addEventListener('keydown',e=>{if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1);});
let drag=null;
stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('a,button'))return;
  const onModel=e.target.closest('.model.front');
  drag={x:e.clientX,y:e.clientY,spin:!!onModel,acc:0};
  if(onModel){onModel.classList.add('spinning');stopAuto();pause(true);try{stage.setPointerCapture(e.pointerId);}catch(_){}}
});
stage.addEventListener('pointermove',e=>{
  if(!drag||!drag.spin)return;const dx=e.clientX-drag.x;const st=innerWidth<=820?28:36;
  while(dx-drag.acc>st){turn(-1);drag.acc+=st;}
  while(drag.acc-dx>st){turn(1);drag.acc-=st;}
});
addEventListener('pointerup',e=>{
  if(!drag)return;const d=drag;drag=null;
  document.querySelectorAll('.model.spinning').forEach(m=>m.classList.remove('spinning'));
  if(d.spin){pause();return;}
  const dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))step(dx<0?1:-1);
  else if(Math.abs(dx)<6&&Math.abs(dy)<6&&e.target.closest&&e.target.closest('.stage')){const r=stage.getBoundingClientRect();step(e.clientX-r.left>r.width*.56?1:-1);}
});

/* cursor */
const cursor=$('#cursor'),curtxt=$('#curtxt');let cx=0,cy=0,tx=0,ty=0;
addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;if(e.pointerType!=='mouse')return;
  const over=e.target.closest('.stage')&&!e.target.closest('a,button');
  cursor.style.opacity=over?1:0;cursor.classList.toggle('wide',!!over);
  if(over){const onM=e.target.closest('.model.front');const r=stage.getBoundingClientRect();
    curtxt.textContent=onM?'TURN':(e.clientX-r.left>r.width*.56?'NEXT':'PREV');}});
(function loop(){cx+=(tx-cx)*.22;cy+=(ty-cy)*.22;cursor.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(loop);})();

/* autoplay */
let auto,resume;function start(){clearInterval(auto);auto=setInterval(()=>go(1),5200);}
function pause(long){clearInterval(auto);clearTimeout(resume);resume=setTimeout(start,long?20000:10000);}
stage.addEventListener('mouseenter',()=>clearInterval(auto));
stage.addEventListener('mouseleave',()=>{if(!autoSpin){clearTimeout(resume);start();}});
rail.addEventListener('pointerdown',()=>pause(true));
addEventListener('resize',layout);
render(1);start();
