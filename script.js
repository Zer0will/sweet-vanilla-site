const products = [
  { id:'cake', name:'Pastel personalizado', note:'6”, 8” o corazón', sizes:[['6','Pastel 6”',80],['8','Pastel 8”',100],['heart','Pastel corazón 6”',85]], flavors:true },
  { id:'gelatinas', name:'Mini gelatinas', note:'12 unidades', sizes:[['12','12 unidades',60]] },
  { id:'flan', name:'Mini flan', note:'24 unidades', sizes:[['24','24 unidades',50]] },
  { id:'chocoflan', name:'Mini chocoflan', note:'12 unidades', sizes:[['12','12 unidades',50]] },
  { id:'cupcakes', name:'Cupcakes', note:'12 unidades', sizes:[['12','12 unidades',50]] },
  { id:'cakepops', name:'Cake pops redondos', note:'12 unidades', sizes:[['12','12 unidades',45]] },
  { id:'popsicle', name:'Popsicle cake pops', note:'12 unidades', sizes:[['12','12 unidades',60]] },
  { id:'churrocheesecake', name:'Churro cheesecake', note:'16 unidades', sizes:[['16','16 unidades',50]] },
  { id:'moussecheese', name:'Mousse de cheesecake', note:'12 vasitos', sizes:[['12','12 vasitos',45]] },
  { id:'mousseoreo', name:'Mousse Oreo y pudín', note:'12 vasitos', sizes:[['12','12 vasitos',35]] },
  { id:'mosaico', name:'Gelatina mosaico', note:'12 vasitos', sizes:[['12','12 vasitos',45]] },
  { id:'churros', name:'Churros con toppings', note:'Box individual', sizes:[['1','1 box',8],['2','2 boxes',16],['4','4 boxes',32]], toppings:true },
  { id:'slice-vanilla', name:'Porción vainilla con dulce de leche', note:'Porción individual', sizes:[['1','1 porción',8],['6','6 porciones',48],['12','12 porciones',96]] },
  { id:'slice-chocolate', name:'Porción triple chocolate especial', note:'Porción individual', sizes:[['1','1 porción',10],['6','6 porciones',60],['12','12 porciones',120]] },
  { id:'crepas', name:'Crepas dulces', note:'Cada dos viernes · precio por confirmar', sizes:[['quote','Cotizar con Diana',0]] },
  { id:'fresas', name:'Fresas con crema', note:'Temporada · precio por confirmar', sizes:[['quote','Cotizar con Diana',0]] }
];
const flavors = [
  {id:'tradicional',name:'Tradicional',note:'Tres leches + dulce de leche'},
  {id:'strawberry',name:'Strawberry Creamcheese',note:'Fresas, crema y cream cheese'},
  {id:'chocolate',name:'Chocolate Deluxe',note:'Chocolate húmedo + ganache'},
  {id:'moca',name:'Moca Cookie Crumble',note:'Moca, mousse y Oreo'}
];

// Fase 1: configuración ligera. Reemplazar por Airtable/Sheets/DB en producción.
const bookedDates = {
  '2026-08-15': 5,
  '2026-08-16': 5
};
const DAILY_CAPACITY = 5;
const TOTAL_STEPS = 7;
const state = { step:1, product:null, size:null, flavor:null, extra:0, toppingExtra:0 };
const $ = s => document.querySelector(s);
const money = n => n ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n) : 'Por confirmar';
const safe = v => (v || '').toString().trim();

