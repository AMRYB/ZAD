import React from 'react';
import { ActivityIndicator,View } from 'react-native';
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
const queryClient=new QueryClient({defaultOptions:{queries:{retry:false,staleTime:300000,gcTime:300000,refetchOnWindowFocus:false}}});
function Gate(){
  const {state,dark,colors,restoreEpoch}=useApp();
  return <View style={{flex:1,backgroundColor:colors.background,direction:'ltr'}}><StatusBar style={dark?'light':'dark'}/>{state.onboarded?<><Stack key={restoreEpoch} screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.background}}}><Stack.Screen name="(tabs)"/><Stack.Screen name="plans"/><Stack.Screen name="calendar"/></Stack><RecitationBar/></>:<Onboarding/>}</View>;
}
export default function RootLayout(){
  const [loaded,error]=useFonts({Cairo_400Regular,Cairo_700Bold,...iconFonts});
  if(!loaded&&!error)return <View style={{flex:1,backgroundColor:'#F8FAF7',justifyContent:'center',alignItems:'center'}}><ActivityIndicator color="#176B57"/></View>;
  return <QueryClientProvider client={queryClient}><AuthProvider><AppProvider><SyncProvider><RecitationProvider><AdhanCoordinator/><PersonalReminderCoordinator/><WidgetCoordinator/><Gate/></RecitationProvider></SyncProvider></AppProvider></AuthProvider></QueryClientProvider>;
}
