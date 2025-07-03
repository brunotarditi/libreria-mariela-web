import { Component, inject, OnInit, signal } from '@angular/core';
import { TitleComponent } from '@shared/components/title/title.component';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../services/dashboard.service';
import { Dashboard } from '../models/dashboard';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, TitleComponent, MatIconModule]
})
export class DashboardComponent implements OnInit {

  private dashboardService = inject(DashboardService)
  dashboard = signal<Dashboard | null>(null);
  ngOnInit(): void {

    this.dashboardService.getData().subscribe({
      next: (res) => {
        this.dashboard.set(res)
      },
      error: (err) => console.error(err)
    })
  }

}
