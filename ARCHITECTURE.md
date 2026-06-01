# 🏗️ JOBREADY - SYSTEM ARCHITECTURE & FLOW DIAGRAMS

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     JOBREADY SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │   FRONTEND (React)   │         │  BACKEND (Node.js)   │      │
│  │   Port: 5173         │         │  Port: 4000          │      │
│  ├──────────────────────┤         ├──────────────────────┤      │
│  │                      │         │                      │      │
│  │ • InterviewPractice  │◄────►   │ • Auth Service       │      │
│  │ • InterviewSession   │  REST   │ • Interview API      │      │
│  │ • CVUpload           │   &     │ • CV Analysis        │      │
│  │ • CVAnalysisResult   │  Auth   │ • Groq Integration   │      │
│  │ • InterviewResult    │  JWT    │ • Error Handling     │      │
│  │ • Dashboard          │         │                      │      │
│  │ • Auth Context       │         │                      │      │
│  └──────────────────────┘         └──────────────────────┘      │
│           │                                  │                   │
│           └──────────────┬───────────────────┘                   │
│                          │                                       │
│                          ▼                                       │
│           ┌───────────────────────────┐                         │
│           │   DATABASE (MongoDB)      │                         │
│           ├───────────────────────────┤                         │
│           │                           │                         │
│           │ • Users Collection        │                         │
│           │ • InterviewSessions       │                         │
│           │ • InterviewQuestions      │                         │
│           │ • CVAnalysis              │                         │
│           │ • JobApplications         │                         │
│           │ • InterviewAnalytics      │                         │
│           │                           │                         │
│           └───────────────────────────┘                         │
│                          │                                       │
│                          ▼ (config via)                         │
│           ┌───────────────────────────┐                         │
│           │   GROQ API (External)     │                         │
│           ├───────────────────────────┤                         │
│           │                           │                         │
│           │ • Generate Questions      │                         │
│           │ • Evaluate Answers        │                         │
│           │ • Score CV                │                         │
│           │ • Generate Feedback       │                         │
│           │ • Retry Logic (3x + BO)   │                         │
│           │ • 30s Timeout             │                         │
│           │                           │                         │
│           └───────────────────────────┘                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. User Journey - Complete Flow

### Phase 1: Registration & Authentication
```
┌─────────────────────────────────────────────────┐
│                USER REGISTRATION                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  Frontend                    Backend            │
│  ──────────────────────────────────────         │
│                                                  │
│  1. Click "Đăng ký"            ──→              │
│     ↓                                            │
│  2. Enter email/password       ──→  Register    │
│     ↓                          ←──  Validate    │
│  3. Receive token              ←──  Hash Pass   │
│                                    Save to DB   │
│                                                  │
│  ✓ User saved in MongoDB                       │
│  ✓ JWT token returned                          │
│  ✓ Stored in localStorage                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Phase 2: CV Upload & Analysis (THE CV GATE)
```
┌──────────────────────────────────────────────────┐
│         CV UPLOAD & AI ANALYSIS                  │
├──────────────────────────────────────────────────┤
│                                                   │
│  Frontend: /cv-upload              Backend       │
│  ──────────────────────────────────────────     │
│                                                   │
│  1. User selects PDF             ──→            │
│     ↓                                             │
│  2. Multipart upload             ──→  Save PDF   │
│     ↓                            ←──  Call Groq  │
│  3. Display spinner              ←──  Analyze   │
│     ↓                            ←──  Score     │
│  4. Show CVAnalysisResult modal  ←──  (0-100)   │
│     with beautiful UI                            │
│     ↓                                             │
│                                                   │
│  ✓ PDF file saved to uploads/cvs/               │
│  ✓ Groq AI generates:                           │
│     - Score (0-100)                             │
│     - Structure scoring (0-100)                 │
│     - Content scoring (0-100)                   │
│     - Language scoring (0-100)                  │
│     - Job relevance scoring (0-100)             │
│     - Key strengths                             │
│     - Areas for improvement                     │
│     - Specific suggestions                      │
│  ✓ CV saved to database                         │
│  ✓ User can see score                           │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Phase 3: Interview Practice Access (CV GATE CHECK)
```
┌─────────────────────────────────────────────────┐
│      INTERVIEW PRACTICE ACCESS (CV GATE)         │
├─────────────────────────────────────────────────┤
│                                                  │
│  Frontend: /interview              Backend      │
│  ──────────────────────────────────────────    │
│                                                  │
│  1. Component mounts               ──→          │
│     ↓                           fetchCVScore    │
│  2. Fetch CV score               ←──  GET       │
│     ↓                                /api/cv/   │
│  ┌──────────────────┐                my-cv      │
│  │ Score < 60?      │                           │
│  └──────────────────┘                           │
│     │ YES                │ NO                   │
│     ↓                    ↓                      │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │BLOCKING MODAL    │  │ SHOW FORM        │   │
│  │(Orange warning)  │  │ + Green badge    │   │
│  │                  │  │ "✓ CV đạt 85/100"│   │
│  │❌ CANNOT proceed │  │ ✅ Can proceed   │   │
│  │                  │  │                  │   │
│  │CTA buttons:      │  │Form fields:      │   │
│  │• Upload CV →cv   │  │• Job title       │   │
│  │• Improve CV →cv  │  │• Category        │   │
│  │                  │  │• Interview type  │   │
│  └──────────────────┘  │• Description     │   │
│                        │                  │   │
│                        │[Submit]→start int│   │
│                        └──────────────────┘   │
│                                                │
│  ✓ CV gate blocks low-score users              │
│  ✓ Users forced to improve CV first            │
│  ✓ Only qualified users proceed                │
│                                                │
└─────────────────────────────────────────────────┘
```

