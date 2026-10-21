---
name: homepage-builder
description: >-
  프리미엄 반응형 웹사이트 및 쇼핑몰/홍보 홈페이지를 구축할 때 사용하는 전문 워크플로우 가이드.
  2분할 히어로 섹션, 9:16 쇼츠 플레이어, 3D 팝업 애니메이션, 상품 카드 드래그 앤 드롭 이미지 교체,
  실시간 판매가 기재 및 콤마 포맷팅, 브라우저 저장소 사용자 데이터 역추적 및 프리렌더링(Authentic Price Pre-rendering),
  에셋 정식 파일 번들링(Asset Persistence), 메인 대표 이미지 및 쇼츠 영상 관리자 전용 제어,
  회원가입/로그인 기반 1:1 상담 문의 접근 제어(Member Only Access), 관리자 전용 회원 목록 관리 페이지,
  고객 문의 실시간 감지(헤더 뱃지/데스크톱 알림), 원클릭 전화·문자(SMS) 즉시 답장 및 상담 메모/완료 관리,
  관리자 대시보드 6대 탭(문의/회원/가격/FAQ/미디어/배포), 자주 묻는 질문(FAQ) 관리자 전용 추가·수정·순서변경·삭제 및 실시간 반영,
  Supabase 클라우드 DB 연동 및 RLS 정책 제어, 실시간 배포 자동 동기화(Supabase 실시간 싱크 + 바탕화면 배포 배치파일 + 브라우저 GitHub API 직통 커밋) 절차를 포함합니다.
---

# Homepage Builder Skill (프리미엄 홈페이지 제작 & 배포 종합 가이드)

사용자 맞춤형 고품격 웹사이트(쇼핑몰, 기업 소개, 의전/상례 서비스 등)를 기획부터 인터랙티브 애니메이션, 실물 미디어 에셋 영구화, 사용자 입력 금액 완전 복원 및 프리렌더링, 관리자 권한 기반 UI 격리 및 미디어 통합 관리, **회원가입/로그인 기반 상담 문의 접근 제어 및 관리자 전용 회원 목록 관리 시스템**, **고객 문의 실시간 감지 및 원클릭 전화/문자(SMS) 답장 파이프라인**, **자주 묻는 질문(FAQ) 관리자 전용 실시간 등록·수정·순서변경·삭제 시스템**, Supabase 클라우드 데이터베이스 연동, 그리고 **관리자가 수정한 내용이 배포 사이트(GitHub Pages)에 즉시 적용되는 실시간 자동 배포 파이프라인**까지 일관된 최고 품질로 구축하기 위한 체계적인 표준 실행 가이드입니다.

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
├── home_model.jpg                  # [핵심] 사용자가 업로드한 고해상도 공식 대표 모델 이미지
├── 배포하기_클릭.bat               # [핵심] 바탕화면 더블클릭 1초 GitHub Pages 배포 스크립트
├── deploy.bat                      # 영문 별칭 배포 스크립트
├── code_artifact.tsx               # React/Tailwind/Lucide 기반 모듈형 컴포넌트
├── AdminDashboard.tsx              # Supabase 연동 관리자 대시보드 컴포넌트 (문의/회원/가격/FAQ/미디어/배포)
├── supabaseClient.ts               # Supabase JS 클라이언트 설정 모듈
├── index.html                      # 단독 실행 및 즉각 브라우저 프리뷰/Pages 배포용 HTML5 번들
├── gemini-code-1792323230706.html  # 동기화된 HTML 백업 파일
├── README.md                       # 프로젝트 소개 및 실행 가이드
├── .env.local                      # Supabase URL & Anon Key (Git 제외)
└── .gitignore                      # Git 버전 관리 설정 (.env*, node_modules 등 철저 격리)
```

---

## 2. 회원 인증 및 문의글 작성 접근 제어 (Member Authentication & Gatekeeping)

### [원칙] 비회원 문의 작성 차단 및 회원 전용 1:1 상담 보장
- **비로그인 고객 관점**:
  - 문의(Inquiry) 탭 방문 시 문의 폼이 숨겨지고 **"회원 전용 상담 문의 서비스"** 안내 카드(`inquiryLoginRequired`)가 노출됨.
  - 상단 헤더에 `[👤 로그인 / 회원가입]` 버튼이 노출되며, 클릭 시 회원 인증 모달이 열림.
  - 급한 긴급 문의를 위한 직통 전화(`010-3112-6730`) 링크는 상시 제공하여 고객 이탈을 방지.
- **회원 로그인/가입 완료 시**:
  - 상단 헤더에 `[👤 {홍길동}님]`과 `[로그아웃]` 버튼이 활성화됨.
  - 문의(Inquiry) 탭 진입 시 회원 인증 배지와 함께 문의 폼(`inquiryFormContainer`)이 자동 열림.
  - 고객의 성함과 연락처가 입력창에 자동으로 채워져(Auto-fill) 편리하게 문의 내용을 작성할 수 있음.
  - 작성 접수 시 `member_id`, `username`, `name`, `phone`, `details`, `created_at`이 데이터베이스에 안전하게 기록됨.

### 회원가입 & 로그인 모달 (`authModal`)
- **로그인 탭**: 아이디, 비밀번호 입력 후 로그인.
- **간편 회원가입 탭**: 아이디(4자 이상), 비밀번호(4자 이상), 성함/상호명, 연락처(휴대폰 번호) 입력 즉시 가입 완료 및 자동 로그인.
- **데이터베이스 듀얼 영구 저장**:
  - 브라우저 로컬 스토리지(`baekjae_members`) 및 Supabase 클라우드 DB(`members` 테이블)에 동시 저장.

---

## 3. 관리자 전용 회원 목록 관리 시스템 (`adminTab-members`)

관리자 비밀번호(`admin1234`) 인증 시 대시보드에서 가입 회원 전체를 전용으로 조회하고 관리:

1. **상단 회원 통계 요약**:
   - 총 가입 회원 수 (`statTotalMembers`)
   - 실제 문의를 접수한 회원 수 (`statInquiryMembers`)
   - DB 클라우드 동기화 상태 표시
2. **실시간 검색 및 필터**:
   - 검색창을 통해 회원의 성함, 연락처, 아이디로 실시간 필터링.
3. **회원 카드 / 목록 테이블**:
   - 가입일시, 아이디, 성함, 연락처 표시.
   - **문의 건수 배지**: 해당 회원이 남긴 상담 문의 건수(`문의 N건`) 표시.
   - **원클릭 통신 액션**: `[📞 통화]` (`tel:`), `[💬 문자]` (`sms:`) 버튼을 통해 관리자가 고객에게 바로 연락.
   - **회원 삭제/탈퇴 기능**: `[🗑️ 삭제]` 버튼을 통해 불필요한 계정 정리 가능 (로컬 및 DB 동시 삭제).

---

## 4. 고객 문의 실시간 감지 및 원클릭 답장 파이프라인 (`adminTab-inquiries`)

### [원칙] 고객 문의 접수 즉시 관리자 인지 및 다이렉트 소통 파이프라인
1. **실시간 감지 및 알림**:
   - **상단 헤더 뱃지 점등 (`#headerInquiryBadge`)**: 미처리 신규 문의 발생 시 헤더에 `신규 N건` 붉은 뱃지 자동 점등.
   - **데스크톱 브라우저 푸시 (`Notification API`)**: 관리자 대시보드에서 권한 허용 시 새 문의 접수 즉시 브라우저 팝업 알림 발송.
