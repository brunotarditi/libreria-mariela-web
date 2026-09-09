import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ACCESS_TOKEN } from '@core/constants/constants';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  standalone: true
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');

    if (code) {
      this.http.post<string>(`${environment.api}auth/exchange`, { code }).subscribe({
        next: (res: any) => {
          this.authService.setToken(res.access_token, ACCESS_TOKEN);
          this.router.navigate(['/dashboard']);
        },
        error: () => this.router.navigate(['/auth/login'])
      });
      return;
    }
    this.router.navigate(['/auth/login']);
  }
}
