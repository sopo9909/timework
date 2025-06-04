# 📅 Blackout - Windows D-day Calculator

현대적이고 직관적인 윈도우용 D-day 계산 앱입니다.

## ✨ 주요 기능

### 🎯 핵심 기능

-   **정확한 D-day 계산**: 설정한 날짜까지 남은 일수를 실시간으로 계산
-   **주말 제외 옵션**: 토요일, 일요일을 계산에서 제외할 수 있는 옵션
-   **특정 날짜 제외**: 휴일이나 특별한 날을 미리 설정하여 계산에서 제외
-   **시각적 표시**: 남은 일수를 큰 숫자로 명확하게 표시
-   **데이터 지속성**: 설정한 D-day와 제외 날짜들을 파일로 저장하여 재시작 후에도 유지

### 🎨 디자인 특징

-   **현대적인 UI**: 깔끔하고 직관적인 사용자 인터페이스
-   **반응형 레이아웃**: 윈도우 크기에 맞춰 자동 조정
-   **다크/라이트 테마**: 사용자 선호에 따른 테마 선택
-   **시각적 피드백**: 애니메이션과 색상을 통한 직관적인 정보 전달

## 🚀 기술 스택

-   **Frontend**: HTML5, CSS3, JavaScript (ES6+)
-   **Desktop App**: Electron
-   **UI Framework**: Modern CSS Grid & Flexbox
-   **Icons**: Lucide Icons 또는 Heroicons
-   **Data Storage**: JSON 파일 기반 로컬 저장

## 📋 시스템 요구사항

-   **운영체제**: Windows 10 이상
-   **메모리**: 최소 4GB RAM
-   **저장공간**: 100MB 이상 여유 공간
-   **기타**: .NET Framework 4.7.2 이상 (자동 설치됨)

## 🛠️ 설치 방법

### 1. 소스코드에서 빌드

```bash
# 저장소 클론
git clone https://github.com/yourusername/blackout.git
cd blackout

# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 윈도우용 실행파일 빌드
npm run build:win
```

### 2. 실행파일 다운로드

-   [Releases 페이지](https://github.com/yourusername/blackout/releases)에서 최신 버전의 `Blackout-Setup.exe` 다운로드
-   실행파일을 관리자 권한으로 실행하여 설치

## 📖 사용 방법

### D-day 설정

1. 앱 실행 후 "새 D-day 추가" 버튼 클릭
2. 목표 날짜와 제목 입력
3. 주말 제외 여부 선택
4. 저장 버튼 클릭

### 제외 날짜 설정

1. 설정 메뉴에서 "제외 날짜 관리" 선택
2. 휴일이나 제외하고 싶은 날짜 추가
3. 각 날짜에 메모 추가 가능

### 데이터 백업/복원

-   설정 파일은 `%APPDATA%/Blackout/` 폴더에 저장됩니다
-   백업: 해당 폴더를 복사하여 안전한 곳에 보관
-   복원: 백업한 폴더를 원래 위치에 복사

## 🎯 로드맵

### v1.0 (현재 개발 중)

-   [x] 기본 D-day 계산 기능
-   [x] 주말 제외 옵션
-   [x] 데이터 저장/불러오기
-   [ ] 현대적인 UI 디자인
-   [ ] 제외 날짜 관리
-   [ ] 윈도우 실행파일 빌드

### v1.1 (예정)

-   [ ] 다중 D-day 관리
-   [ ] 알림 기능
-   [ ] 테마 커스터마이징
-   [ ] 통계 및 차트

### v1.2 (예정)

-   [ ] 클라우드 동기화
-   [ ] 모바일 앱 연동
-   [ ] 위젯 기능

## 🤝 기여하기

1. 이 저장소를 Fork 합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push 합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원 및 문의

-   **이슈 신고**: [GitHub Issues](https://github.com/yourusername/blackout/issues)
-   **기능 요청**: [GitHub Discussions](https://github.com/yourusername/blackout/discussions)
-   **이메일**: support@blackout-app.com

---

⭐ 이 프로젝트가 유용하다면 별점을 눌러주세요!
