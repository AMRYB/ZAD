import React,{useState} from 'react';
import {router} from 'expo-router';
import {useApp} from '../state/AppContext';
import {adhanNative} from '../services/adhan-native';
import {Button,Card,Screen,Txt} from '../ui/components';
export function Widget(){
  const {t}=useApp();const [message,setMessage]=useState('');
  return <Screen title={t('زاد على شاشة هاتفك','ZAD on your home screen')} subtitle={t('الموعد القادم، ووردك بضغطة','Your next prayer and reading, one tap away')}><Button secondary label={t('العودة','Back')} onPress={()=>router.canGoBack()?router.back():router.replace('/more')}/>
    <Card><Txt bold size={23}>{t('اختصار يبقى معاك','A companion at a glance')}</Txt><Txt>{t('الصلاة القادمة لمدينتك، وزر لمتابعة القراءة وزر للسبحة. الألوان تتبع مظهر زاد، ويمكنك تغيير الحجم على الشاشة.','Your city’s next prayer, a reading shortcut and a Tasbih shortcut. Colors follow ZAD’s appearance, and you can resize it on your home screen.')}</Txt><Button label={t('إضافة إلى الشاشة الرئيسية','Add to home screen')} disabled={!adhanNative} onPress={()=>{try{const requested=adhanNative?.pinWidget();setMessage(requested?t('أكد الإضافة في نافذة الهاتف.','Confirm adding the widget in your launcher.'):t('اضغط مطولًا على الشاشة الرئيسية، ثم الأدوات، ثم زاد.','Long press your home screen, choose Widgets, then ZAD.'));}catch{setMessage(t('افتح أدوات الشاشة الرئيسية واختر زاد.','Open your launcher’s Widgets and choose ZAD.'));}}}/>{message?<Txt accessibilityLiveRegion="polite">{message}</Txt>:null}</Card>
    <Card><Txt muted>{t('اختار مدينتك وافتح المواقيت أول مرة لتحميلها. الأداة تستخدم المواقيت المحفوظة فقط، ولا تطلب موقعك. بدون إذن المنبهات الدقيقة قد يتأخر تحديث موعد الصلاة التالية.','Choose your city and load its times once. The widget uses saved timetables only and does not request your location. Without exact-alarm access, switching to the following prayer may be delayed.')}</Txt><Button secondary label={t('افتح المواقيت','Open prayer times')} onPress={()=>router.push('/adhan')}/></Card>
    {!adhanNative?<Txt muted>{t('أداة الشاشة الرئيسية متاحة في نسخة Android.','The home-screen widget is available in the Android build.')}</Txt>:null}
  </Screen>;
}
