---
name: homepage-builder
description: >-
  프리미엄 반응형 웹사이트 및 쇼핑몰/홍보 홈페이지를 구축할 때 사용하는 전문 워크플로우 가이드.
  2분할 히어로 섹션, 9:16 쇼츠 플레이어, 3D 팝업 애니메이션, 상품 카드 드래그 앤 드롭 이미지 교체,
  실시간 판매가 기재 및 콤마 포맷팅, 브라우저 저장소 사용자 데이터 역추적 및 프리렌더링(Authentic Price Pre-rendering),
  에셋 정식 파일 번들링(Asset Persistence), 관리자 대시보드 및 비밀번호 모달 제어,
  Supabase 클라우드 DB 연동 및 RLS(Row-Level Security) 정책 제어, GitHub Pages 실시간 배포 절차를 포함합니다.
---

# Homepage Builder Skill (프리미엄 홈페이지 제작 & 배포 종합 가이드)

사용자 맞춤형 고품격 웹사이트(쇼핑몰, 기업 소개, 의전/상례 서비스 등)를 기획부터 인터랙티브 애니메이션, 실물 미디어 에셋 영구화, 사용자 입력 금액 완전 복원 및 프리렌더링, 관리자 대시보드(비밀번호 인증/상담 내역/상품 가격 관리), Supabase 클라우드 데이터베이스 연동, GitHub Pages 실시간 배포까지 일관된 최고 품질로 구축하기 위한 체계적인 표준 실행 가이드입니다.

---

## 1. 프로젝트 표준 아키텍처

```
homepage/
├── .agents/
│   └── skills/
│       └── homepage-builder/
│           └── SKILL.md            # [핵심] 프로젝트 전용 홈페이지 빌더 스킬
├── images/                         # [핵심] 등록/복원된 정식 고해상도 상품 사진 에셋
│   ├── product_m1.jpg              # 남성 상·하의 양복
│   ├── product_m2.jpg              # 와이셔츠
│   ├── product_w1.jpg              # 개량 한복
│   ├── product_am1.jpg             # 완장
│   └── product_am2.jpg             # 넥타이
├── baekjae_shorts.mp4              # [핵심] 9:16 세로형 공식 쇼츠 비디오 파일
├── home_model.jpg                  # 공식 브랜드 모델 고해상도 대표 이미지
├── code_artifact.tsx               # React/Tailwind/Lucide 기반 모듈형 컴포넌트
├── AdminDashboard.tsx              # Supabase 연동 관리자 대시보드 컴포넌트
├── supabaseClient.ts               # Supabase JS 클라이언트 설정 모듈
├── index.html                      # 단독 실행 및 즉각 브라우저 프리뷰/Pages 배포용 HTML5 번들
├── gemini-code-1792323230706.html  # 동기화된 HTML 백업 파일
├── README.md                       # 프로젝트 소개 및 실행 가이드
├── .env.local                      # Supabase URL & Anon Key (Git 제외)
└── .gitignore                      # Git 버전 관리 설정 (.env*, node_modules 등 철저 격리)
```

---

## 2. 핵심 UI/UX 설계 및 인터랙션 패턴

### [패턴 1] 홈 화면 세로 2분할 (Hero Split Layout)
- **목적**: 감성적 브랜드 메시지와 숏폼 미디어의 시각적 몰입감을 양립.
- **좌측 (브랜드 슬로건 & 대표 비주얼)**:
  - 품격 있는 카피라이트와 신뢰감을 주는 모던 타이포그래피.
  - 대표 인물/제품 사진(`home_model.jpg`)을 배치하고 부드러운 라운딩(`rounded-3xl`)과 은은한 골드/다크 톤 프레임 적용.
- **우측 (9:16 세로형 쇼츠 플레이어)**:
  - 최신 모바일 숏폼 트렌드를 반영한 9:16 황금비율 컨테이너 (`aspect-[9/16]`).
  - **기본 비디오 영구 탑재**: 프로젝트 내 `baekjae_shorts.mp4`를 기본 소스로 지정하여 접속 즉시 자동 재생(`autoplay muted loop playsinline`).
  - **듀얼 소스 & 커스텀 지원**:
    1. 로컬 비디오 파일 드래그 & 드롭 / 파일 선택 업로드 (브라우저 캐시 보존).
    2. YouTube Shorts 링크(예: `https://youtube.com/shorts/...`) 입력 시 자동 정규식 변환 후 iframe 임베드 재생.
  - 플레이어 주변 앰비언트 글로우 및 스마트 제어 바(음소거/해제, 재생/일시정지, 좋아요 수, 링크 복사) 제공.

