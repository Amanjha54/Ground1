# Ground0 Camera & Edge Media Integration

## 1. Ethical & Legal Foundation

Ground0 operates under a strict **Zero-Intrusion & Authorization-First Policy**:

- **Strictly Authorized Cameras Only**: The platform exclusively ingests video from:
  1. Municipal or organization-owned IP cameras.
  2. Authorized contractor site-monitoring cameras.
  3. Formally registered public feeds whose terms of service explicitly authorize municipal auditing.
- **Absolute Prohibitions**:
  - NEVER scan arbitrary public IP ranges for open CCTV feeds.
  - NEVER use dictionary or default credentials (`admin:admin`).
  - NEVER bypass authentication mechanisms or exploit unpatched firmware vulnerabilities.
  - NEVER capture private domestic residences or non-permitted interior spaces.

---

## 2. Supported Protocols & Media Architecture

Ground0 bridges edge surveillance hardware with web browsers and computer vision engines using **MediaMTX** as a high-performance streaming relay.

```mermaid
flowchart LR
    subgraph EdgeSources["Authorized Edge Sources"]
        IPCAM["ONVIF Profile T / RTSP Camera"]
        WEBCAM["Browser Webcam / Phone Camera"]
        VIDEO["Recorded Video File Upload"]
    end

    subgraph Gateway["MediaMTX Streaming Gateway"]
        INGEST["RTSP / RTMP / WebRTC Ingest"]
        TRANSCODE["WebRTC / HLS Remuxing"]
        SAMPLER["Automated Frame Sampler (1 FPS)"]
    end

    subgraph Consumers["Downstream Consumers"]
        BROWSER["Ground0 Command Center (WebRTC Player)"]
        CV["FastAPI Vision Pipeline (Frame Anonymizer & CV)"]
        SUPA["Supabase Storage (Encrypted Event Snapshots)"]
    end

    IPCAM -->|RTSP / RTSPS| INGEST
    WEBCAM -->|WebRTC Publish| INGEST
    VIDEO -->|Multipart Upload| INGEST

    INGEST --> TRANSCODE
    INGEST --> SAMPLER

    TRANSCODE -->|Low-Latency WebRTC (<500ms)| BROWSER
    SAMPLER -->|Periodic JPEG Frames| CV
    CV -->|Face/Plate Blurred Snapshot| SUPA
```

---

## 3. The Three Development & Evaluation Modes

To ensure full testability during development and hackathon evaluations without requiring physical municipal CCTV access, Ground0 supports three interchangeable camera modes:

### Mode 1: Browser Webcam / Mobile Device Camera
- Employs standard browser `navigator.mediaDevices.getUserMedia`.
- Enables real-time field testing and instant verification demos directly from a smartphone or laptop camera.
- Pushes a simulated camera stream to MediaMTX or direct frame buffer.

### Mode 2: Uploaded Video File Simulation
- Allows administrators and testers to upload pre-recorded site surveillance footage (`.mp4`, `.mov`).
- The MediaMTX gateway plays the video on a continuous loop as a simulated live RTSP feed (`rtsp://localhost:8554/simulated_site_1`).
- Used to test activity confirmation and time-window frame matching under deterministic conditions.

### Mode 3: Authorized Real-World RTSP / ONVIF IP Cameras
- Connects directly to enterprise cameras supporting ONVIF Profile T or standard RTSP/RTSPS.
- Authenticates using encrypted credentials stored in the `cameras` database table.
- Provides real-time PTZ control (where permitted) and dynamic sub-stream negotiation.

---

## 4. Privacy & Anonymization Engine

Ground0 enforces automatic visual redaction at the edge:

1. **Lightweight Detection Cascades**: Every extracted snapshot frame is routed through a high-speed YOLO face/license plate detector.
2. **Defacing & De-identification**:
   - Detected face bounding boxes are processed with a 25-pixel radius Gaussian blur.
   - Detected vehicle license plates are masked with an opaque obsidian overlay.
3. **No Biometrics or Identity Resolution**: Ground0's neural models are purposefully trained on infrastructure features (asphalt, concrete, debris, vegetation) and have no weights or capabilities for facial recognition or individual tracking.

---

## 5. Security & SSRF Protection Architecture

Connecting backend workers to user-supplied stream URLs creates an acute SSRF vulnerability. Ground0 eliminates this through defense-in-depth:

```mermaid
flowchart TD
    REQ[Admin Requests Camera Registration] --> VALID_AUTH{Role == ORGANIZATION_ADMIN?}
    VALID_AUTH -->|No| DENY[403 FORBIDDEN]
    VALID_AUTH -->|Yes| PROTO_CHECK{Protocol in [rtsp, rtsps, https]?}
    PROTO_CHECK -->|No| REJECT_PROTO[400 INVALID PROTOCOL]
    PROTO_CHECK -->|Yes| DNS_RESOLVE[Resolve Destination Hostname]
    DNS_RESOLVE --> IP_CHECK{Is Loopback (127.0.0.1) or Cloud Metadata (169.254.169.254)?}
    IP_CHECK -->|Yes| REJECT_SSRF[400 SSRF BLOCKED]
    IP_CHECK -->|No| STORE[Encrypt Credentials (AES-GCM-256) & Register Stream]
```

1. **Strict Role Isolation**: Only authenticated `ORGANIZATION_ADMIN` roles can register or update stream endpoints.
2. **IP Whitelist & Blacklist Enforcement**:
   - Loopback (`127.0.0.1`, `::1`) is rejected.
   - Cloud instance metadata services (`169.254.169.254`) are blocked.
   - Internal RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) are blocked unless explicitly configured in internal gateway allowlists.
3. **Encrypted Vault Storage**: Camera passwords and stream secrets are never stored as plain text. They are encrypted using `CAMERA_ENCRYPTION_KEY` and decrypted only in-memory inside the media gateway worker.
