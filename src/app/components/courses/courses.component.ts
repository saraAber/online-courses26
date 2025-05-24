import { Component, OnInit, signal } from '@angular/core';
import { Course } from '../../model/course.model';
import { CourseService } from '../../service/course.service';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { AnimationOptions } from 'ngx-lottie';
import { LottieComponent } from 'ngx-lottie'; // ייבוא LottieComponent
import { Router, RouterModule } from '@angular/router'; // ייבוא Router





@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [ CommonModule, NgIf ,RouterModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})

export class CoursesComponent implements OnInit {
  constructor(private courseService: CourseService, private authService: AuthService, private router: Router) { }
  courses = signal<Course[]>([]);
  registeredCourses: Course[] = [];
  selectedCourse = signal<Course | null>(null);
  isLoading: boolean = true;

gearsOptions: AnimationOptions = {
  path: '/engine-tool-shape.json'
};

  ngOnInit(): void {
    this.isLoading = true;
    this.loadRegisteredCourses();
    this.loadAllCourses();
  }

  loadAllCourses(): void {
    this.courseService.getAll().subscribe(courses => {
      this.courses.set(courses);
    });
  }

  loadRegisteredCourses(): void {
    this.courseService.getByStudentId(this.authService.getUserId()).subscribe(
      courses => {
        this.registeredCourses = courses;
        this.isLoading = false;
      });
  }

  isRegistered(courseId: number): boolean {
    return this.registeredCourses.some(c => c.id === courseId);
  }

  enrollInCourse(courseId: number): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.courseService.enrollStudentInCourse(courseId, userId).subscribe({
        next: () => {
          console.log(`המשתמש ${userId} נרשם לקורס ${courseId} בהצלחה`);
          this.loadRegisteredCourses(); // רענון רשימת הקורסים הרשומים
        },
        error: (error) => {
          console.error(`שגיאה בהרשמה לקורס ${courseId}`, error);
        }
      });
    } else {
      console.warn('לא ניתן להירשם לקורס: מזהה משתמש לא זמין');
    }
  }

  unenrollFromCourse(courseId: number): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.courseService.unenrollStudentFromCourse(courseId, userId).subscribe({
        next: () => {
          console.log(`המשתמש ${userId} הוסר מהקורס ${courseId} בהצלחה`);
          this.loadRegisteredCourses(); // רענון רשימת הקורסים הרשומים
        },
        error: (error) => {
          console.error(`שגיאה בהסרה מהקורס ${courseId}`, error);
        }
      });
    } else {
      console.warn('לא ניתן לבטל הרשמה מהקורס: מזהה משתמש לא זמין');
    }
  }
}