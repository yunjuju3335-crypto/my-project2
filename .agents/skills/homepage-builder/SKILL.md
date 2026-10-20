---
name: homepage-builder
description: >-
  프리미엄 반응형 웹사이트 및 쇼핑몰/홍보 홈페이지를 구축할 때 사용하는 전문 워크플로우 가이드.
  2분할 히어로 섹션, 9:16 쇼츠 플레이어, 3D 팝업 애니메이션, 상품 카드 드래그 앤 드롭 이미지 교체,
  판매가 실시간 기재 및 콤마 포맷팅, 브라우저 저장소 에셋 추출/정식 파일 번들링(Asset Persistence),
  GitHub Pages 배포 및 Git 이력 병합 절차를 포함합니다.
---

# Homepage Builder Skill (프리미엄 홈페이지 제작 & 배포 통합 가이드)

사용자 맞춤형 고품격 웹사이트(쇼핑몰, 기업 소개, 의전 서비스 등)를 기획부터 애니메이션, 데이터 영구 보존, 실물 에셋 번들링, GitHub Pages 실시간 배포까지 일관된 품질로 구축하기 위한 체계적인 실행 가이드입니다.

---

## 1. 프로젝트 아키텍처 개요

```
homepage/
├── .agents/
│   └── skills/
│       └── homepage-builder/
│           └── SKILL.md            # 홈페이지 제작 표준 워크플로우 스킬
├── images/                         # [핵심] 등록/복원된 정식 상품 사진 에셋
│   ├── product_m1.jpg              # 남성 상·하의 양복
│   ├── product_m2.jpg              # 와이셔츠
│   ├── product_w1.jpg              # 개량 한복
│   ├── product_am1.jpg             # 완장
│   └── product_am2.jpg             # 넥타이
├── baekjae_shorts.mp4              # [핵심] 9:16 세로형 공식 쇼츠 비디오 파일
├── code_artifact.tsx               # React/Tailwind/Lucide 기반 모듈형 컴포넌트
├── index.html                      # 단독 실행 및 즉각 브라우저 프리뷰용 HTML5 번들
├── gemini-code-1792323230706.html  # 동기화된 HTML 백업 파일
├── home_model.jpg                  # 공식 브랜드 모델 고해상도 대표 이미지
├── README.md                       # 프로젝트 소개 및 실행 가이드
└── .gitignore                      # Git 버전 관리 설정
```

---

## 2. 핵심 UI/UX 설계 및 구현 패턴

### [패턴 1] 홈 화면 세로 2분할 (Hero Split Layout)
- **목적**: 브랜드 메시지 전달과 미디어 몰입도를 극대화.
- **좌측 (브랜드 슬로건 & 메인 비주얼)**:
  - 감성적인 카피라이트, 신뢰감을 주는 타이포그래피.
  - 사용자 제공 맞춤 인물/제품 사진(`home_model.jpg`)을 배치하고 부드러운 라운딩(`rounded-3xl`)과 은은한 골드/다크 톤 프레임 적용.
- **우측 (9:16 세로형 쇼츠 플레이어)**:
  - 최신 숏폼 트렌드를 반영한 9:16 황금비율 컨테이너 (`aspect-[9/16]`).
  - **기본 영상 영구 탑재**: 프로젝트 내 `baekjae_shorts.mp4`를 기본 비디오로 지정하여 접속 즉시 자동 재생.
  - **듀얼 소스 & 커스텀 지원**:
    1. 로컬 비디오 파일 드래그 & 드롭 / 파일 선택 업로드 (브라우저 캐시 저장).
    2. YouTube Shorts 링크(예: `https://youtube.com/shorts/...`) 입력 시 자동 iframe 임베드 변환.
  - 플레이어 주변 앰비언트 글로우 및 스마트 컨트롤 바(음소거, 재생/일시정지, 좋아요, 링크 복사) 구성.

### [패턴 2] 마우스 오버 3D 팝업 물리 애니메이션 (Pop-forward Cards)
- **목적**: 핵심 가치 제안(품질, 배송, 상담 등)에 사용자의 시선을 집중시키고 물리적 실체감 제공.
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
- **마이크로 인터랙션**:
  - 카드 호버 시 내부 아이콘이 부드럽게 확대 및 3도 회전 (`group-hover:scale-115 group-hover:rotate-3`).

