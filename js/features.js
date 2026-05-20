// ── 마켓 탭 ──

// SVG viewBox 비율 보정 헬퍼 - 찌그러짐 방지
function _fixSvgRatio(svgCode, sz) {
  if(!svgCode) return svgCode;
  const vb = svgCode.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  let sw = sz, sh = sz;
  if(vb) {
    const vw = parseFloat(vb[1]), vh = parseFloat(vb[2]);
    if(vw > 0 && vh > 0) {
      if(vw > vh) { sh = Math.round(sz * vh / vw); }
      else if(vh > vw) { sw = Math.round(sz * vw / vh); }
    }
  }
  return svgCode
    .replace(/\s+width="[^"]*"/g, '')
    .replace(/\s+height="[^"]*"/g, '')
    .replace(/<svg/, `<svg width="${sw}" height="${sh}" preserveAspectRatio="xMidYMid meet"`);
}


function removePack(packId) {
  const _allPacks = (typeof S!=='undefined' && S._marketPacks) || (typeof WORD_PACKS!=='undefined' ? WORD_PACKS : []);
  const pack = _allPacks.find(p=>p.id===packId);
  const packName = pack?.name || packId;

  // confirm 대신 커스텀 모달 사용
  const mr = document.getElementById('mr');
  if(!mr) return;
  mr.innerHTML = `<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()" style="text-align:center">
    <div style="font-size:36px;margin-bottom:12px">🗑️</div>
    <div style="font-size:16px;font-weight:800;margin-bottom:8px">"${packName}" 삭제</div>
    <div style="font-size:13px;color:#6B7280;margin-bottom:20px">내 단어장에서 삭제할까요?<br>마켓에서 다시 추가할 수 있어요.</div>
    <div style="display:flex;gap:8px">
      <button onclick="cm()" style="flex:1;padding:12px;background:#F3F4F6;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;color:#374151">취소</button>
      <button onclick="cm();_doRemovePack('${packId}')" style="flex:1;padding:12px;background:#DC2626;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;color:#fff">삭제</button>
    </div>
  </div></div>`;
}

function _doRemovePack(packId) {
  const _allPacks = (typeof S!=='undefined' && S._marketPacks) || (typeof WORD_PACKS!=='undefined' ? WORD_PACKS : []);
  const pack = _allPacks.find(p=>p.id===packId);
  const packName = pack?.name || packId;

  if(typeof S !== 'undefined') {
    S._ownedPacks = (S._ownedPacks||[]).filter(id => id !== packId);
    // 단어장에서도 제거
    if(S.books) S.books = S.books.filter(b=>b.packId!==packId && b.name!==packName);
    if(typeof db !== 'undefined' && S.user && S.user.uid) {
      db.collection('users').doc(S.user.uid).update({
        _ownedPacks: S._ownedPacks
      }).catch(()=>{
        db.collection('users').doc(S.user.uid).set(
          {_ownedPacks: S._ownedPacks}, {merge:true}
        ).catch(()=>{});
      });
      db.collection('user_packs').doc(S.user.uid).set(
        {owned: S._ownedPacks}, {merge:true}
      ).catch(()=>{});
    }
    sv();
  }

  toast('"'+packName+'" 삭제 완료');
  if(typeof go !== 'undefined') go('mybooks','market');
}

