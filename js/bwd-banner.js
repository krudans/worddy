// ── ButterFly Word Dictionary : 메인/단어장 화면 상단 사전 검색 배너 ──
// index.html 함수 수정 없이 동작: #body 렌더 시 홈/단어장 화면이면 배너를 최상단에 주입.
// 검색 = 로컬 BWD_DICT/BWD_PRON. "내 단어장에 추가" = addW와 동일한 단어 객체 형식 사용.
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── 배너 HTML ──
  function bannerHTML() {
    return ''
    + '<div id="bwd-banner-root" style="flex-shrink:0;padding:10px 12px 0">'
    +   '<div style="position:relative;overflow:hidden;border-radius:18px;padding:16px 16px 14px;'
    +     'background:radial-gradient(120% 140% at 12% 0%,#8b5cf6 0%,rgba(139,92,246,0) 46%),'
    +     'radial-gradient(120% 130% at 100% 100%,#b21e8f 0%,rgba(178,30,143,0) 50%),'
    +     'linear-gradient(140deg,#221a55 0%,#4c1d95 52%,#6d28d9 100%);'
    +     'box-shadow:0 10px 24px rgba(76,29,149,.35)">'
    +     '<div style="position:relative;z-index:2;display:flex;align-items:center;gap:12px">'
    +       svgFly(44, '#fcd34d')
    +       '<div style="flex:1;min-width:0">'
    +         '<div style="font-family:Georgia,serif;letter-spacing:.28em;font-size:10px;color:#fcd34d;font-weight:700;text-transform:uppercase">English · Korean</div>'
    +         '<div style="font-family:Georgia,serif;color:#fff;line-height:1.05;font-size:21px;font-weight:700">ButterFly Word <span style="color:#fcd34d">Dictionary</span></div>'
    +       '</div>'
    +     '</div>'
    +     '<div style="position:relative;z-index:2;display:flex;gap:8px;margin-top:12px">'
    +       '<input id="bwdb-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="단어를 검색해보세요…" '
    +         'oninput="bwdbSearch()" onkeydown="if(event.key===\'Enter\'){bwdbSearch();this.blur();}" '
    +         'style="flex:1;border:none;border-radius:11px;padding:11px 13px;font-size:14px;color:#3b1d6e;background:rgba(255,255,255,.95);outline:none">'
    +       '<button onclick="bwdbSearch()" style="flex:none;border:none;border-radius:11px;padding:0 15px;font-size:14px;font-weight:800;color:#5b3b00;background:linear-gradient(135deg,#fcd34d,#fbbf24);cursor:pointer">검색</button>'
    +     '</div>'
    +     '<div id="bwdb-result" style="position:relative;z-index:2;display:none;margin-top:10px"></div>'
    +   '</div>'
    + '</div>';
  }

  function svgFly(sz, col) {
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 100 100" fill="none" aria-hidden="true" style="flex:none;color:' + col + '">'
      + '<g stroke="currentColor" stroke-width="2.4" fill="rgba(252,211,77,.18)">'
      + '<path d="M50 52 C38 22 6 16 11 42 C7 64 38 62 50 52Z"/>'
      + '<path d="M50 52 C62 22 94 16 89 42 C93 64 62 62 50 52Z"/>'
      + '<path d="M50 52 C43 66 16 74 22 88 C29 99 49 80 50 58Z"/>'
      + '<path d="M50 52 C57 66 84 74 78 88 C71 99 51 80 50 58Z"/></g>'
      + '<line x1="50" y1="20" x2="50" y2="74" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  }

  // ── 검색: 로컬 사전 ──
  window.bwdbSearch = function () {
    var inp = document.getElementById('bwdb-input');
    var res = document.getElementById('bwdb-result');
    if (!res) return;
    var en = (inp ? inp.value : '').trim().toLowerCase();
    if (!en) { res.style.display = 'none'; res.innerHTML = ''; return; }
    if (typeof BWD_DICT === 'undefined') {
      res.style.display = 'block';
      res.innerHTML = card('<div style="color:#fff;font-size:13px">사전을 불러오는 중이에요…</div>');
      return;
    }
    var d = BWD_DICT[en];
    var ph = (typeof BWD_PRON !== 'undefined' && BWD_PRON[en]) ? BWD_PRON[en] : '';
    res.style.display = 'block';
    if (!d && !ph) {
      res.innerHTML = card(
        '<div style="color:#fff;font-size:14px;font-weight:700">"' + esc(en) + '"</div>'
        + '<div style="color:#e6deff;font-size:12px;margin-top:3px">사전에 아직 없는 단어예요.</div>');
      return;
    }
    var inMy = bwdbInMyBook(en);
    res.innerHTML = card(
      '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">'
      + '<span style="color:#fff;font-size:17px;font-weight:800">' + esc(en) + '</span>'
      + (ph ? '<span style="color:#fcd34d;font-size:13px;font-family:monospace">[' + esc(ph) + ']</span>' : '')
      + (d && d.pos ? '<span style="color:#cdbcf5;font-size:12px">' + esc(d.pos) + '</span>' : '')
      + '</div>'
      + (d && d.kr ? '<div style="color:#fff;font-size:14px;margin-top:6px;line-height:1.5">' + esc(d.kr) + '</div>' : '')
      + (d && d.ex ? '<div style="color:#d9cdf5;font-size:12.5px;margin-top:4px;font-style:italic">' + esc(d.ex) + '</div>' : '')
      + '<button id="bwdb-add-btn" onclick="bwdbAdd(\'' + esc(en) + '\')" ' + (inMy ? 'disabled' : '')
      + ' style="margin-top:11px;width:100%;border:none;border-radius:10px;padding:11px;font-size:13px;font-weight:800;cursor:' + (inMy ? 'default' : 'pointer') + ';'
      + (inMy
          ? 'background:rgba(255,255,255,.25);color:#e6deff">✓ 내 단어장에 있음'
          : 'background:linear-gradient(135deg,#fcd34d,#fbbf24);color:#5b3b00">＋ 내 단어장에 추가')
      + '</button>'
    );
  };

  function card(inner) {
    return '<div style="background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:12px 13px">' + inner + '</div>';
  }

  // ── 내 단어장 조회/추가 (addW와 동일 형식) ──
  function readMyWords() {
    if (typeof S !== 'undefined' && S.currentBook === '내 단어장' && Array.isArray(S.words)) return S.words;
    try { return JSON.parse(localStorage.getItem('wd-w') || '[]'); } catch (e) { return []; }
  }
  function bwdbInMyBook(en) {
    return readMyWords().some(function (w) { return w && (w.en || '').toLowerCase() === en; });
  }

  window.bwdbAdd = function (en) {
    en = (en || '').trim().toLowerCase();
    if (!en || typeof BWD_DICT === 'undefined') return;
    var d = BWD_DICT[en] || {};
    var ph = (typeof BWD_PRON !== 'undefined' && BWD_PRON[en]) ? BWD_PRON[en] : '';
    if (!d.kr) { if (window.toast) toast('뜻이 없어 추가할 수 없어요', 'err'); return; }
    if (bwdbInMyBook(en)) { if (window.toast) toast('이미 내 단어장에 있어요'); return; }

    var newWord = {
      en: en, kr: d.kr, ph: ph || '', ex: d.ex || '',
      exList: d.ex ? [d.ex] : [], tip: en + ' = ' + d.kr,
      meanings: [d.kr], img: '📝'
    };

    // 현재 책이 내 단어장이면 라이브 배열 + sv(), 아니면 wd-w 백업에 직접 추가
    if (typeof S !== 'undefined' && S.currentBook === '내 단어장' && Array.isArray(S.words)) {
      S.words.push(newWord);
      if (typeof srsRate === 'function' && S.srsMap && !S.srsMap[en]) srsRate(en, 1);
      if (typeof sv === 'function') sv();
    } else {
      var arr; try { arr = JSON.parse(localStorage.getItem('wd-w') || '[]'); } catch (e) { arr = []; }
      arr.push(newWord);
      try { localStorage.setItem('wd-w', JSON.stringify(arr)); } catch (e) {}
    }
    if (typeof logStudy === 'function') { try { logStudy('words', en); } catch (e) {} }
    if (window.toast) toast('✅ "' + en + '" 내 단어장에 추가!', 'ok');

    var btn = document.getElementById('bwdb-add-btn');
    if (btn) {
      btn.disabled = true; btn.textContent = '✓ 내 단어장에 있음';
      btn.style.background = 'rgba(255,255,255,.25)'; btn.style.color = '#e6deff'; btn.style.cursor = 'default';
    }
  };

  // ── 화면 주입 ──
  var busy = false;
  function inject() {
    if (busy || typeof S === 'undefined') return;
    var show = (S.tab === 'home') || (S.tab === 'mybooks' && (!S.stab || S.stab === 'books'));
    var body = document.getElementById('body');
    var existing = document.getElementById('bwd-banner-root');
    if (!show) { if (existing) existing.remove(); return; }
    if (existing || !body || !body.firstChild) return;
    busy = true;
    try {
      var wrap = document.createElement('div');
      wrap.innerHTML = bannerHTML();
      var node = wrap.firstElementChild;
      if (node) body.insertBefore(node, body.firstChild);
    } catch (e) {}
    busy = false;
  }

  function start() {
    try {
      var body = document.getElementById('body') || document.body;
      new MutationObserver(function () { inject(); }).observe(body, { childList: true });
    } catch (e) {}
    inject();
    setInterval(inject, 1200); // 안전망 (렌더 타이밍 누락 대비)
  }

  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
