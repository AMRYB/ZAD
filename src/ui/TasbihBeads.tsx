import React,{memo,useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Easing,PanResponder,Platform,Pressable,View,useWindowDimensions,type ViewStyle} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useApp} from '../state/AppContext';
import {Txt} from './components';

/** A stone bead rendered locally; no remote image or generated-image dependency. */
const OnyxBead=memo(function OnyxBead({size,dark}:{size:number;dark:boolean}){
  return <View style={{width:size,height:size,borderRadius:size/2,shadowColor:'#000000',shadowOpacity:dark?.45:.24,shadowRadius:3,shadowOffset:{width:0,height:4},elevation:4}}>
    <LinearGradient colors={['#686A5A','#35372E','#131A16','#35372D']} locations={[0,.28,.68,1]} start={{x:.14,y:.05}} end={{x:.92,y:.95}} style={{flex:1,borderRadius:size/2,borderWidth:1,borderColor:'#656752',overflow:'hidden'}}>
      <View style={{position:'absolute',left:size*.12,top:size*.14,width:size*.63,height:size*.43,borderRadius:size/2,borderTopWidth:1,borderLeftWidth:1,borderColor:'rgba(223,209,158,0.45)',transform:[{rotate:'-26deg'}]}}/>
      <View style={{position:'absolute',left:size*.38,top:size*.2,width:size*.37,height:size*.62,borderRadius:size/2,borderBottomWidth:1,borderRightWidth:1,borderColor:'rgba(176,153,105,0.32)',transform:[{rotate:'38deg'}]}}/>
      <LinearGradient colors={['rgba(255,255,230,0.42)','rgba(255,255,230,0)']} start={{x:.2,y:0}} end={{x:.6,y:1}} style={{position:'absolute',left:size*.18,top:size*.08,width:size*.5,height:size*.34,borderRadius:size/2,transform:[{rotate:'-27deg'}]}}/>
      {[[.3,.53],[.67,.35],[.58,.76],[.17,.65],[.77,.59]].map(([x,y],i)=><View key={i} style={{position:'absolute',left:size*x,top:size*y,width:i%2?1:2,height:1,borderRadius:1,backgroundColor:'rgba(221,199,139,0.48)',transform:[{rotate:'-36deg'}]}}/>)}
      <View style={{position:'absolute',right:1,top:size*.46,width:3,height:4,borderRadius:2,backgroundColor:'#131812'}}/>
    </LinearGradient>
  </View>;
});

