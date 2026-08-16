import {Platform} from 'react-native';
import {requireOptionalNativeModule} from 'expo';
import type {AdhanPreferences,PrayerMonth} from '../core/adhan';
export interface AdhanStatus {available:boolean;exact:boolean;notifications:boolean;audio:boolean;count:number;until:string;error:string;playing:boolean;muted:boolean;clip:string;enabled:boolean;alarmVolume:number;alarmMuted:boolean}
interface AdhanModule {
  configureBranding(city:string,locale:string):{variant:'day'|'night';known:boolean;boundary:number;exact:boolean};
  brandingStatus():{variant:'day'|'night';known:boolean;boundary:number};
  recitationSleep(minutes:number):{exact:boolean;deadline:number};
  configureWidget(settings:string):void;
  pinWidget():boolean;
  configureReminders(settings:string):{available:boolean;notifications:boolean;count:number};
  reminderStatus():{available:boolean;notifications:boolean;count:number};
  testReminder(kind:'adhkar'|'deeds'):void;
  month(city:string,month:string):Promise<string>;
  configure(settings:string):AdhanStatus;
  refresh():Promise<AdhanStatus>;
  status():AdhanStatus;
  requestNotifications():Promise<{granted:boolean}>;
  openExactSettings():void;
  openNotificationSettings():void;
  openSoundSettings():void;
  preview(date:string,prayer:string):Promise<void>;
  stop():void;
  setMuted(value:boolean):void;
  testAlarm(date:string,prayer:string):Promise<void>;
}
export const adhanNative=Platform.OS==='android'?requireOptionalNativeModule<AdhanModule>('ZadAdhan'):null;
export const unavailableAdhan:AdhanStatus={available:false,exact:false,notifications:false,audio:false,count:0,until:'',error:'',playing:false,muted:false,clip:'',enabled:false,alarmVolume:0,alarmMuted:false};
export async function configureAdhan(settings:AdhanPreferences,locale:string){
  if(!adhanNative)return unavailableAdhan;
  // Apply cancellation synchronously; an older network task cannot re-enable stale settings.
  const status=adhanNative.configure(JSON.stringify({...settings,locale}));
  return settings.enabled?adhanNative.refresh():status;
}
export async function loadPrayerMonth(city:string,month:string,signal?:AbortSignal):Promise<PrayerMonth>{
  if(adhanNative)return JSON.parse(await adhanNative.month(city,month)) as PrayerMonth;
  const response=await fetch(`/api/esa?${new URLSearchParams({city,month})}`,{signal,credentials:'omit'});
  if(!response.ok)throw new Error('ESA_UNAVAILABLE');
  return response.json();
}
