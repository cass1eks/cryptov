import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { KuznechikService } from '../../services/kuznechik.service';

@Component({
  selector: 'app-kuznechik-panel',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './kuznechik-panel.component.html',
  styleUrls: ['./kuznechik-panel.component.css']
})
export class KuznechikPanelComponent {

  text = 'helloww';
  key = '8899AABBCCDDEEFF0011223344556677FEDCBA98765432100123456789ABCDEF';
  mode = 'ECB';
  iv = '1234567890ABCDEF';
  result = '';
  resultBase64 = '';

  block128: number[] = [];

  // ========== ЛАВИННЫЙ ЭФФЕКТ ==========
  originalBits: string[] = [];
  mutatedBits: string[] = [];
  diffCount: number = 0;
  showAvalanche = false;
  showScheme = false;
  animationStep = 0;
  mutatedText = '';
  bitMatrix: { value: number; isChanged: boolean; index: number }[][] = [];

  // ========== РАУНДЫ ==========
  rounds: { round: number; input: number[]; afterX: number[]; afterS: number[]; afterL: number[]; roundKey: number[] }[] = [];
  showRounds = false;
  currentRoundData: any = null;
  roundIndex = 0;

  // S-Box
  showSBox = false;
  highlightedFrom: number | null = null;
  highlightedTo: number | null = null;

  sboxHighlightRow: number = -1;
  sboxHighlightCol: number = -1;
  sboxActiveRow: number = -1;
  sboxActiveCol: number = -1;

  sboxFull: number[][] = [];

  // История переходов
  transitionHistory: { from: number; to: number; label: string }[] = [];

  constructor(private kuznechikService: KuznechikService) {
    this.initSBoxFull();
  }

  get showIV(): boolean {
    return this.mode === 'CBC' || this.mode === 'CTR';
  }

  initSBoxFull(): void {
    const pi = this.kuznechikService.getPI();
    this.sboxFull = [];
    for (let i = 0; i < 16; i++) {
      const row: number[] = [];
      for (let j = 0; j < 16; j++) {
        row.push(pi[i * 16 + j]);
      }
      this.sboxFull.push(row);
    }
  }

  encrypt(): void {
    if (!this.text || !this.key) return;
    this.resultBase64 = this.kuznechikService.encrypt(this.text, this.key, this.mode, this.iv);
    this.result = '';
    this.updateKuznechik();
  }

  decrypt(): void {
    if (!this.resultBase64 || !this.key) return;
    try {
      this.result = this.kuznechikService.decrypt(this.resultBase64, this.key, this.mode, this.iv);
      this.resultBase64 = '';
    } catch (e) {
      this.result = 'Ошибка расшифрования';
      this.resultBase64 = '';
    }
  }

  onModeChange(): void {}

  // ========== ЛАВИННЫЙ ЭФФЕКТ С ДИНАМИЧЕСКОЙ СХЕМОЙ ==========
  runAvalancheTest(): void {
    if (!this.text || !this.key) return;
    
    this.showAvalanche = true;
    this.showScheme = true;
    this.animationStep = 0;
    
    // Вычисляем мутированный текст
    this.mutatedText = this.flipOneBit(this.text);
    
    // Получаем биты шифротекстов (Кузнечик = 128 бит = 16 байтов)
    const originalBase64 = this.kuznechikService.encrypt(this.text, this.key, 'ECB');
    const mutatedBase64 = this.kuznechikService.encrypt(this.mutatedText, this.key, 'ECB');
    
    this.originalBits = this.base64ToBits(originalBase64);
    this.mutatedBits = this.base64ToBits(mutatedBase64);
    
    // Подсчёт изменений
    this.diffCount = 0;
    for (let i = 0; i < 128; i++) {
      if (this.originalBits[i] !== this.mutatedBits[i]) this.diffCount++;
    }
    
    // Строим матрицу для визуализации
    this.buildBitMatrix();
    
    // Анимация шагов схемы
    setTimeout(() => { this.animationStep = 1; }, 500);
    setTimeout(() => { this.animationStep = 2; }, 1000);
    setTimeout(() => { this.animationStep = 3; }, 1500);
    setTimeout(() => { this.animationStep = 4; }, 2000);
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
  }

  getBitMatrixByteHex(byte: { value: number; isChanged: boolean; index: number }[]): string {
    const bits = byte.map(b => b.value).join('');
    const byteValue = parseInt(bits, 2);
    return byteValue.toString(16).padStart(2, '0').toUpperCase();
  }