### Phase 4: Interview Session (10 Questions)
```
┌───────────────────────────────────────────────────────┐
│         INTERVIEW SESSION (10 QUESTIONS)              │
├───────────────────────────────────────────────────────┤
│                                                        │
│  Frontend: /interview/:sessionId      Backend        │
│  ──────────────────────────────────────────────────  │
│                                                        │
│  Question Loop (1-10):                                │
│  ┌───────────────────────────────────────────────┐   │
│  │ Question N/10                                  │   │
│  ├───────────────────────────────────────────────┤   │
│  │                                                │   │
│  │  Frontend                 Backend             │   │
│  │  ──────────────────────────────────────────  │   │
│  │                                                │   │
│  │  1. Page loads           ──→                  │   │
│  │     ↓                 generateQuestion()      │   │
│  │  2. Fetch Q           ←──  (Groq/Fallback)    │   │
│  │     ↓                                          │   │
│  │  3. Display Q                                 │   │
│  │     + Timer                                   │   │
│  │     + Textarea                                │   │
│  │     ↓                                          │   │
│  │  4. User types answer                         │   │
│  │     (1-300 seconds allowed)                   │   │
│  │     ↓                                          │   │
│  │  5. Click [Gửi câu trả lời]                  │   │
│  │     ↓                       ──→ submitAnswer() │   │
│  │  6. Show spinner          ←──  (Groq eval)    │   │
│  │     ↓                                          │   │
│  │  7. Display feedback      ←──  Score 0-100    │   │
│  │     • Score badge                             │   │
│  │     • AI feedback                             │   │
│  │     • Key points                              │   │
│  │     • Suggestions                             │   │
│  │     ↓                                          │   │
│  │  8. Click [Câu hỏi tiếp theo]                 │   │
│  │     ↓                                          │   │
│  │  [Loop back to step 1 for Q2-Q10]             │   │
│  │                                                │   │
│  └───────────────────────────────────────────────┘   │
│                                                        │
│  After 10 questions:                                  │
│  ──────────────────────────                           │
│  ✓ Calculate total score (avg of 10)                 │
│  ✓ Generate overall feedback                         │
│  ✓ Navigate to /interview/:sessionId/result          │
│                                                        │
│  Groq Integration:                                    │
│  ──────────────────                                   │
│  • generateQuestion():                                │
│    Retry max 3x with backoff (1s→2s→3s)              │
│    Timeout 30s per request                           │
│    Fallback to static Q if all fail                  │
│                                                        │
│  • evaluateAnswer():                                  │
│    Same retry/timeout logic                          │
│    Score 0-100 with explanation                      │
│                                                        │
└───────────────────────────────────────────────────────┘
```

