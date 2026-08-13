import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Platform} from 'react-native';
import {setAudioModeAsync,useAudioPlaylist,useAudioPlaylistStatus,type AudioPlaylistStatus} from 'expo-audio';
import {recitationQueue,sleepDeadline} from '../core/recitation';
import {quran} from '../data/quran';
import type {Bookmark} from '../core/model';
import {reciterById} from '../data/ksu-readers';
import {adhanNative} from '../services/adhan-native';
import {useApp} from './AppContext';
import {RecitationContext} from './RecitationContext';
const empty:never[]=[];
export function RecitationProvider({children}:{children:React.ReactNode}){
  const {dispatch,state,restoreEpoch}=useApp();
  const [request,setRequest]=useState<{reciter:string;queue:ReturnType<typeof recitationQueue>;sources:{uri:string;name:string}[]}|null>(null);
  const playlist=useAudioPlaylist({sources:request?.sources??empty,updateInterval:250});
  const status=useAudioPlaylistStatus(playlist);
  const [loading,setLoading]=useState(false),[error,setError]=useState(false),[repeat,setRepeatState]=useState(false),[deadline,setDeadline]=useState(0),[sleepExact,setSleepExact]=useState(true);
  const generation=useRef(0),repeatRef=useRef(false);
  const invalidate=useCallback(()=>{generation.current++;},[]);
  const listeners=useRef(new Set<(verse:Bookmark)=>void>());
  const subscribe=useCallback((listener:(verse:Bookmark)=>void)=>{listeners.current.add(listener);return()=>{listeners.current.delete(listener);};},[]);
  const current=status.id===playlist.id;
  const verse=request?.queue[current?status.currentIndex:0]??null;
  const pause=useCallback(()=>{generation.current++;playlist.pause();setLoading(false);},[playlist]);
  const stop=useCallback(()=>{pause();playlist.clearLockScreenControls();adhanNative?.recitationSleep(0);setDeadline(0);setRequest(null);},[pause,playlist]);
  const oldEpoch=useRef(restoreEpoch);
  useEffect(()=>{if(oldEpoch.current!==restoreEpoch){oldEpoch.current=restoreEpoch;stop();}},[restoreEpoch,stop]);
  const activate=useCallback(()=>{
    if(!request)return;
    const version=++generation.current;
    void setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:true,interruptionMode:'doNotMix'}).then(()=>{
      if(version!==generation.current)return;
      playlist.loop=repeatRef.current?'single':'none';
      const title=state.locale==='ar'?`سورة ${quran.Sura[request.queue[0].sura]!.name}`:`Surah ${request.queue[0].sura}`;
      const reciter=reciterById(request.reciter)!;
      playlist.setActiveForLockScreen(true,{title,artist:state.locale==='ar'?reciter.nameAr:reciter.nameEn,albumTitle:'ZAD'},{showNextTrack:true,showPreviousTrack:true});
      playlist.play();
    }).catch(()=>{if(version===generation.current){setError(true);setLoading(false);}});
    // Language changes do not restart a running recitation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[playlist,request]);
  useEffect(()=>{activate();return invalidate;},[activate,invalidate]);
  useEffect(()=>{
    const sub=playlist.addListener('playlistStatusUpdate',(event:AudioPlaylistStatus&{error?:unknown})=>{
      if(event.error){setError(true);pause();}
      if(event.isLoaded)setLoading(false);
    });return()=>sub.remove();
  },[playlist,pause]);
  useEffect(()=>{const sub=playlist.addListener('trackChanged',event=>{const item=request?.queue[event.currentIndex];if(item)for(const listener of listeners.current)listener({sura:item.sura,aya:item.aya});});return()=>sub.remove();},[playlist,request]);
  useEffect(()=>{if(!request||!loading)return;const timer=setTimeout(()=>{setError(true);pause();},20000);return()=>clearTimeout(timer);},[request,loading,pause]);
  useEffect(()=>{if(verse)dispatch({type:'lastRead',sura:verse.sura,aya:verse.aya});},[verse,dispatch]);
  useEffect(()=>{if(!deadline)return;const timer=setInterval(()=>{if(Date.now()>=deadline){pause();playlist.clearLockScreenControls();setDeadline(0);}},1000);return()=>clearInterval(timer);},[deadline,pause,playlist]);
  useEffect(()=>()=>{adhanNative?.recitationSleep(0);},[]);
  const playFrom=(reciter:string,sura:number,aya:number)=>{
    if(request?.reciter===reciter&&verse?.sura===sura&&verse?.aya===aya&&!error){setLoading(!current||!status.isLoaded);activate();return;}
    const queue=recitationQueue(reciter,sura,aya);
    // A failed identical queue needs native re-preparation rather than replaying an errored player.
    if(error&&request?.reciter===reciter&&request.queue[0].sura===sura&&request.queue[0].aya===aya){playlist.clear();for(const item of request.sources)playlist.add(item);setError(false);setLoading(true);activate();return;}
    generation.current++;playlist.pause();setLoading(true);setError(false);setRequest({reciter,queue,sources:queue.map(v=>({uri:v.url,name:`${quran.Sura[v.sura]!.name} · ${v.aya}`}))});
  };
  const setRepeat=(value:boolean)=>{repeatRef.current=value;setRepeatState(value);
    // eslint-disable-next-line react-hooks/immutability -- Expo SharedObject invokes a native setter, not a React state mutation.
    playlist.loop=value?'single':'none';};
  const setSleep=(minutes:number)=>{const until=sleepDeadline(minutes,Date.now());if(Platform.OS==='android'&&adhanNative){const result=adhanNative.recitationSleep(minutes);setSleepExact(result.exact);}setDeadline(until);};
  return <RecitationContext.Provider value={{verse:verse?{sura:verse.sura,aya:verse.aya}:null,reciter:request?.reciter??null,playing:current&&status.playing,loading,error,repeat,currentTime:current?status.currentTime:0,duration:current?status.duration:0,deadline,sleepExact,playFrom,toggle:()=>{if(current&&status.playing)pause();else if(request)playFrom(request.reciter,verse?.sura??request.queue[0].sura,verse?.aya??request.queue[0].aya);},pause,stop,next:()=>playlist.next(),previous:()=>playlist.previous(),setRepeat,setSleep,subscribe}}>{children}</RecitationContext.Provider>;
}
