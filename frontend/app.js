const BASE_URL = "http://localhost:5000/api";
let uploadedFile = null;
function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
}
async function loadApplications() {
  try {
    const res = await authFetch(`${BASE_URL}/applications`, {
      method: "GET"
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Failed to fetch applications");
      return;
    }

    console.log("Applications from backend:", result.data);

    renderTbl(result.data); // 👈 send to table

  } catch (err) {
    console.error("Error:", err);
  }
}
// ── STATE ──
const SK = 'edutrack_v4';
let DB = (() => { try { return JSON.parse(localStorage.getItem(SK)) || { students:[] }; } catch { return { students:[] }; } })();
const saveDB = () => localStorage.setItem(SK, JSON.stringify(DB));
let role = null, user = null, draft = {}, selE = 'GATE', docF = {}, CH = {};



// ── UTILS ──
const g  = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };
const sErr = (id, msg) => { const e = document.getElementById(id); if(e) e.textContent = msg; };
const cErr = id => { const e = document.getElementById(id); if(e) e.textContent = ''; };

// ── REGISTER SCREEN ──
function showRegister() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('register-screen').classList.add('show');
  // clear form
  ['rg-name','rg-roll','rg-email','rg-pass','rg-pass2'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  ['rg-branch','rg-year'].forEach(id=>{const e=document.getElementById(id);if(e)e.selectedIndex=0;});
  ['re-name','re-roll','re-email','re-branch','re-year','re-pass','re-pass2','rg-err'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent='';});
}
function showLogin() {
  document.getElementById('register-screen').classList.remove('show');
  document.getElementById('login-screen').style.display = 'flex';
}
async function doRegister() {
  const name  = document.getElementById('rg-name').value.trim();
  const roll  = document.getElementById('rg-roll').value.trim();
  const email = document.getElementById('rg-email').value.trim();
  const branch= document.getElementById('rg-branch').value;
  const year  = document.getElementById('rg-year').value;
  const pass  = document.getElementById('rg-pass').value;
  const pass2 = document.getElementById('rg-pass2').value;
  const err   = document.getElementById('rg-err');

  let ok = true;

  const se = (id,msg) => { document.getElementById(id).textContent = msg; ok = false; };
  const ce = id => { document.getElementById(id).textContent = ''; };

  if (!name)  se('re-name','Full name is required'); else ce('re-name');
  if (!roll)  se('re-roll','Roll number is required'); else ce('re-roll');
  if (!email || !email.includes('@')) se('re-email','Valid email is required'); else ce('re-email');
  if (!branch) se('re-branch','Select a branch'); else ce('re-branch');
  if (!year)   se('re-year','Select a year'); else ce('re-year');
  if (!pass || pass.length < 6) se('re-pass','Min. 6 characters'); else ce('re-pass');
  if (pass !== pass2) se('re-pass2','Passwords do not match'); else ce('re-pass2');

  if (!ok) return;

  err.textContent = '';

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password: pass,
        role: "student" ,
        roll_no: roll   // 🔥 important
      })
    });

    const data = await res.json();

    if (!res.ok) {
      err.textContent = data.message || "Registration failed";
      return;
    }

    // ✅ SUCCESS UI (same as your logic)
    err.style.color = '#4ADE80';
    err.textContent = '✓ Account created! Please sign in.';

    setTimeout(() => {
      err.style.color = '';
      err.textContent = '';

      document.getElementById('l-email').value = email;
      document.getElementById('l-pass').value = '';

      showLogin();
      pickRole('student');

    }, 1400);

  } catch (error) {
    err.textContent = "Server error. Try again.";
  }
}
// ── LOGIN ──
let selRole = 'student';
function pickRole(r) {
  selRole = r;
  document.getElementById('rt-s').classList.toggle('on', r==='student');
  document.getElementById('rt-a').classList.toggle('on', r==='admin');
}
async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pw    = document.getElementById('l-pass').value;
  const er    = document.getElementById('l-err');

  const currentRole = document.getElementById('rt-a').classList.contains('on') ? 'admin' : 'student';

  if (!email) { er.textContent = 'Please enter your email.'; return; }
  if (!pw)    { er.textContent = 'Please enter your password.'; return; }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password: pw
      })
    });

    const data = await res.json();

    if (!res.ok) {
      er.textContent = data.message || "Login failed";
      return;
    }

   const backendUser = data.data.user;   // ✅ correct
   const token = data.data.token;        // ✅ correct

    // 🔥 IMPORTANT: ROLE CHECK
    if (backendUser.role !== currentRole) {
      er.textContent = "Selected role does not match your account.";
      return;
    }

    // ✅ Save token
    localStorage.setItem("token", token);

    // ✅ Set global user + role
    user = backendUser;
    role = backendUser.role;

    er.textContent = "";

    launchApp();

  } catch (err) {
    er.textContent = "Server error. Try again.";
  }
}
function doLogout() {
  role=null; user=null; draft={}; docF={}; selE='GATE';
  Object.values(CH).forEach(c=>c.destroy()); CH={};
  document.getElementById('app').classList.remove('show');
  document.getElementById('login-screen').style.display='flex';
  ['l-email','l-pass'].forEach(id=>{ const e=document.getElementById(id); if(e)e.value=''; });
}

