# 🎯 Quiz & Certificate Feature Testing Guide

## ✅ CURRENT STATUS

### ✅ IMPLEMENTED - Quiz Feature
- [x] Quiz page loads questions correctly
- [x] Users can answer questions
- [x] Navigation between questions (Previous/Next)
- [x] Timer displays and counts down
- [x] Auto-submit when time runs out
- [x] Score calculation (correct/wrong answers)
- [x] Result page with detailed charts
- [x] Performance breakdown (doughnut chart)
- [x] Per-question performance (bar chart)
- [x] Answer review showing correct vs incorrect

### ⚠️ INCOMPLETE - Certificate Feature
- [ ] Certificate Component (UI/styling)
- [ ] Certificate generation after passing quiz (≥60%)
- [ ] Certificate display page
- [ ] Certificate download (PDF/Image)
- [ ] Certificate storage/history
- [ ] Link from Quiz result to Certificate

---

## 🧪 STEP-BY-STEP TESTING GUIDE

### 1️⃣ TEST THE QUIZ FEATURE

#### Open Quiz Page
```
1. Navigate to My Learning → Select a course
2. Go to course → Find Quiz section
3. Click "Take Quiz"
4. URL should be: localhost:3000/student/courses/{courseId}/quiz
```

#### Check Quiz Loads
✅ **Expected:**
- Quiz title displays
- Timer shows (mm:ss format)
- Progress bar visible
- Question 1 displays with options
- All options are clickable

❌ **If Not Working:**
```
Open Console (F12) → Check for errors
Look for: "Failed to load quiz" message
```

---

#### Test Question Navigation
```
1. Check button text: "A", "B", "C", "D"
2. Click an option → should highlight in BLUE
3. Click "Next" → moves to Question 2
4. Click "Previous" → moves back to Question 1
5. Buttons are disabled at start/end
```

✅ **Expected:**
- Selected option shows blue highlight
- Navigation buttons work smoothly
- Progress bar updates
- Answered questions show green dot in navigation

---

#### Test Timer
```
1. Wait for timer to count down
2. When < 60 seconds: Timer turns RED with warning
3. At 0:00 → Quiz should auto-submit
```

❌ **If Timer Not Working:**
```
Check console for: setInterval errors
Open DevTools Network tab → see if API is slow
```

---

#### Test Submit Quiz
```
1. Answer all questions (or skip some)
2. Click "Submit Quiz" button
3. Wait for result to load
```

✅ **Expected Results Page Should Show:**
- Large green or red score percentage
- "Congratulations!" or "Try Again" message
- Correct/Wrong badge count
- Pass/Fail status
- Charts (doughnut + bar)

---

### 2️⃣ TEST SCORE CALCULATION

#### Manual Verification
```
1. Answer Questions 1-5:
   Q1: Option A (correct) ✓
   Q2: Option B (wrong) ✗
   Q3: Option C (correct) ✓
   Q4: Skip (counts as wrong) ✗
   Q5: Option D (correct) ✓

Expected Score:
   Correct: 3/5
   Percentage: 60%
   Status: PASSED (≥60%)
```

✅ **Result Page Should Display:**
- **60%** in large text
- ✓ 3 Correct
- ✕ 2 Wrong
- Green "Passed" badge

❌ **If Score is Wrong:**
```
Check console → Look for calculation logic
Verify: answersMap[questionId] === correctIndex
```

---

### 3️⃣ TEST CERTIFICATE FEATURE (⚠️ CURRENTLY INCOMPLETE)

#### What Should Happen After Passing
```
1. User takes quiz
2. Scores ≥ 60% → PASS
3. Result page shows: "Certificate generated!"
4. Click "Download Certificate" button
5. Certificate PDF/Image downloads
6. Can view certificate anytime
```

#### ❌ Current Issue
Currently, certificate only shows a note:
```
🎓 Certificate has been added to your account
```

**But there is NO:**
- ❌ Certificate Component
- ❌ Certificate Display
- ❌ Download button
- ❌ Certificate storage

---

## 🔧 IMPLEMENTATION CHECKLIST

### What Needs to Be Created:

