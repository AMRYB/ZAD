import React,{useCallback,useEffect,useRef,useState} from 'react';
import { AppState,Image,Modal,Pressable,ScrollView,View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import { useAudioPlayer,useAudioPlayerStatus } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adjacentAya,hafsRects,hilitesUrl,husaryAudio,pageImage,pageStart,plainTafsir,saadieTafsirUrl,splitTafsir,versePage,type Coordinates } from '../core/ksu';
import {readKsuText} from '../services/ksu';
import {normalizeDigits} from '../core/calendar';
import { quran,surahEnglish } from '../data/quran';
import { useApp } from '../state/AppContext';
import { Button,Card,Choice,Field,Loading,Row,Screen,Txt } from '../ui/components';
type Selection={sura:number;aya:number};
function validatePoints(value:unknown):Coordinates{
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('INVALID_KSU_POINTS');
  for(const [key,p] of Object.entries(value))if(!/^\d+_\d+$/.test(key)||!Array.isArray(p)||p.length!==2||p.some(n=>typeof n!=='number'||!Number.isFinite(n)))throw new Error('INVALID_KSU_POINTS');
  return value as Coordinates;
}
export function Quran(){
  const {state,dispatch,t,rtl,colors}=useApp();
  const [selection,setSelection]=useState<Selection>(state.lastRead);
  const [width,setWidth]=useState(0);const [retry,setRetry]=useState(0);const [failedImage,setFailedImage]=useState<string|null>(null);
  const [picker,setPicker]=useState<'surah'|'page'|'aya'|null>(null);const [search,setSearch]=useState('');const [number,setNumber]=useState('1');const [pickerError,setPickerError]=useState(false);
  const [tafsirOpen,setTafsirOpen]=useState(false);
  const [playing,setPlaying]=useState(false);const [repeat,setRepeat]=useState(false);const [audioError,setAudioError]=useState(false);const [planId,setPlanId]=useState('');
  const player=useAudioPlayer(null,{updateInterval:250});const status=useAudioPlayerStatus(player);
  const live=useRef({selection,playing,repeat});
  useEffect(()=>{live.current={selection,playing,repeat};},[selection,playing,repeat]);
  const finishLatch=useRef(false);
  const page=versePage(selection.sura,selection.aya);
  const name=rtl?quran.Sura[selection.sura]!.name:surahEnglish[selection.sura];
  const selectedPlan=state.plans.find(p=>p.id===planId)??state.plans[0];
  useEffect(()=>dispatch({type:'lastRead',...selection}),[selection,dispatch]);
  const pageQuery=useQuery({queryKey:['ksu-hilites',page],queryFn:async({signal})=>{const data=JSON.parse(await readKsuText(hilitesUrl(page),signal));return validatePoints(data[String(page)]);}});
  const tafsirQuery=useQuery({queryKey:['ksu-saadi',selection.sura,selection.aya],enabled:tafsirOpen,queryFn:async({signal})=>splitTafsir(await readKsuText(saadieTafsirUrl(selection.sura,selection.aya),signal))});
  const points=pageQuery.data;const loading=pageQuery.isPending;const failed=pageQuery.isError;const imageFailed=failedImage===`${page}-${retry}`;
  const tafsir=tafsirQuery.data;const tafsirError=tafsirQuery.isError;
  useEffect(()=>{
    if(!playing){player.pause();return;}
    let active=true;
    Promise.resolve().then(()=>{if(active){player.replace(husaryAudio(selection.sura,selection.aya));player.play();}}).catch(()=>{if(active){setAudioError(true);setPlaying(false);}});
    return()=>{active=false;try{player.pause();}catch{ /* Player hook releases the native resource on unmount. */ }};
  },[player,playing,selection.sura,selection.aya]);
  useEffect(()=>{
    const subscription=player.addListener('playbackStatusUpdate',event=>{
      if(!event.didJustFinish&&event.playing)finishLatch.current=false;
      if(event.error){setAudioError(true);setPlaying(false);return;}
      if(!event.didJustFinish||finishLatch.current||!live.current.playing)return;
      finishLatch.current=true;
      if(live.current.repeat){void player.seekTo(0).then(()=>player.play()).catch(()=>{setAudioError(true);setPlaying(false);});}
      else{const s=live.current.selection;setSelection(adjacentAya(s.sura,s.aya,1));}
    });return()=>subscription.remove();
  },[player]);
  useEffect(()=>{if(!playing||status.isLoaded)return;const timer=setTimeout(()=>{setAudioError(true);setPlaying(false);},15000);return()=>clearTimeout(timer);},[playing,status.isLoaded]);
  useFocusEffect(useCallback(()=>()=>{live.current.playing=false;setPlaying(false);try{player.pause();}catch{}},[player]));
  useEffect(()=>{const sub=AppState.addEventListener('change',value=>{if(value!=='active'){live.current.playing=false;setPlaying(false);player.pause();}});return()=>sub.remove();},[player]);
  const rects=points?hafsRects(page,points):[];const scale=width/456;
  const bookmarked=state.bookmarks.some(b=>b.sura===selection.sura&&b.aya===selection.aya);
  const openPicker=(kind:'surah'|'page'|'aya')=>{setPicker(kind);setSearch('');setNumber(String(kind==='page'?page:selection.aya));setPickerError(false);};
  const navigate=()=>{const n=Number(number);try{if(!Number.isInteger(n))throw new Error();const next=picker==='page'?pageStart(n):{sura:selection.sura,aya:n};versePage(next.sura,next.aya);setSelection(next);setPicker(null);setPickerError(false);}catch{setPickerError(true);}};
  const stop=()=>{live.current.playing=false;setPlaying(false);player.pause();};
  const popup=(visible:boolean,title:string,onClose:()=>void,children:React.ReactNode)=><Modal visible={visible} animationType="slide" onRequestClose={onClose}><SafeAreaView style={{flex:1,backgroundColor:colors.background,direction:'ltr'}}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,gap:18,maxWidth:860,width:'100%',alignSelf:'center'}}><Row style={{justifyContent:'space-between'}}><Txt bold size={23}>{title}</Txt><Button secondary small label={t('إغلاق','Close')} onPress={onClose}/></Row>{children}</ScrollView></SafeAreaView></Modal>;
  return <Screen title={t('القرآن الكريم','The Holy Quran')} subtitle={t('المصحف الأصلي · جامعة الملك سعود','Original Mushaf · King Saud University')}>
    <Row style={{justifyContent:'space-between'}}><Button small secondary label={t(`السورة: ${name}`,`Surah: ${name}`)} onPress={()=>openPicker('surah')}/><Button small secondary label={t(`الصفحة ${page}`,`Page ${page}`)} onPress={()=>openPicker('page')}/><Button small secondary label={t(`الآية ${selection.aya}`,`Ayah ${selection.aya}`)} onPress={()=>openPicker('aya')}/></Row>
    <View onLayout={event=>setWidth(Math.min(700,event.nativeEvent.layout.width))} style={{alignItems:'center',width:'100%'}}>
      {width>0?<View style={{width,height:672*scale,backgroundColor:'#FFFFFF',position:'relative',direction:'ltr'}}>
        <Image key={`${page}-${retry}`} accessibilityLabel={t(`صورة صفحة المصحف ${page}`,`Original Mushaf page ${page}`)} source={{uri:pageImage(page)}} resizeMode="contain" style={{width,height:672*scale}} onError={()=>setFailedImage(`${page}-${retry}`)}/>
        {!imageFailed?rects.map(rect=>{const [s,a]=rect.id.split('__')[0].split('_').map(Number);const active=s===selection.sura&&a===selection.aya;return <Pressable key={rect.id} testID={`ayah-${rect.id}`} accessibilityRole="button" accessibilityLabel={t(`سورة ${s}، الآية ${a}`,`Surah ${s}, ayah ${a}`)} accessibilityState={{selected:active}}
          aria-pressed={active} onPress={()=>setSelection({sura:s,aya:a})} style={{position:'absolute',top:rect.top*scale,left:rect.left*scale,width:rect.width*scale,height:rect.height*scale,backgroundColor:active?'rgba(23,107,87,0.18)':'transparent',borderRadius:3}}/>;}):null}
      </View>:null}
    </View>
    {loading?<Loading/>:null}
    {failed||imageFailed?<Card><Txt style={{color:colors.danger}}>{imageFailed?t('تعذّر تحميل صورة الصفحة من KSU.','Could not load the page image from KSU.'):t('تعذّر تحميل تحديد الآيات. يمكنك قراءة الصورة المتاحة دون تظليل.','Ayah selection could not load. You can read the available image without highlights.')}</Txt><Button secondary label={t('إعادة المحاولة','Retry')} onPress={()=>{setRetry(x=>x+1);void pageQuery.refetch();}}/></Card>:null}
    <Row style={{justifyContent:'space-between'}}><Button small secondary disabled={page===1} label={t('الصفحة السابقة','Previous page')} onPress={()=>setSelection(pageStart(page-1))}/><Button small secondary disabled={page===604} label={t('الصفحة التالية','Next page')} onPress={()=>setSelection(pageStart(page+1))}/></Row>
    <Card><Row style={{justifyContent:'space-between'}}><Txt bold>{t('الحصري · تلاوة الآية','Al-Husary · Ayah recitation')}</Txt><Txt muted size={13} style={{writingDirection:'ltr'}}>{playing?Math.floor(status.currentTime||0):0} / {playing?Math.floor(status.duration||0):0} {t('ث','s')}</Txt></Row>
      <Row style={{justifyContent:'center'}}><Button small secondary label={t('الآية السابقة','Previous ayah')} onPress={()=>setSelection(adjacentAya(selection.sura,selection.aya,-1))}/><Button label={playing?t('إيقاف التلاوة','Stop recitation'):t('تشغيل التلاوة','Play recitation')} onPress={()=>{setAudioError(false);if(playing)stop();else setPlaying(true);}}/><Button small secondary label={t('الآية التالية','Next ayah')} onPress={()=>setSelection(adjacentAya(selection.sura,selection.aya,1))}/></Row>
      <Choice value={repeat?'repeat':'continuous'} options={[{value:'continuous',label:t('متابعة الآيات','Continuous')},{value:'repeat',label:t('تكرار الآية','Repeat ayah')}]} onChange={value=>setRepeat(value==='repeat')}/>
      {audioError?<Txt style={{color:colors.danger}}>{t('تعذّر تشغيل الصوت من KSU. تحقق من الاتصال واضغط تشغيل للمحاولة.','Could not play KSU audio. Check your connection and press Play to retry.')}</Txt>:playing&&!status.isLoaded?<Loading/>:null}
    </Card>
    <Row><Button secondary label={t('تفسير السعدي','Al-Saadi tafsir')} onPress={()=>setTafsirOpen(true)}/><Button secondary label={bookmarked?t('إزالة العلامة','Remove bookmark'):t('حفظ علامة','Save bookmark')} onPress={()=>dispatch({type:'bookmark',...selection})}/></Row>
    {selectedPlan?<Card><Txt bold>{t('تسجيل القراءة باختيارك','Confirm your reading')}</Txt><Choice value={selectedPlan.id} options={state.plans.map(p=>({value:p.id,label:p.title}))} onChange={setPlanId}/><Button disabled={page>selectedPlan.target||selectedPlan.pages.includes(page)} label={selectedPlan.pages.includes(page)?t('الصفحة مسجلة في الخطة','Page already recorded'):t(`أؤكد قراءة الصفحة ${page}`,`Confirm reading page ${page}`)} onPress={()=>dispatch({type:'planPage',id:selectedPlan.id,page,completed:true})}/></Card>:null}
    {state.bookmarks.length?<Card><Txt bold>{t('علاماتي المرجعية','My bookmarks')}</Txt><Row>{state.bookmarks.map(b=><Button key={`${b.sura}_${b.aya}`} small secondary label={`${rtl?quran.Sura[b.sura]?.name:surahEnglish[b.sura]} · ${b.aya}`} onPress={()=>setSelection(b)}/>)}</Row></Card>:null}
    <Txt muted size={12}>{t('المحتوى من quran.ksu.edu.sa فقط. يتوقف الصوت عند مغادرة الشاشة أو وضع التطبيق في الخلفية.','Content is exclusively from quran.ksu.edu.sa. Audio stops when leaving this screen or backgrounding the app.')}</Txt>
    {popup(picker!==null,picker==='surah'?t('اختيار السورة','Choose a surah'):picker==='page'?t('الانتقال إلى صفحة','Go to page'):t('اختيار الآية','Choose an ayah'),()=>setPicker(null),picker==='surah'?<><Field label={t('ابحث عن سورة أو رقمها','Search by surah name or number')} value={search} onChangeText={setSearch}/>{quran.Sura.map((s,i)=>s&&s.name&&i<=114&&(!search||s.name.includes(search)||surahEnglish[i].toLowerCase().includes(search.toLowerCase())||String(i)===search)?<Button key={i} secondary label={`${i}. ${rtl?s.name:surahEnglish[i]}`} onPress={()=>{setSelection({sura:i,aya:1});setPicker(null);}}/>:null)}</>:<><Field label={picker==='page'?t('رقم الصفحة (1–604)','Page number (1–604)'):t(`رقم الآية (1–${quran.Sura[selection.sura]!.ayas})`,`Ayah number (1–${quran.Sura[selection.sura]!.ayas})`)} value={number} onChangeText={text=>setNumber(normalizeDigits(text))} keyboardType="number-pad"/>{pickerError?<Txt style={{color:colors.danger}}>{t('الرقم خارج النطاق.','Number is outside the valid range.')}</Txt>:null}<Button label={t('انتقال','Go')} onPress={navigate}/></>)}
    {popup(tafsirOpen,t(`تفسير السعدي · ${name} ${selection.aya}`,`Al-Saadi · ${name} ${selection.aya}`),()=>setTafsirOpen(false),tafsir?<><Txt size={23} bold style={{textAlign:'right',writingDirection:'rtl'}}>{tafsir.verseText}</Txt><Txt size={19} style={{textAlign:'right',writingDirection:'rtl'}}>{plainTafsir(tafsir.tafsirHtml)}</Txt><Txt muted size={12}>{t('تفسير عربي من المصدر الأصلي KSU، دون ترجمة مولدة.','Arabic tafsir from the original KSU source, without generated translation.')}</Txt></>:tafsirError?<Card><Txt style={{color:colors.danger}}>{t('تعذّر تحميل التفسير من KSU.','Could not load tafsir from KSU.')}</Txt><Button label={t('إعادة المحاولة','Retry')} onPress={()=>void tafsirQuery.refetch()}/></Card>:<Loading/>)}
  </Screen>;
}
