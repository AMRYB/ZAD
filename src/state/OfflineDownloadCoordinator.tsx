import {useEffect} from 'react';
import {AppState} from 'react-native';
import {quranDownloads} from '../services/quran-downloads';
export function OfflineDownloadCoordinator(){
  useEffect(()=>{const sub=AppState.addEventListener('change',state=>{if(state!=='active')void quranDownloads.pause();});return()=>{sub.remove();void quranDownloads.pause();};},[]);return null;
}
