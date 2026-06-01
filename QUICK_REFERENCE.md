# 🎯 JOBREADY - QUICK REFERENCE GUIDE

## 🚀 Start Development (5 minutes)

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Watch for: ✓ Server running on http://localhost:4000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Watch for: http://localhost:5173
```

### Browser Test
```
Go to http://localhost:5173
1. Click "Bắt Đầu Phỏng Vấn Thử" or "Luyện Tập Phỏng Vấn"
2. Register → Login
3. Upload CV → See AI Analysis Score
4. If score ≥ 60 → Fill form → Start 10-question interview
5. If score < 60 → See blocking modal with CTA to upload CV
```

---

## 🔧 Common Troubleshooting

### ❌ "Cannot find module groq-sdk"
```
Solution:
cd backend
npm install groq-sdk
```

### ❌ "GROQ_API_KEY chưa được cấu hình"
```
Solution:
1. Go to https://console.groq.com/keys
2. Create/copy your API key
3. Add to backend/.env:
   GROQ_API_KEY=gsk_xxxxx...
4. Restart backend
```

### ❌ "MongoError: connect ECONNREFUSED"
```
Solution:
1. Verify backend/.env has MONGO_URI
2. Check MongoDB Atlas cluster is online
3. Verify IP whitelist allows your IP
4. Try: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/dbname?appName=Cluster0
```

### ❌ "Cannot GET /api/interview/next-question"
```
Likely: Session not created properly
Check:
1. POST /api/interview/start succeeded and returned sessionId
2. sessionId is valid MongoDB ObjectId
3. Token is valid JWT
```

### ❌ "CORS Error in browser console"
```
Status: Already fixed in backend
If still happening:
- Check backend is running on :4000
- Check frontend VITE_API_URL is http://localhost:4000
```

### ❌ "CV score always shows as null"
```
Solution:
1. Verify CV upload succeeded: POST /api/cv/upload
2. Check backend logs for Groq call
3. Verify GROQ_API_KEY is valid
4. Test: POST /api/interview/next-question to see if Groq works
```

---

## 📱 KEY API ENDPOINTS

### Interview Flow
```
POST /api/interview/start
  Body: { jobTitle, jobCategory, interviewType, jobDescription }
  Response: { sessionId, totalQuestions }

GET /api/interview/:sessionId/next-question
  Response: { questionText, questionType, topic, _id }

POST /api/interview/submit-answer
  Body: { questionId, userAnswer, responseTime }
  Response: { score, feedback, keyPoints, suggestions }

POST /api/interview/:sessionId/complete
  Response: { totalScore, averageScore, feedback }

GET /api/interview/:sessionId/result
  Response: { all questions, all scores, all feedback }
```

### CV Flow
```
POST /api/cv/upload
  Body: multipart/form-data with PDF
  Response: { analysis: { score, breakdown, feedback } }

GET /api/cv/my-cv
  Response: { fileName, analysis: { score, breakdown } }

DELETE /api/cv
  Response: { message: "CV deleted" }
```

### Auth Flow
```
POST /api/auth/register
  Body: { email, password, fullName }
  Response: { token, user }

POST /api/auth/login
  Body: { email, password }
  Response: { token, user }

GET /api/users/profile
  Headers: Authorization: Bearer <token>
  Response: { user profile }
```

---

## 🎨 Frontend Key Components

### Pages
- **InterviewPractice.jsx** - Form to select job position/category (HAS CV GATE)
- **InterviewSession.jsx** - Interview loop with 10 questions
- **InterviewResult.jsx** - Display results after interview
- **CVUpload.jsx** - Upload PDF and see AI score
- **CVAnalysisResult.jsx** - Beautiful modal showing CV analysis (emerald/cyan/purple design)

### CV Gate Logic
```jsx
// In InterviewPractice.jsx
if (!cvLoading && (!cvScore || cvScore < 60)) {
  // Show blocking modal - user cannot proceed
} else {
  // Show form - user can start interview
}
```

---

## 🗄️ Database Schema Quick Reference

### InterviewSession
```
{
  userId: ObjectId,
  jobTitle: String,
  jobCategory: Enum['IT', 'Marketing', ...],
  interviewType: Enum['Technical', 'Behavioral', 'Mixed'],
  status: String (ongoing/completed/paused),
  totalQuestions: 10,
  answeredQuestions: Number,
  totalScore: Number (0-100),
  averageScore: Number (0-100),
  questions: [ObjectId],
  completedAt: Date
}
```

### InterviewQuestion
```
{
  sessionId: ObjectId,
  questionNumber: 1-10,
  questionText: String,
  questionType: String,
  topic: String,
  userAnswer: String,
  score: Number,
  feedback: String,
  keyPoints: [String],
  suggestions: [String]
}
```

### User
```
{
  email: String (unique),
  password: String (hashed),
  fullName: String,
  roleId: ObjectId,
  createdAt: Date
}
```

---

## 🎯 Critical Features Status

| Feature | Status | Location |
|---------|--------|----------|
| CV Upload & Analysis | ✅ | /api/cv/upload, /api/cv/my-cv |
| CV Score Gate (≥60) | ✅ | frontend/InterviewPractice.jsx + blocking modal |
| Interview Questions (AI) | ✅ | groq.js generateQuestion() |
| Interview Answers (Scoring) | ✅ | groq.js evaluateAnswer() |
| Retry Logic | ✅ | groq.js retryWithBackoff() |
| 10-Question Session | ✅ | interview.service.js |
| Results Display | ✅ | InterviewResult.jsx |
| Beautiful CV Modal | ✅ | CVAnalysisResult.jsx (emerald/cyan design) |
| Error Handling | ✅ | All endpoints + Groq fallback |

---

## 💡 Pro Tips

### Testing with Mock Data
```javascript
// Use fallback questions if Groq fails
// Located in interview.service.js getFallbackQuestion()
// Automatically triggered if Groq unavailable
```

### Debugging with Logs
```
Backend: npm run dev (shows console logs)
Frontend: Open DevTools (F12) → Console tab