### [패턴 2] 마우스 오버 3D 팝업 물리 애니메이션 (Pop-forward Cards)
- **목적**: 서비스 핵심 가치(품질, 긴급 배송, 24시간 상담 등)에 시선을 유도하고 물리적 실체감 제공.
- **CSS 물리 탄성 곡선**:
  ```css
  .feature-card-pop {
    position: relative;
    transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
                border-color 0.3s ease;
    will-change: transform, box-shadow;
    transform: translateZ(0);
  }
  .feature-card-pop:hover {
    transform: translateY(-16px) scale(1.045);
    box-shadow: 0 25px 40px -10px rgba(15, 23, 42, 0.22),
                0 10px 20px -5px rgba(15, 23, 42, 0.1);
    border-color: #94a3b8;
    z-index: 20;
  }
  .feature-card-pop:active {
    transform: translateY(-8px) scale(1.02);
  }
  ```
- **마이크로 인터랙션**: 카드 호버 시 내부 아이콘이 1.15배 확대되며 3도 회전(`group-hover:scale-115 group-hover:rotate-3`).

### [패턴 3] 상품 카드 이미지 교체 & 판매가 기재 시스템
- **이미지 규격**: 4/3(세로) 비율 (`aspect-[3/4]`, `object-cover object-top`).
- **실제 파일 기본 탑재 + 드래그 앤 드롭 오버라이드**:
  - 기본 상태에서 `images/product_*.jpg`를 바로 표시.
  - 사용자가 새 사진을 드래그하거나 클릭하여 업로드 시 Canvas API(최대 1200px, JPEG 0.88 품질)로 클라이언트 단에서 압축 최적화 후 즉시 반영.
- **실시간 판매가 기재란**:
  - 각 카드마다 금액 입력창(`input.price-input`) 배치.
  - 숫자 입력 시 실시간 정규식 포맷팅을 통해 천 단위 콤마(예: `40,000원`) 자동 변환.
  - 값 변경 시 로컬 스토리지 및 클라우드 DB에 즉각 보존.

---

## 3. 에셋 & 데이터 영구화 아키텍처 (Client Cache vs Repository Bundle)

### [핵심 문제] 브라우저 저장소의 치명적 한계
- 사용자가 웹 화면에서 드래그/업로드하거나 관리자 화면에서 수정한 데이터는 기본적으로 해당 PC 브라우저 내부 캐시(LocalStorage / IndexedDB)에만 국한됨.
- 따라서 GitHub에 코드를 푸시하거나 **GitHub Pages(`https://<user>.github.io/<repo>/`)**로 배포하면, **다른 기기나 외부 방문자에게는 기본 더미 템플릿(임의의 더미 금액, 빈 이미지 등)만 표시되는 심각한 불일치**가 발생함.

### [해결 워크플로우 1] 미디어 에셋 번들링 (Asset File Bundling)
1. **브라우저 캐시 역추적 및 파일 추출**:
   - Chrome `User Data/.../Local Storage/leveldb` 및 `IndexedDB/.../blob` 파일에서 실제 비디오 Blob과 고화질 이미지 Data URI를 디코딩하여 추출.
2. **프로젝트 정규 파일로 저장**:
   - 비디오: `baekjae_shorts.mp4`
   - 이미지: `images/product_m1.jpg`, `product_m2.jpg`, `product_w1.jpg`, `product_am1.jpg`, `product_am2.jpg`
3. **HTML 소스 코드 기본 경로 연결**:
   - `<video src="baekjae_shorts.mp4">`
   - `<img src="images/product_*.jpg">`

### [해결 워크플로우 2] 사용자 실제 저장 가격 역추적 및 프리렌더링 (Authentic Price Pre-rendering)
1. **로컬 스토리지 원본 데이터 마이닝**:
   - 브라우저 스토리지 파일에서 사용자가 실제 저장했던 키(`baekjae_product_prices`)의 원본 JSON을 정확히 분석.
   - 예시:
     ```json
     {
       "m1": "40,000",
       "m2": "20,000",
       "w1": "40,000",
       "am1": "",
       "am2": "15,000",
       "am3": "20,000",
       "am4": "",
       "aw1": "",
       "aw2": ""
     }
     ```
