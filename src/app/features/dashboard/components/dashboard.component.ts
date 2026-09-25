import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TitleComponent } from '@shared/components/title/title.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { Dashboard } from '../models/dashboard';
import { ProductService } from '../../product/service/product.service';
import { ProductData } from '../../product/model/product';
import { CommonModule } from '@angular/common';

export interface ChartItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
  icon?: string;
}

export interface DonutSegment {
  label: string;
  color: string;
  percentage: number;
  dashArray: string;
  dashOffset: number;
}

export type ChartTab = 'categories' | 'brands' | 'activities';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, TitleComponent, MatIconModule, MatButtonModule, MatTooltipModule, RouterLink]
})
export class DashboardComponent implements OnInit {

  private dashboardService = inject(DashboardService);
  private productService = inject(ProductService);

  dashboard = signal<Dashboard | undefined>(undefined);
  products = signal<ProductData[]>([]);
  isLoadingChart = signal<boolean>(true);

  activeTab = signal<ChartTab>('categories');

  // Paleta armónica moderna con soporte dark/light
  private readonly palette = [
    '#239BA7', // Teal principal
    '#3B82F6', // Azul moderno
    '#10B981', // Verde esmeralda
    '#F59E0B', // Ámbar
    '#8B5CF6', // Violeta
    '#EC4899', // Rosa
    '#64748B'  // Neutro/Otras
  ];

  categoryDistribution = computed<ChartItem[]>(() => {
    const list = this.products();
    if (!list.length) return [];
    return this.buildDistribution(list.map(p => p.category_name?.trim() || 'Sin categoría'));
  });

  brandDistribution = computed<ChartItem[]>(() => {
    const list = this.products();
    if (!list.length) return [];
    return this.buildDistribution(list.map(p => p.brand_name?.trim() || 'Sin marca'));
  });

  activityDistribution = computed<ChartItem[]>(() => {
    const acts = this.dashboard()?.recent_activities;
    if (!acts || !acts.length) return [];

    const counts: Record<string, number> = {};
    for (const act of acts) {
      const actionKey = (act.action || 'OTRA').toUpperCase();
      let label = 'Otras acciones';
      if (actionKey.includes('CREATE') || actionKey.includes('CREAR') || actionKey.includes('ALTA')) {
        label = 'Creaciones (Altas)';
      } else if (actionKey.includes('UPDATE') || actionKey.includes('ACTUALIZ') || actionKey.includes('EDIT')) {
        label = 'Actualizaciones';
      } else if (actionKey.includes('DELETE') || actionKey.includes('ELIMIN') || actionKey.includes('BAJA')) {
        label = 'Eliminaciones (Bajas)';
      } else {
        label = act.action || 'Otras';
      }
      counts[label] = (counts[label] || 0) + 1;
    }

    const total = acts.length;
    return Object.entries(counts)
      .map(([label, count], index) => {
        let color = this.palette[index % this.palette.length];
        if (label.includes('Creacion') || label.includes('Altas')) color = '#10B981';
        if (label.includes('Actualiz')) color = '#F59E0B';
        if (label.includes('Elimin') || label.includes('Bajas')) color = '#EF4444';
        return {
          label,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          color,
          icon: label.includes('Creacion') ? 'add_circle' : label.includes('Actualiz') ? 'edit' : 'delete'
        };
      })
      .sort((a, b) => b.count - a.count);
  });

  // KPIs de resumen
  topCategory = computed<string>(() => {
    const cats = this.categoryDistribution();
    return cats.length ? `${cats[0].label} (${cats[0].percentage}%)` : 'Sin datos';
  });

  topBrand = computed<string>(() => {
    const brands = this.brandDistribution();
    return brands.length ? `${brands[0].label} (${brands[0].percentage}%)` : 'Sin datos';
  });

  totalCategoriesCount = computed<number>(() => {
    const set = new Set(this.products().map(p => p.category_name?.trim() || 'Sin categoría'));
    return set.size;
  });

  totalBrandsCount = computed<number>(() => {
    const set = new Set(this.products().map(p => p.brand_name?.trim() || 'Sin marca'));
    return set.size;
  });

  currentChartItems = computed<ChartItem[]>(() => {
    switch (this.activeTab()) {
      case 'categories':
        return this.categoryDistribution();
      case 'brands':
        return this.brandDistribution();
      case 'activities':
        return this.activityDistribution();
    }
  });

  donutSegments = computed<DonutSegment[]>(() => {
    const items = this.currentChartItems();
    if (!items.length) return [];

    let accumulated = 0;
    return items.map(item => {
      const seg: DonutSegment = {
        label: item.label,
        color: item.color,
        percentage: item.percentage,
        dashArray: `${item.percentage} ${100 - item.percentage}`,
        dashOffset: 25 - accumulated
      };
      accumulated += item.percentage;
      return seg;
    });
  });

  ngOnInit(): void {
    this.dashboardService.getData().subscribe({
      next: (res) => {
        this.dashboard.set(res ?? { recent_activities: [] });
      },
      error: (err) => console.error(err)
    });

    this.productService.getAll().subscribe({
      next: (prods) => {
        this.products.set(prods || []);
        this.isLoadingChart.set(false);
      },
      error: (err) => {
        console.error('Error cargando productos para analítica:', err);
        this.isLoadingChart.set(false);
      }
    });
  }

  setTab(tab: ChartTab): void {
    this.activeTab.set(tab);
  }

  private buildDistribution(items: string[]): ChartItem[] {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item] = (counts[item] || 0) + 1;
    }

    const total = items.length;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    const maxItems = 5;
    const result: ChartItem[] = [];

    const topEntries = sorted.slice(0, maxItems);
    topEntries.forEach(([label, count], index) => {
      result.push({
        label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: this.palette[index % this.palette.length]
      });
    });

    if (sorted.length > maxItems) {
      const restCount = sorted.slice(maxItems).reduce((acc, curr) => acc + curr[1], 0);
      result.push({
        label: 'Otras',
        count: restCount,
        percentage: total > 0 ? Math.round((restCount / total) * 100) : 0,
        color: this.palette[this.palette.length - 1]
      });
    }

    return result;
  }
}
