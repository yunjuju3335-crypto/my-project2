---
name: homepage-builder
description: >-
  프리미엄 반응형 웹사이트 및 쇼핑몰/홍보 홈페이지를 구축할 때 사용하는 전문 워크플로우 가이드.
  2분할 히어로 섹션, 9:16 쇼츠 플레이어, 3D 팝업 애니메이션, 상품 카드 드래그 앤 드롭 이미지 교체,
  실시간 판매가 기재 및 콤마 포맷팅, 브라우저 저장소 사용자 데이터 역추적 및 프리렌더링(Authentic Price Pre-rendering),
  에셋 정식 파일 번들링(Asset Persistence), 메인 대표 이미지 및 쇼츠 영상 관리자 전용 제어,
  관리자 대시보드(문의/가격/미디어/배포 4대 탭), Supabase 클라우드 DB 연동 및 RLS 정책 제어,
  실시간 배포 자동 동기화(Supabase 실시간 싱크 + 바탕화면 배포 배치파일 + 브라우저 GitHub API 직통 커밋) 절차를 포함합니다.
---

# Homepage Builder Skill (프리미엄 홈페이지 제작 & 배포 종합 가이드)

사용자 맞춤형 고품격 웹사이트(쇼핑몰, 기업 소개, 의전/상례 서비스 등)를 기획부터 인터랙티브 애니메이션, 실물 미디어 에셋 영구화, 사용자 입력 금액 완전 복원 및 프리렌더링, 관리자 권한 기반 UI 격리 및 미디어 통합 관리(대표 사진 & 9:16 쇼츠 영상), Supabase 클라우드 데이터베이스 연동, 그리고 **관리자가 수정한 내용이 배포 사이트(GitHub Pages)에 즉시 적용되는 실시간 자동 배포 파이프라인**까지 일관된 최고 품질로 구축하기 위한 체계적인 표준 실행 가이드입니다.

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
├── 배포하기_클릭.bat               # [핵심] 바탕화면 더블클릭 1초 GitHub Pages 배포 스크립트
├── deploy.bat                      # 영문 별칭 배포 스크립트
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

## 2. 배포 사이트(GitHub Pages) 실시간 자동 적용 3대 아키텍처 (Live Deployment Sync)

