import {useCallback,useEffect,useRef} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {useAudioPlayer} from 'expo-audio';

const source=require('../../modules/zad-adhan/android/src/main/res/raw/tasbih_bead.wav');

/** Web/iOS preview path. Android uses its separate SoundPool implementation. */
export function useTasbihSound(enabled:boolean){
  const player=useAudioPlayer(source),focused=useRef(false),foreground=useRef(AppState.currentState==='active');
  const allowed=useRef(enabled);
  useFocusEffect(useCallback(()=>{
    focused.current=true;
    return()=>{focused.current=false;player.pause();};
  },[player]));
  useEffect(()=>{
    const sub=AppState.addEventListener('change',next=>{
      foreground.current=next==='active';if(next!=='active')player.pause();
    });return()=>sub.remove();
  },[player]);
  useEffect(()=>{allowed.current=enabled;if(!enabled)player.pause();},[enabled,player]);
  return useCallback(()=>{
    if(!allowed.current||!focused.current||!foreground.current)return;
    void player.seekTo(0).then(()=>{
      if(allowed.current&&focused.current&&foreground.current)player.play();
    }).catch(()=>{});
  },[player]);
}
