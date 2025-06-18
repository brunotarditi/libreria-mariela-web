import { Component, OnInit } from '@angular/core';
import { TitleComponent } from '@shared/components/title/title.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [TitleComponent, MatIconModule]
})
export class DashboardComponent implements OnInit {


  ngOnInit(): void {
  }

}
