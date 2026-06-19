// Removed the opening markdown fence
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  currentUser: User | null = null;

  // sample metrics data
  metrics = {
    totalContacts: { value: '5,758', trend: '+2.57%', trendDir: 'up', subtext: 'Vs last month: 1,195', color: 'primary' },
    activeDeals: { value: '1,249', trend: '+2.57%', trendDir: 'up', subtext: 'Vs last month: 1,195', color: 'primary' },
    revenue: { value: '$256,054.50', trend: '+20%', trendDir: 'up', subtext: 'vs last month', color: 'secondary' },
    leadAnalytics: { value: '70', trend: '-2.57%', trendDir: 'down', subtext: 'Compared to Last Month', color: 'danger' }
  };

  // traffic source sample
  traffic = [
    { name: 'Organic Search', value: 41.5, color: 'primary' },
    { name: 'Direct Traffic', value: 27, color: 'secondary' },
    { name: 'Referral Traffic', value: 18, color: 'violet' },
    { name: 'Social Media', value: 10.3, color: 'pink' },
    { name: 'Email Traffic', value: 3.2, color: 'warning' }
  ];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u || null);
  }

  getTrafficColor(color: string): string {
    const colors: {[key: string]: string} = {
      'primary': '#3B82F6',
      'secondary': '#10B981',
      'warning': '#F59E0B',
      'pink': '#ec4899',
      'violet': '#7c3aed'
    };
    return colors[color] || '#94a3b8';
  }
}
