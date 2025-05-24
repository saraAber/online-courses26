import { Component, Output, EventEmitter, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Lesson } from '../../model/lesson.model';
import { LessonService } from '../../service/lesson.service';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-lessons-managment',
  standalone: true,
  imports: [MatDialogModule, NgIf, NgFor, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './lessons-managment.component.html',
  styleUrl: './lessons-managment.component.css'
})
export class LessonsManagmentComponent {
  @Input() courseId!: number;
  @ViewChild('deleteLessonDialog') deleteLessonDialog!: TemplateRef<any>;
  lessons: Lesson[] = [];
  isAddLessonVisible: boolean = false;
  isEditLessonVisible: boolean = false;
  addLessonForm: FormGroup;
  editLessonForm: FormGroup;
  lessonToEditId: number | null = null;
  lessonIdToDelete: number | null = null;

  constructor(private lessonService: LessonService, private fb: FormBuilder, private dialog: MatDialog) {
    this.addLessonForm = this.editLessonForm = this.fb.group({
      title: ['', Validators.required],
      content: ['']
    });
    this.editLessonForm = this.fb.group({
      title: ['', Validators.required],
      content: ['']
    });
  }

  ngOnInit(): void {
    this.loadLessons();
  }

  loadLessons(): void {
    if (this.courseId) {
      this.lessonService.getAllByCourseId(this.courseId).subscribe({
        next: (lessons: Lesson[]) => this.lessons = lessons,
        error: (err: any) => console.error('שגיאה בטעינת שיעורים', err)
      });
    }
  }

  // הוספת שיעור חדש
  addLesson(): void {
    if (this.addLessonForm.valid && this.courseId) {
      console.log('valid')
      const lessonData = {
        title: this.addLessonForm.get('title')?.value,
        content: this.addLessonForm.get('content')?.value || '',
      };
      this.lessonService.add(this.courseId, lessonData).subscribe({
        next: (response: any) => {
          console.log('השיעור נוסף בהצלחה', response);
          this.isAddLessonVisible = false;
          this.addLessonForm.reset();
          const newLessonId = response.lessonId;
          // כעת, נבקש את פרטי השיעור המלאים לפי ה-ID
          this.lessonService.getById(this.courseId ? this.courseId : -1, newLessonId).subscribe(fullLesson => {
            this.lessons = [...this.lessons, fullLesson];
          })
        },
        error: (error: any) => {
          console.error('שגיאה בהוספת השיעור ', error);
        }
      });
    }
  }

  // פתיחת מודל עריכה
  openEditLessonModal(lesson: Lesson) {
    this.lessonToEditId = lesson.id!;
    this.editLessonForm.patchValue({
      title: lesson.title,
      content: lesson.content
    });
    this.isEditLessonVisible = true;
  }

  // עדכון שיעור
  updateLesson() {
    if (this.editLessonForm.valid && this.lessonToEditId && this.courseId) {
      const updatedLesson = {
        title: this.editLessonForm.get('title')?.value,
        content: this.editLessonForm.get('content')?.value || '',
        courseId: this.courseId
      };
      this.lessonService.update(this.courseId, this.lessonToEditId, updatedLesson).subscribe({
        next: () => {
          // עדכון ברשימה המקומית
          const idx = this.lessons.findIndex(l => l.id === this.lessonToEditId);
          if (idx > -1) {
            this.lessons[idx] = { ...this.lessons[idx], ...updatedLesson };
          }
          this.isEditLessonVisible = false;
          this.editLessonForm.reset();
        },
        error: err => {
          console.error('שגיאה בעדכון שיעור', err);
        }
      });
    }
  }

  //מחיקת שיעור
  deleteLesson(lessonId?: number): void {
    console.log('deleteLesson')
    if (!this.courseId || lessonId === undefined) return;
    this.lessonService.delete(this.courseId, lessonId).subscribe({
      next: () => {
        this.lessons = this.lessons.filter(lesson => lesson.id !== lessonId);
      },
      error: err => {
        console.error('שגיאה במחיקת שיעור', err);
      }
    });
  }

  //דיאלוג לפני מחיקה
  openDeleteLessonDialog(lessonId: number): void {
    this.lessonIdToDelete = lessonId;
    const dialogRef = this.dialog.open(this.deleteLessonDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.lessonIdToDelete !== null) {
        this.deleteLesson(this.lessonIdToDelete);
      }
      this.lessonIdToDelete = null;
    });
  }
}