Key logs to check:
- "Retry attempt X/3" (Groq retry)
- "Error fetching CV:" (CV gate check)
- "Error generating question:" (Interview Q generation)
```

### Testing CV Gate
```
1. Create user with low CV (< 60 points)
2. Go to /interview
3. Should see blocking orange modal
4. Click "Tải lên CV ngay" → /cv-upload
5. Upload CV with better content
6. Return to /interview
7. Should now see form with green "✓ CV đạt X/100"
```

### Testing Groq Integration
```
1. Start interview
2. Each question generation:
   - Backend calls Groq with retry logic
   - If Groq succeeds: Real question returned
   - If Groq fails 3x: Fallback question used
3. Check backend logs for retry attempts
```

---

## 📊 Performance Notes

- **Groq Response Time:** 2-5 seconds per question
- **CV Analysis Time:** 3-8 seconds first upload
- **Database Query:** < 100ms for most queries
- **10-Question Interview:** ~2-3 minutes total
- **Retry Overhead:** +1-3 seconds if failures occur

---

## 🔐 Environment Variables Checklist

### Backend (.env) - EXISTS ✓
- [x] MONGO_URI - MongoDB connection
- [x] GROQ_API_KEY - Groq API key
- [x] JWT_SECRET - Auth token secret (256 chars)
- [x] PORT - Server port (4000)
- [x] EMAIL_USER, EMAIL_PASS - OTP emails

### Frontend (.env.local) - OPTIONAL
- [ ] VITE_API_URL - Backend API URL (default: http://localhost:4000)

---

## 📝 Code Quality

### Commenting Standard
```javascript
/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: [functionParams...]
 * Description: What this function does and why
 */
```

### Followed Throughout:
- ✓ Backend services
- ✓ Backend controllers
- ✓ Groq service
- ✓ Interview service
- ✓ CV service

---

## 🎓 Learning Resources

- **Groq API Docs:** https://console.groq.com/docs
- **MongoDB Mongoose:** https://mongoosejs.com/
- **React Router:** https://reactrouter.com/
- **Tailwind CSS:** https://tailwindcss.com/

---

## 🚀 Deployment Quick Start

```bash
# Production build
cd frontend
npm run build

cd backend
npm start

# Set environment variables in production
# MONGO_URI=production_url
# GROQ_API_KEY=production_key
# JWT_SECRET=production_secret
# NODE_ENV=production
```

---

## ❓ FAQ

**Q: How many questions in one interview?**  
A: 10 questions per session (configurable in interview.model.js)

**Q: What happens if Groq API fails?**  
A: System retries 3 times with exponential backoff. If all fail, uses fallback static questions.

**Q: Can users bypass CV gate?**  
A: No - blocking modal forces upload before accessing interview form.

**Q: How is CV scored?**  
A: Groq AI analyzes structure (20%), content (30%), language (25%), job relevance (25%) → returns 0-100 score

**Q: Is user data saved between sessions?**  
A: Yes - all interview sessions, scores, and CV uploads saved to MongoDB

**Q: Can users retake interviews?**  
A: Yes - no limit on attempts, each creates new session entry

---

## 📞 Developer Contact

**Name:** Dương Trọng Lực  
**Student ID:** HE187000  
**Project:** JobReady - AI Interview Training Platform  
**Created:** January 2025

---

**Good luck with testing! 🚀**
