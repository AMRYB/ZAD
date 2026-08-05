import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Platform,Pressable,ScrollView,Switch,View} from 'react-native';
import {router,useFocusEffect} from 'expo-router';
import {useAudioPlayer,useAudioPlayerStatus} from 'expo-audio';
import {useQuery} from '@tanstack/react-query';
import {useApp} from '../state/AppContext';
import {addDays,dateInZone,normalizeDigits,parseDate} from '../core/calendar';
import {cairoTimestamp,prayerKeys,type TimeKey} from '../core/adhan';
import {cityName,esaCities,esaCity} from '../data/esa-cities';
import {adhanNative,configureAdhan,loadPrayerMonth,unavailableAdhan} from '../services/adhan-native';
import {Button,Card,Field,Row,Screen,Txt} from '../ui/components';
import {IconButton,OptionRow} from './quran/ReaderControls';
import {ReaderSheet} from './quran/ReaderSheet';
const names:Record<TimeKey,[string,string]>={fajr:['الفجر','Fajr'],sunrise:['الشروق','Sunrise'],dhuhr:['الظهر','Dhuhr'],asr:['العصر','Asr'],maghrib:['المغرب','Maghrib'],isha:['العشاء','Isha']};
function displayTime(value:string,locale:string){return new Intl.DateTimeFormat(locale,{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'UTC'}).format(new Date(`2000-01-01T${value}:00Z`));}
function Preference({title,detail,value,onChange,disabled=false}:{title:string;detail:string;value:boolean;onChange:(value:boolean)=>void;disabled?:boolean}){
  const {colors}=useApp();return <Row style={{flexWrap:'nowrap'}}><View style={{flex:1}}><Txt bold size={16}>{title}</Txt><Txt muted size={12}>{detail}</Txt></View><Switch accessibilityLabel={title} value={value} disabled={disabled} onValueChange={onChange} trackColor={{false:colors.border,true:colors.primary}} thumbColor={colors.surface}/></Row>;
}
export function Adhan(){
  const {state,dispatch,colors,t}=useApp();const {adhan,locale}=state;
  const [now,setNow]=useState(()=>Date.now());const today=dateInZone(new Date(now),'Africa/Cairo');
  const [date,setDate]=useState(()=>dateInZone(new Date(),'Africa/Cairo'));const [dateInput,setDateInput]=useState(date);
  const [cityPicker,setCityPicker]=useState(!adhan.city);const [search,setSearch]=useState('');
  const [status,setStatus]=useState(unavailableAdhan);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  const dayStrip=useRef<React.ComponentRef<typeof ScrollView>>(null);
  const city=esaCity(adhan.city);
  const query=useQuery({queryKey:['esa-month',adhan.city,date.slice(0,7)],enabled:!!city,queryFn:({signal})=>loadPrayerMonth(city!.id,date.slice(0,7),signal),staleTime:86400000,gcTime:86400000,retry:false});
  const day=query.data?.days.find(d=>d.date===date);
  const next=day&&date===today?prayerKeys.find(p=>p!=='sunrise'&&cairoTimestamp(date,day.times[p])>now):undefined;
  const player=useAudioPlayer(null);const audio=useAudioPlayerStatus(player);
  useEffect(()=>{const listener=player.addListener('playbackStatusUpdate',event=>{if(event.error)setMessage(t('تعذّر تشغيل التسجيل. أعد المحاولة.','The recording could not play. Please retry.'));});return()=>listener.remove();},[player,t]);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);
  useFocusEffect(useCallback(()=>{
    const refresh=()=>setStatus(adhanNative?.status()??unavailableAdhan);refresh();
    const timer=setInterval(refresh,2500);return()=>{clearInterval(timer);try{player.pause();}catch{}};
  },[player]));
  const dateChange=(value:string)=>{setDate(value);setDateInput(value);};
  const save=(value:typeof adhan)=>dispatch({type:'adhanSettings',value});
  const enable=async(value:boolean)=>{
    setMessage('');if(!value){save({...adhan,enabled:false});return;}
    if(!city){setCityPicker(true);return;}
    if(!adhanNative){setMessage(t('التنبيه وتشغيل الأذان في الخلفية متاحان في نسخة Android.','Background reminders and Adhan playback are available in the Android build.'));return;}
    setBusy(true);
    try{
      const permission=await adhanNative.requestNotifications();
      if(!permission.granted){setMessage(t('اسمح بالإشعارات لتفعيل تنبيه الأذان.','Allow notifications to enable Adhan alerts.'));return;}
      save({...adhan,enabled:true});
      const result=await configureAdhan({...adhan,enabled:true},locale);setStatus(result);
    }catch{setMessage(t('تعذّر تجهيز الأذان. تحقق من الإنترنت ثم أعد المحاولة.','Adhan could not be prepared. Check your connection and retry.'));}finally{setBusy(false);}
  };
  const preview=async()=>{setMessage('');try{
    if(adhanNative){if(status.playing){adhanNative.stop();}else await adhanNative.preview();setStatus(adhanNative.status());}
    else{if(audio.playing)player.pause();else{player.replace('/api/adhan-audio');player.play();}}
  }catch{setMessage(t('تعذّر تشغيل التسجيل. أعد المحاولة.','The recording could not play. Please retry.'));}};
  const filtered=esaCities.filter(c=>c.name.replace(/[أإآ]/g,'ا').includes(search.replace(/[أإآ]/g,'ا').replace(/ـ/g,'').trim())||c.en.toLowerCase().includes(search.trim().toLowerCase()));
  const chosenDayLabel=date===today?t('النهارده','Today'):date===addDays(today,1)?t('بكرة','Tomorrow'):new Intl.DateTimeFormat(locale,{weekday:'long',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
  return <Screen title={t('الأذان','Adhan')} subtitle={t('مواقيت مدينتك، في وقتها','Your city’s prayer times')} trailing={<IconButton icon="xmark" label={t('العودة للمزيد','Back to more')} onPress={()=>router.canGoBack()?router.back():router.replace('/more')}/>}>
    <Pressable testID="adhan-city" accessibilityRole="button" accessibilityLabel={t('اختيار أو تغيير المدينة','Choose or change city')} onPress={()=>setCityPicker(true)}><Card style={{backgroundColor:colors.primary,borderColor:colors.primary}}><Row style={{justifyContent:'space-between',flexWrap:'nowrap'}}><View style={{flex:1}}><Txt size={12} style={{color:colors.onPrimary}}>{t('مصر · توقيت القاهرة','Egypt · Cairo time')}</Txt><Txt size={25} bold style={{color:colors.onPrimary}}>{city?cityName(city,locale):t('اختار مدينتك أولًا','Choose your city first')}</Txt></View><Txt size={13} bold style={{color:colors.onPrimary}}>{t('تغيير','Change')}</Txt></Row>{city?<Txt size={12} style={{color:colors.onPrimary}}>{t('المدينة محفوظة ويمكنك تغييرها في أي وقت','Your city is saved and can be changed anytime')}</Txt>:null}</Card></Pressable>
    {city?<>
      <ScrollView ref={dayStrip} horizontal showsHorizontalScrollIndicator={false} onContentSizeChange={()=>{if(locale==='ar')dayStrip.current?.scrollToEnd({animated:false});}} contentContainerStyle={{gap:8,flexDirection:locale==='ar'?'row-reverse':'row',minWidth:'100%'}}>{Array.from({length:7},(_,i)=>{const d=addDays(today,i);const label=i===0?t('النهارده','Today'):i===1?t('بكرة','Tomorrow'):new Intl.DateTimeFormat(locale,{weekday:'short',timeZone:'UTC'}).format(new Date(`${d}T12:00:00Z`));return <Pressable key={d} accessibilityRole="button" accessibilityLabel={`${label} ${d}`} accessibilityState={{selected:d===date}} onPress={()=>dateChange(d)} style={{minWidth:79,minHeight:78,padding:12,borderRadius:20,backgroundColor:d===date?colors.primary:colors.surface,alignItems:'center',justifyContent:'center',gap:3}}><Txt size={12} bold style={{color:d===date?colors.onPrimary:colors.muted}}>{label}</Txt><Txt size={18} bold style={{color:d===date?colors.onPrimary:colors.text}}>{Number(d.slice(-2))}</Txt></Pressable>;})}</ScrollView>
      <Card><Row style={{justifyContent:'space-between'}}><Txt size={20} bold>{chosenDayLabel}</Txt><Txt size={13} muted style={{writingDirection:'ltr'}}>{date}</Txt></Row>{day?<Txt muted size={12}>{day.hijri}</Txt>:null}
        {query.isPending?<Row><ActivityIndicator color={colors.primary}/><Txt muted>{t('جارٍ تحميل المواقيت الرسمية…','Loading official times…')}</Txt></Row>:query.isError||!day?<><Txt style={{color:colors.danger}}>{t('تعذّر تحميل مواقيت هذا اليوم من هيئة المساحة. لم نستخدم مواعيد بديلة.','This day’s ESA timetable could not be loaded. No substitute times were used.')}</Txt><Button secondary label={t('إعادة المحاولة','Retry')} onPress={()=>void query.refetch()}/></>:<View style={{gap:4}}>{prayerKeys.map(key=><View key={key} testID={`adhan-time-${key}`} style={{backgroundColor:key===next?colors.soft:'transparent',borderRadius:16,paddingHorizontal:14,paddingVertical:10}}><Row style={{justifyContent:'space-between',flexWrap:'nowrap'}}><View><Txt bold={key===next} size={17}>{t(...names[key])}</Txt>{key===next?<Txt size={11} style={{color:colors.primary}}>{t('الصلاة القادمة','Next prayer')}</Txt>:key==='sunrise'?<Txt size={10} muted>{t('بدون أذان','No Adhan')}</Txt>:null}</View><Txt bold size={23} style={{color:key===next?colors.primary:colors.text}}>{displayTime(day.times[key],locale)}</Txt></Row></View>)}</View>}
        <Txt muted size={11}>{t('المصدر: الهيئة المصرية العامة للمساحة · Africa/Cairo','Source: Egyptian Survey Authority · Africa/Cairo')}</Txt>
        {query.data?<Txt muted size={10}>{t('آخر تحميل: ','Last downloaded: ')}{new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Cairo'}).format(new Date(query.data.fetchedAt))}</Txt>:null}
      </Card>
      <Card><Txt bold>{t('يوم آخر','Another day')}</Txt><Field label={t('التاريخ — YYYY-MM-DD','Date — YYYY-MM-DD')} value={dateInput} onChangeText={v=>setDateInput(normalizeDigits(v))} autoCapitalize="none"/><Button secondary label={t('عرض المواقيت','Show times')} onPress={()=>{try{parseDate(dateInput);dateChange(dateInput);setMessage('');}catch{setMessage(t('اكتب تاريخًا صحيحًا بالشكل YYYY-MM-DD.','Enter a valid date as YYYY-MM-DD.'));}}}/></Card>
    </>:<Card><Txt>{t('اختار المحافظة أو أقرب مدينة من قائمة الهيئة لعرض مواقيتها وحفظ اختيارك.','Choose your city from the authority’s list to view and save its timetable.')}</Txt><Button label={t('اختيار المدينة','Choose city')} onPress={()=>setCityPicker(true)}/></Card>}
    <Card><Txt bold size={20}>{t('التنبيه والصوت','Alerts & sound')}</Txt><Preference title={t('تشغيل الأذان في موعده','Play Adhan at prayer time')} detail={t('للصلوات الخمس، بعد السماح بالإشعارات والمنبهات','For the five prayers, with notification and alarm permission')} value={adhan.enabled} disabled={busy} onChange={value=>void enable(value)}/><Preference title={t('تذكير قبل الأذان بعشر دقائق','Reminder 10 minutes before Adhan')} detail={t('إشعار قصير قبل كل صلاة عند تفعيل الأذان','A short notification before each prayer when Adhan is enabled')} value={adhan.reminder} onChange={value=>save({...adhan,reminder:value})}/>
      <Txt muted size={12}>{t('الصوت: أذان القاهرة — الشيخ محمد رفعت. يُحمّل مرة واحدة للتشغيل دون إنترنت.','Voice: Cairo Adhan — Sheikh Mohamed Rifaat. Downloaded once for offline playback.')}</Txt>
      <Button secondary label={status.playing||audio.playing?t('إيقاف الصوت','Stop audio'):t('اسمع صوت الأذان','Preview Adhan')} onPress={()=>void preview()}/>
      {busy?<ActivityIndicator color={colors.primary}/>:null}
      {adhan.enabled&&adhanNative?<>
        {status.available&&(status.alarmMuted||status.alarmVolume===0)?<><Txt style={{color:colors.danger}}>{t('صوت المنبه في الهاتف مكتوم أو على صفر. ارفعه عشان تسمع الأذان.','The phone’s alarm volume is muted or zero. Raise it to hear Adhan.')}</Txt><Button secondary label={t('فتح إعدادات الصوت','Open sound settings')} onPress={()=>adhanNative?.openSoundSettings()}/></>:null}
        {!status.exact?<><Txt style={{color:colors.danger}}>{t('الجدولة متوقفة حتى تسمح بالمنبهات والتذكيرات الدقيقة.','Scheduling is paused until you allow exact alarms & reminders.')}</Txt><Button label={t('السماح بالمنبهات والتذكيرات','Allow alarms & reminders')} onPress={()=>adhanNative?.openExactSettings()}/></>:null}
        {!status.notifications?<Button secondary label={t('فتح إعدادات الإشعارات','Open notification settings')} onPress={()=>adhanNative?.openNotificationSettings()}/>:null}
        {status.error?<><Txt style={{color:colors.danger}}>{t('تعذّر تحديث الجدولة أو تنزيل الصوت.','Scheduling or audio download could not be updated.')}</Txt><Button secondary label={t('إعادة تجهيز الأذان','Retry Adhan setup')} onPress={()=>void enable(true)}/></>:null}
        {status.count>0?<Txt size={12} style={{color:colors.primary}}>{t(`تمت جدولة ${status.count} تنبيه حتى ${status.until}.`,`Scheduled ${status.count} alerts through ${status.until}.`)}</Txt>:null}
        <Button secondary label={t('اختبار: إشعار بعد 30 ثانية وأذان بعد دقيقة','Test: reminder in 30 seconds, Adhan in one minute')} disabled={!status.exact||!status.notifications||!status.audio} onPress={()=>{void adhanNative?.testAlarm().then(()=>setMessage(t('تم ضبط الاختبار. يمكنك قفل الشاشة وتجربته.','Test scheduled. You can lock the screen to try it.'))).catch(()=>setMessage(t('تعذّر جدولة الاختبار.','The test could not be scheduled.')));}}/>
      </>:Platform.OS==='web'?<Txt muted size={12}>{t('إشعارات الخلفية والصوت التلقائي يُختبران في نسخة Android.','Background alerts and automatic audio require the Android build.')}</Txt>:null}
      <Txt muted size={11}>{t('مستوى الصوت يتبع صوت المنبه في الهاتف، ويحترم وضع عدم الإزعاج.','Playback uses the phone’s alarm volume and respects Do Not Disturb.')}</Txt>
      {message?<Txt accessibilityLiveRegion="polite" style={{color:colors.primary}}>{message}</Txt>:null}
    </Card>
    <ReaderSheet visible={cityPicker} title={t('اختيار المدينة','Choose city')} subtitle={t('المدن المتاحة لدى هيئة المساحة','Cities available from ESA')} onClose={()=>setCityPicker(false)}><Field label={t('ابحث عن مدينتك','Search your city')} value={search} onChangeText={setSearch}/>{filtered.map(c=><OptionRow key={c.id} title={cityName(c,locale)} selected={adhan.city===c.id} icon="house" onPress={()=>{save({...adhan,city:c.id});setCityPicker(false);setSearch('');}}/>)}{!filtered.length?<Txt muted>{t('لا توجد مدينة بهذا الاسم في قائمة الهيئة.','No city matches this name in the authority’s list.')}</Txt>:null}</ReaderSheet>
  </Screen>;
}
