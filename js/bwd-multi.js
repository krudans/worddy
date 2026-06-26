/* ============================================================
 * bwd-multi.js — 다국어 순환팩 사전 (영 · 한 · 일 · 독)  [시드 v2]
 * ------------------------------------------------------------
 * 변경(v2): 예문을 언어별 5칸(t=1~5)으로 확장.
 *  - 영어는 5형식으로 만들어졌고, 다른 언어는 같은 5칸을
 *    "각자 나라말로 자연스러운 예문 5개"로 채운다(강제 번역 아님).
 *  - 5칸은 대체로 단순→복잡 순. 앱 UI 라벨은 "예문 단계 1~5".
 *    (형식이 곧 난이도순은 아니므로 '단계'로 표기)
 *
 * 개념(concept) 중심 · 양방향:
 *  설정의 [학습언어]×[모국어] 조합만 바꾸면 같은 데이터를
 *  반대 방향으로 학습. (en↔ko, ja↔ko, ko↔en …)
 *  언어는 코드에 박지 않고 데이터에서 읽는다(BWD_MULTI_LANGS).
 *
 * 스키마(개념 1개):
 *  { cefr, emoji,
 *    en:{label, pos, ex5:[{t,s}×5]},
 *    ko:{label, roma, ex5:[...]},
 *    ja:{label, kanji, roma, ex5:[...]},
 *    de:{label, gender, plural, ex5:[...]} }
 *  ex5[i] = {t:1..5, s:"그 언어로 쓴, 단어가 들어간 문장"}
 *
 * ※ v2는 8개 개념 완성본(검증된 5단계 패턴). 같은 틀로 누적 확장.
 * ============================================================ */

window.BWD_MULTI_LANGS = ['en','ko','ja','de']; // 동적 확장 지점

