import { getRecommendedCourses, getCourseFilters } from "@/actions/courses";
import CoursesView from "./_components/courses-view";

export default async function CoursesPage() {
  const [{ courses, userContext }, filters] = await Promise.all([
    getRecommendedCourses(),
    getCourseFilters(),
  ]);

  return (
    <div className="container mx-auto py-6">
      <CoursesView
        initialCourses={courses}
        userContext={userContext}
        filters={filters}
      />
    </div>
  );
}
