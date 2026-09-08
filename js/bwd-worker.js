/* Butterfly Word — 대용량 사전(5예문·일본어·독일어·메타) 백그라운드 로더 [부팅 지연로드 20260908]
   메인 스레드에서 25MB 객체 리터럴을 파싱하면 화면이 수십 초 멈추던 문제 → 워커에서 JSON을 받아 파싱하고
   3,000키 단위로 나눠 보내 메인 스레드는 조각을 합치기만 한다(조각당 수십 ms). */
self.onmessage = async function(e){
  var id = e.data.id, url = e.data.url, chunk = e.data.chunk || 3000;
  try{
    var r = await fetch(url, { cache: 'force-cache' });
    if(!r.ok) throw new Error('HTTP ' + r.status);
    var data = await r.json();
    var keys = Object.keys(data), total = Math.max(1, Math.ceil(keys.length / chunk));
    for(var i = 0; i < keys.length; i += chunk){
      var part = {};
      for(var j = i; j < i + chunk && j < keys.length; j++) part[keys[j]] = data[keys[j]];
      self.postMessage({ id: id, part: part, idx: Math.floor(i / chunk), total: total });
    }
    self.postMessage({ id: id, done: true, count: keys.length });
  }catch(err){ self.postMessage({ id: id, error: String(err && err.message || err) }); }
};
