const PORTFOLIO_KNOWLEDGE = `
ABOUT SHIVAM SINGH:
Name: Shivam Singh
Age: 24 (Born January 12, 2002)
Role: Senior Software Engineer / Angular Developer
Experience: 3+ years (Jan 2023 - Present)
Current Company: Songdew Media (Dec 2024 - Present)
Previous Company: Cavisson Systems (Jan 2023 - Nov 2024)
Location: Gurugram, India
Email: shivamsinghitwork@gmail.com
Phone: +91-8400383283
Education: B.Tech CSE, GNIOT Greater Noida, 2023
Target Salary: 18-25 LPA
Notice Period: Ask Shivam directly

EXPERIENCE AT SONGDEW (Dec 2024 - Present):
- Built 200+ dynamic validators using Angular FormArrays
- 6-role artist registration form factory (Label, Individual, Band, etc.)
- Role-based UI switching between Label vs Individual artist flows
- Built 8-step wizard component library for complex onboarding
- Integrated Spotify and Apple Music OAuth for artist verification
- Used switchMap chains for dependent API calls
- Used forkJoin for 3 parallel API calls in analytics dashboard
- Built Chart.js analytics dashboard with custom plugins
- Angular 12 to 15 migration
- ngx-translate for Hindi, Portuguese, and regional language support

EXPERIENCE AT CAVISSON (Jan 2023 - Nov 2024):
- Session replay with nested iframe fix using recursive DOM traversal
- Element inspection with visibility filtering using computed styles
- Pagination for large session data tables
- NetVision APM platform development
- Built monitoring and performance analytics features

FREEFLIX PROJECT:
What: Netflix-style HLS video streaming platform
Live URL: shivamsingh.website/freeflix
GitHub: github.com/shivamaiusage-source/freeflix-backend
Status: Live and working

Tech Stack:
- Frontend: Angular 19, HLS.js, Signals, lazy loading
- Backend: Node.js, Express, PostgreSQL (Neon), JWT auth
- Storage: Cloudflare R2 (videos.shivamsingh.website)
- Deployment: Vercel (frontend), Render (backend)

Video Pipeline:
- Source: Creative Commons videos from archive.org
- FFmpeg transcodes into CMAF/fMP4 format
- 5 quality levels per video: 360p, 720p, 1080p H.264, 1080p HEVC, 1080p AV1
- GPU encoding via NVIDIA NVENC (h264_nvenc, hevc_nvenc)
- Chunks uploaded to Cloudflare R2
- HLS.js handles adaptive bitrate switching automatically
- master.m3u8 contains CODEC strings for device-specific selection

Why CMAF over MPEG-TS:
- Works with both HLS and DASH protocols
- Better compression, less overhead
- Required for DRM support
- Modern format used by Netflix and YouTube

Why Cloudflare R2 over AWS S3:
- Zero egress fees (S3 charges $0.09/GB for downloads)
- Video streaming needs lots of downloads — R2 saves money
- 10GB free forever
- S3-compatible API

Codec decisions:
- H.264: Universal — works on every device
- HEVC: 50% smaller than H.264, Apple devices pick automatically via hvc1 tag
- AV1: 75% smaller than H.264, royalty free, future-proof

HLS.js configuration:
- Natural ABR (not forced) — starts low, upgrades as bandwidth confirmed
- abrEwmaFastVoD: 2 — reacts quickly to bandwidth changes
- abrBandWidthFactor: 0.9 — uses 90% of measured bandwidth
- Quality selector UI shows all 5 tracks with codec badges
- Codec info bar shows current format, codec, bitrate in real time

Backend API routes:
- POST /api/auth/register — register new user
- POST /api/auth/login — login, get JWT token
- GET /api/videos — get all videos with search and genre filter
- GET /api/videos/:id — get single video
- POST/GET /api/history — save and get watch history (JWT protected)
- POST/GET /api/ratings/:videoId — rate video (JWT protected)
- POST/DELETE/GET /api/mylist/:video_id — manage my list (JWT protected)

Infrastructure:
- Angular portfolio shell deployed on Vercel
- Node.js backend on Render free tier
- PostgreSQL on Neon DB (serverless, Singapore region)
- Videos on Cloudflare R2 with custom domain videos.shivamsingh.website
- API available at api.shivamsingh.website
- Cron-job.org pings backend every 10 mins to prevent Render sleep

RAG SYSTEM PROJECT:
What: AI-powered document chat and portfolio assistant
Live URL: shivamsingh.website/rag
Status: In progress

Features:
1. PDF Chat — upload any PDF, ask questions, get answers with citations
2. Portfolio Assistant — ask anything about Shivam's projects and experience

Tech Stack:
- Frontend: Angular 19
- Backend: Node.js, Express
- AI: Google Gemini API (@google/genai)
- Vector DB: pgvector extension on PostgreSQL (Neon)
- PDF parsing: pdf-parse
- File upload: multer

How PDF Chat works:
- User uploads PDF (no login needed, session ID in localStorage)
- Backend extracts text using pdf-parse
- Text split into 500-word chunks with overlap
- Each chunk converted to 768-dimension vector using Gemini embedding API
- Vectors stored in pgvector (rag_chunks table)
- User asks question → question converted to vector
- pgvector finds 5 most similar chunks using cosine distance (<-> operator)
- Chunks + question sent to Gemini → grounded answer with page citations
- Sessions auto-deleted after 24 hours

Why pgvector over Pinecone/Weaviate:
- Already using PostgreSQL — no extra service needed
- Free with Neon DB — no additional cost
- Simpler architecture — one less dependency
- Cosine similarity search with ivfflat index

MONITORING DASHBOARD PROJECT:
What: Session replay, heatmaps, performance metrics dashboard
Status: In progress (planned)
Tech: Session Replay, D3.js, Chart.js, Angular 19, WebSockets
Built on experience from Cavisson Systems APM work

PORTFOLIO SHELL:
Live URL: shivamsingh.website
Tech: Angular 19, Vercel
Features:
- Terminal animation with typewriter effect
- Flip card project showcase
- Count-up stats animation with IntersectionObserver
- Lazy loaded feature modules (/freeflix, /rag, /monitoring)
- FreeFlix navbar swaps with portfolio navbar on scroll

SKILLS:
Frontend: Angular 12-19, TypeScript, RxJS, Signals, SCSS, HTML
Backend: Node.js, Express, PostgreSQL, JWT, bcryptjs
AI/ML: Gemini API, pgvector, RAG architecture, embeddings, Text-to-SQL
Video: FFmpeg, HLS.js, CMAF, H.264, HEVC, AV1, Cloudflare R2
DevOps: Vercel, Render, Neon DB, Cloudflare, GitHub
Tools: Chart.js, D3.js, ngx-translate, multer, pdf-parse

WHY ANGULAR OVER REACT:
- Deep expertise in Angular ecosystem (3+ years)
- Signals provide better performance than React hooks for complex state
- Strong typing with TypeScript built-in
- Better for enterprise applications with complex forms (Songdew experience)
- Dependency injection makes testing easier

INTERVIEW TALKING POINTS:
- Built real HLS streaming pipeline from scratch (not just embedding YouTube)
- CMAF + multi-codec approach demonstrates deep technical knowledge
- RAG system shows AI integration skills beyond basic ChatGPT wrapper
- Full stack — owns entire product from DB schema to UI animations
- All projects deployed and live — not just GitHub repos

MONITORING DASHBOARD PROJECT:
What: Framework-agnostic session replay and analytics platform
Live URL: shivamsingh.website/monitoring
Status: Live and working
Similar to: Hotjar, Microsoft Clarity, FullStory

Architecture:
- recorder.js: Standalone vanilla JS script injected via single script tag in index.html
- Works in ANY framework — Angular, React, Vue, or plain HTML
- No SDK needed — just one script tag like Google Analytics

What recorder.js captures:
- Clicks — element tag, class, text, x/y coordinates
- Scroll — scroll depth percentage, position
- Navigation — SPA route changes via history.pushState patch
- DOM mutations — MutationObserver for dynamic content changes
- JS Errors — window.onerror + unhandledrejection

How it works:
- Generates UUID session ID on page load
- Batches events locally every 5 seconds then flushes to backend
- Detects current app from URL path (FreeFlix, RAG, Portfolio)
- Uses keepalive:true on beforeunload to ensure final flush

Backend API routes:
- POST /api/monitoring/session — create session record
- POST /api/monitoring/events — batch insert events
- GET /api/monitoring/sessions — list all sessions with filters
- GET /api/monitoring/sessions/:id — get session + all events for replay
- GET /api/monitoring/stats — aggregate stats

Database schema:
- mon_sessions: id, app, origin, user_agent, screen dimensions, duration, click/page/error counts
- mon_events: id, session_id, type, timestamp, x, y, target element, value (JSONB)

Angular Dashboard features:
- SaaS-style light theme with sidebar navigation
- Stats bar: total sessions, clicks, errors, avg duration
- App distribution bars: Portfolio vs FreeFlix vs RAG
- Session table with filters by app + errors only
- Session detail page with event timeline scrubber
- Navigation path visualization showing pages visited in order
- Click map showing x/y coordinates of all clicks
- Event list filterable by type with timestamps

Why this is impressive:
- Framework-agnostic design (not tied to Angular)
- Same architecture as Hotjar and Microsoft Clarity
- Built on real Cavisson Systems APM experience
- Real data — actually monitors shivamsingh.website live
- PostgreSQL for storage — no third party analytics service needed
`;

module.exports = PORTFOLIO_KNOWLEDGE;
