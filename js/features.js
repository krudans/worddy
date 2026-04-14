// ── 마켓 탭 ──
function rMarket() {
  const cats = ['전체','여행','비즈니스','학업','미디어','취미문화'];
  const activeCat = window._mCat || '전체';
  const filtered = WORD_PACKS.filter(p => activeCat==='전체' || p.cat===activeCat);
  const parts = [];
  parts.push('<div style="display:flex;flex-direction:column;height:100%">');
  // 카테고리 탭
  parts.push('<div style="background:#fff;border-bottom:1.5px solid #E5E7EB;padding:8px 12px;display:flex;gap:6px;overflow-x:auto;flex-shrink:0">');
  parts.push('<style>.mcat::-webkit-scrollbar{display:none}</style>');
  cats.forEach(c=>{
    const on=c===activeCat;
    parts.push(`<button onclick="window._mCat='${c}';go('market')" style="padding:6px 14px;border-radius:20px;border:none;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;background:${on?'#1E5FA5':'#F3F4F6'};color:${on?'#fff':'#6B7280'}">${c}</button>`);
  });
  parts.push('</div>');
  parts.push('<div style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px">');
  // 내 단어장 업로드 카드
  parts.push(`<div onclick="showUploadMarket()" style="background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:18px;padding:16px;cursor:pointer;display:flex;align-items:center;gap:14px">
    <div style="font-size:36px">📤</div>
    <div><div style="font-size:14px;font-weight:800;color:#fff">내 단어장 마켓에 올리기</div>
    <div style="font-size:12px;color:rgba(255,255,255,.7)">내가 만든 단어장을 공유하고 리워드 받기</div></div>
  </div>`);
  // 추천 팩
  MARKET_SUGGESTIONS.forEach(s=>{
    if(activeCat!=='전체'&&s.cat!==activeCat) return;
    parts.push(`<div style="background:linear-gradient(135deg,#F9FAFB,#F3F4F6);border:1.5px dashed #D1D5DB;border-radius:16px;padding:14px;display:flex;align-items:center;gap:12px">
      <div style="font-size:32px">${s.emoji}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:700;color:#374151">${s.name}</div>
      <div style="font-size:11px;color:#9CA3AF">${s.desc}</div></div>
      <span style="font-size:10px;background:#FFF8E1;color:#E65100;padding:3px 8px;border-radius:20px;font-weight:700">준비중</span>
    </div>`);
  });
  // 단어장 팩
  filtered.forEach(p=>{
    parts.push(`<div style="background:#fff;border-radius:18px;border:1.5px solid #E5E7EB;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1E5FA5,#2563EB);padding:14px 16px;display:flex;align-items:center;gap:10px">
        <div style="font-size:32px">${p.emoji}</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:800;color:#fff">${p.name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.7)">${p.cat} · ${p.count}단어</div></div>
        <span style="font-size:10px;background:rgba(255,255,255,.2);color:#fff;padding:3px 8px;border-radius:20px;font-weight:700">${p.basis.slice(0,12)}...</span>
      </div>
      <div style="padding:12px 16px">
        <div style="font-size:12px;color:#6B7280;margin-bottom:10px">${p.desc}</div>
        <div style="font-size:11px;color:#9CA3AF;margin-bottom:10px">선정기준: ${p.basis}</div>
        <div style="display:flex;gap-6px;flex-wrap:wrap;margin-bottom:10px">${p.words.slice(0,5).map(w=>`<span style="display:inline-block;padding:3px 8px;background:#EFF6FF;color:#1E5FA5;border-radius:20px;font-size:11px;font-weight:700;font-family:monospace;margin:2px">${w.en}</span>`).join('')}<span style="font-size:11px;color:#9CA3AF;padding:3px">...</span></div>
        <div style="display:flex;gap:8px">
          <button onclick="previewPack('${p.id}')" style="flex:1;background:#F3F4F6;border:none;border-radius:10px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;color:#374151">👀 미리보기</button>
          <button onclick="downloadPack('${p.id}')" style="flex:2;background:#1E5FA5;border:none;border-radius:10px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;color:#fff">⬇️ 내 단어장에 추가</button>
        </div>
      </div>
    </div>`);
  });
  parts.push('</div></div>');
  return parts.join('');
}

