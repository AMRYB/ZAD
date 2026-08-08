import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useApp} from './AppContext';
import {personalReminders} from '../core/personal-reminders';
import {adhanNative} from '../services/adhan-native';
export function PersonalReminderCoordinator(){
  const {state}=useApp();const payload=JSON.stringify({locale:state.locale,entries:personalReminders(state.devotion)});
  useEffect(()=>{const configure=()=>{try{adhanNative?.configureReminders(payload);}catch{/* Settings expose missing permissions and the saved opt-in. */}};configure();const sub=AppState.addEventListener('change',value=>{if(value==='active')configure();});return()=>sub.remove();},[payload]);
  return null;
}
