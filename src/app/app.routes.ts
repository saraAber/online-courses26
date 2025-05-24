import { Routes } from '@angular/router';
import { CoursesComponent } from './components/courses/courses.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './service/auth.guard';
import { LessonsComponent } from './components/lessons/lessons.component';
import { CoursesManagmentComponent } from './components/courses-managment/courses-managment.component';
import { LessonsManagmentComponent } from './components/lessons-managment/lessons-managment.component';
import { AuthComponent } from './components/auth/auth.component';


export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'auth', component: AuthComponent },
    { path: 'courses', component: CoursesComponent, canActivate: [AuthGuard] },
    { path: 'lessons/:courseId', component: LessonsComponent },
    { path: 'Managment', component: CoursesManagmentComponent },
    { path: 'LessonManagment', component: LessonsManagmentComponent }
];
