import { Injectable } from '@angular/core';

// ========== ИНТЕРФЕЙС ДЛЯ ИСТОРИИ РАУНДОВ ==========
export interface AesRoundStep {
  roundNumber: number;
  inputState: number[][];
  afterSubBytes: number[][];
  afterShiftRows: number[][];
  afterMixColumns?: number[][];
  roundKey: number[][];
  afterAddRoundKey: number[][];
}

@Injectable({
  providedIn: 'root'
})
export class AesService {

  private readonly SBOX: number[] = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
  ];

  private readonly INV_SBOX: number[] = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
  ];

  private readonly RCON: number[] = [
    0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36,
    0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f
  ];

  // ========== ГАЛУА (GF(2⁸)) ==========
  private mul2(a: number): number { const r = (a << 1) & 0xFF; return (a & 0x80) ? r ^ 0x1b : r; }
  private mul3(a: number): number { return this.mul2(a) ^ a; }
  private mul9(a: number): number { return this.mul2(this.mul2(this.mul2(a))) ^ a; }
  private mul11(a: number): number { return this.mul2(this.mul2(this.mul2(a)) ^ a) ^ a; }
  private mul13(a: number): number { return this.mul2(this.mul2(this.mul2(a) ^ a)) ^ a; }
  private mul14(a: number): number { return this.mul2(this.mul2(this.mul2(a) ^ a) ^ a); }

  // ========== ГЛУБОКОЕ КОПИРОВАНИЕ ==========
  private deepCopy(matrix: number[][]): number[][] {
    return matrix.map(row => [...row]);
  }

  // ========== ОСНОВНЫЕ ОПЕРАЦИИ AES ==========
  subBytes(state: number[][]): number[][] { 
    return state.map(row => row.map(b => this.SBOX[b])); 
  }
  
  invSubBytes(state: number[][]): number[][] { 
    return state.map(row => row.map(b => this.INV_SBOX[b])); 
  }

  shiftRows(state: number[][]): number[][] {
    const result: number[][] = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i][j] = state[i][(j + i) % 4];
      }
    }
    return result;
  }

  invShiftRows(state: number[][]): number[][] {
    const result: number[][] = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i][j] = state[i][(j - i + 4) % 4];
      }
    }
    return result;
  }

  mixColumns(state: number[][]): number[][] {
    const result: number[][] = [[], [], [], []];
    for (let c = 0; c < 4; c++) {
      const a0 = state[0][c], a1 = state[1][c], a2 = state[2][c], a3 = state[3][c];
      result[0][c] = this.mul2(a0) ^ this.mul3(a1) ^ a2 ^ a3;
      result[1][c] = a0 ^ this.mul2(a1) ^ this.mul3(a2) ^ a3;
      result[2][c] = a0 ^ a1 ^ this.mul2(a2) ^ this.mul3(a3);
      result[3][c] = this.mul3(a0) ^ a1 ^ a2 ^ this.mul2(a3);
    }
    return result;
  }

  invMixColumns(state: number[][]): number[][] {
    const result: number[][] = [[], [], [], []];
    for (let c = 0; c < 4; c++) {
      const a0 = state[0][c], a1 = state[1][c], a2 = state[2][c], a3 = state[3][c];
      result[0][c] = this.mul14(a0) ^ this.mul11(a1) ^ this.mul13(a2) ^ this.mul9(a3);
      result[1][c] = this.mul9(a0) ^ this.mul14(a1) ^ this.mul11(a2) ^ this.mul13(a3);
      result[2][c] = this.mul13(a0) ^ this.mul9(a1) ^ this.mul14(a2) ^ this.mul11(a3);
      result[3][c] = this.mul11(a0) ^ this.mul13(a1) ^ this.mul9(a2) ^ this.mul14(a3);
    }
    return result;
  }

  addRoundKey(state: number[][], roundKey: number[][]): number[][] {
    return state.map((row, i) => row.map((b, j) => b ^ roundKey[i][j]));
  }

  // ========== РАСШИРЕНИЕ КЛЮЧА ==========
  expandKey(key: number[]): number[][][] {
    const Nk = key.length / 4;
    const Nr = Nk + 6;
    const totalWords = 4 * (Nr + 1);

    const w: number[][] = [];
    for (let i = 0; i < Nk; i++) {
      w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
    }

    for (let i = Nk; i < totalWords; i++) {
      let temp = [...w[i - 1]];
      if (i % Nk === 0) {
        temp = [temp[1], temp[2], temp[3], temp[0]].map(b => this.SBOX[b]);
        temp[0] ^= this.RCON[Math.floor(i / Nk) - 1];
      } else if (Nk > 6 && i % Nk === 4) {
        temp = temp.map(b => this.SBOX[b]);
      }
      w[i] = temp.map((t, j) => w[i - Nk][j] ^ t);
    }

    const roundKeys: number[][][] = [];
    for (let r = 0; r <= Nr; r++) {
      const rk: number[][] = [[], [], [], []];
      for (let c = 0; c < 4; c++) {
        for (let row = 0; row < 4; row++) {
          rk[row][c] = w[r * 4 + c][row];
        }
      }
      roundKeys.push(rk);
    }
    return roundKeys;
  }

  // ========== ШИФРОВАНИЕ / ДЕШИФРОВАНИЕ БЛОКА ==========
  encryptBlock(block: number[], roundKeys: number[][][]): number[] {
    const Nr = roundKeys.length - 1;
    let state: number[][] = [[], [], [], []];
    for (let i = 0; i < 16; i++) state[i % 4][Math.floor(i / 4)] = block[i];
    
    state = this.addRoundKey(state, roundKeys[0]);
    for (let r = 1; r < Nr; r++) {
      state = this.subBytes(state);
      state = this.shiftRows(state);
      state = this.mixColumns(state);
      state = this.addRoundKey(state, roundKeys[r]);
    }
    state = this.subBytes(state);
    state = this.shiftRows(state);
    state = this.addRoundKey(state, roundKeys[Nr]);
    
    const result: number[] = [];
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) result.push(state[r][c]);
    return result;
  }

  decryptBlock(block: number[], roundKeys: number[][][]): number[] {
    const Nr = roundKeys.length - 1;
    let state: number[][] = [[], [], [], []];
    for (let i = 0; i < 16; i++) state[i % 4][Math.floor(i / 4)] = block[i];
    
    state = this.addRoundKey(state, roundKeys[Nr]);
    state = this.invShiftRows(state);
    state = this.invSubBytes(state);
    for (let r = Nr - 1; r >= 1; r--) {
      state = this.addRoundKey(state, roundKeys[r]);
      state = this.invMixColumns(state);
      state = this.invShiftRows(state);
      state = this.invSubBytes(state);
    }
    state = this.addRoundKey(state, roundKeys[0]);
    
    const result: number[] = [];
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) result.push(state[r][c]);
    return result;
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
  stringToBytes(str: string): number[] { 
    return Array.from(new TextEncoder().encode(str)); 
  }
  
  bytesToString(bytes: number[]): string {
    const clean = bytes.filter(b => b >= 32 && b <= 126);
    return String.fromCharCode(...clean);
  }
  
  bytesToHex(bytes: number[]): string { 
    return bytes.map(b => b.toString(16).padStart(2, '0')).join(''); 
  }
  
  hexToBytes(hex: string): number[] {
    const b: number[] = [];
    for (let i = 0; i < hex.length; i += 2) b.push(parseInt(hex.slice(i, i + 2), 16));
    return b;
  }
  
  bytesToBase64(bytes: number[]): string {
    return btoa(bytes.map(b => String.fromCharCode(b)).join(''));
  }

  padData(data: Uint8Array, blockSize: number = 16): Uint8Array {
    const pl = blockSize - (data.length % blockSize);
    const r = new Uint8Array(data.length + pl);
    r.set(data);
    for (let i = data.length; i < r.length; i++) r[i] = pl;
    return r;
  }

  unpadData(data: Uint8Array): Uint8Array {
    if (data.length === 0) return data;
    const pl = data[data.length - 1];
    if (pl > 16 || pl === 0) return data;
    return data.slice(0, data.length - pl);
  }

  generateIV(): number[] { 
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)); 
  }

  // ========== ПУБЛИЧНЫЕ МЕТОДЫ ШИФРОВАНИЯ ==========
  encrypt(plaintext: string, keyStr: string, mode: string, keySize: number = 128): string {
    const plainBytes = this.stringToBytes(plaintext);
    const keyLength = keySize / 8;
    const keyBytes = this.stringToBytes(keyStr.padEnd(keyLength, '\0').slice(0, keyLength));
    const roundKeys = this.expandKey(keyBytes);
    const result: number[] = [];

    if (mode === 'CTR') {
      const nonce = this.generateIV().slice(0, 8);
      result.push(...nonce);
      let counter = 0;
      for (let i = 0; i < plainBytes.length; i += 16) {
        const ctrBlock = [...nonce];
        let c = counter;
        for (let j = 7; j >= 0; j--) ctrBlock.push((c >> (j * 8)) & 0xFF);
        counter++;
        const enc = this.encryptBlock(ctrBlock, roundKeys);
        const block = plainBytes.slice(i, Math.min(i + 16, plainBytes.length));
        for (let j = 0; j < block.length; j++) result.push(block[j] ^ enc[j]);
      }
      return this.bytesToBase64(result);
    } else if (mode === 'CBC') {
      const padded = this.padData(new Uint8Array(plainBytes));
      const iv = this.generateIV();
      result.push(...iv);
      let prev = iv;
      for (let i = 0; i < padded.length; i += 16) {
        const block = Array.from(padded.slice(i, i + 16));
        const xored = block.map((b, idx) => b ^ prev[idx]);
        const enc = this.encryptBlock(xored, roundKeys);
        result.push(...enc);
        prev = enc;
      }
      return this.bytesToBase64(result);
    } else {
      const padded = this.padData(new Uint8Array(plainBytes));
      for (let i = 0; i < padded.length; i += 16) {
        result.push(...this.encryptBlock(Array.from(padded.slice(i, i + 16)), roundKeys));
      }
      return this.bytesToBase64(result);
    }
  }

  decrypt(ciphertextBase64: string, keyStr: string, mode: string, keySize: number = 128): string {
    const binaryString = atob(ciphertextBase64);
    const cipherBytes: number[] = [];
    for (let i = 0; i < binaryString.length; i++) cipherBytes.push(binaryString.charCodeAt(i));
    const keyLength = keySize / 8;
    const keyBytes = this.stringToBytes(keyStr.padEnd(keyLength, '\0').slice(0, keyLength));
    const roundKeys = this.expandKey(keyBytes);
    const result: number[] = [];

    if (mode === 'CTR') {
      const nonce = cipherBytes.slice(0, 8);
      let counter = 0;
      for (let i = 8; i < cipherBytes.length; i += 16) {
        const ctrBlock = [...nonce];
        let c = counter;
        for (let j = 7; j >= 0; j--) ctrBlock.push((c >> (j * 8)) & 0xFF);
        counter++;
        const enc = this.encryptBlock(ctrBlock, roundKeys);
        const block = cipherBytes.slice(i, Math.min(i + 16, cipherBytes.length));
        for (let j = 0; j < block.length; j++) result.push(block[j] ^ enc[j]);
      }
      return this.bytesToString(result);
    } else if (mode === 'CBC') {
      const iv = cipherBytes.slice(0, 16);
      let prev = iv;
      for (let i = 16; i < cipherBytes.length; i += 16) {
        const block = cipherBytes.slice(i, i + 16);
        const dec = this.decryptBlock(block, roundKeys);
        const xored = dec.map((b, idx) => b ^ prev[idx]);
        result.push(...xored);
        prev = block;
      }
      const unpadded = this.unpadData(new Uint8Array(result));
      return this.bytesToString(Array.from(unpadded));
    } else {
      for (let i = 0; i < cipherBytes.length; i += 16) {
        const block = cipherBytes.slice(i, i + 16);
        result.push(...this.decryptBlock(block, roundKeys));
      }
      const unpadded = this.unpadData(new Uint8Array(result));
      return this.bytesToString(Array.from(unpadded));
    }
  }

  // ========== ВИЗУАЛИЗАЦИЯ ==========
  getStateMatrix(text: string): string[][] {
    const bytes = this.stringToBytes(text);
    const padded = this.padData(new Uint8Array(bytes));
    const block = Array.from(padded.slice(0, 16));
    const matrix: string[][] = [[], [], [], []];
    for (let i = 0; i < 16; i++) {
      const v = block[i] !== undefined ? block[i] : 0;
      matrix[i % 4][Math.floor(i / 4)] = v.toString(16).padStart(2, '0');
    }
    return matrix;
  }

  getSBox(): number[] { 
    return this.SBOX; 
  }

  getCTRVisualization(plaintext: string, keyStr: string): any {
    const plainBytes = this.stringToBytes(plaintext);
    const keyBytes = this.stringToBytes(keyStr.padEnd(16, '\0').slice(0, 16));
    const roundKeys = this.expandKey(keyBytes);
    const nonce = this.generateIV().slice(0, 8);
    const blocks: any[] = [];
    let counter = 0;
    for (let i = 0; i < plainBytes.length; i += 16) {
      const ctrBlock = [...nonce];
      let c = counter;
      for (let j = 7; j >= 0; j--) ctrBlock.push((c >> (j * 8)) & 0xFF);
      const ks = this.encryptBlock(ctrBlock, roundKeys);
      const block = plainBytes.slice(i, Math.min(i + 16, plainBytes.length));
      const ct: number[] = [];
      for (let j = 0; j < block.length; j++) ct.push(block[j] ^ ks[j]);
      blocks.push({
        counter: this.bytesToHex(ctrBlock),
        keystream: this.bytesToHex(ks.slice(0, block.length)),
        plaintext: this.bytesToHex(block),
        ciphertext: this.bytesToHex(ct)
      });
      counter++;
    }
    return { nonce: this.bytesToHex(nonce), blocks };
  }

  getFullEncryptionBits(plaintext: string, key: string): string[] {
    const plainBytes = this.stringToBytes(plaintext);
    const padded = this.padData(new Uint8Array(plainBytes));
    const block = Array.from(padded.slice(0, 16));
    const keyBytes = this.stringToBytes(key.padEnd(16, '\0').slice(0, 16));
    return this.encryptBlock(block, this.expandKey(keyBytes))
      .map(b => b.toString(2).padStart(8, '0')).join('').split('');
  }

  // ========== НОВЫЙ МЕТОД: ПОЛНАЯ ИСТОРИЯ ШИФРОВАНИЯ ==========
  encryptBlockWithHistory(block: number[], roundKeys: number[][][]): AesRoundStep[] {
    const Nr = roundKeys.length - 1;
    const history: AesRoundStep[] = [];

    // Создаем начальную State Matrix
    let state: number[][] = [[], [], [], []];
    for (let i = 0; i < 16; i++) {
      state[i % 4][Math.floor(i / 4)] = block[i];
    }

    // Раунд 0 (только AddRoundKey)
    let previousState = this.deepCopy(state);
    state = this.addRoundKey(state, roundKeys[0]);
    
    history.push({
      roundNumber: 0,
      inputState: previousState,
      afterSubBytes: this.deepCopy(previousState),
      afterShiftRows: this.deepCopy(previousState),
      roundKey: this.deepCopy(roundKeys[0]),
      afterAddRoundKey: this.deepCopy(state)
    });

    // Основные раунды
    for (let r = 1; r < Nr; r++) {
      const step: AesRoundStep = {
        roundNumber: r,
        inputState: this.deepCopy(state),
        afterSubBytes: [],
        afterShiftRows: [],
        roundKey: this.deepCopy(roundKeys[r]),
        afterAddRoundKey: []
      };

      state = this.subBytes(state);
      step.afterSubBytes = this.deepCopy(state);

      state = this.shiftRows(state);
      step.afterShiftRows = this.deepCopy(state);

      state = this.mixColumns(state);
      step.afterMixColumns = this.deepCopy(state);

      state = this.addRoundKey(state, roundKeys[r]);
      step.afterAddRoundKey = this.deepCopy(state);

      history.push(step);
    }

    // Финальный раунд
    const finalStep: AesRoundStep = {
      roundNumber: Nr,
      inputState: this.deepCopy(state),
      afterSubBytes: [],
      afterShiftRows: [],
      roundKey: this.deepCopy(roundKeys[Nr]),
      afterAddRoundKey: []
    };

    state = this.subBytes(state);
    finalStep.afterSubBytes = this.deepCopy(state);

    state = this.shiftRows(state);
    finalStep.afterShiftRows = this.deepCopy(state);

    state = this.addRoundKey(state, roundKeys[Nr]);
    finalStep.afterAddRoundKey = this.deepCopy(state);

    history.push(finalStep);

    return history;
  }

  // ========== СТАРЫЙ МЕТОД ДЛЯ СОВМЕСТИМОСТИ ==========
  getRoundsForAnimation(plaintext: string, key: string, keySize: number = 128): any[] {
    const plainBytes = this.stringToBytes(plaintext);
    const padded = this.padData(new Uint8Array(plainBytes));
    const block = Array.from(padded.slice(0, 16));
    const keyLength = keySize / 8;
    const keyBytes = this.stringToBytes(key.padEnd(keyLength, '\0').slice(0, keyLength));
    const roundKeys = this.expandKey(keyBytes);
    const rounds = this.encryptBlockWithHistory(block, roundKeys);
    
    // Конвертируем в старый формат для совместимости
    return rounds.map(r => ({
      round: r.roundNumber,
      state: r.afterAddRoundKey,
      afterSubBytes: r.afterSubBytes,
      afterShiftRows: r.afterShiftRows,
      afterMixColumns: r.afterMixColumns,
      afterAddRoundKey: r.afterAddRoundKey,
      roundKey: r.roundKey
    }));
  }
}