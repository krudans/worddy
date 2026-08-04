// 홈 공지사항 섹션
window.renderHomeNotice = async function() {
  const el = document.getElementById('home-notice-section');
  if(!el) return;
  if(localStorage.getItem('wd-notice-off') === '1') { el.innerHTML=''; return; }
  try {
    if(typeof db === 'undefined') { el.innerHTML=''; return; }
    const snap = await db.collection('announcements')
      .orderBy('createdAt','desc').limit(5).get();
    const notices = snap.docs.map(d=>d.data()).filter(d=>d.active!==false).slice(0,5);
    if(!notices.length) { el.innerHTML=''; return; }
    /* [공지 접기 20260804] 긴 공지는 앞부분(제목·요약·표지 소개, 약 190px)만 보이고
       '자세히 보기 ▾'로 나머지(특징·난이도 그래프)를 펼친다. 짧은 공지는 버튼 없이 전체 표시.
       저장된 공지 내용은 건드리지 않는 표시 계층 처리 — 모든 공지에 자동 적용. */
    const items = notices.map((n,i) => `
      <div style="padding:12px 14px;border-radius:12px;background:#EFF6FF;border:1.5px solid #BFDBFE;margin-bottom:8px">
        <div style="font-size:13px;font-weight:800;color:#1E5FA5;margin-bottom:${n.subtitle||n.content?'4px':'0'}">📢 ${n.title||''}</div>
        ${n.subtitle ? '<div style="font-size:11px;color:#9CA3AF;margin-bottom:4px">'+n.subtitle+'</div>' : ''}
        ${n.content  ? '<div style="position:relative"><div id="ntc-body-'+i+'" data-collapsed="1" style="font-size:12px;color:#374151;line-height:1.7;white-space:pre-wrap;max-height:190px;overflow:hidden">'+n.content+'</div>'
          +'<div id="ntc-fade-'+i+'" style="position:absolute;left:0;right:0;bottom:0;height:46px;background:linear-gradient(rgba(239,246,255,0),#EFF6FF);pointer-events:none"></div></div>'
          +'<button id="ntc-more-'+i+'" onclick="window._ntcToggle('+i+')" style="width:100%;margin-top:7px;background:#fff;border:1.5px solid #BFDBFE;border-radius:10px;padding:8px;font-size:11.5px;font-weight:800;color:#1E5FA5;cursor:pointer">자세히 보기 ▾</button>' : ''}
      </div>`).join('');
    el.innerHTML =
      '<div style="background:var(--bg-card,#fff);border-radius:18px;border:1.5px solid var(--border,#E5E7EB);padding:14px;margin-bottom:4px">' +
        '<div style="font-size:13px;font-weight:800;color:var(--text1,#111);margin-bottom:12px">📢 공지사항</div>' +
        items +
      '</div>';
    // 짧은 공지(접힌 높이보다 조금 긴 정도까지)는 접기 장치 제거 — 버튼만 덜렁 남지 않게
    notices.forEach((n,i)=>{
      const b=document.getElementById('ntc-body-'+i);
      if(!b) return;
      if(b.scrollHeight <= 240){
        b.style.maxHeight='none'; b.setAttribute('data-collapsed','0');
        const f=document.getElementById('ntc-fade-'+i); if(f) f.remove();
        const m=document.getElementById('ntc-more-'+i); if(m) m.remove();
      }
    });
  } catch(e) { el.innerHTML=''; }
}

// [공지 접기 20260804] 자세히 보기 ▾ / 접기 ▴ 토글
window._ntcToggle = function(i){
  const b=document.getElementById('ntc-body-'+i), f=document.getElementById('ntc-fade-'+i), m=document.getElementById('ntc-more-'+i);
  if(!b) return;
  if(b.getAttribute('data-collapsed')==='1'){
    b.style.maxHeight='none'; b.setAttribute('data-collapsed','0');
    if(f) f.style.display='none';
    if(m) m.textContent='접기 ▴';
  } else {
    b.style.maxHeight='190px'; b.setAttribute('data-collapsed','1');
    if(f) f.style.display='';
    if(m) m.textContent='자세히 보기 ▾';
    try{ b.closest('div[style*="border-radius:12px"]').scrollIntoView({block:'nearest'}); }catch(e){}
  }
};