관리자가 웹 화면이나 관리자 대시보드에서 가격을 바꾸거나 대표 사진/쇼츠를 변경했을 때, **배포된 공식 사이트([https://<user>.github.io/<repo>/])에 접속하는 모든 손님들에게 변경사항이 즉각 반영**되도록 보장하는 3중 동기화 파이프라인입니다.

### [방식 1] Supabase Zero-Build 클라우드 실시간 동기화 (권장 / 가장 빠름)
- **원리**: GitHub 빌드를 기다릴 필요 없이, 손님이 사이트에 접속하는 순간(0.1초) 클라우드 DB에서 최신 가격과 미디어를 읽어와 화면에 즉시 덮어씌움.
- **`<head>` 최상단 글로벌 초기화**:
  - `window.sbClient`를 `<head>`에서 선언하여 모든 스크립트 및 `DOMContentLoaded` 이전에 준비 완료.
- **방문자 접속 시 자동 렌더링 (`DOMContentLoaded`)**:
  ```javascript
  const activeSb = window.sbClient || (window.supabase && window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY));
  if (activeSb) {
    const { data } = await activeSb.from('products').select('*');
    if (data && data.length > 0) {
      data.forEach(item => {
        if (item.id === 'config_hero_image' && item.price) {
          document.getElementById('homeHeroImage').src = item.price;
        } else if (item.id === 'config_shorts' && item.price) {
          const sc = JSON.parse(item.price);
          if (sc.url) loadYoutubeShorts(sc.url);
        } else if (item.price) {
          savedPrices[item.id] = item.price;
          const input = document.getElementById('price-' + item.id);
          if (input) input.value = item.price;
        }
      });
    }
  }
  ```
- **관리자 저장 시 클라우드 동시 업서트**:
  - 상품 가격 저장 시: `activeSb.from('products').upsert({ id: p.id, name: p.name, price: savedPrices[p.id] })`
  - 대표 사진 변경 시: `activeSb.from('products').upsert({ id: 'config_hero_image', name: '홈페이지_대표모델사진', price: dataUrl })`
  - 쇼츠 링크/영상 변경 시: `activeSb.from('products').upsert({ id: 'config_shorts', name: '홈페이지_쇼츠설정', price: JSON.stringify({ type: 'url', url: rawUrl }) })`
- **[필수 선행 조건] Supabase RLS 해제 (1초 소요)**:
  - Supabase 대시보드 -> SQL Editor에서 아래 1줄을 실행해야 클라이언트 쓰기가 허용됨:
    ```sql
    ALTER TABLE products DISABLE ROW LEVEL SECURITY;
    ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
    ```

### [방식 2] PC 바탕화면 '배포하기_클릭.bat' 원클릭 푸시 (영구 소스코드 배포)
- 프로젝트 루트의 `배포하기_클릭.bat` 또는 `deploy.bat`를 더블클릭하면:
  1. `git add .` (수정된 HTML, 이미지, 비디오, 대시보드 자동 감지)
  2. `git commit -m "update: admin updated content and prices"`
  3. `git push origin main`
- 약 30초 내에 GitHub Pages 파이프라인이 자동 빌드되어 소스 코드 자체가 영구 갱신됨.

### [방식 3] 브라우저 직통 GitHub API 원클릭 자동 배포 (No-Terminal Deploy)
- 관리자 콘솔 [배포 사이트 즉시 반영] 탭에 GitHub 토큰(Personal Access Token)을 1회 등록 (`localStorage`에 비공개 저장).
- `[지금 변경사항 GitHub Pages로 즉시 커밋 및 자동 배포]` 버튼 클릭:
  1. GitHub REST API(`GET /contents/index.html`)로 원격 파일 조회.
  2. 최신 저장 가격(`savedPrices`)으로 `DEFAULT_PRICES` 소스 코드 자동 치환.
  3. GitHub REST API(`PUT /contents/index.html`)로 `main` 브랜치에 직접 자동 커밋!
  4. GitHub Pages가 자동으로 재빌드되어 별도의 터미널 작업 없이 배포 완료.

---

## 3. 권한 기반 UI 격리 및 미디어 업로드 시스템 (Role-Based Admin Control)

### [원칙] 일반 고객 화면과 관리자 편집 모드의 철저한 분리
- **일반 방문자 / 고객 관점**:
  - 파일 선택, 업로드, 교체 관련 버튼이나 폼이 일절 노출되지 않아 고급스럽고 단정한 브랜드 신뢰감을 유지함.
  - 상품 가격 입력란은 `readonly` 속성과 투명한 텍스트 스타일이 적용되어 임의 조작이 방지됨.
- **관리자 인증 시 (`adminAuthed === true`, 비밀번호 `admin1234`)**:
  - 상단 헤더에 `[⚙️ 관리자 콘솔]` 뱃지 및 우하단 `[관리자 모드 활성화됨]` 플로팅 제어 바 표시.
  - 메인 대표 이미지(`home_model.jpg`) 위에 `[📷 대표 이미지 변경]` 버튼 즉시 노출.
  - 9:16 쇼츠 플레이어 하단에 `[✨ 쇼츠 올리기 (관리자 전용)]` 패널이 활성화되어 로컬 비디오 업로드 및 유튜브 링크 설정 가능.
  - 상품 가격 입력란의 `readonly`가 자동 해제되어 실시간 가격 수정 가능.

---

## 4. 관리자 대시보드 4대 통합 탭 아키텍처

1. **📥 실시간 문의 (`inquiries`)**: 고객 접수 문의 실시간 확인 및 대기/완료 원클릭 토글.
2. **🛍️ 상품 및 가격 (`products`)**: 9종 상품 가격 일괄 수정 및 클라우드 DB 저장.
3. **🎬 메인 미디어 관리 (`media`)**: 대표 모델 사진 업로드/복원, 9:16 쇼츠 영상 파일 및 유튜브 링크 관리.
4. **🚀 배포 사이트 즉시 반영 (`deploy`)**: Supabase 클라우드 실시간 동기화 상태 점검, RLS 해제 SQL 복사, GitHub Pages 직통 배포 제어.

---

## 5. 지속 가능한 유지보수 체크리스트

- [x] **배포 사이트 실시간 반영**: 관리자가 수정한 가격과 사진이 Supabase 및 GitHub Pages 배포 사이트에 0.1초 만에 반영되는가?
- [x] **`window.sbClient` 스코프 무결성**: `<head>` 최상단에서 Supabase 클라이언트가 초기화되어 `DOMContentLoaded`에서 오류 없이 동작하는가?
- [x] **미디어 클라우드 동기화**: 대표 사진(`config_hero_image`)과 쇼츠(`config_shorts`)가 Supabase에 동시 저장되어 다른 기기에서도 동일하게 렌더링되는가?
- [x] **바탕화면 원클릭 배포 파일**: `배포하기_클릭.bat` 파일이 정상 동작하여 GitHub `main`에 원클릭 푸시되는가?
- [x] **일반 고객 뷰 청결도**: 비로그인 방문자에게는 편집 버튼이나 업로드 폼이 완벽히 숨겨져 품격 있는 화면이 제공되는가?
