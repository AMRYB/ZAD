import {useCallback,useEffect,useRef} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {adhanNative} from '../services/adhan-native';

/** Short SoundPool effect; does not request audio focus or create media controls. */
export function useTasbihSound(enabled:boolean){
  const focused=useRef(false),foreground=useRef(AppState.currentState==='active');
  useFocusEffect(useCallback(()=>{
    focused.current=true;adhanNative?.prepareTasbihSound?.();
    return()=>{focused.current=false;adhanNative?.releaseTasbihSound?.();};
  },[]));
  useEffect(()=>{
    const sub=AppState.addEventListener('change',next=>{
      foreground.current=next==='active';if(next!=='active')adhanNative?.stopTasbihSound?.();
    });return()=>sub.remove();
  },[]);
  useEffect(()=>{if(!enabled)adhanNative?.stopTasbihSound?.();},[enabled]);
  return useCallback(()=>{
    if(enabled&&focused.current&&foreground.current)adhanNative?.playTasbihSound?.();
  },[enabled]);
}
