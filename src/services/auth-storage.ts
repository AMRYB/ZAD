import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';
export const authStorage={
  getItem:async(key:string)=>Platform.OS==='web'?(typeof sessionStorage==='undefined'?null:sessionStorage.getItem(key)):SecureStore.getItemAsync(key),
  setItem:async(key:string,value:string)=>{if(Platform.OS==='web'){if(typeof sessionStorage!=='undefined')sessionStorage.setItem(key,value);}else await SecureStore.setItemAsync(key,value,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});},
  removeItem:async(key:string)=>{if(Platform.OS==='web'){if(typeof sessionStorage!=='undefined')sessionStorage.removeItem(key);}else await SecureStore.deleteItemAsync(key);},
};
