import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useApp} from './AppContext';
import {configureAdhan} from '../services/adhan-native';
export function AdhanCoordinator(){
  const {state}=useApp();const {city,enabled,reminder}=state.adhan;const locale=state.locale;
  useEffect(()=>{
    const update=()=>{void configureAdhan({city,enabled,reminder},locale).catch(()=>{/* The Adhan page exposes persisted native error/status. */});};
    update();const subscription=AppState.addEventListener('change',value=>{if(value==='active')update();});
    return()=>subscription.remove();
  },[city,enabled,reminder,locale]);
  return null;
}
