import React from 'react';
import { Pressable,View } from 'react-native';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../state/AppContext';
import { Txt } from '../../ui/components';
const tabs={index:{ar:'الرئيسية',en:'Home',icon:'home-outline'},quran:{ar:'القرآن',en:'Quran',icon:'book-outline'},day:{ar:'يومي',en:'My day',icon:'sunny-outline'},progress:{ar:'تقدمي',en:'Progress',icon:'stats-chart-outline'},more:{ar:'المزيد',en:'More',icon:'grid-outline'}} as const;
export default function TabLayout(){
  const {rtl,colors,readerImmersive}=useApp();const insets=useSafeAreaInsets();
  return <Tabs backBehavior="history" screenOptions={{headerShown:false}} tabBar={({state,emitter,navigateToTab})=>readerImmersive&&state.routes[state.index]?.name==='quran'?null:<View style={{backgroundColor:colors.surface,borderTopWidth:1,borderTopColor:colors.border,paddingTop:10,paddingBottom:Math.max(insets.bottom,10),flexDirection:rtl?'row-reverse':'row',direction:'ltr'}}>
    {state.routes.map((route,index)=>{const tab=tabs[route.name as keyof typeof tabs];if(!tab)return null;const active=state.index===index;return <Pressable key={route.key} testID={`tab-${route.name}`} accessibilityRole="tab" accessibilityLabel={rtl?tab.ar:tab.en} accessibilityState={{selected:active}} aria-selected={active} onPress={()=>{const event=emitter.emit({type:'tabPress',target:route.key,canPreventDefault:true});if(!active&&!event.defaultPrevented)navigateToTab(route.key);}} style={{flex:1,minHeight:54,alignItems:'center',justifyContent:'center',gap:2}}><View style={{paddingHorizontal:18,paddingVertical:4,borderRadius:13,backgroundColor:active?colors.soft:'transparent'}}><Ionicons name={tab.icon} size={22} color={active?colors.primary:colors.muted}/></View><Txt size={11} bold={active} style={{textAlign:'center',color:active?colors.primary:colors.muted}}>{rtl?tab.ar:tab.en}</Txt></Pressable>;})}
  </View>}><Tabs.Screen name="index"/><Tabs.Screen name="quran"/><Tabs.Screen name="day"/><Tabs.Screen name="progress"/><Tabs.Screen name="more"/></Tabs>;
}
