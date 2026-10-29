import React,{memo,useEffect,useState} from 'react';
import {Animated,Easing,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import type {TimeKey} from '../core/adhan';
import {useApp} from '../state/AppContext';
import {useAmbientMotion} from './useAmbientMotion';
/** Small native emerald/gold sky illustrations, matching the app's day/night artwork. */
export const PrayerIllustration=memo(function PrayerIllustration({prayer,size=48,muted=false}:{prayer:TimeKey;size?:number;muted?:boolean}){
  const {colors,dark}=useApp(),motion=useAmbientMotion();const [phase]=useState(()=>new Animated.Value(0));
  useEffect(()=>{if(!motion||muted){phase.setValue(0);return;}const loop=Animated.loop(Animated.sequence([Animated.timing(phase,{toValue:1,duration:2200,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(phase,{toValue:0,duration:2200,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));loop.start();return()=>loop.stop();},[motion,muted,phase]);
  const night=prayer==='fajr'||prayer==='isha',horizon=prayer==='sunrise'||prayer==='maghrib',sun=size*.34;
  const gold=muted?colors.muted:colors.accent,green=muted?colors.muted:colors.primary;
  return <View accessible={false} aria-hidden style={{width:size,height:size,borderRadius:size*.34,backgroundColor:muted?colors.border:colors.soft,overflow:'hidden',opacity:muted?.6:1}}>
    <Animated.View style={{position:'absolute',left:size*.32,top:night?size*.22:horizon?size*.35:size*.2,transform:[{translateY:phase.interpolate({inputRange:[0,1],outputRange:[2,-3]})},{rotate:phase.interpolate({inputRange:[0,1],outputRange:['-5deg','5deg']})}]}}>
      <LinearGradient colors={[gold,muted?colors.muted:dark?'#D8AB61':'#F3D58C']} style={{width:sun,height:sun,borderRadius:sun}}/>
      {night?<View style={{position:'absolute',left:sun*.36,top:-sun*.15,width:sun*.85,height:sun*.85,borderRadius:sun,backgroundColor:muted?colors.border:colors.soft}}/>:Array.from({length:8},(_,i)=><View key={i} style={{position:'absolute',left:sun/2-1,top:-5,width:2,height:3,borderRadius:2,backgroundColor:gold,transformOrigin:`1px ${sun/2+5}px`,transform:[{rotate:`${i*45}deg`}]}}/>)}
    </Animated.View>
    {night?<View style={{position:'absolute',left:size*.72,top:size*.22,width:3,height:3,borderRadius:2,backgroundColor:gold}}/>:null}
    <View style={{position:'absolute',top:size*.64,left:-size*.1,width:size*.7,height:size*.5,borderTopLeftRadius:size*.5,borderTopRightRadius:size*.5,backgroundColor:green,opacity:.85}}/>
    <View style={{position:'absolute',top:size*.7,right:-size*.1,width:size*.85,height:size*.5,borderTopLeftRadius:size*.6,borderTopRightRadius:size*.6,backgroundColor:green,opacity:.5}}/>
    {prayer==='asr'?<View style={{position:'absolute',top:size*.56,right:size*.16,width:size*.28,height:3,borderRadius:4,backgroundColor:colors.surface,opacity:.8}}/>:null}
  </View>;
});
