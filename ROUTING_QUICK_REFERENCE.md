# 🗺️ React LMS Routing Quick Reference

## Navigation Quick Guide

### 🔵 For Unauthenticated Users (Public)
```jsx
// View course details from catalog/landing page
import { Link } from 'react-router-dom';

<Link to={`/courses/${course.id}`}>
  View Course Details
</Link>
```

### 🟢 For Authenticated Students

#### View Enrolled Course Details
```jsx
navigate(`/student/course/${courseId}`);
// Goes to: EnrolledCourseView.jsx
```

#### Start/Continue Learning
```jsx
navigate(`/student/courses/${courseId}/learn`);
// Goes to: CourseLearning.jsx
// Shows all lectures and lesson player
```

#### View Specific Lecture
```jsx
navigate(`/student/courses/${courseId}/learn/${lectureId}`);
// Goes to: CourseLearning with specific lecture playing
```

#### Take Quiz
```jsx
navigate(`/student/courses/${courseId}/quiz`);
// Goes to: Quiz.jsx
```

---

## Complete Route Reference

### Public Pages
- ✅ `/` — Landing page (LandingPage)
- ✅ `/catalog` — Browse courses (Catalog)
- ✅ `/explore` — Featured courses (Explore)
- ✅ `/courses/:courseId` — Course details (CourseDetail) **← USE THIS FOR PUBLIC**
- ✅ `/courses/:courseId/lessons/:lessonId/preview` — Lesson preview (LessonPlayer)

### Student Pages
- ✅ `/student/dashboard` — Dashboard (StudentDashboard)
- ✅ `/student/my-courses` — My courses list (MyEnrolledCourses)
- ✅ `/student/course/:courseId` — Course details (EnrolledCourseView) **← USE THIS FOR ENROLLED**
- ✅ `/student/courses/:courseId/learn` — Course learning (CourseLearning) **← USE THIS FOR LEARNING**
- ✅ `/student/courses/:courseId/learn/:lectureId` — Specific lecture (CourseLearning)
- ✅ `/student/courses/:courseId/quiz` — Quiz (Quiz)
- ✅ `/student/profile` — Profile (Profile)

### Instructor Pages
- ✅ `/instructor/dashboard` — Dashboard (InstructorDashboard)
- ✅ `/instructor/courses/new` — Add course (InstructorAddCourse)
- ✅ `/instructor/courses/:courseId/edit` — Edit course (CourseManage)
- ✅ `/instructor/courses/:courseId/lessons` — Manage lessons (LessonManage)
- ✅ `/instructor/courses/:courseId/lectures` — Manage lectures (LectureManage)

### Admin Pages
- ✅ `/admin` — Login (AdminLogin)
- ✅ `/admin-dashboard` — Dashboard (AdminLanding)
- ✅ `/admin/courses/add` — Add course (AddCourse)

---

## DO ✅ and DON'T ❌

| DO ✅ | DON'T ❌ | Reason |
|------|--------|--------|
| `/courses/${id}` | `/course/${id}` | Use plural form for public course view |
| `/student/course/${id}` | `/student/enrolled-course/${id}` | Route doesn't exist; use singular |
| `/student/courses/${id}/learn` | `/student/course-learning/${id}` | Use `/learn` for course learning |
| `/student/course/...` then check enrollment | `/courses/...` for enrolled users | Separate routes for context |

---

## Component Navigation Examples

### CourseCard.jsx
```jsx
// ✅ CORRECT - Link to public course view
<Button as={Link} to={`/courses/${course.id}`}>
  View Details
</Button>
```

### StudentDashboard.jsx
```jsx
// ✅ CORRECT - Continue learning
const handleContinueLearning = (enrollment) => {
  const resume = resumePoints[enrollment.course_id];
  if (resume?.lecture_id) {
    navigate(`/student/courses/${enrollment.course_id}/learn/${resume.lecture_id}`);
  } else {
    navigate(`/student/courses/${enrollment.course_id}/learn`);
  }
};

// ✅ CORRECT - View enrolled course
<Button onClick={() => navigate(`/student/course/${enrollment.course_id}`)}>
  Course Details
</Button>
```

