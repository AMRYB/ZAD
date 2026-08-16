import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useApp} from './AppContext';
import {adhanNative} from '../services/adhan-native';
export function BrandingCoordinator(){
  const {state}=useApp(),city=state.adhan.city??'',locale=state.locale;
  useEffect(()=>{
    const refresh=()=>{try{adhanNative?.configureBranding(city,locale);}catch{/* Keep the last launcher icon if the native launcher is temporarily unavailable. */}};
    refresh();const listener=AppState.addEventListener('change',value=>{if(value==='active')refresh();});
    return()=>listener.remove();
  },[city,locale]);return null;
}
