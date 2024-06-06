import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'], // 엔트리 파일 설정
  splitting: false, // 코드 스플리팅 사용 여부
  sourcemap: true, // 소스맵 생성 여부
  clean: true, // 빌드 디렉토리 정리 여부
  format: ['cjs'], // 모듈 형식 설정
  dts: false, // 타입 선언 파일 생성 여부
  minify: true, // 코드 압축 여부
  target: 'esnext', // 타겟 환경 설정
  outDir: 'dist', // 출력 디렉토리 설정
  bundle: true, // 번들링 여부
});
