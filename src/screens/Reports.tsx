import React,{useMemo,useState} from 'react';
import {Pressable,View} from 'react-native';
import {router} from 'expo-router';
import {useApp} from '../state/AppContext';
import {activityReport} from '../core/reports';
import {useLocalDate} from '../ui/useLocalDate';
import {Button,Card,Choice,Row,Screen,Section,Stat,Txt} from '../ui/components';
export function Reports(){
  const {state,t,colors}=useApp(),today=useLocalDate();const [range,setRange]=useState<'7'|'30'>('7'),[selected,setSelected]=useState(today);
  const report=useMemo(()=>activityReport(state,today,Number(range) as 7|30),[state,today,range]);
  const day=report.days.find(d=>d.date===selected)??report.days.at(-1)!;
  return <Screen title={t('تقاريري','My reports')} subtitle={t('من سجلاتك، على مدار الأيام','Your records through the days')}>
    <Button secondary label={t('العودة','Back')} onPress={()=>router.canGoBack()?router.back():router.replace('/more')}/>
    <Choice value={range} options={[{value:'7',label:t('آخر 7 أيام','Last 7 days')},{value:'30',label:t('آخر 30 يومًا','Last 30 days')}]} onChange={setRange}/>
    <Txt muted size={13} style={{writingDirection:'ltr'}}>{report.days[0].date} — {today}</Txt>
    <Row style={{alignItems:'stretch'}}><Stat label={t('أيام لها مشاركة مسجلة','Days with recorded participation')} value={`${report.activeDays} / ${range}`}/><Stat label={t('صفحات قراءة مسجلة','Recorded reading-plan pages')} value={report.pages}/></Row>
    <Row style={{alignItems:'stretch'}}><Stat label={t('صلوات مسجلة كمكتملة','Prayers marked complete')} value={report.prayers}/><Stat label={t('أيام صيام مسجلة','Recorded fasting days')} value={report.fasts}/></Row>
    <Row style={{alignItems:'stretch'}}><Stat label={t('متابعات العادات','Habit check-ins')} value={report.habits}/><Stat label={t('أعمال مسجلة','Good-deed check-ins')} value={report.deeds}/></Row>
    <Row style={{alignItems:'stretch'}}><Stat label={t('ضغطات السبحة','Tasbih counts')} value={report.tasbih}/><Stat label={t('أذكار استُكمل تكرارها','Adhkar entries completed')} value={report.adhkar}/></Row>
    <Section title={t('تقويم نشاطك','Your activity calendar')}/><Card><Row style={{gap:8}}>{report.days.map(d=><Pressable key={d.date} accessibilityRole="button" accessibilityLabel={`${d.date} · ${d.active?t('مشاركة مسجلة','Recorded participation'):t('لا تسجيلات','No records')}`} accessibilityState={{selected:day.date===d.date}} onPress={()=>setSelected(d.date)} style={{width:40,minHeight:48,borderRadius:14,borderWidth:day.date===d.date?2:1,borderColor:day.date===d.date?colors.primary:colors.border,backgroundColor:d.active?colors.primary:colors.soft,alignItems:'center',justifyContent:'center'}}><Txt bold size={13} style={{color:d.active?colors.onPrimary:colors.muted}}>{Number(d.date.slice(-2))}</Txt></Pressable>)}</Row><View style={{gap:8,paddingTop:10}}><Txt bold>{day.date}</Txt><Txt muted size={13}>{t(`صلوات مكتملة ${day.prayers} · عادات ${day.habits} · أعمال ${day.deeds}`,`Completed prayers ${day.prayers} · Habits ${day.habits} · Good deeds ${day.deeds}`)}</Txt><Txt muted size={13}>{t(`صفحات ${day.pages} · أذكار مكتملة ${day.adhkar} · تسبيحات ${day.tasbih}`,`Pages ${day.pages} · Completed adhkar ${day.adhkar} · Tasbih ${day.tasbih}`)}</Txt><Button secondary label={t('فتح سجل اليوم','Open day record')} onPress={()=>router.push({pathname:'/day',params:{date:day.date}})}/></View></Card>
    <Txt muted size={12}>{t('أرقام شخصية لما سجلته، وليست تقييمًا للعبادة أو للأجر. صفحات القراءة المؤرخة متاحة منذ إضافة النقاط في 0.9.0؛ لم ننسب صفحاتك الأقدم إلى تواريخ غير معروفة. اليوم الخالي من التسجيل لا يعني عدم قيامك بعمل.','Personal records, never a measure of religious merit. Dated reading-plan pages are available from XP tracking in 0.9.0; older pages are not assigned invented dates. A day with no record does not mean you did nothing.')}</Txt>
  </Screen>;
}
