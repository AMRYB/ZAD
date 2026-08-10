import {useEffect,useState} from 'react';
import {dateInZone} from '../core/calendar';

export function useLocalDate(){
  const [date,setDate]=useState(()=>dateInZone());
  useEffect(()=>{const timer=setInterval(()=>setDate(dateInZone()),30000);return ()=>clearInterval(timer);},[]);
  return date;
}
