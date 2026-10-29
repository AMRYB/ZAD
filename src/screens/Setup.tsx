import React,{useState} from 'react';
import {Pressable} from 'react-native';
import {router} from 'expo-router';
import {useApp} from '../state/AppContext';
import {homeSections,type HomeSection} from '../core/personalization';
import {Button,Card,Meter,Row,Screen,Txt} from '../ui/components';
import {ReminderPreferences} from './devotion/ReminderPreferences';
const titles={quran:['القرآن وخطة القراءة','Quran & reading plans'],adhkar:['الأذكار','Adhkar'],tracker:['متابعة اليوم والعادات','Daily tracking & habits'],deeds:['أعمال الخير','Good deeds'],tasbih:['السبحة','Tasbih']} as const;
export function Setup({onDone,onBack}:{onDone?:()=>void;onBack?:()=>void}){
  const {state,dispatch,t,colors}=useApp();const [step,setStep]=useState(0),[sections,setSections]=useState<HomeSection[]>(state.personalization.sections);
  const finish=()=>{dispatch({type:'personalization',value:{complete:true,sections}});if(onDone)onDone();else router.replace('/');};
  return <Screen title={t('رحلتك، على مقاسك','A journey that fits you')} subtitle={t(`الخطوة ${step+1} من 3 · كل الاختيارات قابلة للتغيير`,`Step ${step+1} of 3 · Everything can be changed`)}>
    <Meter value={step+1} total={3}/>
    {step===0?<Card><Txt bold size={22}>{t('تحب تتابع إيه في الرئيسية؟','What belongs on your home screen?')}</Txt><Txt muted size={13}>{t('اختر ما يناسبك. باقي الصفحات هتفضل متاحة في التطبيق.','Choose what matters to you. All other pages remain available.')}</Txt>{homeSections.map(id=><Pressable key={id} accessibilityRole="checkbox" accessibilityLabel={t(titles[id][0],titles[id][1])} accessibilityState={{checked:sections.includes(id)}} aria-checked={sections.includes(id)} onPress={()=>setSections(current=>current.includes(id)?current.length>1?current.filter(s=>s!==id):current:[...current,id])} style={{minHeight:54,padding:14,borderRadius:15,backgroundColor:sections.includes(id)?colors.soft:colors.background,borderWidth:1,borderColor:sections.includes(id)?colors.primary:colors.border}}><Row style={{justifyContent:'space-between'}}><Txt bold size={15}>{t(titles[id][0],titles[id][1])}</Txt><Txt style={{color:colors.primary}}>{sections.includes(id)?'✓':'○'}</Txt></Row></Pressable>)}</Card>:step===1?<>
      <Card><Txt bold size={22}>{t('مدينتك ومواقيتك','Your city & prayer times')}</Txt><Txt muted size={13}>{t('اختيار المدينة وتغييرها، وتفعيل الأذان، كلهم في المزيد ← الإعدادات ← الأذان. اختيار المدينة يدوي ولا يحتاج إذن الموقع.','Choose or change your city and enable Adhan in Explore → Settings → Adhan. Prayer-time city selection is manual and needs no location permission.')}</Txt>{!onDone?<Button secondary label={t('إعدادات الأذان','Adhan settings')} onPress={()=>{dispatch({type:'personalization',value:{complete:true,sections}});router.push('/adhan-settings');}}/>:null}</Card>
    </>:<><Card><Txt bold size={22}>{t('تذكيرات على وقتك','Reminders on your schedule')}</Txt><Txt muted>{t('اختيارية بالكامل. تقدر تتركها مقفولة وتفعّلها لاحقًا. تذكيرات الصلاة منفصلة في الإعدادات ← الأذان.','Entirely optional. Leave them off and enable them later. Prayer reminders are separate in Settings → Adhan.')}</Txt></Card><ReminderPreferences kind="adhkar"/><ReminderPreferences kind="deeds"/></>}
    <Button label={step===2?t('حفظ وابدأ يومك','Save & start your day'):t('التالي','Next')} onPress={()=>step===2?finish():setStep(step+1)}/>
    {step>0?<Button secondary label={t('السابق','Previous')} onPress={()=>setStep(step-1)}/>:<Button secondary label={t('العودة','Back')} onPress={()=>onBack?onBack():router.canGoBack()?router.back():router.replace('/more')}/>}
    <Button secondary label={t('احفظ الاختيارات وكمّل لاحقًا','Save choices & finish later')} onPress={finish}/>
  </Screen>;
}
