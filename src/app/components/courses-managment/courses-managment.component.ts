import { Component, Output, EventEmitter, Input, OnInit, signal, ViewChild, TemplateRef } from '@angular/core';
import { Course } from '../../model/course.model';
import { CourseService } from '../../service/course.service';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // הוסף ייבוא זה
import { AuthService } from '../../service/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LessonsManagmentComponent } from '../lessons-managment/lessons-managment.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-courses-managment',
  standalone: true,
  imports: [LessonsManagmentComponent, MatProgressSpinnerModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, NgFor, NgIf, MatDialogModule, MatTooltipModule],
  templateUrl: './courses-managment.component.html',
  styleUrl: './courses-managment.component.css'
})
export class CoursesManagmentComponent implements OnInit {

  isAddCourseVisible: boolean = false;
  isEditCourseVisible: boolean = false;
  addCourseForm: FormGroup;
  editCourseForm: FormGroup;
  selectedCourseId: number | null | undefined = null;
  openedCourseIds: number[] = [];
  myCourses = signal<Course[]>([]);
  isLoadingCourses = true;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;

  constructor(private courseService: CourseService, private fb: FormBuilder, private authService: AuthService, private dialog: MatDialog) {
    this.addCourseForm = this.editCourseForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
    });
    this.editCourseForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      teacherId: [this.authService.getUserId()],
    });
  }

  ngOnInit() {
    this.loadCourses();
  }


  loadCourses(): void {
    this.isLoadingCourses = true; // מתחילים טעינה
    console.log('userId:', this.authService.getUserId());
    this.courseService.getAll().subscribe({
      next: courses => {
        const filtered = courses.filter(course => course.teacherId === this.authService.getUserId());
        this.myCourses.set(filtered);
        console.log('myCourses:', this.myCourses());
        this.isLoadingCourses = false; // סיימנו טעינה
      },
      error: () => {
        this.myCourses.set([]);
        this.isLoadingCourses = false; // גם בשגיאה מסיימים טעינה
      }
    });
  }

  //חץ לפתיחה או סגירת קורס
  toggleCourseLessons(courseId: number) {
    const idx = this.openedCourseIds.indexOf(courseId);
    if (idx > -1) {
      // כבר פתוח – נסגור
      this.openedCourseIds.splice(idx, 1);
    } else {
      // לא פתוח – נפתח
      this.openedCourseIds.push(courseId);
    }
  }

  //הוספת קורס חדש
  addCourse(): void {
    if (this.addCourseForm.valid) {
      const courseData = {
        title: this.addCourseForm.get('title')?.value,
        description: this.addCourseForm.get('description')?.value || '',
      };

      this.courseService.add(courseData).subscribe({
        next: (response: any) => {
          console.log('הקורס נוסף בהצלחה', response);
          this.isAddCourseVisible = false;
          this.addCourseForm.reset();
          const newCourseId = response.courseId;

          this.courseService.getById(newCourseId).subscribe(fullCourse => {

            this.myCourses.update(courses => [...courses, fullCourse]);
            /* this.courseAdded.emit(fullCourse);*/
          })
        },
        error: (error: any) => {
          console.error('שגיאה בהוספת הקורס', error);
        }
      });
    }
  }

  //עדכון קורס
  updateCourse(): void {
    if (this.editCourseForm.valid && this.selectedCourseId) {
      const updatedCourseData = {
        ...this.editCourseForm.value,
        teacherId: this.authService.getUserId()
      };

      this.courseService.update(this.selectedCourseId, updatedCourseData).subscribe({
        next: (response) => {
          console.log('הקורס עודכן בהצלחה', response);
          // קבל את הקורס המעודכן מהשרת
          this.courseService.getById(this.selectedCourseId!).subscribe({
            next: (updatedFullCourse: Course) => {
              // עדכן את הרשימה ב-signal
              this.myCourses.update(courses =>
                courses.map(course =>
                  course.id === this.selectedCourseId ? updatedFullCourse : course
                )
              );
              /* this.courseUpdate.emit(updatedFullCourse);*/
              this.isEditCourseVisible = false;
              this.editCourseForm.reset();
              this.selectedCourseId = null;
            },
            error: (error) => {
              console.error('שגיאה בשליפת הקורס המעודכן', error);
            }
          });
        },
        error: (error) => {
          console.error('שגיאה בעדכון הקורס', error);
        }
      });
    } else {
      console.warn('הטופס לא תקין או לא נבחר קורס לעדכון.');
    }
  }

  //פתיחת מודל עדכון קורס
  openEditModal(courseId: number): void {
    this.selectedCourseId = courseId;
    this.courseService.getById(courseId).subscribe(course => {
      this.editCourseForm.patchValue({
        title: course.title,
        description: course.description
      });
      this.isEditCourseVisible = true;
    });
  }

  //מחיקת קורס
  deleteCourse(): void {
    if (this.selectedCourseId !== null && this.selectedCourseId !== undefined) {
      this.courseService.deleteCourse(this.selectedCourseId).subscribe({
        next: (response) => {
          console.log(`הקורס עם ID ${this.selectedCourseId} נמחק בהצלחה`, response);
          // הסרה מרשימת הקורסים בלי רענון מלא
          this.myCourses.update(courses => courses.filter(course => course.id !== this.selectedCourseId));
          /*this.courseDeleted.emit(this.selectedCourseId); // פליטת ה-ID של הקורס שנמחק*/
          this.selectedCourseId = null;
        },
        error: (error) => {
          console.error(`שגיאה במחיקת הקורס עם ID ${this.selectedCourseId}`, error);
        }
      });
    } else {
      console.warn('לא נבחר קורס למחיקה.');
    }
  }
  //דיאלוג למחיקת קורס
  confirmDeleteCourse(courseId: number): void {
    this.selectedCourseId = courseId;
    const dialogRef = this.dialog.open(this.confirmDeleteDialog, {
      panelClass: 'confirm-delete-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteCourse(); // רק אם המשתמש לחץ "מחק"
      }
      // אם result הוא false (כלומר, המשתמש לחץ "ביטול") – לא קורה כלום
    });
  }
}





