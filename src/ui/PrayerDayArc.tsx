import React,{useMemo,useState} from 'react';
import {View} from 'react-native';
import type {PrayerDay} from '../core/adhan';
import {displayPrayerTime,prayerArcPoint,prayerNames,prayerTimeline,remainingTime} from '../core/prayer-display';
import {useApp} from '../state/AppContext';
import {Card,Row,Txt} from './components';
import {PrayerIllustration} from './PrayerIllustration';

export function PrayerDayArc({day,following,now,isToday}:{day:PrayerDay;following?:PrayerDay;now:number;isToday:boolean}){
  const {colors,state,t}=useApp(),locale=state.locale,[width,setWidth]=useState(280);
  const timeline=prayerTimeline(day,now,following),height=Math.min(125,width*.43),inRange=isToday&&now>=timeline.start&&now<=timeline.end;
  const segments=useMemo(()=>Array.from({length:64},(_,i)=>{const a=prayerArcPoint(i/64,width,height),b=prayerArcPoint((i+1)/64,width,height);return {x:a.x,y:a.y,length:Math.hypot(b.x-a.x,b.y-a.y),angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};}),[width,height]);
  const marker=prayerArcPoint(timeline.progress,width,height),next=timeline.next;
  return <Card testID="prayer-day-arc" style={{padding:18,gap:16,overflow:'hidden'}}>
    <Row style={{justifyContent:'space-between',flexWrap:'nowrap',alignItems:'flex-start'}}>
      <View style={{flex:1}}><Txt muted size={11}>{t('الوقت الحالي · القاهرة','Current time · Cairo')}</Txt><Txt bold size={22} style={{fontVariant:['tabular-nums']}}>{new Intl.DateTimeFormat(locale,{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'Africa/Cairo'}).format(now)}</Txt></View>
      {next?<View style={{backgroundColor:colors.primary,borderRadius:16,paddingHorizontal:14,paddingVertical:8,minWidth:105,alignItems:'center'}}><Txt size={10} style={{color:colors.onPrimary}}>{t('الصلاة القادمة','Next prayer')}</Txt><Txt bold size={18} style={{color:colors.onPrimary}}>{t(...prayerNames[next.key])}</Txt><Txt size={13} style={{color:colors.onPrimary,writingDirection:'ltr',fontVariant:['tabular-nums']}}>{remainingTime(next.at-now)}</Txt></View>:<Txt muted size={12}>{t('اكتملت مواعيد اليوم','Today’s times have passed')}</Txt>}
    </Row>
    <View onLayout={event=>setWidth(Math.max(120,event.nativeEvent.layout.width-24))} style={{marginTop:12,paddingHorizontal:12,height:height+58,direction:'ltr'}} accessible accessibilityLabel={t(`تقدّم اليوم من الفجر إلى العشاء ${Math.round(timeline.progress*100)} بالمائة`,`Day progress from Fajr to Isha ${Math.round(timeline.progress*100)} percent`)}>
      <View style={{position:'relative',width,height:height+40,marginTop:12}}>
        {segments.map((s,i)=><View key={i} style={{position:'absolute',left:s.x,top:s.y,width:s.length+1,height:3,borderRadius:3,backgroundColor:isToday&&i/64<timeline.progress?colors.primary:colors.border,transformOrigin:'left center',transform:[{rotate:`${s.angle}deg`}]}}/>)}
        <View style={{position:'absolute',left:0,right:0,top:height+1,height:1,backgroundColor:colors.border}}/>
        {timeline.entries.filter(e=>e.key!=='sunrise').map(e=>{const p=prayerArcPoint((e.at-timeline.start)/(timeline.end-timeline.start),width,height),past=isToday&&e.at<=now;return <View key={e.key} style={{position:'absolute',left:p.x-24,top:p.y-27,width:48,alignItems:'center'}}><Txt size={9} style={{color:past?colors.muted:colors.text}}>{t(...prayerNames[e.key])}</Txt><View style={{width:8,height:8,borderRadius:5,backgroundColor:past?colors.muted:colors.accent,borderWidth:2,borderColor:colors.surface}}/></View>;})}
        {inRange?<View style={{position:'absolute',left:marker.x-20,top:marker.y-19}}><PrayerIllustration prayer={now<timeline.entries[4].at?'sunrise':'isha'} size={38}/></View>:null}
        <View style={{position:'absolute',left:32,right:32,top:height*.63,alignItems:'center'}}><Txt bold size={19} style={{color:colors.primary}}>{Math.round(timeline.progress*100)}%</Txt><Txt muted size={9}>{t('من الفجر إلى العشاء','from Fajr to Isha')}</Txt></View>
        <View style={{position:'absolute',top:height+10,left:0}}><Txt size={10} muted>{displayPrayerTime(day.times.fajr,locale)}</Txt></View><View style={{position:'absolute',top:height+10,right:0}}><Txt size={10} muted>{displayPrayerTime(day.times.isha,locale)}</Txt></View>
      </View>
    </View>
    <Txt size={10} muted>{t('القوس يوضّح الوقت بين الفجر والعشاء، وليس مسار الشمس الفلكي.','The arc shows time from Fajr to Isha, not the astronomical path of the sun.')}</Txt>
  </Card>;
}
