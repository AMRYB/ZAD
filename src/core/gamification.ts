import {dateInZone,dayDifference,parseDate} from './calendar.ts';
import {sectionEntries,entrySession} from './adhkar.ts';
import type {Action,State} from './model.ts';

// Personal, device-local participation only. Never submit this ledger as trusted server XP.
export const DAILY_XP_CAP=100;
export const xpRules=[
  {kind:'checkin',points:5,cap:5,ar:'أول تسجيل لليوم',en:'First daily check-in',detailAr:'5 نقاط مرة في اليوم عند تسجيل حالة صلاة أو صيام، أيًا كانت الحالة.',detailEn:'5 XP once a day for recording any prayer or fasting status.'},
  {kind:'reading',points:10,cap:30,ar:'تسجيل صفحة في خطة القراءة',en:'Reading-plan page',detailAr:'10 نقاط لكل صفحة جديدة في الخطة؛ حتى 30 يوميًا.',detailEn:'10 per new page in a plan; up to 30 a day.'},
  {kind:'habit',points:5,cap:15,ar:'متابعة عادة',en:'Habit check-in',detailAr:'5 نقاط لكل عادة مسجلة؛ حتى 15 يوميًا.',detailEn:'5 per recorded habit; up to 15 a day.'},
  {kind:'goal',points:10,cap:20,ar:'إكمال هدف شخصي',en:'Complete a personal goal',detailAr:'10 نقاط لكل هدف؛ حتى 20 يوميًا.',detailEn:'10 per completed goal; up to 20 a day.'},
  {kind:'tasbih',points:10,cap:10,ar:'جلسة السبحة',en:'Tasbih session',detailAr:'10 نقاط مرة يوميًا عند بلوغ 33 ضغطة، مهما كان هدف العدّ.',detailEn:'10 XP once a day at 33 counts, regardless of the counter target.'},
  {kind:'adhkar',points:10,cap:20,ar:'إكمال قسم أذكار',en:'Complete an adhkar section',detailAr:'10 نقاط لكل قسم كامل؛ حتى 20 يوميًا. بعد الصلاة قسم واحد يوميًا.',detailEn:'10 per complete section; up to 20 a day. After-prayer adhkar counts as one section per day.'},
  {kind:'deed',points:5,cap:15,ar:'تسجيل عمل تختاره',en:'Good-deed check-in',detailAr:'5 نقاط لكل اختيار مسجل؛ حتى 15 يوميًا.',detailEn:'5 per recorded choice; up to 15 a day.'},
] as const;
export type XpKind=typeof xpRules[number]['kind'];
export interface XpEvent {kind:XpKind;source:string;date:string;points:number;active:boolean}
export interface GamificationState {ruleVersion:1;events:XpEvent[]}
export const initialGamification=():GamificationState=>({ruleVersion:1,events:[]});
const key=(event:Pick<XpEvent,'kind'|'source'>)=>JSON.stringify([event.kind,event.source]);
function available(events:XpEvent[],kind:XpKind,date:string){
  const rule=xpRules.find(r=>r.kind===kind)!;
  // Reserve the original allocation even after undo, so toggling cannot recycle the cap.
  let day=0,category=0;
  for(const event of events)if(event.date===date){day+=event.points;if(event.kind===kind)category+=event.points;}
  return Math.max(0,Math.min(rule.points,DAILY_XP_CAP-day,rule.cap-category));
}
function checkin(s:State,date:string){const d=s.days[date];return !!d&&(d.fast!=='unlogged'||Object.values(d.prayers).some(p=>p!=='unlogged'));}
function sectionComplete(s:State,date:string,category:Parameters<typeof sectionEntries>[0]){
  const prayers=category==='prayer'?['general','fajr','dhuhr','asr','maghrib','isha']:['general'];
  return prayers.some(prayer=>sectionEntries(category,prayer).every(e=>(s.devotion.adhkar.counts[entrySession(date,category,e,prayer)]?.[e.id]??0)>=e.repeat));
}
/** Called in the same reducer transaction as the source activity, never in a render/effect. */
export function reconcileParticipation(before:State,after:State,action:Action,today=dateInZone()):GamificationState{
  const original=before.gamification;let events=original.events;
  const set=(kind:XpKind,source:string,date:string,was:boolean,active:boolean)=>{
    if(source.length>512)return;
    const index=events.findIndex(e=>e.kind===kind&&e.source===source);
    if(index>=0){if(events[index].active!==active)events=events.map((e,i)=>i===index?{...e,active}:e);return;}
    // No retroactive rewards, including when old records are edited. No award on a no-op.
    if(!active||was||date!==today)return;
    events=[...events,{kind,source,date,points:available(events,kind,date),active:true}];
  };
  switch(action.type){
    case 'prayer':case 'fast':set('checkin',action.date,action.date,checkin(before,action.date),checkin(after,action.date));break;
    case 'planPage':{
      const b=before.plans.find(p=>p.id===action.id),a=after.plans.find(p=>p.id===action.id);
      if(b&&a)set('reading',JSON.stringify([action.id,action.page]),today,b.pages.includes(action.page),a.pages.includes(action.page));break;
    }
    case 'planDelete':{const p=before.plans.find(p=>p.id===action.id);for(const page of p?.pages??[])set('reading',JSON.stringify([action.id,page]),today,true,false);break;}
    case 'habitToggle':{const b=before.habits.find(h=>h.id===action.id),a=after.habits.find(h=>h.id===action.id);if(b&&a)set('habit',JSON.stringify([action.id,action.date]),action.date,b.dates.includes(action.date),a.dates.includes(action.date));break;}
    case 'habitDelete':{const h=before.habits.find(h=>h.id===action.id);for(const date of h?.dates??[])set('habit',JSON.stringify([action.id,date]),date,true,false);break;}
    case 'goalStep':case 'goalDelete':{const b=before.goals.find(g=>g.id===action.id),a=after.goals.find(g=>g.id===action.id);if(b)set('goal',action.id,today,b.progress===b.target,!!a&&a.progress===a.target);break;}
    case 'devotion':{
      const a=action.action;
      if(a.type==='tasbihTap')set('tasbih',a.date,a.date,(before.devotion.tasbih.daily[a.date]??0)>=33,(after.devotion.tasbih.daily[a.date]??0)>=33);
      if(a.type==='deedToggle')set('deed',JSON.stringify([a.id,a.date]),a.date,!!before.devotion.deeds.days[a.date]?.includes(a.id),!!after.devotion.deeds.days[a.date]?.includes(a.id));
      if(a.type==='adhkarStep'||a.type==='adhkarReset'){
        const [date,category]=a.session.split(':');
        // A shared daily entry can complete a different section as well.
        for(const c of ['morning','evening','sleep','waking','prayer','varied'] as const){
          if(c===category||a.type==='adhkarStep')set('adhkar',JSON.stringify([date,c]),date,sectionComplete(before,date,c),sectionComplete(after,date,c));
          else if(category==='varied')set('adhkar',JSON.stringify([date,c]),date,sectionComplete(before,date,c),sectionComplete(after,date,c));
        }
      }
      break;
    }
  }
  return events===original.events?original:{...original,events};
}