2. **원클릭 전화 및 문자(SMS) 즉시 답장**:
   - `[📞 즉시 통화]`: 스마트폰 및 PC 통화 앱과 연동(`tel:${phone}`)되어 즉각 다이렉트 전화 연결.
   - `[💬 문자 답장]`: 기재된 연락처와 고객 성함이 사전 기재된 SMS 문자 발송 창 호출(`sms:${phone}?body=...`).
3. **상태 관리 및 상담 메모**:
   - `[대기]` <-> `[완료]` 원클릭 상태 전환.
   - 상담 진행 내역 및 특이사항을 기록할 수 있는 관리자 전용 실시간 메모(`note`) 필드 지원.
   - 불필요하거나 테스트 문의를 즉시 정리할 수 있는 삭제(`deleteAdminInquiry`) 지원.

---

## 5. 자주 묻는 질문(FAQ) 동적 아코디언 및 관리자 전용 제어 시스템 (`adminTab-faq`)

### [원칙] 관리자 전용 등록/수정/순서변경/삭제 및 고객 실시간 렌더링
1. **고객 방문자 화면 (`#page-faq`)**:
   - **실시간 키워드 검색**: 질문 및 답변 본문 실시간 검색창 (`#userFaqSearchInput`) 및 원클릭 검색어 초기화 기능.
   - **카테고리 필터 탭 (`#userFaqCategoryPills`)**: 전체보기, 주문/배송, 교환/환불, 상품/사이즈, 대량주문, 기타문의 등 테마별 즉시 필터링.
   - **인터랙티브 아코디언**: 품격 있는 카드 UI, Q&A 브랜드 액센트, 부드러운 펼침/접힘 및 회전식 화살표 토글.
   - **관리자 접속 안내 바 (`#userFaqAdminBar`)**: 관리자 모드 활성화 시 상단에 바로가기 바가 자동 노출되어 원클릭으로 FAQ 관리 대시보드 진입.
   - **하단 1:1 상담 안내 배너**: 원하는 답변을 찾지 못한 고객을 위한 원클릭 1:1 문의 탭 전환 및 직통 전화(`010-3112-6730`) 링크.

