/**
 * Hamming (7,4) code over positions 1..7 (indices 0..6).
 * Data bits at positions 3,5,6,7 → indices 2,4,5,6.
 * Parity bits at positions 1,2,4 → indices 0,1,3.
 */

export function encodeHamming74(dataBits) {
  if (!Array.isArray(dataBits) || dataBits.length !== 4) {
    throw new Error("Encode requires exactly 4 data bits (0 or 1)");
  }
  const d = dataBits.map((b) => (Number(b) ? 1 : 0));
  const code = new Array(7).fill(0);
  code[2] = d[0];
  code[4] = d[1];
  code[5] = d[2];
  code[6] = d[3];
  code[0] = code[2] ^ code[4] ^ code[6];
  code[1] = code[2] ^ code[5] ^ code[6];
  code[3] = code[4] ^ code[5] ^ code[6];
  return code;
}

export function computeSyndrome(received) {
  if (!Array.isArray(received) || received.length !== 7) {
    throw new Error("Syndrome requires 7 bits");
  }
  const r = received.map((b) => (Number(b) ? 1 : 0));
  const s1 = r[0] ^ r[2] ^ r[4] ^ r[6];
  const s2 = r[1] ^ r[2] ^ r[5] ^ r[6];
  const s3 = r[3] ^ r[4] ^ r[5] ^ r[6];
  const syndrome = s1 + s2 * 2 + s3 * 4;
  return { s1, s2, s3, syndrome };
}

export function decodeHamming74(received) {
  const r = received.map((b) => (Number(b) ? 1 : 0));
  if (r.length !== 7) {
    throw new Error("Decode requires 7 bits");
  }
  const { syndrome } = computeSyndrome(r);
  const corrected = r.slice();
  let errorIndex = null;
  if (syndrome !== 0) {
    errorIndex = syndrome - 1;
    if (errorIndex < 0 || errorIndex > 6) {
      throw new Error("Invalid syndrome");
    }
    corrected[errorIndex] ^= 1;
  }
  const dataBits = [corrected[2], corrected[4], corrected[5], corrected[6]];
  return {
    corrected,
    dataBits,
    errorBitIndex: errorIndex,
    syndrome,
  };
}

export function verifyCodeword(bits) {
  const r = bits.map((b) => (Number(b) ? 1 : 0));
  const { syndrome } = computeSyndrome(r);
  return syndrome === 0;
}