// ── LAUNCH ──
function launchApp() {
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').classList.add('show');
  const badge=document.getElementById('r-badge'), av=document.getElementById('u-av');
  badge.textContent = role==='admin'?'Administrator':'Student';
  badge.className   = 'r-badge '+role;
  av.textContent    = user.name[0].toUpperCase();
  av.className      = 'u-av '+(role==='admin'?'a':'s');
  document.getElementById('tb-dt').textContent = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  if (role==='student') document.getElementById('s-greet').textContent = user.name.split(' ')[0];
  const asr=document.getElementById('tb-admin-srch');
  if(asr)asr.style.display=role==='admin'?'block':'none';
  buildSB(); goto(role==='admin'?'a-dash':'s-dash');
}

// ── SIDEBAR ──
const SNAV = [{pg:'s-dash',ic:'grid',lb:'Dashboard'},{pg:'s-register',ic:'user',lb:'Registration'},{pg:'s-exam',ic:'doc',lb:'Select Exam'},{pg:'s-docs',ic:'up',lb:'Upload Documents'},{pg:'s-uni',ic:'uni',lb:'University Details'}];
const ANAV = [{pg:'a-dash',ic:'grid',lb:'Dashboard'},{pg:'a-students',ic:'srch',lb:'Search & Filter'},{pg:'a-reports',ic:'chart',lb:'Reports & Analytics'},{pg:'a-alumni',ic:'star',lb:'Alumni'}];
const IC = {
  grid:`<rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/>`,
  user:`<circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>`,
  doc:`<rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8h6M5 5h3M5 11h4"/>`,
  up:`<path d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V5L9 1z"/><path d="M9 1v4h4"/>`,
  uni:`<path d="M8 1l7 4-7 4-7-4 7-4z"/><path d="M1 9l7 4 7-4M1 5v6M15 5v6"/>`,
  srch:`<circle cx="6.5" cy="6.5" r="4"/><path d="M10.5 10.5l3 3"/>`,
  chart:`<path d="M2 12l4-5 3 3 5-7"/>`,
  star:`<path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10 5 11.5l.5-3.5L3 5.5 6.5 5z"/>`,
};
function buildSB() {
  const nav = role==='admin'?ANAV:SNAV;
  const foot = role==='admin'
    ? `<div class="sb-cta"><div class="sb-cta-ic"><svg viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2"><path d="M6 1v10M2 5l4-4 4 4"/></svg></div><h4>Batch Import via CSV</h4><button onclick="alert('Connect Supabase backend to enable.')">Import CSV ↗</button></div>`
    : `<div class="sb-cta"><div class="sb-cta-ic"><svg viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2"><circle cx="6" cy="6" r="4"/><path d="M6 4v4M4 6h4"/></svg></div><h4>Need help with your application?</h4><button onclick="alert('Contact: admin@college.edu')">Contact Admin ↗</button></div>`;
  document.getElementById('sidebar').innerHTML =
    `<div class="sb-sect"><div class="sb-lbl">${role==='admin'?'Admin Panel':'Student Portal'}</div>
    ${nav.map(n=>`<div class="sb-item" data-pg="${n.pg}" onclick="goto('${n.pg}')"><svg viewBox="0 0 16 16" fill="none" stroke-width="1.6">${IC[n.ic]}</svg>${n.lb}</div>`).join('')}
    </div><div class="sb-foot">${foot}</div>`;
}

