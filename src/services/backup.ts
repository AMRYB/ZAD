import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import {File,Paths} from 'expo-file-system';
export async function exportBackup(text:string):Promise<void>{
  if(!await Sharing.isAvailableAsync())throw new Error('SHARING_UNAVAILABLE');
  const file=new File(Paths.cache,'ramadan-journey-backup.json');file.create({overwrite:true});file.write(text);
  await Sharing.shareAsync(file.uri,{mimeType:'application/json',dialogTitle:'Ramadan Journey'});
}
export async function chooseBackup():Promise<string|null>{
  const result=await DocumentPicker.getDocumentAsync({type:['application/json','text/plain'],copyToCacheDirectory:true});
  if(result.canceled)return null;
  const asset=result.assets[0];if(asset.size&&asset.size>10485760)throw new Error('BACKUP_TOO_LARGE');
  const text=await new File(asset.uri).text();if(text.length>10485760)throw new Error('BACKUP_TOO_LARGE');return text;
}
