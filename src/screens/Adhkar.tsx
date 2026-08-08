import React,{useEffect,useState} from 'react';
import {Linking,Pressable,View} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {useApp} from '../state/AppContext';
import {dateInZone} from '../core/calendar';
import {adhkarSession,type AdhkarCategory} from '../core/devotion';
import {adhkarEntries,adhkarSource,categoryInfo,entrySession,sectionEntries} from '../core/adhkar';
import {AppIcon} from '../ui/AppIcon';
import {Button,Card,Choice,ConfirmDialog,Meter,Row,Screen,Txt} from '../ui/components';
import {IconButton} from './quran/ReaderControls';
import {ReminderPreferences} from './devotion/ReminderPreferences';

export function Adhkar(){
  const params=useLocalSearchParams<{category?:string}>();
  const fromLink=categoryInfo.find(c=>c.id===params.category)?.id??null;
  return <AdhkarReader key={fromLink??'home'} initialCategory={fromLink}/>;
}
function AdhkarReader({initialCategory}:{initialCategory:AdhkarCategory|null}){
  const {state,dispatch,t,colors}=useApp();const saved=state.devotion.adhkar;
  const [category,setCategory]=useState<AdhkarCategory|null>(initialCategory),[favoriteOnly,setFavoriteOnly]=useState(false),[prayer,setPrayer]=useState('fajr'),[index,setIndex]=useState(()=>initialCategory?Math.max(0,sectionEntries(initialCategory,'fajr').findIndex(e=>e.id===saved.last[initialCategory])):0),[reset,setReset]=useState(false),[message,setMessage]=useState('');
  const [today,setToday]=useState(()=>dateInZone());
  useEffect(()=>{const timer=setInterval(()=>setToday(dateInZone()),30000);return()=>clearInterval(timer);},[]);
  const info=categoryInfo.find(c=>c.id===category);
  const all=category?sectionEntries(category,prayer):adhkarEntries;
  const list=favoriteOnly?all.filter(e=>saved.favorites.includes(e.id)):all;
  const position=Math.min(index,Math.max(0,list.length-1));const entry=list[position];
  const count=entry?Math.min(entry.repeat,saved.counts[entrySession(today,category??entry.categories[0],entry,prayer)]?.[entry.id]??0):0;
  const completed=category?all.filter(e=>(saved.counts[entrySession(today,category,e,prayer)]?.[e.id]??0)>=e.repeat).length:0;
  const open=(key:AdhkarCategory)=>{const entries=sectionEntries(key,prayer);const last=entries.findIndex(e=>e.id===saved.last[key]);setCategory(key);setFavoriteOnly(false);setIndex(Math.max(0,last));setMessage('');};
  const move=(next:number)=>{const bounded=Math.max(0,Math.min(list.length-1,next));setIndex(bounded);const e=list[bounded];if(category&&e)dispatch({type:'devotion',action:{type:'adhkarPosition',category,id:e.id}});};
  const step=(change:1|-1)=>{if(!entry)return;const cat=category??entry.categories[0];dispatch({type:'devotion',action:{type:'adhkarStep',session:entrySession(today,cat,entry,prayer),id:entry.id,limit:entry.repeat,change}});dispatch({type:'devotion',action:{type:'adhkarPosition',category:cat,id:entry.id}});};
  const close=()=>{if(category||favoriteOnly){if(initialCategory){router.replace('/adhkar');return;}setCategory(null);setFavoriteOnly(false);setIndex(0);}else if(router.canGoBack())router.back();else router.replace('/more');};
  return <Screen title={category? t(info!.ar,info!.en):favoriteOnly?t('الأذكار المفضلة','Favorite adhkar'):t('الأذكار','Adhkar')} subtitle={t('ذكرٌ حاضر، وقلبٌ مطمئن','A quiet moment of remembrance')} trailing={<IconButton icon="xmark" label={t('رجوع','Back')} onPress={close}/>}>
    {!category&&!favoriteOnly?<>
      <Card style={{backgroundColor:colors.primary,borderWidth:0}}><Txt size={23} bold style={{color:colors.onPrimary}}>{t('وردك على مهلك','Your remembrance, at your pace')}</Txt><Txt size={13} style={{color:colors.onPrimary}}>{t('اقرأ الذكر كاملًا، واضغط بعد كل مرة. تقدمك وآخر موضع محفوظان.','Read each remembrance in full and tap after each repetition. Progress and your place are saved.')}</Txt></Card>
      <View style={{gap:12}}>{categoryInfo.map(c=>{const entries=sectionEntries(c.id,prayer);const done=entries.filter(e=>(saved.counts[entrySession(today,c.id,e,prayer)]?.[e.id]??0)>=e.repeat).length;return <Pressable key={c.id} testID={`adhkar-${c.id}`} accessibilityRole="button" accessibilityLabel={t(c.ar,c.en)} onPress={()=>open(c.id)}><Card><Row style={{flexWrap:'nowrap'}}><View style={{width:48,height:48,borderRadius:16,backgroundColor:colors.soft,alignItems:'center',justifyContent:'center'}}><AppIcon name={c.icon} color={colors.primary}/></View><View style={{flex:1}}><Txt bold size={19}>{t(c.ar,c.en)}</Txt><Txt muted size={12}>{t(c.detailAr,c.detailEn)}</Txt></View><Txt size={12} muted style={{writingDirection:'ltr'}}>{done} / {entries.length}</Txt></Row></Card></Pressable>;})}</View>
      <Button secondary label={t(`المفضلة (${saved.favorites.length})`,`Favorites (${saved.favorites.length})`)} onPress={()=>{setFavoriteOnly(true);setIndex(0);}}/>
      <ReminderPreferences kind="adhkar"/>
      <Button secondary label={t('المصدر: حصن المسلم — رسالة الحرمين','Source: Hisn al-Muslim — Risala')} onPress={()=>void Linking.openURL(adhkarSource).catch(()=>setMessage(t('تعذّر فتح المصدر الآن.','The source could not be opened.')))}/>
    </>:<>
      {category==='prayer'?<Card><Txt bold>{t('بعد أي صلاة؟','After which prayer?')}</Txt><Choice value={prayer} options={[['fajr','الفجر','Fajr'],['dhuhr','الظهر','Dhuhr'],['asr','العصر','Asr'],['maghrib','المغرب','Maghrib'],['isha','العشاء','Isha']].map(([value,ar,en])=>({value,label:t(ar,en)}))} onChange={v=>{setPrayer(v);setIndex(0);}}/><Txt muted size={11}>{t('لكل صلاة تقدم مستقل. تظهر أذكار الفجر والمغرب الخاصة في وقتها.','Each prayer has its own progress. Prayer-specific entries appear in the corresponding section.')}</Txt></Card>:null}
      {category?<Card><Row style={{justifyContent:'space-between'}}><Txt bold>{t('تقدم الورد اليوم','Today’s section progress')}</Txt><Txt style={{writingDirection:'ltr'}}>{completed} / {all.length}</Txt></Row><Meter value={completed} total={all.length}/><Row style={{justifyContent:'space-between'}}><Button small secondary label={favoriteOnly?t('عرض الكل','Show all'):t('المفضلة فقط','Favorites only')} onPress={()=>{setFavoriteOnly(!favoriteOnly);setIndex(0);}}/><Txt muted size={12} style={{writingDirection:'ltr'}}>{today}</Txt></Row></Card>:null}
      {entry?<Card>
        <Row style={{justifyContent:'space-between'}}><Txt muted size={12}>{t(`ذكر ${position+1} من ${list.length}`,`Remembrance ${position+1} of ${list.length}`)}</Txt><IconButton icon="star" active={saved.favorites.includes(entry.id)} label={saved.favorites.includes(entry.id)?t('إزالة من المفضلة','Remove favorite'):t('إضافة للمفضلة','Add favorite')} onPress={()=>dispatch({type:'devotion',action:{type:'adhkarFavorite',id:entry.id}})}/></Row>
        <Txt testID="adhkar-full-text" selectable size={saved.fontSize} style={{writingDirection:'rtl',textAlign:'right',lineHeight:saved.fontSize*1.9}}>{entry.text}</Txt>
        {entry.instruction?<Txt size={14} muted style={{writingDirection:'rtl',textAlign:'right'}}>{entry.instruction}</Txt>:null}
        {entry.quran?.map(ref=><Button key={ref.sura} secondary label={t(`قراءة السورة كاملة في المصحف (${ref.sura})`,`Read the complete surah in Mushaf (${ref.sura})`)} onPress={()=>router.push({pathname:'/quran',params:{sura:String(ref.sura),aya:String(ref.aya),entry:String(Date.now())}})}/>)}
        <View style={{borderTopWidth:1,borderTopColor:colors.border,paddingTop:12,gap:6}}><Txt bold size={12}>{t('المصدر الشرعي','Religious source')}</Txt><Txt muted size={12}>{state.locale==='ar'?entry.reference.ar:entry.reference.en}</Txt><Txt muted size={11}>{t(`حصن المسلم · حاشية ${entry.sourceNotes.join('، ')}`,`Hisn al-Muslim · source notes ${entry.sourceNotes.join(', ')}`)}</Txt><Button secondary small label={t('فتح المصدر','Open source')} onPress={()=>void Linking.openURL(adhkarSource).catch(()=>setMessage(t('تعذّر فتح المصدر الآن.','The source could not be opened.')))}/></View>
        <Row style={{justifyContent:'space-between'}}><Txt bold>{entry.specifiedRepeat?t(`التكرار: ${entry.repeat}`,`Repetitions: ${entry.repeat}`):t('مرة للمتابعة','One reading to track')}</Txt><Txt bold size={22} style={{color:colors.primary,writingDirection:'ltr'}}>{count} / {entry.repeat}</Txt></Row>
        {!entry.specifiedRepeat?<Txt muted size={11}>{t('لم يحدد هذا النص عددًا؛ العداد هنا لتنظيم القراءة فقط.','This passage gives no repetition number; the counter tracks one reading.')}</Txt>:null}
        {entry.daily?<Txt muted size={11}>{t('عداد يومي مشترك بين الأقسام، حتى لا تُحسب القراءة مرتين.','One daily counter is shared across sections to avoid double counting.')}</Txt>:null}
        <Button testID="adhkar-step" disabled={count>=entry.repeat} label={count>=entry.repeat?t('اكتمل الذكر','Completed'):t('قرأتُ مرة','Read once')} onPress={()=>step(1)}/>
        <Row><View style={{flex:1}}><Button small secondary disabled={count===0} label={t('تراجع','Undo')} onPress={()=>step(-1)}/></View><View style={{flex:1}}><Button small secondary disabled={position===0} label={t('السابق','Previous')} onPress={()=>move(position-1)}/></View><View style={{flex:1}}><Button small secondary disabled={position===list.length-1} label={t('التالي','Next')} onPress={()=>move(position+1)}/></View></Row>
      </Card>:<Card><Txt>{t('لا توجد أذكار مفضلة هنا بعد. أضف نجمة لأي ذكر للرجوع له بسهولة.','No favorites here yet. Star a remembrance to find it easily later.')}</Txt></Card>}
      <Card><Txt bold>{t('حجم خط الذكر','Remembrance text size')}</Txt><Choice value={String(saved.fontSize)} options={[22,26,30,34].map(size=>({value:String(size),label:String(size)}))} onChange={size=>dispatch({type:'devotion',action:{type:'adhkarFont',size:Number(size)}})}/>{category?<Button secondary label={t('بدء الورد من جديد','Start this section again')} onPress={()=>setReset(true)}/>:null}</Card>
    </>}
    {message?<Txt style={{color:colors.danger}}>{message}</Txt>:null}
    <ConfirmDialog visible={reset} title={t('بدء الورد من جديد؟','Start this section again?')} detail={t('سيُصفّر تقدم القسم الحالي لهذه الجلسة فقط. المفضلة وباقي السجلات محفوظة.','Only this section’s current session resets. Favorites and other records are retained.')} confirmLabel={t('بدء من جديد','Start again')} onCancel={()=>setReset(false)} onConfirm={()=>{if(category)dispatch({type:'devotion',action:{type:'adhkarReset',session:adhkarSession(today,category,prayer)}});setIndex(0);setReset(false);}}/>
  </Screen>;
}
