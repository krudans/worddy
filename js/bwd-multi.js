/* ============================================================
 * bwd-multi.js — 다국어 순환팩 사전 (영 · 한 · 일 · 독)  [시드]
 * ------------------------------------------------------------
 * 설계 원칙(설계메모 기준):
 *  - "개념(concept)" 중심. 언어끼리 직접 잇지 않고, 한 개념 id에
 *    각 언어 블록(en/ko/ja/de…)을 대등하게 매단다.
 *  - 양방향: 설정의 [학습언어]×[모국어] 조합만 바꾸면
 *    같은 데이터를 반대 방향으로 학습한다.
 *      · 학습=en, 모국어=ko → apple 문제 / 사과 풀이
 *      · 학습=ko, 모국어=en → 사과 문제 / apple 풀이
 *      · 학습=ja, 모국어=ko → りんご 문제 / 사과 풀이 …
 *  - 언어 무한 확장: 코드에 언어를 박지 않는다. 새 언어는
 *    각 개념에 블록 하나 추가하는 것일 뿐. 언어 목록은
 *    데이터에서 동적으로 읽는다(아래 BWD_MULTI_LANGS).
 *
 * 언어별 필드:
 *  en: {label, pos, ex}
 *  ko: {label, roma(로마자), ex}
 *  ja: {label(통상표기), kanji(한자, 없으면 생략), roma(로마자), ex}
 *  de: {label, gender(der/die/das), plural(복수형, 불변/없으면 '—'), ex}
 *  공통: cefr(난이도), emoji
 *
 * ex(예문)는 "그 언어로 쓴, 해당 단어가 들어간 문장".
 * 학습 시: 학습언어 ex를 보여주고, 모국어 ex(같은 개념)를 번역으로 댄다.
 *
 * ※ 이 파일은 시드(첫 30개). 빈도순 상위 개념부터 누적 확장 예정.
 *   (Gemini 통합 생성 검증 → 대량 생성으로 이어감)
 * ============================================================ */

window.BWD_MULTI_LANGS = ['en','ko','ja','de']; // 동적 확장 지점

