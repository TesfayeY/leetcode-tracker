export async function encryptSymmetric(privateKey: string, textContent: string) {
  // Initial vector for initial state encryption
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const derivedPrivateKey = await getDerivedPrivateKey(privateKey);
  const aesKey = await deriveAesKey(derivedPrivateKey, salt, ['encrypt']);

  // Encrypting
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    aesKey,
    new TextEncoder().encode(textContent)
  );
  
  const encryptedArrayBuffer = new Uint8Array(encryptedContent);
  let buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedArrayBuffer.byteLength);

  // Set all params to the content itself with offset
  buffer.set(salt, 0);
  buffer.set(iv, salt.byteLength);
  buffer.set(encryptedArrayBuffer, salt.byteLength + iv.byteLength);
  const base64Buffer = window.btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

  return base64Buffer;
}

export async function descryptSymmetric(privateKey: string, encryptedContent: string) {
  try {
    // Turn string to buffer
    const buffer = Uint8Array.from(window.atob(encryptedContent), (content: any) => content.charCodeAt(null));

    // Slice the params via the offsets
    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 16 + 12);
    const encryptedArrayBuffer = buffer.slice(16 + 12);
    const derivedPrivateKey = await getDerivedPrivateKey(privateKey);
    const aesKey = await deriveAesKey(derivedPrivateKey, salt, ['decrypt']);

    // Decrypting
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      aesKey,
      encryptedArrayBuffer
    );

    const textContent = new TextDecoder().decode(decryptedContent);

    return textContent;
  } catch (error: OperationError) {
    return '***********************'
  }
}

async function deriveAesKey(derivedPrivateKey: any, salt: any, usage: any) {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    derivedPrivateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    usage
  );
}

async function getDerivedPrivateKey(privateKey: string) {
  return await window.crypto.subtle.importKey('raw', new TextEncoder().encode(privateKey), 'PBKDF2', false, ['deriveKey']);
}