// src/lib/totp.ts
// Pure client-side TOTP (Time-based One-time Password) implementation using Web Crypto API.
// Works out-of-the-box in modern browsers with zero external NPM dependency or polyfills.

function base32ToBytes(base32: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = base32.toUpperCase().replace(/=+$/, "");
  const length = cleaned.length;
  const bytes = new Uint8Array(Math.floor((length * 5) / 8));
  let bits = 0;
  let value = 0;
  let index = 0;
  for (let i = 0; i < length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes[index++] = (value >> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return bytes;
}

async function generateHOTP(secretBase32: string, counter: number): Promise<string> {
  const secretBytes = base32ToBytes(secretBase32);
  const counterBytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    secretBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: { name: "SHA-1" } },
    false,
    ["sign"]
  );
  const signatureBuffer = await window.crypto.subtle.sign("HMAC", cryptoKey, counterBytes);
  const signature = new Uint8Array(signatureBuffer);

  const offset = signature[signature.length - 1] & 0xf;
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

export function generateSecret(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 16; i++) {
    const idx = Math.floor(Math.random() * alphabet.length);
    secret += alphabet[idx];
  }
  return secret;
}

export function getOTPAuthURI(username: string, secret: string): string {
  return `otpauth://totp/MuntasirPortfolio:${username}?secret=${secret}&issuer=MuntasirPortfolio`;
}

export async function verifyTOTP(secretBase32: string, token: string): Promise<boolean> {
  const counter = Math.floor(Date.now() / 1000 / 30);
  for (let delay = -1; delay <= 1; delay++) {
    try {
      const expected = await generateHOTP(secretBase32, counter + delay);
      if (expected === token) {
        return true;
      }
    } catch (e) {
      // Ignore conversion or calculation errors
    }
  }
  return false;
}

export function encryptSecret(secret: string, key: string): string {
  let result = "";
  for (let i = 0; i < secret.length; i++) {
    const charCode = secret.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode ^ keyChar);
  }
  return btoa(result);
}

export function decryptSecret(encryptedBase64: string, key: string): string {
  try {
    const text = atob(encryptedBase64);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    return result;
  } catch {
    return "";
  }
}

