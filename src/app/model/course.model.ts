export interface Course {
    id: number;
    title: string;
    description: string;
    teacherId: number;

  }

export interface CourseUpdate {
  title?: string;
  description?: string;
}
export interface courseData{
  title: string, description: string
}

  