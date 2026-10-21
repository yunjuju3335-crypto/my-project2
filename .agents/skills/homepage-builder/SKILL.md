---
name: homepage-builder
description: >-
  프리미엄 반응형 웹사이트 및 쇼핑몰/홍보 홈페이지를 구축할 때 사용하는 전문 워크플로우 가이드.
  2분할 히어로 섹션, 9:16 쇼츠 플레이어, 3D 팝업 애니메이션, 상품 카드 드래그 앤 드롭 이미지 교체,
  실시간 판매가 기재 및 콤마 포맷팅, 브라우저 저장소 사용자 데이터 역추적 및 프리렌더링(Authentic Price Pre-rendering),
  에셋 정식 파일 번들링(Asset Persistence), 메인 대표 이미지 및 쇼츠 영상 관리자 전용 제어,
  회원가입/로그인 기반 1:1 상담 문의 접근 제어(Member Only Access), 관리자 전용 회원 목록 관리 페이지,
  고객 문의 실시간 감지(헤더 뱃지/데스크톱 알림), 원클릭 전화·문자(SMS) 즉시 답장 및 상담 메모/완료 관리,
  관리자 대시보드 6대 탭(문의/회원/가격/FAQ/미디어/배포), 자주 묻는 질문(FAQ) 관리자 전용 추가·수정·순서변경·삭제 및 실시간 반영, Supabase 클라우드 DB 연동 및 RLS 정책 제어,
  실시간 배포 자동 동기화(Supabase 실시간 싱크 + 바탕화면 배포 배치파일 + 브라우저 GitHub API 직통 커밋) 절차를 포함합니다.
---

# Homepage Builder Skill (프리미엄 홈페이지 제작 & 배포 종합 가이드)

사용자 맞춤형 고품격 웹사이트(쇼핑몰, 기업 소개, 의전/상례 서비스 등)를 기획부터 인터랙티브 애니메이션, 실물 미디어 에셋 영구화, 사용자 입력 금액 완전 복원 및 프리렌더링, 관리자 권한 기반 UI 격리 및 미디어 통합 관리, **회원가입/로그인 기반 상담 문의 접근 제어 및 관리자 전용 회원 목록 관리 시스템**, **고객 문의 실시간 감지 및 원클릭 전화/문자(SMS) 답장 파이프라인**, Supabase 클라우드 데이터베이스 연동, 그리고 **관리자가 수정한 내용이 배포 사이트(GitHub Pages)에 즉시 적용되는 실시간 자동 배포 파이프라인**까지 일관된 최고 품질로 구축하기 위한 체계적인 표준 실행 가이드입니다.

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
├── AdminDashboard.tsx              # Supabase 연동 관리자 대시보드 컴포넌트 (문의/회원/가격/미디어)
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
  - 급한 긴급 문의를 위한 직통 전화(`010-3112-6730`) 링크는 상시 제공하여 이탈을 방지.
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

## 4. 관리자 대시보드 6대 통합 탭 아키텍처

1. **📥 실시간 문의 (`inquiries`)**: 회원 문의 실시간 확인, 미처리 뱃지 카운트, 원클릭 전화/문자 즉시 답장, 상담 메모 작성, 완료 여부(대기/완료) 토글.
2. **👥 회원 관리 (`members`)**: 가입 회원 목록 열람, 실시간 검색, 문의 이력 확인, 원클릭 전화/문자, 회원 삭제 관리.
3. **🛍️ 상품 및 가격 (`products`)**: 9종 상품 가격 일괄 수정 및 클라우드 DB 저장.
4. **❓ 자주 묻는 질문 관리 (`faq`) [신규]**: 홈페이지 FAQ 질문과 답변을 관리자만 추가, 수정, 순서 변경, 삭제할 수 있으며 방문자 화면에 즉시 실시간 동기화.
5. **🎬 메인 미디어 관리 (`media`)**: 대표 모델 사진 업로드/복원, 9:16 쇼츠 영상 파일 및 유튜브 링크 관리.
6. **🚀 배포 사이트 즉시 반영 (`deploy`)**: Supabase 클라우드 실시간 동기화 상태 점검, RLS 해제 SQL 복사, GitHub Pages 직통 배포 제어.

---

## 5. 데이터베이스(Supabase) 스키마 및 보안 제어

관리자가 수정한 회원 목록과 문의 내용이 Supabase 클라우드에 영구 저장되도록 SQL Editor에서 1회 실행:
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

