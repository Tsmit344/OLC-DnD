/* Cursed University — static GitHub Pages edition. No API calls, no external scoring. */
'use strict';
(() => {
const DATA = window.CURSED_DATA;
if (!DATA) { document.body.textContent = 'Game data failed to load. Keep assets/data.js beside the game.'; return; }
const KEY = 'cursed-university-v1';
const $ = id => document.getElementById(id);
const escapeHTML = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh = () => ({table:'',character:'',answers:{},yearComplete:{},bossScores:{},bossResponses:{},bossRolls:{},graduationScore:0,graduationResponse:'',graduationComplete:false});
let state = fresh();
try {const x=JSON.parse(localStorage.getItem(KEY)||'null'); if(x&&typeof x==='object'&&DATA.characters.some(c=>c.id===x.character)) state={...fresh(),...x};}catch{}
let currentYear=1, currentTab=1, currentScreen='welcomeScreen', doorBusy=false;
let currentMessage='';
let scenarioAttempted=false;
let toastTimer=null;
function flashNotice(message,type='info'){
 const toast=$('saveToast');clearTimeout(toastTimer);
 toast.textContent=message;toast.className='save-toast '+type;
 toastTimer=setTimeout(()=>toast.classList.add('hidden'),6500);
}
function updateScenarioRequirements(){
 const friction=$('frictionText').value.trim().length;
 const redesign=$('redesignText').value.trim().length;
 const checks=Array.from(document.querySelectorAll('[name="framework"]:checked')).length;
 const valid=[friction>=15,redesign>=15,checks>0];
 const labels=[
  `AI friction response (${friction}/15 minimum characters)`,
  `Assessment redesign response (${redesign}/15 minimum characters)`,
  'Choose at least one redesign element'
 ];
 ['checkFriction','checkRedesign','checkFramework'].forEach((id,i)=>{
  $(id).className='requirement'+(valid[i]?' met':'');
  $(id).textContent=(valid[i]?'✓ ':'○ ')+labels[i];
 });
 $('completionCount').textContent=valid.filter(Boolean).length+' of 3 ready';
 $('frictionCount').textContent=friction+' / 15 minimum characters';
 $('redesignCount').textContent=redesign+' / 15 minimum characters';
 $('frictionCount').classList.toggle('complete',valid[0]);
 $('redesignCount').classList.toggle('complete',valid[1]);
 $('submissionGuide').classList.toggle('attention',scenarioAttempted&&!valid.every(Boolean));
 $('frictionText').setAttribute('aria-invalid',String(scenarioAttempted&&!valid[0]));
 $('redesignText').setAttribute('aria-invalid',String(scenarioAttempted&&!valid[1]));
 $('frameworkField').classList.toggle('field-error',scenarioAttempted&&!valid[2]);
 if(scenarioAttempted&&valid.every(Boolean)){$('scenarioNotice').textContent='All three requirements are met. Select Save Design & Continue to advance.';$('scenarioNotice').className='notice success'}
 return valid;
}

function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(err){return false}}
function char(){return DATA.characters.find(c=>c.id===state.character)||DATA.characters[0]}
function pointTotal(){return Math.min(100,Object.values(state.bossScores).reduce((n,v)=>n+(Number(v)||0),0)+(Number(state.graduationScore)||0))}
function stageIndex(){let k=pointTotal();return k<=20?0:k<=40?1:k<=60?2:k<=80?3:4}
const stageNames=['Stage I · First Spark','Stage II · Curiosity Stirs','Stage III · Reasoning Awakens','Stage IV · Deep Understanding','Stage V · Fully Awakened'];
function complete(y){return !!state.yearComplete[y]}
function allYearsComplete(){return [1,2,3,4].every(complete)}
function isUnlocked(y){return y===1||complete(y-1)}
function currentScenarios(y){return char().scenarios.filter(s=>s.year===y)}
function answer(s){return state.answers[s.id]||{friction:'',redesign:'',frameworks:[],submitted:false}}
function showScreen(id){document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id===id));currentScreen=id;$('globalBar').classList.toggle('hidden',['welcomeScreen','rollScreen','revealScreen','doorScreen'].includes(id));updateGlobal();window.scrollTo({top:0,behavior:'instant'});}
function announce(msg){$('screen-reader-status').textContent=msg}
function updateGlobal(){if(!state.character)return;$('partyStatus').textContent=(state.table||'Your Party')+' · '+char().name;$('yearStatus').textContent=allYearsComplete()?'Four Years Complete':'Year '+([1,2,3,4].find(y=>!complete(y))||4)+' / 4';$('globalPoints').textContent=pointTotal()+' / 100 KP'}
function charMini(){const c=char();return `<div class="char-mini-icon" style="border-color:${c.color}">${c.icon}</div><div><h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.major)} · ${escapeHTML(c.tag)}</p></div>`}
function brainMarkup(){const p=pointTotal(), idx=stageIndex(), s=.44 + .56*(p/100), color=['#ad9aa0','#d7b38f','#e5be91','#9ddbc0','#d4ffda'][idx],glow=idx>=3?'#63ffd5':'#dcb583';return `<svg viewBox="0 0 200 190" role="img" aria-label="Glass dome containing a brain at ${p} of 100 Knowledge Points, ${stageNames[idx]}"><defs><radialGradient id="brainGrad"><stop stop-color="#ffe6c2"/><stop offset=".7" stop-color="${color}"/><stop offset="1" stop-color="#ae7280"/></radialGradient><linearGradient id="glass" x1="0" y1="0" x2="1" y2=".5"><stop stop-color="#edffff" stop-opacity=".26"/><stop offset=".3" stop-color="#b9f2f3" stop-opacity=".04"/><stop offset=".78" stop-color="#eaffff" stop-opacity=".03"/><stop offset="1" stop-color="#ffffff" stop-opacity=".3"/></linearGradient><radialGradient id="glow"><stop stop-color="${glow}" stop-opacity="${idx===4?.44:.17}"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs><ellipse cx="100" cy="145" rx="79" ry="22" fill="url(#glow)"/><g transform="translate(100 105) scale(${s}) translate(-100 -105)"><g class="brain-pulse"><path d="M97 62C89 40 55 46 50 65C27 65 27 90 41 99C29 119 44 138 64 134C74 150 90 146 100 137C110 148 129 147 138 132C163 135 175 111 160 97C173 80 160 62 143 63C137 43 113 43 103 60Z" fill="url(#brainGrad)" stroke="#c08c94" stroke-width="3"/><g stroke="#9c647a" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".86"><path d="M97 62Q85 77 96 91Q106 106 100 137M75 54Q63 70 72 87Q56 99 62 117M121 53Q137 68 122 84Q144 94 135 113M49 76Q67 72 75 91M44 109Q61 100 79 119M151 74Q139 75 132 94M161 105Q144 106 130 127M83 73Q100 71 108 88M91 118Q114 118 120 135"/></g></g></g><path d="M32 142V91Q32 28 100 26Q168 28 168 91V142" fill="url(#glass)" stroke="#d5eff1" stroke-opacity=".78" stroke-width="3"/><path d="M47 135V91Q47 53 72 42" fill="none" stroke="#f2ffff" stroke-opacity=".55" stroke-linecap="round" stroke-width="5"/><path d="M147 54Q155 76 154 110" fill="none" stroke="#eaffff" stroke-opacity=".32" stroke-linecap="round" stroke-width="3"/><rect x="26" y="139" width="148" height="17" rx="4" fill="#a6875b" stroke="#ddc28d" stroke-width="2"/><rect x="33" y="156" width="134" height="12" rx="3" fill="#55432d"/><rect x="43" y="169" width="114" height="7" rx="3" fill="#927049"/><text x="100" y="151" fill="#281c15" font-size="9" text-anchor="middle" font-family="Georgia" font-weight="bold">BRAIN OF UNDERSTANDING</text></svg>`}
function updateBrains(){document.querySelectorAll('#mapBrain,#roomBrain,#gradBrain').forEach(el=>{el.innerHTML=brainMarkup();el.classList.toggle('complete',pointTotal()===100)});$('brainStageName').textContent=stageNames[stageIndex()];$('mapFill').style.width=pointTotal()+'%';$('mapKPLabel').textContent=pointTotal()+' / 100 KP';updateGlobal()}
function setupRoll(){showScreen('rollScreen');$('tableName').value=state.table||'';$('diceSelect').value='';$('revealBtn').disabled=true}
function reveal(){let dice=Number($('diceSelect').value), c=DATA.characters.find(c=>c.die===dice);if(!c)return;state=fresh();state.character=c.id;state.table=$('tableName').value.trim()||'Table '+dice;save();$('revealProfile').innerHTML=`<div class="eyebrow">DIE FACE ${dice} · ${escapeHTML(c.tag)}</div><h3>${escapeHTML(c.name)}</h3><p class="major">${escapeHTML(c.major)}</p><p>${escapeHTML(c.intro)}</p><dl><dt>Strengths</dt><dd>${escapeHTML(c.strengths)}</dd><dt>Barrier</dt><dd>${escapeHTML(c.barrier)}</dd><dt>Relationship with AI</dt><dd>${escapeHTML(c.ai)}</dd><dt>Loves</dt><dd>${escapeHTML(c.likes)}</dd><dt>Avoids</dt><dd>${escapeHTML(c.dislikes)}</dd><dt>Four-year goal</dt><dd>${escapeHTML(c.goal)}</dd></dl>`;$('revealIcon').textContent=c.icon;$('revealNameArt').textContent=c.name;showScreen('revealScreen')}
function renderCampus(message){updateBrains();$('mapCharacter').innerHTML=charMini();$('campusMessage').textContent=message||currentMessage||'Click an illuminated building to continue the journey.';let root=$('buildingButtons');root.replaceChildren();for(let y=1;y<=4;y++){const year=DATA.years[y-1],done=complete(y),unlocked=isUnlocked(y);const b=document.createElement('button');b.className='building-btn'+(unlocked?'':' locked');b.type='button';b.setAttribute('aria-label',`${year.name}, year ${y}, ${done?'completed':unlocked?'unlocked':'locked'}`);b.innerHTML=`<span class="building-roof"></span><span class="building-structure"></span><span class="building-windows">${'<span></span>'.repeat(8)}</span><span class="building-door"></span><span class="building-label">YEAR ${y} · ${escapeHTML(year.short)}<small>${done?'✓ Complete':unlocked?'Enter building':'🔒 Locked'}</small></span>`;b.addEventListener('click',()=>{if(!unlocked){openModal('Building sealed',`<p>Complete Year ${y-1} and its boss encounter to unlock this building.</p>`);return}enterDoor(y)});root.appendChild(b)}$('yearList').innerHTML=DATA.years.map(y=>`<div class="year-entry ${complete(y.year)?'done':''}"><strong>Year ${y.year}</strong><span>${complete(y.year)?'✓ Complete':isUnlocked(y.year)?'◈ Unlocked':'🔒 Sealed'}</span></div>`).join('');$('graduationBtn').classList.toggle('hidden',!allYearsComplete());$('graduationBtn').textContent=state.graduationComplete&&pointTotal()===100?'VIEW GRADUATION ✦':'FACE GRADUATION ➜';showScreen('campusScreen')}
async function enterDoor(y){if(doorBusy)return;doorBusy=true;currentYear=y;$('doorTitle').textContent='ENTERING '+DATA.years[y-1].name.toUpperCase();showScreen('doorScreen');document.querySelector('.door-backdrop').classList.remove('open');await new Promise(r=>setTimeout(r,160));document.querySelector('.door-backdrop').classList.add('open');await new Promise(r=>setTimeout(r,1450));doorBusy=false;renderYear();showScreen('yearScreen')}
function scenarioComplete(y,n){const s=currentScenarios(y)[n-1];return !!(s&&answer(s).submitted)}
function allScenariosDone(y){return [1,2,3].every(n=>scenarioComplete(y,n))}
function renderYear(){updateBrains();const y=DATA.years[currentYear-1];$('roomTitle').textContent=y.name;$('roomYear').textContent='YEAR '+currentYear+' · '+y.short.toUpperCase();$('roomCharacter').innerHTML=charMini();if(currentTab<4&&currentTab>1&&!scenarioComplete(currentYear,currentTab-1))currentTab=1;if(complete(currentYear))currentTab=4;else{let first=[1,2,3].find(n=>!scenarioComplete(currentYear,n));currentTab=first||4}renderTabs();renderActiveTab()}
function renderTabs(){let tabs=$('scenarioTabs');tabs.replaceChildren();for(let tab=1;tab<=4;tab++){let unlocked=tab===1 || (tab<=3?scenarioComplete(currentYear,tab-1):allScenariosDone(currentYear));let b=document.createElement('button');b.className='scenario-tab'+(tab===currentTab?' active':'')+(tab<4&&scenarioComplete(currentYear,tab)?' done':'')+(tab===4&&complete(currentYear)?' done':'');b.textContent=tab===4?'⚔ BOSS':`SCENE ${tab}${scenarioComplete(currentYear,tab)?' ✓':''}`;b.disabled=!unlocked;b.addEventListener('click',()=>{currentTab=tab;renderTabs();renderActiveTab()});tabs.append(b)}}
function renderActiveTab(){const isBoss=currentTab===4;$('scenarioForm').classList.toggle('hidden',isBoss);$('bossPanel').classList.toggle('hidden',!isBoss);$('roomProgress').textContent=isBoss?'Boss Encounter':`Scenario ${currentTab} of 3`;$('roomFooterMessage').textContent=isBoss?'Earn 0, 10, or 20 KP with a defensible response.':'Finish three scenarios to face the Chancellor.';if(isBoss){renderBoss()}else{renderScenario()} }
function renderScenario(){const s=currentScenarios(currentYear)[currentTab-1];if(!s)return;const a=answer(s);$('scenarioDetails').innerHTML=`<div class="course-title">${escapeHTML(s.course)} · SCENE ${currentTab}</div><h3>${escapeHTML(s.title)}</h3><div class="story-card"><strong>Where ${escapeHTML(char().name)} is now</strong><p>${escapeHTML(s.characterContext)}</p><p class="speech">“${escapeHTML(s.quote)}”</p></div><div class="story-card"><strong>Original assessment</strong><p>${escapeHTML(s.assignment)}</p></div><div class="story-card"><strong>Shortcut available</strong><p>${escapeHTML(s.shortcut)}</p></div><div class="story-card"><strong>Design conditions</strong><p>${escapeHTML(s.constraints)}</p></div><div class="story-card"><strong>Party mission</strong><p>${escapeHTML(s.prompt)}</p></div>`;$('frictionText').value=a.friction;$('redesignText').value=a.redesign;document.querySelectorAll('[name="framework"]').forEach(cb=>cb.checked=(a.frameworks||[]).includes(cb.value));$('scenarioNotice').textContent=a.submitted?'Design saved. You can revisit and revise it.':'';$('scenarioNotice').className='notice'+(a.submitted?' success':'');$('saveScenarioBtn').textContent=a.submitted?'UPDATE DESIGN & CONTINUE ➜':'SAVE DESIGN & CONTINUE ➜';scenarioAttempted=false;updateScenarioRequirements();}
function getScenarioDraft(){return {friction:$('frictionText').value,redesign:$('redesignText').value,frameworks:Array.from(document.querySelectorAll('[name="framework"]:checked')).map(cb=>cb.value)}}
function saveDraft(){if(currentTab>3||!state.character)return;const s=currentScenarios(currentYear)[currentTab-1];if(!s)return;state.answers[s.id]={...answer(s),...getScenarioDraft()};save();updateScenarioRequirements()}
function submitScenario(evt){
 if(evt)evt.preventDefault();
 try{
  scenarioAttempted=true;
  const valid=updateScenarioRequirements();
  if(!valid.every(Boolean)){
   const missing=[];
   if(!valid[0])missing.push('AI friction (15+ characters)');
   if(!valid[1])missing.push('assessment redesign (15+ characters)');
   if(!valid[2])missing.push('a framework checkbox');
   const msg='Still needed: '+missing.join('; ')+'.';
   $('scenarioNotice').textContent=msg;
   $('scenarioNotice').className='notice error';
   $('saveFeedback').textContent=msg;
   $('saveFeedback').className='save-feedback error';
   flashNotice(msg,'error');
   announce(msg);
   return;
  }
  const scenario=currentScenarios(currentYear)[currentTab-1];
  if(!scenario)throw new Error('No scenario was found for this chapter.');
  const savedNumber=currentTab;
  const draft=getScenarioDraft();
  // Atomically commit both answers and submitted status; never mutate a stale reference.
  state.answers[scenario.id]={...answer(scenario),...draft,submitted:true};
  const persistOK=save();
  currentTab=savedNumber<3?savedNumber+1:4;
  renderTabs();
  renderActiveTab();
  const message=savedNumber<3
   ?`Scenario ${savedNumber} SAVED! You are now on Scenario ${savedNumber+1} of 3.`
   :'ALL THREE SCENARIOS SAVED! Your Chancellor boss battle is ready.';
  $('saveFeedback').textContent=message+(persistOK?'':' Note: the browser did not permit persistent storage; keep this tab open.');
  $('saveFeedback').className='save-feedback success';
  flashNotice(message,'success');
  announce(message);
  window.scrollTo({top:0,behavior:'auto'});
  const scrollPanel=$('scenarioDetails');if(scrollPanel)scrollPanel.scrollTop=0;
 }catch(err){
  const message='The game could not advance. Your answers are still shown here. Error: '+(err?.message||String(err));
  $('scenarioNotice').textContent=message;
  $('scenarioNotice').className='notice error';
  $('saveFeedback').textContent=message;
  $('saveFeedback').className='save-feedback error';
  flashNotice(message,'error');
  announce(message);
  console.error('Scenario save failure',err);
 }
}
const challengeTypes=[
 {key:'bypass',name:'The Bypass Attack',question:'I can ask AI to produce the assignment anyway. Where will your student have to demonstrate the thinking the assignment intends to develop?'},
 {key:'motivation',name:'The Motivation Attack',question:'Your redesign asks for effort. Why should this student care enough to undertake the learning rather than choose the fastest submission?'},
 {key:'friction',name:'The Friction Attack',question:'Have your safeguards increased workload, accessibility barriers, or surveillance without protecting meaningful practice? Defend the proportionality of your design.'},
 {key:'twist',name:'The Unexpected Constraint',question:'Half the class has limited time and inconsistent access to devices. Which element of your redesign could you adapt without surrendering the central learning?'},
 {key:'critical',name:'Critical Challenge: The Chancellor’s Gambit',question:'A student submits excellent AI-produced work and eloquently describes the assignment. How do you know the intended thinking happened, and what limitation must you still accept?'}
];
function attackFromRoll(n){return n<=5?challengeTypes[0]:n<=10?challengeTypes[1]:n<=15?challengeTypes[2]:n<=19?challengeTypes[3]:challengeTypes[4]}
function samplePrevious(){return currentScenarios(currentYear).map(s=>{const a=answer(s);return `<div class="story-card"><strong>${escapeHTML(s.title)}</strong><p>${escapeHTML(a.redesign.slice(0,250))}${a.redesign.length>250?'…':''}</p></div>`}).join('')}
function renderBoss(){const y=DATA.years[currentYear-1],prior=Number(state.bossScores[currentYear]||0),roll=Number(state.bossRolls[currentYear]||0);$('scenarioDetails').innerHTML=`<div class="course-title">YEAR ${currentYear} · ANNUAL BOSS</div><h3>The Chancellor's Challenge</h3><div class="story-card"><strong>Chapter completed</strong><p>${escapeHTML(y.lore)}</p></div><div class="story-card"><strong>Your party's three proposals</strong><p>Review the work the Chancellor may challenge. Use your earlier designs to support the defense.</p></div>${samplePrevious()}<div class="story-card"><strong>Scoring</strong><p>10 KP: purposeful AI friction. 10 KP: a defensible use of any one of the three redesign elements. 20 KP possible for this annual boss.</p></div>`;$('bossDialogue').textContent=`“${char().name} has submitted three impressive-looking assignments. But have they learned anything? Roll your die. I dare you to defend your designs.”`;$('bossResponse').value=state.bossResponses[currentYear]||'';$('dieValue').textContent=roll||'d20';$('manualDie').value='';$('frictionAward').checked=!!state.bossCriteria?.[currentYear]?.ai;$('frameworkAward').checked=!!state.bossCriteria?.[currentYear]?.framework;updateBossPreview();$('bossRetryHelp').textContent=complete(currentYear)?`Your previous confirmed award is ${prior}/20 KP. You may improve this defense; only additional points will be added.`:'';showChallenge();$('bossNotice').textContent=complete(currentYear)?'Annual encounter complete. To improve, make a stronger defense and request a higher evaluation.':'';$('bossNotice').className='notice'+(complete(currentYear)?' success':'')}
function showChallenge(){const roll=Number(state.bossRolls[currentYear]||0);if(!roll){$('bossChallenge').textContent='Roll the die to reveal the Chancellor’s attack. Dice select the challenge; they never determine Knowledge Points.';return}const c=attackFromRoll(roll);$('bossChallenge').innerHTML=`<strong>${escapeHTML(c.name)} · d20 ${roll}</strong><p>${escapeHTML(c.question)}</p>`;announce('Rolled '+roll+'. '+c.name)}
function setBossRoll(n){if(!Number.isInteger(n)||n<1||n>20)return false;state.bossRolls[currentYear]=n;save();$('dieValue').textContent=n;showChallenge();return true}
function updateBossPreview(){$('scorePreview').innerHTML=`Proposed score: <strong>${($('frictionAward').checked?10:0)+($('frameworkAward').checked?10:0)} / 20 KP</strong>`}
function scoreAnnual(){const roll=Number(state.bossRolls[currentYear]);const response=$('bossResponse').value.trim();if(!roll){$('bossNotice').textContent='Roll a d20 before submitting a boss defense.';$('bossNotice').className='notice error';return}if(response.length<25){$('bossNotice').textContent='Your table needs a more developed defense (at least 25 characters).';$('bossNotice').className='notice error';return}let score=($('frictionAward').checked?10:0)+($('frameworkAward').checked?10:0), old=Number(state.bossScores[currentYear]||0);state.bossScores[currentYear]=Math.max(score,old);state.bossResponses[currentYear]=response;state.bossCriteria??={};state.bossCriteria[currentYear]={ai:$('frictionAward').checked,framework:$('frameworkAward').checked};state.yearComplete[currentYear]=true;save();let added=state.bossScores[currentYear]-old;currentMessage=`Year ${currentYear} complete. Your party earned ${added} new KP (${state.bossScores[currentYear]}/20 possible for this encounter). ${currentYear===4?'The Commencement Trial has opened.':'The next building is now unlocked.'}`;if(allYearsComplete()&&pointTotal()===100&&state.graduationScore===20){state.graduationComplete=true;save();renderVictory();return}renderCampus(currentMessage);announce(currentMessage)}
function enterGraduation(){if(!allYearsComplete())return;if(state.graduationComplete&&pointTotal()===100){renderVictory();return}$('gradCharacter').innerHTML=charMini();$('gradResponse').value=state.graduationResponse||'';$('gradFriction').checked=!!state.gradCriteria?.ai;$('gradFramework').checked=!!state.gradCriteria?.framework;updateGradPreview();$('gradNotice').textContent=pointTotal()<80?'Your brain chamber still needs points from previous annual boss defenses. You can attempt this final defense now, then revisit those earlier encounters.':'';$('gradNotice').className='notice';updateBrains();showScreen('graduationScreen')}
function updateGradPreview(){$('gradScorePreview').innerHTML=`Proposed score: <strong>${($('gradFriction').checked?10:0)+($('gradFramework').checked?10:0)} / 20 KP</strong>`}
function scoreGraduation(){let response=$('gradResponse').value.trim();if(response.length<40){$('gradNotice').textContent='Include a specific assessment design and an honest remaining limitation (at least 40 characters).';$('gradNotice').className='notice error';return}let award=($('gradFriction').checked?10:0)+($('gradFramework').checked?10:0), old=Number(state.graduationScore||0);state.graduationScore=Math.max(old,award);state.graduationResponse=response;state.gradCriteria={ai:$('gradFriction').checked,framework:$('gradFramework').checked};save();updateBrains();if(pointTotal()===100){state.graduationComplete=true;save();renderVictory();return}$('gradNotice').textContent=`The Chancellor awarded ${state.graduationScore}/20 KP for commencement. The dome is at ${pointTotal()}/100. To graduate, strengthen any incomplete annual defense or your final defense, and ask the facilitator to confirm the improvement.`;$('gradNotice').className='notice';announce($('gradNotice').textContent)}
function renderVictory(){$('diplomaName').textContent=(state.table||'Your Party')+' — guiding '+char().name;updateBrains();showScreen('victoryScreen')}
function openModal(title,html){$('modalTitle').textContent=title;$('modalBody').innerHTML=html;$('infoModal').showModal()}
function reviewSaved(){const lines=[];for(let y=1;y<=4;y++){lines.push(`<h4>Year ${y} · ${escapeHTML(DATA.years[y-1].name)} — ${Number(state.bossScores[y]||0)} / 20 KP</h4>`);for(let s of currentScenarios(y)){const a=answer(s);lines.push(`<details><summary>${escapeHTML(s.title)} ${a.submitted?'✓':''}</summary><p><strong>AI friction:</strong> ${escapeHTML(a.friction||'—')}</p><p><strong>Redesign:</strong> ${escapeHTML(a.redesign||'—')}</p><p><strong>Elements:</strong> ${escapeHTML((a.frameworks||[]).join(', ')||'—')}</p></details>`)}}lines.push(`<h4>Commencement — ${Number(state.graduationScore||0)} / 20 KP</h4><p>${escapeHTML(state.graduationResponse||'Not yet attempted.')}</p><p>Total: ${pointTotal()} / 100 KP</p>`);openModal('Saved Chronicle',lines.join(''))}
function reviewFramework(){openModal('The three elements + purposeful AI friction',`<p><strong>Every assessed defense has TWO scoring dimensions:</strong></p><dl><dt>10 KP — Purposeful AI friction</dt><dd>Identify how AI could bypass intended thinking, and propose a specific, proportionate strategy that makes the thinking observable. A ban or busywork alone is not enough.</dd><dt>10 KP — At least one redesign element</dt><dd><strong>Meaningful practice:</strong> What must students be able to do, and what thinking do they actually practice?<br><strong>A reason to engage:</strong> Why does the work feel relevant, worthwhile, or purposeful?<br><strong>Reasonable conditions and friction:</strong> Are AI boundaries clear, workload manageable, and support and access adequate?</dd></dl><p>Scenarios are formative preparation. Boss defenses are scored by a facilitator, not automatically by the game. No single assessment is invulnerable; a strong design can acknowledge limitations.</p>`)}
$('welcomeStart').addEventListener('click',setupRoll);
$('diceSelect').addEventListener('change',()=>{$('revealBtn').disabled=!$('diceSelect').value});
$('revealBtn').addEventListener('click',reveal);
$('enterCampusBtn').addEventListener('click',()=>renderCampus('Your first college building is illuminated. Enter Year 1.'));
$('homeBtn').addEventListener('click',()=>{if(state.character)renderCampus()});
$('resetBtn').addEventListener('click',()=>{if(window.confirm('Restart the entire adventure? This clears the current party, every written response, and all Knowledge Points on this device.')){state=fresh();save();showScreen('welcomeScreen');announce('Adventure reset')}});
$('returnCampusBtn').addEventListener('click',()=>{saveDraft();renderCampus()});
// Direct click handler avoids reliance on implicit HTML form submission.
$('saveScenarioBtn').addEventListener('click',submitScenario);
$('scenarioForm').addEventListener('submit',event=>{event.preventDefault();submitScenario()});
['frictionText','redesignText'].forEach(id=>$(id).addEventListener('input',saveDraft));
document.querySelectorAll('[name="framework"]').forEach(cb=>cb.addEventListener('change',saveDraft));
$('rollBossBtn').addEventListener('click',()=>setBossRoll(Math.floor(Math.random()*20)+1));
$('useManualDie').addEventListener('click',()=>{if(!setBossRoll(Number($('manualDie').value))){$('bossNotice').textContent='Enter a whole number from 1 through 20.';$('bossNotice').className='notice error'}});
$('bossResponse').addEventListener('input',()=>{state.bossResponses[currentYear]=$('bossResponse').value;save()});
['frictionAward','frameworkAward'].forEach(id=>$(id).addEventListener('change',updateBossPreview));
$('submitBossBtn').addEventListener('click',scoreAnnual);
$('quickReviewBtn').addEventListener('click',reviewFramework);
$('reviewWorkBtn').addEventListener('click',reviewSaved);
$('graduationBtn').addEventListener('click',enterGraduation);
['gradFriction','gradFramework'].forEach(id=>$(id).addEventListener('change',updateGradPreview));
$('gradResponse').addEventListener('input',()=>{state.graduationResponse=$('gradResponse').value;save()});
$('submitGradBtn').addEventListener('click',scoreGraduation);
$('gradCampusBtn').addEventListener('click',()=>renderCampus());
$('victoryCampusBtn').addEventListener('click',()=>renderCampus('The degree has been earned. Your Chronicle is complete.'));
$('printDiplomaBtn').addEventListener('click',()=>window.print());
$('closeInfoModal').addEventListener('click',()=>$('infoModal').close());
$('infoModal').addEventListener('click',e=>{if(e.target===$('infoModal'))$('infoModal').close()});
$('versionMark').textContent='BUILD 1.2.0 · Game ready';
window.addEventListener('error',event=>{if(currentScreen==='yearScreen'&&!$('scenarioForm').classList.contains('hidden')){
 const msg='Game error: '+(event.message||'Unknown error')+' — please capture this text for troubleshooting.';
 $('saveFeedback').textContent=msg;$('saveFeedback').className='save-feedback error';
}});
if(state.character){renderCampus('Welcome back. Your progress has been restored from this device.')}else{showScreen('welcomeScreen')}
})();
