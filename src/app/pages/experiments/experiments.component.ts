import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AesService } from '../../services/aes.service';
import { DesService } from '../../services/des.service';
import { KuznechikService } from '../../services/kuznechik.service';
import { AesPanelComponent } from '../../components/aes-panel/aes-panel.component';
import { DesPanelComponent } from '../../components/des-panel/des-panel.component';
import { KuznechikPanelComponent } from '../../components/kuznechik-panel/kuznechik-panel.component';

@Component({
  selector: 'app-experiments',
  standalone: true,
  imports: [
    FormsModule, RouterLink, NgIf, NgFor,
    AesPanelComponent, DesPanelComponent, KuznechikPanelComponent
  ],
  templateUrl: './experiments.component.html',
  styleUrls: ['./experiments.component.css']
})
export class ExperimentsComponent {
  
  testText: string = 'hello';
  testKey: string = '13456';
  testMode: string = 'ECB';
  
  activeTab: string = 'all';
  
  results: Array<{ name: string; time: number; opsPerSec: number; color: string }> = [];
  avalancheResults: Array<{ name: string; changed: number; total: number; percent: number; isGood: boolean }> = [];
  
  maxOpsPerSec: number = 1;

  constructor(
    private aesService: AesService,
    private desService: DesService,
    private kuznechikService: KuznechikService
  ) {}

  runAllTests(): void {
    this.results = [];
    this.avalancheResults = [];
    
    const text = this.testText || 'hello';
    const key = this.testKey || '13456';
    const mode = 'ECB';
    const iterations = 1000;
    
    // ===== AES =====
    const aesStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.aesService.encrypt(text, key, mode);
    }
    const aesTime = performance.now() - aesStart;
    
    this.results.push({
      name: 'AES',
      time: aesTime,
      opsPerSec: iterations / (aesTime / 1000),
      color: '#3b82f6'
    });
    
    // Лавина AES
    const aesOrig = this.aesService.getFullEncryptionBits(text, key);
    const aesMut = this.aesService.getFullEncryptionBits(this.flipOneBit(text), key);
    let aesDiff = 0;
    for (let i = 0; i < 128; i++) { if (aesOrig[i] !== aesMut[i]) aesDiff++; }
    this.avalancheResults.push({
      name: 'AES',
      changed: aesDiff,
      total: 128,
      percent: parseFloat((aesDiff / 128 * 100).toFixed(1)),
      isGood: aesDiff >= 60 && aesDiff <= 68
    });
    