// 관리자 공지 작성
window.showAdminNoticeEditor = function() {
  if(!S.user || S.user.email !== 'krudans@gmail.com') { toast('관리자만 접근 가능해요'); return; }
  document.getElementById('mr').innerHTML = `<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()">
    <div style="font-size:17px;font-weight:900;margin-bottom:14px">📢 공지사항 작성</div>
    <input id="ntc-title" placeholder="제목" style="width:100%;padding:10px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;margin-bottom:8px">
    <input id="ntc-sub" placeholder="부제목 (선택)" style="width:100%;padding:9px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:8px">
    <textarea id="ntc-body" placeholder="공지 내용..." style="width:100%;min-height:100px;resize:vertical;padding:10px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:8px"></textarea>
    <button onclick="window.submitAdminNotice()" class="btn bb" style="margin-bottom:8px">📤 공지 등록</button>
    <button onclick="window.loadAdminNotices()" class="btn" style="margin-bottom:8px">📋 공지 목록</button>
    <button onclick="cm()" class="btn bgr">닫기</button>
  </div></div>`;
}

window.submitAdminNotice = async function() {
  const titleEl = document.getElementById('ntc-title');
  const subEl = document.getElementById('ntc-sub');
  const bodyEl = document.getElementById('ntc-body');
  if(!titleEl||!bodyEl) { alert('입력 필드를 찾을 수 없어요. 다시 열어주세요.'); return; }
  const title = titleEl.value.trim();
  const subtitle = subEl?.value.trim()||'';
  const content = bodyEl.value.trim();
  if(!title) { alert('제목을 입력해주세요'); return; }
  if(!content) { alert('내용을 입력해주세요'); return; }
  try {
    const ts = typeof firebase !== 'undefined'
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();
    await db.collection('announcements').add({
      title, subtitle, content, active:true,
      createdAt: ts,
      createdBy: S.user?.email || 'admin'
    });
    cm();
    alert('공지사항이 등록됐어요!');
    if(typeof renderHomeNotice === 'function') renderHomeNotice();
  } catch(e) {
    alert('등록 실패: ' + e.message);
    console.error('공지 등록 오류:', e);
  }
}

window.loadAdminNotices = async function() {
  const mr = document.getElementById('mr');
  try {
    const snap = await db.collection('announcements').orderBy('createdAt','desc').limit(20).get();
    if(!snap.docs.length) { toast('등록된 공지가 없어요'); return; }
    const rows = snap.docs.map(d => {
      const dat = d.data();
      return '<div style="padding:10px 0;border-bottom:1px solid #F3F4F6">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div style="font-size:13px;font-weight:700">'+dat.title+'</div>' +
          '<div style="display:flex;gap:4px">' +
            '<button onclick="window.toggleNotice(\''+d.id+'\','+(!dat.active)+')" style="font-size:11px;padding:3px 8px;border-radius:6px;border:none;cursor:pointer;background:'+(dat.active?'#D1FAE5':'#FEE2E2')+';color:'+(dat.active?'#065F46':'#991B1B')+';font-weight:700">'+(dat.active?'활성':'비활성')+'</button>' +
            '<button onclick="window.deleteNotice(\''+d.id+'\')" style="font-size:11px;padding:3px 8px;border-radius:6px;border:none;cursor:pointer;background:#FEE2E2;color:#991B1B;font-weight:700">삭제</button>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:#9CA3AF;margin-top:2px">'+(dat.content||'').slice(0,40)+'...</div>' +
      '</div>';
    }).join('');
    mr.innerHTML = '<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()">' +
      '<div style="font-size:16px;font-weight:900;margin-bottom:12px">📋 공지 목록</div>' +
      '<div style="max-height:300px;overflow-y:auto">'+rows+'</div>' +
      '<button onclick="window.showAdminNoticeEditor()" class="btn bb" style="margin-top:10px;margin-bottom:8px">+ 새 공지 작성</button>' +
      '<button onclick="cm()" class="btn">닫기</button>' +
    '</div></div>';
  } catch(e) { toast('로드 실패'); }
}

window.toggleNotice = async function(id, active) {
  try { await db.collection('announcements').doc(id).update({active}); loadAdminNotices(); }
  catch(e) { toast('실패'); }
}

window.deleteNotice = async function(id) {
  if(!confirm('삭제할까요?')) return;
  try { await db.collection('announcements').doc(id).delete(); loadAdminNotices(); }
  catch(e) { toast('실패'); }
}