  getByteHex(byte: number): string {
    return byte.toString(16).padStart(2, '0').toUpperCase();
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

  private base64ToBits(base64: string): string[] {
    const binary = atob(base64);
    let bits = '';
    for (let i = 0; i < binary.length; i++) {
      const byte = binary.charCodeAt(i);
      bits += byte.toString(2).padStart(8, '0');
    }
    return bits.split('').slice(0, 128);
  }

  toggleAvalanche(): void {
    if (this.showAvalanche) {
      this.showAvalanche = false;
      this.showScheme = false;
    } else {
      this.runAvalancheTest();
    }
  }

  // ========== РАУНДЫ ==========
  toggleRounds(): void {
    this.showRounds = !this.showRounds;
    if (this.showRounds && !this.rounds.length) this.updateKuznechik();
  }

  updateKuznechik(): void {
    this.block128 = this.kuznechikService.get128BitBlock(this.text);
    this.generateRounds();
    this.resetAnimation();
  }

  generateRounds(): void {
    this.rounds = this.kuznechikService.getRoundsForAnimation(this.text, this.key);
    if (this.rounds.length > 0) {
      this.currentRoundData = this.rounds[0];
      this.roundIndex = 0;
    }
  }

  resetAnimation(): void {
    this.roundIndex = 0;
    if (this.rounds.length > 0) {
      this.currentRoundData = this.rounds[0];
    }
    this.clearSBoxHighlight();
  }

  nextRound(): void {
    if (this.roundIndex < this.rounds.length - 1) {
      this.roundIndex++;
      this.currentRoundData = this.rounds[this.roundIndex];
      this.clearSBoxHighlight();
    }
  }

  previousRound(): void {
    if (this.roundIndex > 0) {
      this.roundIndex--;
      this.currentRoundData = this.rounds[this.roundIndex];
      this.clearSBoxHighlight();
    }
  }

  isByteChanged(before: number[] | undefined, after: number[] | undefined, index: number): boolean {
    if (!before || !after) return false;
    return index < before.length && index < after.length && before[index] !== after[index];
  }

  countChanged(before: number[] | undefined, after: number[] | undefined): number {
    if (!before || !after) return 0;
    let count = 0;
    const len = Math.min(before.length, after.length);
    for (let i = 0; i < len; i++) {
      if (before[i] !== after[i]) count++;
    }
    return count;
  }

  highlightSBox(inputByte: number, outputByte: number): void {
    this.showSBox = true;
    this.highlightedFrom = inputByte;
    this.highlightedTo = outputByte;

    this.sboxHighlightRow = (inputByte >> 4) & 0xF;
    this.sboxHighlightCol = inputByte & 0xF;
    this.sboxActiveRow = (outputByte >> 4) & 0xF;
    this.sboxActiveCol = outputByte & 0xF;

    const label = this.getByteHex(inputByte) + ' → ' + this.getByteHex(outputByte);
    const last = this.transitionHistory[this.transitionHistory.length - 1];
    if (!last || last.label !== label) {
      this.transitionHistory.push({ from: inputByte, to: outputByte, label });
    }
  }

  clearSBoxHighlight(): void {
    this.sboxHighlightRow = -1;
    this.sboxHighlightCol = -1;
    this.sboxActiveRow = -1;
    this.sboxActiveCol = -1;
    this.highlightedFrom = null;
    this.highlightedTo = null;
  }

  replayTransition(item: { from: number; to: number }): void {
    this.highlightedFrom = item.from;
    this.highlightedTo = item.to;
    this.sboxHighlightRow = (item.from >> 4) & 0xF;
    this.sboxHighlightCol = item.from & 0xF;
    this.sboxActiveRow = (item.to >> 4) & 0xF;
    this.sboxActiveCol = item.to & 0xF;
    this.showSBox = true;
  }

  clearHistory(): void {
    this.transitionHistory = [];
  }

  removeTransition(index: number): void {
    this.transitionHistory.splice(index, 1);
  }

  isSBoxHighlighted(row: number, col: number): boolean {
    return row === this.sboxHighlightRow && col === this.sboxHighlightCol;
  }

  isSBoxActive(row: number, col: number): boolean {
    return row === this.sboxActiveRow && col === this.sboxActiveCol;
  }

  formatBytes(bytes: number[]): string {
    return bytes?.map(b => b.toString(16).padStart(2, '0')).join(' ') || '';
  }

  formatBytesFull(bytes: number[]): string {
    if (!bytes) return '';
    const fb = [...bytes];
    while (fb.length < 16) fb.push(0);
    return fb.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join(' ');
  }

  getByteGroups(bits: string[]): string[][] {
    const groups: string[][] = [];
    for (let i = 0; i < bits.length; i += 8) {
      groups.push(bits.slice(i, i + 8));
    }
    return groups;
  }

  isHighlightedByte(index: number): boolean {
    // Для отладки — можно подсветить проблемные индексы
    return false; // или проверка на конкретные индексы
}
}