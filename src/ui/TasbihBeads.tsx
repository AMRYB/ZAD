import React,{memo,useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Easing,PanResponder,Platform,Pressable,View,useWindowDimensions,type ViewStyle} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useApp} from '../state/AppContext';
import {Txt} from './components';

/** A stone bead rendered locally; no remote image or generated-image dependency. */
const EmeraldBead=memo(function EmeraldBead({size,dark}:{size:number;dark:boolean}){
  return <View style={{width:size,height:size,borderRadius:size/2,shadowColor:'#000000',shadowOpacity:dark?.45:.24,shadowRadius:3,shadowOffset:{width:0,height:4},elevation:4}}>
    <LinearGradient colors={['#75C69A','#23976B','#08583D','#16855C']} locations={[0,.28,.68,1]} start={{x:.14,y:.05}} end={{x:.92,y:.95}} style={{flex:1,borderRadius:size/2,borderWidth:1,borderColor:'#388B65',overflow:'hidden'}}>
      <View style={{position:'absolute',left:size*.12,top:size*.14,width:size*.63,height:size*.43,borderRadius:size/2,borderTopWidth:1,borderLeftWidth:1,borderColor:'rgba(223,209,158,0.45)',transform:[{rotate:'-26deg'}]}}/>
      <View style={{position:'absolute',left:size*.38,top:size*.2,width:size*.37,height:size*.62,borderRadius:size/2,borderBottomWidth:1,borderRightWidth:1,borderColor:'rgba(176,153,105,0.32)',transform:[{rotate:'38deg'}]}}/>
      <LinearGradient colors={['rgba(255,255,230,0.42)','rgba(255,255,230,0)']} start={{x:.2,y:0}} end={{x:.6,y:1}} style={{position:'absolute',left:size*.18,top:size*.08,width:size*.5,height:size*.34,borderRadius:size/2,transform:[{rotate:'-27deg'}]}}/>
      {[[.3,.53],[.67,.35],[.58,.76],[.17,.65],[.77,.59]].map(([x,y],i)=><View key={i} style={{position:'absolute',left:size*x,top:size*y,width:i%2?1:2,height:1,borderRadius:1,backgroundColor:'rgba(221,199,139,0.48)',transform:[{rotate:'-36deg'}]}}/>)}
      <View style={{position:'absolute',right:1,top:size*.46,width:3,height:4,borderRadius:2,backgroundColor:'#06432E'}}/>
    </LinearGradient>
  </View>;
});

