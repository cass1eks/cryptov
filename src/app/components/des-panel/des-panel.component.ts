import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { DesService } from '../../services/des.service';

@Component({
  selector: 'app-des-panel',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass],
  templateUrl: './des-panel.component.html',
  styleUrls: ['./des-panel.component.css']
})
export class DesPanelComponent {

  text = 'helloww';
  key = '12345678';
  mode = 'ECB';
  iv = '12345678';
  result = '';
  decryptedResult = '';

  block64: string[] = [];
  L0: string[] = [];
  R0: string[] = [];

  // ========== ЛАВИННЫЙ ЭФФЕКТ (НОВАЯ ВЕРСИЯ) ==========
  originalBits: string[] = [];
  mutatedBits: string[] = [];
  diffCount: number = 0;
  showAvalanche = false;
  showScheme = false;
  animationStep = 0;
  mutatedText = '';
  
  // Матрица битов для DES (8 байтов × 8 битов)
  bitMatrix: { value: number; isChanged: boolean; index: number }[][] = [];

  // ========== РАУНДЫ ==========
  rounds: { 
    round: number, 
    L: string, 
    R: string, 
    fResult: string,
    LPrev: string,
    RPrev: string
  }[] = [];

  currentRound = 0;
  showRounds = false;
  currentRoundData: any = null;
  roundIndex = 0;

  // S-Box для карусели
  sbox = [
    [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],
    [0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],
    [4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],
    [15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]
  ];

