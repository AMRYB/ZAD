import React,{useCallback,useRef,useState} from 'react';
import {ActivityIndicator,Pressable,ScrollView,View} from 'react-native';
import {router,useFocusEffect,useLocalSearchParams} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {useApp} from '../state/AppContext';
import {addDays,dateInZone,parseDate} from '../core/calendar';
import {prayerKeys} from '../core/adhan';
import {displayPrayerTime,prayerNames,prayerTimeline} from '../core/prayer-display';
import {cityName,esaCity} from '../data/esa-cities';
import {loadPrayerMonth} from '../services/adhan-native';
import {Button,Card,Row,Screen,Txt} from '../ui/components';
import {PrayerDayArc} from '../ui/PrayerDayArc';
import {PrayerIllustration} from '../ui/PrayerIllustration';
import {IconButton} from './quran/ReaderControls';

export function Adhan(){
  const {state,colors,t}=useApp(),{locale,adhan}=state,params=useLocalSearchParams<{date?:string}>();
  const [now,setNow]=useState(Date.now),today=dateInZone(new Date(now),'Africa/Cairo');
  const [chosen,setChosen]=useState(()=>{try{if(params.date){parseDate(params.date);return params.date;}}catch{}return '';});
  const date=chosen||today,city=esaCity(adhan.city),followingDate=addDays(date,1),strip=useRef<React.ComponentRef<typeof ScrollView>>(null);
  useFocusEffect(useCallback(()=>{setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]));
  const query=useQuery({queryKey:['esa-month',adhan.city,date.slice(0,7)],enabled:!!city,queryFn:({signal})=>loadPrayerMonth(city!.id,date.slice(0,7),signal),staleTime:86400000,gcTime:86400000,retry:false});
  const following=useQuery({queryKey:['esa-month',adhan.city,followingDate.slice(0,7)],enabled:!!city&&followingDate.slice(0,7)!==date.slice(0,7),queryFn:({signal})=>loadPrayerMonth(city!.id,followingDate.slice(0,7),signal),staleTime:86400000,gcTime:86400000,retry:false});
  const day=query.data?.days.find(d=>d.date===date),tomorrow=(followingDate.slice(0,7)===date.slice(0,7)?query.data:following.data)?.days.find(d=>d.date===followingDate);
  const timeline=day?prayerTimeline(day,now,tomorrow):null,isToday=date===today;
  const settings=()=>router.push({pathname:'/adhan-settings',params:{date}});
  return <Screen title={t('الأذان','Adhan')} subtitle={city?`${cityName(city,locale)} · ${t('توقيت القاهرة','Cairo time')}`:t('مواقيت مدينتك','Your city’s prayer times')} trailing={<IconButton icon="sliders" label={t('إعدادات الأذان','Adhan settings')} onPress={settings}/>}>
    {!city?<Card><Txt>{t('اختار مدينتك من إعدادات الأذان لعرض المواقيت الرسمية.','Choose your city in Adhan settings to view official prayer times.')}</Txt><Button label={t('فتح إعدادات الأذان','Open Adhan settings')} onPress={settings}/></Card>:<>
      <ScrollView ref={strip} horizontal showsHorizontalScrollIndicator={false} onContentSizeChange={()=>{if(locale==='ar')strip.current?.scrollToEnd({animated:false});}} contentContainerStyle={{gap:8,flexDirection:locale==='ar'?'row-reverse':'row',minWidth:'100%'}}>{Array.from({length:7},(_,i)=>{const d=addDays(today,i),label=i===0?t('النهارده','Today'):i===1?t('بكرة','Tomorrow'):new Intl.DateTimeFormat(locale,{weekday:'short',timeZone:'UTC'}).format(new Date(`${d}T12:00:00Z`));return <Pressable key={d} accessibilityRole="button" accessibilityLabel={`${label} ${d}`} accessibilityState={{selected:date===d}} onPress={()=>setChosen(i?d:'')} style={{minWidth:72,minHeight:68,padding:10,borderRadius:18,alignItems:'center',justifyContent:'center',backgroundColor:date===d?colors.primary:colors.surface}}><Txt size={11} style={{color:date===d?colors.onPrimary:colors.muted}}>{label}</Txt><Txt bold size={18} style={{color:date===d?colors.onPrimary:colors.text}}>{Number(d.slice(-2))}</Txt></Pressable>;})}</ScrollView>
      {query.isPending?<Card><Row><ActivityIndicator color={colors.primary}/><Txt muted>{t('جارٍ تحميل المواقيت الرسمية…','Loading official times…')}</Txt></Row></Card>:query.isError||!day?<Card><Txt style={{color:colors.danger}}>{t('تعذّر تحميل مواقيت هذا اليوم من هيئة المساحة. لم نستخدم مواعيد بديلة.','This day’s ESA timetable could not be loaded. No substitute times were used.')}</Txt><Button secondary label={t('إعادة المحاولة','Retry')} onPress={()=>void query.refetch()}/></Card>:<>
        <PrayerDayArc day={day} following={tomorrow} now={now} isToday={isToday}/>
        <Card style={{gap:4,padding:12}}><Row style={{justifyContent:'space-between',padding:6}}><Txt bold size={17}>{isToday?t('مواقيت النهارده','Today’s times'):date}</Txt><Txt size={11} muted>{day.hijri}</Txt></Row>{prayerKeys.map(key=>{const entry=timeline!.entries.find(e=>e.key===key)!,past=entry.at<=now,next=timeline!.next?.key===key&&timeline!.next.at===entry.at;return <View testID={`adhan-time-${key}`} key={key} style={{borderRadius:18,padding:12,backgroundColor:next?colors.soft:past?colors.background:'transparent',marginVertical:2}}><Row style={{justifyContent:'space-between',flexWrap:'nowrap'}}><PrayerIllustration prayer={key} muted={past}/><View style={{flex:1}}><Txt bold={next} size={17} style={{color:past?colors.muted:colors.text}}>{t(...prayerNames[key])}</Txt><Txt size={10} style={{color:next?colors.primary:colors.muted}}>{next?t('الصلاة القادمة','Next prayer'):past?t('مضى موعدها','Time has passed'):key==='sunrise'?t('بدون أذان','No Adhan'):t('لم يحن موعدها','Upcoming')}</Txt></View><Txt bold size={20} style={{color:past?colors.muted:next?colors.primary:colors.text,fontVariant:['tabular-nums']}}>{displayPrayerTime(day.times[key],locale)}</Txt></Row></View>;})}</Card>
        {!timeline?.next&&isToday&&!tomorrow?<Card><Txt muted size={12}>{t('موعد فجر الغد غير متاح بعد. حدّث المواقيت عند عودة الاتصال.','Tomorrow’s Fajr is not available yet. Refresh when connected.')}</Txt><Button secondary label={t('إعادة المحاولة','Retry')} onPress={()=>void following.refetch()}/></Card>:null}
        <Txt muted size={10}>{t('المصدر: الهيئة المصرية العامة للمساحة','Source: Egyptian Survey Authority')} · {date}</Txt>
      </>}
    </>}
  </Screen>;
}
