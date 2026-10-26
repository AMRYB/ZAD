import React,{useCallback,useEffect,useState} from 'react';
import {AccessibilityInfo,Pressable,Switch,View} from 'react-native';
import * as Haptics from 'expo-haptics';
import {useApp} from '../state/AppContext';
import {dateInZone,normalizeDigits} from '../core/calendar';
import {roundProgress,tasbihPhrases} from '../core/devotion';
import {Button,Card,Choice,ConfirmDialog,Field,Row,Screen,Txt} from '../ui/components';
import {AppIcon,type AppIconName} from '../ui/AppIcon';
import {TasbihBeads} from '../ui/TasbihBeads';
import {useLocalDate} from '../ui/useLocalDate';
import {useTasbihSound} from '../ui/useTasbihSound';
import {ReaderSheet} from './quran/ReaderSheet';
import {IconButton} from './quran/ReaderControls';

function CountAction({icon,label,onPress,disabled=false,prominent=false}:{icon:AppIconName;label:string;onPress:()=>void;disabled?:boolean;prominent?:boolean}){
  const {colors}=useApp();
  return <View style={{alignItems:'center',gap:4,minWidth:72}}><Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} aria-disabled={disabled} disabled={disabled} onPress={onPress}
    style={({pressed})=>({width:prominent?66:48,height:prominent?66:48,borderRadius:40,alignItems:'center',justifyContent:'center',backgroundColor:prominent?colors.primary:colors.surface,borderWidth:prominent?0:1,borderColor:colors.border,opacity:disabled?.35:pressed?.7:1,transform:[{scale:pressed?.95:1}]})}><AppIcon name={icon} size={prominent?28:19} color={prominent?colors.onPrimary:colors.muted}/></Pressable><Txt size={11} muted style={{textAlign:'center'}}>{label}</Txt></View>;
}

