import { Injectable } from '@angular/core';
import { Kuznyechik } from '@li0ard/kuznyechik';

@Injectable({
  providedIn: 'root'
})
export class KuznechikService {

  private readonly PI: number[] = [
    252, 238, 221, 17, 207, 110, 49, 22, 251, 196, 250, 218, 35, 197, 4, 77,
    233, 119, 240, 219, 147, 46, 153, 186, 23, 54, 241, 187, 20, 205, 95, 193,
    249, 24, 101, 90, 226, 92, 239, 33, 129, 28, 60, 66, 139, 1, 142, 79,
    5, 132, 2, 174, 227, 106, 143, 160, 6, 11, 237, 152, 127, 212, 211, 31,
    235, 52, 44, 81, 234, 200, 72, 171, 242, 42, 104, 162, 253, 58, 206, 204,
    181, 112, 14, 86, 8, 12, 118, 18, 191, 114, 19, 71, 156, 183, 93, 135,
    21, 161, 150, 41, 16, 123, 154, 199, 243, 145, 120, 111, 157, 158, 178, 177,
    50, 117, 25, 61, 230, 53, 138, 45, 193, 3, 148, 64, 231, 70, 96, 190,
    125, 155, 30, 175, 229, 108, 192, 254, 140, 189, 210, 136, 40, 104, 169, 100,
    36, 216, 241, 128, 251, 172, 48, 202, 232, 0, 87, 228, 115, 105, 7, 85,
    80, 179, 245, 213, 165, 83, 195, 147, 9, 224, 39, 43, 27, 56, 65, 124,
    82, 173, 131, 116, 220, 170, 29, 182, 184, 244, 133, 194, 198, 215, 13, 57,
    98, 126, 255, 67, 201, 75, 246, 247, 188, 34, 209, 37, 217, 149, 107, 176,
    223, 10, 51, 121, 26, 163, 134, 248, 97, 225, 94, 102, 222, 146, 38, 168,
    15, 59, 166, 63, 236, 78, 144, 62, 214, 84, 103, 109, 167, 203, 76, 164,
    208, 89, 130, 185, 137, 68, 99, 122, 141, 73, 151, 32, 113, 74, 159, 55
  ];

  constructor() {}

  stringToBytes(str: string): number[] {
    return Array.from(new TextEncoder().encode(str));
  }

  hexToBytes(hex: string): number[] {
    const clean = hex.replace(/\s/g, '').slice(0, 64).padEnd(64, '0');
    const bytes: number[] = [];
    for (let i = 0; i < 64; i += 2) {
      bytes.push(parseInt(clean.slice(i, i + 2), 16));
    }
    return bytes.slice(0, 32);
  }

