import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AppState,BackHandler,Pressable,StyleSheet,View} from 'react-native';
import {VideoView,useVideoPlayer} from 'expo-video';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../state/AppContext';
import {Txt} from './components';
export function StartupIntro({onDone}:{onDone:()=>void}){
  const {t,rtl}=useApp(),insets=useSafeAreaInsets(),ended=useRef(false);
  const [muted,setMuted]=useState(true);
  const player=useVideoPlayer(require('../../assets/branding/intro.mp4'),value=>{value.loop=false;value.muted=true;value.audioMixingMode='mixWithOthers';value.staysActiveInBackground=false;value.showNowPlayingNotification=false;});
  const finish=useCallback(()=>{if(ended.current)return;ended.current=true;player.pause();onDone();},[player,onDone]);
  useEffect(()=>{
    const end=player.addListener('playToEnd',finish);
    const error=player.addListener('statusChange',event=>{if(event.status==='error')finish();});
    const back=BackHandler.addEventListener('hardwareBackPress',()=>{finish();return true;});
    const app=AppState.addEventListener('change',status=>{if(ended.current)return;if(status==='active')player.play();else player.pause();});
    const timeout=setTimeout(finish,25000);
    // Start after VideoView mounts; the web player has no mounted media element during setup.
    if(AppState.currentState!=='background'&&AppState.currentState!=='inactive')player.play();
    return()=>{end.remove();error.remove();back.remove();app.remove();clearTimeout(timeout);};
  },[player,finish]);
  const toggleSound=()=>{const next=!muted;
    // eslint-disable-next-line react-hooks/immutability -- Expo Video SharedObject invokes a native setter, not a React state mutation.
    player.muted=next;setMuted(next);};
  const button={minHeight:48,paddingHorizontal:20,justifyContent:'center' as const,borderRadius:24,backgroundColor:'rgba(8,14,19,0.75)',borderWidth:1,borderColor:'rgba(255,255,255,0.3)'};
  return <View testID="startup-video-intro" accessibilityViewIsModal style={[StyleSheet.absoluteFill,{backgroundColor:'#080E13',zIndex:100}]}>
    <VideoView player={player} style={[StyleSheet.absoluteFill,{width:'100%',height:'100%'}]} contentFit="contain" surfaceType="textureView" nativeControls={false} fullscreenOptions={{enable:false}} allowsPictureInPicture={false}/>
    <View style={{position:'absolute',top:insets.top+12,left:20,right:20,alignItems:rtl?'flex-start':'flex-end'}}><Pressable accessibilityRole="button" accessibilityLabel={t('تخطي المقدمة','Skip intro')} onPress={finish} style={button}><Txt bold size={14} style={{color:'#FFFFFF'}}>{t('تخطّي','Skip')}</Txt></Pressable></View>
    <View style={{position:'absolute',bottom:insets.bottom+20,left:20,right:20,alignItems:rtl?'flex-end':'flex-start'}}><Pressable accessibilityRole="button" accessibilityLabel={muted?t('تشغيل صوت المقدمة','Unmute intro'):t('كتم صوت المقدمة','Mute intro')} onPress={toggleSound} style={button}><Txt size={13} style={{color:'#FFFFFF'}}>{muted?t('تشغيل الصوت','Sound on'):t('كتم الصوت','Mute')}</Txt></Pressable></View>
  </View>;
}
