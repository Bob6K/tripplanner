(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const park=window.TRIP_DATA.parks.find(p=>p.id==='volendam'&&!p.hidden);
  if(!park)return;
  const key='even-eropuit:v1';
  const types={spelen:{label:'Spelen',color:'#f4d9c4',ink:'#78431d'},boerderij:{label:'Boerderij',color:'#e2edca',ink:'#466024'},museum:{label:'Museum',color:'#e8ddf1',ink:'#63437d'},zwemmen:{label:'Zwemmen',color:'#cdeaf2',ink:'#235c70'},water:{label:'Varen',color:'#d7e3f4',ink:'#365b88'},natuur:{label:'Natuur & wandelen',color:'#dce9de',ink:'#3b6245'},ambacht:{label:'Ambachten & proeven',color:'#f3e7b9',ink:'#75601e'}};
  const zones=[['park','1. Op het park','Rustige ideeën dicht bij jullie huisje.'],['volendam','2. In Volendam','De haven, het dorp en uitjes om de hoek.'],['omgeving','3. Omgeving','Circa maximaal 30 minuten rijden, ten noorden van Amsterdam.']];
  const filters=[['all','Alles'],['indoor','Binnen'],['outdoor','Buiten'],['free','Gratis / inbegrepen'],['rain','Regenopties'],['favorites','♡ Favorieten']];
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;
  let saved={},filter='all',query='';
  try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};if(typeof saved!=='object'||Array.isArray(saved))saved={};}catch{$('storage-warning').hidden=false;}
  const raw=saved[park.id]||{};
  const valid=ids=>Array.isArray(ids)?ids.filter(id=>park.activities.some(a=>a.id===id)):[];
  const state={...raw,favorites:valid(raw.favorites),hidden:valid(raw.hidden),rain:raw.rain===true};
  const save=()=>{saved[park.id]=state;saved.selectedPark=park.id;try{localStorage.setItem(key,JSON.stringify(saved));}catch{$('storage-warning').hidden=false;}};
  let toastTimer;
  function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3500);}
  const cost=a=>({free:'Gratis',paid:'Betaald',included:'Inbegrepen voor parkgasten',unknown:'Kosten navragen'}[a.cost]);
  const drive=a=>a.zone==='park'?'Op het park':`ca. ${a.travel[0]}–${a.travel[1]} min rijden`;
  const route=a=>'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(park.address)+'&destination='+encodeURIComponent(a.zone==='park'?park.address:a.location)+'&travelmode=driving'+(a.id==='zaanse-schans'?'&waypoints='+encodeURIComponent('Purmerend, Nederland'):'');
  const details=a=>`<p><strong>${esc(a.ages)}</strong> · Onze inschatting</p><p>${esc(a.opening)}</p>${a.rulesUrl?link(a.rulesUrl,'Meer bezoekinformatie ↗'):''}`;
  function matches(a){
    if(state.hidden.includes(a.id))return false;
    if(query&&!`${a.name} ${a.location} ${a.description} ${types[a.category].label}`.toLocaleLowerCase('nl').includes(query))return false;
    if(types[filter])return a.category===filter;
    return {all:()=>true,indoor:()=>a.setting==='indoor',outdoor:()=>a.setting==='outdoor',free:()=>['free','included'].includes(a.cost),rain:()=>a.rain,favorites:()=>state.favorites.includes(a.id)}[filter]();
  }
  function card(a){
    const t=types[a.category],fav=state.favorites.includes(a.id);
    return `<article class="card${state.rain&&a.setting==='outdoor'?' dimmed':''}" data-activity="${a.id}" style="--activity-color:${t.color};--activity-ink:${t.ink}"><div class="card-visual" style="--card-bg:${t.color}"><span class="card-emoji" aria-hidden="true">${a.icon}</span><span class="badge activity-kind">${t.label}</span><button class="favorite" data-favorite="${a.id}" aria-pressed="${fav}" aria-label="${esc(a.name)} ${fav?'uit favorieten verwijderen':'als favoriet bewaren'}">${fav?'♥':'♡'}</button></div><div class="card-body"><p class="card-location">${esc(a.location)}</p><h3><button class="activity-title" data-info="${a.id}" aria-haspopup="dialog">${esc(a.name)}</button></h3><div class="chips"><span class="chip">${esc(drive(a))}</span><span class="chip">${a.setting==='indoor'?'Binnen':a.setting==='outdoor'?'Buiten':'Binnen & buiten'}</span><span class="chip">${cost(a)}</span><span class="chip">${esc(a.duration)}</span></div><p class="card-description">${esc(a.description)}</p><p class="family-tip">${esc(a.family)}</p>${a.warning?`<p class="warning">${esc(a.warning)}</p>`:''}<details><summary>Leeftijd & bezoekinformatie</summary>${details(a)}</details><div class="card-links">${link(a.url,'Officiële website ↗')}${link(route(a),'Route ↗')}</div><div class="card-bottom"><button class="button light" data-info="${a.id}" aria-haspopup="dialog">Meer informatie</button><button class="text-button hide" data-hide="${a.id}" aria-label="${esc(a.name)} verbergen">Verbergen</button></div></div></article>`;
  }
  function render(){
    const visible=park.activities.filter(matches).sort((a,b)=>state.rain?Number(!!b.rain)-Number(!!a.rain):0);
    $('filters').innerHTML=filters.map(([id,label])=>`<button class="filter" data-filter="${id}" aria-pressed="${filter===id}">${label}</button>`).join('');
    $('type-legend').innerHTML=Object.entries(types).map(([id,t])=>`<button class="type-filter" data-filter="${id}" aria-pressed="${filter===id}" style="--activity-color:${t.color};--activity-ink:${t.ink}"><span aria-hidden="true"></span>${t.label}</button>`).join('');
    $('cards').innerHTML=zones.map(([id,title,intro])=>{const items=visible.filter(a=>a.zone===id);return `<section class="activity-zone" id="zone-${id}" aria-labelledby="title-${id}"><div class="zone-heading"><h2 id="title-${id}">${title} <span>${items.length}</span></h2><p>${intro}</p></div><div class="cards">${items.map(card).join('')}</div>${items.length?'':'<p class="zone-empty">Geen uitjes in dit onderdeel bij je huidige filters.</p>'}</section>`;}).join('');
    $('results').textContent=`${visible.length} ${visible.length===1?'idee':'ideeën'} om te ontdekken`;
    $('empty').hidden=visible.length>0;$('hidden-count').textContent=state.hidden.length;
    $('favorite-count').textContent=state.favorites.length;
    $('rain').setAttribute('aria-pressed',String(state.rain));$('rain-note').hidden=!state.rain;
    renderHidden();
  }
  function renderHidden(){const hidden=park.activities.filter(a=>state.hidden.includes(a.id));$('hidden-list').innerHTML=hidden.length?hidden.map(a=>`<div class="hidden-row"><span>${a.icon} ${esc(a.name)}</span><button class="button light" data-restore="${a.id}">Terugzetten</button></div>`).join(''):'<p>Je hebt nog geen activiteiten verborgen.</p>';}
  function info(id){const a=park.activities.find(a=>a.id===id);if(!a)return;const t=types[a.category];$('activity-info').innerHTML=`<span class="info-icon" aria-hidden="true">${a.icon}</span><p class="eyebrow">${esc(t.label)} · ${esc(zones.find(z=>z[0]===a.zone)[1].slice(3))}</p><h2 id="info-title">${esc(a.name)}</h2><p class="small">${esc(a.location)}</p><p>${esc(drive(a))} · ${cost(a)} · ${esc(a.duration)}</p><p>${esc(a.description)}</p><p class="family-tip">${esc(a.family)}</p><h3>Leeftijd & bezoek</h3>${details(a)}${a.warning?`<p class="warning">${esc(a.warning)}</p>`:''}<div class="card-links">${link(a.url,'Officiële website ↗')}${link(route(a),'Route ↗')}</div>`;$('info-dialog').showModal();}
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-close')){b.closest('dialog').close();return;}
    if(b.dataset.info){info(b.dataset.info);return;}
    if(b.dataset.filter){filter=b.dataset.filter;render();document.querySelector(`[data-filter="${filter}"]`)?.focus();return;}
    if(b.dataset.favorite){const id=b.dataset.favorite;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();render();document.querySelector(`[data-favorite="${id}"]`)?.focus();toast(state.favorites.includes(id)?'Bewaard als favoriet':'Uit favorieten verwijderd');return;}
    if(b.dataset.hide){state.hidden.push(b.dataset.hide);save();render();$('hidden-button').focus();toast('Uitje verborgen. Je kunt het altijd terugzetten.');return;}
    if(b.dataset.restore){state.hidden=state.hidden.filter(id=>id!==b.dataset.restore);save();render();toast('Uitje teruggezet');}
  });
  $('search').addEventListener('input',()=>{query=$('search').value.trim().toLocaleLowerCase('nl');render();});
  $('rain').addEventListener('click',()=>{state.rain=!state.rain;save();render();});
  $('hidden-button').addEventListener('click',()=>$('hidden-dialog').showModal());
  $('clear-filters').addEventListener('click',()=>{filter='all';query='';$('search').value='';render();});
  $('favorite-shortcut').addEventListener('click',()=>{filter='favorites';render();$('activiteiten').scrollIntoView();});
  $('print').addEventListener('click',()=>window.print());
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',event=>{if(event.target!==d)return;const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}));
  $('hero-image').src=park.thumbnail;$('hero-image').alt='Landal Volendam aan het Markermeer';$('hero-park').textContent=park.name;
  $('hero-region').textContent=park.region.toLocaleUpperCase('nl');$('hero-intro').textContent=park.intro;
  $('booking').href=park.website;$('reserve').href=park.bookingUrl;$('park-source').href=park.facilities;$('park-note').textContent=park.parkNote;
  const url=new URL(location.href);url.searchParams.set('park','volendam');history.replaceState(null,'',url);
  render();
})();
