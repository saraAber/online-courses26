import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  @ViewChild('registerModalTemplate') registerModalTemplate!: TemplateRef<any>;
  @ViewChild('loginModalTemplate') loginModalTemplate!: TemplateRef<any>;

  registerForm: FormGroup;
  loginForm: FormGroup;
  errorMessageRegister: string = '';
  errorMessageLogin: string = '';
  registerDialogRef!: MatDialogRef<any>;
  loginDialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'register') {
        this.openRegisterModal();
      } else if (fragment === 'login') {
        this.openLoginModal();
      }
    });

  }

  openRegisterModal() {
    this.router.navigate(['/register']);
    this.registerDialogRef = this.dialog.open(this.registerModalTemplate, {});
    this.registerDialogRef.afterClosed().subscribe(result => {
      console.log('Register dialog closed', result);
      this.registerForm.reset();
      this.errorMessageRegister = '';
    });
  }

  registerUser() {
    if (this.registerForm.valid) {
      const userData = this.registerForm.value;
      this.authService.register(userData).subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          this.registerDialogRef.close(response);
        },
        error: (error: any) => {
          this.errorMessageRegister = error.error.message || 'שגיאה בהרשמה.';
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  openLoginModal() {
    this.router.navigate(['/login']);
    this.loginDialogRef = this.dialog.open(this.loginModalTemplate, {

    });

    this.loginDialogRef.afterClosed().subscribe(result => {
      console.log('Login dialog closed', result);
      this.loginForm.reset();
      this.errorMessageLogin = '';
    });
  }

  loginUser() {
    if (this.loginForm.valid) {
      const userData = this.loginForm.value;
      this.authService.login(userData).subscribe({
        next: (response: any) => {
          console.log('Login successful:', response);
          this.loginDialogRef.close(response);
          this.router.navigate(['/courses']); // דוגמה לניווט לאחר התחברות
        },
        error: (error: any) => {
          this.errorMessageLogin = error.error.message || 'שגיאה בהתחברות.';
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}