// ── NAVIGATION ──
function goto(pg) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('on'));

  const el = document.getElementById('pg-' + pg);
  if (el) el.classList.add('on');

  const ni = document.querySelector(`.sb-item[data-pg="${pg}"]`);
  if (ni) ni.classList.add('on');

  if (pg === 's-docs') buildDocArea();
  if (pg === 's-submit') buildReview();
  if (pg === 's-dash') updateDashSteps();
  if (pg === 'a-dash') setTimeout(drawDash, 80);
  if (pg === 'a-students') { 
    loadApplications();   // 👈 IMPORTANT
  }
  if (pg === 'a-reports') setTimeout(drawRep, 80);
  if (pg === 'a-alumni') renderAlumni();

  buildSI(pg);

  // 🔥 ADD THIS BLOCK (VERY IMPORTANT)
  setTimeout(() => {
    const fileInput = document.getElementById("pdfFile");

    if (fileInput) {
      fileInput.addEventListener("change", (event) => {
        uploadedFile = event.target.files[0];
        console.log("Stored file:", uploadedFile);
      });
    }
  }, 100);
}

// ── STEP INDICATORS ──
const SIMAP={'s-register':1,'s-exam':2,'s-docs':3,'s-uni':4,'s-submit':5};
function buildSI(pg) {
  const cur=SIMAP[pg]; if(!cur)return;
  const el=document.getElementById('si'+cur); if(!el)return;
  let h='';
  for(let i=1;i<=5;i++){
    const c=i<cur?'d':i===cur?'a':'t', lb=i<cur?'✓':i;
    h+=`<div class="si-d ${c}">${lb}</div>`;
    if(i<5)h+=`<div class="si-l ${i<cur?'d':''}"></div>`;
  }
  el.innerHTML=h;
}

// ── DASHBOARD STEPS ──
function updateDashSteps() {
  let done=0;
  if(draft.name)done=Math.max(done,1);if(draft.exam)done=Math.max(done,2);
  if(Object.values(docF).some(Boolean))done=Math.max(done,3);if(draft.country)done=Math.max(done,4);
  const f=document.getElementById('dp-fill'),t=document.getElementById('dp-txt');
  if(f)f.style.width=(done/5*100)+'%';if(t)t.textContent=done+' / 5';
  const steps=[
    {lb:'Registration',ds:'Name · Roll No · Email · Branch · Year',pg:'s-register'},
    {lb:'Select Admission',ds:'GATE / CAT / GRE + Score',pg:'s-exam'},
    {lb:'Upload Documents',ds:'Hall Ticket · Rank Card · Allotment · Admission',pg:'s-docs'},
    {lb:'University Details',ds:'Country · College · Course',pg:'s-uni'},
    {lb:'Final Submission',ds:'Review & submit everything',pg:'s-submit'},
  ];
  document.getElementById('d-steps').innerHTML=steps.map((s,i)=>{
    const n=i+1,cls=n<=done?'done':n===done+1?'cur':'',lb=n<=done?'✓':n===done+1?'→':n;
    return `<div class="sitem" onclick="goto('${s.pg}')"><div class="sic ${cls}">${lb}</div><div><div class="snm">${s.lb}</div><div style="font-size:12px;color:var(--mt)">${s.ds}</div></div><div class="sds">Step ${n}</div></div>`;
  }).join('');
}