export function Tasbih(){
  const {state,dispatch,t,colors,rtl}=useApp();const value=state.devotion.tasbih;
  const phrase=tasbihPhrases.find(p=>p.id===value.phrase)!;
  const impact=useTasbihSound(value.sound??true);
  const count=value.counts[value.phrase],progress=roundProgress(count,value.target),today=useLocalDate();
  const [picker,setPicker]=useState(false),[settings,setSettings]=useState(false),[reset,setReset]=useState(false),[custom,setCustom]=useState(''),[message,setMessage]=useState(''),[reduced,setReduced]=useState(false);
  useEffect(()=>{let live=true;void AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(live)setReduced(v);}).catch(()=>{});const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return()=>{live=false;sub.remove();};},[]);
  const tap=useCallback(()=>{dispatch({type:'devotion',action:{type:'tasbihTap',date:dateInZone(),change:1}});if(value.haptics)void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});},[dispatch,value.haptics]);
  const openSettings=()=>{setCustom(String(value.target));setMessage('');setSettings(true);};
  return <Screen title={t('السبحة','Tasbih')} contentStyle={{flexGrow:1,paddingBottom:16}} trailing={<IconButton icon="sliders" label={t('إعدادات السبحة','Tasbih settings')} onPress={openSettings}/>}>
    <View style={{width:'100%',maxWidth:620,alignSelf:'center',gap:16,flexGrow:1}}>
      <TasbihBeads key={value.phrase} onCount={tap} onImpact={impact} count={count} current={progress.current} target={value.target} reduced={reduced}/>
      <Pressable testID="tasbih-phrase" accessibilityRole="button" accessibilityLabel={t('تغيير الذكر','Change remembrance')} onPress={()=>setPicker(true)} style={({pressed})=>({padding:18,borderRadius:22,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,opacity:pressed?.75:1})}>
        <Row style={{flexWrap:'nowrap',gap:12}}><View style={{width:40,height:40,borderRadius:15,backgroundColor:colors.soft,alignItems:'center',justifyContent:'center'}}><AppIcon name="circle-nodes" color={colors.primary} size={20}/></View><View style={{flex:1,gap:2}}><Txt size={10} muted>{t('الذكر الحالي','Current remembrance')}</Txt><Txt size={23} style={{writingDirection:'rtl',textAlign:rtl?'right':'left'}}>{phrase.ar}</Txt>{state.locale==='en'?<Txt size={12} muted>{phrase.en}</Txt>:null}</View><AppIcon name="chevron-down" color={colors.muted} size={15}/></Row>
      </Pressable>
      <View style={{flexDirection:rtl?'row-reverse':'row',alignItems:'center'}}>
        <View style={{flex:1,alignItems:'center'}}><Txt size={20} bold style={{writingDirection:'ltr'}}>{(value.daily[today]??0).toLocaleString('en-US')}</Txt><Txt size={10} muted>{t('تسبيحات النهارده','Today’s total')}</Txt></View>
        <View style={{width:1,height:30,backgroundColor:colors.border}}/>
        <View style={{flex:1,alignItems:'center'}}><Txt size={20} bold style={{writingDirection:'ltr'}}>{progress.rounds.toLocaleString('en-US')}</Txt><Txt size={10} muted>{t('جولات مكتملة','Completed rounds')}</Txt></View>
        <View style={{width:1,height:30,backgroundColor:colors.border}}/>
        <Pressable accessibilityRole="button" accessibilityLabel={t('تغيير هدف الجولة','Change round goal')} onPress={openSettings} style={{flex:1,minHeight:48,alignItems:'center'}}><Txt size={20} bold style={{writingDirection:'ltr'}}>{value.target}</Txt><Txt size={10} muted>{t('هدف الجولة','Round goal')}</Txt></Pressable>
      </View>
      <Row style={{justifyContent:'space-evenly',flexWrap:'nowrap',alignItems:'center',marginTop:2}}>
        <CountAction icon="minus" label={t('تراجع','Undo')} disabled={!count||!value.daily[today]} onPress={()=>dispatch({type:'devotion',action:{type:'tasbihTap',date:today,change:-1}})}/>
        <CountAction icon="plus" label={t('تسبيح','Count')} prominent onPress={tap}/>
        <CountAction icon="rotate-right" label={t('تصفير','Reset')} disabled={!count} onPress={()=>setReset(true)}/>
      </Row>
      {count>0&&count%value.target===0?<Txt accessibilityLiveRegion="polite" size={12} style={{textAlign:'center',color:colors.primary}}>{t('أتممت هدف الجولة. تقدر تكمل على راحتك.','Round goal reached. Continue at your own pace.')}</Txt>:null}
      <Txt size={10} muted style={{textAlign:'center'}}>{t('عدّادك محفوظ تلقائيًا','Your count is saved automatically')}</Txt>
    </View>
    <ReaderSheet visible={settings} title={t('إعدادات السبحة','Tasbih settings')} onClose={()=>setSettings(false)}>
      <Card style={{borderWidth:0,backgroundColor:colors.soft}}><Row style={{justifyContent:'space-between',flexWrap:'nowrap'}}><View style={{flex:1}}><Txt bold>{t('صوت الخرز','Bead sound')}</Txt><Txt muted size={12}>{t('خبطة خفيفة عند وصول الخرزة','A gentle tap when the bead lands')}</Txt></View><Switch accessibilityLabel={t('صوت الخرز','Bead sound')} value={value.sound??true} trackColor={{false:colors.border,true:colors.primary}} onValueChange={sound=>dispatch({type:'devotion',action:{type:'tasbihSettings',sound}})}/></Row></Card>
      <Card style={{borderWidth:0,backgroundColor:colors.soft}}><Row style={{justifyContent:'space-between',flexWrap:'nowrap'}}><View style={{flex:1}}><Txt bold>{t('اهتزاز خفيف','Gentle vibration')}</Txt><Txt muted size={12}>{t('بعد كل تسبيحة','After each count')}</Txt></View><Switch accessibilityLabel={t('اهتزاز السبحة','Tasbih vibration')} value={value.haptics} trackColor={{false:colors.border,true:colors.primary}} onValueChange={haptics=>dispatch({type:'devotion',action:{type:'tasbihSettings',haptics}})}/></Row></Card>
      <Txt bold>{t('هدف الجولة','Round goal')}</Txt>
      <Choice value={String(value.target)} options={['33','99','100'].map(v=>({value:v,label:v}))} onChange={v=>{dispatch({type:'devotion',action:{type:'tasbihSettings',target:Number(v)}});setCustom(v);setMessage('');}}/>
      <Field label={t('أو اختار عددًا من 1 إلى 10000','Or choose a number from 1 to 10000')} value={custom} onChangeText={v=>setCustom(normalizeDigits(v))} keyboardType="number-pad" maxLength={5}/>
      {message?<Txt accessibilityLiveRegion="polite" style={{color:colors.danger}}>{message}</Txt>:null}
      <Button label={t('حفظ الهدف','Save goal')} onPress={()=>{const n=Number(custom);if(!Number.isInteger(n)||n<1||n>10000){setMessage(t('اختار عددًا صحيحًا بين 1 و10000.','Choose a whole number from 1 to 10000.'));return;}dispatch({type:'devotion',action:{type:'tasbihSettings',target:n}});setMessage('');setSettings(false);}}/>
      <Txt muted size={11}>{t('الأرقام دي أهداف تنظيمية تختارها لنفسك.','These numbers are personal tracking goals you choose yourself.')}</Txt>
    </ReaderSheet>
    <ReaderSheet visible={picker} title={t('اختار الذكر','Choose remembrance')} onClose={()=>setPicker(false)}>{tasbihPhrases.map(p=><Pressable key={p.id} accessibilityRole="radio" accessibilityState={{checked:p.id===value.phrase}} aria-checked={p.id===value.phrase} onPress={()=>{dispatch({type:'devotion',action:{type:'tasbihSettings',phrase:p.id}});setPicker(false);}} style={{padding:16,borderRadius:16,backgroundColor:p.id===value.phrase?colors.soft:colors.surface}}><Row style={{justifyContent:'space-between',flexWrap:'nowrap'}}><View style={{flex:1}}><Txt size={21} style={{writingDirection:'rtl'}}>{p.ar}</Txt>{state.locale==='en'?<Txt muted size={12}>{p.en}</Txt>:null}</View><AppIcon name={p.id===value.phrase?'circle-check':'circle'} color={colors.primary}/></Row></Pressable>)}</ReaderSheet>
    <ConfirmDialog visible={reset} title={t('تصفير عداد الذكر الحالي؟','Reset this remembrance counter?')} detail={t('إجمالي نشاط النهارده والعدادات الأخرى هيفضلوا محفوظين.','Today’s activity total and your other counters are retained.')} confirmLabel={t('تصفير','Reset')} onCancel={()=>setReset(false)} onConfirm={()=>{dispatch({type:'devotion',action:{type:'tasbihReset'}});setReset(false);}}/>
  </Screen>;
}
