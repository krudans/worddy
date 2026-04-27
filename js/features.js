// ── 마켓 탭 통합 로직 ──
window._DB_PACKS = []; // 서버에서 가져온 데이터를 담을 전역 배열

async function fetchServerPacks() {
  if(typeof db === 'undefined') return;
  try {
    const snap = await db.collection('wordpacks').get();
    window._DB_PACKS = snap.docs.map(doc => doc.data());
  } catch(e) {
    console.error("서버 데이터 로드 실패:", e);
  }
}

function rMarket() {
  const topicCats = ['전체','여행','비즈니스','학업','미디어','드라마/영화','취미문화','수능','토익'];
  const activeCat = window._mCat || '전체';
  const searchQ = (window._mSearch || '').toLowerCase();
  
  // 1. 로컬 데이터(WORD_PACKS)와 서버 데이터(_DB_PACKS)를 하나로 합친다.
  const allPacks = [...(typeof WORD_PACKS !== 'undefined' ? WORD_PACKS : []), ...window._DB_PACKS];

  // 2. 필터링 로직 적용
  let filtered = allPacks.filter(p => {
    const catOk = activeCat === '전체' || p.cat === activeCat;
    const searchOk = !searchQ || p.name.toLowerCase().includes(searchQ) || (p.desc || '').toLowerCase().includes(searchQ);
    return catOk && searchOk;
  });

  const parts = [];
  parts.push('<div style="display:flex;flex-direction:column;height:100%">');

  // 검색바 및 카테고리 UI (기존 UI 코드 유지)
  parts.push(`<div style="padding:15px; background:#fff; border-bottom:1px solid #eee;">
    <input type="text" placeholder="단어장 검색..." oninput="window._mSearch=this.value; rMarket()" 
           style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;" value="${window._mSearch || ''}">
  </div>`);

  // 단어장 리스트 출력
  parts.push('<div style="flex:1; overflow-y:auto; padding:15px;">');
  if(filtered.length === 0) {
    parts.push('<div style="text-align:center; padding:50px; color:#999;">검색 결과가 없다.</div>');
  } else {
    filtered.forEach(p => {
      parts.push(`
        <div class="card" style="margin-bottom:15px; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <div style="font-size:18px; font-weight:800;">${p.emoji || '??'} ${p.name}</div>
          <div style="font-size:13px; color:#666; margin:5px 0;">${p.desc || ''}</div>
          <button onclick="downloadPack('${p.id}')" style="width:100%; padding:10px; background:#1E5FA5; color:#fff; border:none; border-radius:8px; margin-top:10px; font-weight:700;">다운로드</button>
        </div>
      `);
    });
  }
  parts.push('</div></div>');

  document.getElementById('main').innerHTML = parts.join('');
}

// 앱 실행 시 서버 데이터 동기화
fetchServerPacks().then(() => {
  if(window.currentTab === 'market') rMarket();
});