// ── STEP 1 ──
function saveReg(){
  const n=g('r-name'),r=g('r-roll'),e=g('r-email'),b=g('r-branch'),y=g('r-year');
  let ok=true;
  if(!n){sErr('e-name','Name is required');ok=false;}else cErr('e-name');
  if(!r){sErr('e-roll','Roll number is required');ok=false;}else cErr('e-roll');
  if(!e||!e.includes('@')){sErr('e-email','Valid email required');ok=false;}else cErr('e-email');
  if(!b){sErr('e-branch','Select a branch');ok=false;}else cErr('e-branch');
  if(!y){sErr('e-year','Select a year');ok=false;}else cErr('e-year');
  if(!ok)return;
  draft={...draft,name:n,roll:r,email:e,branch:b,year:y};goto('s-exam');
}

// ── STEP 2 ──
let selectedExam = "";

function pickExam(el) {
  document.querySelectorAll(".eo").forEach(element => element.classList.remove("sel"));
  el.classList.add("sel");

  selectedExam = el.getAttribute("data-v");
  console.log("Selected exam:", selectedExam);
}
function saveExam(){
  const sc=g('ex-score');
  if(!sc){sErr('e-score','Score or rank is required');return;}cErr('e-score');
  draft={...draft,exam:selE,score:sc};goto('s-docs');
}

// ── STEP 3 ──
const DDEFS=[{id:'hall_ticket',lb:'Hall Ticket',req:true},{id:'rank_card',lb:'Rank Card',req:true},{id:'allotment',lb:'Seat Allotment Letter',req:false},{id:'admission',lb:'Admission Letter',req:false}];
function buildDocArea(){
  const c=document.getElementById('doc-area');if(!c)return;
  c.innerHTML=DDEFS.map(d=>`
    <div class="fg"><label>${d.lb}${d.req?' *':' (optional)'}</label>
    <div class="upz" id="upz-${d.id}" onclick="document.getElementById('fi-${d.id}').click()"
      ondragover="event.preventDefault();this.classList.add('drag')"
      ondragleave="this.classList.remove('drag')" ondrop="dDrop(event,'${d.id}')">
      <input type="file" id="fi-${d.id}" accept=".pdf,.jpg,.jpeg,.png" onchange="hFile('${d.id}',this)"/>
      <div class="upz-ic">📎</div><p><strong>Click to upload</strong> or drag & drop</p>
      <p style="font-size:11px;margin-top:3px">PDF, JPG, PNG</p></div>
    <div id="fp-${d.id}"></div></div>`).join('');
  DDEFS.forEach(d=>{if(docF[d.id])showFP(d.id,docF[d.id]);});
}

function dDrop(ev,id){ev.preventDefault();document.getElementById('upz-'+id).classList.remove('drag');const f=ev.dataTransfer.files[0];if(f){docF[id]=f;console.log("docF:",docF);showFP(id,f.name);}}
function hFile(id, inp) {
  if (inp.files[0]) {
    docF[id] = inp.files[0];
    console.log("docF:", docF);
    showFP(id, inp.files[0].name);
  }
}
function setF(id,nm){docF[id]=nm;showFP(id,nm);}
function showFP(id,nm){const c=document.getElementById('fp-'+id);if(!c)return;c.innerHTML=`<div class="uf-list"><div class="uf-item"><span class="uf-ok">✓</span><span class="uf-nm">${nm}</span><span class="uf-rm" onclick="rmF('${id}')">×</span></div></div>`;}
function rmF(id){docF[id]=null;const fi=document.getElementById('fi-'+id);if(fi)fi.value='';const c=document.getElementById('fp-'+id);if(c)c.innerHTML='';}

// ── STEP 4 ──
function saveUni(){
  const c=g('u-country'),co=g('u-college'),cu=g('u-course');let ok=true;
  if(!c){sErr('e-uc','Select a country');ok=false;}else cErr('e-uc');
  if(!co){sErr('e-uco','College name required');ok=false;}else cErr('e-uco');
  if(!cu){sErr('e-ucu','Course name required');ok=false;}else cErr('e-ucu');
  if(!ok)return;
  draft={...draft,country:c,college:co,course:cu};goto('s-submit');
}

