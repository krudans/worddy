// ── ButterFly Word DIC — 사전 검색 UI v3 (확장형 FAB + 바텀시트) ──
// index.html 본문을 건드리지 않는 추가 스크립트. (bwd-dict.js / bwd-suggest.js 뒤 로드)
// v3 개선: 가독성 전면 개선 · 음성(전체발음 + 스펠링) · 스펠링/전체단어 검색.
//   - 검색: BWDSuggest(접두어/자동완성) + 부분일치 폴백 + Enter 정확검색.
//   - 음성: 🔊 전체 단어 발음 / 🔤 한 글자씩 스펠링 (speechSynthesis).
(function () {
  'use strict';
  if (window.__bwdDictUI) return;
  window.__bwdDictUI = true;

  var BLUE = '#1E5FA5', BLUE2 = '#2E86DE', INK = '#0F172A';

  // ── 안전 헬퍼 (앱 함수는 모두 feature-detect) ──
  function D() { try { return (typeof BWD_DICT !== 'undefined') ? BWD_DICT : (window.BWD_DICT || null); } catch (e) { return null; } }
  function SUG() { try { return (typeof BWDSuggest !== 'undefined') ? BWDSuggest : (window.BWDSuggest || null); } catch (e) { return null; } }
  function ST() { try { return window.S || null; } catch (e) { return null; } }
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

  // ── 음성 (Web Speech API) ──
  var _enVoice = null, _voiceTried = false;
  function pickVoice() {
    if (_voiceTried) return _enVoice;
    _voiceTried = true;
    try {
      var vs = window.speechSynthesis.getVoices() || [];
      // 선호: en-US 자연스러운 음성 → en-GB → 아무 en
      var pref = ['Google US English', 'Samantha', 'Microsoft Aria', 'Microsoft Zira', 'Karen', 'Daniel'];
      for (var p = 0; p < pref.length; p++) {
        for (var i = 0; i < vs.length; i++) { if (vs[i].name === pref[p]) { _enVoice = vs[i]; return _enVoice; } }
      }
      for (var j = 0; j < vs.length; j++) { if (/^en[-_]US/i.test(vs[j].lang)) { _enVoice = vs[j]; return _enVoice; } }
      for (var k = 0; k < vs.length; k++) { if (/^en/i.test(vs[k].lang)) { _enVoice = vs[k]; return _enVoice; } }
    } catch (e) {}
    return _enVoice;
  }
  try { if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = function(){ _voiceTried = false; pickVoice(); }; } catch (e) {}

  function _utter(text, rate) {
    var u = new SpeechSynthesisUtterance(String(text || ''));
    u.lang = 'en-US'; u.rate = rate || 0.92; u.pitch = 1;
    var v = pickVoice(); if (v) u.voice = v;
    return u;
  }
  // 전체 단어 발음
  function say(word, rate) {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(_utter(word, rate));
        return;
      }
      if (typeof speak === 'function') speak(word, 'en');
    } catch (e) {}
  }
  // 언어별 발음 (일본어/독일어 등)
  function sayLang(text, lang) {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(text || ''));
        u.lang = lang || 'en-US'; u.rate = 0.9; u.pitch = 1;
        var pre = (lang || 'en').slice(0, 2).toLowerCase();
        var vs = window.speechSynthesis.getVoices() || [];
        var v = vs.filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(pre) === 0; })[0];
        if (v) u.voice = v;
        window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }
  // 한 글자씩 스펠링 → 끝에 전체 단어 1회
  function spellOut(word) {
    try {
      if (!('speechSynthesis' in window)) { say(word); return; }
      window.speechSynthesis.cancel();
      var chars = String(word || '').replace(/[^a-zA-Z]/g, '').toUpperCase().split('');
      for (var i = 0; i < chars.length; i++) window.speechSynthesis.speak(_utter(chars[i], 0.7));
      var w = _utter(word, 0.85); w.pitch = 1.05;
      window.speechSynthesis.speak(w);
    } catch (e) {}
  }

  // ── 음성 검색 (영어 단어 / 스펠링) ──
  function startVoice(mode) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toastMsg('이 브라우저는 음성 검색을 지원하지 않아요'); return; }
    var btn = document.getElementById(mode === 'spell' ? 'bwdui-mic-spell' : 'bwdui-mic-word');
    try {
      var rec = new SR();
      rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 6;
      if (btn) btn.classList.add('rec');
      rec.onresult = function (e) {
        var alts = e.results[0], best = '';
        if (mode === 'spell') {
          var cand = '';
          for (var i = 0; i < alts.length; i++) { var tr = (alts[i].transcript || '').replace(/[^a-zA-Z]/g, ''); if (tr.length > cand.length) cand = tr; }
          best = cand.toLowerCase();
        } else {
          best = (alts[0].transcript || '').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
        }
        if (best && input) {
          input.value = best;
          if (clrBtn) clrBtn.style.display = 'block';
          var ex = exactWord(best);
          if (ex) { showWord(ex); }
          else { var list = doSearch(best); if (list.length) { showWord(list[0]); } else { renderSuggestions(doSearch(best)); } }
        } else { toastMsg('잘 못 들었어요. 다시 시도해 주세요'); }
      };
      rec.onerror = function (ev) { toastMsg('음성 인식 오류: ' + ((ev && ev.error) || '')); };
      rec.onend = function () { if (btn) btn.classList.remove('rec'); };
      rec.start();
    } catch (e) { if (btn) btn.classList.remove('rec'); toastMsg('음성 검색을 시작할 수 없어요'); }
  }

  // ── 검색: 접두어(자동완성) + 부분일치 폴백 ──
  function doSearch(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return [];
    var out = [];
    var s = SUG();
    if (s && typeof s.search === 'function') { try { out = s.search(q, 16) || []; } catch (e) {} }
    if (out.length) return out;
    // 폴백: 사전 키에서 접두어 우선 → 부분일치
    var d = D(); if (!d) return out;
    var pre = [], sub = [];
    for (var k in d) {
      var idx = k.indexOf(q);
      if (idx === 0) { if (pre.length < 16) pre.push(k); }
      else if (idx > 0) { if (sub.length < 16) sub.push(k); }
      if (pre.length >= 16) break;
    }
    return pre.concat(sub).slice(0, 16);
  }
  function exactWord(q) {
    q = (q || '').trim().toLowerCase();
    var d = D();
    if (d && d[q]) return q;
    return null;
  }

  // ── 사전 본체(BWD_DICT) 지연 로딩 ──
  var _dictLoading = false, _dictWaiters = [];
  function ensureDict(cb) {
    if (D()) { if (cb) cb(); return; }
    if (cb) _dictWaiters.push(cb);
    if (_dictLoading) return;
    _dictLoading = true;
    var s = document.createElement('script');
    s.src = 'js/bwd-dict.js?v=6';
    s.async = true;
    s.onload = function () {
      _dictLoading = false;
      var ws = _dictWaiters.slice(); _dictWaiters = [];
      for (var i = 0; i < ws.length; i++) { try { ws[i](); } catch (e) {} }
      onDictReady();
    };
    s.onerror = function () { _dictLoading = false; toastMsg('사전 데이터를 불러오지 못했어요'); };
    document.head.appendChild(s);
    if(!window.__bwdEx5Loaded){ window.__bwdEx5Loaded=true; var s2=document.createElement('script'); s2.src='js/bwd-ex5.js?cb='+Date.now(); s2.async=true; document.head.appendChild(s2); }
  }
  // ── 메타(BWD_META: cefr/origin/syn/ant) 지연 로딩 — 사전 로드 상태와 무관하게 시트 열 때 1회 ──
  var _metaLoaded = false;
  function ensureMeta() {
    if (_metaLoaded || window.__bwdMetaLoaded) return;
    _metaLoaded = true; window.__bwdMetaLoaded = true;
    ['js/bwd-meta-1.js','js/bwd-meta-2.js'].forEach(function(src){ var s=document.createElement('script'); s.src=src+'?cb='+Date.now(); s.async=true; document.head.appendChild(s); });
  }
  function onDictReady() {
    try {
      setBrand();
      if (wrap && wrap.classList.contains('open')) {
        var v = input.value.trim();
        if (v) renderSuggestions(doSearch(v));
      }
    } catch (e) {}
  }
  function setBrand() {
    var el = document.getElementById('bwdui-brand-ct');
    if (!el) return;
    var d = D();
    if (d) { try { el.textContent = Object.keys(d).length.toLocaleString() + '개 수록'; } catch (e) { el.textContent = ''; } }
    else { el.textContent = '불러오는 중…'; }
  }

  // ── 스타일 ──
  function injectCSS() {
    if (document.getElementById('bwdui-css')) return;
    var st = document.createElement('style');
    st.id = 'bwdui-css';
    st.textContent = [
      // FAB
      '.bwdui-fab{position:fixed;right:16px;bottom:72px;z-index:4000;height:50px;min-width:50px;padding:0;border:none;border-radius:25px;',
      'background:linear-gradient(135deg,' + BLUE2 + ',' + BLUE + ');color:#fff;box-shadow:0 6px 18px rgba(30,95,165,.42);',
      'display:flex;align-items:center;cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent;',
      'transition:min-width .34s cubic-bezier(.2,.8,.2,1),padding .34s,box-shadow .2s;}',
      '.bwdui-fab:active{transform:scale(.96);}',
      '.bwdui-fab-ic{font-size:23px;flex:0 0 50px;text-align:center;line-height:50px;}',
      '.bwdui-fab-label{font-size:14px;font-weight:800;white-space:nowrap;opacity:0;max-width:0;letter-spacing:.2px;',
      'transition:opacity .22s ease,max-width .34s cubic-bezier(.2,.8,.2,1);}',
      '.bwdui-fab.expanded{min-width:208px;padding-right:20px;}',
      '.bwdui-fab.expanded .bwdui-fab-label{opacity:1;max-width:208px;}',
      // 시트
      '.bwdui-wrap{position:fixed;inset:0;z-index:9998;display:none;}',
      '.bwdui-wrap.open{display:block;}',
      '.bwdui-bd{position:absolute;inset:0;background:rgba(15,23,42,.46);opacity:0;transition:opacity .25s;}',
      '.bwdui-wrap.open .bwdui-bd{opacity:1;}',
      '.bwdui-sheet{position:absolute;left:0;right:0;bottom:0;background:#F8FAFC;border-radius:22px 22px 0 0;',
      'box-shadow:0 -10px 34px rgba(0,0,0,.20);max-height:88vh;display:flex;flex-direction:column;',
      'transform:translateY(100%);transition:transform .30s cubic-bezier(.2,.8,.2,1);padding-bottom:env(safe-area-inset-bottom,0px);}',
      '.bwdui-wrap.open .bwdui-sheet{transform:translateY(0);}',
      '.bwdui-handle{width:42px;height:5px;border-radius:99px;background:#D1D9E2;margin:9px auto 2px;flex:none;}',
      // 헤더
      '.bwdui-top{display:flex;align-items:center;gap:8px;padding:6px 16px 2px;flex:none;}',
      '.bwdui-logo{font-size:15px;font-weight:900;color:' + BLUE + ';letter-spacing:.2px;}',
      '.bwdui-ct{font-size:11px;font-weight:700;color:#94A3B8;background:#EEF3F9;padding:3px 9px;border-radius:99px;}',
      '.bwdui-x{margin-left:auto;background:#EDF1F6;border:none;border-radius:11px;width:36px;height:36px;font-size:15px;color:#64748B;cursor:pointer;flex:none;}',
      '.bwdui-brand{font-size:13px;font-weight:900;color:#fff;background:var(--theme,#2E86DE);padding:6px 13px;border-radius:99px;letter-spacing:.2px;box-shadow:0 2px 8px rgba(0,0,0,.12);}',
      '.bwdui-mic{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;width:52px;height:52px;border:1.5px solid var(--theme,#2E86DE);background:var(--theme-tint,#EAF3FC);color:var(--theme,#2E86DE);border-radius:14px;cursor:pointer;transition:transform .1s;}',
      '.bwdui-mic:active{transform:scale(.94);}',
      '.bwdui-mic.rec{background:var(--theme,#2E86DE);color:#fff;animation:bwduiPulse 1s infinite;}',
      '.bwdui-mic .mi{font-size:18px;line-height:1;}',
      '.bwdui-mic .ml{font-size:9px;font-weight:800;line-height:1;}',
      '@keyframes bwduiPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,0,0,.18);}50%{box-shadow:0 0 0 6px rgba(0,0,0,0);}}',
      // 검색창
      '.bwdui-srow{display:flex;align-items:center;gap:9px;padding:10px 16px 6px;flex:none;}',
      '.bwdui-sbox{flex:1;display:flex;align-items:center;gap:9px;background:#fff;border:1.5px solid #E2E8F0;border-radius:14px;padding:0 13px;transition:border-color .15s,box-shadow .15s;}',
      '.bwdui-sbox.foc{border-color:' + BLUE2 + ';box-shadow:0 0 0 3px rgba(46,134,222,.12);}',
      '.bwdui-sbox .ic{font-size:17px;color:' + BLUE2 + ';flex:none;}',
      '.bwdui-input{flex:1;border:none;background:transparent;padding:13px 0;font-size:17px;font-weight:700;',
      'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;outline:none;color:' + INK + ';min-width:0;}',
      '.bwdui-clr{background:none;border:none;font-size:15px;color:#CBD5E1;cursor:pointer;flex:none;padding:4px;}',
      '.bwdui-hint{font-size:11px;color:#94A3B8;padding:0 18px 8px;flex:none;}',
      '.bwdui-res{flex:1;min-height:0;overflow-y:auto;padding:4px 12px 18px;-webkit-overflow-scrolling:touch;}',
      // 추천 목록
      '.bwdui-sug{display:flex;align-items:center;gap:11px;padding:12px 12px;border-radius:13px;cursor:pointer;background:#fff;border:1px solid #EEF2F7;margin-bottom:7px;}',
      '.bwdui-sug:active{background:#F0F7FF;border-color:#CFE3FB;}',
      '.bwdui-sug .spk{flex:none;width:34px;height:34px;border-radius:10px;border:none;background:#EAF3FC;color:' + BLUE + ';font-size:15px;cursor:pointer;}',
      '.bwdui-sug .tx{flex:1;min-width:0;}',
      '.bwdui-sug .w{font-size:16px;font-weight:800;color:' + INK + ';font-family:ui-monospace,Menlo,monospace;}',
      '.bwdui-sug .m{font-size:13px;color:#64748B;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px;}',
      '.bwdui-sug .chev{margin-left:auto;color:#CBD5E1;font-size:17px;flex:none;}',
      // 결과 카드
      '.bwdui-card{background:#fff;border:1px solid #EAEFF5;border-radius:18px;padding:18px 17px 16px;box-shadow:0 2px 10px rgba(15,23,42,.05);}',
      '.bwdui-hd{display:flex;align-items:baseline;gap:11px;flex-wrap:wrap;}',
      '.bwdui-word{font-size:30px;font-weight:900;color:' + INK + ';letter-spacing:.3px;line-height:1.1;}',
      '.bwdui-ipa{font-size:15px;color:#64748B;font-family:ui-monospace,Menlo,monospace;}',
      '.bwdui-pos{margin-left:auto;align-self:flex-start;font-size:12px;font-weight:800;color:' + BLUE + ';background:#E8F1FB;padding:5px 12px;border-radius:99px;}',
      // 음성 버튼
      '.bwdui-audio{display:flex;gap:9px;margin-top:15px;}',
      '.bwdui-au{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:none;border-radius:13px;',
      'padding:13px 10px;font-size:14px;font-weight:800;cursor:pointer;-webkit-tap-highlight-color:transparent;}',
      '.bwdui-au:active{transform:scale(.97);}',
      '.bwdui-au.say{background:linear-gradient(135deg,' + BLUE2 + ',' + BLUE + ');color:#fff;box-shadow:0 4px 12px rgba(30,95,165,.30);}',
      '.bwdui-au.spell{background:#EFF6FF;color:' + BLUE + ';border:1.5px solid #CFE3FB;}',
      // 뜻
      '.bwdui-mlb{font-size:11px;font-weight:800;color:#94A3B8;margin-top:18px;letter-spacing:.3px;}',
      '.bwdui-kr{font-size:20px;font-weight:800;color:' + INK + ';margin-top:5px;line-height:1.45;}',
      '.bwdui-krline{display:flex;align-items:flex-start;gap:8px;font-size:18px;font-weight:700;color:' + INK + ';margin-top:6px;line-height:1.5;}',
      '.bwdui-krline .n{flex:none;font-size:12px;font-weight:800;color:#fff;background:' + BLUE2 + ';min-width:19px;height:19px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;margin-top:3px;}',
      // 예문
      '.bwdui-exwrap{margin-top:14px;background:#F6F9FC;border:1px solid #EBF1F7;border-radius:13px;padding:12px 13px;display:flex;gap:10px;align-items:flex-start;}',
      '.bwdui-ex{flex:1;font-size:15px;color:#334155;line-height:1.65;}',
      '.bwdui-explay{flex:none;width:32px;height:32px;border-radius:9px;border:none;background:#fff;border:1px solid #E2E8F0;color:' + BLUE + ';font-size:14px;cursor:pointer;}',
      // 보조 액션
      '.bwdui-acts{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;}',
      '.bwdui-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1.5px solid #E2E8F0;background:#fff;border-radius:12px;',
      'padding:11px 12px;font-size:13px;font-weight:800;color:#475569;cursor:pointer;}',
      '.bwdui-btn:active{background:#F1F5F9;}',
      '.bwdui-btn.add{background:#FFF7E6;border-color:#FCE2A8;color:#B45309;}',
      // 관련 단어
      '.bwdui-rel{margin-top:16px;padding-top:13px;border-top:1px solid #EEF2F7;}',
      '.bwdui-rel .lb{font-size:11px;font-weight:800;color:#94A3B8;letter-spacing:.3px;}',
      '.bwdui-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px;}',
      '.bwdui-chip{font-size:13px;font-weight:700;color:' + BLUE + ';background:#F1F7FD;border:1px solid #DCEAF8;border-radius:99px;padding:6px 13px;cursor:pointer;font-family:ui-monospace,Menlo,monospace;}',
      '.bwdui-chip:active{background:#E1EFFB;}',
      '.bwdui-empty{text-align:center;color:#94A3B8;font-size:14px;padding:34px 16px;line-height:1.6;}',
      '.bwdui-empty .big{font-size:34px;display:block;margin-bottom:8px;}',
      '.bwdui-mlrow{margin-top:8px;background:#F6F9FC;border:1px solid #EBF1F7;border-radius:13px;padding:10px 13px;display:flex;align-items:center;gap:10px;}',
      '.bwdui-mlflag{font-size:11px;font-weight:800;color:#64748B;min-width:58px;flex:none;}',
      '.bwdui-mllabel{flex:1;font-size:17px;font-weight:800;color:' + INK + ';}',
      '.bwdui-mlsub{font-size:12px;font-weight:500;color:#94A3B8;margin-left:5px;}',
      '.bwdui-mlau{flex:none;width:32px;height:32px;border-radius:9px;border:1px solid #E2E8F0;background:#fff;color:' + BLUE + ';font-size:14px;cursor:pointer;}',
      '.bwdui-metainfo{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px;}',
      '.bwdui-cefr{font-size:12px;font-weight:800;color:#fff;background:#7C3AED;border-radius:7px;padding:3px 9px;flex:none;}',
      '.bwdui-origin{font-size:13px;color:#64748B;line-height:1.5;}',
      '.bwdui-chip-syn{background:#ECFDF5;border-color:#A7F3D0;color:#047857;}',
      '.bwdui-chip-ant{background:#FEF2F2;border-color:#FECACA;color:#B91C1C;}'
    ].join('');
    document.head.appendChild(st);
  }

  // ── DOM 생성 ──
  var fab, wrap, input, results, sbox, clrBtn;

  function build() {
    injectCSS();

    fab = document.createElement('button');
    fab.className = 'bwdui-fab';
    fab.setAttribute('aria-label', 'Butterfly Word 사전 검색');
    fab.innerHTML = '<span class="bwdui-fab-ic">🔍</span><span class="bwdui-fab-label">단어 사전 검색</span>';
    document.body.appendChild(fab);

    wrap = document.createElement('div');
    wrap.className = 'bwdui-wrap';
    wrap.innerHTML =
      '<div class="bwdui-bd"></div>' +
      '<div class="bwdui-sheet">' +
        '<div class="bwdui-handle"></div>' +
        '<div class="bwdui-top">' +
          '<span class="bwdui-brand">📖 Butterfly Word Dictionary</span>' +
          '<span class="bwdui-ct" id="bwdui-brand-ct"></span>' +
          '<button class="bwdui-x" aria-label="닫기">✕</button>' +
        '</div>' +
        '<div class="bwdui-srow">' +
          '<div class="bwdui-sbox">' +
            '<span class="ic">🔍</span>' +
            '<input class="bwdui-input" type="text" inputmode="latin" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="영어 단어를 입력하세요">' +
            '<button class="bwdui-clr" aria-label="지우기" style="display:none">✕</button>' +
          '</div>' +
          '<button class="bwdui-mic" id="bwdui-mic-word" title="영어 음성 검색" aria-label="영어 음성 검색"><span class="mi">🎤</span><span class="ml">영어</span></button>' +
          '<button class="bwdui-mic" id="bwdui-mic-spell" title="스펠링 음성 검색" aria-label="스펠링 음성 검색"><span class="mi">🔤</span><span class="ml">스펠</span></button>' +
        '</div>' +
        '<div class="bwdui-hint">🎤 영어 음성 · 🔤 스펠링(한 글자씩 말하기)으로도 검색 · Enter로 바로 찾기</div>' +
        '<div class="bwdui-res"></div>' +
      '</div>';
    document.body.appendChild(wrap);

    input = wrap.querySelector('.bwdui-input');
    results = wrap.querySelector('.bwdui-res');
    sbox = wrap.querySelector('.bwdui-sbox');
    clrBtn = wrap.querySelector('.bwdui-clr');

    fab.addEventListener('click', onFabClick);
    wrap.querySelector('.bwdui-bd').addEventListener('click', closeSheet);
    wrap.querySelector('.bwdui-x').addEventListener('click', closeSheet);
    input.addEventListener('input', onInput);
    input.addEventListener('focus', function () { sbox.classList.add('foc'); });
    input.addEventListener('blur', function () { sbox.classList.remove('foc'); });
    clrBtn.addEventListener('click', function () { input.value = ''; clrBtn.style.display = 'none'; renderSuggestions([]); input.focus(); });
    var micW = wrap.querySelector('#bwdui-mic-word'); if (micW) micW.addEventListener('click', function () { startVoice('word'); });
    var micS = wrap.querySelector('#bwdui-mic-spell'); if (micS) micS.addEventListener('click', function () { startVoice('spell'); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var v = input.value.trim();
        if (!v) return;
        var ex = exactWord(v);
        if (ex) { showWord(ex); return; }
        var list = doSearch(v);
        if (list.length) showWord(list[0]);
        else renderSuggestions([]);
      } else if (e.key === 'Escape') { closeSheet(); }
    });

    window.addEventListener('resize', positionFab);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitViewport);
      window.visualViewport.addEventListener('scroll', fitViewport);
    }
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

  function onFabClick() {
    if (!fab.classList.contains('expanded')) {
      fab.classList.add('expanded');
      setTimeout(openSheet, 380);
    } else {
      openSheet();
    }
  }

  function fitViewport() {
    if (!wrap || !wrap.classList.contains('open')) return;
    var sheet = wrap.querySelector('.bwdui-sheet');
    if (!sheet) return;
    var vv = window.visualViewport;
    if (vv) {
      // 키보드가 차지하는 높이만큼 시트를 위로 올리고, 보이는 영역에 높이를 맞춤
      var kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      sheet.style.bottom = kb + 'px';
      sheet.style.maxHeight = Math.round(vv.height * 0.94) + 'px';
    }
  }

  function openSheet() {
    if (!wrap) return;
    wrap.classList.add('open');
    ensureDict();
    ensureMeta();
    setBrand();
    input.value = '';
    clrBtn.style.display = 'none';
    renderSuggestions([]);
    setTimeout(function () { try { input.focus(); } catch (e) {} fitViewport(); }, 140);
    setTimeout(fitViewport, 360);
  }

  function closeSheet() {
    if (!wrap) return;
    wrap.classList.remove('open');
    fab.classList.remove('expanded');
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    try { input.blur(); } catch (e) {}
    var sheet = wrap.querySelector('.bwdui-sheet');
    if (sheet) { sheet.style.bottom = ''; sheet.style.maxHeight = ''; }
  }

  // ── 검색 입력 → 자동완성 ──
  function onInput() {
    var v = input.value.trim();
    clrBtn.style.display = v ? 'block' : 'none';
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
      results.innerHTML = '<div class="bwdui-empty"><span class="big">' + (typed ? '🔎' : '📖') + '</span>' +
        (typed ? '“' + esc(typed) + '” 검색 결과가 없어요.<br>철자를 확인하거나 다른 단어를 입력해 보세요.'
               : '찾고 싶은 영어 단어를 입력해 보세요.<br>뜻 · 발음 · 예문을 한 번에 보여드려요.') + '</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var w = list[i], m = krShort(w);
      html += '<div class="bwdui-sug" data-w="' + esc(w) + '">' +
        '<button class="spk" data-spk="' + esc(w) + '" aria-label="발음">🔊</button>' +
        '<div class="tx"><div class="w">' + esc(w) + '</div>' +
        (m ? '<div class="m">' + esc(m) + '</div>' : '') + '</div>' +
        '<span class="chev">›</span></div>';
    }
    results.innerHTML = html;
    var nodes = results.querySelectorAll('.bwdui-sug');
    for (var j = 0; j < nodes.length; j++) {
      (function (node) {
        node.addEventListener('click', function () { showWord(node.getAttribute('data-w')); });
        var spk = node.querySelector('.spk');
        if (spk) spk.addEventListener('click', function (ev) { ev.stopPropagation(); say(spk.getAttribute('data-spk')); });
      })(nodes[j]);
    }
  }

  // ── 결과 카드 ──
  function hl(ex, word) {
    if (!ex) return '';
    var safe = esc(ex);
    try {
      var re = new RegExp('(' + String(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      return safe.replace(re, '<b style="color:' + BLUE + ';font-weight:800">$1</b>');
    } catch (e) { return safe; }
  }

  function relatedOf(word) {
    var base = String(word).slice(0, Math.min(4, word.length));
    var list = doSearch(base) || [];
    var out = [];
    for (var i = 0; i < list.length && out.length < 8; i++) { if (list[i] !== word) out.push(list[i]); }
    return out;
  }

  function krLines(kr) {
    var parts = String(kr || '').split(/[,;·∙、/]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (parts.length <= 1) return '<div class="bwdui-kr">' + esc(kr || '') + '</div>';
    var h = '';
    for (var i = 0; i < parts.length; i++) {
      h += '<div class="bwdui-krline"><span class="n">' + (i + 1) + '</span><span>' + esc(parts[i]) + '</span></div>';
    }
    return h;
  }

  function showWord(word) {
    if (!results || !word) return;
    if (!D()) {
      results.innerHTML = '<div class="bwdui-empty"><span class="big">⏳</span>사전 데이터를 불러오는 중…</div>';
      ensureDict(function () { showWord(word); });
      return;
    }
    input.value = word; clrBtn.style.display = 'block';
    var d = D(); var e = (d && d[word]) || null;
    var x5 = (window.BWD_EX5 && window.BWD_EX5[word]) || null;
    var x5img = (x5 && x5.img) ? x5.img : '';
    var ipa = pronOf(word);
    var rel = relatedOf(word);

    var html = '<div class="bwdui-card">' +
      '<div class="bwdui-hd">' +
        (x5img ? '<span class="bwdui-emoji" style="font-size:26px;margin-right:7px;vertical-align:middle">' + x5img + '</span>' : '') +
        '<span class="bwdui-word">' + esc(word) + '</span>' +
        (ipa ? '<span class="bwdui-ipa">' + esc(ipa) + '</span>' : '') +
        (e && e.pos ? '<span class="bwdui-pos">' + esc(e.pos) + '</span>' : '') +
      '</div>' +
      '<div class="bwdui-audio">' +
        '<button class="bwdui-au say" data-act="say">🔊 발음 듣기</button>' +
        '<button class="bwdui-au spell" data-act="spell">🔤 스펠링</button>' +
      '</div>';

    if (e && e.kr) {
      html += '<div class="bwdui-mlb">뜻</div>' + krLines(e.kr);
    } else {
      html += '<div class="bwdui-exwrap"><div class="bwdui-ex">이 단어는 사전에 뜻이 아직 없어요. 발음과 단어장 추가는 가능해요.</div></div>';
    }

    // 다른 언어 (일본어/독일어)
    var jaW = (window.BWD_JA && window.BWD_JA[word]) || null;
    var deW = (window.BWD_DE && window.BWD_DE[word]) || null;
    if (jaW || deW) {
      html += '<div class="bwdui-mlb">다른 언어</div>';
      if (jaW && jaW.label) {
        var jaSub = [jaW.kanji, jaW.roma].filter(Boolean).join(' · ');
        html += '<div class="bwdui-mlrow"><span class="bwdui-mlflag">🇯🇵 일본어</span>' +
          '<span class="bwdui-mllabel">' + esc(jaW.label) + (jaSub ? '<span class="bwdui-mlsub">' + esc(jaSub) + '</span>' : '') + '</span>' +
          '<button class="bwdui-mlau" data-mlsay="' + esc(jaW.label) + '" data-mllang="ja-JP" aria-label="일본어 발음">🔊</button></div>';
      }
      if (deW && deW.label) {
        var deSub = [deW.gender, deW.plural ? ('복수 ' + deW.plural) : ''].filter(Boolean).join(' · ');
        html += '<div class="bwdui-mlrow"><span class="bwdui-mlflag">🇩🇪 독일어</span>' +
          '<span class="bwdui-mllabel">' + esc(deW.label) + (deSub ? '<span class="bwdui-mlsub">' + esc(deSub) + '</span>' : '') + '</span>' +
          '<button class="bwdui-mlau" data-mlsay="' + esc(deW.label) + '" data-mllang="de-DE" aria-label="독일어 발음">🔊</button></div>';
      }
    }

    // 난이도(CEFR)·어원·유의어·반의어 (BWD_META)
    var meta = (window.BWD_META && window.BWD_META[word]) || null;
    if (meta) {
      if (meta.cefr || meta.origin) {
        html += '<div class="bwdui-mlb">난이도 · 어원</div><div class="bwdui-metainfo">';
        if (meta.cefr) html += '<span class="bwdui-cefr">' + esc(meta.cefr) + '</span>';
        if (meta.origin) html += '<span class="bwdui-origin">' + esc(meta.origin) + '</span>';
        html += '</div>';
      }
      if (meta.syn && meta.syn.length) {
        html += '<div class="bwdui-mlb">유의어</div><div class="bwdui-chips">';
        for (var syi = 0; syi < meta.syn.length; syi++) html += '<span class="bwdui-chip bwdui-chip-syn" data-rel="' + esc(meta.syn[syi]) + '">' + esc(meta.syn[syi]) + '</span>';
        html += '</div>';
      }
      if (meta.ant && meta.ant.length) {
        html += '<div class="bwdui-mlb">반의어</div><div class="bwdui-chips">';
        for (var ati = 0; ati < meta.ant.length; ati++) html += '<span class="bwdui-chip bwdui-chip-ant" data-rel="' + esc(meta.ant[ati]) + '">' + esc(meta.ant[ati]) + '</span>';
        html += '</div>';
      }
    }

    if (x5 && x5.ex5 && x5.ex5.length) {
      var FCOL = ['#3B82F6','#10B981','#8B5CF6','#F97316','#EC4899'];
      html += '<div class="bwdui-mlb">문장 5형식</div>';
      for (var fi = 0; fi < x5.ex5.length; fi++) {
        var sx = x5.ex5[fi]; var col = FCOL[(sx.t||1)-1] || '#3B82F6';
        html += '<div class="bwdui-exwrap" style="margin-top:8px">' +
          '<div style="flex:none;width:34px;height:24px;border-radius:7px;background:' + col + ';color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center">' + (sx.t||'') + '형</div>' +
          '<div class="bwdui-ex" style="flex:1">' + hl(sx.en, word) + '<div style="font-size:13px;color:#94A3B8;margin-top:3px">' + esc(sx.kr||'') + '</div></div>' +
          '<button class="bwdui-explay" data-exsay="' + esc(sx.en) + '" aria-label="문장 듣기">🔊</button>' +
        '</div>';
      }
    } else if (e && e.ex) {
      html += '<div class="bwdui-mlb">예문</div>' +
        '<div class="bwdui-exwrap">' +
          '<div class="bwdui-ex">' + hl(e.ex, word) + '</div>' +
          '<button class="bwdui-explay" data-act="exsay" aria-label="예문 듣기">🔊</button>' +
        '</div>';
    }

    html += '<div class="bwdui-acts">' +
      '<button class="bwdui-btn add" data-act="add">⭐ 내 단어장에 추가</button>' +
      '<button class="bwdui-btn" data-act="copy">📋 복사</button>' +
      '</div>';

    if (rel.length) {
      html += '<div class="bwdui-rel"><span class="lb">관련 단어</span><div class="bwdui-chips">';
      for (var i = 0; i < rel.length; i++) html += '<span class="bwdui-chip" data-rel="' + esc(rel[i]) + '">' + esc(rel[i]) + '</span>';
      html += '</div></div>';
    }
    html += '</div>';

    results.innerHTML = html;
    results.scrollTop = 0;

    var card = results.querySelector('.bwdui-card');
    card.querySelector('[data-act="say"]').addEventListener('click', function () { say(word); });
    card.querySelector('[data-act="spell"]').addEventListener('click', function () { spellOut(word); });
    var exb = card.querySelector('[data-act="exsay"]');
    if (exb) exb.addEventListener('click', function () { say(e.ex, 0.9); });
    var exsayBtns = card.querySelectorAll('[data-exsay]');
    for (var xi = 0; xi < exsayBtns.length; xi++) { (function (b) { b.addEventListener('click', function () { say(b.getAttribute('data-exsay'), 0.9); }); })(exsayBtns[xi]); }
    var mlBtns = card.querySelectorAll('[data-mlsay]');
    for (var mli = 0; mli < mlBtns.length; mli++) { (function (b) { b.addEventListener('click', function () { sayLang(b.getAttribute('data-mlsay'), b.getAttribute('data-mllang')); }); })(mlBtns[mli]); }
    card.querySelector('[data-act="add"]').addEventListener('click', function () { addToBook(word); });
    card.querySelector('[data-act="copy"]').addEventListener('click', function () {
      var txt = word + (e && e.kr ? ' — ' + e.kr : '');
      try { navigator.clipboard.writeText(txt); toastMsg('📋 복사했어요'); } catch (err) { toastMsg('복사 실패'); }
    });
    var chips = card.querySelectorAll('[data-rel]');
    for (var c = 0; c < chips.length; c++) {
      (function (chip) { chip.addEventListener('click', function () { showWord(chip.getAttribute('data-rel')); }); })(chips[c]);
    }
  }

  function _bwduiMyWords() { try { return JSON.parse(localStorage.getItem('wd-w') || '[]'); } catch (e) { return []; } }
  function _bwduiSaveMyWords(arr) {
    try { localStorage.setItem('wd-w', JSON.stringify(arr)); } catch (e) {}
    var S = ST(); if (S && S.currentBook === '내 단어장') { S.words = arr.slice(); }
  }
  function _bwduiBuildW(word) {
    var d = D(); var e = (d && d[word]) || null;
    var x5 = (window.BWD_EX5 && window.BWD_EX5[word]) || null;
    var exList = (x5 && x5.ex5 && x5.ex5.length) ? x5.ex5.map(function (s) { return s.en; }) : ((e && e.ex) ? [e.ex] : []);
    return {
      en: word, kr: (e && e.kr) || '', ph: pronOf(word) || '', ex: (e && e.ex) || '',
      exList: exList, tip: word + (e && e.kr ? ' = ' + e.kr : ''),
      meanings: (e && e.kr) ? [e.kr] : [], img: (x5 && x5.img) ? x5.img : '📖', pos: (e && e.pos) || '',
      ex5: (x5 && x5.ex5) ? x5.ex5 : null
    };
  }
  // 기본: 내 단어장에 저장 → 이후 다른 단어장으로 옮기기 픽커
  function addToBook(word) {
    try {
      var w = _bwduiBuildW(word);
      var arr = _bwduiMyWords();
      var exists = arr.some(function (x) { return x.en === word; });
      if (!exists) {
        arr.push(w); _bwduiSaveMyWords(arr);
        if (typeof logStudy === 'function') { try { logStudy('words', word); } catch (e3) {} }
        if (typeof sv === 'function') sv();
        try { var S = ST(); if (typeof go === 'function' && S && S.tab === 'mybooks') go(); } catch (e4) {}
        toastMsg('⭐ 내 단어장에 추가했어요');
      }
      _bwduiOpenPicker(word, w, exists);
    } catch (err) { toastMsg('추가 실패'); }
  }

  var _bwduiPickWord = null, _bwduiPickW = null;
  function _bwduiOpenPicker(word, w, already) {
    _bwduiPickWord = word; _bwduiPickW = w;
    var S = ST();
    var custom = (S && Array.isArray(S.books)) ? S.books.filter(function (b) { return !b.packId && !b.fromMarket; }) : [];
    var rows = '';
    custom.forEach(function (b) {
      var idx = S.books.indexOf(b);
      rows += '<button onclick="window.__bwduiMove(' + idx + ')" style="text-align:left;padding:12px 14px;background:var(--theme-tint,#F1F5F9);border:1.5px solid var(--theme-soft,#E2E8F0);border-radius:12px;font-size:14px;font-weight:700;color:var(--theme,#1E5FA5);cursor:pointer">📓 ' + esc(b.name) + '</button>';
    });
    if (!custom.length) rows = '<div style="font-size:12px;color:#94A3B8;padding:4px 2px 2px">아직 만든 단어장이 없어요. 아래에서 새로 만들 수 있어요.</div>';
    var ov = document.getElementById('bwdui-picker'); if (ov) ov.remove();
    ov = document.createElement('div');
    ov.id = 'bwdui-picker';
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.42);display:flex;align-items:flex-end;justify-content:center';
    ov.innerHTML =
      '<div style="background:#fff;width:100%;max-width:480px;border-radius:18px 18px 0 0;padding:16px 16px 22px;box-shadow:0 -4px 22px rgba(0,0,0,.22)">' +
        '<div style="font-size:15px;font-weight:900;color:#111;margin-bottom:3px">' + (already ? 'ℹ️ 이미 내 단어장에 있어요' : '⭐ 내 단어장에 추가됨') + '</div>' +
        '<div style="font-size:12px;color:#64748B;margin-bottom:13px">\'' + esc(word) + '\' · 다른 단어장에 넣으려면 선택하세요</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;max-height:42vh;overflow:auto">' + rows +
          '<button onclick="window.__bwduiNewBook()" style="text-align:left;padding:12px 14px;background:#fff;border:1.5px dashed var(--theme,#1E5FA5);border-radius:12px;font-size:14px;font-weight:800;color:var(--theme,#1E5FA5);cursor:pointer">➕ 새 단어장 만들기</button>' +
        '</div>' +
        '<button onclick="window.__bwduiClosePicker()" style="margin-top:13px;width:100%;padding:13px;background:var(--theme,#1E5FA5);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer">내 단어장에 그대로 두기</button>' +
      '</div>';
    ov.addEventListener('click', function (ev) { if (ev.target === ov) window.__bwduiClosePicker(); });
    document.body.appendChild(ov);
  }
  window.__bwduiClosePicker = function () { var o = document.getElementById('bwdui-picker'); if (o) o.remove(); };
  function _bwduiMoveOut() {
    var arr = _bwduiMyWords().filter(function (x) { return x.en !== _bwduiPickWord; });
    _bwduiSaveMyWords(arr);
  }
  window.__bwduiMove = function (idx) {
    var S = ST(); if (!S || !Array.isArray(S.books) || !S.books[idx]) { toastMsg('단어장을 찾을 수 없어요'); return; }
    var bk = S.books[idx];
    bk.words = bk.words || []; bk.markMap = bk.markMap || {};
    if (!bk.words.some(function (x) { return x.en === _bwduiPickWord; })) bk.words.push(_bwduiPickW);
    _bwduiMoveOut();
    if (typeof sv === 'function') sv();
    try { if (typeof go === 'function' && S.tab === 'mybooks') go(); } catch (e) {}
    window.__bwduiClosePicker();
    toastMsg('📓 \'' + bk.name + '\'(으)로 옮겼어요');
  };
  window.__bwduiNewBook = function () {
    var name = prompt('새 단어장 이름을 입력하세요');
    if (name == null) return;
    name = String(name).trim();
    if (!name) { toastMsg('이름을 입력하세요'); return; }
    var S = ST(); if (!S) return;
    if (!Array.isArray(S.books)) S.books = [];
    if (name === '내 단어장' || S.books.find(function (b) { return b.name === name; })) { toastMsg('이미 있는 이름이에요'); return; }
    if (S.books.length >= 10) { toastMsg('단어장은 최대 10개까지예요'); return; }
    S.books.push({ name: name, words: [_bwduiPickW], markMap: {}, learned: [] });
    _bwduiMoveOut();
    if (typeof sv === 'function') sv();
    try { if (typeof go === 'function' && S.tab === 'mybooks') go(); } catch (e) {}
    window.__bwduiClosePicker();
    toastMsg('✅ \'' + name + '\' 단어장에 추가했어요');
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
    try { if ('speechSynthesis' in window) window.speechSynthesis.getVoices(); } catch (e) {}
    var tries = 0;
    var iv = setInterval(function () {
      if (hookGo() || ++tries > 40) clearInterval(iv);
    }, 150);
    setInterval(updateVis, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