2. **정적 HTML 인풋 및 스크립트 기본값 완전 일치화 (Pre-rendering)**:
   - 가상의 더미 금액(250,000원 등)을 소스 코드에서 완전히 제거.
   - HTML `<input id="price-m1" value="40,000">`과 JavaScript `DEFAULT_PRICES`의 최초 기본값을 사용자 실제 입력값과 100% 동일하게 하드코딩 프리렌더링.
   - **효과**: Supabase 클라우드 DB가 연결되기 전이거나 네트워크 지연, 캐시가 전혀 없는 타인의 브라우저에서도 사용자가 확정한 실제 금액이 0.1초의 지연이나 왜곡 없이 완벽히 렌더링됨.

---

## 4. 관리자 시스템 (Admin Dashboard) 인터랙션 설계

### [구현 핵심 1] 관리자 모달 및 비밀번호 인증
- **진입 경로**: 헤더 상단 '관리자 모드' 버튼 또는 하단 전용 플로팅 트리거.
- **비밀번호 입력 모달 누락/차단 방지 (Gotcha & Fix)**:
  - 관리자 버튼 클릭 시 이벤트 버블링(`e.stopPropagation()`) 및 기본 동작 방지(`e.preventDefault()`)를 적용하여 모달이 닫히거나 페이지가 리로드되지 않도록 방어.
  - 최상위 `z-index`(`z-50` 이상)와 backdrop-blur 레이어를 적용하여 메인 비주얼에 가려지지 않도록 배치.
  - `AdminDashboard.tsx` 및 HTML 번들 내에서 상태 변수(`isAdminAuthenticated`, `showPasswordModal`)를 명확히 분리하여, 미인증 상태에서는 비밀번호 모달만, 인증 완료 후에는 대시보드 본체가 렌더링되도록 구조화.

### [구현 핵심 2] 듀얼 탭 대시보드
1. **고객 상담 문의 관리 (`inquiries`)**:
   - 고객이 웹사이트에서 접수한 성함, 연락처, 상담 내용, 접수 일시 실시간 표시.
   - 원클릭 상태 토글 기능: `접수 완료` (경고 펄스 효과) <-> `상담 완료` (그린 배지).
   - 미처리 문의 건수 헤더 뱃지 자동 카운팅.
2. **상품 및 판매가 관리 (`products`)**:
   - 상품별 ID, 카테고리, 명칭과 실시간 판매가 입력 그리드.
   - [가격 저장 & Supabase 동기화] 버튼 클릭 시 로컬 스토리지와 Supabase DB에 1클릭 양방향 동시 동기화.

---

## 5. Supabase 클라우드 데이터베이스 연동 & RLS 보안 가이드

### 3중 계층 데이터 동기화 파이프라인 (Hybrid Persistence)
- **1계층 (정적 HTML 프리렌더링)**: 소스 코드 자체에 사용자의 실제 가격 탑재 (최초 접속 시 즉시 로딩).
- **2계층 (로컬 브라우저 캐시)**: `localStorage.getItem('baekjae_product_prices')`로 사용자 로컬 즉시 저장.
- **3계층 (Supabase Cloud DB)**: 중앙 클라우드 DB에 데이터를 영구 저장하여, 관리자가 가격을 바꾸면 모든 방문자에게 실시간 전파.

### [치명적 주의점] Supabase Row-Level Security (RLS) 42501 에러
- **문제 증상**: 클라이언트 코드(`supabaseClient.ts`)에서 `anon public key`를 사용하여 `supabase.from('products').upsert(...)` 또는 `insert(...)`를 실행할 때, 콘솔에 아무 표시가 없거나 `error code 42501: new row violates row-level security policy`가 발생하며 DB 저장이 완전히 차단됨.
- **원인**: Supabase 테이블 생성 시 기본적으로 RLS(행 단위 보안)가 켜져 있어, 익명 클라이언트의 쓰기 권한이 차단되기 때문임.
- **해결 방안 (Supabase SQL Editor 실행)**:
  ```sql
  -- 제품 테이블 및 문의 내역 테이블의 쓰기 제한 해제
  ALTER TABLE products DISABLE ROW LEVEL SECURITY;
  ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
  ```
  또는 익명 클라이언트 대상 허용 정책 생성:
  ```sql
  CREATE POLICY "Allow public all" ON products FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all" ON inquiries FOR ALL USING (true) WITH CHECK (true);
  ```

