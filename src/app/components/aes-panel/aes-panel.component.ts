import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { AesService } from '../../services/aes.service';
import { ExperimentService } from '../../services/experiment.service';

export interface AesRoundStep {
  roundNumber: number;
  inputState: number[][];
  afterSubBytes: number[][];
  afterShiftRows: number[][];
  afterMixColumns?: number[][];
  roundKey: number[][];
  afterAddRoundKey: number[][];
}

@Component({
  selector: 'app-aes-panel',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './aes-panel.component.html',
  styleUrls: ['./aes-panel.component.css']
})
export class AesPanelComponent implements OnInit, OnDestroy {

  text = 'helloww';
  key = '12345678';
  mode = 'CBC';
  keySize: number = 128;
  result = '';
  encryptedText = '';
  finalCiphertext: string = '';
  decryptedResult = '';

  matrix: string[][] = [];

  originalBits: string[] = [];
  mutatedBits: string[] = [];
  diffCount: number = 0;
  showAvalanche = false;
  showScheme = false;
  animationStep = 0;
  mutatedText = '';

  sboxSlice: string[][] = [];

  // Для визуализации лавинного эффекта
  bitMatrix: { value: number; isChanged: boolean; index: number }[][] = [];
  animationTrigger: number = 0;

  // Поля для анимации раундов
  aesRoundsHistory: AesRoundStep[] = [];
  previousAesRoundsHistory: AesRoundStep[] = [];
  changedCells: Map<string, boolean> = new Map();
  
  showAesRounds = false;
  currentAesRound = 0;
  currentAesRoundData: AesRoundStep | null = null;
  aesRoundIndex = 0;
  
  private updateTimeout: any = null;

  // Бенчмарк
  benchmarkIterations: number = 1000;
  benchmarkResults: Array<{ name: string; time: number; opsPerSec: number; color: string }> = [];
  maxBenchmarkTime: number = 1;
  keyExpTime: number = 0;
  showKeyExpResult: boolean = false;

  constructor(
    private aesService: AesService,
    private experimentService: ExperimentService,
    private cdr: ChangeDetectorRef
  ) {
    this.initSBoxSlice();
  }

  ngOnInit(): void {
    this.autoUpdateRounds();
  }

  ngOnDestroy(): void {
    if (this.updateTimeout) clearTimeout(this.updateTimeout);
  }

