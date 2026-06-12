import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DesService {

  // ===== ТАБЛИЦЫ DES (без изменений) =====
  private readonly IP = [
    58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7
  ];

  private readonly FP = [
    40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
    38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
    36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
    34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25
  ];

  private readonly E = [
    32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13,
    12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25,
    24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1
  ];

  private readonly P = [
    16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10,
    2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25
  ];

  private readonly S: number[][][] = [
    [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
    [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
    [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
    [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
    [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
    [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
    [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
    [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]]
  ];

  private readonly PC1 = [
    57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,
    63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4
  ];

  private readonly PC2 = [
    14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,
    41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32
  ];

  private readonly SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  
  stringToBinary(str: string): string {
    return str.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }

  binaryToString(binary: string): string {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes.map(byte => 
      String.fromCharCode(parseInt(byte, 2))
    ).join('');
  }

  // ===== ВАЖНО: БИНАРНЫЙ В BASE64 =====
  binaryToBase64(binary: string): string {
    const bytes: number[] = [];
    for (let i = 0; i < binary.length; i += 8) {
      bytes.push(parseInt(binary.slice(i, i + 8), 2));
    }
    return btoa(String.fromCharCode(...bytes));
  }

  // ===== ВАЖНО: BASE64 В БИНАРНЫЙ =====
  base64ToBinary(base64: string): string {
    const decoded = atob(base64);
    return decoded.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }

  permute(block: string, table: number[]): string {
    return table.map(pos => block[pos - 1]).join('');
  }

  xor(a: string, b: string): string {
    return a.split('').map((bit, i) => bit === b[i] ? '0' : '1').join('');
  }

  leftShift(key: string, shift: number): string {
    return key.slice(shift) + key.slice(0, shift);
  }

  // ===== PKCS#7 PADDING =====
  
  padData(data: string, blockSize: number = 8): string {
    const paddingLength = blockSize - (data.length % blockSize);
    const paddingChar = String.fromCharCode(paddingLength);
    return data + paddingChar.repeat(paddingLength);
  }

  unpadData(data: string): string {
    if (!data) return '';
    const paddingLength = data.charCodeAt(data.length - 1);
    if (paddingLength > 8 || paddingLength === 0) return data;
    return data.slice(0, -paddingLength);
  }

  // ===== ГЕНЕРАЦИЯ КЛЮЧЕЙ =====
  
  generateKeys(key: string): string[] {
    let keyBin = this.stringToBinary(key).padEnd(64, '0').slice(0, 64);
    let permutedKey = this.permute(keyBin, this.PC1);
    
    let C = permutedKey.slice(0, 28);
    let D = permutedKey.slice(28, 56);
    
    const keys: string[] = [];
    
    for (let i = 0; i < 16; i++) {
      C = this.leftShift(C, this.SHIFTS[i]);
      D = this.leftShift(D, this.SHIFTS[i]);
      keys.push(this.permute(C + D, this.PC2));
    }
    
    return keys;
  }

  // ===== F-ФУНКЦИЯ =====
  
  fFunction(right: string, key: string): string {
    let expanded = this.permute(right, this.E);
    let xored = this.xor(expanded, key);
    
    let output = '';
    for (let i = 0; i < 8; i++) {
      const chunk = xored.slice(i * 6, (i + 1) * 6);
      const row = parseInt(chunk[0] + chunk[5], 2);
      const col = parseInt(chunk.slice(1, 5), 2);
      const value = this.S[i][row][col];
      output += value.toString(2).padStart(4, '0');
    }
    
    return this.permute(output, this.P);
  }

  // ===== ШИФРОВАНИЕ ОДНОГО БЛОКА =====
  
  encryptBlock(block: string, keys: string[]): string {
    let permuted = this.permute(block, this.IP);
    
    let L = permuted.slice(0, 32);
    let R = permuted.slice(32, 64);
    
    for (let i = 0; i < 16; i++) {
      const fResult = this.fFunction(R, keys[i]);
      const newR = this.xor(L, fResult);
      L = R;
      R = newR;
    }
    
    let preOutput = R + L;
    return this.permute(preOutput, this.FP);
  }

  // ===== РАСШИФРОВАНИЕ ОДНОГО БЛОКА =====
  
  decryptBlock(block: string, keys: string[]): string {
    let permuted = this.permute(block, this.IP);
    
    let L = permuted.slice(0, 32);
    let R = permuted.slice(32, 64);
    
    for (let i = 15; i >= 0; i--) {
      const fResult = this.fFunction(R, keys[i]);
      const newR = this.xor(L, fResult);
      L = R;
      R = newR;
    }
    
    let preOutput = R + L;
    return this.permute(preOutput, this.FP);
  }

  // ===== ECB РЕЖИМ =====
  
  private encryptECB(plaintext: string, keys: string[]): string {
    const padded = this.padData(plaintext, 8);
    let resultBinary = '';
    
    for (let i = 0; i < padded.length; i += 8) {
      const block = padded.slice(i, i + 8);
      const blockBinary = this.stringToBinary(block);
      const encrypted = this.encryptBlock(blockBinary, keys);
      resultBinary += encrypted;
    }
    
    return this.binaryToBase64(resultBinary);  // ← BASE64
  }

  private decryptECB(ciphertextBase64: string, keys: string[]): string {
    const binary = this.base64ToBinary(ciphertextBase64);
    let result = '';
    
    for (let i = 0; i < binary.length; i += 64) {
      const block = binary.slice(i, i + 64);
      const decrypted = this.decryptBlock(block, keys);
      result += this.binaryToString(decrypted);
    }
    
    return this.unpadData(result);
  }

  // ===== CBC РЕЖИМ =====
  
  private encryptCBC(plaintext: string, keys: string[], iv: string): string {
    const padded = this.padData(plaintext, 8);
    const ivBinary = this.stringToBinary(iv.padEnd(8, '\0').slice(0, 8));
    let prevBlock = ivBinary;
    let resultBinary = ivBinary;
    
    for (let i = 0; i < padded.length; i += 8) {
      const block = padded.slice(i, i + 8);
      const blockBinary = this.stringToBinary(block);
      const xored = this.xor(blockBinary, prevBlock);
      const encrypted = this.encryptBlock(xored, keys);
      resultBinary += encrypted;
      prevBlock = encrypted;
    }
    
    return this.binaryToBase64(resultBinary);  // ← BASE64 (IV внутри)
  }

  private decryptCBC(ciphertextBase64: string, keys: string[]): string {
    const binary = this.base64ToBinary(ciphertextBase64);
    const ivBinary = binary.slice(0, 64);
    let prevBlock = ivBinary;
    let result = '';
    
    for (let i = 64; i < binary.length; i += 64) {
      const block = binary.slice(i, i + 64);
      const decrypted = this.decryptBlock(block, keys);
      const xored = this.xor(decrypted, prevBlock);
      result += this.binaryToString(xored);
      prevBlock = block;
    }
    
    return this.unpadData(result);
  }

  // ===== CTR РЕЖИМ =====
  
  private encryptCTR(plaintext: string, keys: string[], nonce: string): string {
    const nonceBin = this.stringToBinary(nonce.padEnd(8, '\0').slice(0, 8));
    let counter = 0;
    let resultBinary = nonceBin;
    
    for (let i = 0; i < plaintext.length; i += 8) {
      const counterBin = counter.toString(2).padStart(64, '0');
      const counterBlock = nonceBin.slice(0, 32) + counterBin.slice(32, 64);
      const encrypted = this.encryptBlock(counterBlock, keys);
      
      const block = plaintext.slice(i, i + 8);
      const blockBinary = this.stringToBinary(block.padEnd(8, '\0'));
      const xored = this.xor(blockBinary, encrypted);
      resultBinary += xored.slice(0, block.length * 8);
      counter++;
    }
    
    return this.binaryToBase64(resultBinary);  // ← BASE64 (Nonce внутри)
  }

  private decryptCTR(ciphertextBase64: string, keys: string[]): string {
    const binary = this.base64ToBinary(ciphertextBase64);
    const nonceBin = binary.slice(0, 64);
    let counter = 0;
    let result = '';
    
    for (let i = 64; i < binary.length; i += 64) {
      const counterBin = counter.toString(2).padStart(64, '0');
      const counterBlock = nonceBin.slice(0, 32) + counterBin.slice(32, 64);
      const encrypted = this.encryptBlock(counterBlock, keys);
      
      const block = binary.slice(i, Math.min(i + 64, binary.length));
      const xored = this.xor(block, encrypted.slice(0, block.length));
      result += this.binaryToString(xored);
      counter++;
    }
    
    return result.replace(/\0/g, '');
  }

  // ===== ПУБЛИЧНЫЕ МЕТОДЫ =====
  
  encrypt(plaintext: string, key: string, mode: string = 'ECB', iv: string = ''): string {
    const keys = this.generateKeys(key);
    
    switch (mode) {
      case 'CBC':
        return this.encryptCBC(plaintext, keys, iv || '12345678');
      case 'CTR':
        return this.encryptCTR(plaintext, keys, iv || '12345678');
      case 'ECB':
      default:
        return this.encryptECB(plaintext, keys);
    }
  }

  decrypt(ciphertext: string, key: string, mode: string = 'ECB'): string {
    const keys = this.generateKeys(key);
    
    switch (mode) {
      case 'CBC':
        return this.decryptCBC(ciphertext, keys);
      case 'CTR':
        return this.decryptCTR(ciphertext, keys);
      case 'ECB':
      default:
        return this.decryptECB(ciphertext, keys);
    }
  }

  // ===== ДЛЯ ВИЗУАЛИЗАЦИИ (без изменений) =====
  
  get64BitBlock(text: string): string[] {
    const padded = this.padData(text, 8);
    const firstBlock = padded.slice(0, 8);
    return this.stringToBinary(firstBlock).split('');
  }

  splitLR(bits: string[]): { L0: string[], R0: string[] } {
    const permuted = this.permute(bits.join(''), this.IP);
    return {
      L0: permuted.slice(0, 32).split(''),
      R0: permuted.slice(32, 64).split('')
    };
  }

  getRoundsForAnimation(plaintext: string, key: string): Array<{ L: string, R: string, fResult: string }> {
    const padded = this.padData(plaintext, 8);
    const firstBlock = padded.slice(0, 8);
    let binary = this.stringToBinary(firstBlock);
    let block = this.permute(binary, this.IP);
    
    let L = block.slice(0, 32);
    let R = block.slice(32, 64);
    
    const keys = this.generateKeys(key);
    const rounds: Array<{ L: string, R: string, fResult: string }> = [];
    
    for (let i = 0; i < 16; i++) {
      const fResult = this.fFunction(R, keys[i]);
      const newR = this.xor(L, fResult);
      
      rounds.push({
        L: R,
        R: newR,
        fResult: fResult
      });
      
      L = R;
      R = newR;
    }
    
    return rounds;
  }

getFullEncryptionBits(plaintext: string, key: string): string[] {
  const encrypted = this.encrypt(plaintext, key, 'ECB');
  const binary = this.base64ToBinary(encrypted);
  return binary.split('').slice(0, 64);
}
}