function downloadPack(packId) {
  const _packs=(typeof S!=='undefined'&&S._marketPacks)||WORD_PACKS||[];
  const pack=_packs.find(p=>p.id===packId);
  if(!pack){toast('단어장을 찾을 수 없어요');return;}
  const myPacks=new Set(JSON.parse(localStorage.getItem('wd-my-packs')||'[]'));
  if(myPacks.has(packId)){toast('이미 추가된 단어장이에요');return;}
  const wordCnt=(pack.words||[]).length;
  const allBooks=[{name:'내 단어장',cnt:S.words.length},...(S.books||[]).map(b=>({name:b.name,cnt:(b.words||[]).length}))];
  window._dpPackId=packId; window._dpMode='new'; window._dpBook='내 단어장';
  const mr=document.getElementById('mr'); if(!mr)return;
  mr.innerHTML=`<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()" style="padding:0;max-height:88vh;display:flex;flex-direction:column">
    <div style="padding:14px 20px;border-bottom:1px solid var(--border,#E5E7EB);flex-shrink:0;display:flex;align-items:center;gap:12px">
      <span style="font-size:32px">${pack.emoji}</span>
      <div><div style="font-size:16px;font-weight:800">${pack.name}</div>
        <div style="font-size:12px;color:#9CA3AF">${pack.cat} · ${wordCnt}개</div></div>
      <button onclick="cm()" style="margin-left:auto;background:none;border:none;font-size:22px;cursor:pointer;color:#9CA3AF">×</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px 20px">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px">📚 어떻게 추가할까요?</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
        <div id="dp-new" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;border:2px solid #1E5FA5;background:#EFF6FF;cursor:pointer">
          <div style="width:18px;height:18px;border-radius:50%;background:#1E5FA5;flex-shrink:0"></div>
          <div><div style="font-size:13px;font-weight:700;color:#1E5FA5">✨ 새 단어장으로 추가 (기본)</div>
            <div style="font-size:11px;color:#6B7280">"${pack.name}" 이름으로 새 단어장 생성</div></div>
        </div>
        <div id="dp-existing" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;border:2px solid var(--border,#E5E7EB);background:var(--bg-sub,#F9FAFB);cursor:pointer">
          <div style="width:18px;height:18px;border-radius:50%;border:2px solid #D1D5DB;flex-shrink:0"></div>
          <div><div style="font-size:13px;font-weight:700">📖 기존 단어장에 단어 추가</div>
            <div style="font-size:11px;color:#6B7280">내가 만든 단어장에 합쳐요</div></div>
        </div>
      </div>
      <div id="dp-booklist" style="display:none">
        <div style="font-size:12px;font-weight:700;color:#9CA3AF;margin-bottom:8px">단어장 선택</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${allBooks.map(b=>{
            const ex=b.name==='내 단어장'?new Set(S.words.map(w=>w.en.toLowerCase())):new Set((S.books?.find(x=>x.name===b.name)?.words||[]).map(w=>w.en.toLowerCase()));
            const addable=pack.words.filter(w=>!ex.has(w.en.toLowerCase())).length;
            return `<div data-bname="${b.name.replace(/"/g,'&quot;')}" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border,#E5E7EB);background:var(--bg-sub,#F9FAFB);cursor:pointer">
              <div style="display:flex;align-items:center;gap:8px">
                <div class="dp-radio" style="width:16px;height:16px;border-radius:50%;border:2px solid #D1D5DB;flex-shrink:0"></div>
                <span style="font-size:13px;font-weight:700">${b.name}</span>
                <span style="font-size:11px;color:#9CA3AF">${b.cnt}개</span>
              </div>
              <span style="font-size:12px;font-weight:700;color:${addable>0?'#1E5FA5':'#9CA3AF'}">+${addable}개</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border,#E5E7EB);flex-shrink:0">
      <button id="dp-confirm" style="width:100%;background:#1E5FA5;color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:800;cursor:pointer">추가하기</button>
    </div>
  </div></div>`;

  document.getElementById('dp-new').addEventListener('click',()=>dpSelectMode('new'));
  document.getElementById('dp-existing').addEventListener('click',()=>dpSelectMode('existing'));
  document.querySelectorAll('[data-bname]').forEach(el=>{
    el.addEventListener('click',()=>{
      window._dpBook=el.dataset.bname;
      document.querySelectorAll('[data-bname]').forEach(e=>{e.style.border='1.5px solid var(--border,#E5E7EB)';e.style.background='var(--bg-sub,#F9FAFB)';e.querySelector('.dp-radio').style.background='';});
      el.style.border='1.5px solid #1E5FA5'; el.style.background='#EFF6FF';
      el.querySelector('.dp-radio').style.background='#1E5FA5';
    });
  });
  document.getElementById('dp-confirm').addEventListener('click',()=>confirmDownloadPack(window._dpPackId));
}

function dpSelectMode(mode) {
  window._dpMode=mode;
  const isNew=mode==='new';
  const elNew=document.getElementById('dp-new'), elEx=document.getElementById('dp-existing'), elList=document.getElementById('dp-booklist');
  if(elNew){elNew.style.border=isNew?'2px solid #1E5FA5':'2px solid var(--border,#E5E7EB)';elNew.style.background=isNew?'#EFF6FF':'var(--bg-sub,#F9FAFB)';elNew.querySelector('div').style.background=isNew?'#1E5FA5':'transparent';elNew.querySelector('div').style.border=isNew?'':'2px solid #D1D5DB';}
  if(elEx){elEx.style.border=isNew?'2px solid var(--border,#E5E7EB)':'2px solid #1E5FA5';elEx.style.background=isNew?'var(--bg-sub,#F9FAFB)':'#EFF6FF';elEx.querySelector('div').style.background=isNew?'transparent':'#1E5FA5';elEx.querySelector('div').style.border=isNew?'2px solid #D1D5DB':'';}
  if(elList) elList.style.display=isNew?'none':'block';
}

function confirmDownloadPack(packId) {
  const _allPacks=(typeof S!=='undefined'&&S._marketPacks)||WORD_PACKS||[];
  const pack=_allPacks.find(p=>p.id===packId); if(!pack)return;
  const mode=window._dpMode||'new';
  if(mode==='new') {
    if(!S.books)S.books=[];
    let bookName=pack.name, cnt=1;
    while(S.books.find(b=>b.name===bookName)||bookName==='내 단어장') bookName=`${pack.name} (${++cnt})`;
    const cleanWords = (pack.words||[]).filter(w => w.en && w.kr && w.en.length < 50 && !['포함된 문장','단어','한국어뜻','발음기호','형태','한국어','예문'].includes(w.en));
    S.books.push({name:bookName,words:cleanWords,markMap:{},srsMap:{},learned:[]});
    if(!S._ownedPacks) S._ownedPacks=[];
    if(!S._ownedPacks.includes(packId)) {
      S._ownedPacks.push(packId);
      // Firebase users 컬렉션에 즉시 저장
      if(typeof db!=='undefined' && S.user && S.user.uid) {
        db.collection('users').doc(S.user.uid).update({_ownedPacks:S._ownedPacks}).catch(()=>{
          db.collection('users').doc(S.user.uid).set({_ownedPacks:S._ownedPacks},{merge:true}).catch(()=>{});
        });
      }
    }
    sv();cm();toast(`✅ "${bookName}" 추가 완료!`);S.stab='books';go('mybooks');
  } else {
    const target=window._dpBook||'내 단어장';
    if(target==='내 단어장'){
      const ex=new Set(S.words.map(w=>w.en.toLowerCase()));
      const newW=pack.words.filter(w=>!ex.has(w.en.toLowerCase()) && w.en && w.kr && w.en.length<50 && !w.en.includes('포함된') && !w.en.includes('한국어') && !w.en.includes('발음기호') && !w.en.includes('단어'));
      S.words.push(...newW);
    } else {
      const bk=(S.books||[]).find(b=>b.name===target);
      if(!bk){toast('단어장을 찾을 수 없어요');return;}
      if(!bk.words)bk.words=[];
      const ex=new Set(bk.words.map(w=>w.en.toLowerCase()));
      const newW=pack.words.filter(w=>!ex.has(w.en.toLowerCase()) && w.en && w.kr && w.en.length<50 && !w.en.includes('포함된') && !w.en.includes('한국어') && !w.en.includes('발음기호') && !w.en.includes('단어'));
      bk.words.push(...newW);
    }
    if(!S._ownedPacks) S._ownedPacks=[];
    if(!S._ownedPacks.includes(packId)) {
      S._ownedPacks.push(packId);
      if(typeof db!=='undefined' && S.user && S.user.uid) {
        db.collection('users').doc(S.user.uid).update({_ownedPacks:S._ownedPacks}).catch(()=>{
          db.collection('users').doc(S.user.uid).set({_ownedPacks:S._ownedPacks},{merge:true}).catch(()=>{});
        });
      }
    }
    sv();cm();toast(`✅ "${target}"에 단어 추가 완료!`);S.stab='books';go('mybooks');
  }
}


// ── 발음 따라하기 ──
function showPronounce(word) {
  if(!word) return;
  let recording=false, recognition=null, score=0;
  const startRec = () => {
    if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast('이 브라우저는 음성인식을 지원하지 않아요');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => { recording=true; updateRecUI(true); };
    recognition.onend = () => { recording=false; updateRecUI(false); };
    recognition.onresult = e => {
      const heard = e.results[0][0].transcript.toLowerCase().trim();
      const target = word.en.toLowerCase().trim();
      score = calcScore(heard, target);
      showScoreResult(score, heard, target, word);
    };
    recognition.onerror = e => {
      toast('음성인식 오류: '+e.error);
      updateRecUI(false);
    };
    recognition.start();
  };
  const stopRec = () => { if(recognition) recognition.stop(); };
  document.getElementById('mr').innerHTML=`<div class="mbg"><div class="modal" style="text-align:center">
    <div style="font-size:48px;margin-bottom:8px">${word.img||'🔊'}</div>
    <div style="font-size:24px;font-weight:900;color:#1E5FA5;font-family:monospace;margin-bottom:4px">${word.en}</div>
    <div style="font-size:14px;color:#374151;font-weight:700;margin-bottom:4px">${word.kr}</div>
    <div style="font-size:13px;color:#9CA3AF;margin-bottom:16px">${word.ph||''}</div>
    <button onclick="const u=new SpeechSynthesisUtterance('${word.en}');u.lang='en-US';u.rate=0.8;window.speechSynthesis.speak(u)" style="background:#EFF6FF;border:1.5px solid #BFDBFE;border-radius:12px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;color:#1E5FA5;margin-bottom:14px;display:inline-flex;align-items:center;gap:6px">
      🔊 원어민 발음 듣기
    </button>
    <div id="rec-ui" style="margin-bottom:14px">
      <button id="rec-btn" onclick="startRec()" style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#1E5FA5,#2563EB);border:none;font-size:32px;cursor:pointer;box-shadow:0 4px 16px rgba(30,95,165,.4)">🎤</button>
      <div style="font-size:12px;color:#9CA3AF;margin-top:8px">탭해서 따라 말하기</div>
    </div>
    <div id="score-result"></div>
    <button onclick="if(recording)stopRec();cm()" class="btn bgr" style="margin-top:10px">닫기</button>
  </div></div>`;
  window.startRec = startRec;
  window.stopRec = stopRec;
  window.updateRecUI = (active) => {
    const btn=document.getElementById('rec-btn');
    if(!btn)return;
    if(active){btn.style.background='linear-gradient(135deg,#DC2626,#EF4444)';btn.textContent='⏹';btn.onclick=stopRec;btn.style.animation='pulse 1s infinite';}
    else{btn.style.background='linear-gradient(135deg,#1E5FA5,#2563EB)';btn.textContent='🎤';btn.onclick=startRec;btn.style.animation='';}
  };
}

function calcScore(heard, target) {
  if(heard===target) return 100;
  if(heard.includes(target)||target.includes(heard)) return 90;
  // 레벤슈타인 거리 기반 유사도
  const m=target.length, n=heard.length;
  const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){dp[i][j]=target[i-1]===heard[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);}
  const maxLen=Math.max(m,n);
  return Math.round((1-dp[m][n]/maxLen)*100);
}

function showScoreResult(score, heard, target, word) {
  const el=document.getElementById('score-result'); if(!el)return;
  const great=score>=90, good=score>=80, ok=score>=70;
  const color=great?'#16A34A':good?'#D97706':ok?'#E65100':'#DC2626';
  const msg=great?'완벽해요! 🎉':good?'아주 좋아요! 통과! 🟡':ok?'조금 더 연습해봐요! 🟠':'다시 해봐요! 🔴';
  const pass=score>=80;
  el.innerHTML=`<div style="background:${pass?'#F0FDF4':'#FFF1F2'};border:2px solid ${pass?'#86EFAC':'#FECDD3'};border-radius:16px;padding:16px;margin-bottom:10px">
    <div style="font-size:40px;font-weight:900;color:${color};margin-bottom:4px">${score}%</div>
    <div style="font-size:13px;font-weight:700;color:${color};margin-bottom:8px">${msg}</div>
    <div style="font-size:12px;color:#6B7280">들린 발음: <strong>"${heard}"</strong></div>
    ${pass?`<div style="font-size:12px;color:#16A34A;margin-top:6px;font-weight:700">✅ 통과! 다음 단어로 이동</div>`:
    `<div style="font-size:12px;color:#DC2626;margin-top:6px">80% 이상이어야 통과해요. 다시 도전!</div>`}
  </div>
  <div style="display:flex;gap:8px">
    ${pass?`<button onclick="cm();SFX.play('correct');vib([50,0,50])" style="flex:2;background:#16A34A;color:#fff;border:none;border-radius:10px;padding:10px;font-size:13px;font-weight:700;cursor:pointer">✅ 통과!</button>`:
    `<button onclick="window.startRec&&window.startRec()" style="flex:2;background:#1E5FA5;color:#fff;border:none;border-radius:10px;padding:10px;font-size:13px;font-weight:700;cursor:pointer">🎤 다시 도전</button>`}
  </div>`;
  if(pass){SFX.play('correct');vib([50,0,50]);}else{SFX.play('wrong');vib([100,50,100]);}
}

// ── 게임 랭킹 ──
const RANK_PERIODS=['today','week','month'];
const RANK_PERIOD_LABELS={today:'오늘',week:'이번 주',month:'이번 달'};
window._rankPeriod='today';
window._rankLevel='all';

async function rRanking() {
  const parts=[];
  parts.push('<div style="display:flex;flex-direction:column;height:100%">');
  // 기간 탭
  parts.push('<div style="background:#fff;border-bottom:1.5px solid #E5E7EB;padding:8px 12px;display:flex;gap:6px;flex-shrink:0">');
  RANK_PERIODS.forEach(p=>{
    const on=p===window._rankPeriod;
    parts.push(`<button onclick="window._rankPeriod='${p}';loadRanking()" style="flex:1;padding:8px;border-radius:10px;border:none;font-size:13px;font-weight:700;cursor:pointer;background:${on?'#1E5FA5':'#F3F4F6'};color:${on?'#fff':'#6B7280'}">${RANK_PERIOD_LABELS[p]}</button>`);
  });
  parts.push('</div>');
  // 레벨 필터
  parts.push('<div style="background:#fff;padding:6px 12px;border-bottom:1px solid #F3F4F6;display:flex;gap:4px;overflow-x:auto;flex-shrink:0">');
  const lvls=[['all','전체'],...LEVELS.map(l=>[l.id,l.emoji+l.name.split(' ')[0]])];
  lvls.forEach(([id,nm])=>{
    const on=id===window._rankLevel;
    parts.push(`<button onclick="window._rankLevel='${id}';loadRanking()" style="padding:4px 10px;border-radius:20px;border:none;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;background:${on?'#1E5FA5':'#F3F4F6'};color:${on?'#fff':'#6B7280'}">${nm}</button>`);
  });
  parts.push('</div>');
  parts.push('<div id="rank-list" style="flex:1;overflow-y:auto;padding:14px">');
  parts.push('<div style="text-align:center;color:#9CA3AF;padding:20px">랭킹 로딩 중...</div>');
  parts.push('</div></div>');
  setTimeout(loadRanking, 100);
  return parts.join('');
}

async function loadRanking() {
  const el=document.getElementById('rank-list'); if(!el) return;
  el.innerHTML='<div style="text-align:center;color:#9CA3AF;padding:20px">랭킹 로딩 중...</div>';
  try {
    let q=db.collection('rankings').orderBy('score','desc').limit(50);
    if(window._rankLevel!=='all') q=q.where('level','==',window._rankLevel);
    // 기간 필터
    const now=new Date();
    let from=new Date();
    if(window._rankPeriod==='today') from.setHours(0,0,0,0);
    else if(window._rankPeriod==='week') from.setDate(from.getDate()-7);
    else if(window._rankPeriod==='month') from.setMonth(from.getMonth()-1);
    const snap=await q.get();
    const all=snap.docs.map(d=>({id:d.id,...d.data()}));
    const filtered=all.filter(r=>{
      if(!r.date) return true;
      return new Date(r.date)>=from;
    });
    filtered.sort((a,b)=>b.score-a.score);
    renderRankList(filtered);
  } catch(e) {
    // Firestore 없으면 더미 랭킹
    const dummy=[
      {nick:'황금나비님',level:'god',score:9850,emoji:'⚡'},{nick:'공부왕',level:'big',score:8200,emoji:'🦋'},
      {nick:'단어마스터',level:'small',score:7100,emoji:'🦋'},{nick:'열공중',level:'shine',score:6400,emoji:'✨'},
      {nick:'영어천재',level:'coco',score:5200,emoji:'🫘'},{nick:'학습러',level:'crown',score:4100,emoji:'🍀'},
      {nick:'도전자',level:'baby',score:3000,emoji:'🐛'},{nick:'시작이반',level:'egg',score:1200,emoji:'🥚'},
    ];
    renderRankList(dummy.map((d,i)=>({...d,rank:i+1})));
  }
}

function renderRankList(list) {
  const el=document.getElementById('rank-list'); if(!el)return;
  if(!list.length){el.innerHTML='<div style="text-align:center;color:#9CA3AF;padding:40px">랭킹 데이터가 없어요</div>';return;}
  const myNick=S.nick;
  const meIdx=list.findIndex(r=>r.nick===myNick||r.uid===S.user?.uid);
  const parts=[];
  // 상위 3개 시상대
  const top3=list.slice(0,3);
  parts.push('<div style="display:flex;justify-content:center;align-items:flex-end;gap:10px;margin-bottom:20px;padding-top:10px">');
  const order=[1,0,2], heights=['80px','100px','64px'], colors=['#C0C0C0','#FFD700','#CD7F32'];
  order.forEach((i,oi)=>{
    const r=top3[i]; if(!r) return;
    const isMe=r.nick===myNick||r.uid===S.user?.uid;
    parts.push(`<div style="text-align:center;flex:1">
      <div style="font-size:${i===0?'24px':'20px'};margin-bottom:4px">${r.emoji||'🥚'}</div>
      <div style="font-size:${i===0?'13px':'11px'};font-weight:800;color:${isMe?'#1E5FA5':'#111'};margin-bottom:4px">${isMe?'👉 '+r.nick:r.nick}</div>
      <div style="background:${colors[oi]};border-radius:10px 10px 0 0;height:${heights[oi]};display:flex;align-items:center;justify-content:center;flex-direction:column">
        <div style="font-size:20px">${['🥈','🥇','🥉'][oi]}</div>
        <div style="font-size:12px;font-weight:900;color:#fff">${r.score?.toLocaleString()}</div>
      </div>
    </div>`);
  });
  parts.push('</div>');
  // 전체 목록
  list.forEach((r,i)=>{
    const isMe=r.nick===myNick||r.uid===S.user?.uid;
    const l=LEVELS.find(lv=>lv.id===r.level)||LEVELS[0];
    parts.push(`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;margin-bottom:6px;background:${isMe?'#EFF6FF':'#fff'};border:${isMe?'2px solid #1E5FA5':'1.5px solid #F3F4F6'}${isMe?';box-shadow:0 2px 8px rgba(30,95,165,.15)':''}">
      <div style="font-size:16px;font-weight:900;color:${i<3?['#FFD700','#C0C0C0','#CD7F32'][i]:'#9CA3AF'};min-width:28px;text-align:center">${i<3?['🥇','🥈','🥉'][i]:i+1}</div>
      <div style="font-size:22px">${r.emoji||l.emoji}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:${isMe?'900':'700'};color:${isMe?'#1E5FA5':'#111'}">${isMe?'👉 '+r.nick:r.nick}</div>
        <div style="font-size:11px;color:#9CA3AF">${l.name}</div></div>
      <div style="font-size:15px;font-weight:900;color:${isMe?'#1E5FA5':'#374151'}">${(r.score||0).toLocaleString()}</div>
    </div>`);
  });
  // 내 순위가 50위 밖이면 별도 표시
  if(meIdx<0) {
    parts.push(`<div style="border-top:2px dashed #E5E7EB;padding-top:10px;margin-top:10px">
      <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:#EFF6FF;border:2px solid #1E5FA5">
        <div style="font-size:14px;color:#9CA3AF;min-width:28px;text-align:center">-</div>
        <div style="font-size:22px">${lv(S.lid).emoji}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:900;color:#1E5FA5">👉 ${S.nick} (나)</div>
          <div style="font-size:11px;color:#9CA3AF">순위권 밖</div></div>
        <div style="font-size:15px;font-weight:900;color:#1E5FA5">${S.gScore.toLocaleString()}</div>
      </div>
    </div>`);
  }
  el.innerHTML=parts.join('');
}

// 게임 점수 Firestore 저장
function saveGameScore(score) {
  if(!S.bestScores) S.bestScores={};
  const gid = S.gameId;
  if(!gid) return;
  // 최고 점수 저장
  if(!S.bestScores[gid] || score > S.bestScores[gid]) {
    S.bestScores[gid] = score;
    localStorage.setItem('wd-bs', JSON.stringify(S.bestScores));
  }
  // 게임별 단어 수 저장
  const _wc = (S.gWords||[]).length || 0;
  if(!S.gamePlayCount) S.gamePlayCount={};
  S.gamePlayCount[gid] = (S.gamePlayCount[gid]||0) + _wc;
  const _gt = new Date(Date.now()+9*3600000).toISOString().slice(0,10);
  if(!S.gameDailyCount) S.gameDailyCount={};
  if(!S.gameDailyCount[_gt]) S.gameDailyCount[_gt]={};
  S.gameDailyCount[_gt][gid] = (S.gameDailyCount[_gt][gid]||0) + _wc;
  localStorage.setItem('wd-gpc', JSON.stringify(S.gamePlayCount));
  localStorage.setItem('wd-gdc', JSON.stringify(S.gameDailyCount));
  // Firebase 랭킹 저장 (비동기, 실패해도 무시)
  try {
    const docId=`${S.user?.uid}_${Date.now()}`;
    db && db.collection('rankings').doc(docId).set({uid:S.user?.uid,nick:S.nick,level:S.lid,score,game:gid,date:new Date().toISOString()}).catch(()=>{});
  } catch(e) {}
  // XP 계산
  const xpTable = GAME_XP[gid] || {base:10, perfect:20};
  const words = (S.gWords||[]).length || 1;
  const right = Math.round(score/100);
  const pct = Math.round(right/words*100);
  let xpGain = xpTable.base;
  if(pct===100) xpGain = xpTable.perfect;
  else if(pct>=80) xpGain = Math.round(xpTable.base*1.5);
  const streak = S.streak||0;
  xpGain = Math.round(xpGain * (streak>=30?2.0:streak>=7?1.5:streak>=3?1.2:1.0));
  if(xpGain>0 && typeof earnXP==='function') earnXP(xpGain, '게임 완료');
  if(typeof sv==='function') sv();
}

// ── 일기 공유 ──
function shareDiary(e) {
  if(!e) return;
  // 공유 카드 HTML 생성
  const cardHtml=`<div id="diary-share-card" style="width:360px;background:linear-gradient(160deg,#EFF6FF,#F5F7FF);padding:24px;font-family:-apple-system,sans-serif;border-radius:20px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <div style="font-size:32px">${lv(S.lid).emoji}</div>
      <div><div style="font-size:18px;font-weight:900;color:#1E5FA5">WordDay</div>
      <div style="font-size:12px;color:#9CA3AF">${e.date} ${e.mood}</div></div>
    </div>
    <div style="background:#fff;border-radius:14px;padding:14px;margin-bottom:12px;border:1.5px solid #DBEAFE">
      <div style="font-size:13px;color:#374151;line-height:1.8">${e.kr||''}</div>
    </div>
    ${e.en?`<div style="background:#F0FDF4;border-radius:14px;padding:12px;margin-bottom:12px;border:1.5px solid #86EFAC">
      <div style="font-size:11px;font-weight:700;color:#16A34A;margin-bottom:4px">🌐 English</div>
      <div style="font-size:12px;color:#14532D;line-height:1.8">${e.en}</div>
    </div>`:''}
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:11px;color:#9CA3AF">${S.nick} · ${lv(S.lid).name}</div>
      <div style="font-size:11px;color:#9CA3AF">#WordDay #영어공부</div>
    </div>
  </div>`;

  document.getElementById('mr').innerHTML=`<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()">
    <div style="font-size:16px;font-weight:800;margin-bottom:14px">📤 일기 공유하기</div>
    <div id="share-preview" style="margin-bottom:16px">${cardHtml}</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button onclick="shareToSNS(${JSON.stringify(e).replace(/"/g,'&quot;')})" style="background:#1877F2;color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
        📱 SNS 공유하기
      </button>
      <button onclick="downloadDiaryImg(${JSON.stringify(e).replace(/"/g,'&quot;')})" style="background:#16A34A;color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
        🖼️ JPG로 다운로드
      </button>
      <button onclick="cm()" class="btn bgr">닫기</button>
    </div>
  </div></div>`;
}

function shareToSNS(e) {
  const text=`WordDay 영어 일기 ${e.date} ${e.mood}\n\n${e.kr||''}\n\n${e.en?'[영어]\n'+e.en+'\n\n':''} #WordDay #영어공부 #영어일기`;
  if(navigator.share){
    navigator.share({title:'WordDay 영어 일기',text,url:'https://krudans.github.io/worddy'})
      .then(()=>toast('✅ 공유 완료!'))
      .catch(()=>copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(()=>toast('📋 클립보드에 복사!'))
    .catch(()=>{const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);toast('📋 복사 완료!');});
}

