# Frontend (www) 지침

## 프로젝트 개요

- **런타임**: Node.js, Next.js (App Router)
- **포트**: 3000
- **백엔드 연동**: Docker Compose 내부망을 통해 abiswallow(8000)에 연결

---

## 규칙

- 컴포넌트는 `app/` 디렉터리 기준 App Router 구조를 따른다.
- 서버 컴포넌트와 클라이언트 컴포넌트를 명확히 구분한다 (`"use client"` 명시).
- API 호출은 `fetch`를 직접 쓰거나 전용 클라이언트 모듈로 분리한다. 컴포넌트 안에 URL을 하드코딩하지 않는다.
- 환경변수는 `NEXT_PUBLIC_` 접두사 규칙을 지킨다.
- 스타일은 프로젝트 기존 방식(Tailwind / CSS Modules 등)을 따른다. 임의로 방식을 바꾸지 않는다.
