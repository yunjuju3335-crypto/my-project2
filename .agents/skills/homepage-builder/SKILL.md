---
name: homepage-builder
description: >-
  프리미엄 반응형 웹사이트 및 쇼핑몰/홍보 홈페이지를 구축할 때 사용하는 전문 워크플로우 가이드.
  2분할 히어로 섹션, 9:16 쇼츠 플레이어, 3D 팝업 애니메이션, 상품 카드 드래그 앤 드롭 이미지 교체,
  실시간 판매가 기재 및 콤마 포맷팅, 브라우저 저장소 사용자 데이터 역추적 및 프리렌더링(Authentic Price Pre-rendering),
  에셋 정식 파일 번들링(Asset Persistence), 메인 대표 이미지 및 쇼츠 영상 관리자 전용 제어,
  관리자 대시보드(문의/가격/미디어 3대 탭), Supabase 클라우드 DB 연동 및 RLS 정책 제어, GitHub Pages 실시간 배포 절차를 포함합니다.
---

# Homepage Builder Skill (프리미엄 홈페이지 제작 & 배포 종합 가이드)

사용자 맞춤형 고품격 웹사이트(쇼핑몰, 기업 소개, 의전/상례 서비스 등)를 기획부터 인터랙티브 애니메이션, 실물 미디어 에셋 영구화, 사용자 입력 금액 완전 복원 및 프리렌더링, 관리자 권한 기반 UI 격리 및 미디어 통합 관리(대표 사진 & 9:16 쇼츠 영상), Supabase 클라우드 데이터베이스 연동, GitHub Pages 실시간 배포까지 일관된 최고 품질로 구축하기 위한 체계적인 표준 실행 가이드입니다.

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
├── AdminDashboard.tsx              # Supabase 연동 관리자 대시보드 컴포넌트 (문의/가격/미디어)
├── supabaseClient.ts               # Supabase JS 클라이언트 설정 모듈
├── index.html                      # 단독 실행 및 즉각 브라우저 프리뷰/Pages 배포용 HTML5 번들
├── gemini-code-1792323230706.html  # 동기화된 HTML 백업 파일
├── README.md                       # 프로젝트 소개 및 실행 가이드
├── .env.local                      # Supabase URL & Anon Key (Git 제외)
└── .gitignore                      # Git 버전 관리 설정 (.env*, node_modules 등 철저 격리)
```

---

## 2. 권한 기반 UI 격리 및 미디어 업로드 시스템 (Role-Based Admin Control)

### [원칙] 일반 고객 화면과 관리자 편집 모드의 철저한 분리
- **일반 방문자 / 고객 관점**:
  - 파일 선택, 업로드, 교체 관련 버튼이나 폼이 일절 노출되지 않아 고급스럽고 단정한 브랜드 신뢰감을 유지함.
  - 상품 가격 입력란은 `readonly` 속성과 투명한 텍스트 스타일이 적용되어 임의 조작이 방지됨.
- **관리자 인증 시 (`adminAuthed === true`)**:
  - 상단 헤더에 `[⚙️ 관리자 콘솔]` 뱃지 및 우하단 `[관리자 모드 활성화됨]` 플로팅 제어 바 표시.
  - 메인 대표 이미지(`home_model.jpg`) 위에 `[📷 대표 이미지 변경]` 버튼 즉시 노출.
  - 9:16 쇼츠 플레이어 하단에 `[✨ 쇼츠 올리기 (관리자 전용)]` 패널이 활성화되어 로컬 비디오 업로드 및 유튜브 링크 설정 가능.
  - 상품 가격 입력란의 `readonly`가 자동 해제되어 실시간 가격 수정 가능.

### [패턴 1] 메인 대표 이미지(`home_model.jpg`) 교체 시스템
- **파일 선택 및 캔버스 자동 리사이징**:
  ```javascript
  function handleHeroImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const maxDim = 1600;
        let width = img.width, height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        // DOM 및 영구 저장소 반영
        document.getElementById('homeHeroImage').src = dataUrl;
        setStorage('baekjae_home_hero_image', dataUrl);
        showToast("✓ 대표 이미지가 업로드되어 영구 저장되었습니다.");
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
  ```
- **1클릭 기본값 복원**: `resetHeroImage()` 호출 시 로컬 캐시를 삭제하고 기본 에셋(`home_model.jpg`)으로 원복.

### [패턴 2] 9:16 세로형 쇼츠 플레이어 관리
- **로컬 비디오 / 유튜브 링크 듀얼 소스 지원**:
  - 동영상 파일 업로드(`videoFileInput`) 시 Blob Object URL 생성 및 영구 보존.
  - 유튜브 쇼츠 링크 등록 시 iframe 임베드(`autoplay=1&loop=1&mute=1`) 자동 변환.
- **기본 영상 복원**: 원클릭으로 정식 파일(`baekjae_shorts.mp4`)로 즉각 초기화.

---

## 3. 관리자 대시보드 3대 통합 탭 아키텍처

관리자 비밀번호(`admin1234`) 인증 시 진입하는 단일 모달 콘솔에서 사이트의 모든 핵심 데이터를 통합 제어:

1. **탭 1: 고객 상담 내역 (`inquiries`)**:
   - Supabase 클라우드 DB 연동 고객 문의 실시간 목록 테이블.
   - 접수일시, 고객명, 연락처, 상담 내용 표시.
   - 원클릭 상태 토글: `대기` (경고 애니메이션) <-> `완료` (그린 뱃지).
2. **탭 2: 상품 가격 일괄 관리 (`products`)**:
   - 9종 상례복 및 부자재의 실시간 판매가 일괄 입력 그리드.
   - `[전체 가격 저장]` 클릭 시 로컬 캐시와 Supabase DB에 1클릭 동시 동기화.
3. **탭 3: 메인 미디어 관리 (`media`)**:
   - **대표 모델 사진 카드**: 현재 사진 실시간 미리보기 + `[📁 새 대표 이미지 파일 선택 및 업로드]` + `[↺ 기본값 복원]`.
   - **9:16 쇼츠 비디오 카드**: 현재 재생 소스 상태 안내 + `[📁 동영상 파일 선택]` + `[🔗 유튜브 링크 등록]` + `[↺ 기본 영상 복원]`.

---

## 4. 에셋 & 데이터 영구화 아키텍처 (Authentic Pre-rendering & Supabase)

### [문제점] 브라우저 저장소의 로컬 종속성
- 사용자가 웹 화면에서 업로드하거나 관리자 화면에서 수정한 데이터는 기본적으로 해당 PC 브라우저 로컬 캐시(LocalStorage / IndexedDB)에만 국한됨.
- 따라서 GitHub Pages(`https://<user>.github.io/<repo>/`)로 배포하면 다른 방문자에게는 빈 템플릿이나 엉뚱한 더미 가격이 노출되는 문제 발생.