window.BWD_MULTI = {
  "apple": { cefr:"A1", emoji:"🍎",
    en:{label:"apple", pos:"noun", ex5:[
      {t:1,s:"The apple is red."},
      {t:2,s:"I eat an apple."},
      {t:3,s:"I like sweet red apples."},
      {t:4,s:"When I am hungry, I eat an apple."},
      {t:5,s:"Every morning I eat a fresh apple that my mother buys at the market."}]},
    ko:{label:"사과", roma:"sagwa", ex5:[
      {t:1,s:"사과가 빨개요."},
      {t:2,s:"나는 사과를 먹어요."},
      {t:3,s:"나는 달고 빨간 사과를 좋아해요."},
      {t:4,s:"배가 고프면 나는 사과를 먹어요."},
      {t:5,s:"매일 아침 나는 어머니가 시장에서 사 오신 신선한 사과를 먹어요."}]},
    ja:{label:"りんご", kanji:"林檎", roma:"ringo", ex5:[
      {t:1,s:"りんごは赤い。"},
      {t:2,s:"私はりんごを食べる。"},
      {t:3,s:"私は甘くて赤いりんごが好きだ。"},
      {t:4,s:"お腹がすくと、私はりんごを食べる。"},
      {t:5,s:"毎朝、私は母が市場で買ってくる新鮮なりんごを食べる。"}]},
    de:{label:"Apfel", gender:"der", plural:"Äpfel", ex5:[
      {t:1,s:"Der Apfel ist rot."},
      {t:2,s:"Ich esse einen Apfel."},
      {t:3,s:"Ich mag süße rote Äpfel."},
      {t:4,s:"Wenn ich Hunger habe, esse ich einen Apfel."},
      {t:5,s:"Jeden Morgen esse ich einen frischen Apfel, den meine Mutter auf dem Markt kauft."}]}
  },
  "water": { cefr:"A1", emoji:"💧",
    en:{label:"water", pos:"noun", ex5:[
      {t:1,s:"The water is cold."},
      {t:2,s:"I drink water."},
      {t:3,s:"I drink cold, clean water."},
      {t:4,s:"I drink water because I am thirsty."},
      {t:5,s:"After running for an hour, I drank a big glass of cold water."}]},
    ko:{label:"물", roma:"mul", ex5:[
      {t:1,s:"물이 차가워요."},
      {t:2,s:"나는 물을 마셔요."},
      {t:3,s:"나는 차갑고 깨끗한 물을 마셔요."},
      {t:4,s:"목이 말라서 나는 물을 마셔요."},
      {t:5,s:"한 시간 동안 달린 뒤에 나는 차가운 물 한 잔을 마셨어요."}]},
    ja:{label:"水", kanji:"水", roma:"mizu", ex5:[
      {t:1,s:"水は冷たい。"},
      {t:2,s:"私は水を飲む。"},
      {t:3,s:"私は冷たくてきれいな水を飲む。"},
      {t:4,s:"のどがかわいたので、私は水を飲む。"},
      {t:5,s:"一時間走ったあと、私は冷たい水を一杯飲んだ。"}]},
    de:{label:"Wasser", gender:"das", plural:"—", ex5:[
      {t:1,s:"Das Wasser ist kalt."},
      {t:2,s:"Ich trinke Wasser."},
      {t:3,s:"Ich trinke kaltes, sauberes Wasser."},
      {t:4,s:"Ich trinke Wasser, weil ich durstig bin."},
      {t:5,s:"Nachdem ich eine Stunde gelaufen war, trank ich ein großes Glas kaltes Wasser."}]}
  },
  "book": { cefr:"A1", emoji:"📖",
    en:{label:"book", pos:"noun", ex5:[
      {t:1,s:"The book is new."},
      {t:2,s:"I read a book."},
      {t:3,s:"I read an interesting book."},
      {t:4,s:"I read a book before I sleep."},
      {t:5,s:"Last night I read an interesting book that my friend gave me for my birthday."}]},
    ko:{label:"책", roma:"chaek", ex5:[
      {t:1,s:"책이 새것이에요."},
      {t:2,s:"나는 책을 읽어요."},
      {t:3,s:"나는 재미있는 책을 읽어요."},
      {t:4,s:"나는 자기 전에 책을 읽어요."},
      {t:5,s:"어젯밤 나는 친구가 생일에 준 재미있는 책을 읽었어요."}]},
    ja:{label:"本", kanji:"本", roma:"hon", ex5:[
      {t:1,s:"本は新しい。"},
      {t:2,s:"私は本を読む。"},
      {t:3,s:"私は面白い本を読む。"},
      {t:4,s:"私は寝る前に本を読む。"},
      {t:5,s:"昨夜、私は友達が誕生日にくれた面白い本を読んだ。"}]},
    de:{label:"Buch", gender:"das", plural:"Bücher", ex5:[
      {t:1,s:"Das Buch ist neu."},
      {t:2,s:"Ich lese ein Buch."},
      {t:3,s:"Ich lese ein interessantes Buch."},
      {t:4,s:"Ich lese ein Buch, bevor ich schlafe."},
      {t:5,s:"Gestern Abend las ich ein interessantes Buch, das mir mein Freund zum Geburtstag geschenkt hat."}]}
  },
  "house": { cefr:"A1", emoji:"🏠",
    en:{label:"house", pos:"noun", ex5:[
      {t:1,s:"The house is big."},
      {t:2,s:"I see a house."},
      {t:3,s:"They live in a small house."},
      {t:4,s:"I clean the house when it is dirty."},
      {t:5,s:"My grandparents live in an old house that stands on a quiet hill near the sea."}]},
    ko:{label:"집", roma:"jip", ex5:[
      {t:1,s:"집이 커요."},
      {t:2,s:"나는 집을 봐요."},
      {t:3,s:"그들은 작은 집에 살아요."},
      {t:4,s:"집이 더러우면 나는 집을 청소해요."},
      {t:5,s:"우리 조부모님은 바닷가 조용한 언덕에 있는 오래된 집에 살아요."}]},
    ja:{label:"家", kanji:"家", roma:"ie", ex5:[
      {t:1,s:"家は大きい。"},
      {t:2,s:"私は家を見る。"},
      {t:3,s:"彼らは小さい家に住んでいる。"},
      {t:4,s:"家が汚いとき、私は家を掃除する。"},
      {t:5,s:"祖父母は、海の近くの静かな丘に建つ古い家に住んでいる。"}]},
    de:{label:"Haus", gender:"das", plural:"Häuser", ex5:[
      {t:1,s:"Das Haus ist groß."},
      {t:2,s:"Ich sehe ein Haus."},
      {t:3,s:"Sie wohnen in einem kleinen Haus."},
      {t:4,s:"Ich putze das Haus, wenn es schmutzig ist."},
      {t:5,s:"Meine Großeltern wohnen in einem alten Haus, das auf einem ruhigen Hügel am Meer steht."}]}
  },
  "dog": { cefr:"A1", emoji:"🐶",
    en:{label:"dog", pos:"noun", ex5:[
      {t:1,s:"The dog is big."},
      {t:2,s:"I have a dog."},
      {t:3,s:"I have a small brown dog."},
      {t:4,s:"The dog barks when someone comes."},
      {t:5,s:"Every evening I walk my friendly dog in the park near our house."}]},
    ko:{label:"개", roma:"gae", ex5:[
      {t:1,s:"개가 커요."},
      {t:2,s:"나는 개가 있어요."},
      {t:3,s:"나는 작은 갈색 개가 있어요."},
      {t:4,s:"누가 오면 개가 짖어요."},
      {t:5,s:"매일 저녁 나는 집 근처 공원에서 다정한 개를 산책시켜요."}]},
    ja:{label:"犬", kanji:"犬", roma:"inu", ex5:[
      {t:1,s:"犬は大きい。"},
      {t:2,s:"私は犬を飼っている。"},
      {t:3,s:"私は小さい茶色の犬を飼っている。"},
      {t:4,s:"だれかが来ると、犬はほえる。"},
      {t:5,s:"毎晩、私は家の近くの公園で人なつっこい犬を散歩させる。"}]},
    de:{label:"Hund", gender:"der", plural:"Hunde", ex5:[
      {t:1,s:"Der Hund ist groß."},
      {t:2,s:"Ich habe einen Hund."},
      {t:3,s:"Ich habe einen kleinen braunen Hund."},
      {t:4,s:"Der Hund bellt, wenn jemand kommt."},
      {t:5,s:"Jeden Abend gehe ich mit meinem freundlichen Hund im Park neben unserem Haus spazieren."}]}
  },
  "cat": { cefr:"A1", emoji:"🐱",
    en:{label:"cat", pos:"noun", ex5:[
      {t:1,s:"The cat is small."},
      {t:2,s:"I see a cat."},
      {t:3,s:"A black cat sits on the wall."},
      {t:4,s:"The cat sleeps when it is warm."},
      {t:5,s:"My quiet cat likes to sleep on the soft chair by the sunny window."}]},
    ko:{label:"고양이", roma:"goyangi", ex5:[
      {t:1,s:"고양이가 작아요."},
      {t:2,s:"나는 고양이를 봐요."},
      {t:3,s:"검은 고양이가 담 위에 앉아 있어요."},
      {t:4,s:"따뜻하면 고양이가 자요."},
      {t:5,s:"나의 조용한 고양이는 햇빛 드는 창가의 푹신한 의자에서 자는 것을 좋아해요."}]},
    ja:{label:"猫", kanji:"猫", roma:"neko", ex5:[
      {t:1,s:"猫は小さい。"},
      {t:2,s:"私は猫を見る。"},
      {t:3,s:"黒い猫が塀の上に座っている。"},
      {t:4,s:"暖かいと、猫は眠る。"},
      {t:5,s:"私の静かな猫は、日の当たる窓のそばの柔らかい椅子で眠るのが好きだ。"}]},
    de:{label:"Katze", gender:"die", plural:"Katzen", ex5:[
      {t:1,s:"Die Katze ist klein."},
      {t:2,s:"Ich sehe eine Katze."},
      {t:3,s:"Eine schwarze Katze sitzt auf der Mauer."},
      {t:4,s:"Die Katze schläft, wenn es warm ist."},
      {t:5,s:"Meine ruhige Katze schläft gern auf dem weichen Stuhl am sonnigen Fenster."}]}
  },
  "school": { cefr:"A1", emoji:"🏫",
    en:{label:"school", pos:"noun", ex5:[
      {t:1,s:"The school is near."},
      {t:2,s:"I go to school."},
      {t:3,s:"I go to a big school."},
      {t:4,s:"I go to school even when it rains."},
      {t:5,s:"Every morning my sister and I walk to the big school at the end of our street."}]},
    ko:{label:"학교", roma:"hakgyo", ex5:[
      {t:1,s:"학교가 가까워요."},
      {t:2,s:"나는 학교에 가요."},
      {t:3,s:"나는 큰 학교에 다녀요."},
      {t:4,s:"비가 와도 나는 학교에 가요."},
      {t:5,s:"매일 아침 나와 여동생은 우리 거리 끝에 있는 큰 학교까지 걸어가요."}]},
    ja:{label:"学校", kanji:"学校", roma:"gakkō", ex5:[
      {t:1,s:"学校は近い。"},
      {t:2,s:"私は学校へ行く。"},
      {t:3,s:"私は大きい学校に通っている。"},
      {t:4,s:"雨が降っても、私は学校へ行く。"},
      {t:5,s:"毎朝、私と妹は通りの突き当たりにある大きい学校まで歩いていく。"}]},
    de:{label:"Schule", gender:"die", plural:"Schulen", ex5:[
      {t:1,s:"Die Schule ist nah."},
      {t:2,s:"Ich gehe zur Schule."},
      {t:3,s:"Ich gehe auf eine große Schule."},
      {t:4,s:"Ich gehe zur Schule, auch wenn es regnet."},
      {t:5,s:"Jeden Morgen gehen meine Schwester und ich zu der großen Schule am Ende unserer Straße."}]}
  },
  "friend": { cefr:"A1", emoji:"🧑‍🤝‍🧑",
    en:{label:"friend", pos:"noun", ex5:[
      {t:1,s:"He is my friend."},
      {t:2,s:"I meet my friend."},
      {t:3,s:"I meet my old friend today."},
      {t:4,s:"I call my friend when I am sad."},
      {t:5,s:"Whenever I have a problem, I talk to my best friend, who always listens to me."}]},
    ko:{label:"친구", roma:"chingu", ex5:[
      {t:1,s:"그는 내 친구예요."},
      {t:2,s:"나는 친구를 만나요."},
      {t:3,s:"나는 오늘 오랜 친구를 만나요."},
      {t:4,s:"슬플 때 나는 친구에게 전화해요."},
      {t:5,s:"문제가 생길 때마다 나는 언제나 내 말을 들어주는 가장 친한 친구와 이야기해요."}]},
    ja:{label:"友達", kanji:"友達", roma:"tomodachi", ex5:[
      {t:1,s:"彼は私の友達だ。"},
      {t:2,s:"私は友達に会う。"},
      {t:3,s:"私は今日、古い友達に会う。"},
      {t:4,s:"悲しいとき、私は友達に電話する。"},
      {t:5,s:"問題があるときはいつも、私はいつも話を聞いてくれる親友に相談する。"}]},
    de:{label:"Freund", gender:"der", plural:"Freunde", ex5:[
      {t:1,s:"Er ist mein Freund."},
      {t:2,s:"Ich treffe meinen Freund."},
      {t:3,s:"Ich treffe heute meinen alten Freund."},
      {t:4,s:"Ich rufe meinen Freund an, wenn ich traurig bin."},
      {t:5,s:"Wann immer ich ein Problem habe, spreche ich mit meinem besten Freund, der mir immer zuhört."}]}
  }
};