  sboxAll: number[][][] = [
    [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
    [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
    [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
    [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
    [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
    [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
    [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
    [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]]
  ];

  activeSBox: number = 1;
  fExpanded = false;

  constructor(private desService: DesService) {}

  get showIV(): boolean {
    return this.mode === 'CBC' || this.mode === 'CTR';
  }

  encrypt() {
    if (!this.text || !this.key) return;
    this.result = this.desService.encrypt(this.text, this.key, this.mode, this.iv);
    this.updateDES();
  }

  decrypt() {
    if (!this.result || !this.key) return;
    try {
      this.decryptedResult = this.desService.decrypt(this.result, this.key, this.mode);
    } catch (e) {
      this.decryptedResult = 'Ошибка расшифрования';
    }
  }

  onModeChange() {}

  // ========== ЛАВИННЫЙ ЭФФЕКТ С ДИНАМИЧЕСКОЙ СХЕМОЙ ==========
  runAvalancheTest(): void {
    if (!this.text || !this.key) return;
    
    this.showAvalanche = true;
    this.showScheme = true;
    this.animationStep = 0;
    
    // Вычисляем мутированный текст
    this.mutatedText = this.flipOneBit(this.text);
    
    // Получаем биты шифротекстов (DES = 64 бита = 8 байтов)
    this.originalBits = this.desService.getFullEncryptionBits(this.text, this.key);
    this.mutatedBits = this.desService.getFullEncryptionBits(this.mutatedText, this.key);
    
    // Подсчёт изменений
    this.diffCount = 0;
    for (let i = 0; i < 64; i++) {
      if (this.originalBits[i] !== this.mutatedBits[i]) this.diffCount++;
    }
    
    // Строим матрицу для визуализации (8 байтов × 8 битов)
    this.buildBitMatrix();
    
    // Анимация шагов схемы
    setTimeout(() => { this.animationStep = 1; }, 500);
    setTimeout(() => { this.animationStep = 2; }, 1000);
    setTimeout(() => { this.animationStep = 3; }, 1500);
    setTimeout(() => { this.animationStep = 4; }, 2000);
  }

  buildBitMatrix(): void {
    if (this.originalBits.length !== 64 || this.mutatedBits.length !== 64) return;
    this.bitMatrix = [];
    for (let byteIdx = 0; byteIdx < 8; byteIdx++) {
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

  getByteHex(byte: { value: number; isChanged: boolean; index: number }[]): string {
    const bits = byte.map(b => b.value).join('');
    const byteValue = parseInt(bits, 2);
    return byteValue.toString(16).padStart(2, '0').toUpperCase();
  }

  getFirstBytes(): string {
    if (!this.originalBits.length) return '...';
    let hex = '';
    for (let i = 0; i < 4; i++) {
      const bits = this.originalBits.slice(i * 8, i * 8 + 8).join('');
      hex += parseInt(bits, 2).toString(16).padStart(2, '0') + ' ';
    }
    return hex;
  }

  getMutatedFirstBytes(): string {
    if (!this.mutatedBits.length) return '...';
    let hex = '';
    for (let i = 0; i < 4; i++) {
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

  toggleAvalanche(): void {
    if (this.showAvalanche) {
      this.showAvalanche = false;
      this.showScheme = false;
    } else {
      this.runAvalancheTest();
    }
  }

  // ========== РАУНДЫ ==========
  toggleRounds() {
    this.showRounds = !this.showRounds;
    if (this.showRounds && this.rounds.length === 0) {
      this.updateDES();
    }
  }

  updateDES() {
    const bits = this.desService.get64BitBlock(this.text);
    const split = this.desService.splitLR(bits);
    this.block64 = bits;
    this.L0 = split.L0;
    this.R0 = split.R0;
    this.generateRounds();
    this.resetAnimation();
  }

  generateRounds() {
    this.rounds = [];
    const animationRounds = this.desService.getRoundsForAnimation(this.text, this.key);
    
    let L = this.L0.join('');
    let R = this.R0.join('');
    
    for (let i = 0; i < 16; i++) {
      this.rounds.push({
        round: i + 1,
        L: animationRounds[i].L,
        R: animationRounds[i].R,
        fResult: animationRounds[i].fResult,
        LPrev: L,
        RPrev: R
      });
      L = animationRounds[i].L;
      R = animationRounds[i].R;
    }
    
    this.currentRound = 1;
    this.roundIndex = 0;
    this.updateCurrentRoundData();
  }

  resetAnimation() {
    this.roundIndex = 0;
    this.currentRound = 1;
    this.updateCurrentRoundData();
  }

  nextRound() {
    if (this.roundIndex < this.rounds.length - 1) {
      this.roundIndex++;
      this.currentRound = this.rounds[this.roundIndex].round;
      this.updateCurrentRoundData();
    }
  }

  previousRound() {
    if (this.roundIndex > 0) {
      this.roundIndex--;
      this.currentRound = this.rounds[this.roundIndex].round;
      this.updateCurrentRoundData();
    }
  }

  updateCurrentRoundData() {
    if (this.rounds.length > 0 && this.roundIndex < this.rounds.length) {
      this.currentRoundData = this.rounds[this.roundIndex];
    }
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
  getFResultBits(): string[] {
    if (!this.currentRoundData?.fResult) return [];
    return this.currentRoundData.fResult.split('');
  }

  getRResultBits(): string[] {
    if (!this.currentRoundData?.LPrev || !this.currentRoundData?.fResult) return [];
    const lBits = this.currentRoundData.LPrev.split('');
    const fBits = this.currentRoundData.fResult.split('');
    const rBits: string[] = [];
    for (let i = 0; i < 32; i++) {
      rBits.push((parseInt(lBits[i]) ^ parseInt(fBits[i])).toString());
    }
    return rBits;
  }

  isBitChanged(index: number): boolean {
    if (!this.currentRoundData?.RPrev || !this.currentRoundData?.fResult) return false;
    const inputBit = this.currentRoundData.RPrev[index];
    const outputBit = this.currentRoundData.fResult[index];
    return inputBit !== outputBit;
  }

  isRBitChanged(index: number): boolean {
    if (!this.currentRoundData?.LPrev || !this.currentRoundData?.fResult) return false;
    const lBit = this.currentRoundData.LPrev[index];
    return lBit !== this.getRResultBits()[index];
  }

  getSBoxBlocks(): string[] {
    if (!this.currentRoundData?.fResult) return [];
    const blocks: string[] = [];
    const fResult = this.currentRoundData.fResult;
    for (let i = 0; i < 8; i++) {
      blocks.push(fResult.slice(i * 4, (i + 1) * 4));
    }
    return blocks;
  }

  isBlockActive(index: number): boolean {
    return index % 2 === 0;
  }

  getFResultBitGroups(): string[][] {
    return this.groupBits(this.getFResultBits(), 4);
  }

  getRResultBitGroups(): string[][] {
    return this.groupBits(this.getRResultBits(), 4);
  }

  getLBitGroups(): string[][] {
    const bits = (this.currentRoundData?.L || '').split('');
    return this.groupBits(bits, 4);
  }

  getRPrevBitGroups(): string[][] {
    const bits = (this.currentRoundData?.RPrev || '').split('');
    return this.groupBits(bits, 4);
  }

  private groupBits(bits: string[], size: number): string[][] {
    const groups: string[][] = [];
    for (let i = 0; i < bits.length; i += size) {
      groups.push(bits.slice(i, i + size));
    }
    return groups;
  }

  getByteGroups(bits: string[]): string[][] {
    const groups: string[][] = [];
    for (let i = 0; i < bits.length; i += 6) {
      groups.push(bits.slice(i, i + 6));
    }
    return groups;
  }

  prevSBox(): void { if (this.activeSBox > 1) this.activeSBox--; else this.activeSBox = 8; }
  nextSBox(): void { if (this.activeSBox < 8) this.activeSBox++; else this.activeSBox = 1; }
}