// ── STEP 5 ──
function buildReview(){
  const rows=[['Name',draft.name||'—'],['Roll No',draft.roll||'—'],['Email',draft.email||'—'],['Branch',draft.branch||'—'],['Year',draft.year||'—'],['Exam',draft.exam||'—'],['Score',draft.score||'—'],['Country',draft.country||'—'],['College',draft.college||'—'],['Course',draft.course||'—'],['Docs uploaded',Object.values(docF).filter(Boolean).length+' files']];
  document.getElementById('rv-box').innerHTML=`<table>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`;
}
async function finalSubmit() {
  try {
    const token = localStorage.getItem("token");

    console.log("docF:", docF);

    // ✅ Validate required files
    if (!docF.hall_ticket || !docF.rank_card) {
      alert("Hall Ticket and Rank Card are required");
      return;
    }

    // 🔥 Get admission_type
    const admissionType = document.getElementById("admissionType")?.value?.trim();
    console.log("admission_type:", admissionType);

    if (!admissionType) {
      alert("Please select admission type");
      return;
    }

    // 🔥 Get university
    const university = document.getElementById("u-college")?.value?.trim();
    console.log("university:", university);

    if (!university) {
      alert("Please enter a university/college name");
      return;
    }

    // ✅ Create FormData
    const formData = new FormData();

    formData.append("admission_type", admissionType);
    formData.append("university", university);

    // 🔥 Append all files properly
    if (docF.hall_ticket) {
      formData.append("hall_ticket", docF.hall_ticket);
    }

    if (docF.rank_card) {
      formData.append("rank_card", docF.rank_card);
    }

    if (docF.allotment) {
      formData.append("seat_allotment", docF.allotment);
    }

    if (docF.admission) {
      formData.append("admission_letter", docF.admission);
    }

    // ✅ Correct endpoint
    const url = "http://localhost:5000/api/documents";
    console.log("Sending request to:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // ❗ DO NOT add Content-Type
      },
      body: formData,
    });

    console.log("Response status:", response.status);

    let result;
    try {
      result = await response.json();
    } catch {
      const text = await response.text();
      console.log("Raw response:", text);
      throw new Error("Invalid JSON response");
    }

    console.log("RESPONSE:", result);

    if (!response.ok) {
      alert(result.message || "Submission failed");
      return;
    }

    alert("Documents uploaded successfully!");
    goto("success");

  } catch (error) {
    console.error("FULL ERROR:", error);
    alert(error.message || "Something went wrong");
  }
}

// ── UNIFIED SEARCH + FILTER ──
function popFDrops(){
  const uniq=k=>[...new Set(DB.students.map(s=>s[k]).filter(Boolean))].sort();
  [['sf-branch','branch'],['sf-country','country'],['sf-year','year']].forEach(([id,k])=>{
    const el=document.getElementById(id);if(!el)return;
    const cv=el.value,f=el.options[0];el.innerHTML='';el.appendChild(f);
    uniq(k).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;el.appendChild(o);});
    el.value=cv;
  });
}
function applyF(){
  const q=(document.getElementById('sf-q')||{}).value?.toLowerCase()||'';
  const exam=(document.getElementById('sf-exam')||{}).value||'';
  const branch=(document.getElementById('sf-branch')||{}).value||'';
  const country=(document.getElementById('sf-country')||{}).value||'';
  const year=(document.getElementById('sf-year')||{}).value||'';
  const res=DB.students.filter(s=>{
    const mq=!q||(s.name||'').toLowerCase().includes(q)||(s.roll||'').toLowerCase().includes(q)||(s.college||'').toLowerCase().includes(q);
    return mq&&(!exam||s.exam===exam)&&(!branch||s.branch===branch)&&(!country||s.country===country)&&(!year||s.year===year);
  });
  renderTbl(res);
  renderTags({exam,branch,country,year});
}
function clearF(){
  ['sf-q','sf-exam','sf-branch','sf-country','sf-year'].forEach(id=>{const e=document.getElementById(id);if(!e)return;e.tagName==='INPUT'?e.value='':e.selectedIndex=0;});
  applyF();
}
function rmTag(id){const e=document.getElementById(id);if(!e)return;e.tagName==='INPUT'?e.value='':e.selectedIndex=0;applyF();}
function renderTags(f){
  const el=document.getElementById('af-tags');if(!el)return;
  const LB={'sf-exam':'Exam','sf-branch':'Branch','sf-country':'Country','sf-year':'Year'};
  const VL={'sf-exam':f.exam,'sf-branch':f.branch,'sf-country':f.country,'sf-year':f.year};
  el.innerHTML=Object.entries(VL).filter(([,v])=>v).map(([k,v])=>`<span class="af-tag">${LB[k]}: ${v} <button onclick="rmTag('${k}')">×</button></span>`).join('');
}
function gSearch(v){const e=document.getElementById('sf-q');if(e)e.value=v;if(document.getElementById('pg-a-students').classList.contains('on'))applyF();}

