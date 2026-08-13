import * as ExpoCrypto from 'expo-crypto';
export function ensurePkceCrypto(){
  try{
    const existing=globalThis.crypto;
    const value=existing??{};
    if(typeof existing?.getRandomValues!=='function')Object.defineProperty(value,'getRandomValues',{value:ExpoCrypto.getRandomValues,configurable:true});
    if(typeof existing?.randomUUID!=='function')Object.defineProperty(value,'randomUUID',{value:ExpoCrypto.randomUUID,configurable:true});
    if(typeof existing?.subtle?.digest!=='function')Object.defineProperty(value,'subtle',{value:{digest:(algorithm:AlgorithmIdentifier,data:BufferSource)=>{
      const name=typeof algorithm==='string'?algorithm:algorithm.name;
      if(name!=='SHA-256')throw new Error('UNSUPPORTED_DIGEST');return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256,data);
    }},configurable:true});
    if(!existing)Object.defineProperty(globalThis,'crypto',{value,configurable:true});
    return true;
  }catch{return false;}
}
