import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Platform,Pressable,Switch,View} from 'react-native';
import {router,useFocusEffect,useLocalSearchParams} from 'expo-router';
import {useAudioPlayer,useAudioPlayerStatus} from 'expo-audio';
import {useApp} from '../state/AppContext';
import {dateInZone,normalizeDigits,parseDate} from '../core/calendar';
import {prayerNames as names} from '../core/prayer-display';
import {adhanPrayers,adhanSequence,adhanClips,adhanPreviewUrl,audioSlot,type AdhanPrayer,type ClipId} from '../core/adhan-sequence';
import {cityName,esaCities,esaCity} from '../data/esa-cities';
import {adhanNative,configureAdhan,unavailableAdhan} from '../services/adhan-native';
import {Button,Card,Field,Row,Screen,Txt} from '../ui/components';
import {IconButton,OptionRow} from './quran/ReaderControls';
import {ReaderSheet} from './quran/ReaderSheet';
function Preference({title,detail,value,onChange,disabled=false}:{title:string;detail:string;value:boolean;onChange:(value:boolean)=>void;disabled?:boolean}){
  const {colors}=useApp();return <Row style={{flexWrap:'nowrap'}}><View style={{flex:1}}><Txt bold size={16}>{title}</Txt><Txt muted size={12}>{detail}</Txt></View><Switch accessibilityLabel={title} value={value} disabled={disabled} onValueChange={onChange} trackColor={{false:colors.border,true:colors.primary}} thumbColor={colors.surface}/></Row>;
}
export function AdhanSettings(){
  const {state,dispatch,colors,t}=useApp();const {adhan,locale}=state;
  const params=useLocalSearchParams<{date?:string}>();
  const [date,setDate]=useState(()=>{try{if(params.date){parseDate(params.date);return params.date;}}catch{}return dateInZone(new Date(),'Africa/Cairo');});const [dateInput,setDateInput]=useState(date);
  const [cityPicker,setCityPicker]=useState(false);const [search,setSearch]=useState('');
  const [status,setStatus]=useState(unavailableAdhan);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  const city=esaCity(adhan.city);
  const player=useAudioPlayer(null);const audio=useAudioPlayerStatus(player);
  const [previewPrayer,setPreviewPrayer]=useState<AdhanPrayer>('maghrib');
  const [webClip,setWebClip]=useState<ClipId|null>(null);
  const webQueue=useRef<{ids:readonly ClipId[];index:number}|null>(null);
  const nativePreview=useRef(false);
  useEffect(()=>{const listener=player.addListener('playbackStatusUpdate',event=>{
    if(event.error){webQueue.current=null;setWebClip(null);setMessage(t('تعذّر تشغيل التسجيل. أعد المحاولة.','The recording could not play. Please retry.'));return;}
    const queue=webQueue.current;
    // Ignore late completion events from a replaced intro when its Adhan is already loading.
    if(event.didJustFinish&&queue&&Math.abs(event.duration-adhanClips[queue.ids[queue.index]].duration)<1){
      const next=queue.index+1;
      if(next<queue.ids.length){queue.index=next;setWebClip(queue.ids[next]);player.replace(adhanPreviewUrl(queue.ids[next]));player.play();}
      else {webQueue.current=null;setWebClip(null);}
    }
  });return()=>listener.remove();},[player,t]);
  useFocusEffect(useCallback(()=>{
    const refresh=()=>setStatus(adhanNative?.status()??unavailableAdhan);refresh();
    const timer=setInterval(refresh,2500);return()=>{clearInterval(timer);webQueue.current=null;try{player.pause();if(nativePreview.current){adhanNative?.stop();nativePreview.current=false;}}catch{}};
  },[player]));
  const dateChange=(value:string)=>{if(nativePreview.current||webQueue.current)stopAudio();setDate(value);setDateInput(value);};
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
  const stopAudio=()=>{webQueue.current=null;setWebClip(null);player.pause();adhanNative?.stop();nativePreview.current=false;if(adhanNative)setStatus(adhanNative.status());};
  const preview=async(prayer:AdhanPrayer)=>{setMessage('');setBusy(true);try{
    if(previewPrayer===prayer&&audio.playing||status.playing&&adhanSequence(date,prayer).includes(status.clip as ClipId)){stopAudio();return;}
    setPreviewPrayer(prayer);
    if(adhanNative){nativePreview.current=true;await adhanNative.preview(date,prayer);setStatus(adhanNative.status());}
    else{player.pause();const ids=adhanSequence(date,prayer);webQueue.current={ids,index:0};setWebClip(ids[0]);player.replace(adhanPreviewUrl(ids[0]));player.play();}
  }catch{webQueue.current=null;setMessage(t('تعذّر تشغيل التسجيل. أعد المحاولة.','The recording could not play. Please retry.'));}finally{setBusy(false);}};
  const filtered=esaCities.filter(c=>c.name.replace(/[أإآ]/g,'ا').includes(search.replace(/[أإآ]/g,'ا').replace(/ـ/g,'').trim())||c.en.toLowerCase().includes(search.trim().toLowerCase()));
  return <Screen title={t('إعدادات الأذان','Adhan settings')} subtitle={t('المدينة، والتنبيهات، والأصوات','City, alerts and recordings')} trailing={<IconButton icon="xmark" label={t('العودة','Back')} onPress={()=>router.canGoBack()?router.back():router.replace('/settings')}/>}>
    <Pressable testID="adhan-city" accessibilityRole="button" accessibilityLabel={t('اختيار أو تغيير المدينة','Choose or change city')} onPress={()=>setCityPicker(true)}><Card style={{backgroundColor:colors.primary,borderColor:colors.primary}}><Row style={{justifyContent:'space-between',flexWrap:'nowrap'}}><View style={{flex:1}}><Txt size={12} style={{color:colors.onPrimary}}>{t('مصر · توقيت القاهرة','Egypt · Cairo time')}</Txt><Txt size={25} bold style={{color:colors.onPrimary}}>{city?cityName(city,locale):t('اختار مدينتك أولًا','Choose your city first')}</Txt></View><Txt size={13} bold style={{color:colors.onPrimary}}>{t('تغيير','Change')}</Txt></Row>{city?<Txt size={12} style={{color:colors.onPrimary}}>{t('المدينة محفوظة ويمكنك تغييرها في أي وقت','Your city is saved and can be changed anytime')}</Txt>:null}</Card></Pressable>
    <Card><Txt bold size={19}>{t('عرض المواقيت','View prayer times')}</Txt><Field label={t('التاريخ — YYYY-MM-DD','Date — YYYY-MM-DD')} value={dateInput} onChangeText={v=>setDateInput(normalizeDigits(v))} autoCapitalize="none"/><Button secondary label={t('عرض المواقيت','Show prayer times')} onPress={()=>{try{parseDate(dateInput);dateChange(dateInput);setMessage('');router.push({pathname:'/adhan',params:{date:dateInput}});}catch{setMessage(t('اكتب تاريخًا صحيحًا بالشكل YYYY-MM-DD.','Enter a valid date as YYYY-MM-DD.'));}}}/><Txt muted size={11}>{t(`معاينة الأصوات لتاريخ ${date}`,`Sound preview date: ${date}`)}</Txt></Card>
    <Card><Txt bold size={20}>{t('التنبيه والصوت','Alerts & sound')}</Txt><Preference title={t('تشغيل الأذان في موعده','Play Adhan at prayer time')} detail={t('للصلوات الخمس، بعد السماح بالإشعارات والمنبهات','For the five prayers, with notification and alarm permission')} value={adhan.enabled} disabled={busy} onChange={value=>void enable(value)}/><Preference title={t('تذكير قبل الأذان بعشر دقائق','Reminder 10 minutes before Adhan')} detail={t('إشعار قصير قبل كل صلاة عند تفعيل الأذان','A short notification before each prayer when Adhan is enabled')} value={adhan.reminder} onChange={value=>save({...adhan,reminder:value})}/>
      <Txt muted size={12}>{t('تنبيه قبل الصلاة بـ10 دقائق، ومنه تقدر تكتم أذان الصلاة دي بس أو تلغي الكتم قبل موعدها.','A reminder 10 minutes before prayer lets you mute only that Adhan, or undo it before prayer time.')}</Txt>
      <Txt muted size={12}>{t('عند الموعد: فاصل الصلاة ثم الأذان. تقدر تكتم الصوت وترجّعه من الإشعار، أو توقفه تمامًا.','At prayer time: the prayer intro, then Adhan. Mute or unmute from the notification, or stop playback completely.')}</Txt>
      <Txt muted size={12}>{t('ظهر الجمعة: فاصل الجمعة ثم أذان الأزهر. باقي الأيام بصوت شعيشع.','Friday Dhuhr: the Friday intro, then Al-Azhar Adhan. Other days use Shuaisha.')}</Txt>
      <Txt muted size={12}>{t('بعد كل أذان يُشغّل دعاء الشيخ الشعراوي.','Each Adhan is followed by Sheikh Al-Sha’rawi’s dua.')}</Txt>
      <View style={{gap:4}}>{adhanPrayers.map(prayer=>{const ids=adhanSequence(date,prayer);const clip=adhanClips[ids[1]];const friday=audioSlot(date,prayer)==='friday';const active=previewPrayer===prayer&&audio.playing||status.playing&&ids.includes(status.clip as ClipId);return <View key={prayer} testID={`adhan-voice-${prayer}`}><Row style={{flexWrap:'nowrap',justifyContent:'space-between'}}><View style={{flex:1,gap:2}}><Txt bold>{friday?t('الجمعة','Friday'):t(...names[prayer])}</Txt><Txt muted size={12}>{locale==='ar'?clip.ar:clip.en}</Txt></View><IconButton icon={active?'pause':'play'} active={active} disabled={busy} label={t(`${active?'إيقاف':'سماع'} فاصل وأذان ${friday?'الجمعة':names[prayer][0]}`,`${active?'Stop':'Preview'} ${friday?'Friday':names[prayer][1]} intro and Adhan`)} onPress={()=>void preview(prayer)}/></Row></View>;})}</View>
      {status.playing||audio.playing?<Button secondary label={t('إيقاف الصوت','Stop audio')} onPress={stopAudio}/>:null}
      {status.playing&&adhanNative?<Button secondary label={status.suspended?t('استئناف الأذان','Resume Adhan'):status.muted?t('تشغيل صوت الأذان','Unmute Adhan'):t('كتم صوت الأذان','Mute Adhan')} onPress={()=>{adhanNative?.setMuted(status.suspended?false:!status.muted);setStatus(adhanNative!.status());}}/>:null}
      {audio.playing?<Txt muted size={11} accessibilityLiveRegion="polite">{webClip?`${locale==='ar'?adhanClips[webClip].ar:adhanClips[webClip].en} · ${Math.floor(audio.currentTime)} / ${Math.floor(audio.duration)}`:''}</Txt>:null}
      {busy?<ActivityIndicator color={colors.primary}/>:null}
      {adhan.enabled&&adhanNative?<>
        {status.available&&(status.alarmMuted||status.alarmVolume===0)?<><Txt style={{color:colors.danger}}>{t('صوت المنبه في الهاتف مكتوم أو على صفر. ارفعه عشان تسمع الأذان.','The phone’s alarm volume is muted or zero. Raise it to hear Adhan.')}</Txt><Button secondary label={t('فتح إعدادات الصوت','Open sound settings')} onPress={()=>adhanNative?.openSoundSettings()}/></>:null}
        {!status.exact?<><Txt style={{color:colors.danger}}>{t('الجدولة متوقفة حتى تسمح بالمنبهات والتذكيرات الدقيقة.','Scheduling is paused until you allow exact alarms & reminders.')}</Txt><Button label={t('السماح بالمنبهات والتذكيرات','Allow alarms & reminders')} onPress={()=>adhanNative?.openExactSettings()}/></>:null}
        {!status.notifications?<Button secondary label={t('فتح إعدادات الإشعارات','Open notification settings')} onPress={()=>adhanNative?.openNotificationSettings()}/>:null}
        {status.error?<><Txt style={{color:colors.danger}}>{t('تعذّر تحديث الجدولة أو تجهيز الصوت.','Scheduling or audio preparation could not be completed.')}</Txt><Button secondary label={t('إعادة تجهيز الأذان','Retry Adhan setup')} onPress={()=>void enable(true)}/></>:null}
        {status.count>0?<Txt size={12} style={{color:colors.primary}}>{t(`تمت جدولة ${status.count} تنبيه حتى ${status.until}.`,`Scheduled ${status.count} alerts through ${status.until}.`)}</Txt>:null}
        <Button secondary label={t('اختبار: إشعار بعد 30 ثانية والفاصل ثم الأذان بعد دقيقة','Test: reminder in 30 seconds, intro then Adhan in one minute')} disabled={!status.exact||!status.notifications||!status.audio} onPress={()=>{void adhanNative?.testAlarm(date,previewPrayer).then(()=>setMessage(t('تم ضبط الاختبار. يمكنك قفل الشاشة وتجربته.','Test scheduled. You can lock the screen to try it.'))).catch(()=>setMessage(t('تعذّر جدولة الاختبار.','The test could not be scheduled.')));}}/>
      </>:Platform.OS==='web'?<Txt muted size={12}>{t('إشعارات الخلفية والصوت التلقائي يُختبران في نسخة Android.','Background alerts and automatic audio require the Android build.')}</Txt>:null}
      <Txt muted size={11}>{t('مستوى الصوت يتبع صوت المنبه في الهاتف، ويحترم وضع عدم الإزعاج.','Playback uses the phone’s alarm volume and respects Do Not Disturb.')}</Txt>
      {message?<Txt accessibilityLiveRegion="polite" style={{color:colors.primary}}>{message}</Txt>:null}
    </Card>
    <ReaderSheet visible={cityPicker} title={t('اختيار المدينة','Choose city')} subtitle={t('المدن المتاحة لدى هيئة المساحة','Cities available from ESA')} onClose={()=>setCityPicker(false)}><Field label={t('ابحث عن مدينتك','Search your city')} value={search} onChangeText={setSearch}/>{filtered.map(c=><OptionRow key={c.id} title={cityName(c,locale)} selected={adhan.city===c.id} icon="house" onPress={()=>{save({...adhan,city:c.id});setCityPicker(false);setSearch('');}}/>)}{!filtered.length?<Txt muted>{t('لا توجد مدينة بهذا الاسم في قائمة الهيئة.','No city matches this name in the authority’s list.')}</Txt>:null}</ReaderSheet>
  </Screen>;
}
