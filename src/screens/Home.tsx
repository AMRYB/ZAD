import React from 'react';
import {router} from 'expo-router';
import {useApp} from '../state/AppContext';
import {emptyDay,PRAYERS} from '../core/model';
import {quran} from '../data/quran';
import {deedPresets} from '../core/devotion';
import {useLocalDate} from '../ui/useLocalDate';
import {NextPrayerCard} from '../ui/NextPrayerCard';
import {ParticipationCard} from '../ui/ParticipationCard';
import {Button,Card,Meter,Row,Screen,Section,Txt} from '../ui/components';
export function Home(){
  const {state,dispatch,t}=useApp(),date=useLocalDate(),day=state.days[date]??emptyDay();
  const sections=state.personalization.sections,last=state.lastRead;
  const done=PRAYERS.filter(p=>day.prayers[p]==='completed').length;
  const hour=new Date().getHours(),category=hour>=15?'evening':'morning';
  const deeds=state.devotion.deeds.selected.slice(0,3);
  return <Screen title={t('يومك في زاد','Your day in ZAD')} subtitle={new Intl.DateTimeFormat(state.locale,{weekday:'long',day:'numeric',month:'long'}).format(new Date(`${date}T12:00:00`))}>
    <NextPrayerCard/>
    {!state.personalization.complete?<Card><Txt bold>{t('خلّي زاد على مقاس يومك','Make ZAD fit your day')}</Txt><Txt muted size={13}>{t('حدد ما تحب متابعته ومدينتك، وتقدر تغيّرهم في أي وقت.','Choose your companions and city. You can change them anytime.')}</Txt><Button secondary label={t('خصص رحلتك','Make it yours')} onPress={()=>router.push('/setup')}/></Card>:null}
    {sections.includes('quran')?<><Section title={t('كمّل وردك','Continue your reading')}/><Card><Row style={{justifyContent:'space-between'}}><Txt bold size={23}>{quran.Sura[last.sura]?.name}</Txt><Txt muted>{t(`الآية ${last.aya}`,`Ayah ${last.aya}`)}</Txt></Row><Button label={t('متابعة القراءة','Continue reading')} onPress={()=>router.push('/quran')}/><Button secondary label={t('خطة القراءة','My reading plan')} onPress={()=>router.push('/plans')}/></Card></>:null}
    {sections.includes('adhkar')?<Card><Txt bold size={21}>{t(category==='morning'?'موعد ورد الصباح':'موعد ورد المساء',category==='morning'?'Your morning remembrance':'Your evening remembrance')}</Txt><Txt muted size={13}>{t('ارجع لآخر موضع محفوظ، وكمّل على مهلك.','Resume your saved place and continue at your own pace.')}</Txt><Button label={t('استكمال الأذكار','Continue adhkar')} onPress={()=>router.push({pathname:'/adhkar',params:{category}})}/></Card>:null}
    {sections.includes('tracker')?<><Section title={t('متابعة اليوم','Today’s check-ins')}/><Card><Txt bold>{t(`صلوات مسجلة كمكتملة: ${done} من 5`,`Prayers marked complete: ${done} of 5`)}</Txt><Button secondary label={t('فتح سجل يومي','Open today’s record')} onPress={()=>router.push('/day')}/>{state.habits.slice(0,3).map(h=><Button key={h.id} secondary label={`${h.dates.includes(date)?'✓ ':''}${h.title}`} onPress={()=>dispatch({type:'habitToggle',id:h.id,date})}/>)}</Card>{state.goals.slice(0,2).map(g=><Card key={g.id}><Txt bold>{g.title}</Txt><Meter value={g.progress} total={g.target}/><Row style={{justifyContent:'space-between'}}><Txt muted>{g.progress} / {g.target}</Txt><Button small secondary disabled={g.progress>=g.target} label={t('إضافة خطوة','Add a step')} onPress={()=>dispatch({type:'goalStep',id:g.id,change:1})}/></Row></Card>)}</>:null}
    {sections.includes('deeds')?<Card><Txt bold size={20}>{t('خطوات الخير التي اخترتها','The good you chose')}</Txt>{deeds.length?deeds.map(id=>{const preset=deedPresets.find(d=>d.id===id);const name=preset?t(preset.ar,preset.en):state.devotion.deeds.custom.find(d=>d.id===id)?.title??'';return <Button key={id} secondary label={`${state.devotion.deeds.days[date]?.includes(id)?'✓ ':''}${name}`} onPress={()=>dispatch({type:'devotion',action:{type:'deedToggle',id,date}})}/>;}):<Txt muted size={13}>{t('اختار أعمالًا تحب الاستمرار عليها، بدون مهام مفروضة.','Choose acts you want to keep doing, without assigned tasks.')}</Txt>}<Button secondary label={t('كل أعمالي','My good deeds')} onPress={()=>router.push('/good-deeds')}/></Card>:null}
    {sections.includes('tasbih')?<Card><Row style={{justifyContent:'space-between'}}><Txt bold size={20}>{t('لحظة هدوء','A quiet moment')}</Txt><Txt muted>{t(`${state.devotion.tasbih.daily[date]??0} تسبيحة اليوم`,`${state.devotion.tasbih.daily[date]??0} counts today`)}</Txt></Row><Button secondary label={t('افتح السبحة','Open Tasbih')} onPress={()=>router.push('/tasbih')}/></Card>:null}
    <ParticipationCard/><Button secondary label={t('شوف تقرير أسبوعك','See your weekly report')} onPress={()=>router.push('/reports')}/>
  </Screen>;
}