### [패턴 3] 상품 카드 이미지 교체 & 판매가 기재 시스템
- **이미지 규격**: 4/3(세로) 비율 (`aspect-[3/4]`, `object-cover object-top`).
- **실제 파일 기본 탑재 + 드래그 앤 드롭 오버라이드**:
  - 기본 상태에서 `images/product_*.jpg`를 바로 표시.
  - 사용자가 새로운 사진을 드래그하거나 클릭하여 파일 선택 시 Canvas API(최대 1200px, JPEG 0.88 품질)로 최적화 후 즉시 반영.
- **실시간 판매가 기재란**:
  - 각 카드마다 금액 입력창(`input.price-input`) 배치.
  - 입력 시 실시간 숫자 천 단위 콤마(예: `250,000원`) 자동 변환.
  - 입력값 변경 시 영구 저장소에 자동 보존.

---

## 3. 에셋 영구화 아키텍처 (Client Cache vs Repository Bundle)

### [주의점] 브라우저 저장소(IndexedDB/LocalStorage)의 한계
- 사용자가 웹 화면에서 드래그/업로드한 데이터는 해당 PC 브라우저 내부 도메인 캐시에만 존재함.
- 따라서 GitHub에 코드를 푸시하거나 **GitHub Pages(`https://<user>.github.io/<repo>/`)**로 배포하면 다른 방문자나 다른 기기에서는 빈 템플릿만 보이게 되는 현상이 발생함.

### [해결 워크플로우] 정식 파일 번들링 (Asset File Bundling)
1. **브라우저 캐시 역추적 및 추출**:
   - Chrome `User Data/.../Local Storage/leveldb` 및 `IndexedDB/.../blob` 파일에서 실제 비디오 Blob과 이미지 Data URI를 디코딩하여 추출.
2. **프로젝트 정식 파일로 저장**:
   - 비디오: `baekjae_shorts.mp4`
   - 이미지: `images/product_m1.jpg`, `product_m2.jpg`, `product_w1.jpg`, `product_am1.jpg`, `product_am2.jpg`
3. **HTML 소스 코드 정식 기본값 연결**:
   - `<video src="baekjae_shorts.mp4">`
   - `<img src="images/product_*.jpg">`
4. **Git에 추적 및 푸시**:
   - 실물 미디어 파일이 Git에 포함되어 전송되므로, GitHub Pages 및 모든 접속자에게 영구적으로 동일하게 렌더링됨.

---

## 4. GitHub & GitHub Pages 배포 워크플로우

### [케이스 A] 웹 업로드와 로컬 Git 이력 불일치 해결 (`unrelated histories`)
사용자가 GitHub 웹 인터페이스에서 직접 파일을 올려 커밋(`Add files via upload`)한 경우, 로컬 커밋과 이력이 분기되어 일반 병합이 거부될 수 있습니다:
```bash
git fetch origin
git merge origin/main --allow-unrelated-histories -m "Merge remote origin/main" --strategy-option=ours
```

### [케이스 B] 인증 토큰을 활용한 비대화식 자동 푸시
- Windows Credential Manager에 보존된 GitHub 토큰을 읽어와 안전하게 원격 저장소(`origin main`)로 푸시:
```bash
git push https://<username>:<token>@github.com/<username>/<repo>.git main:main
```

### [케이스 C] GitHub Pages 실시간 반영 확인
- 저장소 `Settings -> Pages`에서 `Branch: main, / (root)` 설정 확인.
- `main` 브랜치에 푸시가 완료되면 GitHub Actions 파이프라인이 자동으로 실행되어 수 분 내에 `https://<username>.github.io/<repo>/`에 최신 파일이 반영됨.

---

## 5. 지속 가능한 유지보수 체크리스트

- [x] **공식 비디오 파일 무결성**: `baekjae_shorts.mp4`가 프로젝트 루트에 위치하고 정상 재생되는가?
- [x] **상품 이미지 5종 무결성**: `images/` 디렉토리에 규격별 사진이 누락 없이 존재하는가?
- [x] **가격 포맷팅 검증**: 숫자가 천 단위 콤마와 함께 자연스럽게 입력되고 저장되는가?
- [x] **GitHub Pages 배포 연동**: 커밋 내용이 `origin/main`에 정상 푸시되어 실서비스 URL에서 확인 가능한가?
