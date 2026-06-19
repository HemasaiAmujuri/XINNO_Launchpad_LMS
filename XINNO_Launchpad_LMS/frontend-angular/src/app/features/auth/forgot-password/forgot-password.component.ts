import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email) {
      this.error = 'Please enter your email address';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.success = 'Password reset link has been sent to your email';
          this.email = '';
        } else {
          this.error = response.message || 'Failed to send reset link';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || err.error?.message || 'Failed to send reset link';
      }
    });
  }
}