async function downloadDiaryImg(e) {
  // html2canvas로 카드 이미지 저장
  toast('이미지 생성 중... 잠시만요!');
  try {
    // html2canvas 동적 로드
    if(!window.html2canvas){
      await new Promise((res,rej)=>{
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload=res; s.onerror=rej;
        document.head.appendChild(s);
      });
    }
    const card=document.getElementById('diary-share-card');
    if(!card){toast('카드를 찾을 수 없어요');return;}
    const canvas=await html2canvas(card,{scale:2,backgroundColor:'#EFF6FF',useCORS:true});
    const link=document.createElement('a');
    link.download=`wordday-diary-${e.date}.jpg`;
    link.href=canvas.toDataURL('image/jpeg',0.9);
    link.click();
    toast('✅ 이미지 저장 완료!');
  } catch(err) {
    // html2canvas 실패 시 텍스트 공유로 대체
    toast('이미지 생성 실패. 텍스트로 공유할게요');
    shareToSNS(e);
  }
}

// ── 마켓 단어장 추가/미리보기 ──
function previewPack(packId) {
  const pack = WORD_PACKS.find(p=>p.id===packId);
  if(!pack) return;
  const myPacks = new Set(JSON.parse(localStorage.getItem('wd-my-packs')||'[]'));
  const added = myPacks.has(packId);

  document.getElementById('mr').innerHTML=`<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <div style="font-size:40px">${pack.emoji}</div>
      <div>
        <div style="font-size:17px;font-weight:800">${pack.name}</div>
        <div style="font-size:12px;color:#9CA3AF">${pack.cat} · ${pack.words.length}개</div>
      </div>
    </div>
    <div style="font-size:13px;color:#6B7280;margin-bottom:14px;line-height:1.7">${pack.desc}</div>
    <div style="font-size:13px;font-weight:700;color:#374151;margin-bottom:8px">단어 목록</div>
    <div style="max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
      ${(pack.words||[]).slice(0,20).map(w=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#F9FAFB;border-radius:10px">
        <span style="font-size:18px">${w.img||'📝'}</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;font-family:monospace">${w.en}</div>
          <div style="font-size:11px;color:#6B7280">${w.kr}</div>
        </div>
        ${w.ph?`<span style="font-size:10px;color:#9CA3AF">${w.ph}</span>`:''}
      </div>`).join('')}
      ${pack.words.length>20?`<div style="text-align:center;font-size:12px;color:#9CA3AF;padding:8px">외 ${pack.words.length-20}개</div>`:''}
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="${added?"cm();toast('이미 추가된 단어장이에요')":`cm();downloadPack('${packId}')`}" style="flex:2;background:${added?'#9CA3AF':'#1E5FA5'};color:#fff;border:none;border-radius:12px;padding:13px;font-size:14px;font-weight:700;cursor:pointer">${added?'✅ 추가됨':'⬇️ 내 단어장에 추가'}</button>
      <button onclick="cm()" style="flex:1;background:#F3F4F6;color:#6B7280;border:none;border-radius:12px;padding:13px;font-size:14px;font-weight:700;cursor:pointer">닫기</button>
    </div>
  </div></div>`;
}

function showUploadMarket() {
  // 내 단어장 목록
  const allBooks = [
    {name: '내 단어장', words: S.words},
    ...(S.books||[])
  ];
  if(!allBooks.some(b=>(b.words||[]).length>=5)) {
    toast('단어가 5개 이상인 단어장이 있어야 공유할 수 있어요','err');
    return;
  }
  const cats = ['여행','비즈니스','학업','미디어','드라마/영화','취미문화','수능','토익','기타'];

  document.getElementById('mr').innerHTML=`<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()" style="padding:0;max-height:90vh;display:flex;flex-direction:column">
    <div style="padding:16px 20px;border-bottom:1px solid var(--border,#E5E7EB);flex-shrink:0;display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:16px;font-weight:800">📤 내 단어장 공유하기</div>
      <button onclick="cm()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#9CA3AF">×</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px 20px">

      <div style="background:#EFF6FF;border-radius:12px;padding:12px;margin-bottom:16px;font-size:12px;color:#1E5FA5;line-height:1.7">
        📢 공유한 단어장은 관리자 검토 후 마켓에 등록돼요.<br>
        다른 사용자들이 내 단어장을 사용할 수 있어요!
      </div>

      <!-- 단어장 선택 -->
      <div style="margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">📚 공유할 단어장</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${allBooks.filter(b=>(b.words||[]).length>=5).map((b,i)=>`
          <div onclick="selectUploadBook(${i},this)" data-idx="${i}" style="display:flex;align-items:center;justify-content:space-between;padding:12px;border-radius:12px;border:1.5px solid var(--border,#E5E7EB);background:var(--bg-sub,#F9FAFB);cursor:pointer">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:16px;height:16px;border-radius:50%;border:2px solid #D1D5DB;flex-shrink:0" id="upload-radio-${i}"></div>
              <span style="font-size:13px;font-weight:700">${b.name}</span>
            </div>
            <span style="font-size:12px;color:#9CA3AF">${(b.words||[]).length}개</span>
          </div>`).join('')}
        </div>
      </div>

      <!-- 카테고리 -->
      <div style="margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">🏷️ 카테고리</div>
        <select id="upload-cat" style="width:100%;font-size:13px">
          ${cats.map(c=>`<option>${c}</option>`).join('')}
        </select>
      </div>

      <!-- 설명 -->
      <div style="margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">📝 설명</div>
        <textarea id="upload-desc" placeholder="단어장에 대한 간단한 설명을 적어주세요" style="width:100%;min-height:70px;resize:none;font-size:13px"></textarea>
      </div>

      <!-- 공개 여부 -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg-sub,#F9FAFB);border-radius:12px;margin-bottom:4px">
        <div>
          <div style="font-size:13px;font-weight:700">🌍 전체 공개</div>
          <div style="font-size:11px;color:#9CA3AF;margin-top:2px">모든 사용자에게 공개돼요</div>
        </div>
        <button onclick="this.classList.toggle('on');this.style.background=this.classList.contains('on')?'#1E5FA5':'#E5E7EB'" id="upload-public" class="toggle on" style="background:#1E5FA5"><div class="tk"></div></button>
      </div>
    </div>

    <div style="padding:12px 20px;border-top:1px solid var(--border,#E5E7EB);flex-shrink:0">
      <button onclick="submitUploadMarket()" style="width:100%;background:linear-gradient(135deg,#7C3AED,#A855F7);color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:800;cursor:pointer">
        📤 마켓에 공유하기
      </button>
    </div>
  </div></div>`;

  // 첫 번째 단어장 기본 선택
  window._uploadBookIdx = 0;
  const firstRadio = document.getElementById('upload-radio-0');
  if(firstRadio) { firstRadio.style.background='#7C3AED'; firstRadio.style.borderColor='#7C3AED'; }
  const firstDiv = document.querySelector('[data-idx="0"]');
  if(firstDiv) { firstDiv.style.border='1.5px solid #7C3AED'; firstDiv.style.background='#F5F3FF'; }
}

function selectUploadBook(idx, el) {
  window._uploadBookIdx = idx;
  document.querySelectorAll('[data-idx]').forEach(div=>{
    div.style.border='1.5px solid var(--border,#E5E7EB)';
    div.style.background='var(--bg-sub,#F9FAFB)';
    const radio = div.querySelector('[id^="upload-radio-"]');
    if(radio){ radio.style.background=''; radio.style.borderColor='#D1D5DB'; }
  });
  if(el) {
    el.style.border='1.5px solid #7C3AED';
    el.style.background='#F5F3FF';
    const radio = el.querySelector('[id^="upload-radio-"]');
    if(radio){ radio.style.background='#7C3AED'; radio.style.borderColor='#7C3AED'; }
  }
}

async function submitUploadMarket() {
  const allBooks = [
    {name:'내 단어장', words: S.words},
    ...(S.books||[])
  ].filter(b=>(b.words||[]).length>=5);

  const idx = window._uploadBookIdx||0;
  const book = allBooks[idx];
  if(!book){toast('단어장을 선택해주세요','err');return;}

  const cat = document.getElementById('upload-cat')?.value||'기타';
  const desc = document.getElementById('upload-desc')?.value.trim()||'';
  const isPublic = document.getElementById('upload-public')?.classList.contains('on');

  if(!desc){toast('설명을 입력해주세요','err');return;}

  try {
    // Firebase Firestore에 업로드
    if(typeof db !== 'undefined') {
      await db.collection('market_packs').add({
        name: book.name,
        cat,
        desc,
        isPublic,
        words: book.words,
        count: book.words.length,
        submittedBy: firebase.auth().currentUser?.email || '익명',
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pending', // pending → approved → rejected
        emoji: '📚',
        isPopular: false,
      });
      cm();
      document.getElementById('mr').innerHTML=`<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()" style="text-align:center;padding:30px 20px">
        <div style="font-size:60px;margin-bottom:16px">🎉</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:8px">공유 신청 완료!</div>
        <div style="font-size:13px;color:#6B7280;line-height:1.7;margin-bottom:20px">
          "<strong>${book.name}</strong>" 단어장이 제출됐어요.<br>
          관리자 검토 후 마켓에 등록될 예정이에요 😊
        </div>
        <button onclick="cm()" style="background:#7C3AED;color:#fff;border:none;border-radius:12px;padding:12px 30px;font-size:14px;font-weight:700;cursor:pointer">확인</button>
      </div></div>`;
    } else {
      // Firebase 없으면 JSON으로 내보내기
      _exportUploadJSON(book, cat, desc);
    }
  } catch(e) {
    // Firebase 실패 시 JSON 내보내기로 폴백
    _exportUploadJSON(book, cat, desc);
  }
}

function _exportUploadJSON(book, cat, desc) {
  const data = {
    name: book.name,
    cat, desc,
    emoji: '📚',
    count: book.words.length,
    words: book.words,
    submittedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${book.name}_마켓공유.json`;
  a.click();
  cm();
  toast(`✅ JSON 파일로 내보냈어요! 관리자에게 전달해주세요 😊`);
}



