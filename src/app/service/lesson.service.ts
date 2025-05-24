import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { lessonData } from '../model/lesson.model';

interface Lesson {
  id?: number;
  title: string;
  content: string;
  courseId?: number; // ה-courseId יהיה חלק מה-URL
}

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private baseUrl = 'http://localhost:3000/api/courses'; // בסיס ה-URL של הקורסים

  constructor(private http: HttpClient,private authService:AuthService) { }

 private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token!=null) { // בודק אם הטוקן קיים (לא undefined ולא null ולא מחרוזת ריקה)
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // קבלת כל השיעורים בקורס מסוים
  getAllByCourseId(courseId: number): Observable<Lesson[]> {
    const url = `${this.baseUrl}/${courseId}/lessons`;
    return this.http.get<Lesson[]>(url, { headers: this.getAuthHeaders() });
  }

  // קבלת שיעור ספציפי לפי ID
  getById(courseId: number, lessonId: number): Observable<Lesson> {
    const url = `${this.baseUrl}/${courseId}/lessons/${lessonId}`;
    return this.http.get<Lesson>(url, { headers: this.getAuthHeaders() });
  }

  // יצירת שיעור חדש
  add(courseId: number, lessonData: { title: string; content: string }): Observable<any> {
    const url = `${this.baseUrl}/${courseId}/lessons`;
    return this.http.post(url, lessonData, { headers: this.getAuthHeaders() });
  }

  // עדכון שיעור קיים
  update(courseId: number, lessonId: number, lessonData:lessonData): Observable<any> {
    const url = `${this.baseUrl}/${courseId}/lessons/${lessonId}`;
    return this.http.put(url, lessonData, { headers: this.getAuthHeaders() });
  }

  // מחיקת שיעור
  delete(courseId: number, lessonId: number): Observable<any> {
    const url = `${this.baseUrl}/${courseId}/lessons/${lessonId}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }
}