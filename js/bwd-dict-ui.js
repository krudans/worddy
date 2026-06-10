// ── ButterFly Word DIC — 사전 검색 UI (확장형 FAB + 바텀시트) ──
// index.html 본문을 건드리지 않는 추가 스크립트.
// 로드 위치: bwd-dict.js / bwd-suggest.js / bwd-wordlist.js 뒤, </body> 앞.
//   <script src="js/bwd-dict-ui.js?v=1"></script>
// 동작:
//   - 평소엔 돋보기 아이콘(원형)만. 탭하면 "Butterfly Word DIC" 알약이 펼쳐지며 잠깐 보이고 → 검색 시트 오픈.
//   - 모든 화면에 표시, 단 게임 플레이 중에는 자동 숨김.
//   - 검색: BWDSuggest(자동완성) + BWD_DICT(뜻/예문/품사). 발음: speak(). 추가: saveWordToCurrentBook().
(function () {
  'use strict';
  if (window.__bwdDictUI) return;
  window.__bwdDictUI = true;

  var BLUE = '#1E5FA5', BLUE2 = '#1E88E5';

  // ── 안전 헬퍼 (앱 함수는 모두 feature-detect) ──
  function D() { try { return (typeof BWD_DICT !== 'undefined') ? BWD_DICT : (window.BWD_DICT || null); } catch (e) { return null; } }
  function SUG() { try { return (typeof BWDSuggest !== 'undefined') ? BWDSuggest : (window.BWDSuggest || null); } catch (e) { return null; } }
  function ST() { try { return window.S || null; } catch (e) { return null; } }
  function say(t) {
    try {
      if (typeof speak === 'function') { speak(t, 'en'); return; }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(t || ''));
        u.lang = 'en-US'; u.rate = 0.85; window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }
  function toastMsg(m, t) { try { if (typeof toast === 'function') { toast(m, t); return; } } catch (e) {} }
  function pronOf(w) {
    try {
      var P = window.BWD_PRON || window.bwdPron || (typeof BWD_PRON !== 'undefined' ? BWD_PRON : null);
      if (P && P[w]) return P[w];
    } catch (e) {}
    return '';
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function activeGame() {
    var S = ST();
    try { return !!(S && S._gameRunning && S.gameId && !S.gDone); } catch (e) { return false; }
  }
  function doSearch(prefix) {
    prefix = (prefix || '').trim().toLowerCase();
    if (!prefix) return [];
    var s = SUG();
    if (s && typeof s.search === 'function') {
      try { return s.search(prefix, 12) || []; } catch (e) {}
    }
    var d = D(); if (!d) return [];
    var out = [];
    for (var k in d) { if (k.indexOf(prefix) === 0) { out.push(k); if (out.length >= 12) break; } }
    return out;
  }

  // ── 스타일 ──
  function injectCSS() {
    if (document.getElementById('bwdui-css')) return;
    var st = document.createElement('style');
    st.id = 'bwdui-css';
    st.textContent = [
      '.bwdui-fab{position:fixed;right:16px;bottom:72px;z-index:4000;height:48px;min-width:48px;padding:0;border:none;border-radius:24px;',
      'background:linear-gradient(135deg,' + BLUE2 + ',' + BLUE + ');color:#fff;box-shadow:0 4px 14px rgba(30,95,165,.40);',
      'display:flex;align-items:center;cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent;',
      'transition:min-width .34s cubic-bezier(.2,.8,.2,1),padding .34s,box-shadow .2s;}',
      '.bwdui-fab:active{box-shadow:0 2px 8px rgba(30,95,165,.45);}',
      '.bwdui-fab-ic{font-size:22px;flex:0 0 48px;text-align:center;line-height:48px;}',
      '.bwdui-fab-label{font-size:14px;font-weight:800;white-space:nowrap;opacity:0;max-width:0;letter-spacing:.2px;',
      'transition:opacity .22s ease,max-width .34s cubic-bezier(.2,.8,.2,1);}',
      '.bwdui-fab.expanded{min-width:210px;padding-right:20px;}',
      '.bwdui-fab.expanded .bwdui-fab-label{opacity:1;max-width:210px;}',
      // 시트
      '.bwdui-wrap{position:fixed;inset:0;z-index:9998;display:none;}',
      '.bwdui-wrap.open{display:block;}',
      '.bwdui-bd{position:absolute;inset:0;background:rgba(15,23,42,.42);opacity:0;transition:opacity .25s;}',
      '.bwdui-wrap.open .bwdui-bd{opacity:1;}',
      '.bwdui-sheet{position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:20px 20px 0 0;',
      'box-shadow:0 -8px 30px rgba(0,0,0,.18);max-height:84vh;display:flex;flex-direction:column;',
      'transform:translateY(100%);transition:transform .30s cubic-bezier(.2,.8,.2,1);padding-bottom:env(safe-area-inset-bottom,0px);}',
      '.bwdui-wrap.open .bwdui-sheet{transform:translateY(0);}',
      '.bwdui-handle{width:40px;height:4px;border-radius:99px;background:#E5E7EB;margin:8px auto 4px;flex:none;}',
      '.bwdui-srow{display:flex;align-items:center;gap:8px;padding:8px 14px 12px;flex:none;}',
      '.bwdui-srow .ic{font-size:18px;color:' + BLUE + ';}',
      '.bwdui-input{flex:1;border:1.5px solid #E5E7EB;border-radius:12px;padding:11px 14px;font-size:16px;font-weight:700;',
      'font-family:monospace;outline:none;color:#111;}',
      '.bwdui-input:focus{border-color:' + BLUE2 + ';}',
      '.bwdui-x{background:#F3F4F6;border:none;border-radius:10px;width:38px;height:38px;font-size:15px;color:#6B7280;cursor:pointer;flex:none;}',
      '.bwdui-res{overflow-y:auto;padding:0 14px 16px;-webkit-overflow-scrolling:touch;}',
      '.bwdui-sug{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;cursor:pointer;}',
      '.bwdui-sug:active{background:#F3F8FF;}',
      '.bwdui-sug .w{font-size:15px;font-weight:700;color:#111;font-family:monospace;}',
      '.bwdui-sug .m{font-size:12px;color:#6B7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.bwdui-sug .chev{margin-left:auto;color:#C7CDD6;font-size:14px;}',
      // 결과 카드
      '.bwdui-card{background:#fff;border:1px solid #EEF1F5;border-radius:16px;padding:16px 16px 14px;}',
      '.bwdui-hd{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;}',
      '.bwdui-word{font-size:26px;font-weight:900;color:#111;letter-spacing:.3px;}',
      '.bwdui-ipa{font-size:14px;color:' + BLUE2 + ';font-family:monospace;}',
      '.bwdui-pos{margin-left:auto;font-size:12px;font-weight:700;color:' + BLUE + ';background:#E8F1FB;padding:4px 11px;border-radius:99px;}',
      '.bwdui-kr{font-size:18px;font-weight:800;color:#111;margin-top:12px;}',
      '.bwdui-ex{font-size:14px;color:#4B5563;line-height:1.6;background:#F7F9FC;border-radius:10px;padding:9px 12px;margin-top:9px;}',
      '.bwdui-acts{display:flex;gap:8px;margin-top:13px;flex-wrap:wrap;}',
      '.bwdui-btn{display:inline-flex;align-items:center;gap:6px;border:1.5px solid #E5E7EB;background:#fff;border-radius:11px;',
      'padding:9px 13px;font-size:13px;font-weight:700;color:#374151;cursor:pointer;}',
      '.bwdui-btn:active{background:#F3F4F6;}',
      '.bwdui-btn.pri{background:linear-gradient(135deg,' + BLUE2 + ',' + BLUE + ');color:#fff;border-color:transparent;}',
      '.bwdui-rel{margin-top:13px;padding-top:11px;border-top:1px solid #EEF1F5;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}',
      '.bwdui-rel .lb{font-size:12px;color:#9CA3AF;}',
      '.bwdui-chip{font-size:13px;color:' + BLUE + ';border:1px solid #E5E7EB;border-radius:99px;padding:4px 11px;cursor:pointer;font-family:monospace;}',
      '.bwdui-chip:active{background:#F3F8FF;}',
      '.bwdui-empty{text-align:center;color:#9CA3AF;font-size:13px;padding:26px 10px;}'
    ].join('');
    document.head.appendChild(st);
  }

  // ── DOM 생성 ──
  var fab, wrap, input, results;

  function build() {
    injectCSS();

    fab = document.createElement('button');
    fab.className = 'bwdui-fab';
    fab.setAttribute('aria-label', 'Butterfly Word 사전 검색');
    fab.innerHTML = '<span class="bwdui-fab-ic">🔍</span><span class="bwdui-fab-label">Butterfly Word DIC</span>';
    document.body.appendChild(fab);

    wrap = document.createElement('div');
    wrap.className = 'bwdui-wrap';
    wrap.innerHTML =
      '<div class="bwdui-bd"></div>' +
      '<div class="bwdui-sheet">' +
        '<div class="bwdui-handle"></div>' +
        '<div class="bwdui-srow">' +
          '<span class="ic">🔍</span>' +
          '<input class="bwdui-input" type="text" inputmode="latin" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="영어 단어 검색…">' +
          '<button class="bwdui-x" aria-label="닫기">✕</button>' +
        '</div>' +
        '<div class="bwdui-res"></div>' +
      '</div>';
    document.body.appendChild(wrap);

    input = wrap.querySelector('.bwdui-input');
    results = wrap.querySelector('.bwdui-res');

    fab.addEventListener('click', onFabClick);
    wrap.querySelector('.bwdui-bd').addEventListener('click', closeSheet);
    wrap.querySelector('.bwdui-x').addEventListener('click', closeSheet);
    input.addEventListener('input', onInput);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); var list = doSearch(input.value); if (list.length) showWord(list[0]); }
      else if (e.key === 'Escape') { closeSheet(); }
    });

    window.addEventListener('resize', positionFab);
    positionFab();
    updateVis();
  }

  function positionFab() {
    if (!fab) return;
    try {
      var nav = document.getElementById('nav');
      var ad = document.getElementById('ad-banner-fixed');
      var navH = (nav && nav.style.display !== 'none' && nav.offsetHeight) ? nav.offsetHeight : 0;
      var adH = (ad && ad.offsetHeight) ? ad.offsetHeight : 0;
      fab.style.bottom = (navH + adH + 14) + 'px';
    } catch (e) { fab.style.bottom = '72px'; }
  }

  function updateVis() {
    if (!fab) return;
    fab.style.display = activeGame() ? 'none' : 'flex';
    if (fab.style.display !== 'none') positionFab();
  }

  // ── FAB 인터랙션: 돋보기 → 알약 펼침(짧게) → 시트 ──
  function onFabClick() {
    if (!fab.classList.contains('expanded')) {
      fab.classList.add('expanded');
      setTimeout(openSheet, 400); // 알약이 펼쳐지며 풀네임이 잠깐 보인 뒤 검색 시작
    } else {
      openSheet();
    }
  }

  function openSheet() {
    if (!wrap) return;
    wrap.classList.add('open');
    input.value = '';
    renderSuggestions([]);
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 120);
  }

  function closeSheet() {
    if (!wrap) return;
    wrap.classList.remove('open');
    fab.classList.remove('expanded');
    try { input.blur(); } catch (e) {}
  }

  // ── 검색 입력 → 자동완성 ──
  function onInput() {
    var v = input.value.trim();
    if (!v) { renderSuggestions([]); return; }
    renderSuggestions(doSearch(v));
  }

  function krShort(word) {
    var d = D(); var e = d && d[word];
    return e && e.kr ? e.kr : '';
  }

  function renderSuggestions(list) {
    if (!results) return;
    if (!list || !list.length) {
      var typed = input.value.trim();
      results.innerHTML = '<div class="bwdui-empty">' + (typed ? '검색 결과가 없어요' : '영어 단어를 입력하면 추천이 떠요') + '</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var w = list[i], m = krShort(w);
      html += '<div class="bwdui-sug" data-w="' + esc(w) + '">' +
        '<span class="w">' + esc(w) + '</span>' +
        (m ? '<span class="m">' + esc(m) + '</span>' : '') +
        '<span class="chev">›</span></div>';
    }
    results.innerHTML = html;
    var nodes = results.querySelectorAll('.bwdui-sug');
    for (var j = 0; j < nodes.length; j++) {
      (function (node) { node.addEventListener('click', function () { showWord(node.getAttribute('data-w')); }); })(nodes[j]);
    }
  }

  // ── 결과 카드 ──
  function hl(ex, word) {
    if (!ex) return '';
    var safe = esc(ex);
    try {
      var re = new RegExp('(' + String(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      return safe.replace(re, '<b style="color:' + BLUE + '">$1</b>');
    } catch (e) { return safe; }
  }

  function relatedOf(word) {
    var base = String(word).slice(0, Math.min(4, word.length));
    var list = doSearch(base) || [];
    var out = [];
    for (var i = 0; i < list.length && out.length < 6; i++) { if (list[i] !== word) out.push(list[i]); }
    return out;
  }

  function showWord(word) {
    if (!results || !word) return;
    var d = D(); var e = (d && d[word]) || null;
    var ipa = pronOf(word);
    var rel = relatedOf(word);

    var html = '<div class="bwdui-card">' +
      '<div class="bwdui-hd">' +
        '<span class="bwdui-word">' + esc(word) + '</span>' +
        (ipa ? '<span class="bwdui-ipa">' + esc(ipa) + '</span>' : '') +
        (e && e.pos ? '<span class="bwdui-pos">' + esc(e.pos) + '</span>' : '') +
      '</div>';

    if (e) {
      html += '<div class="bwdui-kr">' + esc(e.kr || '') + '</div>';
      if (e.ex) html += '<div class="bwdui-ex">' + hl(e.ex, word) + '</div>';
    } else {
      html += '<div class="bwdui-ex">이 단어는 사전에 뜻이 아직 없어요. 발음과 단어장 추가는 가능해요.</div>';
    }

    html += '<div class="bwdui-acts">' +
      '<button class="bwdui-btn" data-act="speak">🔊 발음</button>' +
      '<button class="bwdui-btn pri" data-act="add">⭐ 내 단어장에 추가</button>' +
      '<button class="bwdui-btn" data-act="copy">📋 복사</button>' +
      '</div>';

    if (rel.length) {
      html += '<div class="bwdui-rel"><span class="lb">관련 단어</span>';
      for (var i = 0; i < rel.length; i++) html += '<span class="bwdui-chip" data-rel="' + esc(rel[i]) + '">' + esc(rel[i]) + '</span>';
      html += '</div>';
    }
    html += '</div>';

    results.innerHTML = html;

    var card = results.querySelector('.bwdui-card');
    card.querySelector('[data-act="speak"]').addEventListener('click', function () { say(word); });
    card.querySelector('[data-act="add"]').addEventListener('click', function () { addToBook(word); });
    card.querySelector('[data-act="copy"]').addEventListener('click', function () {
      var txt = word + (e && e.kr ? ' — ' + e.kr : '');
      try { navigator.clipboard.writeText(txt); toastMsg('📋 복사했어요'); } catch (err) { toastMsg('복사 실패'); }
    });
    var chips = card.querySelectorAll('[data-rel]');
    for (var c = 0; c < chips.length; c++) {
      (function (chip) { chip.addEventListener('click', function () { input.value = chip.getAttribute('data-rel'); showWord(chip.getAttribute('data-rel')); }); })(chips[c]);
    }
  }

  function addToBook(word) {
    var d = D(); var e = (d && d[word]) || null;
    var w = {
      en: word,
      kr: (e && e.kr) || '',
      ph: pronOf(word) || '',
      ex: (e && e.ex) || '',
      exList: (e && e.ex) ? [e.ex] : [],
      tip: word + (e && e.kr ? ' = ' + e.kr : ''),
      meanings: (e && e.kr) ? [e.kr] : [],
      img: '📖',
      pos: (e && e.pos) || ''
    };
    try {
      if (typeof wordExistsInCurrentBook === 'function' && wordExistsInCurrentBook(word)) { toastMsg('이미 있는 단어예요 (현재 단어장)'); return; }
      if (typeof saveWordToCurrentBook === 'function') saveWordToCurrentBook(w);
      else { var S = ST(); if (S) { S.words = S.words || []; S.words.push(w); } }
      var S2 = ST();
      if (typeof srsRate === 'function' && S2 && S2.srsMap && !S2.srsMap[word]) { try { srsRate(word, 1); } catch (e2) {} }
      if (typeof logStudy === 'function') { try { logStudy('words', word); } catch (e3) {} }
      if (typeof sv === 'function') sv();
      toastMsg('⭐ 내 단어장에 추가했어요');
    } catch (err) { toastMsg('추가 실패'); }
  }

  // ── 탭 전환마다 표시/위치 갱신: go() 래핑 ──
  function hookGo() {
    if (typeof window.go === 'function' && !window.go.__bwduiWrapped) {
      var orig = window.go;
      window.go = function () {
        var r = orig.apply(this, arguments);
        try { updateVis(); } catch (e) {}
        return r;
      };
      window.go.__bwduiWrapped = true;
      return true;
    }
    return false;
  }

  // ── 부팅 ──
  function boot() {
    if (!document.body) { setTimeout(boot, 60); return; }
    build();
    // go()가 아직 준비 안 됐을 수 있으니 잠깐 재시도
    var tries = 0;
    var iv = setInterval(function () {
      if (hookGo() || ++tries > 40) clearInterval(iv);
    }, 150);
    // 게임 시작/종료 등 상태 변화 대비 가벼운 주기 점검
    setInterval(updateVis, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
