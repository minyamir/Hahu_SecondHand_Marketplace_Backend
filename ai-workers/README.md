# AI Worker - Face Verification Service

## Overview

This service verifies whether the face shown in a user's selfie video matches the face shown on the front image of their National ID card.

The system performs:

1. Face extraction from National ID image
2. Face extraction from video frames
3. Face embedding generation
4. Face similarity comparison
5. Basic liveness detection
6. Verification result generation

---

# Technology Stack

## Backend Framework

### FastAPI

Purpose:

* REST API development
* File upload handling
* JSON responses

Package:

```bash
pip install fastapi uvicorn
```

---

## Computer Vision

### OpenCV

Purpose:

* Read images
* Read videos
* Extract frames
* Image preprocessing

Package:

```bash
pip install opencv-python
```

Used in:

```python
import cv2
```

---

### NumPy

Purpose:

* Matrix operations
* Vector calculations
* Face embedding manipulation

Package:

```bash
pip install numpy
```

Used in:

```python
import numpy as np
```

---

## Face Recognition

### InsightFace

Purpose:

* Face detection
* Face alignment
* Face embeddings
* Face recognition

Model:

```text
buffalo_l
```

Main output:

```python
face.embedding
```

Embedding size:

```text
512 dimensions
```

Used in:

```python
from insightface.app import FaceAnalysis
```

---

## Liveness Detection

### MediaPipe

Purpose:

* Face detection
* Face landmarks
* Blink detection (future upgrade)
* Head movement tracking (future upgrade)

Package:

```bash
pip install mediapipe
```

Used in:

```python
import mediapipe as mp
```

Current implementation:

```text
Basic motion-based liveness detection
```

---

# Project Structure

```text
ai-workers/

├── main.py
├── requirements.txt
├── config.py

├── api/
│   └── routes/
│       └── verify.py

├── services/
│   ├── id_service.py
│   ├── video_service.py
│   └── verify_service.py

├── core/
│   ├── face_engine.py
│   ├── matcher.py
│   └── liveness.py

├── uploads/
│   ├── id_images/
│   └── videos/
```

---

# Verification Workflow

Step 1

User uploads:

* National ID front image
* 8–10 second selfie video

↓

Step 2

Extract face from ID image

↓

Step 3

Extract frames from video

↓

Step 4

Detect face in video frames

↓

Step 5

Generate face embeddings

↓

Step 6

Compare embeddings

↓

Step 7

Run liveness detection

↓

Step 8

Generate result

---

# Similarity Calculation

The system compares:

```text
ID Face Embedding
vs
Video Face Embedding
```

Using:

```text
Cosine Similarity
```

Formula:

similarity = cosine(id_embedding, video_embedding)

---

# Thresholds

Recommended:

```python
FACE_MATCH_THRESHOLD = 0.60
```

Results:

```text
0.80 - 1.00  Very Strong Match

0.70 - 0.79  Strong Match

0.60 - 0.69  Acceptable Match

Below 0.60  Reject
```

---

# Example Response

Successful verification:

```json
{
  "match": true,
  "similarity": 0.6594,
  "liveness": true
}
```

Rejected verification:

```json
{
  "match": false,
  "similarity": 0.45,
  "liveness": true
}
```

---

# API Endpoint

## Verify Identity

Method:

```http
POST /verify
```

Form Data:

| Field    | Type |
| -------- | ---- |
| id_image | File |
| video    | File |

Example:

```text
National_ID.jpg
Selfie_Video.mp4
```

Response:

```json
{
  "match": true,
  "similarity": 0.6594,
  "liveness": true
}
```

---

# Current Limitations

Current version includes:

* Face matching
* Basic liveness
* Single-person verification

Not yet implemented:

* Blink detection
* Anti-spoof protection
* Deepfake detection
* Face tracking
* Risk scoring

---

# Future Improvements

Production version should include:

1. Blink Detection
2. Head Movement Verification
3. Anti-Photo Attack Detection
4. Anti-Screen Replay Detection
5. Deepfake Detection
6. MongoDB Verification Logs
7. Verification History
8. Confidence Scoring

---

# Use Cases

* National ID verification
* User onboarding
* Marketplace identity verification
* KYC verification
* Account recovery verification
* Fraud prevention

---

# Author

Project Type:

```text
AI Worker Service for Second-Hand Marketplace Identity Verification
```
