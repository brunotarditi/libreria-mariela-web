import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@layout/header/header.component';
import { SidebarComponent } from '@layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
  ],
})
export class HomeComponent implements OnInit {


  constructor(
    //private storageService: StorageService,
    //private stylesService: StylesService
  ) { }

  ngOnInit(): void {

    this.modeInStorage();
    this.openOrCloseSidebar();
  }

  modeInStorage() {
    // const mode = this.storageService.get('mode');
    // if (mode && mode === 'dark') {
    //   document.body.classList.toggle('dark');
    // }
  }

  openOrCloseSidebar() {
    // if (this.storageService.exist('status')) {
    //   this.status = this.storageService.get('status');
    // }
    // this.stylesService.sidebar$.subscribe({
    //   next: (data: string) => {
    //     this.status = data;
    //     this.storageService.set('status', data);
    //   },
    //   error: (err: string) => console.log(err)
    // })
  }

}
