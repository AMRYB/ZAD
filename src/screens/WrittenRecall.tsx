import React,{useState} from 'react';
import {Linking,View} from 'react-native';
import {router} from 'expo-router';
import {useFonts} from 'expo-font';
import {useApp} from '../state/AppContext';
import {dateInZone} from '../core/calendar';
import {newId} from '../core/model';
import {compareRecall,recallWords,validRecallRange,type RecallRange,type WordDifference} from '../core/written-recall';
import {quran,surahEnglish} from '../data/quran';
import source from '../data/recall-source.json';
import {recallVerse} from '../services/official-recall';
import {Button,Card,Field,Meter,Row,Screen,Txt} from '../ui/components';
import {IconButton,OptionRow} from './quran/ReaderControls';
import {ReaderSheet} from './quran/ReaderSheet';

const fonts={KFGHafs:require('../../assets/quran-reference/kfgqpc_hafs_v30.ttf')};
const numberInput=(s:string)=>s.replace(/[٠-٩۰-۹]/g,c=>String(c.charCodeAt(0)-(c<='٩'?0x660:0x6f0))).replace(/[^0-9]/g,'').slice(0,3);

export function WrittenRecall(){
  const {state,dispatch,t,colors}=useApp();
  const [loaded,fontError]=useFonts(fonts);
  const saved=state.recall.last;
  const [surah,setSurah]=useState(saved?.surah??1),[from,setFrom]=useState(String(saved?.from??1)),[to,setTo]=useState(String(saved?.to??7));
  const [session,setSession]=useState<RecallRange|null>(null),[answer,setAnswer]=useState(''),[hinted,setHinted]=useState(false),[reference,setReference]=useState(false);
  const [result,setResult]=useState<ReturnType<typeof compareRecall>|null>(null),[error,setError]=useState(''),[picker,setPicker]=useState(false),[search,setSearch]=useState('');
  const name=(n:number)=>t(`سورة ${quran.Sura[n]!.name}`,surahEnglish[n]);
  const chooseRange={surah,from:Number(from),to:Number(to),current:Number(from),completed:false};
  const valid=validRecallRange(chooseRange),verse=session?recallVerse(session.surah,session.current):undefined;
  const begin=(range:RecallRange)=>{setSession(range);dispatch({type:'recallRange',value:range});setAnswer('');setResult(null);setReference(false);setHinted(false);setError('');};
  const review=()=>{
    if(!verse||!session||!recallWords(answer).length)return;
    try{
      const checked=compareRecall(verse.aya_text_emlaey,verse.aya_text_unicode,answer);
      setResult(checked);setReference(true);setError('');
      dispatch({type:'recallAttempt',value:{id:newId(),date:dateInZone(),surah:session.surah,ayah:session.current,matched:checked.matched,total:checked.total,letterErrors:checked.letterErrors,missing:checked.missing,extra:checked.extra,hinted}});
      setHinted(true);
    }catch{setError(t('النص أطول من حد المراجعة. اكتب آية واحدة فقط، بحد أقصى ٣٠٠ كلمة.','The text exceeds the review limit. Enter one ayah, up to 300 words.'));}
  };
  const next=()=>{
    if(!session)return;
    if(session.current===session.to){const done={...session,completed:true};dispatch({type:'recallRange',value:done});setSession(done);setAnswer('');setResult(null);setReference(false);}
    else begin({...session,current:session.current+1});
  };
  return <Screen title={t('تسميع بالكتابة','Written recall')} subtitle={t('اكتب من حفظك، وراجع على مهلك','Write from memory, then review at your pace')} trailing={<IconButton icon="xmark" label={t('رجوع','Back')} onPress={()=>router.canGoBack()?router.back():router.replace('/more')}/>}>
    {!session?<>
      <Card style={{backgroundColor:colors.primary,borderWidth:0}}><Txt bold size={22} style={{color:colors.onPrimary}}>{t('آية وراء آية','One ayah at a time')}</Txt><Txt size={14} style={{color:colors.onPrimary}}>{t('اختر وردك، واكتب الآيات من الذاكرة. هتظهر لك الكلمات والحروف المختلفة بعد المراجعة.','Choose a passage and write each ayah from memory. Review shows differences in words and letters.')}</Txt></Card>
      <Card><Txt bold size={19}>{t('اختر ورد التسميع','Choose your passage')}</Txt>
        <Button secondary label={name(surah)} onPress={()=>{setSearch('');setPicker(true);}}/>
        <Row style={{flexWrap:'nowrap'}}><View style={{flex:1}}><Field label={t('من الآية','First ayah')} value={from} onChangeText={s=>setFrom(numberInput(s))} keyboardType="number-pad" maxLength={3}/></View><View style={{flex:1}}><Field label={t('إلى الآية','Last ayah')} value={to} onChangeText={s=>setTo(numberInput(s))} keyboardType="number-pad" maxLength={3}/></View></Row>
        <Txt muted size={12}>{t(`عدد آيات السورة: ${quran.Sura[surah]!.ayas}. تراجع آية واحدة في كل خطوة.`,`This surah has ${quran.Sura[surah]!.ayas} ayahs. Review one per step.`)}</Txt>
        <Button testID="recall-start" disabled={!valid} label={t('ابدأ التسميع','Start recall')} onPress={()=>begin(chooseRange)}/>
        {saved&&!saved.completed?<Button secondary label={t(`كمّل ${name(saved.surah)} · الآية ${saved.current}`,`Resume ${name(saved.surah)} · ayah ${saved.current}`)} onPress={()=>begin(saved)}/>:null}
      </Card>
    </>:session.completed?<Card testID="recall-completed"><Txt bold size={23}>{t('انتهت مراجعة الورد','Passage review finished')}</Txt><Txt>{name(session.surah)} · {session.from} — {session.to}</Txt><Txt muted>{t('النتائج مراجعة للكتابة، وليست شهادة بإتقان الحفظ أو التجويد.','Results check writing; they do not certify memorization or tajweed.')}</Txt><Button label={t('اختر وردًا آخر','Choose another passage')} onPress={()=>setSession(null)}/><Button secondary label={t('راجع نفس الورد','Review this passage again')} onPress={()=>begin({...session,current:session.from,completed:false})}/></Card>:<>
      <Card><Row style={{justifyContent:'space-between'}}><Txt bold size={20}>{name(session.surah)}</Txt><Txt muted size={13}>{t(`الآية ${session.current}`,`Ayah ${session.current}`)}</Txt></Row><Meter value={session.current-session.from} total={session.to-session.from+1}/><Txt muted size={12}>{t(`${session.current-session.from+1} من ${session.to-session.from+1} في هذا الورد`,`Step ${session.current-session.from+1} of ${session.to-session.from+1}`)}</Txt></Card>
      {!verse?<Card><Txt style={{color:colors.danger}}>{t('الآية غير متاحة في المرجع المحفوظ. لا يمكن إجراء مراجعة.','This ayah is unavailable in the bundled reference. Review cannot proceed.')}</Txt></Card>:<Card>
        <Field testID="recall-answer" label={t('اكتب الآية من حفظك','Write the ayah from memory')} value={answer} onChangeText={text=>{setAnswer(text);setResult(null);setReference(false);setError('');}} multiline maxLength={6000} autoCorrect={false} autoComplete="off" textContentType="none" spellCheck={false} style={{minHeight:150,textAlign:'right',writingDirection:'rtl',textAlignVertical:'top',fontSize:22,lineHeight:38}}/>
        <Txt muted size={12}>{t('التشكيل غير مطلوب. اختلاف الهمزات وى/ي وة/ه يُراجع.','Diacritics are optional. Hamza, ى/ي and ة/ه differences are checked.')}</Txt>
        <Button testID="recall-review" disabled={!recallWords(answer).length||!!result} label={t('راجع الكتابة','Review writing')} onPress={review}/>
        {!reference?<Button secondary small label={t('إظهار المرجع · مساعدة','Show reference · hint')} onPress={()=>{setReference(true);setHinted(true);}}/>:null}
        {result?<View testID="recall-result" accessibilityLiveRegion="polite" style={{gap:12}}>
          <Txt bold size={20} style={{color:result.correct?colors.primary:colors.danger}}>{result.correct?t('الكتابة مطابقة للمرجع','Writing matches the reference'):t('فيه مواضع تحتاج مراجعة','Some places need review')}</Txt>
          <Txt>{t(`كلمات مطابقة: ${result.matched} من ${result.total} · اختلافات حروف: ${result.letterErrors}`,`Matching words: ${result.matched} of ${result.total} · letter differences: ${result.letterErrors}`)}</Txt>
          {result.missing||result.extra?<Txt muted size={13}>{t(`كلمات ناقصة: ${result.missing} · زائدة: ${result.extra}`,`Missing words: ${result.missing} · extra words: ${result.extra}`)}</Txt>:null}
          {result.words.filter(w=>w.kind!=='same').map((word,i)=><Difference key={i} word={word}/>)}
          <Row><View style={{flex:1}}><Button secondary small label={t('أعد المحاولة','Try again')} onPress={()=>{setAnswer('');setResult(null);setReference(false);}}/></View><View style={{flex:1}}><Button small label={session.current===session.to?t('إنهاء الورد','Finish passage'):t('الآية التالية','Next ayah')} onPress={next}/></View></Row>
        </View>:null}
        {reference?<View testID="recall-reference" style={{borderTopWidth:1,borderTopColor:colors.border,paddingTop:14,gap:10}}><Txt muted size={12}>{t('المرجع الأصلي · رواية حفص','Original reference · Hafs')}{hinted&&!result?t(' · ظهرت المساعدة',' · hint shown'):''}</Txt>{loaded?<Txt selectable size={30} style={{fontFamily:'KFGHafs',writingDirection:'rtl',textAlign:'right',lineHeight:62}}>{verse.aya_text_unicode}</Txt>:<Txt style={{color:fontError?colors.danger:colors.muted}}>{fontError?t('تعذّر تحميل خط المرجع. أعد فتح الصفحة.','The reference font could not load. Reopen this page.'):t('جارٍ تحميل خط المرجع…','Loading the reference font…')}</Txt>}</View>:null}
      </Card>}
      <Button secondary small label={t('الرجوع لاختيار الورد','Back to passage selection')} onPress={()=>{setSession(null);setAnswer('');setResult(null);}}/>
    </>}
    {error?<Txt accessibilityRole="alert" style={{color:colors.danger}}>{error}</Txt>:null}
    <Card><Txt bold size={15}>{t('عن المراجعة والخصوصية','Review & privacy')}</Txt><Txt muted size={12}>{t('المقارنة للحروف والكلمات فقط، وتقبل الرسم الإملائي أو العثماني الموجودين في المرجع. ليست تقييمًا للتلاوة أو التجويد، ولا تستخدم الميكروفون.','Comparison checks letters and words against the reference’s ordinary or Uthmanic spelling. It does not assess recitation or tajweed and uses no microphone.')}</Txt><Txt muted size={12}>{t('يحفظ زاد آخر موضع وآخر ١٠٠ نتيجة على الجهاز فقط. النص الذي تكتبه لا يُحفظ، والنتائج لا تُرسل للمزامنة السحابية.','ZAD keeps your place and the last 100 result summaries on this device. Your typed text is not stored, and these results are excluded from cloud sync.')}</Txt><Button secondary small label={t('مصدر النص: مجمع الملك فهد','Text source: King Fahd Complex')} onPress={()=>void Linking.openURL(source.landingPage).catch(()=>setError(t('تعذّر فتح المصدر.','The source could not be opened.')))}/><Txt muted size={11}>{t('المصدر الرسمي للنص لا يعني اعتماد التطبيق من الجهة الناشرة.','Official source material does not imply publisher endorsement of this app.')}</Txt></Card>
    {state.recall.attempts.length?<Card><Txt bold>{t('آخر المراجعات','Recent reviews')}</Txt>{state.recall.attempts.slice(-5).reverse().map(a=><View key={a.id} style={{gap:2,borderTopWidth:1,borderTopColor:colors.border,paddingTop:10}}><Txt size={14}>{name(a.surah)} · {t(`آية ${a.ayah}`,`ayah ${a.ayah}`)}</Txt><Txt muted size={12}>{a.date} · {t(`${a.matched} من ${a.total} كلمة مطابقة`,`Matches: ${a.matched}/${a.total}`)}{a.hinted?t(' · بمساعدة',' · assisted'):''}</Txt></View>)}</Card>:null}
    <ReaderSheet visible={picker} title={t('اختر السورة','Choose surah')} onClose={()=>setPicker(false)}><Field label={t('ابحث عن سورة','Search surahs')} value={search} onChangeText={setSearch}/>{Array.from({length:114},(_,i)=>i+1).filter(n=>`${n} ${quran.Sura[n]!.name} ${surahEnglish[n]}`.toLowerCase().includes(search.trim().toLowerCase())).map(n=><OptionRow key={n} title={name(n)} detail={t(`${quran.Sura[n]!.ayas} آية`,`${quran.Sura[n]!.ayas} ayahs`)} selected={surah===n} icon="book-open" onPress={()=>{setSurah(n);setFrom('1');setTo(String(quran.Sura[n]!.ayas));setPicker(false);}}/>)}</ReaderSheet>
  </Screen>;
}

function Difference({word}:{word:WordDifference}){
  const {t,colors}=useApp();
  const label=word.kind==='missing'?t('كلمة ناقصة','Missing word'):word.kind==='extra'?t('كلمة زائدة','Extra word'):t('اختلاف في الكتابة','Spelling difference');
  return <View style={{padding:12,borderWidth:1,borderColor:colors.border,borderRadius:12,gap:6}}><Txt bold size={12}>{label}</Txt>
    {word.entered?<Txt size={19} style={{textAlign:'right',writingDirection:'rtl'}}>{t('كتبت: ','You wrote: ')}{word.letters.map((l,i)=><Txt key={i} size={19} bold={l.kind!=='same'} style={{writingDirection:'rtl',color:l.kind==='same'?colors.text:colors.danger}}>{l.entered}</Txt>)}</Txt>:null}
    {word.expected?<Txt size={19} style={{textAlign:'right',writingDirection:'rtl'}}>{t('المرجع: ','Reference: ')}{word.letters.map((l,i)=><Txt key={i} size={19} bold={l.kind!=='same'} style={{writingDirection:'rtl',color:l.kind==='same'?colors.text:colors.primary}}>{l.expected}</Txt>)}</Txt>:null}
  </View>;
}
