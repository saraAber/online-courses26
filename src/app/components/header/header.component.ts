import { Component, ViewChild, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthComponent } from '../auth/auth.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../service/auth.service';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatIconModule, AuthComponent, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnDestroy {
  @ViewChild(AuthComponent) authComponent!: AuthComponent;
  isTeacher: boolean = false;
  private roleSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.roleSubscription = this.authService.role$.subscribe(role => {
      this.isTeacher = role === 'teacher';
    });
  }

  ngOnDestroy(): void {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  checkAuthAndNavigate(path: string): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([path]);
    } else {
      this.authComponent.openLoginModal();
    }
  }
}