2. **관리자 전용 대시보드 (`#adminTab-faq`)**:
   - **총 질문 수 동적 카운트 뱃지**: 등록된 FAQ 개수를 헤더와 사이드바 뱃지에 실시간 표기.
   - **새 질문 등록 / 수정 폼 (`#adminFaqFormCard`)**: 카테고리 선택 드롭다운, 질문 제목(Q), 상세 답변 내용(A) 입력. 수정 버튼 클릭 시 폼에 기존 내용 자동 채움 및 부드러운 스크롤 이동.
   - **질문 노출 순서 재배열 (`moveAdminFaqUp` / `moveAdminFaqDown`)**: `[▲]` `[▼]` 버튼을 클릭하여 방문자에게 노출될 순서를 실시간으로 위/아래 이동.
   - **실시간 삭제 확인 (`deleteAdminFaq`)**: 삭제 전 컨펌 알림 후 로컬 스토리지 및 클라우드 DB에서 즉각 제거.
   - **홈페이지 즉시 확인 (`previewFaqOnSite`)**: 대시보드에서 `[👁️ 홈페이지에서 즉시 확인 ↗]` 클릭 시 관리자 모달을 닫고 FAQ 화면으로 자동 이동하여 검증.

3. **이중 지속성 및 배포 자동화**:
   - LocalStorage(`baekjae_faqs`)에 즉시 저장하여 네트워크 지연 없이 즉각 반응.
   - Supabase `faqs` 테이블에 백엔드 비동기 동기화.
   - GitHub 직통 배포 시 `index.html` 내 `DEFAULT_FAQS` 상수 배열을 최신 데이터로 동적 치환하여 방문자가 캐시가 없더라도 최신 질문을 즉각 렌더링받을 수 있도록 보장.

---

## 6. 상품 실시간 판매가 프리렌더링 및 에셋 정식 번들링 (Price & Media Asset Persistence)

### [원칙] 관리자가 입력한 실제 데이터의 영구적 보존
1. **실제 상품 판매가 정적 프리렌더링**:
   - 관리자가 등록한 실제 금액(`40,000`, `20,000`, `40,000`, `15,000`, `20,000` 등)을 `index.html`의 `DEFAULT_PRICES`에 기본값으로 하드코딩하여 캐시 없는 신규 방문자에게도 즉시 올바른 가격 표출.
   - 입력 시 숫자 이외의 문자 자동 필터링 및 실시간 천 단위 콤마(`ko-KR`) 포맷팅 적용.
2. **공식 고해상도 미디어 에셋 번들링**:
   - 브라우저 Canvas/LevelDB에만 임시로 머물던 사진을 프로젝트 정식 파일(`home_model.jpg`, `images/product_*.jpg`)로 영구화하여 Git에 커밋.
   - 9:16 공식 세로형 쇼츠 동영상(`baekjae_shorts.mp4`) 및 유튜브 쇼츠 링크 동시 지원.
   - 일반 방문자에게는 readonly 잠금, 관리자 인증 시에만 가격 수정 및 사진/동영상 교체 툴 오픈.

---

## 7. 관리자 대시보드 6대 통합 탭 아키텍처

관리자 비밀번호(`admin1234`) 인증 시 6개 핵심 관리 메뉴 제공:

1. **📥 실시간 문의 (`inquiries`)**: 회원 문의 실시간 확인, 미처리 뱃지 카운트, 원클릭 전화/문자 즉시 답장, 상담 메모 작성, 완료 여부(대기/완료) 토글.
2. **👥 회원 관리 (`members`)**: 가입 회원 목록 열람, 실시간 검색, 문의 이력 확인, 원클릭 전화/문자, 회원 삭제 관리.
3. **🛍️ 상품 및 가격 (`products`)**: 9종 상품 가격 일괄 수정 및 클라우드 DB 저장.
4. **❓ 자주 묻는 질문 관리 (`faq`)**: 홈페이지 FAQ 질문과 답변을 추가, 수정, 순서 변경, 삭제할 수 있으며 방문자 화면에 즉시 실시간 동기화.
5. **🎬 메인 미디어 관리 (`media`)**: 대표 모델 사진 업로드/복원, 9:16 쇼츠 영상 파일 및 유튜브 링크 관리.
6. **🚀 배포 사이트 즉시 반영 (`deploy`)**: Supabase 클라우드 실시간 동기화 상태 점검, RLS 해제 SQL 복사, GitHub Pages 직통 배포 제어.

