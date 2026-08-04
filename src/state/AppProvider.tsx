import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, useColorScheme } from 'react-native';
import { initialState, reducer,restoreState, type Action, type State } from '../core/model';
import * as repository from '../storage/repository';
import { palette } from '../ui/theme';
import {AppContext} from './AppContext';
export function AppProvider({children}: {children: React.ReactNode}) {
  const [state,setState] = useState(initialState);
  const current = useRef(state);
  const [ready,setReady] = useState(false);
  const [loadError,setLoadError] = useState(false);
  const [saveError,setSaveError] = useState(false);
  const [saving,setSaving] = useState(false);
  const [restoreEpoch,setRestoreEpoch] = useState(0);
  const queue = useRef(Promise.resolve());
  const revision = useRef(0);
  const scheme = useColorScheme();
  const hydrate = useCallback(() => {
    repository.load().then(data => {current.current=data;setState(data);setReady(true);}).catch(() => setLoadError(true));
  },[]);
  useEffect(hydrate,[hydrate]);
  const persist = useCallback((next: State) => {
    const rev = ++revision.current;
    setSaving(true);
    queue.current = queue.current.catch(() => {}).then(() => repository.save(next)).then(() => {
      if (rev === revision.current) {setSaveError(false);setSaving(false);}
    }).catch(() => {if(rev === revision.current){setSaveError(true);setSaving(false);}});
  },[]);
  const dispatch = useCallback((action:Action) => {
    const next = reducer(current.current,action);
    if(next === current.current) return;
    current.current=next;setState(next);persist(next);
  },[persist]);
  const retrySave = useCallback(() => persist(current.current),[persist]);
  const replaceState=useCallback((data:State)=>{const next=restoreState(JSON.stringify(data));current.current=next;setState(next);setRestoreEpoch(value=>value+1);persist(next);},[persist]);
  const rtl = state.locale === 'ar';
  const dark = state.theme === 'dark' || (state.theme === 'system' && scheme === 'dark');
  const colors = dark ? palette.dark : palette.light;
  const t = useCallback((ar:string,en:string) => rtl ? ar : en,[rtl]);
  if (!ready) return <View style={{flex:1,backgroundColor:colors.background,justifyContent:'center',alignItems:'center',padding:24,gap:20}}>
    {loadError ? <><Text style={{color:colors.text,textAlign:'center'}}>تعذّر فتح بياناتك المحفوظة. لم يتم حذفها.{ '\n' }Saved data could not be opened. It has not been deleted.</Text><Pressable accessibilityRole="button" onPress={()=>{setLoadError(false);hydrate();}}><Text style={{color:colors.primary,padding:16}}>إعادة المحاولة / Retry</Text></Pressable></> : <ActivityIndicator color={colors.primary} />}
  </View>;
  return <AppContext.Provider value={{state,dispatch,colors,rtl,dark,t,saving,saveError,retrySave,replaceState,restoreEpoch}}>{children}</AppContext.Provider>;
}
