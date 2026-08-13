import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {AppState} from 'react-native';
import {cloudDocument,syncProfile,stageProfile,type Profile,type SyncResult} from '../core/cloud';
import {cloudTransport} from '../core/cloud-transport';
import {cloudConfig} from '../services/cloud-client';
import {profiles} from '../services/profile-repository';
import {useAuth} from './AuthContext';
import {useApp} from './AppContext';
import {SyncContext,type SyncValue} from './SyncContext';
export function SyncProvider({children}:{children:React.ReactNode}){
  const {owner,state,saving,installCloud}=useApp(),{session}=useAuth();
  const [profile,setProfile]=useState<Profile|null>(null),[result,setResult]=useState<SyncResult|null>(null),[status,setStatus]=useState<SyncValue['status']>('local');
  const active=useRef<AbortController|null>(null),running=useRef(false);
  const document=useMemo(()=>cloudDocument(state),[state]);
  const refresh=useCallback(async()=>{if(owner)setProfile(await profiles.get(owner));},[owner]);
  useEffect(()=>{let current=true;if(owner)void profiles.get(owner).then(p=>{if(current)setProfile(p);});return()=>{current=false;};},[owner]);
  const run=useCallback(async()=>{
    if(!owner||running.current)return;
    running.current=true;const controller=new AbortController();active.current=controller;
    try{
      const p=await profiles.get(owner);setProfile(p);if(!p.enabled){setStatus('local');return;}
      if(!session||session.user.id!==owner){setStatus('signin');return;}setStatus('syncing');
      const outcome=await syncProfile(profiles,owner,cloudTransport(cloudConfig,{id:owner,token:session.access_token},controller.signal));
      if(controller.signal.aborted)return;
      setResult(outcome);setStatus(outcome.kind==='conflict'?'conflict':outcome.kind==='remote'?'remote':outcome.kind==='disabled'?'local':outcome.kind==='queued'?'offline':'synced');
    }catch(e){if(!controller.signal.aborted)setStatus(e instanceof Error&&e.message==='AUTH_REQUIRED'?'signin':e instanceof Error&&['INVALID_REMOTE','INVALID_STORAGE','INVALID_PROFILE'].includes(e.message)?'error':'offline');}
    finally{running.current=false;if(!controller.signal.aborted)setProfile(await profiles.get(owner));}
  },[owner,session]);
  useEffect(()=>{if(saving||!owner)return;const timer=setTimeout(()=>void run(),1800);return()=>clearTimeout(timer);},[document,saving,owner,profile?.enabled,run]);
  useEffect(()=>{const timer=setInterval(()=>{if(AppState.currentState==='active')void run();},60000);const sub=AppState.addEventListener('change',s=>{if(s==='active')void run();});return()=>{clearInterval(timer);sub.remove();active.current?.abort();};},[run]);
  const enable=async(enabled:boolean)=>{if(!owner)return;active.current?.abort();const next=await profiles.update(owner,p=>enabled?stageProfile({...p,enabled},p.state):{...p,enabled});setProfile(next);setResult(null);setStatus(enabled?'offline':'local');};
  const resolveLocal=async()=>{
    if(!owner||!result||!('remote' in result))return;
    const remote=result.remote;await profiles.update(owner,p=>stageProfile({...p,revision:remote.revision,synced:cloudDocument(remote.payload),archives:[...p.archives,{at:new Date().toISOString(),reason:'cloud-before-keep-local',state:remote.payload}]},p.state));setResult(null);await run();
  };
  const resolveRemote=async()=>{if(!result||!('remote' in result))return;active.current?.abort();await installCloud(result.remote.payload,result.remote.revision);setResult(null);setStatus('synced');await refresh();};
  return <SyncContext.Provider value={{profile,result,status,run,enable,resolveLocal,resolveRemote,refresh}}>{children}</SyncContext.Provider>;
}
