import {useCallback,useEffect,useState} from 'react';
import {AccessibilityInfo,AppState} from 'react-native';
import {useFocusEffect} from 'expo-router';
/** Ambient animation never runs off-screen, in the background or with reduced motion. */
export function useAmbientMotion(){
  const [focused,setFocused]=useState(false),[foreground,setForeground]=useState(AppState.currentState==='active'),[reduced,setReduced]=useState(true);
  useFocusEffect(useCallback(()=>{setFocused(true);return()=>setFocused(false);},[]));
  useEffect(()=>{let alive=true;void AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(alive)setReduced(v);});const reduce=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced),app=AppState.addEventListener('change',s=>setForeground(s==='active'));return()=>{alive=false;reduce.remove();app.remove();};},[]);
  return focused&&foreground&&!reduced;
}
