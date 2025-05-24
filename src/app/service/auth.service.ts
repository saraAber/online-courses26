import { HostListener, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, Subscription, fromEvent } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../model/user.model';
import {  Router } from '@angular/router';


interface AuthResponse {
  message: string;
  userId: number;
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient, private router: Router) {
  }

  register(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user)
      .pipe(
        tap((response: AuthResponse) => this.saveToken(response.token)),
        catchError(this.handleError)
      );
  }

  login(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email: user.email, password: user.password })
      .pipe(
        tap((response: AuthResponse) => this.saveToken(response.token)),
        catchError(this.handleError)
      );
  }
  private saveToken(token: string): void {
    console.log('  הטוקן נשמר ')
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    console.log(' getToken הטוקן מה פונקציה :', sessionStorage.getItem('token'));
    return sessionStorage.getItem('token');
  }
  removeToken(): void {
    console.log(' הטוקן נמחק');
    sessionStorage.removeItem('token');
  }


  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const userRoles = this.getRole();
    return userRoles ? userRoles.includes(role) : false;
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // פענוח בסיסי של ה-payload
        return payload?.role;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }
  getUserId(): number  {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // פענוח בסיסי של ה-payload
        return payload?.userId;
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    return 0;
  }
  private handleError(error: HttpErrorResponse): Observable<any> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 400 && error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized.';
      } else if (error.status === 404 && error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 500 && error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server returned code ${error.status}, body was: ${error.error}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}