function previewPack(id) {
  const p = WORD_PACKS.find(x=>x.id===id); if(!p) return;
  document.getElementById('mr').innerHTML=`<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <div style="font-size:32px">${p.emoji}</div>
      <div><div style="font-size:16px;font-weight:800">${p.name}</div>
      <div style="font-size:12px;color:#9CA3AF">${p.count}단어 · ${p.cat}</div></div>
    </div>
    <div style="font-size:11px;color:#6B7280;background:#F9FAFB;border-radius:10px;padding:10px;margin-bottom:12px">📌 선정기준: ${p.basis}</div>
    <div style="max-height:300px;overflow-y:auto">
      ${p.words.map(w=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F3F4F6">
        <span style="font-size:20px">${w.img||'📝'}</span>
        <span style="font-family:monospace;font-weight:700;color:#1E5FA5;min-width:80px">${w.en}</span>
        <span style="color:#374151">${w.kr}</span>
        <span style="font-size:11px;color:#9CA3AF">${w.ph||''}</span>
      </div>`).join('')}
      <div style="text-align:center;padding:10px;font-size:12px;color:#9CA3AF">... 외 ${p.count-p.words.length}개</div>
    </div>
    <button onclick="downloadPack('${p.id}');cm()" class="btn bb" style="margin-top:12px">⬇️ 내 단어장에 추가</button>
    <button onclick="cm()" class="btn bgr" style="margin-top:8px">닫기</button>
  </div></div>`;
}

function downloadPack(id) {
  const p = WORD_PACKS.find(x=>x.id===id); if(!p) return;
  let added=0;
  p.words.forEach(w=>{
    if(!S.words.find(x=>x.en===w.en)){S.words.push({...w,meanings:[w.kr],tip:w.en+' = '+w.kr});added++;}
  });
  sv(); SFX.play('correct'); vib([50,0,50]);
  toast(`✅ ${added}개 단어 추가! (이미 있는 단어 제외)`);
  cm();
}

function showUploadMarket() {
  document.getElementById('mr').innerHTML=`<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()">
    <div style="font-size:17px;font-weight:800;margin-bottom:6px">📤 단어장 마켓에 올리기</div>
    <div style="font-size:12px;color:#9CA3AF;margin-bottom:14px">내 단어장을 공유하고 다른 사람들과 함께 공부해요!</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
      <input id="up-title" placeholder="단어장 제목 *">
      <input id="up-desc" placeholder="설명">
      <select id="up-cat">
        <option>여행</option><option>비즈니스</option><option>학업</option><option>미디어</option><option>취미문화</option><option>기타</option>
      </select>
      <div style="background:#F9FAFB;border-radius:10px;padding:12px">
        <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:6px">공유할 단어 선택</div>
        <div style="font-size:12px;color:#9CA3AF">현재 단어장: ${S.words.length}개</div>
        <label style="display:flex;align-items:center;gap:8px;margin-top:8px;cursor:pointer">
          <input type="checkbox" id="up-all" checked style="width:16px;height:16px">
          <span style="font-size:13px">전체 선택 (${S.words.length}개)</span>
        </label>
      </div>
    </div>
    <div style="background:#FFF8E1;border-radius:10px;padding:10px;margin-bottom:14px;font-size:12px;color:#E65100">
      🎁 업로드 시 XP +50 지급! 다운로드될 때마다 추가 리워드 예정
    </div>
    <button onclick="uploadToMarket()" class="btn" style="background:#7C3AED;color:#fff">📤 마켓에 올리기</button>
    <button onclick="cm()" class="btn bgr" style="margin-top:8px">닫기</button>
  </div></div>`;
}

async function uploadToMarket() {
  const title=document.getElementById('up-title')?.value.trim();
  if(!title){toast('제목을 입력해주세요');return;}
  const cat=document.getElementById('up-cat')?.value;
  const desc=document.getElementById('up-desc')?.value.trim();
  try {
    await db.collection('market').add({
      title, cat, desc,
      words: S.words,
      author: S.nick,
      authorLevel: S.lid,
      uid: S.user?.uid,
      downloads: 0,
      rating: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    addXP(50); sv();
    toast('✅ 마켓 업로드 완료! XP +50');
    cm();
  } catch(e) {
    toast('업로드 실패: Firestore 설정 확인');
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
async function saveGameScore(score) {
  try {
    const docId=`${S.user?.uid}_${Date.now()}`;
    await db.collection('rankings').doc(docId).set({
      uid: S.user?.uid,
      nick: S.nick,
      level: S.lid,
      emoji: lv(S.lid).emoji,
      score,
      game: S.gameId,
      date: new Date().toISOString(),
      period_today: new Date().toISOString().slice(0,10),
    });
  } catch(e) {}
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
