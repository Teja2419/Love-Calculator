// app.js - frontend logic, animation, and submit flow

const form = document.getElementById('calcForm');
const nameA = document.getElementById('nameA');
const nameB = document.getElementById('nameB');
const method = document.getElementById('method');
const consentEl = document.getElementById('consent');
const meter = document.getElementById('meter');
const scoreEl = document.getElementById('score');
const verdictEl = document.getElementById('verdict');
const explain = document.getElementById('explain');
const clearBtn = document.getElementById('clearBtn');
const shareBtn = document.getElementById('shareBtn');

let lastScore = 0;

function lettersSumScore(a,b){
  const s = (a + b).toLowerCase().replace(/[^a-z]/g,'');
  let sum = 0;
  for(const ch of s) sum += (ch.charCodeAt(0) - 96);
  return sum % 101;
}

function compatHashScore(a,b){
  const s = (a + '|' + b).toLowerCase();
  let hash = 5381;
  for (let i = 0; i < s.length; i++){
    hash = ((hash << 5) + hash) + s.charCodeAt(i);
    hash = hash | 0;
  }
  hash = Math.abs(hash);
  return hash % 101;
}

function luckyScore(a,b){
  const base = compatHashScore(a,b);
  const d = new Date();
  const t = d.getFullYear() + d.getMonth() + d.getDate();
  return (base + t) % 101;
}

function pickAlgorithm(name){
  switch(name){
    case 'letters': return lettersSumScore;
    case 'compat': return compatHashScore;
    case 'lucky': return luckyScore;
    default: return compatHashScore;
  }
}

function animateMeter(from,to){
  const duration = 900;
  const start = performance.now();
  function frame(t){
    const p = Math.min(1,(t-start)/duration);
    const cur = Math.round(from + (to-from) * easeOutCubic(p));
    scoreEl.textContent = cur + '%';
    meter.style.background = `conic-gradient(var(--accent) 0% ${cur}%, rgba(0,0,0,0.03) ${cur}% 100%)`;
    if(p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const a = nameA.value.trim();
  const b = nameB.value.trim();
  if(!a || !b){ alert('Please enter both names'); return; }
  const alg = pickAlgorithm(method.value);
  const s = alg(a,b);
  let text = "It's complicated";
  if(s >= 85) text = 'A perfect match!';
  else if(s >= 65) text = 'Very good together';
  else if(s >= 45) text = 'Has potential';
  else if(s >= 25) text = 'Could use work';
  else text = 'Playful warning: low compatibility';

  explain.textContent = `Algorithm: ${method.options[method.selectedIndex].text}. Deterministic score based on names.`;
  verdictEl.textContent = text;
  animateMeter(lastScore, s);
  lastScore = s;

  const params = new URLSearchParams({a: a, b: b, m: method.value});
  history.replaceState(null,'','?' + params.toString());

  if (consentEl.checked){
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          nameA: a,
          nameB: b,
          score: s,
          algorithm: method.value,
          consent: true,
          meta: { ua: navigator.userAgent, locale: navigator.language }
        })
      });
    } catch (err){
      console.warn('submit failed', err);
    }
  }
});

clearBtn.addEventListener('click', ()=>{
  nameA.value = ''; nameB.value = '';
  verdictEl.textContent = 'Enter names and calculate';
  animateMeter(lastScore, 0);
  lastScore = 0;
  scoreEl.textContent = '0%';
  history.replaceState(null,'', location.pathname);
});

shareBtn.addEventListener('click', ()=>{
  const url = location.href;
  if(navigator.share){
    navigator.share({title:'Love Calculator',text:'See our compatibility result',url});
  } else {
    navigator.clipboard.writeText(url).then(()=>alert('Link copied to clipboard'));
  }
});

window.addEventListener('load', ()=>{
  const qs = new URLSearchParams(location.search);
  const a = qs.get('a'), b = qs.get('b'), m = qs.get('m');
  if(a) nameA.value = a;
  if(b) nameB.value = b;
  if(m) method.value = m;
  if(a && b){
    form.dispatchEvent(new Event('submit'));
  }
});