// ── 나비 도감 데이터 ──
// (구버전 cabbage_white 기반 데이터는 BUTTERFLY_LIST(index.html, b01~)로 통합되어 제거됨)
// 외부에서 BUTTERFLY_DATA를 참조하더라도 호출 시점에 BUTTERFLY_LIST를 반환하도록 getter 정의.
Object.defineProperty(window, 'BUTTERFLY_DATA', {
  get: function(){ return (typeof BUTTERFLY_LIST !== 'undefined' && Array.isArray(BUTTERFLY_LIST)) ? BUTTERFLY_LIST : []; },
  configurable: true
});

// ── 나비 도감 모달 (BUTTERFLY_LIST 기반) ──
// BUTTERFLY_LIST(index.html에 정의된 b01~b30 + Firebase 동적 추가분)을 사용합니다.
// getButterflyCharSVG(id, size, owned)는 index.html에 정의되어 있으며
// imageUrl(JPG/PNG) > 커스텀 svgCode > 내장 SVG 순으로 렌더링합니다.

// 레어도 문자열(⭐~⭐⭐⭐⭐⭐)을 숫자로 변환
function _bfRareToNum(rare) {
  if (typeof rare === 'number') return Math.max(1, Math.min(6, rare));
  if (typeof rare !== 'string') return 1;
  const n = (rare.match(/⭐/g) || []).length;
  return Math.max(1, Math.min(6, n || 1));
}

