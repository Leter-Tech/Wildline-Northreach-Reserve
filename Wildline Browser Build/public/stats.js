import {INTRO,CONTRACTS,formatTime} from './core.js';
export function createStatsBoard({getSave,keys,open,close}){
 const button=document.createElement('button');button.id='statsBtn';button.textContent='My stats';button.hidden=false;document.getElementById('jobsBtn').after(button);
 const screen=document.createElement('section');screen.id='myStats';screen.className='overlay hidden';screen.innerHTML='<article class="wood-board stats-board"><header><div><p class="overline">NORTHREACH RESERVE · HUNTER’S LEDGER</p><h2>My stats</h2></div><span class="stats-seal"><img src="assets/favicon.png" alt="Wildline reserve emblem"></span></header><div class="stats-summary"></div><div class="stats-layout"><nav aria-label="Job records"></nav><section class="stats-detail" aria-live="polite"></section></div><footer><button class="stats-back">Main menu</button><span>YOUR EXPEDITIONS, RECORDED.</span></footer></article>';document.body.appendChild(screen);
 let selected=0;
 const value=n=>Number.isFinite(n)?n.toLocaleString():'—',money=n=>Number.isFinite(n)?'$'+n.toLocaleString():'—',time=n=>Number.isFinite(n)?formatTime(n):'—';
 function render(){
  const save=getSave(),jobs=[INTRO,...CONTRACTS],done=i=>i===0?!!save.trained:!!save.stats?.[keys[i]]?.clears;
  screen.querySelector('.stats-summary').innerHTML='<div><b>'+jobs.filter((_,i)=>done(i)).length+' / 10</b><span>Jobs completed</span></div><div><b>'+money(save.money)+'</b><span>Current balance</span></div><div><b>'+value(keys.reduce((n,k)=>n+(save.stats?.[k]?.clears||0),0))+'</b><span>Successful expeditions</span></div>';
  const nav=screen.querySelector('nav');nav.replaceChildren();
  for(let i=0;i<10;i++){const b=document.createElement('button');b.className='stats-job'+(i===selected?' selected':'')+(!done(i)?' pending':'');b.setAttribute('aria-pressed',String(i===selected));b.innerHTML='<small>'+String(i+1).padStart(2,'0')+'</small><span>'+(jobs[i]?.name||'Coming soon')+'</span>'+(done(i)?'':'<em>'+(jobs[i]?'NOT COMPLETED':'COMING SOON')+'</em>');b.onclick=()=>{selected=i;render();};nav.appendChild(b);}
  const detail=screen.querySelector('.stats-detail'),job=jobs[selected],stat=save.stats?.[keys[selected]];
  detail.innerHTML='<p class="overline">JOB '+String(selected+1).padStart(2,'0')+'</p><h3>'+(job?.name||'Coming soon')+'</h3>'+(job?'<p class="stats-region">'+job.region+'</p>':'');
  if(!done(selected)){detail.innerHTML+='<div class="stats-empty"><span>◇</span><h4>'+(job?'No record yet':'The next expedition awaits')+'</h4><p>'+(job?'Complete this job to reveal your stats.':'This job has not been added yet.')+'</p></div>';return;}
  if(!stat){detail.innerHTML+='<p class="stats-empty">Job completed. Detailed results were not recorded in this save.</p>';return;}
  const metric=(label,v)=>'<div><dt>'+label+'</dt><dd>'+v+'</dd></div>';
  detail.innerHTML+='<dl class="stats-metrics">'+metric('Completed runs',value(stat.clears))+metric('Attempts',value(stat.attempts))+metric('Best completion time',time(stat.bestTime))+'</dl>';
  function run(title,r){if(!r)return '';let rows=[['Outcome',r.won===true?'Completed':r.won===false?'Failed':'—'],['Animals hunted',value(r.hunts)],['Time taken',time(r.time)],['Bullets fired',value(r.shots)],['Payment earned',money(r.payment)]];
   for(const [key,label,format] of [['clean','Clean first-shot kills',value],['collected','Animals recovered',value],['sold','Animals sold',value],['wolfKills','Wolves defeated',value],['health','Health remaining',n=>value(Math.round(n))+'%'],['ammoLeft','Rounds remaining',value],['vehicleHealth','Vehicle condition',n=>value(Math.round(n))+'%'],['traps','Traps placed',value],['baitPlaced','Bait placed',value],['fishStock','Pond fish remaining',n=>value(Math.round(n))+'%'],['waves','Wolf packs cleared',value]])if(Number.isFinite(r[key]))rows.push([label,format(r[key])]);
   if(r.grandCounts){const names={goose:'Geese',boar:'Boars',rabbit:'Rabbits',wolf:'Wolves',deer:'Deer',alligator:'Alligators',rhino:'Rhinos',lion:'Lionesses',bear:'Bears'};for(const [k,v] of Object.entries(r.grandCounts))rows.push([names[k]+' hunted',value(v)]);}
   return '<h4>'+title+'</h4><dl class="stats-metrics">'+rows.map(([l,v])=>metric(l,v)).join('')+'</dl>';
  }
  detail.innerHTML+=run('Latest expedition',stat);
  if(stat.won===false&&stat.lastCompleted)detail.innerHTML+=run('Last successful expedition',stat.lastCompleted);
  if(stat.clean===undefined)detail.innerHTML+='<p class="stats-note">Only results retained in this save are shown.</p>';
 }
 button.onclick=()=>{render();open();};screen.querySelector('.stats-back').onclick=close;
 return{render};
}
