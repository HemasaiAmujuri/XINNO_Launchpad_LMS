import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  currentUser: User | null = null;
  
  // UI state
  darkMode = false;
  period: 'Month' | 'Quarter' | 'Year' = 'Month';
  dateRange = { from: new Date().toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) };
  isMobileSidebarOpen = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u || null);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    if (this.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }

  setPeriod(p: 'Month' | 'Quarter' | 'Year'){
    this.period = p;
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  exportData(){
    const csv = 'metric,value\nTotal Contacts,5758\nActive Deals,1249\nRevenue,256054.50\nLead Analytics,70\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
