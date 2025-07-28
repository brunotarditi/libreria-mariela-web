import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Item } from '@shared/models/item';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  imports: [MatIconModule, MatTooltipModule, RouterLink],
})
export class MenuComponent {

  typeMode = input<boolean>(true);
  iconMode = input<string>();
  textMode = input<string>();
  isClosed = input<boolean>(false);
  listItems = input<Item[]>();

  changeMode = output<boolean>()

  private authService = inject(AuthService);

  filterItems = computed(() => {
    if (!this.listItems()) {
      return [];
    }
    const userRoles = this.authService.roles;
    return this.listItems()?.filter(item => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) {
          return true;
        }
        return item.allowedRoles.some(role => userRoles.includes(role));
    })

  });

  toggleTheme() {
    this.changeMode.emit(this.typeMode());
  }

  logOut(){
    this.authService.logOut();
  }

}
