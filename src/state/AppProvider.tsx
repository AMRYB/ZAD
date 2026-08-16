import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Pressable,Text,View,useColorScheme} from 'react-native';
import {initialState,reducer,restoreState,type Action,type State} from '../core/model';
import {applyCloud,cloudDocument,mergeGuest,stageProfile,type Profile} from '../core/cloud';
import * as repository from '../storage/repository';
import {profiles} from '../services/profile-repository';
import {palette} from '../ui/theme';
import {useAuth} from './AuthContext';
import {AppContext} from './AppContext';
export function AppProvider({children}:{children:React.ReactNode}){
  const auth=useAuth(),owner=auth.owner;
  const [state,setState]=useState(initialState),current=useRef(state);
  const [ready,setReady]=useState(false),[loadError,setLoadError]=useState(false),[saveError,setSaveError]=useState(false),[saving,setSaving]=useState(false);
  const [displayedOwner,setDisplayedOwner]=useState<string|null|undefined>(undefined);
  const [restoreEpoch,setRestoreEpoch]=useState(0),[readerImmersive,setReaderImmersive]=useState(false);
  const queue=useRef<Promise<void>>(Promise.resolve()),revision=useRef(0),hydration=useRef(0);
  const activeOwner=useRef<string|null|undefined>(undefined),loadedOwner=useRef<string|null|undefined>(undefined),scheme=useColorScheme();
  const hydrate=useCallback(()=>{
    if(!auth.ready)return;
    const ticket=++hydration.current;activeOwner.current=owner;loadedOwner.current=undefined;revision.current++;
    void queue.current.catch(()=>{}).then(async()=>{
      const guest=await repository.load();
      const defaults={...initialState(),onboarded:true,locale:guest.locale,theme:guest.theme,reader:guest.reader,adhan:guest.adhan,personalization:guest.personalization,devotion:{...initialState().devotion,reminders:guest.devotion.reminders,tasbih:{...initialState().devotion.tasbih,haptics:guest.devotion.tasbih.haptics}}};
      const next=owner?(await profiles.ensure(owner,defaults)).state:guest;
      if(ticket===hydration.current){loadedOwner.current=owner;current.current=next;setState(next);setDisplayedOwner(owner);setReady(true);setLoadError(false);setSaving(false);setSaveError(false);setRestoreEpoch(n=>n+1);}
    }).catch(()=>{if(ticket===hydration.current)setLoadError(true);});
  },[auth.ready,owner]);
  useEffect(hydrate,[hydrate]);
  const persist=useCallback((next:State,modify?:(p:Profile)=>Profile)=>{
    const rev=++revision.current;setSaving(true);
    const task=queue.current.catch(()=>{}).then(async()=>{if(owner)await profiles.update(owner,p=>modify?modify(p):stageProfile(p,next));else await repository.save(next);});
    queue.current=task.then(()=>{if(rev===revision.current&&activeOwner.current===owner){setSaveError(false);setSaving(false);}}).catch(()=>{if(rev===revision.current&&activeOwner.current===owner){setSaveError(true);setSaving(false);}});
    return task;
  },[owner]);
  const dispatch=useCallback((action:Action)=>{
    if(loadedOwner.current!==owner||activeOwner.current!==owner)return;
    const next=reducer(current.current,action);if(next===current.current)return;current.current=next;setState(next);void persist(next).catch(()=>{});
  },[owner,persist]);
  const retrySave=useCallback(()=>{void persist(current.current).catch(()=>{});},[persist]);
  const replaceState=useCallback((data:State)=>{if(activeOwner.current!==owner)return;const next=restoreState(JSON.stringify(data));current.current=next;setState(next);setRestoreEpoch(n=>n+1);void persist(next).catch(()=>{});},[owner,persist]);
  const installCloud=useCallback(async(remote:State,cloudRevision:number)=>{
    if(!owner||activeOwner.current!==owner)throw new Error('OWNER_CHANGED');
    const next=applyCloud(current.current,restoreState(JSON.stringify(remote)));current.current=next;setState(next);setRestoreEpoch(n=>n+1);
    await persist(next,p=>stageProfile({...p,revision:cloudRevision,synced:cloudDocument(remote),lastSync:new Date().toISOString(),archives:[...p.archives,{at:new Date().toISOString(),reason:'before-cloud-restore',state:p.state}]},next));
  },[owner,persist]);
  const importGuest=useCallback(async()=>{
    if(!owner)throw new Error('AUTH_REQUIRED');await queue.current;const guest=await repository.load(),profile=await profiles.get(owner);if(activeOwner.current!==owner)throw new Error('OWNER_CHANGED');
    const receipt=JSON.stringify(guest);if(profile.guestReceipt===receipt)return false;
    const next=mergeGuest(current.current,guest);current.current=next;setState(next);setRestoreEpoch(n=>n+1);
    await persist(next,p=>stageProfile({...p,guestReceipt:receipt,archives:[...p.archives,{at:new Date().toISOString(),reason:'account-before-guest-import',state:p.state},{at:new Date().toISOString(),reason:'guest-before-import',state:guest}]},next));return true;
  },[owner,persist]);
  const rtl=state.locale==='ar',dark=state.theme==='dark'||(state.theme==='system'&&scheme==='dark'),colors=dark?palette.dark:palette.light;
  const t=useCallback((ar:string,en:string)=>rtl?ar:en,[rtl]);
  if(!auth.ready||!ready||displayedOwner!==owner)return <View style={{flex:1,backgroundColor:loadError?colors.background:'#080E13',justifyContent:'center',alignItems:'center',padding:24,gap:20}}>{loadError?<><Text style={{color:colors.text,textAlign:'center'}}>تعذّر فتح بياناتك المحفوظة. لم يتم حذفها.{'\n'}Saved data could not be opened. It has not been deleted.</Text><Pressable accessibilityRole="button" onPress={hydrate}><Text style={{color:colors.primary,padding:16}}>إعادة المحاولة / Retry</Text></Pressable></>:<View/>}</View>;
  return <AppContext.Provider value={{state,dispatch,colors,rtl,dark,t,saving,saveError,retrySave,replaceState,restoreEpoch,readerImmersive,setReaderImmersive,owner,installCloud,importGuest}}>{children}</AppContext.Provider>;
}