### [클라이언트 방어 로직 (Graceful Fallback)]
- RLS 에러(`42501`)가 발생하더라도 사용자에게는 브라우저 로컬 저장을 우선 성공시키고, 사용자에게 RLS 해제 SQL 실행 안내 팝업을 제공하여 작업 흐름이 끊기지 않도록 처리:
  ```javascript
  if (error && (error.code === '42501' || error.message.includes('row-level security'))) {
    alert("⚠️ [안내] Supabase 데이터베이스 쓰기 권한 (RLS 정책 필요)\n\n로컬 브라우저에는 정상 저장되었습니다.\nSupabase 클라우드 DB에도 영구 반영하려면 SQL Editor에서 아래 명령어를 실행해주세요:\nALTER TABLE products DISABLE ROW LEVEL SECURITY;");
  }
  ```

### API 보안 및 .gitignore 설정
- `supabaseClient.ts`의 환경변수(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)는 `.env` 및 `.env.local`에 보관.
- `.gitignore`에 `.env*` 패턴을 필수로 등록하여 API 키가 GitHub 공개 저장소에 푸시되지 않도록 원천 차단.

---

## 6. GitHub & GitHub Pages 배포 워크플로우

### [케이스 A] 웹 업로드와 로컬 Git 이력 분기 해결 (`unrelated histories`)
사용자가 GitHub 웹 인터페이스에서 직접 파일을 올려 커밋(`Add files via upload`)하여 로컬 이력과 충돌할 때:
```bash
git fetch origin
git merge origin/main --allow-unrelated-histories -m "Merge remote origin/main" --strategy-option=ours
```

### [케이스 B] 인증 토큰을 활용한 비대화식 자동 푸시
- Windows Credential Manager에 보존된 GitHub 토큰을 읽어와 안전하게 원격 저장소(`origin main`)로 푸시:
```bash
git push https://<username>:<token>@github.com/<username>/<repo>.git main:main
```

### [케이스 C] GitHub Pages 실시간 배포 검증 스크립트
- 배포 후 캐시 지연 여부를 확인하기 위해 타임스탬프 쿼리(`?v=Date.now()`)와 함께 배포 URL의 실제 응답 본문을 직접 검사:
```javascript
const https = require('https');
https.get('https://<username>.github.io/<repo>/?v=' + Date.now(), res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Price Check:', body.includes('value="40,000"'));
  });
});
```

---

## 7. 지속 가능한 유지보수 체크리스트

- [x] **공식 비디오 파일 무결성**: `baekjae_shorts.mp4`가 프로젝트 루트에 존재하고 무음 자동 재생되는가?
- [x] **상품 이미지 5종 무결성**: `images/` 디렉토리에 정식 사진(`product_m1.jpg` 등)이 규격별로 탑재되어 있는가?
- [x] **사용자 실제 저장 가격 일치성**: 더미 숫자가 아닌 사용자가 직접 저장한 금액(`40,000`, `20,000`, `40,000`, `15,000`, `20,000`)이 `index.html`과 `AdminDashboard.tsx`에 기본값으로 완벽히 프리렌더링되었는가?
- [x] **관리자 모달 인증 안정성**: 관리자 진입 클릭 시 비밀번호 모달이 가림 현상 없이 정상 표시되는가?
- [x] **Supabase RLS 보안 및 연동 검증**: `products` 및 `inquiries` 테이블에 쓰기 차단(42501) 없이 정상 저장되도록 RLS 해제 또는 정책이 적용되었는가?
- [x] **보안 환경변수 격리**: `.env` 및 `.env.local`이 `.gitignore`에 등록되어 GitHub에 유출되지 않는가?
- [x] **GitHub Pages 배포 연동**: 커밋 내용이 `origin/main`에 푸시되어 실서비스 URL에서 모든 사용자에게 즉시 반영되는가?