// Level 1 starts at 0. Advancing from level n costs n * 100 XP.
export function levelProgress(total:number){
  const xp=Math.max(0,Math.floor(total));const level=Math.floor((1+Math.sqrt(1+8*xp/100))/2);
  const floor=50*level*(level-1),next=50*level*(level+1);
  return {level,floor,next,current:xp-floor,required:next-floor,remaining:next-xp};
}
export function xpSummary(s:GamificationState,date:string){
  let total=0,today=0,reserved=0;
  for(const e of s.events){if(e.active){total+=e.points;if(e.date===date)today+=e.points;}if(e.date===date)reserved+=e.points;}
  return {total,today,reserved,...levelProgress(total)};
}
type Metric='actions'|'days'|'streak'|XpKind;
export const badgeDefinitions=[
  {id:'first-step',metric:'actions',target:1,ar:'أول خطوة',en:'First step',detailAr:'أول مشاركة مسجّلة',detailEn:'Record your first participation',icon:'star'},
  {id:'days-3',metric:'days',target:3,ar:'بداية الاستمرار',en:'Finding a rhythm',detailAr:'مشاركة في 3 أيام مختلفة',detailEn:'Participate on 3 different days',icon:'sun'},
  {id:'days-7',metric:'days',target:7,ar:'أسبوع من الخطوات',en:'A week of steps',detailAr:'مشاركة في 7 أيام مختلفة',detailEn:'Participate on 7 different days',icon:'star'},
  {id:'days-30',metric:'days',target:30,ar:'رحلة مستمرة',en:'An ongoing journey',detailAr:'مشاركة في 30 يومًا مختلفًا',detailEn:'Participate on 30 different days',icon:'moon'},
  {id:'streak-3',metric:'streak',target:3,ar:'إيقاع متصل',en:'A steady rhythm',detailAr:'مشاركة في 3 أيام متتالية',detailEn:'Participate on 3 consecutive days',icon:'circle-nodes'},
  {id:'reading-1',metric:'reading',target:1,ar:'صفحة جديدة',en:'A new page',detailAr:'تسجيل أول صفحة في خطة',detailEn:'Record a first reading-plan page',icon:'book-open'},
  {id:'reading-10',metric:'reading',target:10,ar:'رفيق القراءة',en:'Reading companion',detailAr:'تسجيل 10 صفحات في الخطط',detailEn:'Record 10 reading-plan pages',icon:'book-open'},
  {id:'habit-7',metric:'habit',target:7,ar:'عادة تنمو',en:'A growing habit',detailAr:'7 تسجيلات للعادات',detailEn:'Record 7 habit check-ins',icon:'circle-check'},
  {id:'goal-1',metric:'goal',target:1,ar:'هدف اكتمل',en:'A goal reached',detailAr:'إكمال أول هدف شخصي',detailEn:'Complete your first personal goal',icon:'check'},
  {id:'tasbih-3',metric:'tasbih',target:3,ar:'لحظات هدوء',en:'Quiet moments',detailAr:'جلسة سبحة في 3 أيام مختلفة',detailEn:'A Tasbih session on 3 different days',icon:'circle-nodes'},
  {id:'adhkar-3',metric:'adhkar',target:3,ar:'رفيق الورد',en:'Remembrance companion',detailAr:'إكمال 3 أقسام أذكار مسجلة',detailEn:'Record 3 complete adhkar sections',icon:'sun'},
  {id:'deed-5',metric:'deed',target:5,ar:'خطوات تختارها',en:'Steps you choose',detailAr:'5 تسجيلات لأعمال تختارها',detailEn:'Record 5 good-deed check-ins',icon:'heart'},
] as const satisfies readonly {id:string;metric:Metric;target:number;ar:string;en:string;detailAr:string;detailEn:string;icon:string}[];
export function achievementProgress(s:GamificationState){
  const metrics:Record<Metric,number>={actions:0,days:0,streak:0,checkin:0,reading:0,habit:0,goal:0,tasbih:0,adhkar:0,deed:0};
  const earned=new Map<string,string>();const days=new Set<string>();let previous='',run=0;
  for(const e of s.events.filter(e=>e.active).sort((a,b)=>a.date.localeCompare(b.date))){
    metrics.actions++;metrics[e.kind]++;
    if(!days.has(e.date)){days.add(e.date);metrics.days=days.size;run=previous&&dayDifference(previous,e.date)===1?run+1:1;metrics.streak=Math.max(metrics.streak,run);previous=e.date;}
    for(const b of badgeDefinitions)if(metrics[b.metric]>=b.target&&!earned.has(b.id))earned.set(b.id,e.date);
  }
  return badgeDefinitions.map(b=>({...b,current:Math.min(b.target,metrics[b.metric]),earnedOn:earned.get(b.id)??null}));
}
export function validateGamification(value:unknown):value is GamificationState{
  try{
    if(!value||typeof value!=='object'||!('ruleVersion' in value)||value.ruleVersion!==1||!('events' in value)||!Array.isArray(value.events))return false;
    const seen=new Set<string>(),daily=new Map<string,number>(),category=new Map<string,number>();
    for(const e of value.events){
      if(!e||!xpRules.some(r=>r.kind===e.kind)||typeof e.source!=='string'||!e.source.length||e.source.length>512||typeof e.date!=='string'||typeof e.active!=='boolean'||!Number.isInteger(e.points))return false;
      parseDate(e.date);const id=key(e);if(seen.has(id))return false;seen.add(id);
      const rule=xpRules.find(r=>r.kind===e.kind)!;const cat=JSON.stringify([e.date,e.kind]);
      const expected=Math.max(0,Math.min(rule.points,DAILY_XP_CAP-(daily.get(e.date)??0),rule.cap-(category.get(cat)??0)));
      if(e.points!==expected)return false;
      daily.set(e.date,(daily.get(e.date)??0)+e.points);category.set(cat,(category.get(cat)??0)+e.points);
    }
    return true;
  }catch{return false;}
}