function renderProducts(){
  $('#productChoices').innerHTML = products.map(p=>`<button type="button" class="choice-card" data-product="${p.id}"><strong>${p.name}</strong><span>${p.note}</span></button>`).join('');
  document.querySelectorAll('[data-product]').forEach(btn=>btn.onclick=()=>{
    state.product = products.find(p=>p.id===btn.dataset.product);
    state.size=null; state.flavor=null; state.extra=0; state.toppingExtra=0;
    document.querySelectorAll('[data-product]').forEach(x=>x.classList.remove('selected'));
    btn.classList.add('selected');
    renderSizes(); renderFlavors(); updateSummary();
  });
}
function renderSizes(){
  $('#sizeChoices').innerHTML = state.product ? state.product.sizes.map(([id,name,price])=>`<button type="button" class="choice-card" data-size="${id}"><strong>${name}</strong><span>${money(price)}</span></button>`).join('') : '<p>Primero selecciona un producto.</p>';
  document.querySelectorAll('[data-size]').forEach(btn=>btn.onclick=()=>{
    state.size = state.product.sizes.find(s=>s[0]===btn.dataset.size);
    document.querySelectorAll('[data-size]').forEach(x=>x.classList.remove('selected'));
    btn.classList.add('selected');
    updateSummary();
  });
}
function renderFlavors(){
  const needsFlavor = state.product?.flavors;
  $('#flavorChoices').innerHTML = needsFlavor ? flavors.map(f=>`<button type="button" class="choice-card" data-flavor="${f.id}"><strong>${f.name}</strong><span>${f.note}</span></button>`).join('') : '<p>Este producto no requiere selección de sabor. Puedes continuar.</p>';
  $('#extraOptions').innerHTML = '';
  if(state.product?.toppings){
    $('#extraOptions').innerHTML = '<label>Elige topping principal<select id="topping"><option>Nutella</option><option>Leche condensada</option><option>Dulce de leche</option></select></label><label class="checkbox"><input id="extraTopping" type="checkbox"> <span>Agregar topping extra (+$2 por box)</span></label>';
    $('#extraTopping').onchange=()=>{ state.toppingExtra = $('#extraTopping').checked ? 2 : 0; updateSummary(); };
  }
  document.querySelectorAll('[data-flavor]').forEach(btn=>btn.onclick=()=>{
    state.flavor = flavors.find(f=>f.id===btn.dataset.flavor); state.extra=0;
    document.querySelectorAll('[data-flavor]').forEach(x=>x.classList.remove('selected'));
    btn.classList.add('selected');
    if(state.flavor.id==='tradicional') $('#extraOptions').innerHTML='<label class="checkbox"><input id="fruitExtra" type="checkbox"> <span>Agregar relleno de coctel de frutas (+$5)</span></label>';
    if(state.flavor.id==='chocolate') $('#extraOptions').innerHTML='<label>Elige ganache<select id="ganache"><option>Dulce de leche</option><option>Chocolate</option></select></label>';
    const fruit=$('#fruitExtra');
    if(fruit) fruit.onchange=()=>{state.extra=fruit.checked?5:0;updateSummary()};
    updateSummary();
  });
}
function total(){
  if(!state.size) return 0;
  const base = state.size[2] || 0;
  const qty = Number(state.size[0]) || 1;
  const topping = state.product?.toppings ? state.toppingExtra * qty : 0;
  return base + state.extra + topping;
}
function selectedDateText(){
  const date=$('#pickupDate')?.value;
  return date ? new Date(date+'T12:00:00').toLocaleDateString('es-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) : '';
}
function summaryLines(){
  const lines=[];
  if(state.product) lines.push(['Producto',state.product.name]);
  if(state.size) lines.push(['Tamaño/cantidad',state.size[1]]);
  if(state.flavor) lines.push(['Sabor',state.flavor.name]);
  if(state.extra) lines.push(['Extra','Coctel de frutas +$5']);
  if(state.product?.toppings){
    const topping=$('#topping')?.value;
    if(topping) lines.push(['Topping principal',topping]);
    if(state.toppingExtra) lines.push(['Topping extra',`+$${state.toppingExtra} por box`]);
  }
  const dec=safe($('#decoration')?.value); if(dec) lines.push(['Decoración',dec]);
  const dateText=selectedDateText(); if(dateText) lines.push(['Fecha',dateText]);
  const name=safe($('#customerName')?.value); if(name) lines.push(['Cliente',name]);
  const phone=safe($('#customerPhone')?.value); if(phone) lines.push(['WhatsApp',phone]);
  return lines;
}
function updateSummary(){
  const lines=summaryLines();
  const html = lines.length ? lines.map(([a,b])=>`<div class="summary-line"><span>${a}</span><strong>${b}</strong></div>`).join('') : '<p>Selecciona un producto para comenzar.</p>';
  $('#summaryContent').innerHTML = html;
  const final = $('#finalReview');
  if(final) final.innerHTML = html;
  $('#estimatedTotal').textContent = total() ? money(total()) : 'Por confirmar';
  $('#depositTotal').textContent = total() ? money(total()/2) : 'Por confirmar';
}
function validateStep(){
  if(state.step===1 && !state.product) return toast('Selecciona un producto.');
  if(state.step===2 && !state.size) return toast('Selecciona un tamaño o cantidad.');
  if(state.step===3 && state.product?.flavors && !state.flavor) return toast('Selecciona un sabor.');
  if(state.step===5 && !validDate()) return toast('Selecciona una fecha válida de sábado o domingo con 4 días de anticipación.');
  if(state.step===6){
    if(!safe($('#customerName').value)||!safe($('#customerPhone').value)) return toast('Completa tu nombre y teléfono.');
    if(!$('#terms').checked) return toast('Debes aceptar las políticas.');
  }
  return true;
}
function setStep(n){
  state.step=n;
  document.querySelectorAll('.form-step').forEach(s=>s.classList.toggle('active',+s.dataset.step===n));
  $('#progressFill').style.width=`${n/TOTAL_STEPS*100}%`;
  $('#progressText').textContent=`Paso ${n} de ${TOTAL_STEPS}`;
  $('#prevBtn').style.visibility=n===1?'hidden':'visible';
  $('#nextBtn').textContent=n===TOTAL_STEPS?'Enviar a WhatsApp':'Continuar';
  updateSummary();
}
function validDate(){
  const v=$('#pickupDate').value;
  if(!v) return false;
  const d=new Date(v+'T12:00:00');
  const day=d.getDay();
  const min=new Date(); min.setHours(0,0,0,0); min.setDate(min.getDate()+4);
  const count = bookedDates[v] || 0;
  const isWeekend = day===0 || day===6;
  const ok = isWeekend && d>=min && count < DAILY_CAPACITY;
  let message = 'Esta fecha no está disponible.';
  if(ok) message = `✓ Fecha disponible (${DAILY_CAPACITY-count} espacios tentativos)`;
  else if(!isWeekend) message = 'Solo sábados y domingos.';
  else if(d<min) message = 'Se requieren al menos 4 días de anticipación.';
  else if(count >= DAILY_CAPACITY) message = 'Esta fecha ya alcanzó el máximo de 5 pedidos.';
  $('#dateStatus').textContent=message;
  $('#dateStatus').style.color=ok?'#2f6c3e':'#a53f2b';
  return ok;
}
function sendWhatsApp(){
  if(!validateStep()) return;
  const files=[...$('#inspiration').files].map(f=>f.name).join(', ')||'No adjuntadas';
  const ganache=$('#ganache')?.value;
  const topping=$('#topping')?.value;
  const quoteNote = total() ? `${money(total())} + decoración personalizada` : 'Por confirmar';
  const depositNote = total() ? money(total()/2) : 'Por confirmar';
  const msg=`🧁 NUEVO PEDIDO — Sweet Vanilla\n\nProducto: ${state.product.name}\nTamaño/cantidad: ${state.size[1]}\nSabor: ${state.flavor?.name||'No aplica'}${ganache?`\nGanache: ${ganache}`:''}${state.extra?`\nExtra: Coctel de frutas (+$5)`:''}${topping?`\nTopping principal: ${topping}`:''}${state.toppingExtra?`\nTopping extra: +$${state.toppingExtra} por box`:''}\nDecoración: ${safe($('#decoration').value)||'Por definir'}\nFotos de inspiración: ${files}\nEntrega: ${selectedDateText()}\nCliente: ${safe($('#customerName').value)} · ${safe($('#customerPhone').value)}\nNotas: ${safe($('#notes').value)||'Ninguna'}\nTotal estimado: ${quoteNote}\nAnticipo estimado (50%): ${depositNote}\n\nEntiendo que las fotos son inspiración, no copia exacta. Diana confirmará disponibilidad y precio final.`;
  toast('Abriendo WhatsApp con el resumen del pedido...');
  window.open(`https://wa.me/12065716064?text=${encodeURIComponent(msg)}`,'_blank');
}
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); return false; }

$('#nextBtn').onclick=()=>{ if(!validateStep()) return; if(state.step<TOTAL_STEPS) setStep(state.step+1); else sendWhatsApp(); };
$('#prevBtn').onclick=()=> state.step>1 && setStep(state.step-1);
['decoration','customerName','customerPhone','notes'].forEach(id=>document.getElementById(id)?.addEventListener('input',updateSummary));
$('#pickupDate').addEventListener('change',()=>{validDate();updateSummary()});
$('#inspiration').addEventListener('change',()=>{
  if($('#inspiration').files.length>3){
    toast('Máximo 3 fotos de inspiración.');
    $('#inspiration').value='';
  }
});
const min=new Date(); min.setDate(min.getDate()+4); $('#pickupDate').min=min.toISOString().split('T')[0];
$('.menu-toggle').onclick=()=>{ const n=$('.nav-links'); n.classList.toggle('open'); $('.menu-toggle').setAttribute('aria-expanded',n.classList.contains('open')); };
document.querySelectorAll('.nav-links a').forEach(a=>a.onclick=()=>$('.nav-links').classList.remove('open'));
const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('visible',e.isIntersecting)),{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
renderProducts(); renderSizes(); renderFlavors(); setStep(1);
