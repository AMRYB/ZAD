import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../state/AppContext';
import { Button,Card,Choice,Screen,Txt } from '../ui/components';

export function Onboarding(){
  const {state,dispatch,t,dark}=useApp();
  return <Screen title={t('خطوات صغيرة، رحلة أعمق','Small steps. A meaningful journey.')} subtitle={t('مساحة هادئة لوردك ويومك وأهدافك','A quiet space for your reading, day, and goals')}>
    <LinearGradient colors={dark?['#1C3048','#15223A']:['#176B57','#0C4639']} style={{padding:30,borderRadius:26,gap:14}}>
      <Txt size={70} style={{color:'#E4BC74',textAlign:'center'}}>☾</Txt>
      <Txt size={24} bold style={{color:'#FFFFFF'}}>{t('أهلًا بك في رحلة رمضان','Welcome to Ramadan Journey')}</Txt>
      <Txt style={{color:'#E0EEE7'}}>{t('تابع يومك بهدوء، واقرأ من المصحف الأصلي، وابنِ خطة تناسب وقتك. يمكنك استخدام التطبيق طوال العام.','Track your day, read the original Mushaf, and build a plan that fits your time. Your journey continues throughout the year.')}</Txt>
    </LinearGradient>
    <Card><Txt bold>{t('اللغة','Language')}</Txt><Choice value={state.locale} options={[{value:'ar',label:'العربية'},{value:'en',label:'English'}]} onChange={locale=>dispatch({type:'settings',locale})}/>
      <Txt bold>{t('المظهر','Appearance')}</Txt><Choice value={state.theme} options={[{value:'system',label:t('النظام','System')},{value:'light',label:t('فاتح','Light')},{value:'dark',label:t('داكن','Dark')}]} onChange={theme=>dispatch({type:'settings',theme})}/></Card>
    <Card><Txt bold>{t('خصوصيتك أولًا','Private by default')}</Txt><Txt muted>{t('سجلاتك وأهدافك محفوظة على هذا الجهاز فقط. لا حساب، ولا لوحة ترتيب عامة، ولا تتبع إعلاني. يحتاج تحميل المصحف والتلاوات والتفسير إلى الإنترنت عند طلبك.','Your records and goals stay on this device. No account, public rankings, or advertising trackers. Loading Quran pages, recitations, and tafsir requires internet access when requested.')}</Txt></Card>
    <View><Button label={t('ابدأ رحلتك','Begin your journey')} testID="onboarding-start" onPress={()=>dispatch({type:'onboard'})}/></View>
  </Screen>;
}
