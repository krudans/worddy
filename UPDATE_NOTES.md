# 🦋 Worddy 나비 도감 업데이트 가이드

## ✅ 이번 작업으로 바뀐 것

### 1. 관리자 페이지(`admin.html`)
- **나비 사진을 JPG/PNG/WebP로 업로드** 가능 (Firebase Storage 사용)
  - 자동 압축: 최대 1024px, 품질 85%
  - 업로드 진행률 표시
- 폼에 새 필드 추가
  - **희귀도 점수** (0~100): PDF 도감 점수와 동일 의미
  - **생존 상태**: 생존 / 위기 / 멸종 / 이주성
  - **크기/외형**: 예) `10cm / 노랑+검정 줄무늬`
  - **특징 한줄**: 예) `공작 눈 무늬 4개`
  - **에피소드** (앱 도감 본문, 500자 권장)
- **📘 PDF 30선 일괄 등록** 버튼 추가
  - 클릭 한 번으로 PDF에 명시된 23종 (b01~b23)의 점수·서식지·상태·에피소드를 Firebase에 일괄 등록/업데이트
  - 기존 svgCode/imageUrl은 보존
  - PDF에 없는 7종(b24~b30)은 손대지 않음

### 2. 앱(`index.html`)
- Firebase `butterflies` 컬렉션을 자동으로 읽어 BUTTERFLY_LIST에 머지
  - 관리자에서 등록/수정한 게 곧바로 앱에 반영됨
  - Firebase에만 있는 신규 나비(예: b31, bf_xxx)도 자동으로 도감에 추가됨
- 나비 이미지 렌더링 우선순위
  1. **imageUrl** (관리자가 업로드한 JPG/PNG)
  2. **svgCode** (커스텀 SVG)
  3. 내장 SVG (b01~b30 기본 그림)

### 3. `js/features.js` 정리
- 옛 `cabbage_white` 기반 BUTTERFLY_DATA 30종 제거
- 도감 모달이 BUTTERFLY_LIST(앱의 진짜 데이터)를 사용하도록 통일
- 도감 상세 화면을 PDF 필드(점수·상태·에피소드·환경 메시지)에 맞춰 새로 디자인

---

## ⚠️ Firebase Console에서 꼭 해야 할 설정

### 1) Storage 활성화
Firebase Console > Storage > "시작하기" 버튼이 보이면 클릭해 활성화.
- 위치: `asia-northeast3` (서울) 권장
- 보안 모드: 일단 "테스트 모드"로 시작 가능

### 2) Storage 보안 규칙 (Firebase Console > Storage > Rules)
관리자만 업로드하고, 모든 사용자가 읽을 수 있게:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 나비 이미지는 누구나 읽기 가능
    match /butterflies/{file=**} {
      allow read: if true;
      // 로그인한 사용자가 5MB 이하 이미지만 업로드 가능
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 3) Firestore 보안 규칙 (이미 적용돼 있다면 생략)
```
match /butterflies/{id} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

---

## 🚀 사용 방법

### 처음 한 번: PDF 30선 일괄 등록
1. 관리자 페이지(`admin.html`) 접속 → 로그인
2. 좌측 메뉴 **🦋 나비 관리** 클릭
3. 우상단 보라색 **📘 PDF 30선 일괄 등록** 버튼 클릭
4. 확인 다이얼로그에서 "확인" → 23종 자동 등록 (PDF에 있는 것만)
5. 등록 후 목록에 "등록" 태그가 표시되고, 앱에서도 갱신된 내용이 보임

### 새 나비 추가
1. 우상단 **+ 나비 추가** 클릭
2. **📷 사진 업로드** 버튼으로 JPG/PNG 파일 선택 → Storage 자동 업로드
3. 이름·학명·점수·서식지·에피소드 등 입력
4. **등록하기** 클릭 → Firebase 저장 → 앱에 즉시 반영

### 기존 나비 수정
1. 목록에서 **수정** 버튼 클릭
2. 사진을 새로 업로드하거나 텍스트 수정 후 **수정 저장**
3. 앱은 다음 로그인/새로고침 시 자동으로 변경 사항 반영

---

## 📋 데이터 구조 (Firestore `butterflies` 컬렉션)

문서 ID: `b01`~`b30` (PDF 30선) 또는 `bf_xxxxxx` (사용자 추가)

| 필드 | 설명 | 예시 |
|---|---|---|
| `id` | 문서 ID와 동일 | `"b01"` |
| `name` | 한글 이름 | `"제르세스 블루"` |
| `enName` / `en` | 영문 이름 | `"Xerces Blue"` |
| `sci` | 학명 | `"Glaucopsyche xerces"` |
| `rare` | 레어도 (⭐문자열) | `"⭐⭐⭐⭐⭐"` |
| `score` | 희귀도 점수 (0~100) | `100` |
| `status` | 생존 상태 | `"멸종"` / `"위기"` / `"생존"` / `"이주성"` |
| `size` | 크기/외형 | `"2.5cm / 은청색"` |
| `habitat` | 서식지 | `"미국 샌프란시스코"` |
| `season` | 활동 시기 | `"5월~9월"` |
| `feature` | 특징 한줄 | `"은청색 날개에 흰 테두리"` |
| `desc` | 짧은 설명 | `"멸종된 미국 최초의 나비"` |
| `story` | 에피소드 (500자) | `"1941년 샌프란시스코의..."` |
| `msg` | 환경 메시지 | `"한 종이 사라지는 일은..."` |
| `threat` | 위협 요인 | `"도시 개발"` |
| `protect` | 보호 등급 | `"EX (절멸)"` / `"한국 멸종위기 1급"` |
| `imageUrl` | Storage 사진 URL | `"https://firebasestorage..."` |
| `svgCode` | SVG 코드 (선택) | `"<svg...></svg>"` |
| `updatedAt` | 수정 시각 | ISO 문자열 |

---

## 🔍 문제 해결

### "업로드 실패" 오류가 뜬다
- Firebase Storage가 활성화되지 않았거나, 보안 규칙이 너무 엄격합니다.
- 위 **2) Storage 보안 규칙** 적용해 보세요.

### 앱에서 새 나비가 안 보인다
- 앱을 새로고침(F5)하거나 다시 로그인 해 보세요.
- 브라우저 콘솔에서 `[나비] Firebase 머지 완료. 총 XX 종` 메시지 확인.

### PDF 일괄 등록 후 사진이 보이지 않는다
- PDF에는 텍스트만 들어있고 사진은 들어있지 않습니다.
- 일괄 등록은 텍스트(점수·서식지·에피소드 등)만 반영하며, 이미지는 보존됩니다.
- 기존 내장 SVG(`getButterflyCharSVG` 함수의 b01~b30)가 그대로 표시됩니다.
- 실사 사진으로 바꾸려면 각 나비를 수정해 JPG/PNG를 업로드해 주세요.
