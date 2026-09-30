# Ground0 Sequential Development Execution Plan

## 1. Execution Principles & Anti-Drift Protocol

To ensure system stability and zero architectural drift, Ground0 strictly follows a sequential phase gate workflow:

```
BUILD ➔ TEST ➔ FIX ➔ VERIFY ➔ COMMIT ➔ STOP ➔ WAIT FOR USER COMMAND
```

Under no circumstances may the AI agent advance beyond the currently active phase without explicit user confirmation (`CONTINUE PHASE X`).

---

## 2. Master Phase Matrix (Phase 0 to Phase 27)

| Phase | Milestone | Key Deliverables | Verification Gate |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Repository & Architectural Foundation** | Monorepo layout, documentation, `.env.example`, `.gitignore`, criteria matrix. | All 7 core docs created, git initialized, clean baseline. |
| **Phase 1** | **Supabase Schema & RLS Security** | Idempotent PostgreSQL migrations (29 tables), indexes, strict Row Level Security policies. | Schema applies cleanly, RLS isolation confirmed via SQL tests. |
| **Phase 2** | **Authentication & Role Authorization** | Supabase Auth integration, session management, RBAC middleware for all 8 roles. | Registration, login, JWT claims, and unauthorized route rejection verified. |
| **Phase 3** | **Citizen Complaints Core** | `/report` intake form, public ID generation (`GR0-2941`), database persistence. | Complaint inserted into DB with correct initial status (`SUBMITTED`). |
| **Phase 4** | **Complaint Media & Geolocation** | Multi-file upload to private bucket `complaint-media`, GPS coordinate & accuracy capture. | Signed URL generation, image upload, metadata linkage in `complaint_media`. |
| **Phase 5** | **Duplicate Complaint Engine** | Spatial distance clustering (<75m), visual embedding similarity, Master Issues (`GR0-M42`). | Duplicate report merges into master issue and increments priority counter. |
| **Phase 6** | **Authority Command Dashboard** | `/dashboard`, complaint triage view, issue acceptance/rejection, priority override. | Authority can view, filter, accept, and reject complaints with status sync. |
| **Phase 7** | **Work Order Module** | Contract creation (`WO-2091`), structured requirements, contractor/worker assignment. | Work order created with structured requirements in `work_order_requirements`. |
| **Phase 8** | **Worker Mobile PWA** | `/capture/[id]`, job queue view, offline-ready UI, mobile orientation handling. | Worker views assigned jobs, opens work order details cleanly. |
| **Phase 9** | **Before & After Evidence Capture** | Cryptographic session initialization, time-bound nonce, multi-angle upload to `evidence-original`. | Capture session generated, nonce validated, evidence record created. |
| **Phase 10** | **FastAPI AI Microservice Setup** | Python 3.11 FastAPI service, Pydantic v2 models, internal bearer auth, health endpoints. | `/health` returns 200 OK, authenticated routes reject bad keys. |
| **Phase 11** | **Evidence Integrity Engine** | SHA-256 duplicate detection, perceptual hash (pHash) Hamming distance, replay rejection. | Submitting identical image triggers `DUPLICATE_EVIDENCE_DETECTED` flag. |
| **Phase 12** | **Location Verification Engine** | Haversine distance calculation, horizontal accuracy tolerance, coordinate bounding box. | Off-site submission correctly flagged with distance in meters. |
| **Phase 13** | **Scene Identity Engine** | DINOv2 / SigLIP visual embeddings, ORB feature matching, planar homography estimation. | Different-scene image triggers `SCENE_MISMATCH` (<0.60 similarity). |
| **Phase 14** | **Physical Change Detection** | Semantic segmentation, waste coverage % delta, pothole repair planar continuity. | Cleaned scene correctly yields >85% visual reduction. |
| **Phase 15** | **Gemini Multimodal Reasoning** | Gemini 1.5/2.0 requirement cross-examination, structured JSON verification report. | Contract requirements cross-checked against visual evidence with rationale. |
| **Phase 16** | **Verification Orchestration** | 10-stage asynchronous pipeline coordinator, status broadcasting via Supabase Realtime. | Verification run executes through all stages, writing to `verification_results`. |
| **Phase 17** | **Human Review & Decision Support** | Inspector dashboard (`/verification-lab`), split slider, approval / rejection actions. | Inspector can inspect artifacts, submit approval, status updates to `VERIFIED`. |
| **Phase 18** | **Citizen Resolution & Reopening** | Citizen Before ↔ After slider, satisfaction confirmation, dispute / reopening flow. | Citizen can confirm resolution or reopen complaint with fresh evidence. |
| **Phase 19** | **Interactive Maps** | MapLibre GL JS + MapTiler vector tiles, live cluster markers, status heatmaps. | Map renders smoothly with reactive markers for complaints and work orders. |
| **Phase 20** | **Authorized Camera Integration** | MediaMTX streaming relay, 3 camera modes (webcam, video file, RTSP), privacy face blur. | Stream renders in browser; sampled frames correctly redacted. |
| **Phase 21** | **Analytics & Sustainability Ledger** | Live metrics, resolution turnaround, CO2 abatement, waste removed ledger. | Analytics page renders real SQL aggregates without hardcoded numbers. |
| **Phase 22** | **Realtime Notifications** | Supabase Realtime broadcast channels, in-app notification bell, live badge updates. | State changes immediately trigger visual toast and notification entry. |
| **Phase 23** | **Royal Obsidian Design System** | Curated dark mode styling, Champagne gold accents, typography, glassmorphism. | Cohesive, luxurious aesthetic implemented across all pages. |
| **Phase 24** | **3D Landing Hero & VFX** | Three.js / React Three Fiber interactive digital twin city, scanning plane, reduced-motion. | 3D canvas loads smoothly, toggleable reduced-effects mode functional. |
| **Phase 25** | **Security Hardening & Penetration Testing**| SSRF validation, RLS leak tests, IDOR checks, upload fuzzing, rate limiting. | All automated security test suites pass without vulnerabilities. |
| **Phase 26** | **Production Deployment Configuration** | Vercel frontend config, Dockerfiles for FastAPI & MediaMTX, deployment docs. | Production build (`npm run build` & docker build) succeeds without errors. |
| **Phase 27** | **Hackathon Live Demo Optimization** | End-to-end garbage cleanup walkthrough script, judge presentation guide. | Flawless 3-minute round-trip demo executed successfully. |

---

## 3. Phase 0 Completion Criteria

Phase 0 establishes the immaculate scaffolding upon which all subsequent phases depend:
1. `README.md` created with project identity, architecture overview, and workflow.
2. `docs/competition-criteria.md` created with analysis of the 4 competition documents.
3. `docs/architecture.md` created with topology, sequence diagrams, and security boundaries.
4. `docs/database.md` created with full 29-table schema definitions and RLS policies.
5. `docs/security.md` created with Zero Trust evidence rules, anti-replay nonces, and SSRF shields.
6. `docs/ai-pipeline.md` created with 10-stage verification pipeline and vision models.
7. `docs/camera-integration.md` created with MediaMTX, 3 camera modes, and privacy blurring.
8. `docs/development-plan.md` created with the sequential phase gate master plan.
9. `.env.example` created with safe placeholders and zero secret leakage.
10. `.gitignore` created protecting all secrets, models, build caches, and node_modules.
