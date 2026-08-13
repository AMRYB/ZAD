export function ensurePkceCrypto(){return typeof globalThis.crypto?.getRandomValues==='function'&&typeof globalThis.crypto?.subtle?.digest==='function';}
