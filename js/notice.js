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
    const items = notices.map(n => `
      <div style="padding:12px 14px;border-radius:12px;background:#EFF6FF;border:1.5px solid #BFDBFE;margin-bottom:8px">
        <div style="font-size:13px;font-weight:800;color:#1E5FA5;margin-bottom:${n.subtitle||n.content?'4px':'0'}">📢 ${n.title||''}</div>
        ${n.subtitle ? '<div style="font-size:11px;color:#9CA3AF;margin-bottom:4px">'+n.subtitle+'</div>' : ''}
        ${n.content  ? '<div style="font-size:12px;color:#374151;line-height:1.7;white-space:pre-wrap">'+n.content+'</div>' : ''}
      </div>`).join('');
    el.innerHTML =
      '<div style="background:var(--bg-card,#fff);border-radius:18px;border:1.5px solid var(--border,#E5E7EB);padding:14px;margin-bottom:4px">' +
        '<div style="font-size:13px;font-weight:800;color:var(--text1,#111);margin-bottom:12px">📢 공지사항</div>' +
        items +
      '</div>';
  } catch(e) { el.innerHTML=''; }
}

// 관리자 공지 작성
window.showAdminNoticeEditor = function() {
  if(!S.user || S.user.email !== 'krudans@gmail.com') { toast('관리자만 접근 가능해요'); return; }
  document.getElementById('mr').innerHTML = `<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()">
    <div style="font-size:17px;font-weight:900;margin-bottom:14px">📢 공지사항 작성</div>
    <input id="ntc-title" placeholder="제목" style="width:100%;padding:10px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;margin-bottom:8px">
    <input id="ntc-sub" placeholder="부제목 (선택)" style="width:100%;padding:9px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:8px">
    <textarea id="ntc-body" placeholder="공지 내용..." style="width:100%;min-height:100px;resize:vertical;padding:10px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:8px"></textarea>
    <button onclick="submitAdminNotice()" class="btn bb" style="margin-bottom:8px">📤 공지 등록</button>
    <button onclick="loadAdminNotices()" class="btn" style="margin-bottom:8px">📋 공지 목록</button>
    <button onclick="cm()" class="btn bgr">닫기</button>
  </div></div>`;
}

window.submitAdminNotice = async function() {
  const title = document.getElementById('ntc-title')?.value.trim();
  const subtitle = document.getElementById('ntc-sub')?.value.trim();
  const content = document.getElementById('ntc-body')?.value.trim();
  if(!title||!content) { toast('제목과 내용을 입력해주세요'); return; }
  try {
    await db.collection('announcements').add({
      title, subtitle, content, active:true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: S.user.email
    });
    cm(); toast('공지사항이 등록됐어요!');
    renderHomeNotice();
  } catch(e) { toast('등록 실패: '+e.message); }
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
            '<button onclick="toggleNotice(\''+d.id+'\','+(!dat.active)+')" style="font-size:11px;padding:3px 8px;border-radius:6px;border:none;cursor:pointer;background:'+(dat.active?'#D1FAE5':'#FEE2E2')+';color:'+(dat.active?'#065F46':'#991B1B')+';font-weight:700">'+(dat.active?'활성':'비활성')+'</button>' +
            '<button onclick="deleteNotice(\''+d.id+'\')" style="font-size:11px;padding:3px 8px;border-radius:6px;border:none;cursor:pointer;background:#FEE2E2;color:#991B1B;font-weight:700">삭제</button>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:#9CA3AF;margin-top:2px">'+(dat.content||'').slice(0,40)+'...</div>' +
      '</div>';
    }).join('');
    mr.innerHTML = '<div class="mbg" onclick="cm()"><div class="modal" onclick="event.stopPropagation()">' +
      '<div style="font-size:16px;font-weight:900;margin-bottom:12px">📋 공지 목록</div>' +
      '<div style="max-height:300px;overflow-y:auto">'+rows+'</div>' +
      '<button onclick="showAdminNoticeEditor()" class="btn bb" style="margin-top:10px;margin-bottom:8px">+ 새 공지 작성</button>' +
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
