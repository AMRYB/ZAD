import React,{useEffect,useMemo,useState,useSyncExternalStore} from 'react';
import {router,useLocalSearchParams} from 'expo-router';
import {useApp} from '../state/AppContext';
import {useRecitation} from '../state/RecitationContext';
import {quran,surahEnglish} from '../data/quran';
import {KSU_RECITERS,KSU_TAFSIRS,reciterById,tafsirById} from '../data/ksu-readers';
import {normalizeDigits} from '../core/calendar';
import {pageStart} from '../core/ksu';
import {offlineResources,type OfflineJob,type OfflineKind,type OfflinePlan} from '../core/offline-quran';
import {quranDownloads} from '../services/quran-downloads';
import {Button,Card,Choice,ConfirmDialog,Field,Meter,Row,Screen,Section,Txt} from '../ui/components';
import {ReaderSheet} from './quran/ReaderSheet';
import {OptionRow} from './quran/ReaderControls';
const size=(bytes:number)=>bytes>=1048576?`${(bytes/1048576).toFixed(1)} MB`:`${(bytes/1024).toFixed(1)} KB`;
export function Downloads(){
  const {state,dispatch,t,rtl,colors}=useApp(),audio=useRecitation();
  const params=useLocalSearchParams<{kind?:string}>();
  const [kind,setKind]=useState<OfflineKind>(params.kind==='audio'||params.kind==='tafsir'?params.kind:'mushaf');
  const [reader,setReader]=useState(state.reader.reciter),[author,setAuthor]=useState(state.reader.tafsir);
  const [scope,setScope]=useState<'surah'|'all'>('surah'),[surah,setSurah]=useState(state.lastRead.sura);
  const [from,setFrom]=useState('1'),[to,setTo]=useState('604'),[picker,setPicker]=useState<'reader'|'author'|'surah'|null>(null),[search,setSearch]=useState('');
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[deleting,setDeleting]=useState<OfflineJob|null>(null);
  const snapshot=useSyncExternalStore(quranDownloads.subscribe,quranDownloads.getSnapshot,quranDownloads.getSnapshot);
  useEffect(()=>{void quranDownloads.init().catch(()=>{});},[]);
  const plan:OfflinePlan=useMemo(()=>kind==='mushaf'?{kind,source:'hafs',from:Number(from),to:Number(to)}:{kind,source:kind==='audio'?reader:author,from:scope==='all'?1:surah,to:scope==='all'?114:surah},[kind,from,to,reader,author,scope,surah]);
  const total=useMemo(()=>{try{return offlineResources(plan).length;}catch{return 0;}},[plan]);
  const task=async(action:()=>Promise<void>)=>{setBusy(true);setMessage('');try{await action();}catch{setMessage(t('تعذّر تنفيذ العملية. تحقق من المساحة وحاول مجددًا.','Could not complete this action. Check free storage and retry.'));}finally{setBusy(false);}};
  const title=(job:OfflinePlan)=>job.kind==='mushaf'?t('صفحات المصحف','Mushaf pages'):job.kind==='audio'?(rtl?reciterById(job.source)!.nameAr:reciterById(job.source)!.nameEn):(rtl?tafsirById(job.source)!.nameAr:tafsirById(job.source)!.nameEn);
  const range=(job:OfflinePlan)=>job.kind==='mushaf'?t(`الصفحات ${job.from}–${job.to}`,`Pages ${job.from}–${job.to}`):job.from===1&&job.to===114?t('القرآن كاملًا','Complete Quran'):job.from===job.to?(rtl?`سورة ${quran.Sura[job.from]!.name}`:surahEnglish[job.from]):t(`السور ${job.from}–${job.to}`,`Surahs ${job.from}–${job.to}`);
  const open=(job:OfflinePlan)=>{
    if(job.kind==='audio')dispatch({type:'readerSettings',reciter:reciterById(job.source)!.id});
    if(job.kind==='tafsir')dispatch({type:'readerSettings',tafsir:tafsirById(job.source)!.id});
    const verse=job.kind==='mushaf'?pageStart(job.from):{sura:job.from,aya:1};dispatch({type:'lastRead',...verse});router.push({pathname:'/quran',params:{sura:verse.sura,aya:verse.aya}});
  };
  return <Screen title={t('التنزيلات بدون إنترنت','Offline downloads')} subtitle={t('مصحفك وتلاوتك وتفسيرك معك أينما كنت','Keep your pages, recitation and tafsir with you')}>
    <Button secondary label={t('العودة للإعدادات','Back to settings')} onPress={()=>router.canGoBack()?router.back():router.replace('/settings')}/>
    <Card><Choice value={kind} options={[{value:'mushaf',label:t('المصحف','Mushaf')},{value:'audio',label:t('التلاوة','Recitation')},{value:'tafsir',label:t('التفسير','Tafsir')}]} onChange={setKind}/>
      {kind==='mushaf'?<><Txt muted size={13}>{t('يشمل صور الصفحات وإحداثيات تحديد الآيات. لتنزيل المصحف كاملًا اترك النطاق من 1 إلى 604.','Includes page images and ayah selection coordinates. Keep pages1–604 for the complete Mushaf.')}</Txt><Row><Field label={t('من صفحة','First page')} value={from} onChangeText={v=>setFrom(normalizeDigits(v))} keyboardType="number-pad" maxLength={3}/><Field label={t('إلى صفحة','Last page')} value={to} onChangeText={v=>setTo(normalizeDigits(v))} keyboardType="number-pad" maxLength={3}/></Row></>:<>
        <OptionRow title={kind==='audio'?t('القارئ','Reciter'):t('التفسير','Tafsir')} detail={title(plan)} icon={kind==='audio'?'headphones':'book-open'} onPress={()=>{setSearch('');setPicker(kind==='audio'?'reader':'author');}}/>
        <Choice value={scope} options={[{value:'surah',label:t('سورة محددة','One surah')},{value:'all',label:t('القرآن كاملًا','Complete Quran')}]} onChange={setScope}/>
        {scope==='surah'?<OptionRow title={t('السورة','Surah')} detail={rtl?quran.Sura[surah]!.name:surahEnglish[surah]} icon="book-open" onPress={()=>{setSearch('');setPicker('surah');}}/>:null}
      </>}
      <Txt muted size={12}>{total?t(`${total} ملف · الحجم يظهر مع التنزيل`,`${total} files · Size appears as files download`):t('تحقق من نطاق الصفحات من 1 إلى 604.','Enter a valid page range from1 to604.')}</Txt>
      <Button testID="start-quran-download" label={t('بدء التنزيل','Start download')} disabled={!snapshot.ready||!total||!!snapshot.active||busy} onPress={()=>void task(()=>quranDownloads.start(plan))}/>
      <Txt muted size={11}>{t('ابقِ التطبيق مفتوحًا أثناء التنزيل. عند مغادرته أو انقطاع الاتصال تقدر تستكمل الملفات المتبقية. التنزيل الكامل قد يستغرق وقتًا طويلًا؛ استخدم اتصال Wi-Fi.','Keep the app open while downloading. After leaving it or losing connection, resume the remaining files. Full downloads can take a long time; use Wi-Fi.')}</Txt>
    </Card>
    {snapshot.error?<Card><Txt style={{color:colors.danger}}>{t('تعذّر فتح مساحة التنزيلات.','Download storage could not open.')}</Txt><Button label={t('إعادة المحاولة','Retry')} onPress={()=>void task(()=>quranDownloads.init())}/></Card>:null}
    {message?<Txt accessibilityLiveRegion="polite" style={{color:colors.danger}}>{message}</Txt>:null}
    <Section title={t('تنزيلاتي','My downloads')}/><Txt muted size={13} style={{writingDirection:'ltr'}}>{snapshot.files} {t('ملف','files')} · {size(snapshot.bytes)}</Txt>
    {!snapshot.jobs.length?<Card><Txt muted>{t('ابدأ بتنزيل الصفحات أو اختر قارئًا أو تفسيرًا من الأعلى.','Download pages or choose a reciter or tafsir above to begin.')}</Txt></Card>:null}
    {snapshot.jobs.map(job=><Card key={job.id} testID={`download-job-${job.id}`}>
      <Txt bold size={17}>{title(job)}</Txt><Txt muted size={13}>{range(job)}</Txt>
      <Row style={{justifyContent:'space-between'}}><Txt size={12} style={{writingDirection:'ltr'}}>{job.done} / {job.total} · {size(job.bytes)}</Txt><Txt size={12} style={{color:job.status==='error'?colors.danger:colors.primary}}>{job.status==='complete'?t('متاح دون إنترنت','Available offline'):job.status==='running'?t('جارٍ التنزيل','Downloading'):job.status==='error'?t('تعذّر إكمال التنزيل','Download interrupted'):t('متوقف مؤقتًا','Paused')}</Txt></Row>
      <Meter value={job.done} total={job.total}/>
      {job.error?<Txt muted size={12}>{t('الملفات المكتملة محفوظة. تحقق من الاتصال والمساحة ثم اضغط استكمال.','Completed files are retained. Check connection and storage, then resume.')}</Txt>:null}
      <Row>{job.status==='running'?<Button small secondary label={t('إيقاف مؤقت','Pause')} disabled={busy} onPress={()=>void task(()=>quranDownloads.pause())}/>:job.status!=='complete'?<Button small label={t('استكمال','Resume')} disabled={!!snapshot.active||busy} onPress={()=>void task(()=>quranDownloads.start(job))}/>:null}
        {job.done>0?<Button small secondary label={t('استخدام في المصحف','Use in reader')} onPress={()=>open(job)}/>:null}
        <Button small secondary danger label={t('حذف التنزيل','Delete download')} disabled={!!snapshot.active||busy} onPress={()=>setDeleting(job)}/></Row>
    </Card>)}
    <ReaderSheet visible={picker!==null} title={picker==='reader'?t('اختيار القارئ','Choose a reciter'):picker==='author'?t('اختيار التفسير','Choose a tafsir'):t('اختيار السورة','Choose a surah')} onClose={()=>setPicker(null)}>
      <Field label={t('بحث','Search')} value={search} onChangeText={setSearch}/>
      {picker==='reader'?KSU_RECITERS.filter(r=>`${r.nameAr} ${r.nameEn}`.toLowerCase().includes(search.toLowerCase())).map(r=><OptionRow key={r.id} title={rtl?r.nameAr:r.nameEn} selected={reader===r.id} icon="headphones" onPress={()=>{setReader(r.id);setPicker(null);}}/>):null}
      {picker==='author'?KSU_TAFSIRS.filter(a=>`${a.nameAr} ${a.nameEn}`.toLowerCase().includes(search.toLowerCase())).map(a=><OptionRow key={a.id} title={rtl?a.nameAr:a.nameEn} selected={author===a.id} icon="book-open" onPress={()=>{setAuthor(a.id);setPicker(null);}}/>):null}
      {picker==='surah'?quran.Sura.slice(1,115).map((s,i)=>s&&`${s.name} ${surahEnglish[i+1]} ${i+1}`.toLowerCase().includes(normalizeDigits(search).toLowerCase())?<OptionRow key={i+1} title={`${i+1}. ${rtl?s.name:surahEnglish[i+1]}`} selected={surah===i+1} icon="book-open" onPress={()=>{setSurah(i+1);setPicker(null);}}/>:null):null}
    </ReaderSheet>
    <ConfirmDialog visible={!!deleting} title={t('حذف هذا التنزيل؟','Delete this download?')} detail={t('سيتوقف تشغيل التلاوة، وتُحذف الملفات غير المستخدمة في تنزيلات أخرى. علاماتك وسجلاتك محفوظة.','Recitation will stop and files unused by other downloads will be deleted. Your bookmarks and records are retained.')} confirmLabel={t('حذف التنزيل','Delete download')} onCancel={()=>setDeleting(null)} onConfirm={()=>{const job=deleting;setDeleting(null);if(job){audio.stop();void task(()=>quranDownloads.remove(job.id));}}}/>
  </Screen>;
}
