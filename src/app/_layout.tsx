import React,{useCallback,useState} from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts,Cairo_400Regular,Cairo_700Bold } from '@expo-google-fonts/cairo';
import { AppProvider } from '../state/AppProvider';
import {useApp} from '../state/AppContext';
import { Onboarding } from '../screens/Onboarding';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import {iconFonts} from '../ui/AppIcon';
import {AdhanCoordinator} from '../state/AdhanCoordinator';
import {PersonalReminderCoordinator} from '../state/PersonalReminderCoordinator';
import {RecitationProvider} from '../state/RecitationProvider';
import {RecitationBar} from '../ui/RecitationBar';
import {WidgetCoordinator} from '../state/WidgetCoordinator';
import {AuthProvider} from '../state/AuthProvider';
import {SyncProvider} from '../state/SyncProvider';
import {BrandingCoordinator} from '../state/BrandingCoordinator';
import {StartupIntro} from '../ui/StartupIntro';
import {OfflineDownloadCoordinator} from '../state/OfflineDownloadCoordinator';
const queryClient=new QueryClient({defaultOptions:{queries:{retry:false,staleTime:300000,gcTime:300000,refetchOnWindowFocus:false}}});
function Gate({introDone,onIntroDone}:{introDone:boolean;onIntroDone:()=>void}){
  const {state,dark,colors,restoreEpoch}=useApp();
  return <View style={{flex:1,backgroundColor:colors.background,direction:'ltr'}}><StatusBar style={!introDone||dark?'light':'dark'}/><View style={{flex:1}} pointerEvents={introDone?'auto':'none'} importantForAccessibility={introDone?'auto':'no-hide-descendants'} accessibilityElementsHidden={!introDone} aria-hidden={!introDone}>{state.onboarded?<><Stack key={restoreEpoch} screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.background}}}><Stack.Screen name="(tabs)"/><Stack.Screen name="plans"/><Stack.Screen name="calendar"/></Stack><RecitationBar/></>:<Onboarding/>}</View>{!introDone?<StartupIntro onDone={onIntroDone}/>:null}</View>;
}
export default function RootLayout(){
  const [introDone,setIntroDone]=useState(false);const finishIntro=useCallback(()=>setIntroDone(true),[]);
  const [loaded,error]=useFonts({Cairo_400Regular,Cairo_700Bold,...iconFonts});
  if(!loaded&&!error)return <View style={{flex:1,backgroundColor:'#080E13'}}/>;
  return <QueryClientProvider client={queryClient}><AuthProvider><AppProvider><SyncProvider><RecitationProvider><OfflineDownloadCoordinator/><BrandingCoordinator/><AdhanCoordinator/><PersonalReminderCoordinator/><WidgetCoordinator/><Gate introDone={introDone} onIntroDone={finishIntro}/></RecitationProvider></SyncProvider></AppProvider></AuthProvider></QueryClientProvider>;
}
