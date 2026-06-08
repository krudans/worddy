// ── ButterFly Word : 내 단어장 수정 (스크롤 + XP + 버튼이름 + 학습페이지 이동) ──
(function(){
  'use strict';
  function sEl(){ return document.querySelector('.body') || document.getElementById('body'); }
  // 1) 외웠음 표시 시 스크롤 유지
  if (typeof window._renderBookWordList === 'function' && !window._renderBookWordList.__fix) {
    var oR = window._renderBookWordList;
    var nR = function(){
      var el = sEl(); var y = el ? el.scrollTop : 0;
      var r = oR.apply(this, arguments);
      var e2 = sEl(); if (e2) e2.scrollTop = y;
      requestAnimationFrame(function(){ var e3 = sEl(); if (e3) e3.scrollTop = y; });
      return r;
    };
    nR.__fix = true; window._renderBookWordList = nR;
  }
  // 2) 외웠음(mark=1)으로 새로 외운 경우 XP 지급
  if (typeof window._bwlSetMark === 'function' && !window._bwlSetMark.__fix) {
    var oM = window._bwlSetMark;
    var cnt = function(){ try { return (typeof countMemorized==='function') ? countMemorized() : null; } catch(e){ return null; } };
    var nM = function(en, mark){
      var before = cnt();
      var r = oM.apply(this, arguments);
      try { if (Number(mark)===1 && typeof addXP==='function'){ var a=cnt(); if(before==null||a==null||a>before) addXP(5); } } catch(e){}
      return r;
    };
    nM.__fix = true; window._bwlSetMark = nM;
  }
  // 3) 현재 보는 단어장 기억 (학습페이지 이동용)
  if (typeof window.showBookWordList === 'function' && !window.showBookWordList.__fix) {
    var oSB = window.showBookWordList;
    var nSB = function(book){ if (typeof book==='string' && book) window.__bwlBook = book; return oSB.apply(this, arguments); };
    nSB.__fix = true; window.showBookWordList = nSB;
  }
  // 4) 버튼 이름/동작 보정
  function relabel(){
    document.querySelectorAll('button,[onclick]').forEach(function(el){
      if (el.childElementCount > 0) return;
      var t = el.textContent || '';
      // 학습시작 → 학습시작_플래시카드
      if (/학습시작/.test(t) && !/플래시카드/.test(t) && t.trim().length <= 12){
        el.textContent = t.replace('학습시작', '학습시작_플래시카드'); return;
      }
      // 전체보기 → 학습페이지 이동 (+ 학습화면으로)
      if (/전체보기/.test(t) && !/학습페이지/.test(t)){
        el.textContent = t.replace('📋','📖').replace('전체보기','학습페이지 이동');
        if (!el.__navfix){
          el.__navfix = true;
          el.removeAttribute('onclick');
          el.addEventListener('click', function(ev){
            try { ev.stopPropagation(); } catch(e){}
            try {
              var b = window.__bwlBook;
              if (typeof selectBookAndLearn==='function' && b) selectBookAndLearn(b);
            } catch(e){}
          });
        }
      }
    });
  }
  relabel();
  if (!window.__bwlObs){
    var p=false;
    var ob=new MutationObserver(function(){ if(p)return; p=true; requestAnimationFrame(function(){ p=false; relabel(); }); });
    ob.observe(document.body, {childList:true, subtree:true});
    window.__bwlObs = ob;
  }
})();