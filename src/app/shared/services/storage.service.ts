import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  exist(key: string): boolean {
    return sessionStorage.getItem(key) != null;
  };

  set(key: string, data: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.log(e);
    }
  }

  get(key: string): any {
    try {
      return JSON.parse(sessionStorage.getItem(key)!);
    } catch (e) {
      console.log(e);
    }
  }

  clear(key: string): void {
    sessionStorage.removeItem(key);
  }
}