### Phase 5: Results Display
```
┌────────────────────────────────────────────────┐
│     INTERVIEW RESULTS PAGE                     │
├────────────────────────────────────────────────┤
│                                                 │
│  Frontend: /interview/:sessionId/result        │
│  ────────────────────────────────────────     │
│                                                 │
│  Display:                                      │
│  ┌──────────────────────────────────────────┐ │
│  │  Overall Score: 78/100                   │ │
│  │  Status: Khá tốt                         │ │
│  │  Interview Date: 2025-01-15              │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  Each Question (1-10):                        │
│  ┌──────────────────────────────────────────┐ │
│  │ Question 1: [Your question here]         │ │
│  │ ──────────────────────────────────────   │ │
│  │ Your Answer: [User's answer here]        │ │
│  │                                          │ │
│  │ Score: 75/100  [Progress bar]            │ │
│  │                                          │ │
│  │ Feedback: "Your answer demonstrates..." │ │
│  │ • Key Points: [Positive aspects]         │ │
│  │ • Improvements: [Areas to develop]       │ │
│  │ • Suggestions: [Specific tips]           │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  [Download Result] [Try Again] [Back Home]    │
│                                                 │
└────────────────────────────────────────────────┘
```

---

## 3. Data Flow Diagram

```
┌──────────────┐         ┌────────────────┐         ┌──────────────┐
│   User        │         │   Database     │         │  Groq API    │
│  (Frontend)   │         │   (MongoDB)    │         │  (External)  │
└──────────────┘         └────────────────┘         └──────────────┘
      │ │ │                    │ │ │                      │ │ │
      │ │ │                    │ │ │                      │ │ │
   1. │─────────────────────────►│                        │ │ │
      │ Create User            │ │ Save User             │ │ │
   2. │◄─────────────────────────│                        │ │ │
      │ Return Token          │ │ │                       │ │ │
      │ │                      │ │ │                       │ │ │
   3. │───────────────────────────►│                      │ │ │
      │ Upload CV              │ │ Save CV File          │ │ │
   4. │                        │ │ │                      │ │ │
      │                        ├──────────────────────────►│ │
      │                        │ │ Analyze CV             │ │
   5. │                        │◄──────────────────────────│ │
      │                        │ │ Score 0-100            │ │
   6. │◄──────────────────────────┤ Save Score             │ │
      │ Return Score           │ │ │                      │ │
      │ │                      │ │ │                      │ │
   7. │───────────────────────────►│                      │ │
      │ Start Interview        │ │ Create Session        │ │
   8. │◄──────────────────────────────────────────────────►│
      │ Return SessionId       │ │ SessionId             │ │
      │ │                      │ │                       │ │
   9. │───────────────────────────────────────────────────►│
      │ Get Question 1         │ │                  Generate Q
   10.│◄───────────────────────────────────────────────────│
      │ Question Text          │ │ │                      │
      │ │                      │ │ │                      │
  11. │ [User thinks & types]  │ │ │                      │
      │ │                      │ │ │                      │
  12. │───────────────────────────►│                      │
      │ Submit Answer 1        │ │ Save Answer           │
  13. │                        │ │                      ├──────►
      │                        │ │ │ Evaluate Answer
  14. │                        │ │                      ◄──────┤
      │◄──────────────────────────────────────────────────────┤
      │ Score + Feedback       │ │ │                      │ │
      │ │                      │ │ │                      │ │
      │ [Repeat 12-14 for Q2-Q10]                         │ │
      │ │                      │ │ │                      │ │
  15. │───────────────────────────►│                      │ │
      │ Complete Interview     │ │ Store Final Score     │ │
  16. │◄──────────────────────────────────────────────────────┤
      │ Results               │ │ │ Calculate Summary
      │                       │ │ │                      │ │
```

---

## 4. Component Dependency Graph

