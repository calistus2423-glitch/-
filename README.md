# 스킬투머니 (SkillToMoney) 실습 프로젝트

배운 기술이 돈이 되는 원데이 클래스 예약 웹 애플리케이션 실습 프로젝트입니다. (Next.js 16 + Tailwind CSS)

---

## 📌 1. 프로젝트 실행 방법

### 개발 서버 실행
터미널에서 아래 명령어를 입력하여 로컬 개발 서버를 구동합니다:

```bash
npm run dev
```

- 웹 브라우저 접속 주소: [http://localhost:3000](http://localhost:3000)
- 개발 서버가 켜져 있는 동안에만 브라우저에서 화면을 볼 수 있습니다.

---

## 📋 2. 데이터 구조 분리 (`data/courses.js`)

강좌 데이터를 별도의 모듈 파일(`data/courses.js`)로 분리하여 관리합니다.  
각 강좌 객체는 `id, name, price, seat, booked, date, tags` 속성을 가집니다.

| id | 강좌명 (`name`) | 가격 (`price`) | 정원 (`seat`) | 예약 (`booked`) | 남은 좌석 | 일정 (`date`) | 태그 (`tags`) 배지 | 상태 |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| 1 | **AI 자동화** | 35,000원 | 8 | 8 | 0 | 2026-11-14 | `초보 환영`, `2시간` | **마감** (예약 불가) |
| 2 | **숏폼 편집** | 45,000원 | 6 | 2 | 4 | 2026-11-21 | `캡컷`, `3시간` | 예약 가능 |
| 3 | **엑셀 실무** | 30,000원 | 10 | 7 | 3 | 2026-11-25 | `함수 실습` | 예약 가능 |
| 4 | **스마트스토어** | 40,000원 | 6 | 5 | 1 | 2026-11-28 | `상세페이지`, `창업 준비` | **마감 임박** (빨간색) |

---

## ⚙️ 3. 주요 로직 및 조건부 렌더링

### ① 남은 좌석 계산 및 화면 표시
- **계산식**: `const remaining = course.seat - course.booked;`
- **표시 형식**: `"남은 좌석 ○석 / 정원 ○명"`

### ② 조건부 렌더링 규칙
1. **남은 좌석이 0석인 경우 (`remaining === 0`, 예: AI 자동화)**
   - `"마감"` 뱃지 표시
   - 버튼 텍스트가 **`예약 마감`**으로 변경
   - 버튼이 비활성화(`disabled`)되어 클릭할 수 없음
2. **남은 좌석이 1~2석인 경우 (`remaining >= 1 && remaining <= 2`, 예: 스마트스토어)**
   - **`마감 임박`** 문구를 **빨간색**(`text-red-500`)으로 표시
   - 좌석 현황 텍스트 역시 빨간색으로 강조
### ③ "예약 가능한 강좌만 보기" 필터링 (`useState`)
- 강좌 목록 상단에 체크박스를 배치하여 실시간 필터링 제공
- **체크 시 (`onlyAvailable === true`)**: `course.seat - course.booked > 0`인 강좌만 표시 (마감된 **AI 자동화** 제외)
- **체크 해제 시 (`onlyAvailable === false`)**: 모든 4개 강좌 표시

### ④ 예약 신청 모달 (Modal)
- 강좌 카드의 **[예약하기]** 버튼을 누르면 모달 창 팝업
- **자동 입력 항목**: 강좌 이름, 개강 일정 (`readOnly`)
- **사용자 입력 항목**: 이름, 연락처, 인원(숫자)
- **하단 버튼**:
  - **[닫기]**: 모달 닫기
  - **[신청]**: 서버 API(`/api/reserve`)로 데이터 전송

### ⑤ 서버 측 예약 API (`/api/reserve`)
- **보안**: 구글 시트 웹 앱 주소(`SHEET_URL`)를 프론트엔드 브라우저에 노출하지 않고 서버에서만 숨겨서 호출
- **결제 금액(`total`) 계산**: 클라이언트가 보낸 값이 아닌, 서버의 강좌 데이터(`courses.js`) 수강료와 인원을 곱해 안전하게 계산 (`targetCourse.price * numPeople`)
- **전송 데이터 포맷**: `{ date, course, name, phone, people, total }`

---

## 💡 4. 자주 겪는 문제 및 트러블슈팅 가이드

### Q1. 터미널에 더 이상 아무런 명령어도 입력되지 않아요.
* **원인**: `npm run dev` 명령어로 실행한 Next.js 개발 서버가 **터미널 전면(Foreground)**에서 실시간으로 대기/실행 중이기 때문입니다. (멈춘 것이 아니라 정상 작동 중인 상태입니다.)
* **해결책**:
  * **서버를 켜둔 채로 다른 명령어를 실행하고 싶을 때 (추천)**: 터미널 창 우측 상단의 `+` 버튼을 눌러 **새 터미널 탭**을 열어 명령어를 입력합니다.
  * **서버를 종료하고 싶을 때**: 터미널 창을 클릭한 뒤 `Ctrl + C`를 누르고, 종료 확인 시 `Y`를 입력합니다.

### Q2. 브라우저에서 `localhost:3000` 접속 시 "ERR_CONNECTION_REFUSED (연결을 거부했습니다)"가 떠요.
* **원인**: 개발 서버(`npm run dev`)가 꺼져 있어서 브라우저 요청을 받아줄 서버 프로그램이 없기 때문입니다.
* **해결책**:
  1. VS Code 하단 터미널에서 `npm run dev`를 입력하여 서버를 다시 켭니다.
  2. `Ready in ...ms` 메시지가 나오면 브라우저에서 새로고침(F5)을 누릅니다.

---

## 💻 5. 핵심 코드

### `data/courses.js`
```javascript
export const courses = [
  { id: 1, name: 'AI 자동화', price: 35000, seat: 8, booked: 8, date: '2026-11-14', tags: ['초보 환영', '2시간'] },
  { id: 2, name: '숏폼 편집', price: 45000, seat: 6, booked: 2, date: '2026-11-21', tags: ['캡컷', '3시간'] },
  { id: 3, name: '엑셀 실무', price: 30000, seat: 10, booked: 7, date: '2026-11-25', tags: ['함수 실습'] },
  { id: 4, name: '스마트스토어', price: 40000, seat: 6, booked: 5, date: '2026-11-28', tags: ['상세페이지', '창업 준비'] },
];

export default courses;
```

### `app/page.tsx`
```tsx
'use client';

import { useState } from 'react';
import { courses } from '@/data/courses';

export default function Home() {
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // 예약 가능한 강좌만 보기 필터링 (남은 좌석 > 0)
  const filteredCourses = onlyAvailable
    ? courses.filter((course) => course.seat - course.booked > 0)
    : courses;

  return (
    <main className="...">
      {/* 체크박스 */}
      <input 
        type="checkbox" 
        checked={onlyAvailable} 
        onChange={(e) => setOnlyAvailable(e.target.checked)} 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {filteredCourses.map((course) => {
          const remaining = course.seat - course.booked;
          const isClosed = remaining === 0;
          const isImminent = remaining >= 1 && remaining <= 2;

          return (
            <div key={course.id} className="...">
              <span>{course.date}</span>
              <h2>{course.name}</h2>
              
              {/* 강좌 이름 아래 작은 배지 */}
              <div>{course.tags?.map((tag) => <span key={tag}>{tag}</span>)}</div>

              <p>{course.price.toLocaleString()}원</p>

              {/* 남은 좌석 ○석 / 정원 ○명 */}
              <div>남은 좌석 {remaining}석 / 정원 {course.seat}명</div>

              {/* 조건부 상태 표시 */}
              {isClosed && <span>마감</span>}
              {isImminent && <span className="text-red-500">마감 임박</span>}

              {/* 예약 버튼 제어 */}
              <button disabled={isClosed}>
                {isClosed ? '예약 마감' : '예약하기'}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
```

---

## 📑 6. 구글 시트 연동 Apps Script (`doPost`) 및 웹 앱 배포 가이드

### ① Apps Script 코드 (`Code.gs`)
구글 스프레드시트의 **[확장 프로그램] > [Apps Script]** 에 아래 코드를 붙여넣습니다:

```javascript
function doPost(e) {
  try {
    // 1. 전송받은 JSON 데이터 파싱: { date, course, name, phone, people, total }
    var data = JSON.parse(e.postData.contents);
    
    // 2. '예약' 시트 가져오기 (없으면 자동 생성)
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("예약");
    if (!sheet) {
      sheet = ss.insertSheet("예약");
      // 헤더 행 생성
      sheet.appendRow(["날짜", "강좌", "이름", "연락처", "인원", "결제 금액", "신청 시각"]);
    }
    
    // 3. 신청 시각 생성 (한국 표준시 기준)
    var timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    
    // 4. 요청된 순서대로 1행 추가: 날짜, 강좌, 이름, 연락처, 인원, 결제 금액, 신청 시각
    sheet.appendRow([
      data.date || "",
      data.course || "",
      data.name || "",
      data.phone || "",
      data.people || "",
      data.total || "",
      timestamp
    ]);
    
    // 5. 성공 결과 반환
    return ContentService
      .createTextOutput(JSON.stringify({ result: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 웹 앱 작동 확인용 (브라우저 주소창 접속 시 확인)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "running" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### ② 웹 앱(Web App) 배포 순서
1. 구글 스프레드시트 상단 메뉴에서 **[확장 프로그램] > [Apps Script]** 클릭
2. 편집기에 기존 내용을 지우고 위의 `doPost` 코드를 붙여넣은 뒤, 상단 디스크 모양 **[저장(Ctrl+S)]** 클릭
3. 우측 상단 파란색 **[배포]** 버튼 클릭 > **[새 배포]** 선택
4. 좌측 톱니바퀴 아이콘을 클릭하여 **[웹 앱(Web app)]** 유형 선택
5. 설정 입력:
   - **설명**: `스킬투머니 예약 연동` (임의 입력)
   - **다음 사용자 권한으로 실행**: **나(사용자 구글 이메일)** 선택
   - **액세스 권한이 있는 사용자**: **모든 사용자 (Anyone)** 선택 ⭐ *(반드시 모든 사용자로 해야 로그인 없이 전송 가능)*
6. **[배포]** 클릭
7. 권한 승인 창이 뜨면:
   - **[액세스 승인]** 클릭 > 본인 구글 계정 선택
   - "Google에서 확인하지 않은 앱" 경고가 뜨면 좌측 하단 **[고급(Advanced)]** 클릭 > **`...으로 이동(안전하지 않음)`** 클릭 > **[허용(Allow)]** 클릭
8. 배포 완료 후 나타나는 **웹 앱 URL (`https://script.google.com/macros/s/.../exec`)** 복사
9. 프론트엔드에서 `fetch(웹앱URL, { method: 'POST', body: JSON.stringify(...) })` 로 전송하여 사용