-- 3. 자주 묻는 질문(faqs) 테이블 생성
CREATE TABLE IF NOT EXISTS faqs (
  id text primary key,
  question text,
  answer text,
  category text,
  sort_order int,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. 익명 클라이언트(Anon Key) 쓰기 권한 허용 (RLS 잠금 해제)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;
```

---

## 6. 자주 묻는 질문(FAQ) 동적 아코디언 및 관리자 전용 제어 시스템 (Dynamic FAQ System)

### [원칙] 관리자 전용 등록/수정/순서변경/삭제 및 고객 실시간 렌더링
1. **고객 화면 (`#page-faq`)**:
   - **실시간 키워드 검색**: 질문 및 답변 본문 실시간 검색창 (`#userFaqSearchInput`) 및 원클릭 검색어 초기화 기능.
   - **카테고리 필터 탭**: 전체보기, 주문/배송, 교환/환불, 상품/사이즈, 대량주문, 기타문의 등 테마별 즉시 필터링.
   - **인터랙티브 아코디언**: 품격 있는 카드 UI, Q&A 브랜드 액센트, 회전식 접기/펼치기 화살표 뱃지.
   - **관리자 접속 안내 바 (`#userFaqAdminBar`)**: 관리자 모드 활성화 시 헤더 하단에 바로가기 바가 자동 노출되어 원클릭으로 FAQ 관리 대시보드 진입.
   - **하단 1:1 상담 바로가기**: 원하는 답변을 찾지 못한 고객을 위한 원클릭 1:1 문의 접수 탭 전환 및 직통 전화(`010-3112-6730`) 배너.

2. **관리자 전용 대시보드 (`#adminTab-faq`)**:
   - **총 질문 수 동적 카운트 뱃지**: 등록된 FAQ 개수를 헤더와 사이드바 뱃지에 실시간 표기.
   - **새 질문 등록 / 수정 모달 폼 (`#adminFaqFormCard`)**: 카테고리 선택 드롭다운, 질문 제목(Q), 상세 답변 내용(A) 입력. 수정 모드 클릭 시 폼에 기존 내용 자동 채움 및 부드러운 스크롤 이동.
   - **질문 순서 변경 (위로/아래로 이동)**: `[▲]` `[▼]` 버튼을 클릭하여 방문자에게 노출될 순서를 실시간으로 재배열.
   - **실시간 삭제 확인**: 삭제 전 컨펌 알림 후 로컬 스토리지 및 클라우드 DB에서 즉각 제거.
   - **홈페이지 즉시 확인 (`previewFaqOnSite`)**: 대시보드에서 `[👁️ 홈페이지에서 즉시 확인 ↗]` 클릭 시 관리자 모달을 닫고 FAQ 화면으로 자동 이동하여 검증.

3. **이중 지속성 및 배포 자동화**:
   - LocalStorage(`baekjae_faqs`)에 즉시 저장하여 네트워크 지연 없이 즉각 반응.
   - Supabase `faqs` 테이블에 백엔드 비동기 동기화.
   - GitHub 직통 배포 시 `index.html` 내 `DEFAULT_FAQS` 상수 배열을 최신 데이터로 동적 치환하여 방문자가 캐시가 없더라도 최신 질문을 즉각 렌더링받을 수 있도록 보장.

---

## 7. 최종 유지보수 체크리스트

- [x] **자주 묻는 질문 관리자 전용 제어**: 관리자 대시보드 `❓ 자주 묻는 질문 관리` 탭에서 질문 추가, 수정, 순서 변경, 삭제가 가능한가?
- [x] **고객 화면 실시간 반영**: 관리자가 저장한 질문과 답변이 새로고침 없이도 고객 FAQ 탭에 즉시 렌더링되는가?
- [x] **검색 및 카테고리 필터**: 질문 키워드 검색 및 카테고리별 필터링이 부드럽게 작동하는가?
- [x] **FAQ 데이터 DB 및 로컬 이중 영구화**: `localStorage`와 Supabase `faqs` 테이블에 데이터가 안전하게 보관되는가?

- [x] **비회원 문의 접근 차단**: 비로그인 상태에서 문의 탭 접속 시 로그인 안내 카드가 뜨고 작성이 차단되는가?
- [x] **회원 로그인 시 문의 작성 활성화**: 로그인 후 문의 폼이 나타나고 성함과 연락처가 자동으로 채워지는가?
- [x] **관리자 전용 회원 목록 페이지**: 관리자 콘솔 `👥 회원 관리` 탭에서 회원 목록, 검색, 통화/문자 액션이 정상 작동하는가?
- [x] **회원 및 문의 데이터 DB 동시 저장**: 로컬 스토리지뿐만 아니라 Supabase `members`, `inquiries` 테이블에 정상 기록되는가?
- [x] **GitHub Pages 배포 일치성**: 실서비스 사이트에서 회원가입, 로그인, 문의 작성, 관리자 회원 관리 기능이 정상 동작하는가?
