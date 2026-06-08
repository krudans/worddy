// ── ButterFly Word Dictionary : 메인/단어장 화면 상단 사전 검색 배너 (앱 톤 리디자인 + 실시간 단어수) ──
(function () {
  'use strict';
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function dictCount(){try{return (typeof BWD_DICT!=='undefined')?Object.keys(BWD_DICT).length:0;}catch(e){return 0;}}
  function bannerHTML(){
    var n=dictCount();
    return ''
    +'<div id="bwd-banner-root" style="flex-shrink:0;padding:10px 12px 0">'
    +  '<div style="border-radius:16px;padding:13px 14px;background:var(--bg-card,#fff);border:1px solid var(--border,#E5E7EB);box-shadow:0 2px 10px rgba(15,23,42,.06)">'
    +    '<div style="display:flex;align-items:center;gap:10px">'
    +      svgFly(34)
    +      '<div style="flex:1;min-width:0">'
    +        '<div style="font-size:14px;font-weight:800;color:var(--text1,#111827);line-height:1.2">사전 검색</div>'
    +        '<div id="bwdb-count" style="font-size:11px;font-weight:600;color:var(--point,#1E5FA5);margin-top:1px">전체 '+n.toLocaleString()+'단어</div>'
    +      '</div>'
    +    '</div>'
    +    '<div style="display:flex;gap:8px;margin-top:11px">'
    +      '<input id="bwdb-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="단어를 검색해보세요…" oninput="bwdbSearch()" onkeydown="if(event.key===\'Enter\'){bwdbSearch();this.blur();}" style="flex:1;border:1px solid var(--border,#E5E7EB);border-radius:11px;padding:11px 13px;font-size:14px;color:var(--text1,#111827);background:var(--bg-sub,#F3F4F6);outline:none">'
    +      '<button onclick="bwdbSearch()" style="flex:none;border:none;border-radius:11px;padding:0 16px;font-size:14px;font-weight:800;color:#fff;background:var(--point,#1E5FA5);cursor:pointer">검색</button>'
    +    '</div>'
    +    '<div id="bwdb-result" style="display:none;margin-top:10px"></div>'
    +  '</div>'
    +'</div>';
  }
  function svgFly(sz){
    return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 100 100" fill="none" aria-hidden="true" style="flex:none;color:var(--point,#1E5FA5)">'
      +'<g stroke="currentColor" stroke-width="2.4" fill="rgba(30,95,165,.10)">'
      +'<path d="M50 52 C38 22 6 16 11 42 C7 64 38 62 50 52Z"/>'
      +'<path d="M50 52 C62 22 94 16 89 42 C93 64 62 62 50 52Z"/>'
      +'<path d="M50 52 C43 66 16 74 22 88 C29 99 49 80 50 58Z"/>'
      +'<path d="M50 52 C57 66 84 74 78 88 C71 99 51 80 50 58Z"/></g>'
      +'<line x1="50" y1="20" x2="50" y2="74" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  }
  window.bwdbSearch=function(){
    var inp=document.getElementById('bwdb-input');
    var res=document.getElementById('bwdb-result');
    if(!res)return;
    var en=(inp?inp.value:'').trim().toLowerCase();
    if(!en){res.style.display='none';res.innerHTML='';return;}
    if(typeof BWD_DICT==='undefined'){res.style.display='block';res.innerHTML=card('<div style="color:var(--text2,#374151);font-size:13px">사전을 불러오는 중이에요…</div>');return;}
    var d=BWD_DICT[en];
    var ph=(typeof BWD_PRON!=='undefined'&&BWD_PRON[en])?BWD_PRON[en]:'';
    res.style.display='block';
    if(!d&&!ph){res.innerHTML=card('<div style="color:var(--text1,#111827);font-size:14px;font-weight:700">"'+esc(en)+'"</div><div style="color:var(--text3,#9CA3AF);font-size:12px;margin-top:3px">사전에 아직 없는 단어예요.</div>');return;}
    var inMy=bwdbInMyBook(en);
    res.innerHTML=card(
      '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">'
      +'<span style="color:var(--text1,#111827);font-size:17px;font-weight:800">'+esc(en)+'</span>'
      +(ph?'<span style="color:var(--point,#1E5FA5);font-size:13px;font-family:monospace">['+esc(ph)+']</span>':'')
      +(d&&d.pos?'<span style="color:var(--text3,#9CA3AF);font-size:12px">'+esc(d.pos)+'</span>':'')
      +'</div>'
      +(d&&d.kr?'<div style="color:var(--text2,#374151);font-size:14px;margin-top:6px;line-height:1.5">'+esc(d.kr)+'</div>':'')
      +(d&&d.ex?'<div style="color:var(--text3,#9CA3AF);font-size:12.5px;margin-top:4px;font-style:italic">'+esc(d.ex)+'</div>':'')
      +'<button id="bwdb-add-btn" onclick="bwdbAdd(\''+esc(en)+'\')" '+(inMy?'disabled':'')+' style="margin-top:11px;width:100%;border:none;border-radius:10px;padding:11px;font-size:13px;font-weight:800;cursor:'+(inMy?'default':'pointer')+';'+(inMy?'background:var(--bg-sub,#F3F4F6);color:var(--text3,#9CA3AF)">✓ 내 단어장에 있음':'background:var(--point,#1E5FA5);color:#fff">＋ 내 단어장에 추가')+'</button>'
    );
  };
  function card(inner){return '<div style="background:var(--bg-sub,#F8FAFC);border:1px solid var(--border,#E5E7EB);border-radius:12px;padding:12px 13px">'+inner+'</div>';}
  function readMyWords(){if(typeof S!=='undefined'&&S.currentBook==='내 단어장'&&Array.isArray(S.words))return S.words;try{return JSON.parse(localStorage.getItem('wd-w')||'[]');}catch(e){return [];}}
  function bwdbInMyBook(en){return readMyWords().some(function(w){return w&&(w.en||'').toLowerCase()===en;});}
  window.bwdbAdd=function(en){
    en=(en||'').trim().toLowerCase();
    if(!en||typeof BWD_DICT==='undefined')return;
    var d=BWD_DICT[en]||{};
    var ph=(typeof BWD_PRON!=='undefined'&&BWD_PRON[en])?BWD_PRON[en]:'';
    if(!d.kr){if(window.toast)toast('뜻이 없어 추가할 수 없어요','err');return;}
    if(bwdbInMyBook(en)){if(window.toast)toast('이미 내 단어장에 있어요');return;}
    var newWord={en:en,kr:d.kr,ph:ph||'',ex:d.ex||'',exList:d.ex?[d.ex]:[],tip:en+' = '+d.kr,meanings:[d.kr],img:'📝'};
    if(typeof S!=='undefined'&&S.currentBook==='내 단어장'&&Array.isArray(S.words)){S.words.push(newWord);if(typeof srsRate==='function'&&S.srsMap&&!S.srsMap[en])srsRate(en,1);if(typeof sv==='function')sv();}
    else{var arr;try{arr=JSON.parse(localStorage.getItem('wd-w')||'[]');}catch(e){arr=[];}arr.push(newWord);try{localStorage.setItem('wd-w',JSON.stringify(arr));}catch(e){}}
    if(typeof logStudy==='function'){try{logStudy('words',en);}catch(e){}}
    if(window.toast)toast('✅ "'+en+'" 내 단어장에 추가!','ok');
    var btn=document.getElementById('bwdb-add-btn');
    if(btn){btn.disabled=true;btn.textContent='✓ 내 단어장에 있음';btn.style.background='var(--bg-sub,#F3F4F6)';btn.style.color='var(--text3,#9CA3AF)';btn.style.cursor='default';}
  };
  function updateCount(){var c=document.getElementById('bwdb-count');if(c)c.textContent='전체 '+dictCount().toLocaleString()+'단어';}
  var busy=false;
  function inject(){
    if(busy||typeof S==='undefined')return;
    var show=(S.tab==='home')||(S.tab==='mybooks'&&(!S.stab||S.stab==='books'));
    var body=document.getElementById('body');
    var existing=document.getElementById('bwd-banner-root');
    if(!show){if(existing)existing.remove();return;}
    if(existing){updateCount();return;}
    if(!body||!body.firstChild)return;
    busy=true;
    try{var wrap=document.createElement('div');wrap.innerHTML=bannerHTML();var node=wrap.firstElementChild;if(node)body.insertBefore(node,body.firstChild);}catch(e){}
    busy=false;
  }
  function start(){try{var body=document.getElementById('body')||document.body;new MutationObserver(function(){inject();}).observe(body,{childList:true});}catch(e){}inject();setInterval(inject,1200);}
  if(document.readyState!=='loading')start();else document.addEventListener('DOMContentLoaded',start);
})();