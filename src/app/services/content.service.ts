import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PageContent {
  [section: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = 'http://localhost:3000/api/content';

  constructor(private http: HttpClient) { }

  // Получить весь контент страницы (ВСЕ секции)
  getPageContent(page: string): Observable<PageContent> {
    return this.http.get<PageContent>(`${this.apiUrl}/${page}`);
  }

  // Получить конкретную секцию
  getSection(page: string, section: string): Observable<{ content: string }> {
    return this.http.get<{ content: string }>(`${this.apiUrl}/${page}/${section}`);
  }
}