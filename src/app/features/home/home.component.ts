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
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
  ],
})
export class HomeComponent implements OnInit {

  metrics = [
    { value: '100%', label: 'Control de Stock', icon: 'inventory_2' },
    { value: 'Excel & CSV', label: 'Exportación Directa', icon: 'download' },
    { value: 'Atajos ⚡', label: 'Velocidad de Carga', icon: 'keyboard' },
    { value: '24/7', label: 'Disponibilidad Local', icon: 'verified_user' }
  ];

  features = [
    {
      icon: 'store',
      tag: 'Catálogo',
      title: 'Gestión de Productos',
      description: 'Control de artículos con códigos SKU, márgenes de ganancia, precios, marcas y categorías asociadas.',
      buttonText: 'Ver Productos',
      route: '/products'
    },
    {
      icon: 'category',
      tag: 'Organización',
      title: 'Categorías y Familias',
      description: 'Clasifica artículos para agilizar búsquedas, balances de inventario y pedidos de reposición.',
      buttonText: 'Gestionar Categorías',
      route: '/categories'
    },
    {
      icon: 'local_offer',
      tag: 'Marcas',
      title: 'Marcas y Fabricantes',
      description: 'Administra tus proveedores de marcas líderes y filtra catálogos por proveedor oficial.',
      buttonText: 'Gestionar Marcas',
      route: '/brands'
    },
    {
      icon: 'shopping_bag',
      tag: 'Contactos',
      title: 'Proveedores y Compras',
      description: 'Directorio centralizado con información de contacto para pedidos rápidos y reposición eficiente.',
      buttonText: 'Ver Proveedores',
      route: '/suppliers'
    },
    {
      icon: 'people',
      tag: 'Ventas',
      title: 'Cartera de Clientes',
      description: 'Seguimiento de clientes frecuentes, historial de pedidos y datos de contacto rápido.',
      buttonText: 'Ver Clientes',
      route: '/customers'
    },
    {
      icon: 'bolt',
      tag: 'Productividad',
      title: 'Operaciones en Lote',
      description: 'Selección múltiple, eliminación segura con confirmación y exportación compatible con Excel en un clic.',
      buttonText: 'Ir al Dashboard',
      route: '/dashboard'
    }
  ];

  benefits = [
    {
      icon: 'speed',
      title: 'Navegación Ultrarrápida',
      description: 'Usa la barra de atajos de teclado [N] para crear nuevos registros y [/] para enfocar búsquedas al instante.'
    },
    {
      icon: 'shield',
      title: 'Seguridad y Protección',
      description: 'Guardas de cambios sin guardar para que nunca pierdas información valiosa al navegar o cerrar pestañas.'
    },
    {
      icon: 'palette',
      title: 'Modo Claro y Oscuro',
      description: 'Interfaz adaptativa con paleta de alto contraste que descansa tu vista durante largas jornadas de trabajo.'
    }
  ];

  ngOnInit(): void {
  }

}
