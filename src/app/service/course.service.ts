import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course,CourseUpdate } from '../model/course.model';
import { AuthService } from './auth.service';
import { courseData } from '../model/course.model';
@Injectable({
  providedIn: 'root',
})
export class CourseService {

  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient, private authService: AuthService) { }

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

  getAll(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getByStudentId(studentId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/student/${studentId}`, { headers: this.getAuthHeaders() });
  }

  add(courseData: courseData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, courseData, { headers: this.getAuthHeaders() });
  }

  update(courseId:number,updateCourse:CourseUpdate): Observable<any> {
    return this.http.put(`${this.apiUrl}/${courseId}`,updateCourse,{headers: this.getAuthHeaders()})
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}`, { headers: this.getAuthHeaders() });
  }

  enrollStudentInCourse(courseId: number, userId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${courseId}/enroll`,
      { userId },
      { headers: this.getAuthHeaders() }
    );
  }

  unenrollStudentFromCourse(courseId: number, userId: number): Observable<any> {
    const options = {
      headers: this.getAuthHeaders(),
      body: { userId }
    };
    return this.http.delete(`${this.apiUrl}/${courseId}/unenroll`, options);
  }
}