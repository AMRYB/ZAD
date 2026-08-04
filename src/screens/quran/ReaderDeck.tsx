import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,PanResponder,Platform,Pressable,View,type GestureResponderEvent,type PanResponderGestureState,type ViewStyle} from 'react-native';
import {useApp} from '../../state/AppContext';
import {sidewaysCardDrag} from '../../core/reader-gestures';

const touchSurface:ViewStyle&{touchAction?:'none';userSelect?:'none'}=Platform.OS==='web'?{touchAction:'none',userSelect:'none'}:{};

// Both faces stay mounted: gestures only change their visual order, never the audio lifecycle.
export function ReaderDeck({player,navigation}:{player:React.ReactNode;navigation:React.ReactNode}){
  const {colors,t}=useApp();
  const [face,setFace]=useState<0|1>(0),[promoted,setPromoted]=useState(false),[direction,setDirection]=useState(1);
  const [width,setWidth]=useState(360),[heights,setHeights]=useState([118,118]);
  const [progress]=useState(()=>new Animated.Value(0));
  const active=useRef<0|1>(0),busy=useRef(false),reduceMotion=useRef(false),singleTouch=useRef(true);
  useEffect(()=>{
    let mounted=true;
    const layer=progress.addListener(({value})=>setPromoted(value>=.5));
    void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)reduceMotion.current=value;});
    const listener=AccessibilityInfo.addEventListener('reduceMotionChanged',value=>{reduceMotion.current=value;});
    return()=>{mounted=false;listener.remove();progress.removeListener(layer);progress.stopAnimation();};
  },[progress]);
  const settle=useCallback((swap:boolean)=>{
    if(busy.current)return;
    busy.current=true;
    Animated.timing(progress,{toValue:swap?1:0,duration:reduceMotion.current?0:swap?340:180,useNativeDriver:Platform.OS!=='web'}).start(({finished})=>{
      if(finished&&swap){active.current=active.current===0?1:0;setFace(active.current);setPromoted(false);progress.setValue(0);}
      busy.current=false;
    });
  },[progress]);
  const capture=useCallback((_:GestureResponderEvent,g:PanResponderGestureState)=>!busy.current&&g.numberActiveTouches===1&&sidewaysCardDrag(g.dx,g.dy),[]);
  const grant=useCallback((_:GestureResponderEvent,g:PanResponderGestureState)=>{if(busy.current)return;singleTouch.current=g.numberActiveTouches===1;setDirection(g.dx<0?-1:1);},[]);
  const drag=useCallback((_:GestureResponderEvent,g:PanResponderGestureState)=>{
    if(busy.current)return;
    if(g.numberActiveTouches!==1)singleTouch.current=false;
    setDirection(g.dx<0?-1:1);
    progress.setValue(Math.min(.44,Math.abs(g.dx)/width*.85));
  },[progress,width]);
  // PanResponder registers these callbacks; it does not call them during render.
  // eslint-disable-next-line react-hooks/refs
  const responder=useMemo(()=>PanResponder.create({
    onStartShouldSetPanResponderCapture:()=>busy.current,
    onMoveShouldSetPanResponderCapture:capture,onPanResponderGrant:grant,onPanResponderMove:drag,
    onPanResponderStart:(_,g)=>{if(g.numberActiveTouches>1)singleTouch.current=false;},
    onPanResponderRelease:(_,g)=>settle(singleTouch.current&&sidewaysCardDrag(g.dx,g.dy,true)),
    onPanResponderTerminate:()=>settle(false),onPanResponderTerminationRequest:()=>false,
  }),[capture,grant,drag,settle]);
  const height=Math.max(...heights)+20,front=promoted?(face===0?1:0):face;
  return <View testID="reader-deck" onLayout={event=>setWidth(event.nativeEvent.layout.width)} style={[{height:height+12,width:'94%',maxWidth:620,alignSelf:'center',marginBottom:8,marginTop:12,direction:'ltr'},touchSurface]} {...responder.panHandlers}>
    {[player,navigation].map((content,index)=>{
      const outgoing=index===face,isFront=front===index;
      return <Animated.View key={index} testID={index===0?'reader-player-card':'reader-navigation-card'} pointerEvents={isFront?'auto':'none'} aria-hidden={!isFront} accessibilityElementsHidden={!isFront} importantForAccessibility={isFront?'auto':'no-hide-descendants'}
        style={{position:'absolute',left:0,right:0,top:0,height,borderRadius:26,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,paddingHorizontal:12,paddingVertical:10,shadowColor:'#102F24',shadowOffset:{width:0,height:4},shadowOpacity:.09,shadowRadius:12,elevation:isFront?3:1,zIndex:isFront?2:0,
          opacity:progress.interpolate({inputRange:[0,.44,.6,1],outputRange:outgoing?[1,0,0,1]:[.72,1,1,1]}),
          transform:[{perspective:900},
            {translateX:progress.interpolate({inputRange:[0,.44,.6,1],outputRange:outgoing?[0,direction*width*.72,direction*width*.3,0]:[0,0,0,0]})},
            {translateY:progress.interpolate({inputRange:[0,.5,1],outputRange:outgoing?[0,0,10]:[10,0,0]})},
            {scale:progress.interpolate({inputRange:[0,.5,1],outputRange:outgoing?[1,.96,.95]:[.95,1.015,1]})},
            {rotateZ:progress.interpolate({inputRange:[0,.44,.6,1],outputRange:outgoing?['0deg',direction*7+'deg',direction*3+'deg','0deg']:['0deg','0deg','0deg','0deg']})}]}}>
        <View onLayout={event=>{const h=event.nativeEvent.layout.height;setHeights(current=>Math.abs(current[index]-h)<1?current:current.map((value,i)=>i===index?h:value));}}>{content}</View>
      </Animated.View>;
    })}
    <Pressable accessibilityRole="button" accessibilityLabel={face===0?t('إظهار التنقل بين الصفحات والآيات','Show page and ayah navigation'):t('إظهار أدوات التلاوة','Show recitation controls')} accessibilityHint={t('اسحب الكارت يمينًا أو يسارًا للتبديل','Swipe the card sideways to switch')} onPress={()=>settle(true)} style={{position:'absolute',bottom:0,left:24,right:24,height:12,zIndex:3}}/>
  </View>;
}
