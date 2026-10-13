(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const parks = window.TRIP_DATA.parks;
  const key = 'even-eropuit:v1';
  const slots = {main:'Hoofdactiviteit',extra:'Kleine extra',rain:'Regenbackup'};
  const filters = [['all','Alles'],['park','Op het park'],['indoor','Binnen'],['outdoor','Buiten'],['free','Gratis'],['paid','Betaald'],['near','≤10 minuten'],['medium','11–20 minuten'],['rain','Regenproof'],['favorites','♡ Favorieten']];
  let saved = {}, filter='all', query='', adding=null, preferredSlot='main', preferredDay=0;
  try { saved=JSON.parse(localStorage.getItem(key)||'{}')||{}; if(typeof saved!=='object'||Array.isArray(saved))saved={}; } catch { $('storage-warning').hidden=false; }
  let park=parks.find(p=>p.id===saved.selectedPark)||parks[0];
  let state;
  const escape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const external = (url,label) => `<a href="${escape(url)}" target="_blank" rel="noopener">${label}</a>`;
  function initState(){
    const raw=saved[park.id]||{};
    const valid=ids=>Array.isArray(ids)?ids.filter(id=>park.activities.some(a=>a.id===id)):[];
    state={favorites:valid(raw.favorites),hidden:valid(raw.hidden),rain:raw.rain===true,startDate:typeof raw.startDate==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(raw.startDate)&&!isNaN(new Date(raw.startDate+'T12:00:00'))?raw.startDate:'',plan:Array.from({length:3},(_,i)=>Object.fromEntries(Object.keys(slots).map(slot=>[slot,park.activities.some(a=>a.id===raw.plan?.[i]?.[slot])?raw.plan[i][slot]:null])))};
  }
  function save(){saved[park.id]=state;saved.selectedPark=park.id;try{localStorage.setItem(key,JSON.stringify(saved));}catch{$('storage-warning').hidden=false;}}
  let toastTimer;
  function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3600);}
  function dateInfo(i){
    if(!state.startDate)return {number:String(17+i),label:`Dag ${i+1}`,full:`Dag ${i+1} — ${17+i}`};
    const d=new Date(state.startDate+'T12:00:00');d.setDate(d.getDate()+i);
    const label=d.toLocaleDateString('nl-NL',{weekday:'long',month:'long',year:'numeric'});
    return {number:String(d.getDate()),label,full:`Dag ${i+1} — ${d.toLocaleDateString('nl-NL',{day:'numeric',month:'long'})}`};
  }
  const drive=a=>a.onPark?'Op het park':`ca. ${a.travel[0]}–${a.travel[1]} min rijden`;
  const cost=a=>({free:'Gratis',paid:'Betaald',included:'Inbegrepen voor parkgasten',unknown:'Kosten navragen'}[a.cost]);
  function renderPark(){
    $('park').innerHTML=parks.map(p=>`<option value="${escape(p.id)}">${escape(p.name)}</option>`).join('');$('park').value=park.id;
    $('park-thumb').src=park.thumbnail;$('park-thumb').alt=park.name;$('hero-image').src=park.thumbnail;$('hero-image').alt=park.name+' tussen het groen';$('hero-park').textContent=park.name;
    $('booking').href=park.website;$('reserve').href=park.bookingUrl;$('park-source').href=park.facilities;
  }
  function renderPlan(){
    $('days').innerHTML=state.plan.map((day,i)=>{const date=dateInfo(i);return `<article class="day"><div class="day-header"><span class="day-number">${date.number}</span><div><h3>Dag ${i+1}</h3><small>${escape(state.startDate?date.label:'Alle ruimte om te genieten')}</small></div></div>${Object.entries(slots).map(([slot,label])=>{const a=park.activities.find(a=>a.id===day[slot]);return `<div class="slot"><span class="slot-label">${label}</span>${a?`<div class="slot-filled"><span>${escape(a.icon+' '+a.name)}<small>${escape(drive(a)+' · '+a.duration)}</small>${a.travel[1]>20?'<small class="slot-warning">Mogelijk boven 20 min</small>':''}${slot==='rain'&&!a.rain?'<small class="slot-warning">Buiten: geen regenproof backup</small>':''}<small>Check opening op je bezoekdatum</small></span><button data-remove="${i}:${slot}" aria-label="${escape(a.name)} verwijderen uit dag ${i+1}, ${label}">×</button></div>`:`<button class="slot-empty" data-pick="${i}:${slot}">+ ${slot==='main'?'Kies een hoofdactiviteit':slot==='extra'?'Iets kleins erbij':'Voor als het regent'}</button>`}</div>`;}).join('')}</article>`;}).join('');
    $('plan-count').textContent=state.plan.reduce((n,d)=>n+Object.values(d).filter(Boolean).length,0);
    $('trip-dates').textContent=state.startDate?`${dateInfo(0).full} t/m ${dateInfo(2).full}`:'Voorlopige dagen: 17, 18 en 19 · maand nog te kiezen';
  }
  function matches(a){
    if(state.hidden.includes(a.id))return false;
    if(query&&!`${a.name} ${a.location} ${a.description}`.toLocaleLowerCase('nl').includes(query))return false;
    return ({all:()=>true,park:()=>a.onPark,indoor:()=>a.setting==='indoor',outdoor:()=>a.setting==='outdoor',free:()=>['free','included'].includes(a.cost),paid:()=>a.cost==='paid',near:()=>a.travel[1]<=10,medium:()=>a.travel[1]>10&&a.travel[1]<=20,rain:()=>a.rain,favorites:()=>state.favorites.includes(a.id)})[filter]();
  }
  function renderCards(){
    const visible=park.activities.filter(matches).sort((a,b)=>state.rain?Number(!!b.rain)-Number(!!a.rain):0);
    $('filters').innerHTML=filters.map(([id,label])=>`<button class="filter" data-filter="${id}" aria-pressed="${filter===id}">${label}</button>`).join('');
    $('cards').innerHTML=visible.map(a=>{
      const fav=state.favorites.includes(a.id),far=a.travel[1]>20;
      const route='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(park.address)+'&destination='+encodeURIComponent(a.onPark?park.address:a.location)+'&travelmode=driving';
      return `<article class="card${state.rain&&a.setting==='outdoor'?' dimmed':''}" data-activity="${a.id}"><div class="card-visual" style="--card-bg:${a.color}"><span class="card-emoji" aria-hidden="true">${a.icon}</span>${a.older?'<span class="badge extra">Vanaf circa 10 jaar</span>':far?'<span class="badge extra">Iets verder weg</span>':a.top?'<span class="badge">♡ Familiefavoriet</span>':a.onPark?'<span class="badge">Op je vakantiepark</span>':a.rain?'<span class="badge">☁ Fijne regenoptie</span>':''}<button class="favorite" data-favorite="${a.id}" aria-pressed="${fav}" aria-label="${escape(a.name)} ${fav?'uit favorieten verwijderen':'als favoriet bewaren'}">${fav?'♥':'♡'}</button></div><div class="card-body"><p class="card-location">${escape(a.location)}</p><h3>${escape(a.name)}</h3><div class="chips"><span class="chip">${escape(drive(a))}</span><span class="chip">${a.setting==='indoor'?'Binnen':a.setting==='outdoor'?'Buiten':'Wisselend'}</span><span class="chip">${cost(a)}</span><span class="chip">${escape(a.duration)}</span></div><p class="card-description">${escape(a.description)}</p><p class="family-tip">${escape(a.family)}</p>${a.warning?`<p class="warning">${escape(a.warning)}</p>`:''}<details><summary>Leeftijd & bezoekinformatie</summary><p><strong>${escape(a.ages)}</strong> · Onze inschatting</p><p>${escape(a.opening)}</p>${a.rulesUrl?external(a.rulesUrl,'Regels & voorwaarden ↗'):''}<p class="small">Bron gecontroleerd: 14 oktober 2026. Openingstijden kunnen veranderen.</p></details><div class="card-links">${external(a.url,'Officiële website ↗')}${external(route,'Route ↗')}</div><div class="card-bottom"><button class="button primary" data-add="${a.id}">+ In mijn planning</button><button class="text-button hide" data-hide="${a.id}" aria-label="${escape(a.name)} verbergen">Verbergen</button></div></div></article>`;
    }).join('');
    $('results').textContent=`${visible.length} ${visible.length===1?'uitje':'uitjes'} om te ontdekken`;
    $('empty').hidden=visible.length>0;$('hidden-count').textContent=state.hidden.length;
    $('rain').setAttribute('aria-pressed',String(state.rain));$('rain-note').hidden=!state.rain;
  }
  function renderHidden(){const hidden=park.activities.filter(a=>state.hidden.includes(a.id));$('hidden-list').innerHTML=hidden.length?hidden.map(a=>`<div class="hidden-row"><span>${a.icon} ${escape(a.name)}</span><button class="button light" data-restore="${a.id}">Terugzetten</button></div>`).join(''):'<p>Je hebt nog geen activiteiten verborgen.</p>';}
  function render(){renderPlan();renderCards();renderHidden();}
  function addNotes(){const current=state.plan[Number($('add-day').value)][$('add-slot').value];$('replace-note').hidden=!current;$('replace-note').textContent=current?`${park.activities.find(a=>a.id===current).name} staat hier al. Dit uitje wordt vervangen.`:'';$('backup-note').hidden=$('add-slot').value!=='rain'||!!park.activities.find(a=>a.id===adding)?.rain;}
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-close')){b.closest('dialog').close();return;}
    if(b.dataset.filter){filter=b.dataset.filter;renderCards();$('filters').querySelector(`[data-filter="${filter}"]`).focus();}
    if(b.dataset.favorite){const id=b.dataset.favorite;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();renderCards();$('cards').querySelector(`[data-favorite="${id}"]`)?.focus();toast(state.favorites.includes(id)?'Bewaard als favoriet':'Uit favorieten verwijderd');}
    if(b.dataset.hide){const id=b.dataset.hide;state.hidden.push(id);save();renderCards();renderHidden();toast('Uitje verborgen. Terugzetten kan via Verborgen activiteiten.');$('hidden-button').focus();}
    if(b.dataset.restore){state.hidden=state.hidden.filter(id=>id!==b.dataset.restore);save();renderCards();renderHidden();toast('Uitje teruggezet');}
    if(b.dataset.remove){const [day,slot]=b.dataset.remove.split(':');state.plan[day][slot]=null;save();renderPlan();$('days').querySelector(`[data-pick="${day}:${slot}"]`).focus();toast('Uit planning verwijderd');}
    if(b.dataset.pick){const [day,slot]=b.dataset.pick.split(':');preferredDay=Number(day);preferredSlot=slot;filter=slot==='rain'?'rain':'all';query='';$('search').value='';renderCards();$('activiteiten').scrollIntoView({behavior:'smooth'});toast(`Kies een uitje voor ${dateInfo(preferredDay).full}, ${slots[slot].toLowerCase()}`);$('search').focus({preventScroll:true});}
    if(b.dataset.add){adding=b.dataset.add;$('add-title').textContent=park.activities.find(a=>a.id===adding).name;$('add-day').innerHTML=state.plan.map((_,i)=>`<option value="${i}">${escape(dateInfo(i).full)}</option>`).join('');$('add-day').value=preferredDay;$('add-slot').value=preferredSlot;addNotes();$('add-dialog').showModal();}
  });
  $('add-day').addEventListener('change',addNotes);$('add-slot').addEventListener('change',addNotes);
  $('add-form').addEventListener('submit',event=>{event.preventDefault();const day=Number($('add-day').value),slot=$('add-slot').value;state.plan[day][slot]=adding;save();renderPlan();$('add-dialog').close();toast(`Toegevoegd aan dag ${day+1}`);});
  $('search').addEventListener('input',()=>{query=$('search').value.trim().toLocaleLowerCase('nl');renderCards();});
  $('rain').addEventListener('click',()=>{state.rain=!state.rain;save();renderCards();});
  $('hidden-button').addEventListener('click',()=>{renderHidden();$('hidden-dialog').showModal();});
  $('clear-filters').addEventListener('click',()=>{filter='all';query='';$('search').value='';renderCards();});
  $('print').addEventListener('click',()=>window.print());
  $('reset').addEventListener('click',()=>$('reset-dialog').showModal());
  $('reset-form').addEventListener('submit',event=>{event.preventDefault();state.plan=Array.from({length:3},()=>({main:null,extra:null,rain:null}));save();renderPlan();$('reset-dialog').close();toast('Planning is leeggemaakt');});
  $('dates-button').addEventListener('click',()=>{$('start-date').value=state.startDate;$('dates-dialog').showModal();});
  $('dates-form').addEventListener('submit',event=>{event.preventDefault();state.startDate=$('start-date').value;save();renderPlan();$('dates-dialog').close();toast('Vakantiedatums bewaard');});
  $('dates-clear').addEventListener('click',()=>{state.startDate='';save();renderPlan();$('dates-dialog').close();});
  $('park').addEventListener('change',()=>{park=parks.find(p=>p.id===$('park').value);filter='all';query='';preferredDay=0;preferredSlot='main';$('search').value='';initState();save();renderPark();render();});
  for(const img of [$('park-thumb'),$('hero-image')])img.addEventListener('error',()=>{img.alt=park.name+' · parkfoto momenteel niet beschikbaar';});
  initState();renderPark();render();
})();
