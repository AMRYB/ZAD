import {useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Platform} from 'react-native';
import {useFocusEffect} from 'expo-router';
import * as Location from 'expo-location';
import {degrees} from '../core/qibla';
type Problem='permission'|'disabled'|'location'|'compass'|'unsupported'|null;
export function useQibla(){
  const [position,setPosition]=useState<Location.LocationObject|null>(null),[heading,setHeading]=useState<(Location.LocationHeadingObject&{receivedAt:number})|null>(null);
  const [busy,setBusy]=useState(false),[problem,setProblem]=useState<Problem>(null),[active,setActive]=useState(false);
  const generation=useRef(0),subscriptions=useRef<Location.LocationSubscription[]>([]),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const stop=useCallback(()=>{generation.current++;subscriptions.current.forEach(s=>s.remove());subscriptions.current=[];if(timer.current)clearTimeout(timer.current);timer.current=null;setActive(false);setBusy(false);setHeading(null);setPosition(null);},[]);
  useFocusEffect(useCallback(()=>()=>stop(),[stop]));
  useEffect(()=>{const listener=AppState.addEventListener('change',state=>{if(state!=='active')stop();});return()=>listener.remove();},[stop]);
  const start=async()=>{
    stop();if(Platform.OS==='web'){setProblem('unsupported');return;}const token=generation.current;setBusy(true);setProblem(null);
    try{
      const permission=await Location.requestForegroundPermissionsAsync();if(token!==generation.current)return;
      if(!permission.granted){setProblem('permission');setBusy(false);return;}
      if(!await Location.hasServicesEnabledAsync()){if(token===generation.current){setProblem('disabled');setBusy(false);}return;}
      if(token!==generation.current)return;
      let watchingHeading=false,lastPublished=0;
      const attach=(sub:Location.LocationSubscription)=>{if(token!==generation.current)sub.remove();else subscriptions.current.push(sub);};
      const beginHeading=async()=>{
        try{attach(await Location.watchHeadingAsync(value=>{if(token!==generation.current)return;const now=Date.now();if(now-lastPublished<120)return;lastPublished=now;
          setHeading({...value,trueHeading:Number.isFinite(value.trueHeading)&&value.trueHeading!==-1?degrees(value.trueHeading):-1,receivedAt:now});setBusy(false);setProblem(null);
          if(timer.current)clearTimeout(timer.current);timer.current=null;
        },()=>{if(token===generation.current){stop();setProblem('compass');}}));}catch{if(token===generation.current){stop();setProblem('compass');}}
      };
      timer.current=setTimeout(()=>{if(token===generation.current){stop();setProblem(watchingHeading?'compass':'location');}},25000);
      attach(await Location.watchPositionAsync({accuracy:Location.Accuracy.High,timeInterval:10000,distanceInterval:0,mayShowUserSettingsDialog:false},value=>{
        if(token!==generation.current)return;
        if(!Number.isFinite(value.coords.latitude)||!Number.isFinite(value.coords.longitude)||Math.abs(value.coords.latitude)>90||Math.abs(value.coords.longitude)>180||!Number.isFinite(value.timestamp)){stop();setProblem('location');return;}
        setPosition(value);setActive(true);
        if(!watchingHeading){watchingHeading=true;void beginHeading();}
      },()=>{if(token===generation.current){stop();setProblem('location');}}));
    }catch{if(token===generation.current){stop();setProblem('location');}}
  };
  return {position,heading,busy,problem,active,start,stop};
}
