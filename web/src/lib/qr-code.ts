const version = 10;
const size = version * 4 + 17;
const dataCodewords = 154;
const rawCodewords = 346;
const errorCorrectionCodewords = 24;
const errorCorrectionBlocks = 8;
const shortBlocks = 6;
const shortBlockDataCodewords = 19;
const maskPattern = 0;
const quartileFormatBits = 3;

type Block = {
  data: number[];
  errorCorrection: number[];
};

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0;
}

function appendBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1);
  }
}

function bitsToCodewords(bits: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) {
      value = (value << 1) | bits[i + j];
    }
    result.push(value);
  }
  return result;
}

function encodeData(text: string): number[] {
  const bytes = [...new TextEncoder().encode(text)];
  const capacityBits = dataCodewords * 8;
  const bits: number[] = [];

  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 16);
  for (const byte of bytes) appendBits(bits, byte, 8);

  if (bits.length > capacityBits) {
    throw new Error("QR payload is too long.");
  }

  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8 !== 0) appendBits(bits, 0, 1);

  const codewords = bitsToCodewords(bits);
  for (let pad = 0xec; codewords.length < dataCodewords; pad ^= 0xec ^ 0x11) {
    codewords.push(pad);
  }

  return codewords;
}

function reedSolomonMultiply(x: number, y: number): number {
  let result = 0;
  for (let i = 7; i >= 0; i -= 1) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    result ^= ((y >>> i) & 1) * x;
  }
  return result;
}

function reedSolomonDivisor(degree: number): number[] {
  const result = Array<number>(degree).fill(0);
  result[degree - 1] = 1;

  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = reedSolomonMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = reedSolomonMultiply(root, 2);
  }

  return result;
}

function reedSolomonRemainder(data: number[], divisor: number[]): number[] {
  const result = Array<number>(divisor.length).fill(0);

  for (const codeword of data) {
    const factor = codeword ^ result.shift()!;
    result.push(0);
    for (let i = 0; i < result.length; i += 1) {
      result[i] ^= reedSolomonMultiply(divisor[i], factor);
    }
  }

  return result;
}

function addErrorCorrection(data: number[]): number[] {
  const divisor = reedSolomonDivisor(errorCorrectionCodewords);
  const blocks: Block[] = [];
  let offset = 0;

  for (let i = 0; i < errorCorrectionBlocks; i += 1) {
    const blockLength = shortBlockDataCodewords + (i < shortBlocks ? 0 : 1);
    const blockData = data.slice(offset, offset + blockLength);
    offset += blockLength;
    blocks.push({
      data: blockData,
      errorCorrection: reedSolomonRemainder(blockData, divisor),
    });
  }

  const result: number[] = [];
  const maxDataLength = shortBlockDataCodewords + 1;

  for (let i = 0; i < maxDataLength; i += 1) {
    for (const block of blocks) {
      if (i < block.data.length) result.push(block.data[i]);
    }
  }

  for (let i = 0; i < errorCorrectionCodewords; i += 1) {
    for (const block of blocks) result.push(block.errorCorrection[i]);
  }

  if (result.length !== rawCodewords) {
    throw new Error("QR codeword count mismatch.");
  }

  return result;
}

function createEmptyMatrix(): { modules: boolean[][]; functionModules: boolean[][] } {
  return {
    modules: Array.from({ length: size }, () => Array<boolean>(size).fill(false)),
    functionModules: Array.from({ length: size }, () => Array<boolean>(size).fill(false)),
  };
}

function maskApplies(x: number, y: number): boolean {
  return (x + y) % 2 === 0;
}

function formatBits(): number {
  const data = (quartileFormatBits << 3) | maskPattern;
  let remainder = data;
  for (let i = 0; i < 10; i += 1) {
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  }
  return ((data << 10) | remainder) ^ 0x5412;
}

function versionBits(): number {
  let remainder = version;
  for (let i = 0; i < 12; i += 1) {
    remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
  }
  return (version << 12) | remainder;
}

