import React,{useState} from 'react';
import { addDays,dateInZone,normalizeDigits,parseDate } from '../core/calendar';
import { emptyDay,newId,PRAYERS,type PrayerStatus,type FastStatus } from '../core/model';
import { useApp } from '../state/AppContext';
import { Button,Card,ConfirmButton,Choice,Field,Row,Screen,Section,Txt } from '../ui/components';
const prayerNames={fajr:['الفجر','Fajr'],dhuhr:['الظهر','Dhuhr'],asr:['العصر','Asr'],maghrib:['المغرب','Maghrib'],isha:['العشاء','Isha']} as const;
export function Day({initialDate}:{initialDate?:string}){
  const {state,dispatch,t,colors}=useApp();
  const [date,setDate]=useState(()=>{try{if(initialDate){parseDate(initialDate);return initialDate;}}catch{}return dateInZone();});const [draft,setDraft]=useState(date);const [error,setError]=useState(false);
  const [habit,setHabit]=useState('');
  const day=state.days[date]??emptyDay();
  const choose=(d:string)=>{try{parseDate(d);setDate(d);setDraft(d);setError(false);}catch{setError(true);}};
  return <Screen title={t('يومي','My day')} subtitle={t('سجل شخصي، بلا مقارنة أو أحكام','A personal record, without comparisons or judgment')}>
    <Card><Row style={{justifyContent:'space-between'}}><Button small secondary label={t('اليوم السابق','Previous day')} onPress={()=>choose(addDays(date,-1))}/><Txt bold>{date}</Txt><Button small secondary label={t('اليوم التالي','Next day')} onPress={()=>choose(addDays(date,1))}/></Row>
      <Field label={t('التاريخ — YYYY-MM-DD','Date — YYYY-MM-DD')} value={draft} onChangeText={text=>setDraft(normalizeDigits(text))} autoCapitalize="none"/><Button secondary label={t('عرض التاريخ','Open date')} onPress={()=>choose(draft)}/>{error?<Txt style={{color:colors.danger}}>{t('أدخل تاريخًا صحيحًا بالصيغة الموضحة.','Enter a valid date in the format shown.')}</Txt>:null}</Card>
    <Section title={t('الصلوات','Prayer record')}/>
    {PRAYERS.map(prayer=><Card key={prayer}><Txt size={18} bold>{t(prayerNames[prayer][0],prayerNames[prayer][1])}</Txt><Choice<PrayerStatus> value={day.prayers[prayer]??'unlogged'} options={[
      {value:'unlogged',label:t('لم أسجل','Unlogged')},{value:'completed',label:t('مكتملة','Complete')},{value:'skipped',label:t('لم أؤدّها','Not completed')},{value:'excused',label:t('عذر','Excused')}
    ]} onChange={status=>dispatch({type:'prayer',date,prayer,status})}/></Card>)}
    <Section title={t('الصيام','Fasting')}/><Card><Choice<FastStatus> value={day.fast} options={[
      {value:'unlogged',label:t('لم أسجل','Unlogged')},{value:'fasted',label:t('صمت','Fasted')},{value:'notFasted',label:t('لم أصم','Did not fast')},{value:'excused',label:t('عذر','Excused')}
    ]} onChange={status=>dispatch({type:'fast',date,status})}/><Txt muted size={13}>{t('لا حاجة لذكر السبب. هذا السجل خاص بك.','No reason is required. This record is private.')}</Txt></Card>
    <Section title={t('عاداتي ومهامي اليومية','Daily habits & tasks')}/>
    {(state.habits??[]).map(h=><Card key={h.id}><Txt bold>{h.title}</Txt><Row><Button secondary label={h.dates.includes(date)?t('مكتملة — إلغاء التسجيل','Complete — undo'):t('تسجيل اكتمال اليوم','Mark complete today')} onPress={()=>dispatch({type:'habitToggle',id:h.id,date})}/><ConfirmButton label={t('إزالة العادة','Remove habit')} detail={t('ستتم إزالة العادة وسجل اكتمالها.','The habit and its completion history will be removed.')} onConfirm={()=>dispatch({type:'habitDelete',id:h.id})}/></Row></Card>)}
    <Card><Field label={t('عادة أو مهمة تتكرر يوميًا','A habit or task repeated daily')} value={habit} onChangeText={setHabit} maxLength={100}/><Button secondary disabled={!habit.trim()} label={t('إضافة عادة','Add habit')} onPress={()=>{dispatch({type:'habitAdd',id:newId(),title:habit});setHabit('');}}/></Card>
    <Card><Field label={t('ملاحظة خاصة لهذا اليوم','Private note for this day')} multiline maxLength={6000} value={day.note} onChangeText={text=>dispatch({type:'note',date,text})} style={{minHeight:120,textAlignVertical:'top'}}/><Txt muted size={12}>{t('تُحفظ محليًا، ولا تُرسل إلى أي خادم.','Stored locally. Never sent to a server.')}</Txt></Card>
  </Screen>;
}