export function TasbihBeads({onCount,count,current,target,reduced}:{onCount:()=>void;count:number;current:number;target:number;reduced:boolean}){
  const {colors,dark,t}=useApp(),viewport=useWindowDimensions();
  const size=Math.min(viewport.width,620),bead=Math.max(34,Math.min(48,size/8.6)),spacing=bead*1.11;
  const [travel]=useState(()=>new Animated.Value(0));
  const previous=useRef(count),destination=useRef(0),dragged=useRef(false);
  const cycle=useMemo(()=>Animated.modulo(travel,1),[travel]);
  useEffect(()=>{
    const delta=count-previous.current;previous.current=count;
    if(reduced||Math.abs(delta)!==1){travel.stopAnimation();travel.setValue(0);destination.current=0;return;}
    const to=destination.current+delta;destination.current=to;
    Animated.timing(travel,{toValue:to,duration:210,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start(({finished})=>{
      if(finished&&destination.current===to&&Math.abs(to)>=32){destination.current=0;travel.setValue(0);}
    });
  },[count,reduced,travel]);
  useEffect(()=>()=>travel.stopAnimation(),[travel]);
  // eslint-disable-next-line react-hooks/refs -- PanResponder registers callbacks without invoking them during render.
  const pan=useMemo(()=>PanResponder.create({
    onMoveShouldSetPanResponder:(_,g)=>g.numberActiveTouches===1&&(Math.abs(g.dx)>12&&Math.abs(g.dx)>Math.abs(g.dy)*1.3||g.dy>14&&Math.abs(g.dy)>Math.abs(g.dx)*1.5),
    onPanResponderGrant:()=>{dragged.current=true;},
    onPanResponderRelease:(_,g)=>{if(Math.abs(g.dx)>28&&Math.abs(g.dx)>Math.abs(g.dy)*1.3||g.dy>28&&Math.abs(g.dx)<70)onCount();},
    onPanResponderTerminationRequest:()=>true,
  }),[onCount]);
  const y=(x:number)=>26+34*(1-Math.pow((x-size/2)/(size/2),2));
  const text=count.toLocaleString('en-US'),font=Math.min(76,(size-56)/Math.max(1,text.length*.62));
  const web:ViewStyle&{touchAction?:'none';userSelect?:'none'}=Platform.OS==='web'?{touchAction:'none',userSelect:'none'}:{};
  return <Pressable {...pan.panHandlers} testID="tasbih-count" accessibilityRole="button" accessibilityLabel={t(`سبّح. العدد ${count}. اضغط لإضافة تسبيحة.`,`Count ${count}. Tap to add one remembrance.`)} accessibilityHint={t('اسحب الخرز للجانب أو لأسفل، أو اضغط للعدّ','Slide the beads sideways or down, or tap to count')}
    onPressIn={()=>{dragged.current=false;}} onPress={()=>{if(!dragged.current)onCount();}} style={[{width:size,height:306,alignSelf:'center'},web]}>
    <View accessible={false} pointerEvents="none" style={{position:'absolute',left:0,right:0,top:0,height:112,overflow:'hidden',direction:'ltr'}}>
      {Array.from({length:32},(_,i)=>{const x=size*i/31,next=size*(i+1)/31,dy=y(next)-y(x);return <View key={i} style={{position:'absolute',left:x,top:y(x)+bead/2,width:Math.hypot(next-x,dy)+1,height:2,borderRadius:2,backgroundColor:dark?'#8D856C':'#A6A08B',transformOrigin:'left center',transform:[{rotate:`${Math.atan2(dy,next-x)*180/Math.PI}deg`}]}}/>;})}
      {Array.from({length:Math.ceil(size/spacing)+3},(_,i)=>{
        const positions=[0,.25,.5,.75,1].map(v=>(i-1-v)*spacing);
        return <Animated.View key={i} style={{position:'absolute',left:0,top:0,transform:[{translateX:cycle.interpolate({inputRange:[0,.25,.5,.75,1],outputRange:positions.map(x=>x-bead/2)})},{translateY:cycle.interpolate({inputRange:[0,.25,.5,.75,1],outputRange:positions.map(x=>y(x))})}]}}><OnyxBead size={bead} dark={dark}/></Animated.View>;
      })}
    </View>
    <View pointerEvents="none" style={{position:'absolute',top:116,left:24,right:24,alignItems:'center'}}>
      <Txt size={11} muted style={{textAlign:'center'}}>{t('تسبيحاتك','Your count')}</Txt>
      <Txt testID="tasbih-total" size={font} style={{lineHeight:103,includeFontPadding:false,textAlign:'center',writingDirection:'ltr',fontVariant:['tabular-nums'],color:colors.primary}}>{text}</Txt>
      <View style={{flexDirection:'row',alignItems:'center',gap:7,direction:'ltr'}}><Txt size={13} style={{writingDirection:'ltr',color:colors.primary}}>{current} / {target}</Txt><Txt size={12} muted>{t('في الجولة','this round')}</Txt></View>
      <View accessibilityRole="progressbar" accessibilityLabel={t('هدف الجولة','Round goal')} accessibilityValue={{min:0,max:target,now:current}} aria-valuemin={0} aria-valuemax={target} aria-valuenow={current} style={{height:3,width:80,marginTop:8,borderRadius:3,backgroundColor:colors.border,overflow:'hidden'}}><View style={{height:3,width:`${Math.min(100,current/target*100)}%`,backgroundColor:colors.primary,borderRadius:3}}/></View>
    </View>
    <Txt size={11} muted style={{position:'absolute',bottom:0,left:20,right:20,textAlign:'center'}}>{t('اسحب الخرز… أو اضغط وسبّح','Slide the beads… or tap to count')}</Txt>
  </Pressable>;
}