// 등급 레이블: 1=일반(⭐), 2=일반(⭐⭐), 3=고급(⭐⭐⭐), 4=희귀(⭐⭐⭐⭐), 5=전설(⭐⭐⭐⭐⭐), 6=신화(그이상)
// 필터용 단계: 0=전체, 1=일반(1~2개), 2=고급(3개), 3=희귀(4개), 4=전설(5개+)
function _bfRareGrade(rare) {
  const n = _bfRareToNum(rare);
  if (n <= 2) return 1; // 일반
  if (n === 3) return 2; // 고급
  if (n === 4) return 3; // 희귀
  if (n === 5) return 4; // 전설
  return 5;              // 신화
}

function _bfList() {
  return (typeof BUTTERFLY_LIST !== 'undefined' && Array.isArray(BUTTERFLY_LIST)) ? BUTTERFLY_LIST : [];
}

function showButterflyDogam() {
  const mr = document.getElementById('mr');
  if(!mr) return;
  const selR = window._dogamFilter||0; // 0=전체, 1~5=레어도
  const list = _bfList();
  const filtered = selR===0 ? list : list.filter(b => _bfRareGrade(b.rare) === selR);
  const rNames  = ['전체','일반','고급','희귀','전설'];
  const rColors = ['#374151','#9CA3AF','#3B82F6','#8B5CF6','#EF4444'];
  const counts  = [list.length, 1,2,3,4].map((_,i)=> i===0 ? list.length : list.filter(b=>_bfRareGrade(b.rare)===i).length);
  // 사용자가 가진 나비 (있으면 표시용)
  const owned = new Set((typeof S !== 'undefined' && S.myButterflies) ? S.myButterflies : (S && S.butterflies ? S.butterflies : []));

  mr.innerHTML = `<div class="mbg" onclick="cm()" style="align-items:flex-start;padding-top:0"><div onclick="event.stopPropagation()" style="background:#fff;width:100%;max-width:600px;height:100vh;overflow-y:auto;display:flex;flex-direction:column">
    <div style="position:sticky;top:0;background:#fff;border-bottom:1px solid #E5E7EB;padding:14px 16px;z-index:10">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div>
          <div style="font-size:18px;font-weight:900;color:#111">🦋 나비 도감</div>
          <div style="font-size:11px;color:#9CA3AF;margin-top:1px">지구의 나비를 기억해 주세요</div>
        </div>
        <button onclick="cm()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#9CA3AF">✕</button>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${[0,1,2,3,4].map(r=>`<button onclick="window._dogamFilter=${r};showButterflyDogam()" style="padding:4px 10px;border-radius:14px;border:1.5px solid ${(selR===r)?rColors[r]:'#E5E7EB'};background:${(selR===r)?rColors[r]:'#fff'};color:${(selR===r)?'#fff':rColors[r]};font-size:11px;font-weight:700;cursor:pointer">${rNames[r]} (${counts[r]})</button>`).join('')}
      </div>
    </div>
    <div style="padding:12px;display:flex;flex-direction:column;gap:10px">
      ${filtered.map(b=>{
        const rNum = _bfRareToNum(b.rare);
        const isOwned = owned.has(b.id);
        let svgHtml;
        if(typeof getButterflyCharSVG === 'function') {
          svgHtml = getButterflyCharSVG(b.id, 48, isOwned);
        } else if(b.svgCode) {
          const fixed = _fixSvgRatio(b.svgCode, 48);
          svgHtml = `<div style="display:flex;align-items:center;justify-content:center;width:48px;height:48px">${fixed}</div>`;
        } else {
          svgHtml = '<span style="font-size:28px">🦋</span>';
        }
        const desc = (b.feature || b.desc || b.story || '').slice(0, 60);
        return `<div onclick="showButterflyDetail('${b.id}')" style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:12px">
          <div style="width:52px;height:52px;border-radius:12px;background:#F9FAFB;display:flex;align-items:center;justify-content:center;flex-shrink:0">${svgHtml}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
              <span style="font-size:14px;font-weight:800;color:#111">${b.name||'-'}</span>
              <span style="font-size:10px;padding:2px 6px;border-radius:8px;background:${(rColors[rNum]||'#374151')}22;color:${rColors[rNum]||'#374151'};font-weight:700">${b.rare||'⭐'}</span>
              ${b.score!=null?`<span style="font-size:10px;color:#9CA3AF;font-weight:700">${b.score}점</span>`:''}
            </div>
            <div style="font-size:11px;color:#9CA3AF;font-style:italic;margin-bottom:3px">${b.sci||''}</div>
            <div style="font-size:11px;color:#374151;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${desc}${desc.length>=60?'...':''}</div>
          </div>
          <span style="color:#9CA3AF;font-size:16px;flex-shrink:0">›</span>
        </div>`;
      }).join('')}
    </div>
    <div style="margin:12px;padding:16px;background:#F0FDF4;border-radius:14px;border-left:4px solid #16A34A">
      <div style="font-size:12px;font-weight:700;color:#15803D;margin-bottom:4px">🌿 나비를 지키는 방법</div>
      <div style="font-size:11px;color:#166534;line-height:1.6">농약 사용 줄이기 · 꽃 피는 식물 심기 · 팜유 프리 제품 선택 · 열대우림 보호 단체 후원</div>
    </div>
  </div></div>`;
}