```
App.jsx (Router)
├── LandingPage
│   ├── Header
│   ├── Hero (Interview training focus)
│   ├── JobListings
│   ├── Footer
│   └── [CTA → /interview or /login]
│
├── Login
│   └── AuthContext (useAuth)
│
├── Register
│   └── AuthContext (useAuth)
│
├── Dashboard
│   └── Sidebar + Profile
│
├── CVUpload ⭐
│   └── CVAnalysisResult (Modal)
│       └── Displays: Score, breakdown, feedback
│
├── InterviewPractice ⭐ (CV GATE HERE)
│   ├── Fetches CV score on mount
│   ├── If score < 60 → Blocking modal
│   └── If score ≥ 60 → Form + Interview
│
├── InterviewSession ⭐
│   ├── Fetch question loop
│   ├── Submit answers
│   ├── Display feedback
│   └── Navigate to result
│
└── InterviewResult ⭐
    └── Display all 10 scores + feedback

axios → API_URL (http://localhost:4000)
AuthContext → JWT token management
```

---

## 5. Groq Integration & Retry Logic

```
┌─────────────────────────────────────────────────────┐
│         GROQ SERVICE WITH RETRY LOGIC               │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Call Flow:                                          │
│  ──────────────                                      │
│                                                      │
│  Frontend/Backend calls:                            │
│  generateQuestion(prompt)                           │
│        │                                             │
│        ▼ 1️⃣ ATTEMPT 1                              │
│  ┌─────────────────┐                                │
│  │ Call Groq API   │                                │
│  │ Timeout: 30s    │                                │
│  └─────────────────┘                                │
│        │                                             │
│   ┌────┴─────────────┐                              │
│   │                  │                              │
│   ▼ SUCCESS          ▼ FAIL                          │
│  ✓ Return Q        ❌ Check error                    │
│                    Is retryable?                     │
│                    (ECONNRESET, ETIMEDOUT,           │
│                     429, 5xx, etc)                   │
│                       │                              │
│                   ┌───┴────┐                         │
│                   │         │                        │
│                   ▼ YES     ▼ NO                     │
│              ┌─────────┐   ❌ Throw                  │
│              │ Wait 1s │   Error                     │
│              └────┬────┘                             │
│                   ▼ 2️⃣ ATTEMPT 2                    │
│              [Call Groq API]                         │
│                   │                                  │
│              ┌────┴─────────┐                        │
│              │              │                        │
│              ▼ SUCCESS      ▼ FAIL (retryable)       │
│             ✓ Return Q     Wait 2s                   │
│                             ▼ 3️⃣ ATTEMPT 3          │
│                        [Call Groq API]               │
│                             │                        │
│                        ┌────┴─────────┐              │
│                        │              │              │
│                        ▼ SUCCESS      ▼ FAIL         │
│                       ✓ Return Q    ❌ Use Fallback  │
│                                      Static Q        │
│                                                      │
│  Max Retries: 3                                      │
│  Delays: 1s → 2s → 3s (exponential backoff)         │
│  Timeout: 30 seconds per request                    │
│  Errors Retried:                                     │
│    • ECONNRESET - Connection reset                  │
│    • ETIMEDOUT - Request timeout                    │
│    • ENOTFOUND - DNS resolution failed              │
│    • 429 - Rate limited                             │
│    • 5xx - Server errors                            │
│                                                      │
│  Fallback (if all retries fail):                     │
│    • Use static question bank                       │
│    • Show warning to user                           │
│    • Log error for debugging                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 6. CV Gate Logic (Critical Feature)

```
    USER VISITS /interview
            │
            ▼
    ┌──────────────────────┐
    │ InterviewPractice    │
    │ mounts               │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ useEffect hook runs:         │
    │ fetchCVScore()               │
    └────────┬─────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ axios GET /api/cv/my-cv             │
    │ (with authorization header)         │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Backend fetches CV     │
    │ Returns { score }      │
    └────────┬───────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ Frontend checks:            │
    │ if (!cvScore || score < 60) │
    └────────┬────────┬───────────┘
             │        │
      ┌─────┘        └─────┐
      │                    │
      ▼ YES               ▼ NO
    BLOCK               ALLOW
    ┌──────────────────┐ ┌──────────────────┐
    │ Show Modal       │ │ Show Form        │
    │ (Orange warning) │ │ + Green badge    │
    │                  │ │ "✓ CV đạt X/100" │
    │ Message:         │ │                  │
    │ "CV chưa đủ"     │ │ User can fill:   │
    │ "Điểm: X/100"    │ │ • jobTitle       │
    │                  │ │ • jobCategory    │
    │ Buttons:         │ │ • interviewType  │
    │ • Tải CV ngay    │ │ • description    │
    │   → /cv-upload   │ │                  │
    │ • Cải thiện CV   │ │ Click [Submit]   │
    │   → /cv-upload   │ │ → Start interview│
    │ • Quay lại       │ │                  │
    │   → /           │ │                  │
    └──────────────────┘ └──────────────────┘
         │                      │
         └──────────────────────┘
                │
                ▼
          User proceeds
         (either to upload
          CV or interview)
