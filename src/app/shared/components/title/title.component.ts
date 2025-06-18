import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css'],
  imports: [CommonModule, MatIconModule]
})
export class TitleComponent implements OnInit {
  @Input() icon: string = '';
  @Input() title: string = '';
  constructor() { }

  ngOnInit(): void {
  }

}
