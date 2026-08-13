import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AppState} from 'react-native';
import * as Linking from 'expo-linking';
import type {Session} from '@supabase/supabase-js';
import {cloudClient} from '../services/cloud-client';
import {authStorage} from '../services/auth-storage';
import {profileOwner} from '../core/cloud';
import {AuthContext} from './AuthContext';
import {authCallbackCode,authCallbackFlow} from '../core/auth-callback';
const OWNER='zad-active-owner-v1';
export function AuthProvider({children}:{children:React.ReactNode}){
  const [session,setSession]=useState<Session|null>(null),[owner,setOwner]=useState<string|null>(null),[ready,setReady]=useState(false),[error,setError]=useState(false);
  const currentOwner=useRef<string|null>(null);
  const authVersion=useRef(0);
  useEffect(()=>{
    let active=true;
    const remember=(s:Session|null)=>{if(!active)return;setSession(s);if(s){currentOwner.current=s.user.id;setOwner(s.user.id);void authStorage.setItem(OWNER,s.user.id).catch(()=>setError(true));}};
    const version=authVersion.current;
    void authStorage.getItem(OWNER).then(id=>{if(active){if(id&&!currentOwner.current){currentOwner.current=profileOwner(id);setOwner(id);}setReady(true);}return cloudClient?.auth.getSession();}).then(result=>{if(result&&version===authVersion.current)remember(result.data.session);}).catch(()=>{if(active){setReady(true);setError(true);}});
    const sub=cloudClient?.auth.onAuthStateChange((_event,s)=>remember(s));
    const refresh=()=>{if(AppState.currentState==='active')cloudClient?.auth.startAutoRefresh();else cloudClient?.auth.stopAutoRefresh();};refresh();
    const app=AppState.addEventListener('change',refresh);
    const handled=new Set<string>();
    const handle=async(url:string|null)=>{if(!url||!cloudClient)return;const code=authCallbackCode(url,typeof window==='undefined'?undefined:window.location?.origin);if(!code||handled.has(code))return;handled.add(code);try{const flowId=authCallbackFlow(url);const result=await cloudClient.auth.exchangeCodeForSession(code,flowId?{flowId}:undefined);if(result.error)throw result.error;if(active)setError(false);}catch{handled.delete(code);if(active)setError(true);}};
    void Linking.getInitialURL().then(handle).catch(()=>{if(active)setError(true);});const link=Linking.addEventListener('url',e=>void handle(e.url));
    return()=>{active=false;sub?.data.subscription.unsubscribe();app.remove();link.remove();cloudClient?.auth.stopAutoRefresh();};
  },[]);
  const signOut=useCallback(async(expectedOwner?:string)=>{if(expectedOwner&&currentOwner.current!==expectedOwner)throw new Error('OWNER_CHANGED');authVersion.current++;const result=await cloudClient?.auth.signOut({scope:'local'});if(result?.error)throw new Error('SIGN_OUT_FAILED');if(expectedOwner&&currentOwner.current!==expectedOwner)return;await authStorage.removeItem(OWNER);currentOwner.current=null;setSession(null);setOwner(null);setError(false);},[]);
  return <AuthContext.Provider value={{ready,session,owner,error,signOut}}>{children}</AuthContext.Provider>;
}
