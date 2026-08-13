import React,{useEffect,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {router} from 'expo-router';
import {dateInZone,addDays} from '../core/calendar';
import {countdown,nextPrayer} from '../core/next-prayer';
import {esaCity,cityName} from '../data/esa-cities';
import {loadPrayerMonth} from '../services/adhan-native';
import {useApp} from '../state/AppContext';
import {Button,Card,Row,Txt} from './components';
const labels={fajr:['الفجر','Fajr'],dhuhr:['الظهر','Dhuhr'],asr:['العصر','Asr'],maghrib:['المغرب','Maghrib'],isha:['العشاء','Isha']} as const;
export function NextPrayerCard(){
  const {state,t,colors}=useApp(),city=esaCity(state.adhan.city);
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const today=dateInZone(new Date(now),'Africa/Cairo'),month=today.slice(0,7),tomorrow=addDays(today,1).slice(0,7);
  const current=useQuery({queryKey:['esa-month',state.adhan.city,month],enabled:!!city,queryFn:({signal})=>loadPrayerMonth(city!.id,month,signal),staleTime:86400000,gcTime:86400000,retry:false});
  const following=useQuery({queryKey:['esa-month',state.adhan.city,tomorrow],enabled:!!city&&tomorrow!==month,queryFn:({signal})=>loadPrayerMonth(city!.id,tomorrow,signal),staleTime:86400000,gcTime:86400000,retry:false});
  const next=city?nextPrayer([current.data,following.data].filter(m=>!!m),city.id,now):null;
  return <Card style={{backgroundColor:colors.primary,borderColor:colors.primary}}>
    <Row style={{justifyContent:'space-between'}}><Txt bold size={13} style={{color:colors.onPrimary}}>{t('الصلاة القادمة','NEXT PRAYER')}</Txt><Txt size={12} style={{color:colors.onPrimary}}>{city?cityName(city,state.locale):t('اختر مدينتك','Choose your city')}</Txt></Row>
    {next?<><Txt bold size={28} style={{color:colors.onPrimary}}>{t(labels[next.prayer][0],labels[next.prayer][1])}</Txt><Txt size={36} bold style={{color:colors.onPrimary,writingDirection:'ltr',textAlign:'center'}} accessibilityLabel={t(`المتبقي ${countdown(next.at,now)}`,`${countdown(next.at,now)} remaining`)}>{countdown(next.at,now)}</Txt><Txt size={13} style={{color:colors.onPrimary}}>{t('موعد الأذان','Prayer time')} · {new Intl.DateTimeFormat(state.locale,{hour:'numeric',minute:'2-digit',timeZone:'Africa/Cairo'}).format(new Date(next.at))} · {t('توقيت القاهرة','Cairo time')}</Txt></>:<Txt style={{color:colors.onPrimary}}>{!city?t('حدد مدينتك لعرض مواعيدك.','Choose a city to see your times.'):current.isPending?t('جارٍ تحميل المواقيت…','Loading prayer times…'):t('تعذّر عرض الموعد القادم. افتح المواقيت للمحاولة.','The next time is unavailable. Open prayer times to retry.')}</Txt>}
    <Button secondary label={city?t('المواقيت والأذان','Prayer times & Adhan'):t('اختيار المدينة','Choose city')} onPress={()=>router.push('/adhan')}/>
  </Card>;
}
