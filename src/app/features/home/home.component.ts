import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
  ],
})
export class HomeComponent implements OnInit {

  features = [
    {
      icon: 'store',
      title: 'Crear productos',
      description: 'Agrega nuevos productos al inventario con nombre, código, categoría y marca.',
      buttonText: 'Crear Producto',
      route: '/products/new'
    },
    {
      icon: 'category',
      title: 'Gestionar categorías',
      description: 'Organiza los productos mediante categorías definidas por ti.',
      buttonText: 'Ver Categorías',
      route: '/categories'
    },
    {
      icon: 'local_offer',
      title: 'Gestionar marcas',
      description: 'Agrega y administra marcas asociadas a tus productos.',
      buttonText: 'Ver Marcas',
      route: '/brands'
    },
    {
      icon: 'shopping_bag',
      title: 'Gestionar proveedores',
      description: 'Agrega a tus proveedores.',
      buttonText: 'Ver Proveedores',
      route: '/suppliers'
    }
  ];


  ngOnInit(): void {
  }

}