    // ===== DES =====
    const desStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.desService.encrypt(text, key, mode);
    }
    const desTime = performance.now() - desStart;
    
    this.results.push({
      name: 'DES',
      time: desTime,
      opsPerSec: iterations / (desTime / 1000),
      color: '#f59e0b'
    });
    
    // Лавина DES
    const desOrig = this.desService.getFullEncryptionBits(text, key);
    const desMut = this.desService.getFullEncryptionBits(this.flipOneBit(text), key);
    console.log('DES orig bits:', desOrig.length, desOrig.join(''));
    console.log('DES mut bits:', desMut.length, desMut.join(''));
    let desDiff = 0;
    for (let i = 0; i < 64; i++) { if (desOrig[i] !== desMut[i]) desDiff++; }
    this.avalancheResults.push({
      name: 'DES',
      changed: desDiff,
      total: 64,
      percent: parseFloat((desDiff / 64 * 100).toFixed(1)),
      isGood: desDiff >= 26 && desDiff <= 38
    });
    
    // ===== КУЗНЕЧИК =====
    const kuzKey = key.padEnd(64, '0').slice(0, 64);
    const kuzStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.kuznechikService.encrypt(text, kuzKey, mode);
    }
    const kuzTime = performance.now() - kuzStart;
    
    this.results.push({
      name: 'Кузнечик',
      time: kuzTime,
      opsPerSec: iterations / (kuzTime / 1000),
      color: '#10b981'
    });
    
    // Лавина Кузнечик
    const kuzOrig = this.kuznechikService.getFullEncryptionBits(text, kuzKey);
    const kuzMut = this.kuznechikService.getFullEncryptionBits(this.flipOneBit(text), kuzKey);
    let kuzDiff = 0;
    for (let i = 0; i < 128; i++) { if (kuzOrig[i] !== kuzMut[i]) kuzDiff++; }
    this.avalancheResults.push({
      name: 'Кузнечик',
      changed: kuzDiff,
      total: 128,
      percent: parseFloat((kuzDiff / 128 * 100).toFixed(1)),
      isGood: kuzDiff >= 58 && kuzDiff <= 70
    });
    
    // Сортировка по времени
    this.results.sort((a, b) => a.time - b.time);
    this.maxOpsPerSec = Math.max(...this.results.map(r => r.opsPerSec));
  }

  private flipOneBit(text: string): string {
    if (!text) return 'a';
    const cc = text.charCodeAt(0) ^ 1;
    return String.fromCharCode(cc) + text.substring(1);
  }

  get hasResults(): boolean {
    return this.results.length > 0;
  }

  getBestName(): string {
    if (this.results.length === 0) return '';
    return this.results[0].name;
  }

  getBestOps(): string {
    if (this.results.length === 0) return '';
    return this.results[0].opsPerSec.toFixed(0);
  }

  getAesOps(): string {
    const aes = this.results.find(r => r.name === 'AES');
    return aes ? aes.opsPerSec.toFixed(0) : '0';
  }

  getDesOps(): string {
    const des = this.results.find(r => r.name === 'DES');
    return des ? des.opsPerSec.toFixed(0) : '0';
  }

  getKuzOps(): string {
    const kuz = this.results.find(r => r.name === 'Кузнечик');
    return kuz ? kuz.opsPerSec.toFixed(0) : '0';
  }

  getMaxOps(): number {
    const aes = parseFloat(this.getAesOps()) || 0;
    const des = parseFloat(this.getDesOps()) || 0;
    const kuz = parseFloat(this.getKuzOps()) || 0;
    return Math.max(aes, des, kuz, 1);
  }


  getAvalanchePercent(name: string): string {
  const r = this.avalancheResults.find(a => a.name === name);
  return r ? r.percent.toFixed(1) : '-';
}

getAvalancheColor(percent: number): string {
  if (percent >= 45 && percent <= 55) return '#22c55e';  // зелёный — отлично
  if (percent >= 40 && percent <= 60) return '#f59e0b';  // жёлтый — приемлемо
  return '#ef4444';  // красный — отклонение
}

benchIterations: number = 1000;
benchResults: Array<{ name: string; time: number; opsPerSec: number; color: string }> = [];
maxBenchOps: number = 1;

runBenchmark(): void {
  this.benchResults = [];
  const text = this.testText || 'hello';
  const key = this.testKey || '13456';
  const iterations = this.benchIterations || 1000;

  // AES
  const aesStart = performance.now();
  for (let i = 0; i < iterations; i++) this.aesService.encrypt(text, key, 'ECB');
  const aesTime = performance.now() - aesStart;
  this.benchResults.push({
    name: 'AES', time: aesTime,
    opsPerSec: iterations / (aesTime / 1000), color: '#3b82f6'
  });

  // DES
  const desStart = performance.now();
  for (let i = 0; i < iterations; i++) this.desService.encrypt(text, key, 'ECB');
  const desTime = performance.now() - desStart;
  this.benchResults.push({
    name: 'DES', time: desTime,
    opsPerSec: iterations / (desTime / 1000), color: '#f59e0b'
  });

  // Кузнечик
  const kuzKey = key.padEnd(64, '0').slice(0, 64);
  const kuzStart = performance.now();
  for (let i = 0; i < iterations; i++) this.kuznechikService.encrypt(text, kuzKey, 'ECB');
  const kuzTime = performance.now() - kuzStart;
  this.benchResults.push({
    name: 'Кузнечик', time: kuzTime,
    opsPerSec: iterations / (kuzTime / 1000), color: '#10b981'
  });

  this.maxBenchOps = Math.max(...this.benchResults.map(r => r.opsPerSec));
}
}