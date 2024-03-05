import { AnalysisData } from '@/types/url';

async function importKey(base64SecretKey: string): Promise<CryptoKey> {
  const rawKey = atob(base64SecretKey);
  const keyBuffer = new Uint8Array(new ArrayBuffer(rawKey.length));

  for (let i = 0; i < rawKey.length; i++) {
    keyBuffer[i] = rawKey.charCodeAt(i);
  }

  return crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary); // Use btoa for browser or Buffer for Node.js
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encrypt(
  data: string,
  key: string
): Promise<{ encryptedData: ArrayBuffer; base64: string; iv: Uint8Array; finalStr: string }> {
  const secretKey = await importKey(key); // Use the environment variable here
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encoder = new TextEncoder();
  const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, secretKey, encoder.encode(data));
  const base64 = arrayBufferToBase64(encryptedData);

  const encryptedDataBase64 = arrayBufferToBase64(encryptedData);
  const ivBase64 = arrayBufferToBase64(iv.buffer);

  const finalStr = `${ivBase64}:${encryptedDataBase64}`;

  return { encryptedData, base64, iv, finalStr };
}

export async function decrypt(encryptedData: ArrayBuffer, iv: Uint8Array, key: string): Promise<string> {
  const secretKey = await importKey(key); // Use the environment variable here
  const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, secretKey, encryptedData);
  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

export async function decryptFinalStr(encryptedBase64: string, key: string): Promise<string> {
  const [ivBase64, encryptedDataBase64] = encryptedBase64.split(':');
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const encryptedData = base64ToArrayBuffer(encryptedDataBase64);
  return decrypt(encryptedData, iv, key);
}

export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function encryptUrlData(data: AnalysisData, key: string): Promise<AnalysisData> {
  const promisesUrl = [
    encrypt(data.sourceUrl, key),
    encrypt(data.destinationUrl, key),
    encrypt(data.title, key),
    encrypt(data.description, key)
  ];

  const promisesRedirects = data.redirects.map((url) => encrypt(url, key));

  const [sourceUrl, destinationUrl, title, description] = await Promise.all(promisesUrl).then((data) =>
    data.map((res) => res.finalStr)
  );
  const awaitedRedirects = await Promise.all(promisesRedirects).then((res) => res.map((v) => v.finalStr));

  return {
    sourceUrl,
    destinationUrl,
    title,
    description,
    redirects: awaitedRedirects
  };
}

export async function decryptUrlData(data: AnalysisData, key: string): Promise<AnalysisData> {
  const promisesUrl = [
    decryptFinalStr(data.sourceUrl, key),
    decryptFinalStr(data.destinationUrl, key),
    decryptFinalStr(data.title, key),
    decryptFinalStr(data.description, key)
  ];

  const promisesRedirects = data.redirects.map((url) => decryptFinalStr(url, key));

  const [sourceUrl, destinationUrl, title, description] = await Promise.all(promisesUrl);
  const awaitedRedirects = await Promise.all(promisesRedirects);

  return {
    sourceUrl,
    destinationUrl,
    title,
    description,
    redirects: awaitedRedirects
  };
}
