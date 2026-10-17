const navbar=document.querySelector('.header');
const updateNavbar=()=>navbar?.classList.toggle('is-scrolled',window.scrollY>20);
window.addEventListener('scroll',updateNavbar,{passive:true});
window.addEventListener('pageshow',updateNavbar);
updateNavbar();
const jobs=[
['First Hunt','Learn the reserve one step at a time: drive out, steady your rifle, recover your first animal and return to the station.','Guided expedition · Northreach Station'],
['Hunt 4 rabbits','Four quick targets in Foxglove Meadow. Keep your eye on the clock, recover your harvest and bring it home.','Day hunt · Foxglove Meadow'],
['Hunt 3 wild boars','Follow the trail into Alder Hollow. Tough, weaving boars turn a quiet hunt into a close-range confrontation.','Day hunt · Alder Hollow'],
['Hunt 2 deer at night','Equip the Trailmaster and enter Stag Ridge after dark. The first deer falls—and five wolves emerge from the shadows.','Night hunt · Stag Ridge'],
['Hunt 8 geese','One startled bird sends the whole flock airborne. Track their flight over the pond and pick your shots.','Flying targets · Willow Pond'],
['Hunt 6 alligators','The pond is not as still as it looks. Three alligators charge together; get within 60 metres to land your shots.','Close-range hunt · Cypress Pond'],
['Hunt 2 rhinos','Purchase a med kit before entering the clearing. Two rhinos charge together, testing your timing and nerve.','Heavy wildlife · Ironwood Clearing'],
['Bait and hunt the lioness','Set five traps by night, recover rabbits at dawn and lay your bait. Return to meet the reserve’s fastest predator.','Night to dawn · Redfern Clearing'],
['Wolf tower watch and bear hunt','Defend the pond from five wolf packs. At dawn, catch fish for bait and prepare for a charging bear.','Tower watch & bait · Briarwood Basin'],
['The Grand Hunt','Floods beyond Northreach send wildlife past your tower. Fulfil all 140 targets across nine species, with no time limit and no recovery run.','Final expedition · The watchtower']
];
const list=document.querySelector('#job-list'),panel=document.querySelector('#job-detail');
jobs.forEach((job,i)=>{const b=document.createElement('button');b.className='job-tab';b.id=`job-${i}`;b.setAttribute('role','tab');b.setAttribute('aria-controls','job-detail');b.innerHTML=`<span class="number">${String(i+1).padStart(2,'0')}</span><span>${job[0]}</span>`;b.addEventListener('click',()=>selectJob(i));list.append(b)});
function selectJob(i){[...list.children].forEach((b,n)=>{b.setAttribute('aria-selected',String(n===i));b.tabIndex=n===i?0:-1});panel.setAttribute('aria-labelledby',`job-${i}`);panel.innerHTML=`<span class="job-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><p class="eyebrow">Job ${String(i+1).padStart(2,'0')}</p><h3>${jobs[i][0]}</h3><p>${jobs[i][1]}</p><div class="job-location">${jobs[i][2]}</div>`}
list.addEventListener('keydown',e=>{let i=[...list.children].indexOf(document.activeElement);if(i<0)return;if(e.key==='ArrowDown')i=(i+1)%10;else if(e.key==='ArrowUp')i=(i+9)%10;else if(e.key==='Home')i=0;else if(e.key==='End')i=9;else return;e.preventDefault();selectJob(i);list.children[i].focus()});selectJob(0);
const links=window.WILDLINE_LINKS||{};
document.querySelectorAll('[data-play],[data-download],[data-itch]').forEach(a=>{const key=a.hasAttribute('data-play')?'play':a.hasAttribute('data-itch')?'itch':a.dataset.download;a.href=links[key];a.rel='noopener';a.target='_blank'});
function youtubeId(url){try{const u=new URL(url);if(u.hostname==='youtu.be')return u.pathname.replace(/^\//,'').split('/')[0];if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))return u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1]}catch{}}
const modal=document.querySelector('#video-modal');
const stage=document.querySelector('#video-modal-stage');
function closeVideoModal(){modal.close()}
function openVideoModal(kind,url){
  const id=youtubeId(url),label=kind==='trailer'?'Official trailer':'Gameplay';
  stage.replaceChildren();
  if(id&&/^[\w-]{11}$/.test(id)){
    const frame=document.createElement('iframe');frame.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;frame.title=`Wildline: Northreach Reserve — ${label}`;frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';stage.append(frame);
  }else{
    const video=document.createElement('video');video.src=url;video.controls=true;video.autoplay=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label',`Wildline ${label}`);stage.append(video);
  }
  modal.querySelector('.eyebrow').textContent=`Wildline · ${label}`;
  document.querySelector('#video-modal-title').textContent=kind==='trailer'?'The wilderness is waiting.':'See the hunt unfold.';
  modal.showModal();document.body.classList.add('film-open');
}
document.querySelectorAll('[data-film]').forEach(poster=>{
  const kind=poster.dataset.film,url=(kind==='trailer'?links.trailer:links.youtube)?.trim(),button=poster.querySelector('button');
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','video-modal');
  if(!url){button.disabled=true;poster.classList.add('film-pending');poster.querySelector('.film-watch').textContent='Official trailer';poster.querySelector('.video-play').textContent='—';poster.querySelector('.film-format').textContent='Video not yet available';return;}
  button.addEventListener('click',()=>openVideoModal(kind,url));
});
modal.querySelector('.video-modal-close').addEventListener('click',closeVideoModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeVideoModal()});
modal.addEventListener('close',()=>{stage.querySelector('video')?.pause();stage.replaceChildren();document.body.classList.remove('film-open')});
const shots=window.WILDLINE_SCREENSHOTS||[],track=document.querySelector('#screenshot-track'),dots=document.querySelector('#screenshot-dots');let current=0,touchStart=null;
shots.forEach((shot,i)=>{const slide=document.createElement('figure');slide.className='screenshot-slide';slide.setAttribute('role','group');slide.setAttribute('aria-label',`${i+1} of ${shots.length}`);const img=document.createElement('img');img.src=shot.src;img.alt=shot.alt;img.loading='lazy';slide.append(img);track.append(slide);const b=document.createElement('button');b.className='slide-dot';b.setAttribute('aria-label',`Show screenshot ${i+1}`);b.addEventListener('click',()=>showShot(i));dots.append(b)});
function showShot(i){if(!shots.length)return;current=(i+shots.length)%shots.length;[...track.children].forEach((slide,n)=>slide.hidden=n!==current);[...dots.children].forEach((b,n)=>b.setAttribute('aria-pressed',String(n===current)));document.querySelector('#screenshot-caption').textContent=shots[current].caption;document.querySelector('#screenshot-count').textContent=`${String(current+1).padStart(2,'0')} / ${String(shots.length).padStart(2,'0')}`}
document.querySelector('#screenshot-prev').addEventListener('click',()=>showShot(current-1));document.querySelector('#screenshot-next').addEventListener('click',()=>showShot(current+1));track.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();showShot(current+(e.key==='ArrowRight'?1:-1))}});track.addEventListener('touchstart',e=>touchStart=e.changedTouches[0].clientX,{passive:true});track.addEventListener('touchend',e=>{if(touchStart!==null){const delta=e.changedTouches[0].clientX-touchStart;if(Math.abs(delta)>45)showShot(current+(delta<0?1:-1));touchStart=null}},{passive:true});showShot(0);
