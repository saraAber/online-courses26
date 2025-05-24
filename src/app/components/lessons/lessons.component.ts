import { Component, effect, input, signal } from '@angular/core';
import { Lesson } from '../../model/lesson.model';
import { CommonModule } from '@angular/common';
import { LessonService } from '../../service/lesson.service';
import { Course } from '../../model/course.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonsManagmentComponent } from '../lessons-managment/lessons-managment.component';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.css'
})
export class LessonsComponent {
  lessons = signal<Lesson[]>([]);
  courseId!: string;

  constructor(private route: ActivatedRoute, private lessonService: LessonService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId')!;
      if (this.courseId) {
        const courseIdNum = Number(this.courseId); // המרה למספר
        this.lessonService.getAllByCourseId(courseIdNum)
          .subscribe(lessons => this.lessons.set(lessons));
      } else {
        this.lessons.set([]);
      }
    });
  }
}

