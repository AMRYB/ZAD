export async function exportBackup(text:string):Promise<void>{
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='zad-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function chooseBackup():Promise<string|null>{
  return new Promise((resolve,reject)=>{
    const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
    input.oncancel=()=>resolve(null);
    input.onchange=async()=>{const file=input.files?.[0];if(!file){resolve(null);return;}if(file.size>10485760){reject(new Error('BACKUP_TOO_LARGE'));return;}try{resolve(await file.text());}catch(error){reject(error);}};
    input.click();
  });
}