  // ========== АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ РАУНДОВ ==========
  autoUpdateRounds(): void {
    if (this.updateTimeout) clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      if (this.showAesRounds && this.text && this.key) {
        this.generateAesRoundsWithAnimation();
      }
    }, 300);
  }

  generateAesRoundsWithAnimation(): void {
    if (this.aesRoundsHistory.length > 0) {
      this.previousAesRoundsHistory = JSON.parse(JSON.stringify(this.aesRoundsHistory));
    }
    this.generateAesRounds();
    this.detectChangedCells();
    this.cdr.detectChanges();
    setTimeout(() => {
      this.changedCells.clear();
      this.cdr.detectChanges();
    }, 500);
  }

  detectChangedCells(): void {
    if (!this.previousAesRoundsHistory.length || !this.aesRoundsHistory.length) return;
    this.changedCells.clear();
    const currentRound = this.aesRoundsHistory[this.aesRoundIndex];
    const previousRound = this.previousAesRoundsHistory[this.aesRoundIndex];
    if (!currentRound || !previousRound) return;
    
    const compareMatrices = (prev: number[][], curr: number[][], stepName: string) => {
      if (!prev || !curr) return;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (prev[row]?.[col] !== curr[row]?.[col]) {
            this.changedCells.set(`${stepName}_${row}_${col}`, true);
          }
        }
      }
    };
    
    compareMatrices(previousRound.inputState, currentRound.inputState, 'input');
    compareMatrices(previousRound.afterSubBytes, currentRound.afterSubBytes, 'subbytes');
    compareMatrices(previousRound.afterShiftRows, currentRound.afterShiftRows, 'shiftrows');
    if (currentRound.afterMixColumns && previousRound.afterMixColumns) {
      compareMatrices(previousRound.afterMixColumns, currentRound.afterMixColumns, 'mixcolumns');
    }
    compareMatrices(previousRound.afterAddRoundKey, currentRound.afterAddRoundKey, 'output');
  }

  isCellChanged(stepType: string, row: number, col: number): boolean {
    return this.changedCells.get(`${stepType}_${row}_${col}`) === true;
  }

  getCellValue(matrix: number[][] | undefined, row: number, col: number): string {
    if (!matrix || !matrix[row] || matrix[row][col] === undefined) return '00';
    return matrix[row][col].toString(16).padStart(2, '0').toUpperCase();
  }

  initSBoxSlice(): void {
    const sbox = this.aesService.getSBox();
    for (let i = 0; i < 16; i++) {
      const row: string[] = [];
      for (let j = 0; j < 16; j++) {
        row.push(sbox[i * 16 + j].toString(16).padStart(2, '0').toUpperCase());
      }
      this.sboxSlice.push(row);
    }
  }

  encrypt(): void {
    if (!this.text || !this.key) return;
    this.encryptedText = this.aesService.encrypt(this.text, this.key, this.mode, this.keySize);
    this.result = this.encryptedText;
    this.finalCiphertext = this.encryptedText;
    this.decryptedResult = '';
    this.refreshRoundsIfOpen();
  }

  decrypt(): void {
    if (!this.encryptedText || !this.key) return;
    const decrypted = this.aesService.decrypt(this.encryptedText, this.key, this.mode, this.keySize);
    this.decryptedResult = decrypted;
    this.result = decrypted;
    this.finalCiphertext = '';
    this.refreshRoundsIfOpen();
  }

  onTextChange(): void { this.autoUpdateRounds(); }
  onKeyChange(): void { this.autoUpdateRounds(); }
  onKeySizeChange(): void { this.autoUpdateRounds(); }
  onModeChange(): void { this.autoUpdateRounds(); }

  private refreshRoundsIfOpen(): void {
    if (this.showAesRounds) this.generateAesRoundsWithAnimation();
  }

  isRoundsAvailable(): boolean {
    return this.encryptedText !== '' || this.decryptedResult !== '';
  }

  // ========== ЛАВИННЫЙ ЭФФЕКТ С ДИНАМИЧЕСКОЙ СХЕМОЙ ==========
  runAvalancheTest(): void {
    if (!this.text || !this.key) return;
    
    this.showAvalanche = true;
    this.showScheme = true;
    this.animationStep = 0;
    
    // Вычисляем мутированный текст
    this.mutatedText = this.flipOneBit(this.text);
    
    // Получаем биты шифротекстов
    this.originalBits = this.aesService.getFullEncryptionBits(this.text, this.key);
    this.mutatedBits = this.aesService.getFullEncryptionBits(this.mutatedText, this.key);
    
    // Подсчёт изменений
    this.diffCount = 0;
    for (let i = 0; i < 128; i++) {
      if (this.originalBits[i] !== this.mutatedBits[i]) this.diffCount++;
    }
    
    // Строим матрицу для визуализации
    this.buildBitMatrix();
    
    // Анимация шагов схемы
    setTimeout(() => { this.animationStep = 1; this.cdr.detectChanges(); }, 500);
    setTimeout(() => { this.animationStep = 2; this.cdr.detectChanges(); }, 1000);
    setTimeout(() => { this.animationStep = 3; this.cdr.detectChanges(); }, 1500);
    setTimeout(() => { this.animationStep = 4; this.cdr.detectChanges(); }, 2000);
    
    // Сохранение в БД
    const percentage = (this.diffCount / 128) * 100;
    this.experimentService.saveAvalanche({
      algorithm: `AES-${this.keySize}`,
      changed_bits: this.diffCount,
      total_bits: 128,
      percentage: percentage
    }).subscribe({
      next: () => console.log('Avalanche result saved to DB'),
      error: (err: any) => console.error('Failed to save avalanche result:', err)
    });
  }

  buildBitMatrix(): void {
    if (this.originalBits.length !== 128 || this.mutatedBits.length !== 128) return;
    this.bitMatrix = [];
    for (let byteIdx = 0; byteIdx < 16; byteIdx++) {
      const byte: { value: number; isChanged: boolean; index: number }[] = [];
      for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
        const globalIdx = byteIdx * 8 + bitIdx;
        const originalBit = parseInt(this.originalBits[globalIdx], 10);
        const mutatedBit = parseInt(this.mutatedBits[globalIdx], 10);
        byte.push({
          value: mutatedBit,
          isChanged: originalBit !== mutatedBit,
          index: globalIdx
        });
      }
      this.bitMatrix.push(byte);
    }
    this.animationTrigger++;
  }

  getByteHex(byte: { value: number; isChanged: boolean; index: number }[]): string {
    const bits = byte.map(b => b.value).join('');
    const byteValue = parseInt(bits, 2);
    return byteValue.toString(16).padStart(2, '0').toUpperCase();
  }

  getFirstBytes(): string {
    if (!this.originalBits.length) return '...';
    let hex = '';
    for (let i = 0; i < 8; i++) {
      const bits = this.originalBits.slice(i * 8, i * 8 + 8).join('');
      hex += parseInt(bits, 2).toString(16).padStart(2, '0') + ' ';
    }
    return hex;
  }

  getMutatedFirstBytes(): string {
    if (!this.mutatedBits.length) return '...';
    let hex = '';
    for (let i = 0; i < 8; i++) {
      const bits = this.mutatedBits.slice(i * 8, i * 8 + 8).join('');
      hex += parseInt(bits, 2).toString(16).padStart(2, '0') + ' ';
    }
    return hex;
  }

  private flipOneBit(text: string): string {
    if (!text) return 'a';
    const cc = text.charCodeAt(0) ^ 1;
    return String.fromCharCode(cc) + text.substring(1);
  }

  saveEncryptionResult(): void {
    if (!this.encryptedText) {
      alert('Сначала зашифруйте текст!');
      return;
    }
    this.experimentService.saveExperiment({
      algorithm: `AES-${this.keySize}`,
      input: this.text,
      output: this.encryptedText,
      key_used: this.key,
      mode: this.mode
    }).subscribe({
      next: (response: { id: number; success: boolean }) => {
        console.log('Experiment saved:', response);
        alert('Результат шифрования сохранён в базе данных!');
      },
      error: (err: any) => {
        console.error('Error saving experiment:', err);
        alert('Ошибка сохранения. Убедитесь, что сервер запущен (node server.js)');
      }
    });
  }

  generateAesRounds(): void {
    if (!this.text || !this.key) return;
    const textBytes = this.aesService.stringToBytes(this.text);
    const padded = this.aesService.padData(new Uint8Array(textBytes));
    const block = Array.from(padded.slice(0, 16));
    const keyLength = this.keySize / 8;
    const keyBytes = this.aesService.stringToBytes(this.key.padEnd(keyLength, '\0').slice(0, keyLength));
    const roundKeys = this.aesService.expandKey(keyBytes);
    this.aesRoundsHistory = this.aesService.encryptBlockWithHistory(block, roundKeys);
    if (this.aesRoundIndex >= this.aesRoundsHistory.length) this.aesRoundIndex = 0;
    this.currentAesRound = this.aesRoundsHistory[this.aesRoundIndex]?.roundNumber || 0;
    this.updateAesRoundData();
  }

  toggleAesRounds(): void {
    this.showAesRounds = !this.showAesRounds;
    if (this.showAesRounds && this.aesRoundsHistory.length === 0 && this.isRoundsAvailable()) {
      this.generateAesRoundsWithAnimation();
    } else if (this.showAesRounds && this.text && this.key) {
      this.generateAesRoundsWithAnimation();
    }
  }

  nextAesRound(): void {
    if (this.aesRoundIndex < this.aesRoundsHistory.length - 1) {
      this.aesRoundIndex++;
      this.currentAesRound = this.aesRoundsHistory[this.aesRoundIndex].roundNumber;
      this.updateAesRoundData();
      if (this.previousAesRoundsHistory.length) {
        this.detectChangedCells();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.changedCells.clear();
          this.cdr.detectChanges();
        }, 500);
      }
    }
  }

  previousAesRound(): void {
    if (this.aesRoundIndex > 0) {
      this.aesRoundIndex--;
      this.currentAesRound = this.aesRoundsHistory[this.aesRoundIndex].roundNumber;
      this.updateAesRoundData();
      if (this.previousAesRoundsHistory.length) {
        this.detectChangedCells();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.changedCells.clear();
          this.cdr.detectChanges();
        }, 500);
      }
    }
  }

  updateAesRoundData(): void {
    if (this.aesRoundsHistory.length > 0 && this.aesRoundIndex < this.aesRoundsHistory.length) {
      this.currentAesRoundData = this.aesRoundsHistory[this.aesRoundIndex];
    }
  }

  get totalAesRounds(): number {
    return this.aesRoundsHistory.length - 1;
  }

  getFinalStateMatrix(): number[][] {
    if (!this.finalCiphertext) return [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    try {
      const binary = atob(this.finalCiphertext);
      const bytes: number[] = [];
      for (let i = 0; i < binary.length; i++) bytes.push(binary.charCodeAt(i));
      const matrix: number[][] = [[], [], [], []];
      for (let i = 0; i < 16 && i < bytes.length; i++) {
        matrix[i % 4][Math.floor(i / 4)] = bytes[i] || 0;
      }
      return matrix;
    } catch (e) {
      return [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    }
  }

  getFinalStateMatrixValue(row: number, col: number): string {
    const matrix = this.getFinalStateMatrix();
    if (!matrix || !matrix[row] || matrix[row][col] === undefined) return '00';
    return matrix[row][col].toString(16).padStart(2, '0').toUpperCase();
  }

  getDecryptedStateMatrix(): number[][] {
    if (!this.decryptedResult) return [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    const bytes = this.aesService.stringToBytes(this.decryptedResult);
    const matrix: number[][] = [[], [], [], []];
    for (let i = 0; i < 16 && i < bytes.length; i++) {
      matrix[i % 4][Math.floor(i / 4)] = bytes[i];
    }
    return matrix;
  }

  getDecryptedStateMatrixValue(row: number, col: number): string {
    const matrix = this.getDecryptedStateMatrix();
    if (!matrix || !matrix[row] || matrix[row][col] === undefined) return '00';
    return matrix[row][col].toString(16).padStart(2, '0').toUpperCase();
  }

  runBenchmark(): void {
    this.benchmarkResults = [];
    const text = this.text || 'hello';
    const key = this.key || '12345678';
    const start = performance.now();
    for (let i = 0; i < this.benchmarkIterations; i++) {
      this.aesService.encrypt(text, key, this.mode, this.keySize);
    }
    const time = performance.now() - start;
    this.benchmarkResults.push({
      name: 'AES-' + this.keySize,
      time,
      opsPerSec: (this.benchmarkIterations / (time / 1000)),
      color: '#3b82f6'
    });
    this.maxBenchmarkTime = time;
  }

  measureKeyExpansion(): void {
    const key = this.key || '12345678';
    const keyLength = this.keySize / 8;
    const keyBytes = this.aesService.stringToBytes(key.padEnd(keyLength, '\0').slice(0, keyLength));
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      this.aesService.expandKey(keyBytes);
    }
    const time = performance.now() - start;
    this.keyExpTime = time;
    this.showKeyExpResult = true;
  }

  getByteGroups(bits: string[]): string[][] {
    const groups: string[][] = [];
    for (let i = 0; i < bits.length; i += 8) {
      groups.push(bits.slice(i, i + 8));
    }
    return groups;
  }
}