export function TasbihBeads({onCount,onImpact,count,current,target,reduced}:{onCount:()=>void;onImpact:()=>void;count:number;current:number;target:number;reduced:boolean}){
  const {colors,dark,t}=useApp(),viewport=useWindowDimensions();
  const size=Math.min(viewport.width,620),bead=Math.max(34,Math.min(48,size/9)),spacing=bead*1.025;
  const gap=Math.min(112,size*.25),left=size/2-(gap+bead)/2,right=size/2+(gap+bead)/2;
  const [travel]=useState(()=>new Animated.Value(0));
  const previous=useRef(count),pending=useRef(0),running=useRef(false),generation=useRef(0),dragged=useRef(false);
  const impact=useRef(onImpact);
  useEffect(()=>{impact.current=onImpact;},[onImpact]);
  useEffect(()=>{
    const delta=count-previous.current;previous.current=count;
    if(reduced||Math.abs(delta)!==1){generation.current++;pending.current=0;running.current=false;travel.stopAnimation();travel.setValue(0);if(reduced&&delta===1)impact.current();return;}
    pending.current+=delta;
    // Finish each transfer before starting another; quick taps never restart a bead mid-gap.
    function advance(){
      if(running.current||!pending.current)return;
      const direction=Math.sign(pending.current),token=generation.current;
      pending.current-=direction;running.current=true;travel.setValue(direction>0?0:1);
      const duration=Math.abs(pending.current)>2?260:520;
      const finish=({finished}:{finished:boolean})=>{
        if(token!==generation.current)return;
        running.current=false;travel.setValue(0);if(finished)advance();
      };
      const animate=(toValue:number,ms:number)=>Animated.timing(travel,{toValue,duration:ms,easing:Easing.linear,useNativeDriver:Platform.OS!=='web'});
      if(direction<0){animate(0,duration).start(finish);return;}
      // .55 is the first contact knot. Play once here, before the bank's rebound.
      animate(.55,duration*.55).start(({finished})=>{
        if(token!==generation.current||!finished)return;
        impact.current();animate(1,duration*.45).start(finish);
      });
    }
    advance();
  },[count,reduced,travel]);
  useEffect(()=>()=>{generation.current++;pending.current=0;travel.stopAnimation();},[travel]);
  // eslint-disable-next-line react-hooks/refs -- PanResponder registers callbacks without invoking them during render.
  const pan=useMemo(()=>PanResponder.create({
    onMoveShouldSetPanResponder:(_,g)=>g.numberActiveTouches===1&&(Math.abs(g.dx)>12&&Math.abs(g.dx)>Math.abs(g.dy)*1.3||g.dy>14&&Math.abs(g.dy)>Math.abs(g.dx)*1.5),
    onPanResponderGrant:()=>{dragged.current=true;},
    onPanResponderRelease:(_,g)=>{if(Math.abs(g.dx)>28&&Math.abs(g.dx)>Math.abs(g.dy)*1.3||g.dy>28&&Math.abs(g.dx)<70)onCount();},
    onPanResponderTerminationRequest:()=>true,
  }),[onCount]);
  // The reference arches upward: low outer banks rise toward the open centre.
  const y=(x:number)=>18+58*Math.pow((x-size/2)/(size/2),2);
  const text=count.toLocaleString('en-US'),font=Math.min(64,(size-56)/Math.max(1,text.length*.62));
  const bankCount=Math.ceil(size/2/spacing)+2;
  const knots=[0,.12,.55,.66,.8,.9,1];
  const leftShift=[0,0,0,spacing*.34,spacing*1.07,spacing*.97,spacing];
  const rightShift=[0,0,spacing,spacing,spacing,spacing,spacing];
  const crossing=[right,right-4,left+spacing,left+spacing*.66,left-spacing*.07,left+spacing*.03,left];
  function animatedBead(key:string,positions:number[],impact=false){
    return <Animated.View key={key} testID={impact?'tasbih-transfer-bead':undefined} style={{position:'absolute',left:0,top:0,transform:[
      {translateX:travel.interpolate({inputRange:knots,outputRange:positions.map(x=>x-bead/2)})},
      {translateY:travel.interpolate({inputRange:knots,outputRange:positions.map(x=>y(x))})},
      {rotate:travel.interpolate({inputRange:knots,outputRange:impact?['0deg','-2deg','-22deg','-28deg','3deg','-1deg','0deg']:knots.map(()=>'0deg')})},
    ]}}><EmeraldBead size={bead} dark={dark}/></Animated.View>;
  }
  const web:ViewStyle&{touchAction?:'none';userSelect?:'none'}=Platform.OS==='web'?{touchAction:'none',userSelect:'none'}:{};
  return <Pressable {...pan.panHandlers} testID="tasbih-count" accessibilityRole="button" accessibilityLabel={t(`سبّح. العدد ${count}. اضغط لإضافة تسبيحة.`,`Count ${count}. Tap to add one remembrance.`)} accessibilityHint={t('اسحب الخرز للجانب أو لأسفل، أو اضغط للعدّ','Slide the beads sideways or down, or tap to count')}
    onPressIn={()=>{dragged.current=false;}} onPress={()=>{if(!dragged.current)onCount();}} style={[{width:size,minHeight:300,flexGrow:1,alignSelf:'center'},web]}>
    <View testID="tasbih-strand" accessible={false} pointerEvents="none" style={{position:'absolute',left:0,right:0,top:0,height:144,overflow:'hidden',direction:'ltr'}}>
      {Array.from({length:32},(_,i)=>{const x=size*i/31,next=size*(i+1)/31,dy=y(next)-y(x);return <View key={i} style={{position:'absolute',left:x,top:y(x)+bead/2,width:Math.hypot(next-x,dy)+1,height:1,borderRadius:1,backgroundColor:dark?'#736E5C':'#CBC8BD',transformOrigin:'left center',transform:[{rotate:`${Math.atan2(dy,next-x)*180/Math.PI}deg`}]}}/>;})}
      {Array.from({length:bankCount},(_,i)=>animatedBead(`left-${i}`,leftShift.map(shift=>left-i*spacing-shift)))}
      {Array.from({length:bankCount},(_,i)=>animatedBead(`right-${i}`,rightShift.map(shift=>right+(i+1)*spacing-shift)))}
      {animatedBead('crossing',crossing,true)}
    </View>
    <View pointerEvents="none" style={{position:'absolute',top:128,bottom:34,left:24,right:24,alignItems:'center',justifyContent:'center'}}>
      <Txt size={11} muted style={{textAlign:'center'}}>{t('تسبيحاتك','Your count')}</Txt>
      <Txt testID="tasbih-total" size={font} style={{lineHeight:103,includeFontPadding:false,textAlign:'center',writingDirection:'ltr',fontVariant:['tabular-nums'],color:colors.primary}}>{text}</Txt>
      <View style={{flexDirection:'row',alignItems:'center',gap:7,direction:'ltr'}}><Txt size={13} style={{writingDirection:'ltr',color:colors.primary}}>{current} / {target}</Txt><Txt size={12} muted>{t('في الجولة','this round')}</Txt></View>
      <View accessibilityRole="progressbar" accessibilityLabel={t('هدف الجولة','Round goal')} accessibilityValue={{min:0,max:target,now:current}} aria-valuemin={0} aria-valuemax={target} aria-valuenow={current} style={{height:3,width:80,marginTop:8,borderRadius:3,backgroundColor:colors.border,overflow:'hidden'}}><View style={{height:3,width:`${Math.min(100,current/target*100)}%`,backgroundColor:colors.primary,borderRadius:3}}/></View>
    </View>
    <Txt size={11} muted style={{position:'absolute',bottom:0,left:20,right:20,textAlign:'center'}}>{t('اسحب الخرز… أو اضغط وسبّح','Slide the beads… or tap to count')}</Txt>
  </Pressable>;
}
