import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TheoryService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAlgorithms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/algorithms`);
  }

  getTheory(algorithm: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/theory/${algorithm}`);
  }

  getTheorySection(algorithm: string, section: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/theory/${algorithm}/${section}`);
  }

  getSBox(algorithm: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sbox/${algorithm}`);
  }
}