#### 1. **Certificate Component** (`src/components/Certificate.jsx`)
- Display certificate with user info
- Show course name, score, date
- Professional design

#### 2. **Certificate Page** (`src/routes/Student/Certificate.jsx`)
- Full page view of certificate
- Download button
- Print option

#### 3. **Certificate Routes** (in `src/App.jsx`)
- Add route: `/student/certificate/:certificateId`
- Add route: `/student/my-certificates` (view all)

#### 4. **Certificate Service** (`src/services/certificates.js`)
- Generate certificate data
- Save to localStorage/backend
- Retrieve certificate history

#### 5. **Update Quiz Flow**
- After passing quiz → Generate certificate
- Navigate to certificate page
- Show success message

---

## 📊 TESTING RESULTS TEMPLATE

### ✅ Quiz Feature Status
| Feature | Status | Notes |
|---------|--------|-------|
| Load Quiz | ✅ | Working correctly |
| Display Questions | ✅ | All questions show |
| Answer Selection | ✅ | Options clickable |
| Navigation | ✅ | Previous/Next work |
| Timer | ✅ | Counts down, auto-submits |
| Score Calculation | ✅ | Correct math |
| Result Display | ✅ | Charts and stats show |

### ⚠️ Certificate Feature Status
| Feature | Status | Notes |
|---------|--------|-------|
| Certificate UI | ❌ | **NEEDS IMPLEMENTATION** |
| Generation on Pass | ❌ | **NEEDS IMPLEMENTATION** |
| Download Certificate | ❌ | **NEEDS IMPLEMENTATION** |
| View History | ❌ | **NEEDS IMPLEMENTATION** |

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Quiz doesn't load
```
Error: "Failed to load quiz"

Solution:
1. Check backend is running (port 3002)
2. Verify courseId is correct
3. Check /api/courses/{courseId}/quiz endpoint
```

### Issue 2: Timer doesn't work
```
Error: Timer stuck or not counting

Solution:
1. Check browser console for errors
2. Verify timeLimit is set in quiz data
3. Check setTimeout/setInterval not blocked
```

### Issue 3: Score calculation wrong
```
Error: Shows 0/5 or wrong percentage

Solution:
1. Verify correctIndex is set correctly in questions
2. Check answers object is populated
3. Console log to debug: console.warn("Answers:", answers)
```

### Issue 4: Results page blank
```
Error: Blank page after submit

Solution:
1. Check if result state is null
2. Verify submitted state is true
3. Check browser console for React errors
```

---

## 🚀 NEXT STEPS

### 1. Verify Quiz Works ✅
Run through testing checklist above

### 2. Create Certificate Components ⏳
I'll provide the code for:
- `Certificate.jsx` (component)
- `CertificatePage.jsx` (full page)
- `certificates.js` (service)

### 3. Integrate Certificate Flow ⏳
- Update Quiz.jsx result page
- Add certificate generation
- Add certificate routes
- Add certificate storage

### 4. Test Full Flow ⏳
- Take quiz → Pass → Get certificate
- Download certificate
- View certificate history

---

## 📝 MANUAL TEST CHECKLIST

Run this now to test current quiz:

### ✅ Quiz Test Checklist
- [ ] Quiz page loads without errors
- [ ] All questions visible
- [ ] Options are clickable
- [ ] Navigation buttons work (Prev/Next)
- [ ] Timer counts down
- [ ] Timer warning at < 60 seconds (RED)
- [ ] Question dots show answered status
- [ ] Submit button appears on last question
- [ ] Score displays correct percentage
- [ ] Charts render (doughnut + bar)
- [ ] Answer review shows all answers
- [ ] Retake button works
- [ ] Back to Course button works

### ⚠️ Certificate Test Checklist
- [ ] Check if "Certificate has been added" message shows after pass
- [ ] Look for download button (currently missing)
- [ ] Check if certificate data saved anywhere
- [ ] Try to view certificate (currently impossible)

---

## 📞 NEED HELP?

### Current Quiz Issue:
```
F12 → Console → Copy full error message
Share error in next response
```

### Request Certificate Feature:
```
Ready to implement when you confirm quiz works!
```

---

**Status: QUIZ ✅ READY | CERTIFICATE ⏳ PENDING**