// ── TABLE ──
function renderTbl(data){
  const body = document.getElementById('tbl-body');
  if(!body) return;

  console.log("TABLE DATA:", data); // debug

  if(!data.length){
    body.innerHTML = `<tr><td colspan="6">No applications found</td></tr>`;
    return;
  }

  body.innerHTML = data.map(s => `
    <tr>
      <td>${s.users?.roll_no || "N/A"}</td>
      <td>${s.users?.name || "N/A"}</td>
      <td>${s.university}</td>
      <td>${s.admission_type}</td>
      <td>${s.status}</td>
      <td>
        ${s.pdf_url ? `<a href="${s.pdf_url}" target="_blank">View</a>` : "No File"}
      </td>
    </tr>
  `).join('');
}

// ── DOC MODAL ──
function openM(roll){
  const s=DB.students.find(s=>s.roll===roll);if(!s)return;
  document.getElementById('m-title').textContent=s.name+' — Documents';
  const defs=[{id:'hall_ticket',lb:'Hall Ticket'},{id:'rank_card',lb:'Rank Card'},{id:'allotment',lb:'Seat Allotment Letter'},{id:'admission',lb:'Admission Letter'}];
  document.getElementById('m-docs').innerHTML=defs.map(d=>`<div class="doc-row"><div class="doc-row-l"><span>📄</span><span>${d.lb}</span></div>${(s.docs&&s.docs[d.id])?`<button class="dv-btn" onclick="alert('File: ${s.docs[d.id]}\\n\\nIn production, this opens the Supabase storage URL.')">${s.docs[d.id]}</button>`:`<span class="dm">Not uploaded</span>`}</div>`).join('');
  document.getElementById('doc-modal').classList.add('open');
}
function closeM(){document.getElementById('doc-modal').classList.remove('open');}

// ── EXPORT ──
function exportCSV(){
  const h='Roll No,Name,Email,Branch,Year,Exam,Score,Country,College,Course,Hall Ticket,Rank Card,Allotment,Admission,Date';
  const rows=DB.students.map(s=>[s.roll,s.name,s.email,s.branch,s.year,s.exam,s.score,s.country,`"${s.college}"`,s.course,s.docs?.hall_ticket||'',s.docs?.rank_card||'',s.docs?.allotment||'',s.docs?.admission||'',s.date].join(','));
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent([h,...rows].join('\n'));a.download='edutrack.csv';a.click();
}

// ── CHARTS ──
const CL=['#F5C100','#4338CA','#15803D','#DC2626','#2563EB','#D97706','#7C3AED','#0D9488'];
const cntBy=(arr,k)=>arr.reduce((m,s)=>{const v=s[k]||'?';m[v]=(m[v]||0)+1;return m;},{});
const killC=id=>{if(CH[id]){CH[id].destroy();delete CH[id];}};

