import { Component, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthComponent } from '../auth/auth.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../service/auth.service';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatIconModule, AuthComponent, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @ViewChild(AuthComponent) authComponent!: AuthComponent;
  isTeacher: boolean = false;
  constructor(private authService: AuthService, private router: Router) { }
  ngOnInit(): void {
    this.checkUserRole();
  }
  checkUserRole(): void {
    const role = this.authService.getRole();
    this.isTeacher = role === 'teacher';
  }
    checkAuthAndNavigate(path: string): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([path]);
    } else {
      this.authComponent.openLoginModal();
    }
  }
}