/* 헬퍼: 학습언어×모국어 조합으로 한 개념을 꺼낸다(양방향).
 *   getMultiCard('apple','ja','ko', 3) →
 *     {q:{label:'りんご',...,ex:'…(t=3)'}, a:{label:'사과',...,ex:'…(t=3)'}, emoji,cefr}
 *   step: 예문 단계(1~5). 0/생략이면 1단계.
 * 학습/게임 코드는 q(학습언어)·a(모국어) 추상만 쓰면 언어가 늘어도 그대로 작동. */
window.getMultiCard = function(id, learnLang, nativeLang, step){
  var c = (window.BWD_MULTI||{})[id]; if(!c) return null;
  var L = c[learnLang], N = c[nativeLang]; if(!L||!N) return null;
  function pick(blk){
    var arr = blk.ex5||[]; var i = (step>=1&&step<=5) ? (step-1) : 0;
    var ex = arr[i] || arr[0] || null;
    return { label:blk.label, roma:blk.roma, kanji:blk.kanji, gender:blk.gender, plural:blk.plural, pos:blk.pos, ex: ex?ex.s:'', ex5:arr };
  }
  return { id:id, emoji:c.emoji, cefr:c.cefr, learn:learnLang, native:nativeLang, step:(step||1), q:pick(L), a:pick(N) };
};
