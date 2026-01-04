# 히어로 섹션 미디어 가이드

## 📁 폴더 구조
```
all4fit/
├── videos/
│   ├── hero-video.mp4    # 메인 히어로 비디오 (MP4 형식)
│   └── hero-video.webm   # 메인 히어로 비디오 (WebM 형식, 선택사항)
├── images/
│   └── hero-image.jpg    # 비디오 대체 이미지
└── index.html
```

## 🎥 비디오 추가 방법

### 1. 비디오 파일 준비
- **파일명**: `hero-video.mp4`
- **위치**: `/videos/hero-video.mp4`
- **권장 해상도**: 1920x1080 (Full HD) 이상
- **권장 길이**: 10-30초 (루프 재생)
- **파일 크기**: 10MB 이하 권장

### 2. 비디오 최적화
```bash
# FFmpeg를 사용한 비디오 최적화 예시
ffmpeg -i input_video.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k -movflags +faststart hero-video.mp4

# WebM 형식으로도 변환 (선택사항)
ffmpeg -i input_video.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus hero-video.webm
```

### 3. 비디오 권장 사항
- **내용**: 체육시설, 운동하는 사람들, 건강한 라이프스타일
- **스타일**: 밝고 역동적인 영상
- **음성**: 없음 (muted 속성으로 자동 재생)
- **자동 재생**: `autoplay`, `muted`, `loop` 속성 적용됨

## 🖼️ 이미지 추가 방법

### 1. 이미지 파일 준비
- **파일명**: `hero-image.jpg`
- **위치**: `/images/hero-image.jpg`
- **권장 해상도**: 1920x1080 이상
- **파일 형식**: JPG, PNG, WebP 지원
- **파일 크기**: 2MB 이하 권장

### 2. 이미지 최적화
```bash
# 이미지 압축 예시 (ImageMagick 사용)
magick input_image.jpg -quality 85 -resize 1920x1080^ -gravity center -crop 1920x1080+0+0 hero-image.jpg
```

## 🎨 디자인 가이드

### 색상 오버레이
- 비디오/이미지 위에 그라데이션 오버레이가 적용됩니다
- 색상: `rgba(79, 70, 229, 0.7)` → `rgba(99, 102, 241, 0.5)` → `rgba(8, 145, 178, 0.7)`
- 텍스트 가독성을 위해 자동으로 적용됩니다

### 반응형 디자인
- 모바일에서는 비디오가 자동으로 중앙 크롭됩니다
- `object-fit: cover` 속성으로 화면에 맞게 조정됩니다

## 🔧 커스터마이징

### 비디오 변경
```html
<video class="hero-video" autoplay muted loop playsinline>
  <source src="/videos/your-video.mp4" type="video/mp4">
  <source src="/videos/your-video.webm" type="video/webm">
  <!-- 대체 이미지 -->
  <div class="hero-fallback-image">
    <img src="/images/your-image.jpg" alt="설명" />
  </div>
</video>
```

### 오버레이 색상 변경
```css
.hero-overlay {
  background: linear-gradient(135deg, 
    rgba(색상1, 0.7) 0%, 
    rgba(색상2, 0.5) 50%, 
    rgba(색상3, 0.7) 100%
  );
}
```

## 📱 모바일 최적화

### 권장사항
- 비디오는 가로 모드로 촬영된 것을 사용하세요
- 텍스트가 들어갈 공간을 고려하여 촬영하세요
- 밝은 색상의 영상보다는 중간 톤의 영상이 좋습니다

## 🚀 성능 최적화

### 비디오 최적화 팁
1. **압축**: H.264 코덱 사용
2. **프레임레이트**: 30fps 이하
3. **비트레이트**: 2-5 Mbps
4. **프리로드**: `preload="metadata"` 권장

### 이미지 최적화 팁
1. **압축**: 85% 품질
2. **형식**: WebP > JPG > PNG 순서
3. **크기**: 실제 사용 크기로 리사이즈

## 🎯 완성 예시

파일을 올바른 위치에 추가하면 다음과 같이 작동합니다:

1. **비디오가 있는 경우**: 자동으로 비디오 재생
2. **비디오가 없는 경우**: 대체 이미지 표시
3. **둘 다 없는 경우**: 그라데이션 배경 표시

이제 `/videos/hero-video.mp4`와 `/images/hero-image.jpg` 파일을 추가하시면 됩니다!
