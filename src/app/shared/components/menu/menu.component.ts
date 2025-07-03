import { Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ListItem } from '@shared/models/list_item';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  imports: [MatIconModule, RouterLink],
})
export class MenuComponent {

  typeMode = input<boolean>(true);
  iconMode = input<string>();
  textMode = input<string>();
  isClosed = input<boolean>(false);
  listItems = input<ListItem[]>();

  changeMode = output<boolean>()

  private authService = inject(AuthService);

  toggleTheme() {
    this.changeMode.emit(this.typeMode());
  }

  logOut(){
    this.authService.logOut();
  }

}
