# FreeFlix 🎬

A Netflix-style HLS video streaming platform built from scratch — not a YouTube embed. Real FFmpeg transcoding pipeline with multi-codec adaptive bitrate streaming.

**Live:** [shivamsingh.website/freeflix](https://shivamsingh.website/freeflix)

---

## Features

- **HLS Adaptive Bitrate** — automatically switches quality based on bandwidth
- **5 Quality Levels** — 360p, 720p, 1080p H.264, 1080p HEVC, 1080p AV1
- **CMAF/fMP4 format** — modern container used by Netflix and YouTube
- **JWT Authentication** — register, login, protected routes
- **Watch History** — tracks progress per user
- **Ratings** — 1-5 star rating system
- **My List** — bookmark videos
- **Custom HLS.js Player** — quality selector with codec badges, real-time bandwidth display
- **Codec Info Bar** — shows current format, codec, and bitrate

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19, HLS.js, TypeScript, SCSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon DB) |
| Storage | Cloudflare R2 |
| Auth | JWT + bcryptjs |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Architecture

```
Source Video (MP4)
       ↓
FFmpeg Transcoding (NVIDIA NVENC GPU)
       ↓
CMAF/fMP4 Segments
  ├── 360p/   (H.264, 800kbps)
  ├── 720p/   (H.264, 2500kbps)
  ├── 1080p_h264/ (H.264, 5000kbps)
  ├── 1080p_hevc/ (HEVC/H.265, 3000kbps)
  └── 1080p_av1/  (AV1, 1500kbps)
       ↓
Cloudflare R2 (videos.shivamsingh.website)
       ↓
HLS.js Player (Adaptive Bitrate)
```

---

## Why CMAF over MPEG-TS?

- Works with both **HLS** and **DASH** protocols
- Better compression, less overhead
- Required for **DRM** support
- Used by Netflix, YouTube, Disney+

## Why Cloudflare R2 over AWS S3?

- **Zero egress fees** — S3 charges $0.09/GB for downloads
- Video streaming = high bandwidth = R2 saves significant cost
- 10GB free forever
- S3-compatible API

## Codec Strategy

| Codec | File Size | Best For |
|-------|-----------|----------|
| H.264 | Baseline | Universal — every device |
| HEVC | 50% smaller | Apple devices (auto-selected via `hvc1` tag) |
| AV1 | 75% smaller | Chrome, Firefox, modern Android |

---

## HLS.js Configuration

```typescript
const hls = new Hls({
  abrEwmaFastVoD: 2,        // React quickly to bandwidth changes
  abrBandWidthFactor: 0.9,  // Use 90% of measured bandwidth (safety margin)
  startLevel: -1,           // Auto-select start quality
  capLevelToPlayerSize: true // Don't load 1080p for small player
});
```

---

## API Routes

```
POST /api/auth/register     — Register new user
POST /api/auth/login        — Login, get JWT token
GET  /api/videos            — List all videos
GET  /api/videos/:id        — Get single video
POST /api/history           — Save watch progress (JWT)
GET  /api/history           — Get watch history (JWT)
POST /api/ratings/:videoId  — Rate video (JWT)
GET  /api/ratings/:videoId  — Get average rating
POST /api/mylist/:id        — Add to My List (JWT)
DELETE /api/mylist/:id      — Remove from My List (JWT)
GET  /api/mylist            — Get My List (JWT)
```

---

## Local Setup

```bash
# Clone
git clone https://github.com/shivamaiusage-source/freeflix-backend
cd freeflix-backend

# Install
npm install

# Environment variables
cp .env.example .env
# Fill in: DATABASE_URL, JWT_SECRET

# Run
npm run dev
```

---

## Deployment

- **Frontend** — Vercel (auto-deploys on push to main)
- **Backend** — Render free tier (cron-job.org pings every 10 mins to prevent sleep)
- **Database** — Neon DB (serverless PostgreSQL, Singapore region)
- **Videos** — Cloudflare R2 with custom domain `videos.shivamsingh.website`

---

## Screenshots

| Home | Browse | Watch |
|------|--------|-------|
| Netflix-style hero | Video grid with thumbnails | HLS player with quality selector |

---

*Built by [Shivam Singh](https://shivamsingh.website) — May/Jun 2026*
