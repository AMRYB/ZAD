import React,{useState} from 'react';
import { router } from 'expo-router';
import {normalizeDigits} from '../core/calendar';
import { useApp } from '../state/AppContext';
import { newId,totals } from '../core/model';
import { Button,Card,ConfirmButton,Field,Meter,Row,Screen,Section,Stat,Txt } from '../ui/components';
export function Progress(){
  const {state,dispatch,t,colors}=useApp();const stats=totals(state);
  const [title,setTitle]=useState('');const [target,setTarget]=useState('10');const [error,setError]=useState(false);
  const create=()=>{const n=Number(target);if(!title.trim()||!Number.isInteger(n)||n<1||n>100000){setError(true);return;}dispatch({type:'goalAdd',id:newId(),title,target:n});setTitle('');setError(false);};
  return <Screen title={t('تقدّمي','My progress')} subtitle={t('أرقام من سجلاتك الفعلية، وليست مقياسًا للأجر','Based on your own records, never a measure of spiritual merit')}>
    <Row style={{alignItems:'stretch'}}><Stat label={t('صلوات مسجلة كمكتملة','Prayers marked complete')} value={stats.prayers}/><Stat label={t('أيام صيام مسجلة','Recorded fasting days')} value={stats.fasts}/></Row>
    <Row style={{alignItems:'stretch'}}><Stat label={t('صفحات فريدة مسجلة في الخطط','Unique pages recorded in plans')} value={stats.pages}/><Stat label={t('أيام لها سجل صلاة أو صيام','Days with prayer or fasting records')} value={stats.recordedDays}/></Row>
    <Button label={t('خطط الختمة والقراءة','Reading and khatmah plans')} onPress={()=>router.push('/plans')}/>
    <Section title={t('أهدافي','My goals')}/>
    {!state.goals.length?<Card><Txt muted>{t('أضف هدفًا شخصيًا، مثل عدد جلسات المراجعة أو المهام اليومية.','Add a personal goal, such as revision sessions or daily tasks.')}</Txt></Card>:null}
    {state.goals.map(g=><Card key={g.id}><Txt bold size={19}>{g.title}</Txt><Meter value={g.progress} total={g.target}/><Row style={{justifyContent:'space-between'}}><Button small secondary label={t('إنقاص واحد','Decrease by one')} onPress={()=>dispatch({type:'goalStep',id:g.id,change:-1})} disabled={!g.progress}/><Txt bold>{g.progress} / {g.target}</Txt><Button small label={t('إضافة واحد','Add one')} onPress={()=>dispatch({type:'goalStep',id:g.id,change:1})} disabled={g.progress===g.target}/></Row><ConfirmButton label={t('إزالة الهدف','Remove goal')} detail={t('ستتم إزالة الهدف وتقدمه من هذا الجهاز.','The goal and its progress will be removed from this device.')} onConfirm={()=>dispatch({type:'goalDelete',id:g.id})}/></Card>)}
    <Card><Txt bold size={19}>{t('هدف جديد','New goal')}</Txt><Field label={t('اسم الهدف','Goal name')} value={title} onChangeText={setTitle} maxLength={100}/><Field label={t('العدد المستهدف','Target count')} value={target} onChangeText={text=>setTarget(normalizeDigits(text))} keyboardType="number-pad"/>{error?<Txt style={{color:colors.danger}}>{t('اكتب اسمًا وعددًا صحيحًا من 1 إلى 100000.','Enter a name and a whole number from 1 to 100000.')}</Txt>:null}<Button label={t('حفظ الهدف','Save goal')} onPress={create}/></Card>
  </Screen>;
}
