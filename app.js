const form = document.querySelector('#energy-form');
const status = document.querySelector('#status');
const button = form.querySelector('button');
const results = document.querySelector('#results');
const label = document.querySelector('#button-label');
const localDate = new Date();
const today = `${localDate.getFullYear()}-${String(localDate.getMonth()+1).padStart(2,'0')}-${String(localDate.getDate()).padStart(2,'0')}`;
form.elements.birthDate.max = today;
function approximateMoon(date) {
 const age = (((date.getTime() - Date.UTC(2000,0,6,18,14))/86400000)%29.530588853+29.530588853)%29.530588853;
 return ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'][Math.floor((age/29.530588853*8)+.5)%8];
}
document.querySelector('#moon-heading').textContent = approximateMoon(localDate);
function setText(id, text) { document.getElementById(id).textContent = text; }
function setList(id, items) {
 document.getElementById(id).replaceChildren(...items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
}
form.addEventListener('submit', async event => {
 event.preventDefault();
 if (!form.reportValidity()) return;
 if (location.protocol === 'file:') { status.textContent = 'Open this site through Vercel or the local preview server to generate your reading.'; return; }
 const data = Object.fromEntries(new FormData(form));
 data.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
 button.disabled = true;
 results.setAttribute('aria-busy','true');
 label.textContent = 'Finding your moonlight…';
 status.className = '';
 status.textContent = 'Your reading is on its way. This may take up to a minute.';
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), 55000);
 try {
  const response = await fetch('/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Your reading could not be generated. Please try again.');
  const r = payload.reading;
  if (!r || !Array.isArray(r.do) || !Array.isArray(r.avoid)) throw new Error('The reading was incomplete. Please try again.');
  for (const [id,key] of Object.entries({'moon-heading':'moonPhase','moon-description':'moonMessage','daily-energy':'dailyEnergy','power-color':'powerColor','avoid-color':'avoidColor','best-outfit':'bestOutfit','best-scent':'bestScent','best-crystal':'bestCrystal','best-time':'bestTime','affirmation':'affirmation'})) setText(id,r[key]);
  document.querySelector('#energy-fill').style.width = `${r.dailyEnergy}%`;
  setList('do-list',r.do); setList('avoid-list',r.avoid);
  setText('result-label',`${data.name.trim()}’s moon outfit`);
  setText('reading-date',payload.date);
  status.textContent = 'Your moon outfit is ready.';
  results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 } catch(error) {
  status.className = 'error';
  status.textContent = error.name === 'AbortError' ? 'The reading took too long. Please try again in a moment.' : (error instanceof TypeError ? 'We couldn’t connect. Check your connection and try again.' : error.message);
 } finally {
  clearTimeout(timer); button.disabled=false; results.setAttribute('aria-busy','false'); label.textContent='Generate My Moon Outfit';
 }
});