function drawDash(){
  const s=DB.students,gate=s.filter(x=>x.exam==='GATE').length,cat=s.filter(x=>x.exam==='CAT').length,gre=s.filter(x=>x.exam==='GRE').length;
  const el=document.getElementById('a-sg');
  if(el)el.innerHTML=`<div class="sc"><div class="sc-v">${s.length}</div><div class="sc-l">Total Students</div></div><div class="sc"><div class="sc-v">${gate}</div><div class="sc-l">GATE</div><div class="sc-s">M.Tech</div></div><div class="sc"><div class="sc-v">${cat}</div><div class="sc-l">CAT</div><div class="sc-s">MBA</div></div><div class="sc"><div class="sc-v">${gre}</div><div class="sc-l">GRE</div><div class="sc-s">MS Abroad</div></div>`;
  killC('dc');killC('db');
  const cd=cntBy(s,'country'),bd=cntBy(s,'branch');
  CH['dc']=new Chart(document.getElementById('ch-c'),{type:'doughnut',data:{labels:Object.keys(cd),datasets:[{data:Object.values(cd),backgroundColor:CL,borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,plugins:{legend:{position:'right',labels:{font:{size:11},boxWidth:11}}}}});
  CH['db']=new Chart(document.getElementById('ch-b'),{type:'bar',data:{labels:Object.keys(bd),datasets:[{data:Object.values(bd),backgroundColor:'#4338CA',borderRadius:5}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,font:{size:11}}},x:{ticks:{font:{size:10},maxRotation:30}}}}});
}
function drawRep(){
  const s=DB.students,scores=s.map(x=>parseFloat(x.score)).filter(n=>!isNaN(n));
  const avg=scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):'—';
  const cd=cntBy(s,'country'),yd=cntBy(s,'year'),ed=cntBy(s,'exam'),bd=cntBy(s,'branch');
  const tC=Object.entries(cd).sort((a,b)=>b[1]-a[1])[0],tB=Object.entries(bd).sort((a,b)=>b[1]-a[1])[0],lY=Object.keys(yd).sort().pop();
  const el=document.getElementById('r-sg');
  if(el)el.innerHTML=`<div class="sc"><div class="sc-v">${avg}</div><div class="sc-l">Avg Score</div></div><div class="sc"><div class="sc-v">${tC?tC[0]:'—'}</div><div class="sc-l">Top Country</div><div class="sc-s">${tC?tC[1]+' students':''}</div></div><div class="sc"><div class="sc-v">${tB?tB[0].split(' ')[0]:'—'}</div><div class="sc-l">Top Branch</div></div><div class="sc"><div class="sc-v">${lY||'—'}</div><div class="sc-l">Latest Year</div></div>`;
  ['rc','ry','re','rb'].forEach(killC);
  CH['rc']=new Chart(document.getElementById('r-c'),{type:'doughnut',data:{labels:Object.keys(cd),datasets:[{data:Object.values(cd),backgroundColor:CL,borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,plugins:{legend:{position:'right',labels:{font:{size:11},boxWidth:11}}}}});
  CH['ry']=new Chart(document.getElementById('r-y'),{type:'bar',data:{labels:Object.keys(yd).sort(),datasets:[{data:Object.keys(yd).sort().map(k=>yd[k]),backgroundColor:'#F5C100',borderRadius:5}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,font:{size:11}}},x:{ticks:{font:{size:11}}}}}});
  CH['re']=new Chart(document.getElementById('r-e'),{type:'bar',data:{labels:Object.keys(ed),datasets:[{data:Object.values(ed),backgroundColor:['#4338CA','#F5C100','#15803D'],borderRadius:6}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{stepSize:1,font:{size:11}}}}}});
  CH['rb']=new Chart(document.getElementById('r-b'),{type:'bar',data:{labels:Object.keys(bd),datasets:[{data:Object.values(bd),backgroundColor:'#2563EB',borderRadius:5}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,font:{size:11}}},x:{ticks:{font:{size:10},maxRotation:25}}}}});
}

// ── ALUMNI ──
function renderAlumni(){
  const el=document.getElementById('alum-list');if(!el)return;
  if(!DB.students.length){el.innerHTML='<div class="no-data" style="grid-column:1/-1">No alumni records yet.</div>';return;}
  el.innerHTML=DB.students.map(s=>`<div class="alum-card"><div class="alum-av">${(s.name||'?')[0].toUpperCase()}</div><div class="alum-info"><h4>${s.name} <span style="font-size:11px;color:var(--mt);font-weight:400">${s.roll}</span></h4><p>${s.branch} · Batch ${s.year}<br/>${s.college}, ${s.country}</p><span class="badge ${(s.exam||'').toLowerCase()}">${s.exam} · ${s.score}</span></div></div>`).join('');
}
function handleFileUpload(event) {
  uploadedFile = event.target.files[0];
  console.log("Stored file:", uploadedFile);
}