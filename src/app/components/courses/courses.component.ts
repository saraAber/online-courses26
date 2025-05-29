import { Component, OnInit, signal } from '@angular/core';
import { Course } from '../../model/course.model';
import { CourseService } from '../../service/course.service';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { AnimationOptions } from 'ngx-lottie';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon'; // אם את משתמשת באייקונים של Material

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, NgIf, RouterModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  constructor(private courseService: CourseService, private authService: AuthService, private router: Router, private snackBar: MatSnackBar, private sanitizer: DomSanitizer) {
  }
  courses = signal<Course[]>([]);
  registeredCourses: Course[] = [];
  selectedCourse = signal<Course | null>(null);
  isLoading: boolean = true;
  isRefreshingRegisteredCourses: boolean = false;



  ngOnInit(): void {
    this.isLoading = true;
    this.loadInitialData();
  }

  loadInitialData(): void {
    const allCourses$ = this.courseService.getAll();
    const registeredCourses$ = this.courseService.getByStudentId(this.authService.getUserId());

    forkJoin([allCourses$, registeredCourses$]).subscribe({
      next: ([allCourses, registeredCourses]) => {
        this.courses.set(allCourses);
        this.registeredCourses = registeredCourses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('שגיאה בטעינת הקורסים', error);
        this.isLoading = false;
      }
    });
  }

  loadRegisteredCourses(): void {
    this.courseService.getByStudentId(this.authService.getUserId()).subscribe(
      courses => {
        this.registeredCourses = courses;
      }
    );
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
          this.loadRegisteredCourses(); // רענון רק של הקורסים הרשומים
          this.snackBar.open('נרשמת לקורס בהצלחה', '✓', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: 'success-snackbar'
          });
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
          this.loadRegisteredCourses(); // רענון רק של הקורסים הרשומים
          this.snackBar.open('ביטול הרשמה בוצע בהצלחה', '✓', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: 'success-snackbar'
          });
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