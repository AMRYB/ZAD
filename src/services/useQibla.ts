import {useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Platform} from 'react-native';
import {useFocusEffect} from 'expo-router';
import * as Location from 'expo-location';
import {degrees} from '../core/qibla';
import {QiblaSession} from '../core/qibla-session';
type Problem='permission'|'disabled'|'location'|'compass'|'unsupported'|null;
async function waitForForeground(){
  if(AppState.currentState==='active')return true;
  return new Promise<boolean>(resolve=>{let settled=false;const finish=(value:boolean)=>{if(settled)return;settled=true;subscription.remove();clearTimeout(timeout);resolve(value);};const subscription=AppState.addEventListener('change',state=>{if(state==='active')finish(true);});const timeout=setTimeout(()=>finish(false),2000);});
}
export function useQibla(){
  const [position,setPosition]=useState<Location.LocationObject|null>(null),[heading,setHeading]=useState<(Location.LocationHeadingObject&{receivedAt:number})|null>(null);
  const [busy,setBusy]=useState(false),[problem,setProblem]=useState<Problem>(null),[active,setActive]=useState(false);
  const [session]=useState(()=>new QiblaSession()),[phase,setPhase]=useState<'idle'|'permission'|'position'|'heading'|'active'>('idle');
  const subscriptions=useRef<Location.LocationSubscription[]>([]),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const stop=useCallback(()=>{session.cancel();subscriptions.current.forEach(s=>s.remove());subscriptions.current=[];if(timer.current)clearTimeout(timer.current);timer.current=null;setActive(false);setBusy(false);setHeading(null);setPosition(null);setPhase('idle');},[session]);
  useFocusEffect(useCallback(()=>()=>stop(),[stop]));
  useEffect(()=>{const listener=AppState.addEventListener('change',state=>{if(state!=='active'&&session.pauseForAppState())stop();});return()=>listener.remove();},[session,stop]);
  const start=async()=>{
    stop();if(Platform.OS==='web'){setProblem('unsupported');return;}const token=session.begin();setBusy(true);setProblem(null);setPhase('permission');
    try{
      let permission=await Location.getForegroundPermissionsAsync();if(!session.valid(token))return;
      if(!permission.granted){session.requestingPermission(token);permission=await Location.requestForegroundPermissionsAsync();if(!session.valid(token))return;const foreground=await waitForForeground();session.permissionComplete(token);if(!session.valid(token))return;if(!foreground){stop();return;}}
      if(!permission.granted){setProblem('permission');setBusy(false);return;}
      if(!await Location.hasServicesEnabledAsync()){if(session.valid(token)){setProblem('disabled');setBusy(false);}return;}
      if(!session.valid(token)||AppState.currentState!=='active'){if(session.valid(token))stop();return;}setPhase('position');
      let watchingHeading=false,lastPublished=0,lastPositionAt=-Infinity;
      const attach=(sub:Location.LocationSubscription)=>{if(!session.valid(token))sub.remove();else subscriptions.current.push(sub);};
      const beginHeading=async()=>{
        try{attach(await Location.watchHeadingAsync(value=>{if(!session.valid(token))return;const now=Date.now();if(now-lastPublished<120)return;lastPublished=now;
          setHeading({...value,trueHeading:Number.isFinite(value.trueHeading)&&value.trueHeading!==-1?degrees(value.trueHeading):-1,receivedAt:now});setBusy(false);setProblem(null);
          setPhase('active');if(timer.current)clearTimeout(timer.current);timer.current=null;
        },()=>{if(session.valid(token)){stop();setProblem('compass');}}));}catch{if(session.valid(token)){stop();setProblem('compass');}}
      };
      timer.current=setTimeout(()=>{if(session.valid(token)){stop();setProblem(watchingHeading?'compass':'location');}},45000);
      const acceptPosition=(value:Location.LocationObject)=>{
        if(!session.valid(token))return;
        if(!Number.isFinite(value.coords.latitude)||!Number.isFinite(value.coords.longitude)||Math.abs(value.coords.latitude)>90||Math.abs(value.coords.longitude)>180||!Number.isFinite(value.timestamp)){stop();setProblem('location');return;}
        if(value.timestamp<lastPositionAt)return;lastPositionAt=value.timestamp;
        setPosition(value);setActive(true);
        if(!watchingHeading){watchingHeading=true;setPhase('heading');void beginHeading();}
      };
      void Location.getLastKnownPositionAsync({maxAge:60000,requiredAccuracy:100}).then(value=>{if(value)acceptPosition(value);}).catch(()=>{});
      attach(await Location.watchPositionAsync({accuracy:Location.Accuracy.High,timeInterval:10000,distanceInterval:0,mayShowUserSettingsDialog:false},acceptPosition,()=>{if(session.valid(token)){stop();setProblem('location');}}));
    }catch{if(session.valid(token)){stop();setProblem('location');}}finally{session.permissionComplete(token);}
  };
  return {position,heading,busy,problem,active,phase,start,stop};
}
