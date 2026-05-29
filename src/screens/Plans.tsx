import React,{useState} from 'react';
import { router } from 'expo-router';
import { assignments,dateInZone,normalizeDigits,parseDate } from '../core/calendar';
import { defaultDeadline,newId,type ReadingPlan } from '../core/model';
import { useApp } from '../state/AppContext';
import { Button,Card,ConfirmButton,Field,Meter,Row,Screen,Section,Txt } from '../ui/components';
function PlanCard({plan}:{plan:ReadingPlan}){
  const {dispatch,t}=useApp();const [page,setPage]=useState('1');
  const assignment=assignments(plan.pages,plan.target,plan.deadline,dateInZone());
  const next=Array.from({length:plan.target},(_,i)=>i+1).find(n=>!plan.pages.includes(n));
  const n=Number(page);const valid=Number.isInteger(n)&&n>0&&n<=plan.target;
  return <Card><Txt bold size={21}>{plan.title}</Txt><Txt muted>{t(`الموعد المستهدف: ${plan.deadline}`,`Target date: ${plan.deadline}`)}</Txt><Meter value={plan.pages.length} total={plan.target}/>
    <Txt>{t(`${plan.pages.length} من ${plan.target} صفحة · اقتراح اليوم: ${assignment.perDay} صفحة`,`${plan.pages.length} of ${plan.target} pages · Suggested today: ${assignment.perDay} pages`)}</Txt>
    <Txt muted size={13}>{t('يُعاد توزيع المتبقي حسب موعدك. التقدم يُسجل فقط بتأكيدك، ويمكن تصحيحه.','Remaining pages are redistributed toward your deadline. Progress is recorded only when you confirm it and can be corrected.')}</Txt>
    {next?<Button label={t(`أؤكد قراءة الصفحة ${next}`,`Confirm reading page ${next}`)} onPress={()=>dispatch({type:'planPage',id:plan.id,page:next,completed:true})}/>:<Txt bold>{t('اكتملت الخطة المسجلة','Recorded plan complete')}</Txt>}
    <Field label={t('رقم صفحة لتصحيح السجل','Page number to adjust')} value={page} keyboardType="number-pad" onChangeText={text=>setPage(normalizeDigits(text))}/><Row><Button small secondary disabled={!valid} label={t('تسجيل الصفحة','Mark page read')} onPress={()=>dispatch({type:'planPage',id:plan.id,page:n,completed:true})}/><Button small secondary disabled={!valid||!plan.pages.includes(n)} label={t('إلغاء تسجيل الصفحة','Unmark page')} onPress={()=>dispatch({type:'planPage',id:plan.id,page:n,completed:false})}/></Row>
    <ConfirmButton label={t('إزالة الخطة وسجلها','Remove plan and its record')} detail={t('ستتم إزالة الخطة وسجل صفحاتها. الخطط الأخرى لن تتغير.','This removes this plan and its page record. Other plans are preserved.')} onConfirm={()=>dispatch({type:'planDelete',id:plan.id})}/>
  </Card>;
}
export function Plans(){
  const {state,dispatch,t,colors}=useApp();const [title,setTitle]=useState('');const [target,setTarget]=useState('604');const [deadline,setDeadline]=useState(defaultDeadline);const [error,setError]=useState(false);
  const create=()=>{try{parseDate(deadline);const n=Number(target);if(!title.trim()||!Number.isInteger(n)||n<1||n>604)throw new Error();dispatch({type:'planAdd',id:newId(),title,target:n,deadline});setTitle('');setError(false);}catch{setError(true);}};
  return <Screen title={t('خطط القراءة','Reading plans')} subtitle={t('خطة تناسب وقتك، وتتكيف مع الأيام الفائتة','A plan that fits your time and adapts to missed days')}>
    <Button secondary label={t('العودة إلى التقدم','Back to progress')} onPress={()=>router.canGoBack()?router.back():router.replace('/progress')}/>
    {!state.plans.length?<Card><Txt muted>{t('لا توجد خطط بعد. يمكنك إنشاء أكثر من خطة مستقلة.','No plans yet. You can create multiple independent plans.')}</Txt></Card>:null}
    {state.plans.map(plan=><PlanCard key={plan.id} plan={plan}/>)}
    <Section title={t('خطة جديدة','New plan')}/><Card><Field label={t('اسم الخطة','Plan name')} value={title} onChangeText={setTitle} maxLength={100}/><Field label={t('الهدف: قراءة الصفحات 1 حتى','Goal: read pages 1 through')} value={target} onChangeText={text=>setTarget(normalizeDigits(text))} keyboardType="number-pad"/><Field label={t('الموعد — YYYY-MM-DD','Deadline — YYYY-MM-DD')} value={deadline} onChangeText={text=>setDeadline(normalizeDigits(text))} autoCapitalize="none"/>{error?<Txt style={{color:colors.danger}}>{t('أدخل اسمًا وهدف صفحات من 1 إلى 604 وتاريخًا صحيحًا.','Enter a name, a page target from 1 to 604, and a valid date.')}</Txt>:null}<Button label={t('إنشاء الخطة','Create plan')} onPress={create}/></Card>
  </Screen>;
}
