import React,{useCallback,useEffect,useRef} from 'react';
import {AppState,BackHandler,StyleSheet,View} from 'react-native';
import {VideoView,useVideoPlayer} from 'expo-video';
import {adhanNative} from '../services/adhan-native';
export function StartupIntro({onDone}:{onDone:()=>void}){
  const ended=useRef(false);
  const player=useVideoPlayer(require('../../assets/branding/intro.mp4'),value=>{value.loop=false;value.muted=true;value.audioMixingMode='mixWithOthers';value.staysActiveInBackground=false;value.showNowPlayingNotification=false;});
  const finish=useCallback(()=>{if(ended.current)return;ended.current=true;player.pause();onDone();},[player,onDone]);
  useEffect(()=>{
    adhanNative?.setIntroImmersive(true);
    const end=player.addListener('playToEnd',finish);
    const error=player.addListener('statusChange',event=>{if(event.status==='error')finish();});
    const back=BackHandler.addEventListener('hardwareBackPress',()=>{finish();return true;});
    const app=AppState.addEventListener('change',status=>{if(ended.current)return;if(status==='active'){adhanNative?.setIntroImmersive(true);player.play();}else player.pause();});
    const timeout=setTimeout(finish,25000);
    // Start after VideoView mounts; the web player has no mounted media element during setup.
    if(AppState.currentState!=='background'&&AppState.currentState!=='inactive')player.play();
    return()=>{end.remove();error.remove();back.remove();app.remove();clearTimeout(timeout);adhanNative?.setIntroImmersive(false);};
  },[player,finish]);
  return <View testID="startup-video-intro" accessibilityViewIsModal style={[StyleSheet.absoluteFill,{backgroundColor:'#080E13',overflow:'hidden',zIndex:100}]}>
    <VideoView player={player} style={[StyleSheet.absoluteFill,{width:'100%',height:'100%'}]} contentFit="cover" surfaceType="textureView" nativeControls={false} fullscreenOptions={{enable:false}} allowsPictureInPicture={false}/>
  </View>;
}
