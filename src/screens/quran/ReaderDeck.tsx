import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,PanResponder,Platform,Pressable,View,type GestureResponderEvent,type PanResponderGestureState,type ViewStyle} from 'react-native';
import {useApp} from '../../state/AppContext';
import {upwardCardDrag} from '../../core/reader-gestures';

const touchSurface:ViewStyle&{touchAction?:'none';userSelect?:'none'}=Platform.OS==='web'?{touchAction:'none',userSelect:'none'}:{};

// Both faces remain mounted so changing cards does not interrupt audio or reset pickers.
export function ReaderDeck({player,navigation}:{player:React.ReactNode;navigation:React.ReactNode}){
  const {colors,t}=useApp();
  const [front,setFront]=useState<0|1>(0);
  const [heights,setHeights]=useState([128,128]);
  const [progress]=useState(()=>new Animated.Value(0));
  const active=useRef<0|1>(0),busy=useRef(false),reduceMotion=useRef(false);
  useEffect(()=>{
    let mounted=true;
    const layer=progress.addListener(({value})=>setFront(value>=.5?1:0));
    void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)reduceMotion.current=value;});
    const listener=AccessibilityInfo.addEventListener('reduceMotionChanged',value=>{reduceMotion.current=value;});
    return()=>{mounted=false;listener.remove();progress.removeListener(layer);progress.stopAnimation();};
  },[progress]);
  const settle=useCallback((swap:boolean)=>{
    if(busy.current)return;
    const next=swap?(active.current===0?1:0):active.current;
    busy.current=true;
    Animated.timing(progress,{toValue:next,duration:reduceMotion.current?0:280,useNativeDriver:false}).start(({finished})=>{
      if(finished){active.current=next;setFront(next);}busy.current=false;
    });
  },[progress]);
  const capture=useCallback((_:GestureResponderEvent,g:PanResponderGestureState)=>!busy.current&&g.numberActiveTouches===1&&upwardCardDrag(g.dx,g.dy),[]);
  const drag=useCallback((_:GestureResponderEvent,g:PanResponderGestureState)=>{
    const amount=Math.min(.42,Math.max(0,-g.dy)/140);
    progress.setValue(active.current===0?amount:1-amount);
  },[progress]);
  // PanResponder.create registers callbacks; it does not call them during render.
  // eslint-disable-next-line react-hooks/refs
  const responder=useMemo(()=>PanResponder.create({
    onMoveShouldSetPanResponderCapture:capture,
    onPanResponderMove:drag,
    onPanResponderRelease:(_,g)=>settle(upwardCardDrag(g.dx,g.dy,true)),
    onPanResponderTerminate:()=>settle(false),
    onPanResponderTerminationRequest:()=>false,
  }),[capture,drag,settle]);
  const height=Math.max(...heights)+16;
  return <View testID="reader-deck" style={[{height:height+16,width:'96%',maxWidth:620,alignSelf:'center',marginBottom:6,marginTop:4,direction:'ltr'},touchSurface]} {...responder.panHandlers}>
    {[player,navigation].map((content,index)=>{
      const position=progress.interpolate({inputRange:[0,1],outputRange:index===0?[0,1]:[1,0]});
      const isFront=front===index;
      return <Animated.View key={index} testID={index===0?'reader-player-card':'reader-navigation-card'} pointerEvents={isFront?'auto':'none'} aria-hidden={!isFront} accessibilityElementsHidden={!isFront} importantForAccessibility={isFront?'auto':'no-hide-descendants'}
        style={{position:'absolute',left:0,right:0,top:0,height,borderRadius:26,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,paddingHorizontal:10,paddingVertical:7,shadowColor:'#102F24',shadowOffset:{width:0,height:4},shadowOpacity:.09,shadowRadius:12,elevation:isFront?3:1,
          zIndex:isFront?2:0,
          transform:[{perspective:900},{translateY:position.interpolate({inputRange:[0,.5,1],outputRange:[12,-45,0]})},{scale:position.interpolate({inputRange:[0,.5,1],outputRange:[1,.93,.95]})},{rotateX:position.interpolate({inputRange:[0,.5,1],outputRange:['0deg','-16deg','0deg']})}]}}>
        <View onLayout={event=>{const h=event.nativeEvent.layout.height;setHeights(current=>Math.abs(current[index]-h)<1?current:current.map((value,i)=>i===index?h:value));}}>
          {content}
          <Pressable accessibilityRole="button" accessibilityLabel={index===0?t('إظهار التنقل بين الصفحات والآيات','Show page and ayah navigation'):t('إظهار أدوات التلاوة','Show recitation controls')} accessibilityHint={t('اسحب الكارت لأعلى للتبديل','Swipe the card upward to switch')} onPress={()=>settle(true)} style={{height:24,width:72,alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
            <View style={{width:32,height:4,borderRadius:4,backgroundColor:colors.border}}/>
          </Pressable>
        </View>
      </Animated.View>;
    })}
  </View>;
}
