import {useCallback,useEffect,useRef,useState} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {useAudioPlayer,useAudioPlayerStatus} from 'expo-audio';
import {recitationUrl} from '../../core/ksu';

export function useAyahAudio(reciter:string,sura:number,aya:number,onNext:()=>void){
  const player=useAudioPlayer(null,{updateInterval:250});
  const status=useAudioPlayerStatus(player);
  const source=recitationUrl(reciter,sura,aya);
  const [playing,setPlaying]=useState(false);
  const [repeat,setRepeat]=useState(false);
  const [error,setError]=useState(false);
  const [loading,setLoading]=useState(false);
  const [activeSource,setActiveSource]=useState<string|null>(null);
  const sourceRef=useRef<string|null>(null);
  const finishLatch=useRef(true);
  const live=useRef({playing,repeat,onNext});
  useEffect(()=>{live.current={playing,repeat,onNext};},[playing,repeat,onNext]);

  const pause=useCallback(()=>{
    live.current.playing=false;setPlaying(false);setLoading(false);
    try{player.pause();}catch{/* The hook releases its resource on unmount. */}
  },[player]);
  useEffect(()=>{
    if(!playing){player.pause();return;}
    let active=true;
    Promise.resolve().then(()=>{
      if(!active)return;
      if(sourceRef.current!==source){
        finishLatch.current=true;sourceRef.current=source;
        setActiveSource(source);setLoading(true);player.replace(source);
      }
      player.play();
    }).catch(()=>{if(active){setError(true);pause();sourceRef.current=null;}});
    return()=>{active=false;try{player.pause();}catch{}};
  },[player,playing,source,pause]);
  useEffect(()=>{
    const subscription=player.addListener('playbackStatusUpdate',event=>{
      if(event.error){setError(true);sourceRef.current=null;pause();return;}
      if(event.isLoaded&&event.playing)setLoading(false);
      if(event.playing&&!event.didJustFinish)finishLatch.current=false;
      if(!event.didJustFinish||finishLatch.current||!live.current.playing)return;
      finishLatch.current=true;
      if(!live.current.repeat){live.current.onNext();return;}
      const finishedSource=sourceRef.current;
      void player.seekTo(0).then(()=>{
        if(live.current.playing&&sourceRef.current===finishedSource)player.play();
      }).catch(()=>{setError(true);pause();});
    });
    return()=>subscription.remove();
  },[player,pause]);
  useEffect(()=>{
    if(!playing||!loading)return;
    const timer=setTimeout(()=>{setError(true);sourceRef.current=null;pause();},15000);
    return()=>clearTimeout(timer);
  },[playing,loading,source,pause]);
  useFocusEffect(useCallback(()=>()=>pause(),[pause]));
  useEffect(()=>{
    const subscription=AppState.addEventListener('change',state=>{if(state!=='active')pause();});
    return()=>subscription.remove();
  },[pause]);
  const toggle=()=>{
    if(playing){pause();return;}
    setError(false);live.current.playing=true;setPlaying(true);
  };
  const currentSource=activeSource===source;
  return {playing,repeat,setRepeat,toggle,pause,error,loading,
    currentTime:currentSource?status.currentTime||0:0,
    duration:currentSource?status.duration||0:0};
}
