import React,{useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,BackHandler,Pressable,View} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaView,useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppIcon} from '../ui/AppIcon';
import {adjacentAya,hilitesUrl,pageStart,plainTafsir,splitTafsir,tafsirUrl,versePage,type Coordinates} from '../core/ksu';
import {normalizeDigits} from '../core/calendar';
import {quran,surahEnglish} from '../data/quran';
import {KSU_RECITERS,KSU_TAFSIRS,reciterById,tafsirById} from '../data/ksu-readers';
import {readKsuText} from '../services/ksu';
import {useApp} from '../state/AppContext';
import {Button,Card,Choice,Field,Row,Txt} from '../ui/components';
import {IconButton,OptionRow,ReaderChip} from './quran/ReaderControls';
import {ReaderSheet} from './quran/ReaderSheet';
import {MushafCanvas} from './quran/MushafCanvas';
import {useAyahAudio} from './quran/useAyahAudio';
import {ReaderDeck} from './quran/ReaderDeck';

type Sheet='surah'|'page'|'aya'|'settings'|'reciter'|'tafsir-choice'|'tafsir'|'tools'|null;
function validatePoints(value:unknown):Coordinates{
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('INVALID_KSU_POINTS');
  for(const [key,p] of Object.entries(value))if(!/^\d+_\d+$/.test(key)||!Array.isArray(p)||p.length!==2||p.some(n=>typeof n!=='number'||!Number.isFinite(n)))throw new Error('INVALID_KSU_POINTS');
  return value as Coordinates;
}
const clock=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;