```

---

## 7. Error Handling Flow

```
┌─────────────────────────────────────────┐
│         ERROR HANDLING STRATEGY          │
├─────────────────────────────────────────┤
│                                          │
│  API Call                                │
│    │                                      │
│    ├─► Success (200-299)                 │
│    │   Return data                       │
│    │                                      │
│    ├─► Client Error (4xx)                │
│    │   ├─► 401 Unauthorized              │
│    │   │   └─ Redirect to /login         │
│    │   ├─► 403 Forbidden                 │
│    │   │   └─ Show access denied         │
│    │   ├─► 404 Not Found                 │
│    │   │   └─ Show not found             │
│    │   └─► 400 Bad Request               │
│    │       └─ Show form error            │
│    │                                      │
│    ├─► Server Error (5xx)                │
│    │   ├─► 500 Internal Server Error     │
│    │   │   └─ Show "Lỗi server"          │
│    │   ├─► 503 Service Unavailable       │
│    │   │   └─ Show "Service unavailable" │
│    │   └─► Network Timeout               │
│    │       └─ Show network error         │
│    │                                      │
│    └─► Groq-Specific Errors              │
│        ├─► API Key missing               │
│        │   └─ Use fallback Q             │
│        ├─► Rate limited (429)            │
│        │   └─ Retry with backoff         │
│        ├─► Timeout (30s)                 │
│        │   └─ Retry 1-3                  │
│        └─► Invalid response              │
│            └─ Use fallback Q             │
│                                          │
│  User sees:                              │
│  • Loading spinner during wait           │
│  • Clear error message on failure        │
│  • Retry option when applicable          │
│  • Fallback content when degraded        │
│                                          │
└─────────────────────────────────────────┘
```

---

## 8. Database Schema Relationships

```
┌──────────────────────────────────────────────────────────┐
│                 DATABASE RELATIONSHIPS                    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Users                                                    │
│  ┌────────────────────┐                                  │
│  │ _id (ObjectId)     │                                  │
│  │ email              │                                  │
│  │ password (hashed)  │                                  │
│  │ fullName           │                                  │
│  │ roleId (FK)        │                                  │
│  │ createdAt          │                                  │
│  └────────────────────┘                                  │
│           │ 1                                             │
│           │ ┌──────────────────────────────────────┐    │
│           │ │ (One user has many sessions)        │    │
│           │ └──────────────────────────────────────┘    │
│           │ N                                             │
│  ┌────────▼────────────────────────────────────────────┐ │
│  │ InterviewSession                                   │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ _id (ObjectId)                                   │ │
│  │ userId (FK) ──┐                                  │ │
│  │ jobId (FK)    │                                  │ │
│  │ jobTitle      │                                  │ │
│  │ jobCategory   │  Related data                    │ │
│  │ interviewType │                                  │ │
│  │ status        │                                  │ │
│  │ totalScore    │                                  │ │
│  │ averageScore  │                                  │ │
│  │ questions[]───────┬── (FK to questions)          │ │
│  │ startedAt     │    │                             │ │
│  │ completedAt   │    │                             │ │
│  │ duration      │    │                             │ │
│  └───────────────┘    │                             │ │
│         1             │ N                           │ │
│         │             │                             │ │
│         │    ┌────────▼─────────────────────┐      │ │
│         │    │ InterviewQuestion           │      │ │
│         │    ├──────────────────────────────┤      │ │
│         │    │ _id (ObjectId)               │      │ │
│         │    │ sessionId (FK) ──────────────┼──────┘ │
│         │    │ questionNumber (1-10)        │        │
│         │    │ questionText                 │        │
│         │    │ questionType                 │        │
│         │    │ userAnswer                   │        │
│         │    │ score                        │        │
│         │    │ feedback                     │        │
│         │    │ keyPoints[]                  │        │
│         │    │ suggestions[]                │        │
│         │    │ responseTime                 │        │
│         │    └──────────────────────────────┘        │
│         │                                             │
│         │ (Additional related collections)            │
│         │                                             │
│         ├──► Jobs                                     │
│         │    ├─ jobId, title, description            │
│         │    └─ (for job-specific interviews)        │
│         │                                             │
│         ├──► CVAnalysis                              │
│         │    ├─ userId (FK)                          │
│         │    ├─ fileName, fileSize                   │
│         │    ├─ score (0-100)                        │
│         │    ├─ scoreBreakdown (structure/content)   │
│         │    ├─ feedback, suggestions                │
│         │    └─ uploadedAt                           │
│         │                                             │
│         └──► InterviewAnalytics                      │
│              ├─ sessionId (FK)                       │
│              ├─ userId (FK)                          │
│              ├─ skillsAssessed[]                     │
│              ├─ totalTime                            │
│              ├─ averageResponseTime                  │
│              ├─ averageScore                         │
│              └─ timestamp                            │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 9. Key Technologies & Versions

