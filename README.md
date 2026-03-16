# SwiftConvert

![SwiftConvert Splash](https://img.shields.io/badge/SwiftConvert-Privacy--First-6366f1?style=for-the-badge&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**SwiftConvert**는 사용자의 개인정보 보호를 최우선으로 생각하는 프리미엄 클라이언트 사이드 파일 변환 솔루션입니다. 모든 파일 처리는 서버 업로드 없이 사용자의 브라우저 내에서 직접 수행되어 데이터 유출 걱정 없이 안전하게 사용할 수 있습니다.

---

## ✨ 핵심 기능 (Key Features)

- **Privacy-First (개인정보 보호)**: 모든 파일 변환 로직이 클라이언트 사이드에서 작동합니다. 서버는 오직 사용자 인증과 변환 기록 관리만을 담당합니다.
- **이미지 변환**: PNG, JPG, WebP 등 주요 이미지 포맷 간의 상호 변환을 지원하며 품질 최적화 옵션을 제공합니다.
- **PDF 병합/변환**: 여러 이미지를 하나의 PDF 문서로 즉시 병합하거나 단일 파일을 PDF로 변환할 수 있습니다.
- **실시간 대시보드**: 가입된 사용자는 자신의 최근 변환 기록을 관리하고 즐겨찾는 도구에 빠르게 접근할 수 있습니다.
- **프리미엄 UI/UX**: Apple 스타일의 Glassmorphism 디자인과 Framer Motion을 활용한 부드러운 애니메이션으로 최상의 사용자 경험을 제공합니다.

---

## 🏗️ 시스템 아키텍처 (Architecture)

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide React
- **Backend**: Node.js, Express (Layered Architecture), SQLite3, JWT (Auth)
- **Security**: Bcryptjs (Password Hashing), Centralized Error Handling Middleware

### Layered Architecture (Backend)
백엔드는 유지보수와 확장성을 위해 다음과 같은 계층화 아키텍처를 따릅니다.
1. **Routes**: 엔드포인트 정의 및 미들웨어 연결
2. **Controllers**: 요청 검증 및 응답 핸들링
3. **Services**: 핵심 비즈니스 로직 및 도메인 규칙 수행
4. **Repositories**: 데이터베이스 접근 로직 (Data Access Layer)

---

## 🚀 시작하기 (Getting Started)

### 사전 요구사항
- Node.js (v18 이상 권장)
- npm or yarn

### 설치 및 설정
1. 저장소를 클론합니다.
   ```bash
   git clone https://github.com/Hi-Jen/SwiftConvert.git
   cd SwiftConvert
   ```
2. 종속성을 설치합니다.
   ```bash
   npm install
   cd server && npm install
   ```
3. 서버 환경 변수를 설정합니다. (`server/.env.example` 참고)
   ```bash
   # server/.env 생성 후 아래 내용 입력
   ACCESS_TOKEN_SECRET=your_secret_key
   REFRESH_TOKEN_SECRET=your_refresh_key
   PORT=5000
   ```

### 동시 실행
루트 폴더에서 다음 명령어를 입력하면 프론트엔드와 백엔드가 동시에 실행됩니다.
```bash
npm run dev
```

---

## 📄 라이선스 (License)
이 프로젝트는 MIT 라이선스를 따릅니다.
