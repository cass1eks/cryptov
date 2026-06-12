import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Experiment {
  id?: number;
  algorithm: string;
  input: string;
  output: string;
  key_used?: string;
  mode?: string;
  timestamp?: string;
}

export interface AvalancheResult {
  algorithm: string;
  changed_bits: number;
  total_bits: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExperimentService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  saveExperiment(data: Experiment): Observable<{ id: number; success: boolean }> {
    return this.http.post<{ id: number; success: boolean }>(`${this.apiUrl}/experiments`, data);
  }

  getExperiments(limit?: number, algorithm?: string): Observable<Experiment[]> {
    let url = `${this.apiUrl}/experiments`;
    const params = [];
    if (limit) params.push(`limit=${limit}`);
    if (algorithm) params.push(`algorithm=${algorithm}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<Experiment[]>(url);
  }

  saveAvalanche(data: AvalancheResult): Observable<{ id: number; success: boolean }> {
    return this.http.post<{ id: number; success: boolean }>(`${this.apiUrl}/avalanche`, data);
  }

  getAvalancheStats(): Observable<{ algorithm: string; avg_percentage: number; tests_count: number }[]> {
    return this.http.get<{ algorithm: string; avg_percentage: number; tests_count: number }[]>(`${this.apiUrl}/avalanche`);
  }
}