  bytesToHex(bytes: number[]): string {
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  bytesToBase64(bytes: number[]): string {
    return btoa(String.fromCharCode(...bytes));
  }

  base64ToBytes(base64: string): number[] {
    const binary = atob(base64);
    return Array.from(binary).map(c => c.charCodeAt(0));
  }

  // ========== ОСНОВНЫЕ МЕТОДЫ ШИФРОВАНИЯ ==========
  encrypt(plaintext: string, keyHex: string, mode: string = 'ECB', ivHex: string = ''): string {
    const plainBytes = this.stringToBytes(plaintext);
    const keyBytes = new Uint8Array(this.hexToBytes(keyHex));
    const kuz = new Kuznyechik(keyBytes);
    
    const padLen = 16 - (plainBytes.length % 16);
    const padded = [...plainBytes];
    for (let i = 0; i < padLen; i++) padded.push(padLen);
    
    const encrypted: number[] = [];
    
    if (mode === 'CBC') {
      let iv = ivHex ? this.hexToBytes(ivHex).slice(0, 16) : new Array(16).fill(0);
      encrypted.push(...iv);
      for (let i = 0; i < padded.length; i += 16) {
        const block = padded.slice(i, i + 16);
        const xored = block.map((b, j) => b ^ iv[j]);
        iv = Array.from(kuz.encryptBlock(new Uint8Array(xored)));
        encrypted.push(...iv);
      }
    } else if (mode === 'CTR') {
      let nonce = ivHex ? this.hexToBytes(ivHex).slice(0, 8) : new Array(8).fill(0);
      encrypted.push(...nonce);
      for (let i = 0, ctr = 0; i < padded.length; i += 16, ctr++) {
        const ctrBlock = [...nonce];
        for (let j = 7; j >= 0; j--) ctrBlock.push((ctr >> (j * 8)) & 0xFF);
        const enc = Array.from(kuz.encryptBlock(new Uint8Array(ctrBlock))) as number[];
        const block = padded.slice(i, i + 16);
        for (let j = 0; j < 16 && (i + j) < padded.length; j++) {
          encrypted.push(block[j] ^ enc[j]);
        }
      }
    } else {
      for (let i = 0; i < padded.length; i += 16) {
        const block = padded.slice(i, i + 16);
        const enc = Array.from(kuz.encryptBlock(new Uint8Array(block))) as number[];
        encrypted.push(...enc);
      }
    }
    return this.bytesToBase64(encrypted);
  }

  encryptToBase64(plaintext: string, keyHex: string, mode: string = 'ECB', ivHex: string = ''): string {
    return this.encrypt(plaintext, keyHex, mode, ivHex);
  }

  decrypt(ciphertextBase64: string, keyHex: string, mode: string = 'ECB', ivHex: string = ''): string {
    try {
      const cipherBytes = this.base64ToBytes(ciphertextBase64);
      const keyBytes = new Uint8Array(this.hexToBytes(keyHex));
      const kuz = new Kuznyechik(keyBytes);
      let result: number[] = [];
      
      if (mode === 'CBC') {
        if (cipherBytes.length < 32) return 'Ошибка CBC';
        let iv = cipherBytes.slice(0, 16);
        const data = cipherBytes.slice(16);
        for (let i = 0; i < data.length; i += 16) {
          const block = data.slice(i, i + 16);
          const decrypted = Array.from(kuz.decryptBlock(new Uint8Array(block))) as number[];
          result.push(...decrypted.map((b: number, j: number) => b ^ iv[j]));
          iv = block;
        }
      } else if (mode === 'CTR') {
        if (cipherBytes.length < 8) return 'Ошибка CTR';
        const nonce = cipherBytes.slice(0, 8);
        const data = cipherBytes.slice(8);
        for (let i = 0, ctr = 0; i < data.length; i += 16, ctr++) {
          const ctrBlock = [...nonce];
          for (let j = 7; j >= 0; j--) ctrBlock.push((ctr >> (j * 8)) & 0xFF);
          const enc = Array.from(kuz.encryptBlock(new Uint8Array(ctrBlock))) as number[];
          const block = data.slice(i, i + 16);
          for (let j = 0; j < block.length; j++) {
            result.push(block[j] ^ enc[j]);
          }
        }
      } else {
        for (let i = 0; i < cipherBytes.length; i += 16) {
          const block = cipherBytes.slice(i, i + 16);
          const decrypted = Array.from(kuz.decryptBlock(new Uint8Array(block))) as number[];
          result.push(...decrypted);
        }
      }
      
      const padLen = result[result.length - 1];
      if (padLen > 0 && padLen <= 16) {
        result = result.slice(0, result.length - padLen);
      }
      return new TextDecoder().decode(new Uint8Array(result));
    } catch (e) {
      return 'Ошибка расшифрования';
    }
  }

  get128BitBlock(text: string): number[] {
    const bytes = this.stringToBytes(text);
    while (bytes.length < 16) bytes.push(0);
    return bytes.slice(0, 16);
  }

  // ========== L-ПРЕОБРАЗОВАНИЕ (ИСПРАВЛЕННОЕ) ==========
// ========== L-ПРЕОБРАЗОВАНИЕ (ГОСТ Р 34.12-2015) ==========
private applyL(block: number[]): number[] {
    // Копируем исходный блок, чтобы не мутировать аргумент
    let state = [...block];

    // L-преобразование состоит из 16 последовательных применений функции R
    for (let i = 0; i < 16; i++) {
        state = this.applyR(state);
    }

    return state;
}

// Функция R (один шаг сдвигового регистра)
private applyR(state: number[]): number[] {
    const lvec = [148, 32, 133, 16, 194, 192, 1, 251, 1, 192, 194, 16, 133, 32, 148, 1];
    let sum = 0;

    // Вычисляем линейную комбинацию всех 16 байт
    for (let i = 0; i < 16; i++) {
        sum ^= this.gfMul(state[i], lvec[i]);
    }

    // Сдвигаем все байты влево (в сторону младших индексов)
    // А новое вычисленное значение sum помещаем в самый конец (15-й индекс)
    let nextState = new Array(16);
    for (let i = 0; i < 15; i++) {
        nextState[i] = state[i + 1];
    }
    nextState[15] = sum;

    return nextState;
}

// Умножение в GF(2⁸) для Кузнечика (модифицированный полином)
private gfMul(a: number, b: number): number {
    let result = 0;
    let tempA = a;
    let tempB = b;

    for (let i = 0; i < 8; i++) {
        if ((tempB & 1) !== 0) {
            result ^= tempA;
        }
        
        const highBit = tempA & 0x80;
        tempA <<= 1;
        tempA &= 0xFF; // Ограничиваем до 8 бит после сдвига
        
        if (highBit !== 0) {
            // Используем 0xC3 вместо 0x1C3, так как 9-й бит (0x100) 
            // уже отсечен маской &= 0xFF. Это математически эквивалентно.
            tempA ^= 0xC3; 
        }
        
        tempB >>= 1;
    }
    return result;
}


  getRoundsForAnimation(plaintext: string, keyHex: string): any[] {
    const bytes = this.stringToBytes(plaintext);
    const padded = [...bytes];
    while (padded.length < 16) padded.push(0);
    const block = padded.slice(0, 16);
    
    const keyBytes = new Uint8Array(this.hexToBytes(keyHex));
    const kuz = new Kuznyechik(keyBytes);
    const roundKeys = kuz.getRoundKeys();
    
    const rounds: any[] = [];
    let state = [...block];
    
    for (let i = 0; i < 9; i++) {
      const key = Array.from(roundKeys[i]);
      const afterX = state.map((b, j) => b ^ key[j]);
      const afterS = afterX.map(b => this.PI[b]);
      const afterL = this.applyL(afterS);
      rounds.push({
        round: i + 1,
        input: [...state],
        afterX: [...afterX],
        afterS: [...afterS],
        afterL: [...afterL],
        roundKey: [...key]
      });
      state = afterL;
    }
    
    const key10 = Array.from(roundKeys[9]);
    const afterX10 = state.map((b, j) => b ^ key10[j]);
    const afterS10 = afterX10.map(b => this.PI[b]);
    rounds.push({
      round: 10,
      input: [...state],
      afterX: [...afterX10],
      afterS: [...afterS10],
      afterL: [...afterS10],
      roundKey: [...key10]
    });
    
    return rounds;
  }

  getFullEncryptionBits(plaintext: string, keyHex: string): string[] {
    const bytes = this.stringToBytes(plaintext);
    while (bytes.length < 16) bytes.push(0);
    const block = bytes.slice(0, 16);
    
    const keyBytes = new Uint8Array(this.hexToBytes(keyHex));
    const kuz = new Kuznyechik(keyBytes);
    const encrypted = Array.from(kuz.encryptBlock(new Uint8Array(block))) as number[];
    
    let bits = '';
    for (let i = 0; i < 16; i++) {
      bits += (encrypted[i] || 0).toString(2).padStart(8, '0');
    }
    return bits.split('');
  }

  getPI(): number[] {
    return [...this.PI];
  }

  encryptFile(fileBytes: Uint8Array, keyHex: string, mode: string = 'ECB'): { encrypted: Uint8Array; time: number } {
    const keyBytes = new Uint8Array(this.hexToBytes(keyHex));
    const kuz = new Kuznyechik(keyBytes);
    
    const padLen = 16 - (fileBytes.length % 16);
    const padded = new Uint8Array(fileBytes.length + padLen);
    padded.set(fileBytes);
    for (let i = fileBytes.length; i < padded.length; i++) padded[i] = padLen;
    
    const start = performance.now();
    const encrypted = new Uint8Array(padded.length);
    for (let i = 0; i < padded.length; i += 16) {
      const block = padded.slice(i, i + 16);
      const enc = kuz.encryptBlock(block);
      encrypted.set(enc, i);
    }
    const end = performance.now();
    
    return { encrypted, time: end - start };
  }

  decryptFile(encryptedBytes: Uint8Array, keyHex: string): Uint8Array {
    const keyBytes = new Uint8Array(this.hexToBytes(keyHex));
    const kuz = new Kuznyechik(keyBytes);
    
    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i += 16) {
      const block = encryptedBytes.slice(i, i + 16);
      const dec = kuz.decryptBlock(block);
      decrypted.set(dec, i);
    }
    
    const padLen = decrypted[decrypted.length - 1];
    if (padLen > 0 && padLen <= 16) {
      return decrypted.slice(0, decrypted.length - padLen);
    }
    return decrypted;
  }
}