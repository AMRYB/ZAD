import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,Modal,PanResponder,Platform,Pressable,ScrollView,View,useWindowDimensions,type GestureResponderEvent,type PanResponderGestureState,type ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {sheetBounds,sheetDragHeight,sheetReleaseHeight,shouldDragSheet} from '../../core/reader-sheet';
import {useApp} from '../../state/AppContext';
import {Row,Txt} from '../../ui/components';
import {IconButton} from './ReaderControls';

interface SheetProps {visible:boolean;title:string;subtitle?:string;onClose:()=>void;children:React.ReactNode}
const handleTouch:ViewStyle&{touchAction?:'none';userSelect?:'none'}=Platform.OS==='web'?{touchAction:'none',userSelect:'none'}:{};

export function ReaderSheet({visible,...props}:SheetProps){
  return visible?<DraggableReaderSheet {...props}/>:null;
}

function DraggableReaderSheet({title,subtitle,onClose,children}:Omit<SheetProps,'visible'>){
  const {colors,t}=useApp(),insets=useSafeAreaInsets(),viewport=useWindowDimensions();
  const bounds=useMemo(()=>sheetBounds(viewport.height,insets.top),[viewport.height,insets.top]);
  const [height]=useState(()=>new Animated.Value(0));
  const [settledHeight,setSettledHeight]=useState(bounds.initial);
  const live=useRef({height:0,start:0,scroll:0,closing:false,reduced:false,onClose,bounds});
  const scroll=useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(()=>{live.current.onClose=onClose;},[onClose]);
  useEffect(()=>{
    const subscription=height.addListener(({value})=>{live.current.height=value;});
    void AccessibilityInfo.isReduceMotionEnabled().then(value=>{live.current.reduced=value;}).catch(()=>{});
    const preference=AccessibilityInfo.addEventListener('reduceMotionChanged',value=>{live.current.reduced=value;});
    return()=>{height.removeListener(subscription);height.stopAnimation();preference.remove();};
  },[height]);
  const animate=useCallback((to:number,dismiss=false)=>{
    height.stopAnimation();
    live.current.closing=dismiss;
    Animated.timing(height,{toValue:to,duration:live.current.reduced?0:220,useNativeDriver:false}).start(({finished})=>{
      if(!finished)return;
      if(dismiss)live.current.onClose();else setSettledHeight(to);
    });
  },[height]);
  useEffect(()=>{
    live.current.bounds=bounds;
    const next=live.current.height===0?bounds.initial:Math.min(bounds.max,Math.max(bounds.min,live.current.height));
    animate(next);
  },[bounds,animate]);
  useEffect(()=>{live.current.scroll=0;scroll.current?.scrollTo({y:0,animated:false});},[title]);
  const close=useCallback(()=>{if(!live.current.closing)animate(0,true);},[animate]);
  const begin=useCallback(()=>{height.stopAnimation(value=>{live.current.height=value;live.current.start=value;});},[height]);
  const move=useCallback((_:GestureResponderEvent,g:PanResponderGestureState)=>{
    height.setValue(sheetDragHeight(live.current.start,g.dy,live.current.bounds));
  },[height]);
  const finish=useCallback((velocity:number,cancelled=false)=>{
    const to=sheetReleaseHeight(live.current.height,velocity,live.current.bounds,cancelled);
    animate(to,to===0);
  },[animate]);
  const captureHandle=useCallback((_:GestureResponderEvent,g:PanResponderGestureState)=>!live.current.closing&&g.numberActiveTouches===1&&shouldDragSheet(g.dx,g.dy,0,0,0,true),[]);
  const captureBody=useCallback((_:GestureResponderEvent,g:PanResponderGestureState)=>!live.current.closing&&g.numberActiveTouches===1&&shouldDragSheet(g.dx,g.dy,live.current.scroll,live.current.height,live.current.bounds.max),[]);
  // PanResponder registers callbacks without invoking them during render.
  const responders=useMemo(()=>{
    const create=(capture:typeof captureHandle,fromHandle=false)=>PanResponder.create({
      onStartShouldSetPanResponder:()=>fromHandle,
      onMoveShouldSetPanResponderCapture:capture,onPanResponderGrant:begin,onPanResponderMove:move,
      onPanResponderRelease:(_,g)=>finish(g.vy),onPanResponderTerminate:()=>finish(0,true),
      onPanResponderTerminationRequest:()=>false,
    });
    // eslint-disable-next-line react-hooks/refs -- create only registers callbacks with PanResponder.
    return {handle:create(captureHandle,true),body:create(captureBody)};
  },[captureHandle,captureBody,begin,move,finish]);
  const adjust=useCallback((delta:number)=>animate(Math.min(live.current.bounds.max,Math.max(live.current.bounds.min,live.current.height+delta))),[animate]);
  const keyboard:Pick<React.ComponentProps<typeof View>,'onKeyDown'>=Platform.OS==='web'?{onKeyDown:event=>{
    const key=(event as typeof event&{key?:string}).key??event.nativeEvent.key;
    if(!['ArrowUp','ArrowDown','Home','End','Escape'].includes(key))return;
    event.preventDefault();
    if(key==='Escape')close();else if(key==='ArrowUp'||key==='ArrowDown')adjust(key==='ArrowUp'?80:-80);else animate(key==='Home'?bounds.min:bounds.max);
  }}:{};
  return <Modal visible transparent animationType="none" onRequestClose={close}>
    <View style={{flex:1,justifyContent:'flex-end',alignItems:'center',backgroundColor:'rgba(4,13,12,0.48)',direction:'ltr'}}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('إغلاق اللوحة','Close panel')} onPress={close} style={{position:'absolute',top:0,bottom:0,left:0,right:0}}/>
      <Animated.View testID="reader-sheet" accessibilityViewIsModal role="dialog" aria-modal style={{height,maxHeight:bounds.max,width:'100%',maxWidth:680,backgroundColor:colors.surface,borderTopLeftRadius:30,borderTopRightRadius:30,paddingBottom:Math.max(insets.bottom,16),overflow:'hidden'}}>
        <View>
          <View testID="reader-sheet-handle" {...responders.handle.panHandlers} {...keyboard} accessible focusable accessibilityRole="adjustable" accessibilityLabel={t('ارتفاع اللوحة','Panel height')} accessibilityHint={t('اسحب لأعلى أو لأسفل لتغيير الارتفاع، واسحب لأسفل للإغلاق','Drag up or down to resize; pull down to close')} accessibilityValue={{min:Math.round(bounds.min),max:Math.round(bounds.max),now:Math.round(settledHeight)}} aria-valuemin={Math.round(bounds.min)} aria-valuemax={Math.round(bounds.max)} aria-valuenow={Math.round(settledHeight)} accessibilityActions={[{name:'increment',label:t('توسيع اللوحة','Expand panel')},{name:'decrement',label:t('تصغير اللوحة','Shrink panel')},{name:'escape',label:t('إغلاق','Close')}]}
            onAccessibilityAction={event=>{const action=event.nativeEvent.actionName;if(action==='escape')close();else if(action==='increment'||action==='decrement')adjust(action==='increment'?80:-80);}} style={[{height:44,alignItems:'center',justifyContent:'center'},handleTouch]}>
            <View style={{width:42,height:4,borderRadius:4,backgroundColor:colors.border}}/>
          </View>
          <Row style={{paddingHorizontal:20,paddingBottom:8,justifyContent:'space-between',flexWrap:'nowrap'}}><View style={{flex:1}}><Txt bold size={23} accessibilityRole="header">{title}</Txt>{subtitle?<Txt muted size={12}>{subtitle}</Txt>:null}</View><IconButton icon="xmark" label={t('إغلاق','Close')} onPress={close}/></Row>
        </View>
        <View {...responders.body.panHandlers} style={{flex:1,minHeight:0}}>
          <ScrollView ref={scroll} testID="reader-sheet-scroll" keyboardShouldPersistTaps="handled" bounces={false} overScrollMode="never" scrollEventThrottle={16} onScroll={event=>{live.current.scroll=Math.max(0,event.nativeEvent.contentOffset.y);}} contentContainerStyle={{padding:20,paddingTop:8,gap:12}} style={{flex:1}}>{children}</ScrollView>
        </View>
      </Animated.View>
    </View>
  </Modal>;
}
