// ── 마켓 탭 ──


function removePack(packId) {
  const _allPacks = (typeof S!=='undefined' && S._marketPacks) || (typeof WORD_PACKS!=='undefined' ? WORD_PACKS : []);
  const pack = _allPacks.find(p=>p.id===packId);
  const packName = pack?.name || packId;

  if(!confirm('"'+packName+'" 팩을 마켓에서 제거할까요?')) return;

  if(typeof S !== 'undefined') {
    // S._ownedPacks에서 즉시 제거
    S._ownedPacks = (S._ownedPacks||[]).filter(id => id !== packId);

    // Firebase users 컬렉션에 즉시 반영 (sv() throttle 우회)
    if(typeof db !== 'undefined' && S.user && S.user.uid) {
      db.collection('users').doc(S.user.uid).update({
        _ownedPacks: S._ownedPacks
      }).catch(()=>{
        // update 실패 시 set으로 재시도
        db.collection('users').doc(S.user.uid).set(
          {_ownedPacks: S._ownedPacks}, {merge:true}
        ).catch(()=>{});
      });
    }
    sv();
  }

  toast('"'+packName+'" 제거 완료');
  if(typeof go !== 'undefined') go();
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



// ── 나비 도감 데이터 (30종) ──
const BUTTERFLY_DATA = [
  {id:'cabbage_white', ko:'배추흰나비', en:'Cabbage White', sci:'Pieris rapae', r:1, color:'#F5F5F5',
   habitat:'한국 전역 농경지, 도시 공원', season:'3월~11월', size:'45~65mm',
   desc:'우리 주변에서 가장 흔히 볼 수 있는 나비로, 앞날개에 검은 점이 1~2개 있다. 배추, 무 등 십자화과 식물에 알을 낳으며 애벌레가 잎을 갉아먹어 농업 해충으로 알려져 있다. 하지만 성충은 꽃의 중요한 수분 매개자 역할을 한다.',
   protect:'LC (최소 관심)', threat:'농약 사용으로 개체수 감소 중',
   msg:'흔하다고 소중하지 않은 게 아닙니다. 농약을 줄여야 이 작은 생명을 지킬 수 있어요.'},

  {id:'clouded_yellow', ko:'노랑나비', en:'Clouded Yellow', sci:'Colias erate', r:1, color:'#FFD600',
   habitat:'한국 전역 초원, 들판', season:'4월~10월', size:'40~55mm',
   desc:'밝은 노란색 날개가 특징인 나비로, 수컷은 선명한 노란색이고 암컷은 흰색 또는 노란색이다. 클로버, 토끼풀 등 콩과 식물을 먹이식물로 삼는다. 가을에는 따뜻한 남쪽으로 이동하는 장거리 이주 능력을 가지고 있다.',
   protect:'LC', threat:'초원 감소, 제초제 사용',
   msg:'노란 날개가 사라지는 날, 우리의 들판도 색을 잃습니다.'},

  {id:'common_blue', ko:'부전나비', en:'Common Blue', sci:'Polyommatus icarus', r:1, color:'#1565C0',
   habitat:'한국 전역 풀밭, 산기슭', season:'5월~9월', size:'25~35mm',
   desc:'수컷은 파란색, 암컷은 갈색으로 성별에 따라 색이 다른 소형 나비다. 날개 뒷면에 검은 점과 주황색 무늬가 아름답게 배열되어 있다. 트레포일, 개자리 등을 먹이식물로 삼으며 개미와 공생 관계를 맺기도 한다.',
   protect:'LC', threat:'서식지 감소',
   msg:'작은 파란 점 같은 이 나비가 사라지면 생태계의 균형도 흔들립니다.'},

  {id:'green_veined', ko:'풀흰나비', en:'Green-veined White', sci:'Pieris napi', r:1, color:'#E8F5E9',
   habitat:'산림 가장자리, 계곡', season:'4월~8월', size:'40~55mm',
   desc:'날개 뒷면에 초록빛 맥 무늬가 뚜렷하게 나타나는 것이 특징이다. 배추흰나비와 비슷하지만 더 습한 환경을 선호하며 산지에서 주로 발견된다. 너도냉이 등 습지 주변 십자화과 식물을 먹이로 삼는다.',
   protect:'LC', threat:'산림 개발',
   msg:'숲 속 계곡의 파수꾼. 깨끗한 자연이 있어야 살 수 있는 나비입니다.'},

  {id:'large_white', ko:'큰줄흰나비', en:'Large White', sci:'Pieris brassicae', r:1, color:'#FAFAFA',
   habitat:'농경지, 정원', season:'4월~10월', size:'55~70mm',
   desc:'배추흰나비보다 크고 앞날개 끝이 더 검다. 유럽 원산으로 전 세계에 분포하며 한국에서도 볼 수 있다. 무리 지어 이동하는 습성이 있으며 집단으로 농작물에 피해를 주기도 하지만 생태계에서 중요한 역할을 한다.',
   protect:'LC', threat:'살충제 남용',
   msg:'농사와 자연이 공존할 수 있는 방법을 찾아야 합니다.'},

  {id:'swallowtail', ko:'호랑나비', en:'Swallowtail', sci:'Papilio xuthus', r:2, color:'#FFD600',
   habitat:'한국 전역, 특히 산지와 도시', season:'4월~9월', size:'70~95mm',
   desc:'한국에서 가장 아름다운 나비 중 하나로 노란색과 검은색 줄무늬가 호랑이를 연상시킨다. 뒷날개에 파란 점과 붉은 점이 있어 매우 화려하다. 탱자나무, 귤나무, 산초나무 등 운향과 식물이 먹이식물이다. 민화와 전통 예술에도 자주 등장한다.',
   protect:'LC', threat:'탱자나무 감소, 농약',
   msg:'우리 전통 속에 살아있는 호랑나비. 탱자나무 울타리가 사라지면 함께 사라집니다.'},

  {id:'scarce_swallowtail', ko:'긴꼬리제비나비', en:'Scarce Swallowtail', sci:'Iphiclides podalirius', r:2, color:'#004D40',
   habitat:'한국 남부 산지', season:'5월~8월', size:'70~85mm',
   desc:'짙은 초록색 바탕에 흰색 줄무늬가 아름다운 나비로 뒷날개에 긴 꼬리 모양의 돌기가 있다. 주로 산지 계곡 주변에서 발견되며 물을 마시는 습성이 있다. 황벽나무, 쥐방울덩굴 등을 먹이식물로 삼는다.',
   protect:'LC', threat:'산지 개발, 기후변화',
   msg:'산 깊은 곳에서만 만날 수 있는 이 나비가 사라진다면 그 산은 이미 병든 것입니다.'},

  {id:'alpine_swallowtail', ko:'산제비나비', en:'Alpine Black Swallowtail', sci:'Papilio maackii', r:2, color:'#006064',
   habitat:'한국 산지, 고지대', season:'5월~8월', size:'80~100mm',
   desc:'청록색 광택이 도는 날개가 매우 아름다운 대형 나비다. 산 정상 부근에서 영역을 지키는 습성이 있으며 활공 비행이 우아하다. 황벽나무를 주 먹이식물로 삼으며 수컷들이 산 정상에 모이는 hill-topping 행동을 한다.',
   protect:'LC', threat:'고산 생태계 파괴, 온난화',
   msg:'산 정상을 지키는 파수꾼. 기후변화로 갈 곳을 잃어가고 있습니다.'},

  {id:'southern_swallowtail', ko:'남방제비나비', en:'Southern Swallowtail', sci:'Papilio memnon', r:2, color:'#311B92',
   habitat:'제주도, 남해안 섬 지역', season:'5월~10월', size:'90~130mm',
   desc:'한국에서 볼 수 있는 가장 큰 나비 중 하나로 보라빛이 도는 검은 날개가 특징이다. 암컷은 흰색, 빨간색, 파란색이 혼합된 화려한 색상을 띤다. 제주도와 남해안에서 주로 관찰되며 탱자나무, 유자나무를 먹이로 삼는다.',
   protect:'LC', threat:'난대림 감소, 기후변화',
   msg:'남쪽 섬에서만 볼 수 있는 귀한 손님. 제주의 자연을 지켜야 이 나비도 살 수 있습니다.'},

  {id:'silver_washed', ko:'큰흰줄표범나비', en:'Silver-washed Fritillary', sci:'Argynnis paphia', r:2, color:'#E65100',
   habitat:'산림 속 개활지, 꽃밭', season:'6월~8월', size:'60~75mm',
   desc:'주황색 바탕에 검은 점 무늬가 규칙적으로 배열된 표범나비과의 대형 나비다. 날개 뒷면에 은색 줄무늬가 있어 이름이 붙었다. 제비꽃 종류를 먹이식물로 삼으며 숲 속 밝은 공터에서 관찰된다.',
   protect:'NT (준위협)', threat:'산림 관리 방식 변화',
   msg:'숲 속 꽃밭이 사라지면 이 화려한 나비도 사라집니다.'},

  {id:'blue_morpho', ko:'모르포나비', en:'Blue Morpho', sci:'Morpho peleides', r:3, color:'#1565C0',
   habitat:'중남미 열대우림', season:'연중', size:'100~200mm',
   desc:'세상에서 가장 아름다운 나비로 꼽히는 모르포나비는 날개의 미세 구조에 의한 구조색으로 보는 각도에 따라 신비로운 파란빛을 발한다. 색소가 아닌 빛의 간섭 현상으로 색이 만들어지며 우주선 기술에도 응용될 만큼 과학적으로도 중요하다. 아마존 열대우림의 상징적 생물이다.',
   protect:'관리 대상', threat:'서식지 파괴, 불법 포획',
   msg:'아마존이 파괴되면 이 신비로운 파란 빛도 영원히 사라집니다. 우리의 소비 습관이 아마존을 구합니다.'},

  {id:'monarch', ko:'제왕나비', en:'Monarch', sci:'Danaus plexippus', r:3, color:'#FF6D00',
   habitat:'북미, 멕시코 월동지', season:'이주: 9~11월', size:'85~100mm',
   desc:'가장 유명한 장거리 이주 나비로 캐나다에서 멕시코까지 5,000km를 날아간다. 여러 세대에 걸쳐 이루어지는 이 여정은 자연계의 경이로움이다. 밀크위드를 먹이로 삼으며 독성 물질을 몸에 축적해 포식자로부터 보호한다. 최근 급격한 개체수 감소로 멸종위기종으로 지정되었다.',
   protect:'EN (위기종)', threat:'밀크위드 감소, 기후변화, 살충제',
   msg:'5000km를 나는 제왕나비가 위기에 처했습니다. 정원에 밀크위드를 심어주세요.'},

  {id:'peacock', ko:'공작나비', en:'Peacock Butterfly', sci:'Aglais io', r:3, color:'#C62828',
   habitat:'유럽·아시아 온대 지역', season:'3월~10월', size:'50~60mm',
   desc:'날개에 공작 깃털처럼 눈 모양 무늬 4개가 있어 포식자를 위협하는 아름다운 나비다. 눈알 무늬를 이용한 경고 행동이 인상적이며 겨울을 성충으로 나는 드문 나비다. 쐐기풀이 주요 먹이식물이며 과즙과 수액을 즐겨 먹는다.',
   protect:'LC', threat:'쐐기풀 서식지 감소',
   msg:'눈알 무늬로 세상을 놀라게 하는 공작나비. 쐐기풀밭을 지켜주세요.'},

  {id:'purple_emperor', ko:'숲속나비', en:'Purple Emperor', sci:'Apatura iris', r:3, color:'#6A1B9A',
   habitat:'유럽·아시아 낙엽활엽수림', season:'7월~8월', size:'55~70mm',
   desc:'수컷은 보라빛 금속 광택이 나는 날개를 가진 유럽에서 가장 아름다운 나비 중 하나다. 나무 꼭대기에서 영역을 지키며 땅바닥에서 광물질을 흡수하는 습성이 있다. 버드나무류를 먹이식물로 삼으며 개체수가 적어 희귀종으로 취급된다.',
   protect:'NT', threat:'낙엽수림 감소, 버드나무 관리',
   msg:'숲 속 보라빛 귀족. 오래된 버드나무 숲을 보전해야 합니다.'},

  {id:'apollo', ko:'붉은점모시나비', en:'Apollo Butterfly', sci:'Parnassius apollo', r:3, color:'#F5F5F5',
   habitat:'고산 초원, 석회암 지대', season:'6월~8월', size:'60~90mm',
   desc:'흰색 날개에 붉은 눈알 무늬가 있는 고산성 나비로 알프스와 피레네 산맥의 상징이다. CITES 부속서 II에 등재되어 국제적으로 보호받는다. 기후변화로 인한 눈 녹는 시기 변화와 먹이식물인 돌나물류 감소로 위협받고 있다.',
   protect:'VU (취약종) / CITES II', threat:'기후변화, 서식지 파괴, 불법 채집',
   msg:'알프스의 보석이 사라지고 있습니다. 국제적 보호에도 기후변화 앞에선 무력합니다.'},

  {id:'emerald_swallowtail', ko:'열대에메랄드나비', en:'Emerald Swallowtail', sci:'Papilio palinurus', r:4, color:'#00695C',
   habitat:'동남아시아 열대우림', season:'연중', size:'80~100mm',
   desc:'에메랄드 빛 초록색 광택이 눈부신 동남아시아 나비로 날개의 미세 구조가 빛을 반사해 형광 초록색처럼 보인다. 필리핀, 인도네시아, 말레이시아의 열대우림에 서식하며 감귤류와 운향과 식물이 먹이식물이다. 서식지 파괴로 개체수가 줄고 있다.',
   protect:'NT', threat:'동남아 열대우림 급격한 파괴',
   msg:'팜유 농장 개발로 사라지는 열대우림. 지속가능한 제품을 선택하는 것이 이 나비를 살립니다.'},

  {id:'golden_birdwing', ko:'황금새나비', en:"Queen Alexandra's Birdwing", sci:'Ornithoptera alexandrae', r:4, color:'#FFD600',
   habitat:'파푸아뉴기니 일부 지역', season:'연중', size:'250~280mm (세계 최대)',
   desc:'세계에서 가장 큰 나비로 날개폭이 28cm에 달한다. 파푸아뉴기니 일부 지역에만 서식하는 고유종으로 수컷은 파란색과 초록색, 암컷은 갈색과 흰색이다. 1951년 화산 폭발로 서식지가 크게 줄었으며 CITES I에 등재되어 거래가 엄격히 금지된다.',
   protect:'EN / CITES I (거래 전면 금지)', threat:'서식지 파괴, 불법 포획 (표본 수집)',
   msg:'세계 최대 나비가 멸종위기에 처했습니다. 나비 표본 거래는 생태계를 파괴하는 행위입니다.'},

  {id:'glasswing', ko:'유리날개나비', en:'Glasswing Butterfly', sci:'Greta oto', r:4, color:'#E8F5E9',
   habitat:'중앙아메리카 열대우림', season:'연중', size:'55~60mm',
   desc:'날개가 완전히 투명하여 마치 유리처럼 보이는 신비로운 나비다. 투명한 날개는 인시목 중 유일한 특성으로 색소 비늘이 없고 미세한 기둥 구조가 빛 반사를 최소화한다. 나비 중 장거리 이주 능력도 뛰어나 이주 거리가 체중 대비 가장 길다.',
   protect:'관리 대상', threat:'중앙아메리카 열대우림 파괴',
   msg:'투명한 날개로 존재를 숨기지만, 서식지 파괴 앞에선 숨을 곳이 없습니다.'},

  {id:'figure88', ko:'88나비', en:'Figure-of-88', sci:'Diaethria anna', r:4, color:'#4A148C',
   habitat:'중남미 열대우림', season:'연중', size:'30~40mm',
   desc:'날개 뒷면에 "88" 또는 "89"처럼 보이는 무늬가 있어 이름이 붙었다. 중앙아메리카와 남아메리카 열대우림에 서식하며 썩은 과일과 배설물에서 영양분을 섭취하는 독특한 습성이 있다. 보라색과 파란색이 혼합된 날개 윗면도 아름답다.',
   protect:'관리 대상', threat:'서식지 파괴',
   msg:'숫자 88이 행운의 상징이듯, 이 나비의 존재 자체가 건강한 열대우림의 증거입니다.'},

  {id:'opal', ko:'오팔나비', en:'Opal Butterfly', sci:'Chrysiridia rhipheus', r:4, color:'#7986CB',
   habitat:'마다가스카르 동부 열대우림', season:'연중', size:'70~90mm',
   desc:'마다가스카르에만 서식하는 고유종으로 날개의 구조색이 만들어내는 무지개빛 광택이 세계에서 가장 아름다운 나비로 손꼽히게 한다. 사실 나비가 아닌 나방의 일종이지만 낮에 활동하며 나비처럼 보인다. 마다가스카르 생태계의 핵심 지표종이다.',
   protect:'관리 대상', threat:'마다가스카르 삼림 파괴 (90% 소실)',
   msg:'마다가스카르 숲의 90%가 사라졌습니다. 이 무지개 나비와 함께 수천 종의 고유 생물이 사라지고 있습니다.'},

  {id:'phoenix', ko:'불사조나비', en:'Bhutan Glory', sci:'Bhutanitis lidderdalii', r:5, color:'#7F0000',
   habitat:'히말라야 고산 지대', season:'7월~9월', size:'70~100mm',
   desc:'히말라야 산맥의 험준한 고산 지대에 서식하는 희귀 나비로 부탄의 국가적 상징으로 여겨진다. 검은 바탕에 빨간 점과 파란 무늬가 화려하게 배열되어 있다. 해발 1,500~3,500m의 좁은 지역에만 서식하며 CITES II에 등재된 보호종이다.',
   protect:'NT / CITES II', threat:'기후변화로 인한 고산 서식지 변화',
   msg:'히말라야도 기후변화 앞에선 안전하지 않습니다. 지구온난화가 이 신성한 나비를 위협합니다.'},

  {id:'moon', ko:'달빛나비', en:'Comet Moth', sci:'Argema mittrei', r:5, color:'#3949AB',
   habitat:'마다가스카르 열대우림', season:'연중', size:'110~200mm (꼬리 포함)',
   desc:'세계에서 가장 큰 나방 중 하나로 수컷은 20cm에 달하는 긴 꼬리를 가진다. 밤에 빛나는 달처럼 아름다워 달나방이라 불린다. 마다가스카르 동부 열대우림에만 서식하며 성충은 입이 퇴화되어 먹이를 먹지 못하고 수일 내에 죽는다.',
   protect:'EN', threat:'마다가스카르 삼림 파괴',
   msg:'삶의 마지막을 아름다움으로 불태우는 달빛나비. 그 삶의 터전을 우리가 지켜야 합니다.'},

  {id:'dragon', ko:'용나비', en:'Rajah Brooke Birdwing', sci:'Trogonoptera brookiana', r:5, color:'#1B5E20',
   habitat:'말레이시아·보르네오 열대우림', season:'연중', size:'150~175mm',
   desc:'말레이시아의 국나비로 제임스 브룩 사라왁 총독의 이름을 딴 화려한 대형 나비다. 검은 바탕에 에메랄드 초록의 삼각형 무늬가 각 날개에 배열되어 있어 극도로 아름답다. 수컷들이 강가에 모여 광물질을 흡수하는 장관을 연출한다.',
   protect:'VU / CITES II', threat:'보르네오 열대우림 팜유 농장 개발',
   msg:'말레이시아의 자존심이 팜유 농장으로 파괴되고 있습니다. 팜유 프리 제품을 선택해 주세요.'},

  {id:'galaxy', ko:'은하나비', en:'Madagascar Sunset Moth', sci:'Chrysiridia rhipheus', r:5, color:'#1A237E',
   habitat:'마다가스카르', season:'연중', size:'75~90mm',
   desc:'마다가스카르 고유종으로 날개의 구조색이 보는 각도에 따라 무지개처럼 변하며 은하수를 연상시키는 신비로운 아름다움을 가진다. 역사적으로 비싼 장신구 재료로 사용되어 남획되었으며 현재도 불법 거래가 문제다. 먹이식물인 Omphalea 식물과 공진화 관계에 있다.',
   protect:'관리 대상', threat:'불법 거래, 서식지 파괴',
   msg:'나비를 장신구로 쓰는 시대는 끝났습니다. 아름다움은 살아 날아다닐 때 진정한 가치가 있습니다.'},

  {id:'lightning', ko:'번개나비', en:'Blue Clipper', sci:'Parthenos sylvia', r:5, color:'#F57F17',
   habitat:'동남아시아, 남아시아 열대', season:'연중', size:'70~90mm',
   desc:'파란색과 검은색이 번개처럼 빠른 속도로 날아다니는 대형 나비다. 매우 빠른 비행 속도로 유명하며 다양한 색상 변이가 존재한다. 먹이식물은 포도과 식물이며 수컷은 영역 다툼이 치열하다.',
   protect:'LC', threat:'동남아 삼림 벌채',
   msg:'번개처럼 빠른 이 나비조차 서식지 파괴 앞에선 속수무책입니다.'},

  {id:'frost', ko:'얼음나비', en:'Mountain Clouded Yellow', sci:'Colias nastes', r:5, color:'#0288D1',
   habitat:'북극권, 고산 툰드라', season:'6월~7월', size:'35~45mm',
   desc:'북극과 고산 툰드라에만 서식하는 극지 나비로 낮은 온도에서도 활동할 수 있도록 진화되었다. 날개에 회색빛이 도는 것이 특징이며 짧은 여름 동안만 날아다닌다. 온난화로 인한 눈선 상승과 툰드라 생태계 변화로 서식지가 급격히 줄고 있다.',
   protect:'VU', threat:'기후변화 (가장 직접적인 피해종)',
   msg:'북극의 나비가 사라지고 있습니다. 기후위기는 먼 이야기가 아닙니다.'},

  {id:'lava', ko:'용암나비', en:'Red Lacewing', sci:'Cethosia biblis', r:5, color:'#BF360C',
   habitat:'동남아시아 열대우림', season:'연중', size:'60~80mm',
   desc:'선명한 빨간색과 검은색 무늬가 용암처럼 강렬한 나비다. 독성 먹이식물을 섭취해 몸에 독성 물질을 축적하며 이를 경고하기 위한 아포세마티즘 (경고색) 색상을 가진다. 시계꽃 종류를 먹이식물로 삼으며 열대우림의 건강성을 나타내는 지표종이다.',
   protect:'관리 대상', threat:'동남아 열대우림 파괴',
   msg:'용암처럼 붉은 이 경고색이 진짜 경고가 되기 전에 서식지를 보호해야 합니다.'},

  {id:'divine', ko:'신성나비', en:'Giant African Swallowtail', sci:'Papilio antimachus', r:5, color:'#E65100',
   habitat:'중앙아프리카 열대우림', season:'연중', size:'230~250mm (아프리카 최대)',
   desc:'아프리카에서 가장 큰 나비로 날개폭이 25cm에 달한다. 독성이 매우 강하며 포식자들도 피하는 나비로 알려져 있다. 컬럼버린 독소를 먹이식물에서 축적한다. 중앙아프리카 콩고 분지 열대우림에만 서식하며 수컷만이 관찰되어 암컷은 아직도 신비에 싸여 있다.',
   protect:'DD (정보 부족)', threat:'콩고 열대우림 분쟁 및 개발',
   msg:'암컷조차 발견되지 않은 신비의 나비. 알기도 전에 사라지는 생명이 있어선 안 됩니다.'},

  {id:'abyss', ko:'심연나비', en:'Birdwing Moth', sci:'Attacus atlas', r:5, color:'#1A0A5E',
   habitat:'동남아시아, 중국 남부', season:'연중', size:'250~300mm (세계 최대 나방)',
   desc:'아틀라스 나방은 세계 최대 나방으로 날개 면적이 400cm²에 달한다. 앞날개 끝이 뱀 머리처럼 생겨 포식자를 위협한다. 성충은 입이 없어 유충 때 저장한 영양분만으로 1~2주를 산다. 대만에서는 고치가 동전 지갑으로 사용될 만큼 크다.',
   protect:'관리 대상', threat:'동남아 열대우림 파괴, 고치 채취',
   msg:'입도 없이 마지막 날들을 불꽃처럼 사는 아틀라스 나방. 그 생의 터전을 지켜주세요.'},

  {id:'creation', ko:'창조나비', en:'Goliath Birdwing', sci:'Ornithoptera goliath', r:5, color:'#1A237E',
   habitat:'파푸아뉴기니, 인도네시아', season:'연중', size:'180~210mm',
   desc:'세계에서 두 번째로 큰 나비로 수컷은 초록색과 검은색, 암컷은 갈색과 흰색의 장엄한 색상을 띤다. 파푸아뉴기니 고산 열대우림에 서식하며 CITES II에 등재된 보호종이다. 성충은 Aristolochia 덩굴을 먹이로 삼으며 이 식물과 공진화했다.',
   protect:'VU / CITES II', threat:'열대우림 파괴, 불법 채집',
   msg:'신의 걸작품 같은 이 나비를 표본으로 죽이는 대신, 살아 나는 모습을 후대에게 물려줍시다.'},
];

// ── 나비 도감 모달 ──
function showButterflyDogam() {
  const mr = document.getElementById('mr');
  if(!mr) return;
  const selR = window._dogamFilter||0; // 0=전체
  const filtered = selR===0 ? BUTTERFLY_DATA : BUTTERFLY_DATA.filter(b=>b.r===selR);
  const rNames = ['전체','일반','고급','희귀','전설','신화'];
  const rColors = ['#374151','#9CA3AF','#3B82F6','#8B5CF6','#EF4444','#F59E0B'];

  mr.innerHTML = `<div class="mbg" onclick="cm()" style="align-items:flex-start;padding-top:0"><div onclick="event.stopPropagation()" style="background:#fff;width:100%;max-width:600px;height:100vh;overflow-y:auto;display:flex;flex-direction:column">
    <!-- 헤더 -->
    <div style="position:sticky;top:0;background:#fff;border-bottom:1px solid #E5E7EB;padding:14px 16px;z-index:10">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div>
          <div style="font-size:18px;font-weight:900;color:#111">🦋 나비 도감</div>
          <div style="font-size:11px;color:#9CA3AF;margin-top:1px">지구의 나비를 기억해 주세요</div>
        </div>
        <button onclick="cm()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#9CA3AF">✕</button>
      </div>
      <!-- 레어도 필터 -->
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${[0,1,2,3,4,5].map(r=>`<button onclick="window._dogamFilter=${r};showButterflyDogam()" style="padding:4px 10px;border-radius:14px;border:1.5px solid ${(selR===r)?rColors[r]:'#E5E7EB'};background:${(selR===r)?rColors[r]:'#fff'};color:${(selR===r)?'#fff':rColors[r]};font-size:11px;font-weight:700;cursor:pointer">${rNames[r]} ${r===0?'('+BUTTERFLY_DATA.length+')':'('+BUTTERFLY_DATA.filter(b=>b.r===r).length+')'}</button>`).join('')}
      </div>
    </div>
    <!-- 나비 목록 -->
    <div style="padding:12px;display:flex;flex-direction:column;gap:10px">
      ${filtered.map(b=>`<div onclick="showButterflyDetail('${b.id}')" style="background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:12px">
        <div style="width:52px;height:52px;border-radius:12px;background:#F9FAFB;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">
          ${getButterflyMiniSVG(b)}
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <span style="font-size:14px;font-weight:800;color:#111">${b.ko}</span>
            <span style="font-size:10px;padding:2px 6px;border-radius:8px;background:${rColors[b.r]}22;color:${rColors[b.r]};font-weight:700">${rNames[b.r]}</span>
          </div>
          <div style="font-size:11px;color:#9CA3AF;font-style:italic;margin-bottom:3px">${b.sci}</div>
          <div style="font-size:11px;color:#374151;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${b.desc.slice(0,60)}...</div>
        </div>
        <span style="color:#9CA3AF;font-size:16px;flex-shrink:0">›</span>
      </div>`).join('')}
    </div>
    <!-- 환경보호 메시지 -->
    <div style="margin:12px;padding:16px;background:#F0FDF4;border-radius:14px;border-left:4px solid #16A34A">
      <div style="font-size:12px;font-weight:700;color:#15803D;margin-bottom:4px">🌿 나비를 지키는 방법</div>
      <div style="font-size:11px;color:#166534;line-height:1.6">농약 사용 줄이기 · 꽃 피는 식물 심기 · 팜유 프리 제품 선택 · 열대우림 보호 단체 후원</div>
    </div>
  </div></div>`;
}

function showButterflyDetail(id) {
  const b = BUTTERFLY_DATA.find(x=>x.id===id);
  if(!b) return;
  const rNames = ['전체','일반','고급','희귀','전설','신화'];
  const rColors = ['#374151','#9CA3AF','#3B82F6','#8B5CF6','#EF4444','#F59E0B'];
  document.getElementById('mr').innerHTML = `<div class="mbg" onclick="showButterflyDogam()" style="align-items:flex-start;padding-top:0"><div onclick="event.stopPropagation()" style="background:#fff;width:100%;max-width:600px;height:100vh;overflow-y:auto">
    <div style="position:sticky;top:0;background:#fff;border-bottom:1px solid #E5E7EB;padding:12px 16px;display:flex;align-items:center;gap:10px">
      <button onclick="showButterflyDogam()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#374151">‹</button>
      <div style="flex:1;font-size:16px;font-weight:800;color:#111">${b.ko}</div>
      <button onclick="cm()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#9CA3AF">✕</button>
    </div>
    <div style="padding:20px">
      <!-- 나비 이미지 -->
      <div style="background:#F9FAFB;border-radius:20px;padding:30px;text-align:center;margin-bottom:16px;border:1px solid #E5E7EB">
        ${getButterflyDetailSVG(b)}
      </div>
      <!-- 기본 정보 -->
      <div style="margin-bottom:16px">
        <div style="font-size:20px;font-weight:900;color:#111;margin-bottom:2px">${b.ko}</div>
        <div style="font-size:13px;color:#9CA3AF;font-style:italic;margin-bottom:6px">${b.sci}</div>
        <div style="display:inline-block;padding:3px 10px;border-radius:10px;background:${rColors[b.r]}22;color:${rColors[b.r]};font-size:11px;font-weight:700">${rNames[b.r]}</div>
      </div>
      <!-- 설명 -->
      <div style="background:#F9FAFB;border-radius:12px;padding:14px;margin-bottom:12px">
        <div style="font-size:11px;font-weight:700;color:#9CA3AF;margin-bottom:6px">설명</div>
        <div style="font-size:13px;color:#111;line-height:1.8">${b.desc}</div>
      </div>
      <!-- 서식 정보 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:#F9FAFB;border-radius:12px;padding:12px">
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:4px">서식지</div>
          <div style="font-size:12px;color:#111;font-weight:600;line-height:1.4">${b.habitat}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:12px;padding:12px">
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:4px">활동 시기</div>
          <div style="font-size:12px;color:#111;font-weight:600">${b.season}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:12px;padding:12px">
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:4px">크기 (날개폭)</div>
          <div style="font-size:12px;color:#111;font-weight:600">${b.size}</div>
        </div>
        <div style="background:${rColors[b.r]}11;border-radius:12px;padding:12px;border-left:3px solid ${rColors[b.r]}">
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:4px">보호 등급</div>
          <div style="font-size:12px;color:${rColors[b.r]};font-weight:700">${b.protect}</div>
        </div>
      </div>
      <!-- 위협 요인 -->
      <div style="background:#FEF2F2;border-radius:12px;padding:14px;margin-bottom:12px;border-left:4px solid #EF4444">
        <div style="font-size:11px;font-weight:700;color:#DC2626;margin-bottom:6px">⚠️ 위협 요인</div>
        <div style="font-size:13px;color:#7F1D1D;line-height:1.6">${b.threat}</div>
      </div>
      <!-- 환경 메시지 -->
      <div style="background:#F0FDF4;border-radius:12px;padding:14px;border-left:4px solid #16A34A">
        <div style="font-size:11px;font-weight:700;color:#15803D;margin-bottom:6px">💚 환경 메시지</div>
        <div style="font-size:13px;color:#14532D;line-height:1.7;font-style:italic">"${b.msg}"</div>
      </div>
    </div>
  </div></div>`;
}

function getButterflyMiniSVG(b) {
  // 간단한 나비 실루엣 - 색상만 다르게
  const col = b.color;
  return `<svg width="48" height="48" viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="display:block">
    <path d="M50,42 Q28,10 8,18 Q3,32 10,46 Q22,58 50,48Z" fill="${col}" opacity="0.9"/>
    <path d="M50,42 Q72,10 92,18 Q97,32 90,46 Q78,58 50,48Z" fill="${col}" opacity="0.9"/>
    <path d="M50,48 Q28,56 18,68 Q20,76 30,72 Q42,62 50,56Z" fill="${col}" opacity="0.75"/>
    <path d="M50,48 Q72,56 82,68 Q80,76 70,72 Q58,62 50,56Z" fill="${col}" opacity="0.75"/>
    <ellipse cx="50" cy="52" rx="3.5" ry="14" fill="#212121" opacity="0.7"/>
    <circle cx="50" cy="37" r="5" fill="#212121" opacity="0.7"/>
  </svg>`;
}

function getButterflyDetailSVG(b) {
  const col = b.color;
  return `<svg width="180" height="150" viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <radialGradient id="dg1_${b.id}" cx="55%" cy="50%"><stop offset="0%" stop-color="${col}" stop-opacity="0.7"/><stop offset="100%" stop-color="${col}"/></radialGradient>
      <radialGradient id="dg2_${b.id}" cx="45%" cy="50%"><stop offset="0%" stop-color="${col}" stop-opacity="0.7"/><stop offset="100%" stop-color="${col}"/></radialGradient>
    </defs>
    <!-- 앞날개 -->
    <path d="M100,80 Q60,20 20,35 Q10,60 20,85 Q40,105 100,90Z" fill="url(#dg1_${b.id})" stroke="#21212133" stroke-width="1.5"/>
    <path d="M100,80 Q140,20 180,35 Q190,60 180,85 Q160,105 100,90Z" fill="url(#dg2_${b.id})" stroke="#21212133" stroke-width="1.5"/>
    <!-- 뒷날개 -->
    <path d="M100,90 Q65,100 45,120 Q48,134 62,128 Q82,114 100,100Z" fill="${col}" opacity="0.8" stroke="#21212122" stroke-width="1"/>
    <path d="M100,90 Q135,100 155,120 Q152,134 138,128 Q118,114 100,100Z" fill="${col}" opacity="0.8" stroke="#21212122" stroke-width="1"/>
    <!-- 날개 광택 -->
    <path d="M100,82 Q80,50 55,42" stroke="white" stroke-width="4" fill="none" opacity="0.2" stroke-linecap="round"/>
    <path d="M100,82 Q120,50 145,42" stroke="white" stroke-width="4" fill="none" opacity="0.2" stroke-linecap="round"/>
    <!-- 몸통 -->
    <ellipse cx="100" cy="97" rx="5" ry="22" fill="#1a1a1a"/>
    <circle cx="100" cy="73" r="8" fill="#1a1a1a"/>
    <!-- 더듬이 -->
    <path d="M97,66 Q85,48 82,36" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M103,66 Q115,48 118,36" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="82" cy="36" r="4" fill="${col}"/>
    <circle cx="118" cy="36" r="4" fill="${col}"/>
  </svg>`;
}