### MyEnrolledCourses.jsx
```jsx
// ✅ CORRECT - Learning page
<Button onClick={() => navigate(`/student/courses/${course.id}/learn`)}>
  Watch Lectures
</Button>

// ✅ CORRECT - Course details
<Button onClick={() => navigate(`/student/course/${course.id}`)}>
  Details
</Button>
```

### ResultPage.jsx
```jsx
// ✅ CORRECT - Back to course after quiz
{courseId && (
  <Button as={Link} to={`/courses/${courseId}`}>
    Back to Course
  </Button>
)}
```

---

## Parameter Extraction in Components

```jsx
import { useParams } from 'react-router-dom';

export default function CourseDetail() {
  const { courseId } = useParams(); // ✅ Matches ":courseId" in route definition
  
  useEffect(() => {
    // Fetch course using courseId
    fetchCourse(courseId);
  }, [courseId]);
}
```

---

## Error Handling Pattern

```jsx
function CourseDetail() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourse(courseId);
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // ✅ Show loading spinner
  if (loading) return <Spinner />;

  // ✅ Show error with fallback
  if (error) return (
    <Alert variant="danger">
      <p>{error}</p>
      <Button onClick={() => navigate('/catalog')}>
        Browse Other Courses
      </Button>
    </Alert>
  );

  // ✅ Show course not found (friendly message)
  if (!course) return (
    <Alert variant="warning">
      <h4>Course not found</h4>
      <Button onClick={() => navigate('/catalog')}>
        Browse Available Courses
      </Button>
    </Alert>
  );

  // ✅ Render course
  return <CourseContent course={course} />;
}
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Wrong Route Path
```jsx
// WRONG - No route defined for this path
navigate(`/student/enrolled-course/${courseId}`);

// CORRECT
navigate(`/student/course/${courseId}`);
```

### ❌ Mistake 2: Singular vs Plural
```jsx
// WRONG - /course/ doesn't exist
<Link to={`/course/${id}`}>Back</Link>

// CORRECT - use /courses/
<Link to={`/courses/${id}`}>Back</Link>
```

### ❌ Mistake 3: Missing Parameter Name
```jsx
// WRONG - Parameter doesn't match route definition
const { id } = useParams(); // Route is "/course/:courseId"

// CORRECT
const { courseId } = useParams();
```

### ❌ Mistake 4: Incorrect Context
```jsx
// WRONG - Using public route for enrolled course
// Student should see /student/course/ not /courses/
navigate(`/courses/${courseId}`); // Public view

// CORRECT
navigate(`/student/course/${courseId}`); // Enrolled view
```

---

## Testing Navigation

Test each route in browser console:
```javascript
// Test public course view
window.location.href = '/courses/123';

// Test student course view
window.location.href = '/student/course/123';

// Test learning page
window.location.href = '/student/courses/123/learn';

// Test with specific lecture
window.location.href = '/student/courses/123/learn/456';
```

---

## Migration Guide

If you find old code like this:

```jsx
// OLD ❌
navigate(`/student/enrolled-course/${id}`);
navigate(`/course/${id}`);
navigate(`/student/lesson-player/${courseId}/${lectureId}`);
```

Replace with:

```jsx
// NEW ✅
navigate(`/student/course/${id}`);
navigate(`/courses/${id}`);
navigate(`/student/courses/${courseId}/learn/${lectureId}`);
```

---

## Commands for Finding Old Routes

Search in your IDE:
```
Find: /student/enrolled-course/
Find: /course/$ (singular)
Find: /student/lesson-player/
Find: /course-details/
```

Replace all with the correct paths above.

---

## Related Files
- [App.jsx](./src/App.jsx) — Main route definitions
- [ROUTING_FIX_SUMMARY.md](./ROUTING_FIX_SUMMARY.md) — Detailed fix information
- [CourseDetail.jsx](./src/routes/Public/CourseDetail.jsx) — Error handling example
- [StudentDashboard.jsx](./src/components/StudentDashboard.jsx) — Navigation examples

---

*Last Updated: 2025-04-01*  
*Status: ✅ Complete - All routing issues resolved*
