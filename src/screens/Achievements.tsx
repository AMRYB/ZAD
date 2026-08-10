import React,{useMemo,useState} from 'react';
import {View} from 'react-native';
import {router} from 'expo-router';
import {LinearGradient} from 'expo-linear-gradient';
import {achievementProgress,DAILY_XP_CAP,xpRules,xpSummary} from '../core/gamification';
import {useApp} from '../state/AppContext';
import {AppIcon} from '../ui/AppIcon';
import {Button,Card,Choice,Meter,Row,Screen,Section,Txt} from '../ui/components';
import {useLocalDate} from '../ui/useLocalDate';

export function Achievements(){
  const {state,t,colors,dark}=useApp();const date=useLocalDate();
  const [filter,setFilter]=useState<'all'|'earned'|'next'>('all'),[rulesOpen,setRulesOpen]=useState(false);
  const summary=useMemo(()=>xpSummary(state.gamification,date),[state.gamification,date]);
  const badges=useMemo(()=>achievementProgress(state.gamification),[state.gamification]);
  const earned=badges.filter(b=>b.earnedOn).length;
  const visible=badges.filter(b=>filter==='all'||(filter==='earned'?!!b.earnedOn:!b.earnedOn));
  const recent=state.gamification.events.slice(-10).reverse();
  return <Screen title={t('إنجازاتي','My achievements')} subtitle={t('خطوات صغيرة، وتقدم تراه','Small steps. Visible progress.')}>
    <Button secondary label={t('العودة','Back')} onPress={()=>router.canGoBack()?router.back():router.replace('/more')}/>
    <LinearGradient colors={dark?['#233B56','#15223A']:['#176B57','#104D40']} style={{borderRadius:26,padding:24,gap:16}}>
      <Row style={{justifyContent:'space-between'}}><Txt bold size={13} style={{color:'#E4BC74'}}>{t('رحلتك الشخصية','YOUR PERSONAL JOURNEY')}</Txt><AppIcon name="star" color="#E4BC74" size={30}/></Row>
      <Txt bold size={36} style={{color:'#FFFFFF'}}>{t(`المستوى ${summary.level}`,`Level ${summary.level}`)}</Txt>
      <Row style={{justifyContent:'space-between'}}><Txt bold size={24} style={{color:'#FFFFFF',writingDirection:'ltr'}}>{summary.total} XP</Txt><Txt style={{color:'#E0EEE7'}}>{t(`${earned} من ${badges.length} شارة`,`${earned} of ${badges.length} badges`)}</Txt></Row>
      <View style={{backgroundColor:colors.surface,borderRadius:16,padding:16,gap:8}}><Meter value={summary.current} total={summary.required}/><Txt size={13}>{t(`${summary.current} من ${summary.required} نقطة في المستوى`,`${summary.current} of ${summary.required} XP in this level`)}</Txt><Txt muted size={12}>{t(`باقي ${summary.remaining} نقطة للمستوى ${summary.level+1}`,`${summary.remaining} XP to level ${summary.level+1}`)}</Txt></View>
    </LinearGradient>
    <Card><Row style={{justifyContent:'space-between'}}><Txt bold>{t('نقاط اليوم','Today’s XP')}</Txt><Txt bold style={{color:colors.primary,writingDirection:'ltr'}}>{summary.today} / {DAILY_XP_CAP}</Txt></Row><Meter value={summary.today} total={DAILY_XP_CAP}/><Txt muted size={13}>{t('نقاط تشجيعية للمشاركة داخل زاد؛ لا تقيس الثواب أو التدين. محفوظة على جهازك، ولا تُستخدم في ترتيب عام.','Encouragement for participation in ZAD, never a measure of religious merit. Saved on your device and excluded from public rankings.')}</Txt>{summary.reserved>summary.today?<Txt muted size={12}>{t('صححت تسجيلًا؛ انخفض رصيده، وحُجز تخصيصه الأصلي لليوم لمنع تكرار المكافأة. إعادة تسجيله تستعيد نفس الرصيد.','A corrected entry lost its XP. Its original daily allocation stays reserved to prevent duplicate rewards; recording it again restores that allocation.')}</Txt>:null}</Card>
    <Section title={t('شارات رحلتك','Journey badges')}/>
    <Choice value={filter} options={[{value:'all',label:t('الكل','All')},{value:'earned',label:t('المكتسبة','Earned')},{value:'next',label:t('القادمة','In progress')}]} onChange={setFilter}/>
    <Row style={{alignItems:'stretch',gap:12}}>{visible.map(b=><Card key={b.id} style={{flexGrow:1,flexBasis:'45%',minWidth:130,padding:16,gap:8}}>
      <View style={{alignSelf:'center',padding:16,borderRadius:24,backgroundColor:colors.soft,borderWidth:b.earnedOn?2:1,borderColor:b.earnedOn?colors.primary:colors.border}}><AppIcon name={b.icon} size={30} color={b.earnedOn?colors.primary:colors.muted}/></View>
      <Txt bold size={16}>{t(b.ar,b.en)}</Txt><Txt muted size={12}>{t(b.detailAr,b.detailEn)}</Txt><Meter value={b.current} total={b.target}/>
      <Txt size={12} style={{color:b.earnedOn?colors.primary:colors.muted}}>{b.earnedOn?t(`اكتسبتها في ${b.earnedOn}`,`Earned on ${b.earnedOn}`):t(`${b.current} من ${b.target}`,`${b.current} of ${b.target}`)}</Txt>
    </Card>)}</Row>
    {!visible.length?<Card><Txt muted>{filter==='next'?t('اكتملت الشارات الحالية. رحلتك مستمرة، على مهلك.','All current badges are complete. Keep going at your own pace.'):t('لم تكتسب شارة بعد. أول مشاركة جديدة تفتح أول شارة.','No badges earned yet. Your first new participation unlocks the first badge.')}</Txt></Card>:null}
    <Txt muted size={12}>{t('تبدأ النقاط والشارات من هذا التحديث، دون احتساب السجلات السابقة تلقائيًا. تصحيح التسجيلات يصحح المستوى والشارات المرتبطة بها.','XP and badges start with this update; existing records are not automatically rewarded. Correcting records updates their level and badge progress.')}</Txt>
    <Button secondary label={rulesOpen?t('إخفاء قواعد النقاط','Hide XP rules'):t('كيف أجمع النقاط؟','How do I earn XP?')} onPress={()=>setRulesOpen(v=>!v)}/>
    {rulesOpen?<Card>{xpRules.map(r=><View key={r.kind} style={{gap:4,paddingVertical:6}}><Txt bold size={15}>{t(r.ar,r.en)}</Txt><Txt muted size={13}>{t(r.detailAr,r.detailEn)}</Txt></View>)}<Txt muted size={12}>{t('حد إجمالي 100 نقطة يوميًا. لكل تسجيل مكافأة واحدة؛ تصحيح التسجيل أو حذفه يسحب رصيده، وإعادته تستعيد نفس التخصيص. كل مستوى يحتاج 100 نقطة × رقم المستوى الحالي.','A combined limit of 100 XP per day. Each entry earns once; correcting or deleting it withdraws its XP, and restoring it restores the same allocation. Each level needs 100 XP × the current level number.')}</Txt></Card>:null}
    <Section title={t('آخر المشاركات','Recent participation')}/>
    {!recent.length?<Card><Txt muted>{t('سجل يومك أو تقدمك في أهدافك لتبدأ. فتح الصفحات وحده لا يمنح نقاطًا.','Check in or record goal progress to begin. Opening screens alone does not earn XP.')}</Txt><Button label={t('سجّل يومك','Check in today')} onPress={()=>router.push('/day')}/></Card>:recent.map(e=><Card key={JSON.stringify([e.kind,e.source])} style={{padding:16}}><Row style={{flexWrap:'nowrap',justifyContent:'space-between'}}><View style={{flex:1}}><Txt bold size={14}>{t(xpRules.find(r=>r.kind===e.kind)!.ar,xpRules.find(r=>r.kind===e.kind)!.en)}</Txt><Txt muted size={12}>{e.date} · {e.active?t(e.points?'مسجّلة':'حد النقاط مكتمل',e.points?'Recorded':'XP limit reached'):t('أُلغي تسجيلها','Entry corrected')}</Txt></View><Txt bold style={{color:e.active&&e.points?colors.primary:colors.muted,writingDirection:'ltr'}}>{e.active?`+${e.points} XP`:'0 XP'}</Txt></Row></Card>)}
  </Screen>;
}
