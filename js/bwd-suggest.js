// ── ButterFly Word Dictionary : 추천(자동완성) 검색 + 자동 부착 ──
// (index.html 수정 없이 동작: 뜻 사전이 없으면 스스로 로드)
(function(){
  // BWD_DICT 미로드 시 동적 로드
  if (typeof BWD_DICT === 'undefined' && !document.getElementById('bwd-dict-loader')) {
    var s = document.createElement('script');
    s.id = 'bwd-dict-loader';
    s.src = 'js/bwd-dict.js?v=1';
    document.head.appendChild(s);
  }
})();

// 사용법 (index.html의 </body> 직전, 기존 js/*.js 스크립트들 옆에):
//   <script src="js/bwd-wordlist.js"></script>   // BWD_WORDLIST 전역
//   <script src="js/bwd-suggest.js"></script>
//
// 단어 추가 화면이 다시 렌더링돼도 문서 레벨 이벤트 위임으로 자동 재부착됨.
// → index.html 템플릿(#ne 입력창)을 수정할 필요 없음.

const BWDSuggest = (function () {
  let sorted = null;     // 사전순 정렬 배열 (prefix 이분탐색용)
  let rankMap = null;    // 단어 -> 빈도순위(작을수록 흔함)

  function build() {
    if (sorted || typeof BWD_WORDLIST === 'undefined') return;
    rankMap = Object.create(null);
    for (let i = 0; i < BWD_WORDLIST.length; i++) rankMap[BWD_WORDLIST[i]] = i;
    sorted = BWD_WORDLIST.slice().sort();
  }
  function lowerBound(p) {
    let lo = 0, hi = sorted.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < p) lo = m + 1; else hi = m; }
    return lo;
  }
  function search(prefix, limit) {
    build();
    if (!sorted) return [];
    prefix = (prefix || '').trim().toLowerCase();
    if (!prefix) return [];
    limit = limit || 6;
    const s = lowerBound(prefix), h = [];
    for (let i = s; i < sorted.length && sorted[i].startsWith(prefix); i++) h.push(sorted[i]);
    h.sort((a, b) => rankMap[a] - rankMap[b]);
    return h.slice(0, limit);
  }
  function has(word) { build(); return !!rankMap && ((word || '').trim().toLowerCase() in rankMap); }
  return { search, has, build };
})();

// ── 입력창(#ne)에 드롭다운 자동 부착 ──
(function () {
  function box() {
    let b = document.getElementById('bwd-sug');
    if (!b) {
      b = document.createElement('div');
      b.id = 'bwd-sug';
      b.style.cssText = 'position:absolute;left:0;right:56px;background:#fff;border:1.5px solid #7C3AED;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.12);z-index:9999;overflow:hidden;display:none';
      document.body.appendChild(b);
    }
    return b;
  }
  function place(ne) {
    const r = ne.getBoundingClientRect(), b = box();
    b.style.left = (window.scrollX + r.left) + 'px';
    b.style.width = r.width + 'px';
    b.style.top = (window.scrollY + r.bottom + 4) + 'px';
  }
  function render(ne) {
    const list = BWDSuggest.search(ne.value, 6), b = box();
    if (!list.length) { b.style.display = 'none'; return; }
    place(ne);
    b.innerHTML = list.map(w =>
      '<div class="bwd-it" data-w="' + w + '" style="padding:10px 14px;font-family:monospace;font-size:15px;font-weight:700;color:#111;cursor:pointer;border-bottom:1px solid #F3F4F6">' + w + '</div>'
    ).join('');
    b.style.display = 'block';
    b.querySelectorAll('.bwd-it').forEach(el => {
      el.onmouseenter = () => el.style.background = '#F5F3FF';
      el.onmouseleave = () => el.style.background = '#fff';
      el.onmousedown = (e) => {
        e.preventDefault();
        const w = el.getAttribute('data-w');
        ne.value = w;
        if (window.S) S.nEn = w;
        // 발음기호 로컬 자동 채움 (있을 때만)
        if (typeof BWD_PRON !== 'undefined' && BWD_PRON[w]) {
          const nph = document.getElementById('nph');
          if (nph) { nph.value = BWD_PRON[w]; nph.dispatchEvent(new Event('input', {bubbles:true})); }
          if (window.S) S.nPh = BWD_PRON[w];
        }
        // 한국어 뜻·예문 로컬 자동 채움 (검수 코어에 있을 때만, 빈 칸만)
        if (typeof BWD_DICT !== 'undefined' && BWD_DICT[w]) {
          const d = BWD_DICT[w];
          const nk = document.getElementById('nk2');
          if (nk && !nk.value && d.kr) { nk.value = d.kr; nk.dispatchEvent(new Event('input', {bubbles:true})); if (window.S) S.nKr = d.kr; }
          const ex1 = document.getElementById('nex1');
          if (ex1 && !ex1.value && d.ex) { ex1.value = d.ex; ex1.dispatchEvent(new Event('input', {bubbles:true})); if (window.S) S.nEx1 = d.ex; }
        }
        b.style.display = 'none';
      };
    });
  }
  // 문서 레벨 위임 → 화면 재렌더링과 무관하게 동작
  document.addEventListener('input', e => { if (e.target && e.target.id === 'ne') render(e.target); });
  document.addEventListener('focusin', e => { if (e.target && e.target.id === 'ne' && e.target.value) render(e.target); });
  document.addEventListener('click', e => {
    const b = document.getElementById('bwd-sug');
    if (b && e.target.id !== 'ne' && !b.contains(e.target)) b.style.display = 'none';
  });
})();
