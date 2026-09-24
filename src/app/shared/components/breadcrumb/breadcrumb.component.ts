import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
})
export class BreadcrumbComponent {
  breadcrumbs = input<BreadcrumbItem[]>([]);
}