function showButterflyDetail(id) {
  const b = _bfList().find(x => x.id === id);
  if(!b) return;
  const rNum = _bfRareToNum(b.rare);
  const rColors = ['#374151','#9CA3AF','#3B82F6','#8B5CF6','#EF4444','#F59E0B'];
  const rColor = rColors[rNum] || '#374151';
  const isOwned = (typeof S !== 'undefined' && (S.myButterflies || S.butterflies)) ? (S.myButterflies || S.butterflies || []).includes(b.id) : true;
  // getButterflyCharSVG 우선, 없으면 svgCode 직접 비율 보정 렌더링
  let svgHtml;
  if(typeof getButterflyCharSVG === 'function') {
    svgHtml = getButterflyCharSVG(b.id, 200, isOwned);
  } else if(b.svgCode) {
    const fixed = _fixSvgRatio(b.svgCode, 200);
    svgHtml = `<div style="display:flex;align-items:center;justify-content:center;width:200px;height:200px">${fixed}</div>`;
  } else if(b.imageUrl) {
    svgHtml = `<img src="${b.imageUrl}" style="width:200px;height:200px;object-fit:contain">`;
  } else {
    svgHtml = '<span style="font-size:80px">🦋</span>';
  }
  document.getElementById('mr').innerHTML = `<div class="mbg" onclick="showButterflyDogam()" style="align-items:flex-start;padding-top:0"><div onclick="event.stopPropagation()" style="background:#fff;width:100%;max-width:600px;height:100vh;overflow-y:auto">
    <div style="position:sticky;top:0;background:#fff;border-bottom:1px solid #E5E7EB;padding:12px 16px;display:flex;align-items:center;gap:10px">
      <button onclick="showButterflyDogam()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#374151">‹</button>
      <div style="flex:1;font-size:16px;font-weight:800;color:#111">${b.name||'-'}</div>
      <button onclick="cm()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#9CA3AF">✕</button>
    </div>
    <div style="padding:20px">
      <div style="background:#ffffff;border-radius:20px;padding:30px;text-align:center;margin-bottom:16px;border:1px solid #E5E7EB;display:flex;align-items:center;justify-content:center;min-height:200px">
        ${svgHtml}
      </div>
      <div style="margin-bottom:16px">
        <div style="font-size:20px;font-weight:900;color:#111;margin-bottom:2px">${b.name||'-'}</div>
        ${b.enName||b.en?`<div style="font-size:12px;color:#6B7280;margin-bottom:2px">${b.enName||b.en}</div>`:''}
        <div style="font-size:13px;color:#9CA3AF;font-style:italic;margin-bottom:6px">${b.sci||''}</div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span style="display:inline-block;padding:3px 10px;border-radius:10px;background:${rColor}22;color:${rColor};font-size:11px;font-weight:700">${b.rare||'⭐'}</span>
          ${b.score!=null?`<span style="display:inline-block;padding:3px 10px;border-radius:10px;background:#F3F4F6;color:#374151;font-size:11px;font-weight:700">${b.score}점</span>`:''}
          ${b.status?`<span style="display:inline-block;padding:3px 10px;border-radius:10px;background:#FEF3C7;color:#92400E;font-size:11px;font-weight:700">${b.status}</span>`:''}
        </div>
      </div>
      ${b.feature?`<div style="background:#F9FAFB;border-radius:12px;padding:14px;margin-bottom:12px">
        <div style="font-size:11px;font-weight:700;color:#9CA3AF;margin-bottom:6px">특징</div>
        <div style="font-size:13px;color:#111;line-height:1.7;white-space:pre-wrap">${b.feature}</div>
      </div>`:''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        ${b.habitat?`<div style="background:#F9FAFB;border-radius:12px;padding:12px">
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:4px">서식지</div>
          <div style="font-size:12px;color:#111;font-weight:600;line-height:1.4">${b.habitat}</div>
        </div>`:''}
        ${b.season?`<div style="background:#F9FAFB;border-radius:12px;padding:12px">
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:4px">활동 시기</div>
          <div style="font-size:12px;color:#111;font-weight:600">${b.season}</div>
        </div>`:''}
        ${b.size?`<div style="background:#F9FAFB;border-radius:12px;padding:12px">
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:4px">크기/외형</div>
          <div style="font-size:12px;color:#111;font-weight:600">${b.size}</div>
        </div>`:''}
        ${b.protect?`<div style="background:${rColor}11;border-radius:12px;padding:12px;border-left:3px solid ${rColor}">
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:4px">보호 등급</div>
          <div style="font-size:12px;color:${rColor};font-weight:700">${b.protect}</div>
        </div>`:''}
      </div>
      ${b.threat?`<div style="background:#FEF2F2;border-radius:12px;padding:14px;margin-bottom:12px;border-left:4px solid #EF4444">
        <div style="font-size:11px;font-weight:700;color:#DC2626;margin-bottom:6px">⚠️ 위협 요인</div>
        <div style="font-size:13px;color:#7F1D1D;line-height:1.6;white-space:pre-wrap">${b.threat}</div>
      </div>`:''}
      ${b.story?`<div style="background:#FFFBEB;border-radius:12px;padding:14px;margin-bottom:12px;border-left:4px solid #F59E0B">
        <div style="font-size:11px;font-weight:700;color:#92400E;margin-bottom:6px">📖 에피소드</div>
        <div style="font-size:13px;color:#451A03;line-height:1.8;white-space:pre-wrap">${b.story}</div>
      </div>`:''}
      ${b.msg?`<div style="background:#F0FDF4;border-radius:12px;padding:14px;margin-bottom:12px;border-left:4px solid #16A34A">
        <div style="font-size:11px;font-weight:700;color:#15803D;margin-bottom:6px">💚 환경 메시지</div>
        <div style="font-size:13px;color:#14532D;line-height:1.7;font-style:italic;white-space:pre-wrap">"${b.msg}"</div>
      </div>`:''}
      <div style="display:flex;gap:8px;margin-top:4px">
        <button onclick="saveButterflyCard('${b.id}')" style="flex:1;padding:13px;background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;border:none;border-radius:14px;font-size:14px;font-weight:800;cursor:pointer">🖼️ 이미지 저장</button>
        <button onclick="showButterflyDogam()" style="flex:1;padding:13px;background:#F5F3FF;color:#7C3AED;border:1.5px solid #7C3AED;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer">← 도감으로</button>
      </div>
    </div>
  </div></div>`;
}

