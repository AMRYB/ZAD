import React,{memo,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Image,PanResponder,Platform,Pressable,View,type GestureResponderEvent,type ViewStyle} from 'react-native';
import {hafsRects,pageImage,type Coordinates} from '../../core/ksu';
import {pageFrame,type PageFit} from '../../core/reader-layout';
import {ReaderGesture,type Point} from '../../core/reader-gestures';
import {useApp} from '../../state/AppContext';

interface Props {page:number;selection:{sura:number;aya:number};points?:Coordinates;fit:PageFit;zoom:number;onZoomChange:(zoom:number)=>void;onMovePage:(delta:number)=>void;retry:number;onSelect:(selection:{sura:number;aya:number})=>void;onImageError:()=>void;imageFailed:boolean}
const touchSurface:ViewStyle&{touchAction?:'none';userSelect?:'none'}=Platform.OS==='web'?{touchAction:'none',userSelect:'none'}:{};
export const MushafCanvas=memo(function MushafCanvas({page,selection,points,fit,zoom,onZoomChange,onMovePage,retry,onSelect,onImageError,imageFailed}:Props){
  const {t,rtl}=useApp();
  const [viewport,setViewport]=useState({width:0,height:0});
  const stage=useRef<React.ComponentRef<typeof View>>(null);
  const origin=useRef({x:0,y:0});
  const [gesture]=useState(()=>new ReaderGesture());
  const [motion]=useState(()=>({x:new Animated.Value(0),y:new Animated.Value(0),zoom:new Animated.Value(zoom)}));
  const suppressTap=useRef(0);
  const live=useRef({page,rtl,zoom,onZoomChange,onMovePage});
  useEffect(()=>{live.current={page,rtl,zoom,onZoomChange,onMovePage};},[page,rtl,zoom,onZoomChange,onMovePage]);
  const frame=pageFrame(viewport.width,viewport.height,fit);
  const bounds=useMemo(()=>({width:viewport.width,height:viewport.height,pageWidth:frame.width,pageHeight:frame.height}),[viewport.width,viewport.height,frame.width,frame.height]);
  const paint=useCallback(()=>{
    motion.x.setValue(gesture.value.x+gesture.dragX*.72);motion.y.setValue(gesture.value.y);motion.zoom.setValue(gesture.value.zoom);
  },[gesture,motion]);
  const measure=useCallback(()=>stage.current?.measureInWindow((x,y)=>{origin.current={x,y};}),[]);
  useEffect(()=>{gesture.configure(bounds,live.current.zoom);paint();measure();},[page,fit,bounds,gesture,paint,measure]);
  useEffect(()=>{
    if(Math.abs(gesture.value.zoom-zoom)<.001)return;
    gesture.configure(bounds,zoom);paint();
  },[zoom,bounds,gesture,paint]);
  const touches=useCallback((event:GestureResponderEvent):Point[]=>Array.from(event.nativeEvent.touches).map(p=>({x:p.pageX-origin.current.x,y:p.pageY-origin.current.y})),[]);
  const finish=useCallback((cancelled=false)=>{
    const result=gesture.finish(live.current.rtl,live.current.page,cancelled);
    if(result.moved)suppressTap.current=Date.now()+300;
    live.current.onZoomChange(gesture.value.zoom);
    if(result.delta){live.current.onMovePage(result.delta);paint();}
    else Animated.spring(motion.x,{toValue:gesture.value.x,useNativeDriver:true,bounciness:0,speed:25}).start();
  },[gesture,motion,paint]);
  const responder=useMemo(()=>PanResponder.create({
    onStartShouldSetPanResponderCapture:event=>{measure();const p=touches(event);gesture.begin(p);return p.length>1;},
    onMoveShouldSetPanResponderCapture:event=>gesture.shouldCapture(touches(event)),
    onPanResponderGrant:event=>{motion.x.stopAnimation();gesture.update(touches(event));paint();suppressTap.current=Date.now()+300;},
    onPanResponderMove:event=>{gesture.update(touches(event));paint();},
    onPanResponderStart:event=>{gesture.update(touches(event));paint();},
    onPanResponderEnd:event=>{if(event.nativeEvent.touches.length){gesture.update(touches(event));paint();}},
    onPanResponderRelease:()=>finish(),
    onPanResponderTerminate:()=>finish(true),
    onPanResponderTerminationRequest:()=>false,
    onShouldBlockNativeResponder:()=>true,
  }),[gesture,measure,motion,paint,touches,finish]);
  const rects=points?hafsRects(page,points):[];
  return <View ref={stage} testID="mushaf-stage" {...responder.panHandlers} onLayout={event=>{const {width,height}=event.nativeEvent.layout;setViewport(previous=>previous.width===width&&previous.height===height?previous:{width,height});measure();}} style={[{flex:1,minHeight:0,overflow:'hidden',direction:'ltr'},touchSurface]}>
    {frame.width>0?<Animated.View testID="mushaf-image-plane" style={{width:frame.width,height:frame.height,position:'absolute',left:(viewport.width-frame.width)/2,top:(viewport.height-frame.height)/2,backgroundColor:'#FFFFFF',direction:'ltr',transform:[{translateX:motion.x},{translateY:motion.y},{scale:motion.zoom}]}}>
      <Image key={`${page}-${retry}`} accessibilityLabel={t(`صورة صفحة المصحف ${page}`,`Original Mushaf page ${page}`)} source={{uri:pageImage(page)}} resizeMode="contain" style={{width:frame.width,height:frame.height}} onError={onImageError}/>
      {!imageFailed?rects.map(rect=>{const [sura,aya]=rect.id.split('__')[0].split('_').map(Number);const active=sura===selection.sura&&aya===selection.aya;
        return <Pressable key={rect.id} testID={`ayah-${rect.id}`} accessibilityRole="button" accessibilityLabel={t(`سورة ${sura}، الآية ${aya}`,`Surah ${sura}, ayah ${aya}`)} accessibilityState={{selected:active}} aria-pressed={active} onPress={()=>{if(Date.now()>=suppressTap.current)onSelect({sura,aya});}}
          style={{position:'absolute',left:rect.left*frame.scale,top:rect.top*frame.scale,width:rect.width*frame.scale,height:rect.height*frame.scale,backgroundColor:active?'rgba(23,107,87,0.18)':'transparent',borderRadius:3}}/>;
      }):null}
    </Animated.View>:null}
  </View>;
});
