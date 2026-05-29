import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { View } from 'react-native';
import { dateInZone,seasonDay } from '../core/calendar';
import { emptyDay,PRAYERS } from '../core/model';
import { useApp } from '../state/AppContext';
import { Button,Card,Meter,Row,Screen,Section,Stat,Txt } from '../ui/components';
import { quran } from '../data/quran';

export function Home(){
  const {state,t,dark,colors}=useApp();
  const date=dateInZone();const day=state.days[date]??emptyDay();
  const done=PRAYERS.filter(p=>day.prayers[p]==='completed').length;
  const ramadan=seasonDay(state.season.start,date,state.season.length,state.season.adjustment);
  const last=state.lastRead;
  return <Screen title={t('كل يوم، بداية جديدة','A fresh beginning, every day')} subtitle={new Intl.DateTimeFormat(state.locale,{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())}>
    <LinearGradient colors={dark?['#233B56','#15223A']:['#176B57','#104D40']} style={{borderRadius:26,padding:25,gap:18,overflow:'hidden'}}>
      <Row style={{justifyContent:'space-between'}}><Txt size={12} bold style={{color:'#E4BC74'}}>{ramadan?t(`اليوم ${ramadan} من رمضان`,`RAMADAN · DAY ${ramadan}`):t('رحلتك مستمرة طوال العام','YOUR YEAR-ROUND JOURNEY')}</Txt><Txt size={42} style={{color:'#E4BC74'}}>☾</Txt></Row>
      <Txt size={24} bold style={{color:'#FFFFFF'}}>{t('على مهل، وبنية طيبة','At your pace, with intention')}</Txt>
      <Txt style={{color:'#E0EEE7'}}>{t('ليس المطلوب يومًا مثاليًا. اختر خطوة صغيرة تستطيع الاستمرار عليها.','Your day does not need to be perfect. Choose one small step you can keep taking.')}</Txt>
      <Button label={t('سجّل يومك','Check in today')} secondary onPress={()=>router.push('/day')}/>
    </LinearGradient>
    <Section title={t('لمحة عن اليوم','Today at a glance')}/>
    <Row style={{alignItems:'stretch'}}><Stat label={t('صلوات مسجلة كمكتملة','Prayers marked complete')} value={`${done} / 5`}/><Stat label={t('الأهداف المكتملة','Completed goals')} value={state.goals.filter(g=>g.progress===g.target).length}/></Row>
    <Section title={t('موعدك مع القرآن','Your time with the Quran')}/>
    <Card><Row style={{justifyContent:'space-between'}}><Txt bold size={21}>{quran.Sura[last.sura]?.name}</Txt><Txt muted>{t(`الآية ${last.aya}`,`Ayah ${last.aya}`)}</Txt></Row><Txt muted>{t('عد إلى موضعك الأخير، دون أن تفقد هدوء الرحلة.','Continue from your last selected ayah.')}</Txt><Button label={t('متابعة القراءة','Continue reading')} onPress={()=>router.push('/quran')}/></Card>
    <Section title={t('خطوة نحو هدفك','One step toward your goal')}/>
    {state.goals.length?state.goals.slice(0,2).map(g=><Card key={g.id}><Row style={{justifyContent:'space-between'}}><Txt bold>{g.title}</Txt><Txt muted>{g.progress} / {g.target}</Txt></Row><Meter value={g.progress} total={g.target}/></Card>):<Card><Txt muted>{t('لا توجد أهداف بعد. ابدأ بهدف بسيط قابل للقياس.','No goals yet. Start with something small and measurable.')}</Txt><Button label={t('إنشاء هدف','Create a goal')} secondary onPress={()=>router.push('/progress')}/></Card>}
    {!state.season.start?<View style={{padding:16,borderRadius:16,backgroundColor:colors.soft}}><Txt muted size={13}>{t('لم يُحدد موسم رمضان. يمكنك ضبط بدايته وطوله من الإعدادات حسب الجهة التي تتبعها.','Ramadan season has not been configured. Set its start and length in Settings according to your chosen authority.')}</Txt></View>:null}
  </Screen>;
}