window.BWD_MULTI = {
  "apple": { cefr:"A1", emoji:"🍎",
    en:{label:"apple", pos:"noun", ex:"I ate a red apple."},
    ko:{label:"사과", roma:"sagwa", ex:"나는 빨간 사과를 먹었어요."},
    ja:{label:"りんご", kanji:"林檎", roma:"ringo", ex:"私は赤いりんごを食べました。"},
    de:{label:"Apfel", gender:"der", plural:"Äpfel", ex:"Ich habe einen roten Apfel gegessen."}
  },
  "water": { cefr:"A1", emoji:"💧",
    en:{label:"water", pos:"noun", ex:"I drink water every day."},
    ko:{label:"물", roma:"mul", ex:"나는 매일 물을 마셔요."},
    ja:{label:"水", kanji:"水", roma:"mizu", ex:"私は毎日水を飲みます。"},
    de:{label:"Wasser", gender:"das", plural:"—", ex:"Ich trinke jeden Tag Wasser."}
  },
  "book": { cefr:"A1", emoji:"📖",
    en:{label:"book", pos:"noun", ex:"This book is interesting."},
    ko:{label:"책", roma:"chaek", ex:"이 책은 재미있어요."},
    ja:{label:"本", kanji:"本", roma:"hon", ex:"この本は面白いです。"},
    de:{label:"Buch", gender:"das", plural:"Bücher", ex:"Dieses Buch ist interessant."}
  },
  "house": { cefr:"A1", emoji:"🏠",
    en:{label:"house", pos:"noun", ex:"Their house is very big."},
    ko:{label:"집", roma:"jip", ex:"그들의 집은 아주 커요."},
    ja:{label:"家", kanji:"家", roma:"ie", ex:"彼らの家はとても大きいです。"},
    de:{label:"Haus", gender:"das", plural:"Häuser", ex:"Ihr Haus ist sehr groß."}
  },
  "dog": { cefr:"A1", emoji:"🐶",
    en:{label:"dog", pos:"noun", ex:"The dog is sleeping."},
    ko:{label:"개", roma:"gae", ex:"개가 자고 있어요."},
    ja:{label:"犬", kanji:"犬", roma:"inu", ex:"犬が寝ています。"},
    de:{label:"Hund", gender:"der", plural:"Hunde", ex:"Der Hund schläft."}
  },
  "cat": { cefr:"A1", emoji:"🐱",
    en:{label:"cat", pos:"noun", ex:"The cat is on the chair."},
    ko:{label:"고양이", roma:"goyangi", ex:"고양이가 의자 위에 있어요."},
    ja:{label:"猫", kanji:"猫", roma:"neko", ex:"猫が椅子の上にいます。"},
    de:{label:"Katze", gender:"die", plural:"Katzen", ex:"Die Katze ist auf dem Stuhl."}
  },
  "school": { cefr:"A1", emoji:"🏫",
    en:{label:"school", pos:"noun", ex:"I go to school by bus."},
    ko:{label:"학교", roma:"hakgyo", ex:"나는 버스로 학교에 가요."},
    ja:{label:"学校", kanji:"学校", roma:"gakkō", ex:"私はバスで学校に行きます。"},
    de:{label:"Schule", gender:"die", plural:"Schulen", ex:"Ich fahre mit dem Bus zur Schule."}
  },
  "friend": { cefr:"A1", emoji:"🧑‍🤝‍🧑",
    en:{label:"friend", pos:"noun", ex:"He is my best friend."},
    ko:{label:"친구", roma:"chingu", ex:"그는 내 가장 친한 친구예요."},
    ja:{label:"友達", kanji:"友達", roma:"tomodachi", ex:"彼は私の親友です。"},
    de:{label:"Freund", gender:"der", plural:"Freunde", ex:"Er ist mein bester Freund."}
  },
  "hand": { cefr:"A1", emoji:"✋",
    en:{label:"hand", pos:"noun", ex:"Wash your hands, please."},
    ko:{label:"손", roma:"son", ex:"손을 씻으세요."},
    ja:{label:"手", kanji:"手", roma:"te", ex:"手を洗ってください。"},
    de:{label:"Hand", gender:"die", plural:"Hände", ex:"Wasch dir bitte die Hände."}
  },
  "eye": { cefr:"A1", emoji:"👁️",
    en:{label:"eye", pos:"noun", ex:"Close your left eye."},
    ko:{label:"눈", roma:"nun", ex:"왼쪽 눈을 감으세요."},
    ja:{label:"目", kanji:"目", roma:"me", ex:"左の目を閉じてください。"},
    de:{label:"Auge", gender:"das", plural:"Augen", ex:"Schließ dein linkes Auge."}
  },
  "sun": { cefr:"A1", emoji:"☀️",
    en:{label:"sun", pos:"noun", ex:"The sun is very bright today."},
    ko:{label:"해", roma:"hae", ex:"오늘은 해가 아주 밝아요."},
    ja:{label:"太陽", kanji:"太陽", roma:"taiyō", ex:"今日は太陽がとても明るいです。"},
    de:{label:"Sonne", gender:"die", plural:"Sonnen", ex:"Die Sonne ist heute sehr hell."}
  },
  "moon": { cefr:"A1", emoji:"🌙",
    en:{label:"moon", pos:"noun", ex:"The moon is beautiful tonight."},
    ko:{label:"달", roma:"dal", ex:"오늘 밤 달이 아름다워요."},
    ja:{label:"月", kanji:"月", roma:"tsuki", ex:"今夜は月が美しいです。"},
    de:{label:"Mond", gender:"der", plural:"Monde", ex:"Der Mond ist heute Nacht schön."}
  },
  "tree": { cefr:"A1", emoji:"🌳",
    en:{label:"tree", pos:"noun", ex:"There is a big tree in the park."},
    ko:{label:"나무", roma:"namu", ex:"공원에 큰 나무가 있어요."},
    ja:{label:"木", kanji:"木", roma:"ki", ex:"公園に大きな木があります。"},
    de:{label:"Baum", gender:"der", plural:"Bäume", ex:"Im Park steht ein großer Baum."}
  },
  "car": { cefr:"A1", emoji:"🚗",
    en:{label:"car", pos:"noun", ex:"My father has a new car."},
    ko:{label:"자동차", roma:"jadongcha", ex:"우리 아버지는 새 자동차가 있어요."},
    ja:{label:"車", kanji:"車", roma:"kuruma", ex:"父は新しい車を持っています。"},
    de:{label:"Auto", gender:"das", plural:"Autos", ex:"Mein Vater hat ein neues Auto."}
  },
  "chair": { cefr:"A1", emoji:"🪑",
    en:{label:"chair", pos:"noun", ex:"Please sit on this chair."},
    ko:{label:"의자", roma:"uija", ex:"이 의자에 앉으세요."},
    ja:{label:"椅子", kanji:"椅子", roma:"isu", ex:"この椅子に座ってください。"},
    de:{label:"Stuhl", gender:"der", plural:"Stühle", ex:"Bitte setz dich auf diesen Stuhl."}
  },
  "door": { cefr:"A1", emoji:"🚪",
    en:{label:"door", pos:"noun", ex:"Please close the door."},
    ko:{label:"문", roma:"mun", ex:"문을 닫아 주세요."},
    ja:{label:"ドア", kanji:"", roma:"doa", ex:"ドアを閉めてください。"},
    de:{label:"Tür", gender:"die", plural:"Türen", ex:"Mach bitte die Tür zu."}
  },
  "money": { cefr:"A1", emoji:"💰",
    en:{label:"money", pos:"noun", ex:"I don't have much money."},
    ko:{label:"돈", roma:"don", ex:"나는 돈이 별로 없어요."},
    ja:{label:"お金", kanji:"お金", roma:"okane", ex:"私はあまりお金がありません。"},
    de:{label:"Geld", gender:"das", plural:"—", ex:"Ich habe nicht viel Geld."}
  },
  "food": { cefr:"A1", emoji:"🍱",
    en:{label:"food", pos:"noun", ex:"The food here is delicious."},
    ko:{label:"음식", roma:"eumsik", ex:"여기 음식은 맛있어요."},
    ja:{label:"食べ物", kanji:"食べ物", roma:"tabemono", ex:"ここの食べ物はおいしいです。"},
    de:{label:"Essen", gender:"das", plural:"—", ex:"Das Essen hier ist lecker."}
  },
  "time": { cefr:"A1", emoji:"⏰",
    en:{label:"time", pos:"noun", ex:"I don't have time now."},
    ko:{label:"시간", roma:"sigan", ex:"나는 지금 시간이 없어요."},
    ja:{label:"時間", kanji:"時間", roma:"jikan", ex:"今、時間がありません。"},
    de:{label:"Zeit", gender:"die", plural:"Zeiten", ex:"Ich habe jetzt keine Zeit."}
  },
  "day": { cefr:"A1", emoji:"📅",
    en:{label:"day", pos:"noun", ex:"Today is a beautiful day."},
    ko:{label:"날", roma:"nal", ex:"오늘은 아름다운 날이에요."},
    ja:{label:"日", kanji:"日", roma:"hi", ex:"今日は美しい日です。"},
    de:{label:"Tag", gender:"der", plural:"Tage", ex:"Heute ist ein schöner Tag."}
  },
  "name": { cefr:"A1", emoji:"📛",
    en:{label:"name", pos:"noun", ex:"What is your name?"},
    ko:{label:"이름", roma:"ireum", ex:"이름이 뭐예요?"},
    ja:{label:"名前", kanji:"名前", roma:"namae", ex:"お名前は何ですか？"},
    de:{label:"Name", gender:"der", plural:"Namen", ex:"Wie ist dein Name?"}
  },
  "love": { cefr:"A1", emoji:"❤️",
    en:{label:"love", pos:"noun", ex:"Love is important."},
    ko:{label:"사랑", roma:"sarang", ex:"사랑은 중요해요."},
    ja:{label:"愛", kanji:"愛", roma:"ai", ex:"愛は大切です。"},
    de:{label:"Liebe", gender:"die", plural:"—", ex:"Liebe ist wichtig."}
  },
  "eat": { cefr:"A1", emoji:"🍽️",
    en:{label:"eat", pos:"verb", ex:"I eat breakfast at seven."},
    ko:{label:"먹다", roma:"meokda", ex:"나는 일곱 시에 아침을 먹어요."},
    ja:{label:"食べる", kanji:"食べる", roma:"taberu", ex:"私は七時に朝ご飯を食べます。"},
    de:{label:"essen", gender:"", plural:"", ex:"Ich esse um sieben Uhr Frühstück."}
  },
  "drink": { cefr:"A1", emoji:"🥤",
    en:{label:"drink", pos:"verb", ex:"They drink coffee in the morning."},
    ko:{label:"마시다", roma:"masida", ex:"그들은 아침에 커피를 마셔요."},
    ja:{label:"飲む", kanji:"飲む", roma:"nomu", ex:"彼らは朝にコーヒーを飲みます。"},
    de:{label:"trinken", gender:"", plural:"", ex:"Sie trinken morgens Kaffee."}
  },
  "go": { cefr:"A1", emoji:"🚶",
    en:{label:"go", pos:"verb", ex:"I go to school every morning."},
    ko:{label:"가다", roma:"gada", ex:"나는 매일 아침 학교에 가요."},
    ja:{label:"行く", kanji:"行く", roma:"iku", ex:"私は毎朝学校に行きます。"},
    de:{label:"gehen", gender:"", plural:"", ex:"Ich gehe jeden Morgen zur Schule."}
  },
  "see": { cefr:"A1", emoji:"👀",
    en:{label:"see", pos:"verb", ex:"I see a bird."},
    ko:{label:"보다", roma:"boda", ex:"나는 새를 봐요."},
    ja:{label:"見る", kanji:"見る", roma:"miru", ex:"私は鳥を見ます。"},
    de:{label:"sehen", gender:"", plural:"", ex:"Ich sehe einen Vogel."}
  },
  "read": { cefr:"A1", emoji:"📕",
    en:{label:"read", pos:"verb", ex:"She reads a book every night."},
    ko:{label:"읽다", roma:"ikda", ex:"그녀는 매일 밤 책을 읽어요."},
    ja:{label:"読む", kanji:"読む", roma:"yomu", ex:"彼女は毎晩本を読みます。"},
    de:{label:"lesen", gender:"", plural:"", ex:"Sie liest jeden Abend ein Buch."}
  },
  "big": { cefr:"A1", emoji:"🔼",
    en:{label:"big", pos:"adj", ex:"This is a big city."},
    ko:{label:"크다", roma:"keuda", ex:"이곳은 큰 도시예요."},
    ja:{label:"大きい", kanji:"大きい", roma:"ōkii", ex:"ここは大きい街です。"},
    de:{label:"groß", gender:"", plural:"", ex:"Das ist eine große Stadt."}
  },
  "small": { cefr:"A1", emoji:"🔽",
    en:{label:"small", pos:"adj", ex:"I live in a small town."},
    ko:{label:"작다", roma:"jakda", ex:"나는 작은 마을에 살아요."},
    ja:{label:"小さい", kanji:"小さい", roma:"chiisai", ex:"私は小さい町に住んでいます。"},
    de:{label:"klein", gender:"", plural:"", ex:"Ich wohne in einer kleinen Stadt."}
  },
  "good": { cefr:"A1", emoji:"👍",
    en:{label:"good", pos:"adj", ex:"This is a good idea."},
    ko:{label:"좋다", roma:"jota", ex:"이것은 좋은 생각이에요."},
    ja:{label:"良い", kanji:"良い", roma:"yoi", ex:"これは良い考えです。"},
    de:{label:"gut", gender:"", plural:"", ex:"Das ist eine gute Idee."}
  }
};

/* 헬퍼: 학습언어×모국어 조합으로 한 개념을 꺼낸다(양방향).
 *   getMultiCard('apple','ja','ko') →
 *     {q:{label:'りんご',roma:'ringo',ex:'…'}, a:{label:'사과',roma:'sagwa',ex:'…'}, emoji,cefr}
 * 학습/게임 코드는 이 추상(q=학습언어 블록, a=모국어 블록)만 쓰면
 * 언어가 늘어도 그대로 작동한다. */
window.getMultiCard = function(id, learnLang, nativeLang){
  var c = (window.BWD_MULTI||{})[id]; if(!c) return null;
  var q = c[learnLang], a = c[nativeLang]; if(!q||!a) return null;
  return { id:id, emoji:c.emoji, cefr:c.cefr, learn:learnLang, native:nativeLang, q:q, a:a };
};