// 하위 호환용 (옛 코드가 호출해도 깨지지 않게)
function getButterflyMiniSVG(b) {
  if (b && b.id && typeof getButterflyCharSVG === 'function') return getButterflyCharSVG(b.id, 48, true);
  return '<span style="font-size:28px">🦋</span>';
}
function getButterflyDetailSVG(b) {
  if (b && b.id && typeof getButterflyCharSVG === 'function') return getButterflyCharSVG(b.id, 180, true);
  return '<span style="font-size:80px">🦋</span>';
}

// ── 나비 이미지 저장 (미리보기 포함) ──
async function saveButterflyCard(bId) {
  const b = _bfList().find(x=>x.id===bId);
  if(!b) return;

  // 미리보기 모달 생성
  const mr = document.getElementById('mr');
  if(!mr) return;

  const rColors={0:'#374151',1:'#9CA3AF',2:'#3B82F6',3:'#8B5CF6',4:'#F59E0B',5:'#EF4444'};
  const rNames={0:'전체',1:'일반',2:'고급',3:'희귀',4:'전설'};
  const svgHtml = typeof getButterflyCharSVG==='function' ? getButterflyCharSVG(bId,100,true) : '';

  // 미리보기 카드 HTML
  const cardHtml = `<div id="bf-save-card" style="background:linear-gradient(135deg,#1A1A2E,#1A3A2A);border-radius:24px;padding:24px;width:300px;text-align:center;color:#fff;font-family:sans-serif">
    <div style="font-size:10px;letter-spacing:3px;opacity:.6;margin-bottom:16px">🦋 BUTTERFLY WORD</div>
    <div style="margin:0 auto 16px;display:flex;justify-content:center">${svgHtml}</div>
    <div style="font-size:22px;font-weight:900;margin-bottom:4px">${b.name}</div>
    <div style="font-size:12px;font-style:italic;opacity:.7;margin-bottom:12px">${b.sci||''}</div>
    <div style="display:inline-block;background:${'#374151'||'#9CA3AF'};color:#fff;border-radius:20px;padding:4px 14px;font-size:11px;font-weight:700;margin-bottom:14px">${(b.rare||b.en||'일반')||'일반'}</div>
    <div style="font-size:12px;opacity:.8;line-height:1.6;margin-bottom:14px">${(b.story||'').slice(0,60)}...</div>
    <div style="font-size:10px;opacity:.4;margin-top:8px">#나비보호 #ButterflyWord</div>
  </div>`;

  mr.innerHTML = `<div class="mbg" onclick="cm()" style="z-index:9999"><div class="modal" onclick="event.stopPropagation()" style="padding:0;overflow:hidden;max-width:360px">
    <div style="padding:16px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:15px;font-weight:800">🖼️ 이미지 저장 미리보기</div>
      <button onclick="cm()" style="background:none;border:none;font-size:22px;cursor:pointer">✕</button>
    </div>
    <div style="padding:20px;display:flex;flex-direction:column;align-items:center;gap:16px;background:#F9FAFB">
      ${cardHtml}
    </div>
    <div style="padding:14px 16px;border-top:1px solid #E5E7EB;display:flex;gap:8px">
      <button onclick="cm()" style="flex:1;padding:12px;background:#F3F4F6;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;color:#374151">취소</button>
      <button onclick="downloadBFCard('bf-save-card','${b.name}')" style="flex:2;padding:12px;background:linear-gradient(135deg,#7C3AED,#5B21B6);border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;color:#fff">📥 저장하기</button>
    </div>
  </div></div>`;
}

async function downloadBFCard(cardId, name) {
  const card = document.getElementById(cardId);
  if(!card) { toast('카드를 찾을 수 없어요','err'); return; }
  try {
    if(!window.html2canvas) {
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(s);
      await new Promise(r=>s.onload=r);
    }
    const canvas = await html2canvas(card, {scale:2, backgroundColor:null, useCORS:true});
    const link = document.createElement('a');
    link.download = 'butterfly-'+name+'.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    cm();
    toast('✅ 이미지 저장 완료!','ok');
  } catch(e) {
    console.error('이미지 저장 실패:',e);
    toast('이미지 저장 실패: '+e.message,'err');
  }
}
