import React,{useState} from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../state/AppContext';
import { Button,Card,Choice,Screen,Txt } from '../ui/components';
import {Setup} from './Setup';

export function Onboarding(){
  const {state,dispatch,t,dark}=useApp();
  const [customize,setCustomize]=useState(false);
  if(customize)return <Setup onDone={()=>dispatch({type:'onboard'})} onBack={()=>setCustomize(false)}/>;
  return <Screen title={t('خطوات صغيرة، رحلة أعمق','Small steps. A meaningful journey.')} subtitle={t('مساحة هادئة لوردك ويومك وأهدافك','A quiet space for your reading, day, and goals')}>
    <LinearGradient colors={dark?['#1C3048','#15223A']:['#176B57','#0C4639']} style={{padding:30,borderRadius:26,gap:14}}>
      <Txt size={70} style={{color:'#E4BC74',textAlign:'center'}}>☾</Txt>
      <Txt size={24} bold style={{color:'#FFFFFF'}}>{t('أهلًا بك في زاد','Welcome to ZAD')}</Txt>
      <Txt style={{color:'#E0EEE7'}}>{t('تابع يومك بهدوء، واقرأ من المصحف الأصلي، وابنِ خطة تناسب وقتك. يمكنك استخدام التطبيق طوال العام.','Track your day, read the original Mushaf, and build a plan that fits your time. Your journey continues throughout the year.')}</Txt>
    </LinearGradient>
    <Card><Txt bold>{t('اللغة','Language')}</Txt><Choice value={state.locale} options={[{value:'ar',label:'العربية'},{value:'en',label:'English'}]} onChange={locale=>dispatch({type:'settings',locale})}/>
      <Txt bold>{t('المظهر','Appearance')}</Txt><Choice value={state.theme} options={[{value:'system',label:t('النظام','System')},{value:'light',label:t('فاتح','Light')},{value:'dark',label:t('داكن','Dark')}]} onChange={theme=>dispatch({type:'settings',theme})}/></Card>
    <Card><Txt bold>{t('خصوصيتك أولًا','Private by default')}</Txt><Txt muted>{t('سجلاتك وأهدافك محفوظة محليًا افتراضيًا. الحساب والمزامنة اختياريان، ولا تُرفع سجلاتك إلا بعد تفعيل المزامنة. لا لوحة ترتيب عامة ولا تتبع إعلاني. يحتاج تحميل المصحف والتلاوات والتفسير إلى الإنترنت عند طلبك.','Your records and goals stay local by default. Accounts and sync are optional; records upload only after you enable sync. No public rankings or advertising trackers. Loading Quran pages, recitations, and tafsir requires internet access when requested.')}</Txt></Card>
    <View style={{gap:12}}><Button label={t('ابدأ وخصص رحلتك','Start & make it yours')} testID="onboarding-start" onPress={()=>setCustomize(true)}/><Button secondary label={t('دخول سريع كضيف','Continue as guest')} onPress={()=>dispatch({type:'onboard'})}/></View>
  </Screen>;
}