function setFunctionModule(
  modules: boolean[][],
  functionModules: boolean[][],
  x: number,
  y: number,
  isDark: boolean
): void {
  modules[y][x] = isDark;
  functionModules[y][x] = true;
}

function drawFinder(
  modules: boolean[][],
  functionModules: boolean[][],
  centerX: number,
  centerY: number
): void {
  for (let dy = -4; dy <= 4; dy += 1) {
    for (let dx = -4; dx <= 4; dx += 1) {
      const x = centerX + dx;
      const y = centerY + dy;
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      setFunctionModule(
        modules,
        functionModules,
        x,
        y,
        distance !== 2 && distance !== 4
      );
    }
  }
}

function drawAlignment(
  modules: boolean[][],
  functionModules: boolean[][],
  centerX: number,
  centerY: number
): void {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      setFunctionModule(
        modules,
        functionModules,
        centerX + dx,
        centerY + dy,
        Math.max(Math.abs(dx), Math.abs(dy)) !== 1
      );
    }
  }
}

function drawFunctionPatterns(modules: boolean[][], functionModules: boolean[][]): void {
  drawFinder(modules, functionModules, 3, 3);
  drawFinder(modules, functionModules, size - 4, 3);
  drawFinder(modules, functionModules, 3, size - 4);

  for (let i = 0; i < size; i += 1) {
    setFunctionModule(modules, functionModules, 6, i, i % 2 === 0);
    setFunctionModule(modules, functionModules, i, 6, i % 2 === 0);
  }

  for (const y of [6, 28, 50]) {
    for (const x of [6, 28, 50]) {
      if ((x === 6 && y === 6) || (x === 6 && y === 50) || (x === 50 && y === 6)) {
        continue;
      }
      drawAlignment(modules, functionModules, x, y);
    }
  }

  const format = formatBits();
  for (let i = 0; i <= 5; i += 1) setFunctionModule(modules, functionModules, 8, i, getBit(format, i));
  setFunctionModule(modules, functionModules, 8, 7, getBit(format, 6));
  setFunctionModule(modules, functionModules, 8, 8, getBit(format, 7));
  setFunctionModule(modules, functionModules, 7, 8, getBit(format, 8));
  for (let i = 9; i < 15; i += 1) setFunctionModule(modules, functionModules, 14 - i, 8, getBit(format, i));
  for (let i = 0; i < 8; i += 1) setFunctionModule(modules, functionModules, size - 1 - i, 8, getBit(format, i));
  for (let i = 8; i < 15; i += 1) setFunctionModule(modules, functionModules, 8, size - 15 + i, getBit(format, i));
  setFunctionModule(modules, functionModules, 8, size - 8, true);

  const versionInfo = versionBits();
  for (let i = 0; i < 18; i += 1) {
    const bit = getBit(versionInfo, i);
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    setFunctionModule(modules, functionModules, a, b, bit);
    setFunctionModule(modules, functionModules, b, a, bit);
  }
}

function drawCodewords(
  modules: boolean[][],
  functionModules: boolean[][],
  codewords: number[]
): void {
  let bitIndex = 0;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;

    for (let vertical = 0; vertical < size; vertical += 1) {
      for (let column = 0; column < 2; column += 1) {
        const x = right - column;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vertical : vertical;
        if (functionModules[y][x]) continue;

        const codeword = codewords[Math.floor(bitIndex / 8)] ?? 0;
        const isDark = getBit(codeword, 7 - (bitIndex % 8)) !== maskApplies(x, y);
        modules[y][x] = isDark;
        bitIndex += 1;
      }
    }
  }
}

export function createQrMatrix(text: string): boolean[][] {
  const { modules, functionModules } = createEmptyMatrix();
  drawFunctionPatterns(modules, functionModules);
  drawCodewords(modules, functionModules, addErrorCorrection(encodeData(text)));
  return modules;
}
