/* Butterfly Word — 단어사전 이모지 + 5형식 예문 오버레이 (bwd-ex5.js)
 * BWD_DICT[word] 에 병합: { img:이모지, ex5:[{t,en,kr}×5] }
 * 이모지 = 단어와 모양·색이 닮은 것. 5형식 = 1~5형식 각 1문장, 단어가 문장에 등장.
 * bwd-dict.js 안 건드리는 별도 파일. 알파벳순. Claude 직접 작성.
 */
window.BWD_EX5 = Object.assign(window.BWD_EX5||{}, {
  "a": {img:"🅰️", ex5:[
    {t:1,en:"A bird sang.",kr:"한 마리 새가 노래했다."},
    {t:2,en:"It is a fact.",kr:"그것은 하나의 사실이다."},
    {t:3,en:"I have a pen.",kr:"나는 펜 한 자루를 가지고 있다."},
    {t:4,en:"She gave me a book.",kr:"그녀는 나에게 책 한 권을 주었다."},
    {t:5,en:"We call it a miracle.",kr:"우리는 그것을 하나의 기적이라고 부른다."}]},
  "aac": {img:"🔊", ex5:[
    {t:1,en:"The AAC file plays.",kr:"그 AAC 파일이 재생된다."},
    {t:2,en:"This AAC sounds clear.",kr:"이 AAC는 선명하게 들린다."},
    {t:3,en:"I opened an AAC file.",kr:"나는 AAC 파일을 열었다."},
    {t:4,en:"He sent me an AAC file.",kr:"그는 나에게 AAC 파일을 보내주었다."},
    {t:5,en:"We consider AAC efficient.",kr:"우리는 AAC가 효율적이라고 여긴다."}]},
  "aachen": {img:"🏛️", ex5:[
    {t:1,en:"Aachen lies in the west.",kr:"아헨은 서부에 있다."},
    {t:2,en:"Aachen is historic.",kr:"아헨은 역사적이다."},
    {t:3,en:"I visited Aachen.",kr:"나는 아헨을 방문했다."},
    {t:4,en:"The guide showed us Aachen.",kr:"가이드는 우리에게 아헨을 보여주었다."},
    {t:5,en:"People call Aachen a treasure.",kr:"사람들은 아헨을 보물이라고 부른다."}]},
  "aardvark": {img:"🐗", ex5:[
    {t:1,en:"The aardvark digs.",kr:"땅돼지가 땅을 판다."},
    {t:2,en:"The aardvark looks odd.",kr:"그 땅돼지는 이상하게 생겼다."},
    {t:3,en:"We saw an aardvark.",kr:"우리는 땅돼지를 보았다."},
    {t:4,en:"The zoo showed us an aardvark.",kr:"동물원은 우리에게 땅돼지를 보여주었다."},
    {t:5,en:"They named the aardvark Ari.",kr:"그들은 그 땅돼지를 아리라고 이름 지었다."}]},
  "aaron": {img:"🧑", ex5:[
    {t:1,en:"Aaron smiled.",kr:"아론이 미소 지었다."},
    {t:2,en:"Aaron is kind.",kr:"아론은 친절하다."},
    {t:3,en:"I met Aaron.",kr:"나는 아론을 만났다."},
    {t:4,en:"Aaron gave me a hand.",kr:"아론은 나를 도와주었다."},
    {t:5,en:"We named the baby Aaron.",kr:"우리는 아기를 아론이라고 이름 지었다."}]},
  "ababa": {img:"🏙️", ex5:[
    {t:1,en:"Ababa stands inland.",kr:"아바바는 내륙에 있다."},
    {t:2,en:"Addis Ababa is busy.",kr:"아디스아바바는 분주하다."},
    {t:3,en:"We toured Ababa.",kr:"우리는 아바바를 둘러보았다."},
    {t:4,en:"He showed me Ababa.",kr:"그는 나에게 아바바를 보여주었다."},
    {t:5,en:"They call Ababa the capital.",kr:"그들은 아바바를 수도라고 부른다."}]},
  "aback": {img:"😲", ex5:[
    {t:1,en:"He stepped aback.",kr:"그는 뒤로 물러섰다."},
    {t:2,en:"She stood aback, stunned.",kr:"그녀는 놀라서 움찔한 채 서 있었다."},
    {t:3,en:"The news took us aback.",kr:"그 소식은 우리를 깜짝 놀라게 했다."},
    {t:4,en:"It gave me an aback feeling.",kr:"그것은 나에게 움찔하는 기분을 주었다."},
    {t:5,en:"The shock left him taken aback.",kr:"그 충격은 그를 움찔하게 만들었다."}]},
  "abacus": {img:"🧮", ex5:[
    {t:1,en:"The abacus clicks.",kr:"주판이 딸깍거린다."},
    {t:2,en:"This abacus is old.",kr:"이 주판은 오래되었다."},
    {t:3,en:"I used an abacus.",kr:"나는 주판을 사용했다."},
    {t:4,en:"Grandpa gave me an abacus.",kr:"할아버지는 나에게 주판을 주셨다."},
    {t:5,en:"We found the abacus useful.",kr:"우리는 그 주판이 유용하다는 것을 알았다."}]},
  "abandon": {img:"🚷", ex5:[
    {t:1,en:"They abandoned and fled.",kr:"그들은 버리고 달아났다."},
    {t:2,en:"The plan seems abandoned.",kr:"그 계획은 버려진 것 같다."},
    {t:3,en:"We abandoned the plan.",kr:"우리는 그 계획을 포기했다."},
    {t:4,en:"He left me abandoned hope.",kr:"그는 나에게 버려진 희망만 남겼다."},
    {t:5,en:"They left the house abandoned.",kr:"그들은 그 집을 버려진 채로 두었다."}]},
  "abandoned": {img:"🏚️", ex5:[
    {t:1,en:"The abandoned dog wandered.",kr:"버려진 개가 떠돌았다."},
    {t:2,en:"The house looks abandoned.",kr:"그 집은 버려진 것처럼 보인다."},
    {t:3,en:"We explored the abandoned mill.",kr:"우리는 버려진 방앗간을 탐험했다."},
    {t:4,en:"Time gave the town an abandoned look.",kr:"세월은 그 마을에 버려진 모습을 주었다."},
    {t:5,en:"They left the factory abandoned.",kr:"그들은 그 공장을 버려진 채로 두었다."}]},
  "abandoning": {img:"🏃", ex5:[
    {t:1,en:"They keep abandoning.",kr:"그들은 계속 버리고 있다."},
    {t:2,en:"The act is abandoning by nature.",kr:"그 행위는 본질적으로 포기하는 것이다."},
    {t:3,en:"He is abandoning the ship.",kr:"그는 배를 버리고 있다."},
    {t:4,en:"Abandoning gave us no choice.",kr:"포기하는 것은 우리에게 선택의 여지를 주지 않았다."},
    {t:5,en:"We watched him abandoning the post.",kr:"우리는 그가 자리를 버리는 것을 지켜보았다."}]},
  "abandonment": {img:"🥀", ex5:[
    {t:1,en:"Abandonment hurts.",kr:"버림받음은 아프다."},
    {t:2,en:"The abandonment was total.",kr:"그 버림은 완전했다."},
    {t:3,en:"She feared abandonment.",kr:"그녀는 버림받는 것을 두려워했다."},
    {t:4,en:"Time gave the place an air of abandonment.",kr:"세월은 그곳에 버려진 분위기를 주었다."},
    {t:5,en:"The court called it child abandonment.",kr:"법원은 그것을 아동 유기라고 불렀다."}]},
  "abandons": {img:"🚪", ex5:[
    {t:1,en:"He often abandons.",kr:"그는 자주 포기한다."},
    {t:2,en:"His way abandons reason.",kr:"그의 방식은 이성을 저버린다."},
    {t:3,en:"She abandons the project.",kr:"그녀는 그 프로젝트를 포기한다."},
    {t:4,en:"He abandons us our hope.",kr:"그는 우리에게서 우리의 희망을 앗아간다."},
    {t:5,en:"He abandons the boat empty.",kr:"그는 배를 텅 빈 채로 버린다."}]},
  "abate": {img:"📉", ex5:[
    {t:1,en:"The storm abated.",kr:"폭풍이 잦아들었다."},
    {t:2,en:"The pain grew abated.",kr:"통증이 누그러진 상태가 되었다."},
    {t:3,en:"The law abates the noise.",kr:"그 법은 소음을 줄인다."},
    {t:4,en:"Rest gave the fever an abate.",kr:"휴식은 열을 가라앉혀 주었다."},
    {t:5,en:"We saw the wind abate calm.",kr:"우리는 바람이 잠잠히 잦아드는 것을 보았다."}]},
  "abated": {img:"🌥️", ex5:[
    {t:1,en:"The flood abated.",kr:"홍수가 가라앉았다."},
    {t:2,en:"The fever seemed abated.",kr:"열은 누그러진 것 같았다."},
    {t:3,en:"Medicine abated the pain.",kr:"약이 통증을 가라앉혔다."},
    {t:4,en:"Time gave us abated fears.",kr:"세월은 우리에게 누그러진 두려움을 주었다."},
    {t:5,en:"We found the storm abated.",kr:"우리는 폭풍이 잦아든 것을 알았다."}]},
  "abatement": {img:"🔇", ex5:[
    {t:1,en:"The abatement worked.",kr:"그 완화 조치는 효과가 있었다."},
    {t:2,en:"The abatement is partial.",kr:"그 경감은 부분적이다."},
    {t:3,en:"The city ordered noise abatement.",kr:"시는 소음 경감을 명령했다."},
    {t:4,en:"The plan gave us tax abatement.",kr:"그 계획은 우리에게 세금 감면을 주었다."},
    {t:5,en:"They consider the abatement necessary.",kr:"그들은 그 경감이 필요하다고 여긴다."}]},
  "abba": {img:"🎶", ex5:[
    {t:1,en:"ABBA performed.",kr:"아바가 공연했다."},
    {t:2,en:"ABBA is famous.",kr:"아바는 유명하다."},
    {t:3,en:"I love ABBA.",kr:"나는 아바를 좋아한다."},
    {t:4,en:"She played me ABBA.",kr:"그녀는 나에게 아바 노래를 틀어주었다."},
    {t:5,en:"Fans call ABBA legendary.",kr:"팬들은 아바를 전설적이라고 부른다."}]},
  "abbas": {img:"🧔", ex5:[
    {t:1,en:"Abbas arrived.",kr:"아바스가 도착했다."},
    {t:2,en:"Abbas is a leader.",kr:"아바스는 지도자이다."},
    {t:3,en:"Reporters interviewed Abbas.",kr:"기자들이 아바스를 인터뷰했다."},
    {t:4,en:"They asked Abbas a question.",kr:"그들은 아바스에게 질문을 했다."},
    {t:5,en:"People call Abbas a statesman.",kr:"사람들은 아바스를 정치가라고 부른다."}]},
  "abbey": {img:"⛪", ex5:[
    {t:1,en:"The abbey stands tall.",kr:"그 수도원이 높이 서 있다."},
    {t:2,en:"The abbey is ancient.",kr:"그 수도원은 아주 오래되었다."},
    {t:3,en:"We visited the abbey.",kr:"우리는 그 수도원을 방문했다."},
    {t:4,en:"The monk showed us the abbey.",kr:"수도사는 우리에게 수도원을 보여주었다."},
    {t:5,en:"They kept the abbey sacred.",kr:"그들은 그 수도원을 신성하게 지켰다."}]},
  "abbie": {img:"👧", ex5:[
    {t:1,en:"Abbie laughed.",kr:"애비가 웃었다."},
    {t:2,en:"Abbie is cheerful.",kr:"애비는 명랑하다."},
    {t:3,en:"I called Abbie.",kr:"나는 애비에게 전화했다."},
    {t:4,en:"Abbie gave me a gift.",kr:"애비는 나에게 선물을 주었다."},
    {t:5,en:"We named the kitten Abbie.",kr:"우리는 새끼 고양이를 애비라고 이름 지었다."}]},
});
