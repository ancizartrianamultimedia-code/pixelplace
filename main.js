/* Pixel Plaza · main.js */
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];

/* 1. Modo oscuro (se recuerda la elección) */
const themeBtn=$('#theme');
const setTheme=t=>{document.documentElement.dataset.theme=t;themeBtn.textContent=t==='dark'?'Modo claro':'Modo oscuro';themeBtn.setAttribute('aria-label',t==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro');try{localStorage.setItem('tema',t)}catch(e){}};
let saved='light';try{saved=localStorage.getItem('tema')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}
setTheme(saved);
themeBtn.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

/* 2. Menú móvil */
const burger=$('#burger'),nav=$('#nav');
burger.addEventListener('click',()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});

/* 3. Carrusel (solo en Inicio) */
const car=$('#carousel');
if(car){
  const slides=$$('.slide',car),count=$('#count');let i=0,timer;
  const show=n=>{i=(n+slides.length)%slides.length;slides.forEach((s,k)=>s.classList.toggle('on',k===i));count.textContent=`${i+1} de ${slides.length}`};
  const auto=()=>{clearInterval(timer);timer=setInterval(()=>show(i+1),5000)};
  $('#next').addEventListener('click',()=>{show(i+1);auto()});
  $('#prev').addEventListener('click',()=>{show(i-1);auto()});
  auto();
}

/* 4. Filtro del catálogo (solo en Portafolio) */
const filters=$('#filters');
if(filters)filters.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  $$('button',filters).forEach(x=>x.classList.toggle('on',x===b));
  $$('.game').forEach(g=>g.classList.toggle('hide',b.dataset.f!=='todos'&&g.dataset.c!==b.dataset.f));
});

/* 5. Validación del formulario (solo en Contacto) */
const form=$('#form');
if(form)form.addEventListener('submit',e=>{
  e.preventDefault();let ok=true;
  const rules={
    nombre:v=>v.trim().length>=3||'Escribe tu nombre (mínimo 3 letras).',
    correo:v=>/^\S+@\S+\.\S+$/.test(v)||'Escribe un correo válido, por ejemplo nombre@correo.com.',
    tema:v=>v!==''||'Elige un tema.',
    mensaje:v=>v.trim().length>=10||'Cuéntanos un poco más (mínimo 10 caracteres).'
  };
  for(const [name,rule] of Object.entries(rules)){
    const f=form.elements[name],r=rule(f.value),bad=r!==true;
    f.classList.toggle('bad',bad);f.nextElementSibling.textContent=bad?r:'';if(bad)ok=false;
  }
  $('#ok').textContent=ok?'Mensaje enviado. Te respondemos en menos de un día.':'';
  if(ok)form.reset();
});

/* Utilidades */
const money=n=>'$'+Math.round(n).toLocaleString('es-CO');
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2400)};

/* 7. Contadores animados (Inicio) */
const counters=$$('[data-count]');
if(counters.length){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;const el=e.target,end=+el.dataset.count,t0=performance.now();io.unobserve(el);
    const tick=t=>{const p=Math.min((t-t0)/1400,1);el.textContent=Math.round(end*(1-Math.pow(1-p,3))).toLocaleString('es-CO');if(p<1)requestAnimationFrame(tick)};
    reduce?el.textContent=end.toLocaleString('es-CO'):requestAnimationFrame(tick);
  }),{threshold:.6});
  counters.forEach(el=>io.observe(el));
}

/* 8. Carrito (se guarda en el navegador) */
let cart={n:0,total:0};try{cart=JSON.parse(localStorage.getItem('carrito'))||cart}catch(e){}
const cartBtn=$('#cart'),cartN=$('#cartN');
const paintCart=()=>{cartN.textContent=cart.n};paintCart();
document.addEventListener('click',e=>{
  const b=e.target.closest('.add');if(!b)return;
  cart.n++;cart.total+=+b.dataset.price;paintCart();
  try{localStorage.setItem('carrito',JSON.stringify(cart))}catch(e){}
  cartBtn.classList.remove('bump');void cartBtn.offsetWidth;cartBtn.classList.add('bump');
  toast(`${b.dataset.name} añadido · ${cart.n} en el carrito`);
});
cartBtn.addEventListener('click',()=>toast(cart.n?`Llevas ${cart.n} producto(s) por ${money(cart.total)}`:'Tu carrito está vacío. Añade un juego del portafolio.'));

/* 9. Portafolio: búsqueda + género + orden */
const games=$('#games');
if(games){
  const q=$('#q'),sort=$('#sort'),found=$('#found'),empty=$('#empty');
  const apply=()=>{
    const f=$('#filters .on').dataset.f,term=q.value.trim().toLowerCase();let n=0;
    $$('.game',games).forEach(g=>{const ok=(f==='todos'||g.dataset.c===f)&&g.dataset.n.includes(term);g.classList.toggle('hide',!ok);if(ok)n++});
    found.textContent=`${n} juego${n===1?'':'s'}`;empty.hidden=n>0;
  };
  const order=()=>{
    const list=$$('.game',games);
    if(sort.value)list.sort((a,b)=>sort.value==='asc'?a.dataset.p-b.dataset.p:b.dataset.p-a.dataset.p);
    else list.sort((a,b)=>a.dataset.i-b.dataset.i);
    list.forEach(g=>games.appendChild(g));
  };
  $$('.game',games).forEach((g,i)=>g.dataset.i=i);
  q.addEventListener('input',apply);sort.addEventListener('change',order);
  $('#filters').addEventListener('click',apply);apply();
}

/* 10. Calculadora de usados (Servicios) */
const calc=$('#calc');
if(calc)calc.addEventListener('submit',e=>{
  e.preventDefault();
  const cant=Math.max(1,Math.min(20,parseInt($('#cCant').value)||1)),v=$('#cTipo').value*$('#cEstado').value*cant;
  $('#cCant').value=cant;
  $('#cOut').textContent=`Te pagamos hasta ${money(v)} en efectivo, o ${money(v*1.15)} en créditos para la tienda.`;
});

/* 11. Suscripción (Inicio) */
const news=$('#news');
if(news)news.addEventListener('submit',e=>{
  e.preventDefault();const f=news.elements.email,ok=/^\S+@\S+\.\S+$/.test(f.value),m=$('#newsMsg');
  f.classList.toggle('bad',!ok);m.textContent=ok?'Listo, quedaste suscrito. Revisa tu correo.':'Escribe un correo válido, por ejemplo nombre@correo.com.';
  m.style.color=ok?'var(--mint)':'var(--red)';if(ok)news.reset();
});

/* 6. Parallax del Inicio: cada capa se desplaza a su propia velocidad al hacer scroll */
const heroLayers=$$('#hero [data-speed]');
if(heroLayers.length&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  let busy=false;
  const move=()=>{busy=false;const y=scrollY;if(y>innerHeight*1.5)return;heroLayers.forEach(el=>{el.style.translate=`0 ${(y*parseFloat(el.dataset.speed)).toFixed(1)}px`})};
  addEventListener('scroll',()=>{if(!busy){busy=true;requestAnimationFrame(move)}},{passive:true});
  move();
}