export function Quran(){
  const {state,dispatch,t,rtl,dark,colors,saveError,retrySave,readerImmersive,setReaderImmersive}=useApp();
  const insets=useSafeAreaInsets();
  const [selection,setSelection]=useState(state.lastRead);
  const [sheet,setSheet]=useState<Sheet>(null);
  const [search,setSearch]=useState('');
  const [number,setNumber]=useState('1');
  const [pickerError,setPickerError]=useState(false);
  const [returnToTafsir,setReturnToTafsir]=useState(false);
  const [zoom,setZoom]=useState(1);
  const [retry,setRetry]=useState(0);
  const [failedImage,setFailedImage]=useState<string|null>(null);
  const [planId,setPlanId]=useState('');
  const page=versePage(selection.sura,selection.aya);
  const name=rtl?quran.Sura[selection.sura]!.name!:surahEnglish[selection.sura]!;
  const reciter=reciterById(state.reader.reciter)!;
  const author=tafsirById(state.reader.tafsir)!;
  const reciterName=rtl?reciter.nameAr:reciter.nameEn;
  const authorName=rtl?author.nameAr:author.nameEn;
  const nextAyah=useCallback(()=>setSelection(current=>adjacentAya(current.sura,current.aya,1)),[]);
  const audio=useAyahAudio(reciter.id,selection.sura,selection.aya,nextAyah);
  const select=useCallback((next:{sura:number;aya:number})=>{setSelection(next);dispatch({type:'lastRead',...next});},[dispatch]);
  useEffect(()=>dispatch({type:'lastRead',...selection}),[selection,dispatch]);
  useFocusEffect(useCallback(()=>()=>setReaderImmersive(false),[setReaderImmersive]));
  useFocusEffect(useCallback(()=>{
    const sub=BackHandler.addEventListener('hardwareBackPress',()=>{
      if(!readerImmersive)return false;setReaderImmersive(false);return true;
    });return()=>sub.remove();
  },[readerImmersive,setReaderImmersive]));
  const pageQuery=useQuery({queryKey:['ksu-hilites',page],queryFn:async({signal})=>{
    const data=JSON.parse(await readKsuText(hilitesUrl(page),signal));return validatePoints(data[String(page)]);
  }});
  const tafsirQuery=useQuery({queryKey:['ksu-tafsir',author.id,selection.sura,selection.aya],enabled:sheet==='tafsir',queryFn:async({signal})=>splitTafsir(await readKsuText(tafsirUrl(author.id,selection.sura,selection.aya),signal))});
  const onImageError=useCallback(()=>setFailedImage(`${page}-${retry}`),[page,retry]);
  const imageFailed=failedImage===`${page}-${retry}`;
  const bookmarked=state.bookmarks.some(b=>b.sura===selection.sura&&b.aya===selection.aya);
  const selectedPlan=state.plans.find(p=>p.id===planId)??state.plans[0];
  const open=(target:Sheet)=>{setSheet(target);setSearch('');setNumber(String(target==='page'?page:selection.aya));setPickerError(false);};
  const movePage=useCallback((delta:number)=>{const p=page+delta;if(p>=1&&p<=604)select(pageStart(p));},[page,select]);
  const navigate=()=>{const n=Number(number);try{
    if(!Number.isInteger(n))throw new Error();const next=sheet==='page'?pageStart(n):{sura:selection.sura,aya:n};versePage(next.sura,next.aya);select(next);setSheet(null);
  }catch{setPickerError(true);}};
  const retryPage=()=>{setRetry(value=>value+1);void pageQuery.refetch();};
  const sheetTitles={surah:t('اختيار السورة','Choose a surah'),page:t('الانتقال إلى صفحة','Go to page'),aya:t('اختيار الآية','Choose an ayah'),settings:t('إعدادات القراءة','Reading settings'),reciter:t('اختيار القارئ','Choose a reciter'),'tafsir-choice':t('اختيار التفسير','Choose a tafsir'),tafsir:t('التفسير','Tafsir'),tools:t('أدوات القراءة','Reading tools')};
  const progress=audio.duration?Math.min(100,100*audio.currentTime/audio.duration):0;

  return <SafeAreaView edges={readerImmersive?['left','right']:['top','left','right']} style={{flex:1,backgroundColor:colors.background,direction:'ltr'}}>
    <StatusBar hidden={readerImmersive} style={dark?'light':'dark'}/>
    <View style={{flex:1,width:'100%',maxWidth:1100,alignSelf:'center'}}>
      <Row style={{paddingHorizontal:14,paddingVertical:6,flexWrap:'nowrap',gap:8}}>
        <Pressable accessibilityRole="button" accessibilityLabel={t(`السورة: ${name}`,`Surah: ${name}`)} onPress={()=>open('surah')} style={{flex:1,minHeight:48,justifyContent:'center'}}>
          <Txt muted size={10}>{readerImmersive?t(`القرآن الكريم · صفحة ${page}`,`THE HOLY QURAN · PAGE ${page}`):t('القرآن الكريم · حفص عن عاصم','THE HOLY QURAN · HAFS')}</Txt>
          <Row style={{gap:7}}><Txt bold size={20}>{name}</Txt><AppIcon name="chevron-down" size={15} color={colors.primary}/></Row>
        </Pressable>
        <IconButton icon="sliders" label={t('إعدادات القراءة','Reading settings')} onPress={()=>open('settings')}/>
        <IconButton icon={readerImmersive?'compress':'expand'} label={readerImmersive?t('إنهاء ملء الشاشة','Exit full screen'):t('ملء الشاشة','Full screen')} onPress={()=>setReaderImmersive(!readerImmersive)}/>
      </Row>
      {saveError?<Row style={{paddingHorizontal:14}}><Txt size={12} style={{color:colors.danger}}>{t('لم تُحفظ التغييرات بعد','Changes have not been saved')}</Txt><ReaderChip label={t('إعادة الحفظ','Retry saving')} onPress={retrySave}/></Row>:null}
      <View style={{flex:1,marginHorizontal:8}}>
        <MushafCanvas page={page} selection={selection} points={pageQuery.data} fit={state.reader.fit} zoom={zoom} onZoomChange={setZoom} onMovePage={movePage} retry={retry} onSelect={select} onImageError={onImageError} imageFailed={imageFailed}/>
        {pageQuery.isPending?<View pointerEvents="none" style={{position:'absolute',top:10,left:0,right:0,alignItems:'center'}}><View style={{padding:8,borderRadius:20,backgroundColor:colors.surface}}><ActivityIndicator color={colors.primary}/></View></View>:null}
        {imageFailed?<View style={{position:'absolute',top:0,bottom:0,left:0,right:0,justifyContent:'center',padding:20}}><Card><Txt>{t('تعذّر تحميل صورة الصفحة.','Could not load the page image.')}</Txt><Button label={t('إعادة المحاولة','Retry')} onPress={retryPage}/></Card></View>:null}
      </View>
      {pageQuery.isError?<Row style={{paddingHorizontal:14,justifyContent:'center'}}><Txt muted size={12}>{t('تحديد الآيات غير متاح حاليًا','Ayah selection is currently unavailable')}</Txt><IconButton icon="rotate-right" label={t('إعادة المحاولة','Retry')} onPress={retryPage}/></Row>:null}
      {readerImmersive?<View testID="reader-immersive-footer" style={{paddingTop:14,paddingBottom:Math.max(insets.bottom,12)+8,paddingHorizontal:12}}>
        <View testID="reader-immersive-card" style={{paddingHorizontal:6,paddingVertical:9,borderRadius:28,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,maxWidth:620,width:'100%',alignSelf:'center'}}>
          <View style={{flexDirection:'row-reverse',alignItems:'center',gap:10,paddingHorizontal:8}}>
            <View testID="reader-immersive-ayah" style={{flex:1}}><ReaderChip label={t(`الآية ${selection.aya}`,`Ayah ${selection.aya}`)} onPress={()=>open('aya')}/></View>
            <View testID="reader-immersive-play"><IconButton prominent icon={audio.playing?'pause':'play'} label={audio.playing?t('إيقاف مؤقت للتلاوة','Pause recitation'):t('تشغيل التلاوة','Play recitation')} onPress={audio.toggle}/></View>
            <View testID="reader-immersive-tafsir" style={{flex:1}}><ReaderChip label={t('التفسير','Tafsir')} onPress={()=>open('tafsir')}/></View>
          </View>
        </View>
      </View>:<ReaderDeck player={<>
        <Row style={{flexWrap:'nowrap',gap:7}}>
          <Pressable accessibilityRole="button" accessibilityLabel={t(`القارئ: ${reciterName}`,`Reciter: ${reciterName}`)} onPress={()=>open('reciter')} style={{flex:1,minHeight:44,justifyContent:'center'}}><Row style={{flexWrap:'nowrap',gap:8}}><AppIcon name="headphones" size={18} color={colors.primary}/><View style={{flex:1}}><Txt size={12} bold numberOfLines={1}>{reciterName}</Txt><Txt muted size={10}>{t('تغيير القارئ','Change reciter')}</Txt></View></Row></Pressable>
          <Txt muted size={11} style={{writingDirection:'ltr'}}>{clock(audio.currentTime)} / {clock(audio.duration)}</Txt>
          <IconButton icon={bookmarked?'bookmark':'bookmark'} label={bookmarked?t('إزالة العلامة','Remove bookmark'):t('حفظ علامة','Save bookmark')} active={bookmarked} onPress={()=>dispatch({type:'bookmark',...selection})}/>
          <IconButton icon="ellipsis" label={t('أدوات القراءة','Reading tools')} onPress={()=>open('tools')}/>
        </Row>
        <View accessibilityRole="progressbar" accessibilityLabel={t('تقدم التلاوة','Recitation progress')} accessibilityValue={{min:0,max:100,now:progress}} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} style={{height:3,marginVertical:7,marginHorizontal:8,borderRadius:3,backgroundColor:colors.soft,overflow:'hidden',direction:'ltr'}}><View style={{height:3,width:`${progress}%`,backgroundColor:colors.primary}}/></View>
        <Row style={{justifyContent:'space-between',gap:1,flexWrap:'nowrap',paddingTop:6}}>
          <IconButton icon="repeat" label={t('تكرار الآية','Repeat ayah')} active={audio.repeat} onPress={()=>audio.setRepeat(!audio.repeat)}/>
          <IconButton icon="forward-step" label={t('الآية التالية','Next ayah')} onPress={()=>select(adjacentAya(selection.sura,selection.aya,1))}/>
          {audio.loading?<Pressable accessibilityRole="button" accessibilityLabel={t('إيقاف التحميل والتلاوة','Stop loading and playback')} onPress={audio.pause} style={{width:56,height:56,borderRadius:28,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={colors.onPrimary}/></Pressable>:<IconButton prominent icon={audio.playing?'pause':'play'} label={audio.playing?t('إيقاف مؤقت للتلاوة','Pause recitation'):t('تشغيل التلاوة','Play recitation')} onPress={audio.toggle}/>}
          <IconButton icon="backward-step" label={t('الآية السابقة','Previous ayah')} onPress={()=>select(adjacentAya(selection.sura,selection.aya,-1))}/>
          <ReaderChip icon="book-open" label={t('التفسير','Tafsir')} onPress={()=>open('tafsir')}/>
        </Row>
      </>} navigation={<>
        <Row style={{flexWrap:'nowrap',gap:8,paddingVertical:3}}>
          <View style={{flex:1.5}}><ReaderChip large label={t(`سورة ${name}`,`Surah ${name}`)} onPress={()=>open('surah')}/></View>
          <View style={{flex:1}}><ReaderChip large label={t(`الآية ${selection.aya}`,`Ayah ${selection.aya}`)} onPress={()=>open('aya')}/></View>
        </Row>
        <Row style={{justifyContent:'space-between',flexWrap:'nowrap',gap:4}}>
          <View style={{flex:1}}><ReaderChip large label={t(`صفحة ${page} من 604`,`Page ${page} of 604`)} onPress={()=>open('page')}/></View>
        </Row>
      </>}/>}
      {audio.error?<Txt size={12} style={{color:colors.danger}}>{t('تعذّر تشغيل هذا التسجيل. جرّب مجددًا أو اختر قارئًا آخر.','This recording could not play. Retry or choose another reciter.')}</Txt>:null}
    </View>
    <ReaderSheet visible={sheet!==null} title={sheet?sheetTitles[sheet]:''} subtitle={sheet==='reciter'?t('اختر التلاوة التي تفضّلها','Choose your preferred recitation'):sheet==='tafsir'?`${name} · ${t('الآية','Ayah')} ${selection.aya}`:undefined} onClose={()=>setSheet(null)}>
      {sheet==='settings'?<>
        <OptionRow title={t('القارئ','Reciter')} detail={reciterName} icon="headphones" onPress={()=>open('reciter')}/>
        <OptionRow title={t('التفسير','Tafsir')} detail={authorName} icon="book-open" onPress={()=>{setReturnToTafsir(false);open('tafsir-choice');}}/>
        <Txt bold size={15}>{t('عرض صفحة المصحف','Mushaf page display')}</Txt>
        <Choice value={state.reader.fit} options={[{value:'page',label:t('الصفحة كاملة','Complete page')},{value:'width',label:t('ملء العرض','Fill width')}]} onChange={fit=>{dispatch({type:'readerSettings',fit});setZoom(1);}}/>
        <Txt muted size={12}>{t('كبّر بإصبعين وحرّك الصفحة بإصبع واحد. عند الحجم الطبيعي اسحب يمينًا للصفحة التالية ويسارًا للسابقة.','Pinch with two fingers to zoom and drag with one finger to pan. At normal size, swipe left for the next page and right for the previous page.')}</Txt>
        <Row><ReaderChip icon="minus" label={t('تصغير','Zoom out')} onPress={()=>setZoom(value=>Math.max(1,value-.5))}/><Txt bold style={{writingDirection:'ltr'}}>{Math.round(zoom*100)}%</Txt><ReaderChip icon="plus" label={t('تكبير','Zoom in')} onPress={()=>setZoom(value=>Math.min(3,value+.5))}/></Row>
        <ReaderChip icon="expand" label={t('إعادة ضبط العرض','Reset page view')} onPress={()=>{setZoom(1);dispatch({type:'readerSettings',fit:'page'});}}/>
        <OptionRow title={t('الانتقال إلى صفحة','Go to page')} detail={t(`صفحة ${page} من 604`,`Page ${page} of 604`)} icon="file" onPress={()=>open('page')}/>
        <OptionRow title={t('العلامات وخطط القراءة','Bookmarks and reading plans')} icon="bookmark" onPress={()=>open('tools')}/>
      </>:null}
      {sheet==='reciter'?<>
        <Field label={t('ابحث عن قارئ','Search reciters')} value={search} onChangeText={setSearch}/>
        {KSU_RECITERS.filter(item=>`${item.nameAr} ${item.nameEn}`.toLowerCase().includes(search.toLowerCase())).map(item=><OptionRow key={item.id} title={rtl?item.nameAr:item.nameEn} detail={item.lowData?t('توفير البيانات','Lower data use'):undefined} selected={item.id===reciter.id} icon="headphones" onPress={()=>{dispatch({type:'readerSettings',reciter:item.id});setSheet(null);}}/>)}
        <Txt muted size={11}>{t('قد يتعذر تسجيل بعينه مؤقتًا. يمكنك اختيار قارئ آخر.','Individual recordings may be temporarily unavailable. You can choose another reciter.')}</Txt>
      </>:null}
      {sheet==='tafsir-choice'?KSU_TAFSIRS.map(item=><OptionRow key={item.id} title={rtl?item.nameAr:item.nameEn} selected={item.id===author.id} icon="book-open" onPress={()=>{dispatch({type:'readerSettings',tafsir:item.id});setSheet(returnToTafsir?'tafsir':'settings');}}/>):null}
      {sheet==='surah'?<>
        <Field label={t('ابحث عن سورة أو رقمها','Search by surah name or number')} value={search} onChangeText={text=>setSearch(normalizeDigits(text))}/>
        {quran.Sura.map((item,i)=>item?.name&&i<=114&&(!search||item.name.includes(search)||surahEnglish[i].toLowerCase().includes(search.toLowerCase())||String(i)===search)?<OptionRow key={i} title={`${i}. ${rtl?item.name:surahEnglish[i]}`} detail={t(`${item.ayas} آية`,`${item.ayas} ayahs`)} selected={selection.sura===i} icon="book-open" onPress={()=>{select({sura:i,aya:1});setSheet(null);}}/>:null)}
      </>:null}
      {sheet==='page'||sheet==='aya'?<>
        <Field label={sheet==='page'?t('رقم الصفحة (1–604)','Page number (1–604)'):t(`رقم الآية (1–${quran.Sura[selection.sura]!.ayas})`,`Ayah number (1–${quran.Sura[selection.sura]!.ayas})`)} value={number} onChangeText={text=>setNumber(normalizeDigits(text))} keyboardType="number-pad"/>
        {pickerError?<Txt style={{color:colors.danger}}>{t('الرقم خارج النطاق.','Number is outside the valid range.')}</Txt>:null}<Button label={t('انتقال','Go')} onPress={navigate}/>
      </>:null}
      {sheet==='tafsir'?<>
        <ReaderChip label={t(`تفسير ${authorName}`,`${authorName} tafsir`)} icon="chevron-down" onPress={()=>{setReturnToTafsir(true);open('tafsir-choice');}}/>
        {tafsirQuery.isPending?<ActivityIndicator color={colors.primary}/>:tafsirQuery.isError?<Card><Txt>{t('تعذّر تحميل التفسير.','Could not load tafsir.')}</Txt><Button label={t('إعادة المحاولة','Retry')} onPress={()=>void tafsirQuery.refetch()}/></Card>:<>
          <Txt size={22} bold style={{textAlign:'right',writingDirection:'rtl'}}>{tafsirQuery.data.verseText}</Txt><Txt size={19} style={{textAlign:'right',writingDirection:'rtl'}}>{plainTafsir(tafsirQuery.data.tafsirHtml)}</Txt>
        </>}
        <Txt muted size={11}>{t('اختر التفسير من الزر بالأعلى.','Choose a tafsir using the button above.')}</Txt>
      </>:null}
      {sheet==='tools'?<>
        <Txt bold>{t('علاماتي المرجعية','My bookmarks')}</Txt>
        {state.bookmarks.length?state.bookmarks.map(bookmark=><OptionRow key={`${bookmark.sura}_${bookmark.aya}`} title={`${rtl?quran.Sura[bookmark.sura]?.name:surahEnglish[bookmark.sura]} · ${bookmark.aya}`} icon="bookmark" onPress={()=>{select(bookmark);setSheet(null);}}/>):<Txt muted>{t('احفظ موضعك بزر العلامة في شريط التلاوة.','Save a position with the bookmark button in the player.')}</Txt>}
        {selectedPlan?<Card><Txt bold>{t('تأكيد القراءة في خطة','Confirm reading in a plan')}</Txt><Choice value={selectedPlan.id} options={state.plans.map(plan=>({value:plan.id,label:plan.title}))} onChange={setPlanId}/><Button disabled={page>selectedPlan.target||selectedPlan.pages.includes(page)} label={selectedPlan.pages.includes(page)?t('الصفحة مسجلة في الخطة','Page already recorded'):t(`أؤكد قراءة الصفحة ${page}`,`Confirm reading page ${page}`)} onPress={()=>dispatch({type:'planPage',id:selectedPlan.id,page,completed:true})}/>{page>selectedPlan.target?<Txt muted size={12}>{t('هذه الصفحة خارج هدف الخطة المحددة.','This page is outside the selected plan’s target.')}</Txt>:null}</Card>:null}
        <Txt muted size={12}>{t('تتوقف التلاوة عند مغادرة القارئ أو وضع التطبيق في الخلفية.','Recitation pauses when leaving the reader or backgrounding the app.')}</Txt>
      </>:null}
    </ReaderSheet>
  </SafeAreaView>;
}
