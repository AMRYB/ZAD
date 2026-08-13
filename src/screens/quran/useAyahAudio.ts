import {useEffect} from 'react';
import {useRecitation} from '../../state/RecitationContext';
export function useAyahAudio(reciter:string,sura:number,aya:number){
  const audio=useRecitation();
  const matching=audio.reciter===reciter&&audio.verse?.sura===sura&&audio.verse?.aya===aya;
  useEffect(()=>{
    if(audio.playing&&audio.reciter!==reciter)audio.playFrom(reciter,sura,aya);
    // Only an explicit reciter change restarts this queue. Native track changes are followed by the reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[reciter]);
  return {...audio,playing:matching&&audio.playing,loading:matching&&audio.loading,currentTime:matching?audio.currentTime:0,duration:matching?audio.duration:0,
    toggle:()=>{if(matching&&audio.playing)audio.pause();else audio.playFrom(reciter,sura,aya);}};
}