```
Frontend (React):
├── React: ^18.x
├── React Router: ^6.x
├── Tailwind CSS: ^3.x
├── Axios: ^1.x (HTTP client)
├── Lucide React: Icons
└── Vite: Build tool (dev server on :5173)

Backend (Node.js):
├── Express: ^5.x
├── Mongoose: ^7.x (MongoDB ODM)
├── Groq SDK: Latest (llama-3.3-70b-versatile)
├── bcryptjs: Password hashing
├── jsonwebtoken: JWT auth
├── cors: Cross-origin
├── dotenv: Environment variables
└── multer: File uploads

Database:
├── MongoDB: Atlas (Cloud)
├── Connection: MongoDB+SRV protocol
└── Collections: Users, Sessions, Questions, Analytics

External Services:
├── Groq API: AI question generation & evaluation
│   └── Model: llama-3.3-70b-versatile
│   └── Timeout: 30s per request
│   └── Retry: 3x with backoff
│
└── Email (Optional):
    └── Gmail SMTP for OTP notifications
```

---

## 10. Performance Metrics

```
┌────────────────────────────────────────────────┐
│         SYSTEM PERFORMANCE NOTES               │
├────────────────────────────────────────────────┤
│                                                 │
│ CV Analysis:                                   │
│   • Upload time: < 2 seconds                   │
│   • Groq analysis: 3-8 seconds                 │
│   • Total CV experience: ~10 seconds           │
│                                                 │
│ Interview Session:                             │
│   • Question generation (Groq): 2-5 seconds    │
│   • Answer evaluation (Groq): 3-7 seconds      │
│   • Per-question cycle: ~5-15 seconds          │
│   • 10-question interview: ~2-3 minutes        │
│                                                 │
│ Database:                                      │
│   • Query response: < 100ms                    │
│   • Save operation: < 200ms                    │
│   • Batch operations: < 500ms                  │
│                                                 │
│ Network:                                       │
│   • Frontend → Backend: ~50ms (localhost)      │
│   • Backend → Groq: ~1-2 seconds               │
│   • Backend → MongoDB: ~100-200ms              │
│                                                 │
│ Frontend (Vite):                               │
│   • Page load: < 1 second                      │
│   • Route navigation: < 200ms                  │
│   • Spinner animation: Smooth                  │
│                                                 │
│ Groq Retry Overhead:                           │
│   • No retries: ~3-5 seconds                   │
│   • 1 retry: ~4-7 seconds                      │
│   • 2 retries: ~6-10 seconds                   │
│   • 3 retries (then fallback): ~7-12 seconds   │
│                                                 │
│ Fallback (Static Questions):                   │
│   • Response: < 500ms                          │
│   • No Groq latency                            │
│                                                 │
└────────────────────────────────────────────────┘
```

---

**This architecture is designed for:**
- ✅ Scalability (stateless backend)
- ✅ Reliability (Groq retry logic + fallbacks)
- ✅ User Experience (CV gate ensures quality, beautiful UI)
- ✅ AI Integration (Groq for intelligent questions/scoring)
- ✅ Error Handling (comprehensive error flows)
- ✅ Performance (optimized queries, caching ready)

