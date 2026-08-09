import React,{useState} from 'react';
import {Switch,View} from 'react-native';
import {useApp} from '../../state/AppContext';
import {normalizeDigits} from '../../core/calendar';
import {personalReminders,reminderChange} from '../../core/personal-reminders';
import {adhanNative} from '../../services/adhan-native';
import {Button,Card,Field,Row,Txt} from '../../ui/components';

export function ReminderPreferences({kind}:{kind:'adhkar'|'deeds'}){
  const {state,dispatch,t,colors}=useApp();const value=state.devotion.reminders[kind];const [times,setTimes]=useState(()=>[...value.times]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const allowed=kind!=='deeds'||state.devotion.deeds.selected.length>0;
  const save=async(enabled:boolean,immediateDisable=false)=>{
    setMessage('');const next=reminderChange(value,times,enabled,immediateDisable);if(!next){setMessage(t('اكتب 3 مواعيد مختلفة بالشكل 09:00، من 00:00 إلى 23:59.','Enter three different times as 09:00, between 00:00 and 23:59.'));return;}
    if(enabled&&!allowed){setMessage(t('اختار عمل خير واحد على الأقل قبل تفعيل التذكيرات.','Choose at least one good deed before enabling reminders.'));return;}
    if(enabled&&!adhanNative){setMessage(t('تذكيرات الخلفية متاحة في نسخة Android.','Background reminders are available in the Android build.'));return;}
    setBusy(true);try{
      if(enabled){const permission=await adhanNative!.requestNotifications();if(!permission.granted){setMessage(t('اسمح بالإشعارات أولًا لتفعيل التذكير.','Allow notifications to enable reminders.'));return;}}
      const devotion={...state.devotion,reminders:{...state.devotion.reminders,[kind]:next}};
      const result=adhanNative?.configureReminders(JSON.stringify({locale:state.locale,entries:personalReminders(devotion)}));
      dispatch({type:'devotion',action:{type:'reminders',kind,value:next}});
      setMessage(enabled&&result&&!result.notifications?t('التذكير محفوظ، لكن فئة الإشعارات مقفولة من إعدادات الهاتف.','Saved, but this notification category is disabled in phone settings.'):enabled?t('تم حفظ مواعيد التذكير.','Reminder times saved.'):t('التذكيرات متوقفة.','Reminders are off.'));
    }catch{setMessage(t('تعذّر تجهيز التذكير. أعد المحاولة.','Reminders could not be prepared. Please retry.'));}finally{setBusy(false);}
  };
  return <Card><Row style={{justifyContent:'space-between',flexWrap:'nowrap'}}><View style={{flex:1}}><Txt bold size={18}>{t('تذكيرات اختيارية','Optional reminders')}</Txt><Txt muted size={12}>{kind==='deeds'?t('3 فرص للخير على مدار اليوم، حسب اختيارك','Three moments for good through the day, if you choose'):t('تذكير الصباح والمساء وقبل النوم','Morning, evening and before-sleep reminders')}</Txt></View><Switch accessibilityLabel={kind==='deeds'?t('تذكيرات أعمال الخير','Good deed reminders'):t('تذكيرات الأذكار','Adhkar reminders')} value={value.enabled} disabled={busy} trackColor={{false:colors.border,true:colors.primary}} onValueChange={enabled=>void save(enabled,!enabled)}/></Row>
    {times.map((time,i)=><Field key={i} label={kind==='adhkar'?[t('الصباح — HH:mm','Morning — HH:mm'),t('المساء — HH:mm','Evening — HH:mm'),t('قبل النوم — HH:mm','Before sleep — HH:mm')][i]:t(`التذكير ${i+1} — HH:mm`,`Reminder ${i+1} — HH:mm`)} value={time} maxLength={5} keyboardType="numbers-and-punctuation" onChangeText={text=>setTimes(old=>old.map((v,j)=>i===j?normalizeDigits(text):v))} style={{writingDirection:'ltr',textAlign:'center'}}/>)}
    <Button secondary disabled={busy} label={t('حفظ المواعيد','Save times')} onPress={()=>void save(value.enabled)}/><Txt muted size={11}>{t('المواعيد حسب الساعة المحلية في جهازك. يمكنك تغييرها أو إيقافها في أي وقت.','Times follow your device’s local clock. Change or turn them off anytime.')}</Txt>
    {value.enabled&&adhanNative?<Button secondary label={t('اختبار إشعار بعد 15 ثانية','Test a reminder in 15 seconds')} onPress={()=>{try{adhanNative?.testReminder(kind);setMessage(t('تم ضبط الاختبار؛ قد يتأخر حسب إعدادات الهاتف.','Test scheduled; timing may vary with phone settings.'));}catch{setMessage(t('تحقق من السماح بالإشعارات ومن تفعيل التذكير.','Check notification permission and enable reminders first.'));}}}/>:null}
    {adhanNative?<Button small secondary label={t('إعدادات الإشعارات','Notification settings')} onPress={()=>adhanNative?.openNotificationSettings()}/>:null}
    {message?<Txt size={12} accessibilityLiveRegion="polite">{message}</Txt>:null}
  </Card>;
}
