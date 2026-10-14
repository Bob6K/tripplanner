(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const parks = window.TRIP_DATA.parks;
  const key = 'even-eropuit:v1';
  const entryId = () => 'item-' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2));
  const filters = [['all','Alles'],['park','Op het park'],['indoor','Binnen'],['outdoor','Buiten'],['free','Gratis'],['paid','Betaald'],['near','≤10 minuten'],['medium','11–20 minuten'],['rain','Regenproof'],['favorites','♡ Favorieten']];
  let saved = {}, filter='all', query='', adding=null, preferredDay=0;
  try { saved=JSON.parse(localStorage.getItem(key)||'{}')||{}; if(typeof saved!=='object'||Array.isArray(saved))saved={}; } catch { $('storage-warning').hidden=false; }
  const parkFromUrl = () => parks.find(p=>p.id===new URL(location.href).searchParams.get('park'));
  let park=parkFromUrl()||parks.find(p=>p.id===saved.selectedPark)||parks[0];
  let state;
  const escape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const external = (url,label) => `<a href="${escape(url)}" target="_blank" rel="noopener">${label}</a>`;
  function initState(){
    const raw=saved[park.id]||{};
    const valid=ids=>Array.isArray(ids)?ids.filter(id=>park.activities.some(a=>a.id===id)):[];
    state={favorites:valid(raw.favorites),hidden:valid(raw.hidden),rain:raw.rain===true,startDate:typeof raw.startDate==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(raw.startDate)&&!isNaN(new Date(raw.startDate+'T12:00:00'))?raw.startDate:'',plan:normalizePlan(raw.plan)};
  }
  // Migrate the original three slots without dropping or merging any activities.
  function normalizePlan(plan){
    const seen=new Set();
    return Array.from({length:3},(_,i)=>{
      const day=plan?.[i];
      const items=Array.isArray(day)?day:['main','extra','rain'].map(slot=>day?.[slot]);
      return items.flatMap(item=>{
        const activityId=typeof item==='string'?item:item?.activityId;
        if(!park.activities.some(a=>a.id===activityId))return [];
        let id=typeof item?.id==='string'&&/^item-[a-z0-9-]+$/i.test(item.id)?item.id:entryId();
        if(seen.has(id))id=entryId();
        seen.add(id);return [{id,activityId}];
      });
    });
  }
  function findEntry(id){
    for(let day=0;day<state.plan.length;day++){
      const index=state.plan[day].findIndex(item=>item.id===id);
      if(index!==-1)return {day,index,item:state.plan[day][index]};
    }
    return null;
  }
  // Position is the insertion index in the target list AFTER removing the source.
  function moveEntry(id,day,position){
    const source=findEntry(id);if(!source||!state.plan[day])return;
    state.plan[source.day].splice(source.index,1);
    state.plan[day].splice(Math.max(0,Math.min(position,state.plan[day].length)),0,source.item);
    save();renderPlan();
    $('days').querySelector(`[data-entry="${id}"]`)?.focus({preventScroll:true});
    toast(`Verplaatst naar dag ${day+1}`);
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
  const checkedDate = () => new Date((park.checked||window.TRIP_DATA.checked)+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'});
  function renderPark(){
    $('park-buttons').innerHTML=parks.map(p=>`<button class="park-button" data-park="${escape(p.id)}" aria-pressed="${p.id===park.id}"><img src="${escape(p.thumbnail)}" alt="" width="54" height="54"><span class="park-button-copy"><small>${escape(p.brand)}</small><strong>${escape(p.name.replace(p.brand+' ',''))}</strong><span>${escape(p.location)}</span></span><span class="park-tick" aria-hidden="true">${p.id===park.id?'✓':''}</span></button>`).join('');
    $('hero-image').src=park.thumbnail;$('hero-image').alt=park.name;$('hero-park').textContent=park.name;$('photo-credit').textContent='Foto: '+park.brand;$('reserve').textContent=park.bookingLabel||'Verblijf boeken bij '+park.brand+' ↗';$('checked-date').textContent=checkedDate();
    $('booking').href=park.website;$('reserve').href=park.bookingUrl;$('park-source').href=park.facilities;
    $('hero-region').textContent=park.region.toLocaleUpperCase('nl');$('hero-intro').textContent=park.intro;$('park-note').textContent=park.parkNote;
    document.title=`${park.name} · Even eropuit`;
    document.querySelector('meta[name="description"]').content=`Gezinsuitjes voor kinderen van 4–7 jaar op en rond ${park.name}, met een eigen vakantieplanning.`;
    $('planning').setAttribute('aria-label',`Jullie planning voor ${park.name}`);
  }
  function renderPlan(){
    $('days').innerHTML=state.plan.map((day,i)=>{
      const date=dateInfo(i);
      return `<article class="day" data-day="${i}" aria-label="${escape(date.full)}"><div class="day-header"><span class="day-number">${date.number}</span><div><h3>Dag ${i+1}</h3><small>${escape(state.startDate?date.label:'Alle ruimte om te genieten')}</small></div></div><ol class="plan-list" data-list="${i}" aria-label="Activiteiten op dag ${i+1}">${day.map(item=>{
        const a=park.activities.find(a=>a.id===item.activityId);
        return `<li class="plan-block${keyboardMove?.id===item.id?' keyboard-dragging':''}" data-entry="${item.id}" tabindex="0" aria-label="${escape(a.name)}, dag ${i+1}, sleepbaar" aria-describedby="drag-help keyboard-help"><div class="plan-block-top"><span class="drag-mark" aria-hidden="true">⠿</span><span class="plan-icon" aria-hidden="true">${a.icon}</span><h4><button class="plan-title" data-info="${a.id}" aria-haspopup="dialog">${escape(a.name)}</button></h4><button class="plan-remove" data-remove="${item.id}" aria-label="${escape(a.name)} verwijderen uit dag ${i+1}">×</button></div><p class="plan-meta">${escape(drive(a)+' · '+a.duration)}</p>${a.travel[1]>20?'<p class="plan-warning">Mogelijk boven 20 min</p>':''}<div class="plan-block-bottom"><small>Check opening op je bezoekdatum</small></div></li>`;

      }).join('')}</ol>${day.length?'':'<p class="day-empty">Nog alle ruimte.<br>Kies een uitje of sleep er eentje hierheen.</p>'}<button class="day-add" data-pick="${i}">+ Activiteit toevoegen</button></article>`;
    }).join('');
    $('plan-count').textContent=state.plan.reduce((n,day)=>n+day.length,0);
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
      return `<article class="card${state.rain&&a.setting==='outdoor'?' dimmed':''}" data-activity="${a.id}"><div class="card-visual" style="--card-bg:${a.color}"><span class="card-emoji" aria-hidden="true">${a.icon}</span>${a.older?'<span class="badge extra">Vanaf circa 10 jaar</span>':far?'<span class="badge extra">Iets verder weg</span>':a.top?'<span class="badge">♡ Familiefavoriet</span>':a.onPark?'<span class="badge">Op je vakantiepark</span>':a.rain?'<span class="badge">☁ Fijne regenoptie</span>':''}<button class="favorite" data-favorite="${a.id}" aria-pressed="${fav}" aria-label="${escape(a.name)} ${fav?'uit favorieten verwijderen':'als favoriet bewaren'}">${fav?'♥':'♡'}</button></div><div class="card-body"><p class="card-location">${escape(a.location)}</p><h3><button class="activity-title" data-info="${a.id}" aria-haspopup="dialog">${escape(a.name)}</button></h3><div class="chips"><span class="chip">${escape(drive(a))}</span><span class="chip">${a.setting==='indoor'?'Binnen':a.setting==='outdoor'?'Buiten':'Wisselend'}</span><span class="chip">${cost(a)}</span><span class="chip">${escape(a.duration)}</span></div><p class="card-description">${escape(a.description)}</p><p class="family-tip">${escape(a.family)}</p>${a.warning?`<p class="warning">${escape(a.warning)}</p>`:''}<details><summary>Leeftijd & bezoekinformatie</summary><p><strong>${escape(a.ages)}</strong> · Onze inschatting</p><p>${escape(a.opening)}</p>${a.rulesUrl?external(a.rulesUrl,'Regels & voorwaarden ↗'):''}<p class="small">Bron gecontroleerd: ${escape(checkedDate())}. Openingstijden kunnen veranderen.</p></details><div class="card-links">${external(a.url,'Officiële website ↗')}${external(route,'Route ↗')}</div><div class="card-bottom"><button class="button primary" data-add="${a.id}">+ In mijn planning</button><button class="text-button hide" data-hide="${a.id}" aria-label="${escape(a.name)} verbergen">Verbergen</button></div></div></article>`;
    }).join('');
    $('results').textContent=`${visible.length} ${visible.length===1?'uitje':'uitjes'} om te ontdekken`;
    $('empty').hidden=visible.length>0;$('hidden-count').textContent=state.hidden.length;
    $('rain').setAttribute('aria-pressed',String(state.rain));$('rain-note').hidden=!state.rain;
  }
  function renderHidden(){const hidden=park.activities.filter(a=>state.hidden.includes(a.id));$('hidden-list').innerHTML=hidden.length?hidden.map(a=>`<div class="hidden-row"><span>${a.icon} ${escape(a.name)}</span><button class="button light" data-restore="${a.id}">Terugzetten</button></div>`).join(''):'<p>Je hebt nog geen activiteiten verborgen.</p>';}
  function render(){renderPlan();renderCards();renderHidden();}
  function updateAddSelection(){
    const count=$('add-days').querySelectorAll('input:checked').length;
    $('add-form').querySelector('[type="submit"]').disabled=count===0;
    $('add-form').querySelector('[type="submit"]').textContent=count>1?`Toevoegen aan ${count} dagen`:'Toevoegen aan planning';
    $('add-selection').textContent=count===0?'Kies minimaal één dag.':`${count} ${count===1?'dag geselecteerd':'dagen geselecteerd'}`;
  }
  function openInfo(id){
    const a=park.activities.find(a=>a.id===id);if(!a)return;
    const route='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(park.address)+'&destination='+encodeURIComponent(a.onPark?park.address:a.location)+'&travelmode=driving';
    $('activity-info').innerHTML=`<span class="info-icon" aria-hidden="true">${a.icon}</span><p class="eyebrow">${escape(park.name)}</p><h2 id="info-title">${escape(a.name)}</h2><p class="small">${escape(a.location)}</p><div class="chips"><span class="chip">${escape(drive(a))}</span><span class="chip">${a.setting==='indoor'?'Binnen':a.setting==='outdoor'?'Buiten':'Wisselend'}</span><span class="chip">${cost(a)}</span><span class="chip">${escape(a.duration)}</span></div><p>${escape(a.description)}</p><p class="family-tip">${escape(a.family)}</p><h3>Leeftijd</h3><p>${escape(a.ages)} · Onze inschatting</p><h3>Opening & bezoek</h3><p>${escape(a.opening)}</p>${a.warning?`<p class="warning">${escape(a.warning)}</p>`:''}<div class="card-links">${external(a.url,'Officiële website ↗')}${external(route,'Route ↗')}</div>${a.rulesUrl?external(a.rulesUrl,'Regels & voorwaarden ↗'):''}<p class="small">Bron gecontroleerd: ${escape(checkedDate())}. Openingstijden kunnen veranderen.</p>`;
    $('info-dialog').showModal();
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.park){selectPark(b.dataset.park);$('park-buttons').querySelector(`[data-park="${park.id}"]`).focus();return;}
    if(b.dataset.info){openInfo(b.dataset.info);return;}
    if(b.hasAttribute('data-close')){b.closest('dialog').close();return;}
    if(b.dataset.filter){filter=b.dataset.filter;renderCards();$('filters').querySelector(`[data-filter="${filter}"]`).focus();}
    if(b.dataset.favorite){const id=b.dataset.favorite;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();renderCards();$('cards').querySelector(`[data-favorite="${id}"]`)?.focus();toast(state.favorites.includes(id)?'Bewaard als favoriet':'Uit favorieten verwijderd');}
    if(b.dataset.hide){const id=b.dataset.hide;state.hidden.push(id);save();renderCards();renderHidden();toast('Uitje verborgen. Terugzetten kan via Verborgen activiteiten.');$('hidden-button').focus();}
    if(b.dataset.restore){state.hidden=state.hidden.filter(id=>id!==b.dataset.restore);save();renderCards();renderHidden();toast('Uitje teruggezet');}
    if(b.dataset.remove){const source=findEntry(b.dataset.remove);if(!source)return;state.plan[source.day].splice(source.index,1);save();renderPlan();$('days').querySelector(`[data-pick="${source.day}"]`).focus();toast('Uit planning verwijderd');}
    if(b.hasAttribute('data-pick')){preferredDay=Number(b.dataset.pick);filter='all';query='';$('search').value='';renderCards();$('activiteiten').scrollIntoView({behavior:'smooth'});toast(`Kies een uitje voor ${dateInfo(preferredDay).full}`);$('search').focus({preventScroll:true});}
    if(b.dataset.add){
      adding=b.dataset.add;$('add-title').textContent=park.activities.find(a=>a.id===adding).name;
      $('add-days').innerHTML=state.plan.map((_,i)=>{const date=dateInfo(i);return `<label class="day-choice"><input type="checkbox" name="add-day" value="${i}" ${i===preferredDay?'checked':''}><span class="day-choice-face"><span class="day-choice-icon" aria-hidden="true">☀</span><strong>Dag ${i+1}</strong><span>${escape(date.full.split(' — ')[1])}</span><span class="day-choice-check" aria-hidden="true">✓</span></span></label>`;}).join('');
      updateAddSelection();$('add-dialog').showModal();
    }
  });
  $('add-days').addEventListener('change',updateAddSelection);
  $('add-form').addEventListener('submit',event=>{
    event.preventDefault();const days=[...$('add-days').querySelectorAll('input:checked')].map(input=>Number(input.value));if(!days.length)return;
    days.forEach(day=>state.plan[day].push({id:entryId(),activityId:adding}));preferredDay=days[0];save();renderPlan();$('add-dialog').close();toast(`Toegevoegd aan ${days.map(day=>`dag ${day+1}`).join(' en ')}`);
  });
  $('search').addEventListener('input',()=>{query=$('search').value.trim().toLocaleLowerCase('nl');renderCards();});
  $('rain').addEventListener('click',()=>{state.rain=!state.rain;save();renderCards();});
  $('hidden-button').addEventListener('click',()=>{renderHidden();$('hidden-dialog').showModal();});
  $('clear-filters').addEventListener('click',()=>{filter='all';query='';$('search').value='';renderCards();});
  $('print').addEventListener('click',()=>window.print());
  $('reset').addEventListener('click',()=>$('reset-dialog').showModal());
  $('reset-form').addEventListener('submit',event=>{event.preventDefault();state.plan=Array.from({length:3},()=>[]);save();renderPlan();$('reset-dialog').close();toast('Planning is leeggemaakt');});
  $('dates-button').addEventListener('click',()=>{$('start-date').value=state.startDate;$('dates-dialog').showModal();});
  $('dates-form').addEventListener('submit',event=>{event.preventDefault();state.startDate=$('start-date').value;save();renderPlan();$('dates-dialog').close();toast('Vakantiedatums bewaard');});
  $('dates-clear').addEventListener('click',()=>{state.startDate='';save();renderPlan();$('dates-dialog').close();});
  function selectPark(id,updateUrl=true){
    const next=parks.find(p=>p.id===id);if(!next)return;
    finishDrag(false);finishKeyboard(false);document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
    park=next;filter='all';query='';preferredDay=0;adding=null;$('search').value='';clearTimeout(toastTimer);$('toast').hidden=true;
    initState();save();renderPark();render();
    if(updateUrl){const url=new URL(location.href);url.searchParams.set('park',park.id);history.pushState(null,'',url);}
  }
  window.addEventListener('popstate',()=>selectPark((parkFromUrl()||parks[0]).id,false));
  // Drag from the whole block except its title and remove button.
  let drag=null, scrollFrame=0, keyboardMove=null;
  function clearDrop(){document.querySelectorAll('.drag-over,.drop-before,.drop-end').forEach(el=>el.classList.remove('drag-over','drop-before','drop-end'));}
  function dragTarget(){
    clearDrop();if(!drag?.active)return;
    drag.ghost.style.left=`${drag.x-drag.offsetX}px`;drag.ghost.style.top=`${drag.y-drag.offsetY}px`;
    const day=document.elementFromPoint(drag.x,drag.y)?.closest('[data-day]');
    drag.target=null;if(!day)return;
    const list=day.querySelector('.plan-list'),blocks=[...list.querySelectorAll('.plan-block')].filter(el=>el.dataset.entry!==drag.id);
    const before=blocks.find(el=>drag.y<el.getBoundingClientRect().top+el.getBoundingClientRect().height/2);
    drag.target={day:Number(day.dataset.day),position:before?blocks.indexOf(before):blocks.length};
    day.classList.add('drag-over');if(before)before.classList.add('drop-before');else list.classList.add('drop-end');
  }
  function autoScroll(){
    if(!drag?.active)return;
    const edge=85,amount=drag.y<edge?-Math.ceil((edge-drag.y)/7):drag.y>innerHeight-edge?Math.ceil((drag.y-innerHeight+edge)/7):0;
    if(amount){window.scrollBy(0,amount);dragTarget();}
    scrollFrame=requestAnimationFrame(autoScroll);
  }
  function finishDrag(commit){
    if(!drag)return;
    const current=drag;drag=null;cancelAnimationFrame(scrollFrame);clearDrop();
    current.ghost?.remove();current.block.classList.remove('is-dragging');document.body.classList.remove('dragging-plan');
    if(current.handle.hasPointerCapture(current.pointerId))current.handle.releasePointerCapture(current.pointerId);
    if(commit&&current.active&&current.target)moveEntry(current.id,current.target.day,current.target.position);
    else if(current.active)toast('Verplaatsen geannuleerd');
  }
  $('days').addEventListener('pointerdown',event=>{
    const block=event.target.closest('.plan-block');if(!block||event.target.closest('button,a')||!event.isPrimary||event.button!==0)return;
    if(keyboardMove){finishKeyboard(true);return;}
    const handle=block,rect=block.getBoundingClientRect();
    drag={id:block.dataset.entry,handle,block,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top,active:false,target:null};
    handle.setPointerCapture(event.pointerId);
  });
  $('days').addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;
    drag.x=event.clientX;drag.y=event.clientY;
    if(!drag.active&&Math.hypot(drag.x-drag.startX,drag.y-drag.startY)>6){
      drag.active=true;drag.ghost=drag.block.cloneNode(true);drag.ghost.classList.add('drag-ghost');drag.ghost.setAttribute('aria-hidden','true');drag.ghost.style.width=`${drag.block.getBoundingClientRect().width}px`;document.body.append(drag.ghost);drag.block.classList.add('is-dragging');document.body.classList.add('dragging-plan');scrollFrame=requestAnimationFrame(autoScroll);
    }
    if(drag.active){event.preventDefault();dragTarget();}
  });
  $('days').addEventListener('pointerup',event=>{if(drag&&event.pointerId===drag.pointerId)finishDrag(true);});
  $('days').addEventListener('pointercancel',()=>finishDrag(false));
  $('days').addEventListener('lostpointercapture',()=>finishDrag(false));
  function finishKeyboard(commit){
    if(!keyboardMove)return;
    const current=keyboardMove;keyboardMove=null;
    if(!commit)moveEntry(current.id,current.day,current.index);else renderPlan();
    $('days').querySelector(`[data-entry="${current.id}"]`)?.focus({preventScroll:true});
    toast(commit?'Nieuwe plek bewaard':'Verplaatsen geannuleerd');
  }
  $('days').addEventListener('keydown',event=>{
    const block=event.target.closest('.plan-block');if(!block||event.target!==block)return;
    const id=block.dataset.entry,source=findEntry(id);if(!source)return;
    if(event.key===' '||event.key==='Enter'){
      event.preventDefault();if(keyboardMove)finishKeyboard(true);else{keyboardMove={id,day:source.day,index:source.index};renderPlan();$('days').querySelector(`[data-entry="${id}"]`).focus({preventScroll:true});toast('Gebruik de pijltjestoetsen om te verplaatsen. Enter bewaart, Escape annuleert.');}return;
    }
    if(!keyboardMove||keyboardMove.id!==id)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();
      const day=event.key==='ArrowLeft'?Math.max(0,source.day-1):event.key==='ArrowRight'?Math.min(2,source.day+1):source.day;
      const position=day!==source.day?state.plan[day].length:event.key==='ArrowUp'?Math.max(0,source.index-1):event.key==='ArrowDown'?Math.min(state.plan[day].length-1,source.index+1):source.index;
      moveEntry(id,day,position);
    }
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(drag)finishDrag(false);if(keyboardMove)finishKeyboard(false);}});
  window.addEventListener('blur',()=>{finishDrag(false);finishKeyboard(false);});
  $('hero-image').addEventListener('error',()=>{$('hero-image').alt=park.name+' · parkfoto momenteel niet beschikbaar';});
  initState();renderPark();render();save();
  const initialUrl=new URL(location.href);initialUrl.searchParams.set('park',park.id);history.replaceState(null,'',initialUrl);
})();