---

## 8. 데이터베이스(Supabase) 스키마 및 보안 제어

관리자가 수정한 회원 목록, 문의 내용, 자주 묻는 질문이 Supabase 클라우드에 영구 저장되도록 SQL Editor에서 1회 실행:
```sql
-- 1. 회원(members) 테이블 생성
CREATE TABLE IF NOT EXISTS members (
  id text primary key,
  username text unique,
  password text,
  name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. 문의(inquiries) 테이블 생성
CREATE TABLE IF NOT EXISTS inquiries (
  id text primary key default gen_random_uuid(),
  name text,
  phone text,
  details text,
  status text default '대기',
  note text default '',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. 상품 가격 및 설정(products) 테이블 생성
CREATE TABLE IF NOT EXISTS products (
  id text primary key,
  name text,
  price text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. 자주 묻는 질문(faqs) 테이블 생성
CREATE TABLE IF NOT EXISTS faqs (
  id text primary key,
  question text,
  answer text,
  category text,
  sort_order int,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. 익명 클라이언트(Anon Key) 쓰기 권한 허용 (RLS 잠금 해제)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;
```

---

## 9. 3단계 실시간 배포 자동화 파이프라인 (Live Deployment Triad)

관리자가 브라우저에서 작업한 결과를 방문자 배포 주소에 100% 반영하기 위한 3중 배포 체계:

1. **클라우드 실시간 동기화 (Supabase Live Sync)**:
   - 가격, 사진, 회원, 문의, FAQ를 Supabase PostgreSQL에 비동기 즉각 기록.
   - 배포 주소(`https://yunjuju3335-crypto.github.io/my-project2/`)에 접속하는 모든 방문자의 브라우저가 첫 로드 시 클라우드 데이터를 즉시 병합 렌더링.
2. **바탕화면 원클릭 배포 도구 (`배포하기_클릭.bat` / `deploy.bat`)**:
   - PC 바탕화면 또는 프로젝트 폴더의 배치파일을 더블클릭하면 1초 만에 `git add -A`, `git commit`, `git push origin main`이 자동 실행되어 GitHub Pages 빌드 자동 트리거.
3. **브라우저 직통 GitHub Pages 배포 (`triggerGitHubApiDeploy`)**:
   - 관리자 대시보드 [배포 사이트 즉시 반영] 탭에서 개인 액세스 토큰(PAT)을 입력 후 버튼 클릭 시, 브라우저가 직접 GitHub REST API를 호출하여 최신 가격과 FAQ를 소스코드에 커밋.

---

## 10. 최종 유지보수 종합 체크리스트

- [x] **비회원 문의 접근 차단**: 비로그인 상태에서 문의 탭 접속 시 로그인 안내 카드가 뜨고 작성이 차단되는가?
- [x] **회원 로그인 시 문의 작성 활성화**: 로그인 후 문의 폼이 나타나고 성함과 연락처가 자동으로 채워지는가?
- [x] **관리자 전용 회원 목록 페이지**: 관리자 콘솔 `👥 회원 관리` 탭에서 회원 목록, 검색, 통화/문자 액션이 정상 작동하는가?
- [x] **고객 문의 실시간 감지 및 답장**: 신규 문의 시 헤더 뱃지가 점등되고, 원클릭 통화/문자 답장 및 상담 메모가 유지되는가?
- [x] **자주 묻는 질문 관리자 전용 제어**: 관리자 대시보드 `❓ 자주 묻는 질문 관리` 탭에서 질문 추가, 수정, 순서 변경, 삭제가 가능한가?
- [x] **FAQ 고객 화면 실시간 반영**: 관리자가 저장한 질문과 답변이 새로고침 없이도 고객 FAQ 탭에 즉시 렌더링되는가?
- [x] **FAQ 검색 및 카테고리 필터**: 질문 키워드 검색 및 카테고리별 필터링이 부드럽게 작동하는가?
- [x] **실제 가격 및 미디어 영구화**: 실제 상품 가격과 대표 사진이 정적 HTML과 번들 파일로 영구 보존되어 있는가?
- [x] **데이터베이스 듀얼 영구 저장**: 회원, 문의, 가격, FAQ가 `localStorage`와 Supabase 클라우드에 안전하게 보관되는가?
- [x] **GitHub Pages 배포 일치성**: 실서비스 배포 사이트(`my-project2`)에서 모든 기능이 동일하게 정상 작동하는가?