### [해결 파이프라인] 3중 계층 영구화 구조 (Hybrid Persistence)
- **1계층 (정적 HTML 프리렌더링)**:
  - 브라우저 로컬 스토리지(`baekjae_product_prices`)를 역추적하여 사용자가 실제 입력했던 금액(`40,000`, `20,000`, `40,000`, `15,000`, `20,000` 등)을 HTML `<input value="...">`와 `DEFAULT_PRICES`에 기본값으로 하드코딩 탑재.
  - 캐시가 없는 외부 방문자 브라우저에서도 0.1초 만에 실제 확정 금액이 오차 없이 렌더링됨.
- **2계층 (로컬 브라우저 세션 & 캐시)**:
  - `sessionStorage.getItem('baekjae_admin_authed')`로 관리자 로그인 상태를 유지.
  - `localStorage` / `IndexedDB`에 업로드된 미디어와 가격을 즉각 백업.
- **3계층 (Supabase Cloud DB)**:
  - 중앙 클라우드 DB에 데이터를 저장하여 모든 기기 간 데이터 동기화.

### [Supabase RLS 보안 제어]
- 익명 클라이언트(anon key)로 쓰기 시 `42501 (row-level security policy violation)` 방지를 위해 SQL Editor에서 실행:
  ```sql
  ALTER TABLE products DISABLE ROW LEVEL SECURITY;
  ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
  ```

---

## 5. GitHub & GitHub Pages 배포 워크플로우

1. **자동화 검증 스크립트 실행**:
   - 배포 후 캐시 지연 여부를 확인하기 위해 타임스탬프 쿼리(`?v=Date.now()`)로 GitHub Pages의 응답 본문 검사:
   ```javascript
   const https = require('https');
   https.get('https://<user>.github.io/<repo>/?v=' + Date.now(), res => {
     let b = ''; res.on('data', c => b += c);
     res.on('end', () => console.log('Deploy check:', b.includes('id="heroImageFileInput"')));
   });
   ```
2. **비대화식 토큰 푸시**:
   - Windows Credential Manager에 등록된 인증 정보를 통해 `origin/main`으로 안전하게 푸시.

---

## 6. 최종 유지보수 체크리스트

- [x] **일반 방문자 뷰 청결도**: 비로그인 상태에서 파일 선택 버튼, 업로드 폼이 완벽히 숨겨져 있는가?
- [x] **가격 인풋 읽기 전용**: 일반 방문자에게는 가격 입력창이 `readonly`로 동작하고, 관리자 로그인 시에만 수정 가능한가?
- [x] **대표 이미지 파일 업로드**: 홈 화면 및 관리자 대시보드에서 대표 사진을 파일 선택으로 변경하고 즉시 반영되는가?
- [x] **쇼츠 동영상 파일/링크 관리**: 관리자 모달 및 홈 화면에서 동영상 파일 및 유튜브 쇼츠 링크가 정상 작동하는가?
- [x] **관리자 3대 탭 연동**: 상담 내역, 상품 가격, 메인 미디어 관리가 탭 전환 시 오류 없이 동작하는가?
- [x] **GitHub Pages 배포 일치성**: 실서비스 사이트에서 모든 기능이 정상 빌드 및 렌더링되는가?
