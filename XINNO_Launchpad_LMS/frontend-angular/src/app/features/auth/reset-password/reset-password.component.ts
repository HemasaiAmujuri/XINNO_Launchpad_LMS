import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.error = 'Invalid or missing reset token';
    }
  }

  onSubmit(): void {
    this.error = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.error = response.message || 'Failed to reset password';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || err.error?.message || 'Failed to reset password';
      }
    });
  }
}
