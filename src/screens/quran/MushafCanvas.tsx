import React,{memo,useEffect,useRef,useState} from 'react';
import {Image,Pressable,ScrollView,View} from 'react-native';
import {hafsRects,pageImage,type Coordinates} from '../../core/ksu';
import {pageFrame,type PageFit} from '../../core/reader-layout';
import {useApp} from '../../state/AppContext';

interface Props {page:number;selection:{sura:number;aya:number};points?:Coordinates;fit:PageFit;zoom:number;retry:number;onSelect:(selection:{sura:number;aya:number})=>void;onImageError:()=>void;imageFailed:boolean}
export const MushafCanvas=memo(function MushafCanvas({page,selection,points,fit,zoom,retry,onSelect,onImageError,imageFailed}:Props){
  const {t}=useApp();
  const [viewport,setViewport]=useState({width:0,height:0});
  const horizontal=useRef<React.ComponentRef<typeof ScrollView>>(null);const vertical=useRef<React.ComponentRef<typeof ScrollView>>(null);
  const frame=pageFrame(viewport.width,viewport.height,fit,zoom);
  const contentWidth=Math.max(viewport.width,frame.width);
  useEffect(()=>{horizontal.current?.scrollTo({x:Math.max(0,(contentWidth-viewport.width)/2),animated:false});vertical.current?.scrollTo({y:0,animated:false});},[page,fit,zoom,contentWidth,viewport.width]);
  const rects=points?hafsRects(page,points):[];
  return <View testID="mushaf-stage" onLayout={event=>{const {width,height}=event.nativeEvent.layout;setViewport(previous=>previous.width===width&&previous.height===height?previous:{width,height});}} style={{flex:1,minHeight:0,direction:'ltr'}}>
    {frame.width>0?<ScrollView ref={horizontal} horizontal showsHorizontalScrollIndicator={frame.width>viewport.width+1} bounces={false} contentContainerStyle={{width:contentWidth,height:viewport.height}}>
      <ScrollView ref={vertical} showsVerticalScrollIndicator={frame.height>viewport.height+1} bounces={false} style={{width:contentWidth,height:viewport.height}} contentContainerStyle={{minHeight:viewport.height,alignItems:'center',justifyContent:'center'}}>
        <View testID="mushaf-image-plane" style={{width:frame.width,height:frame.height,position:'relative',backgroundColor:'#FFFFFF',direction:'ltr'}}>
          <Image key={`${page}-${retry}`} accessibilityLabel={t(`صورة صفحة المصحف ${page}`,`Original Mushaf page ${page}`)} source={{uri:pageImage(page)}} resizeMode="contain" style={{width:frame.width,height:frame.height}} onError={onImageError}/>
          {!imageFailed?rects.map(rect=>{const [sura,aya]=rect.id.split('__')[0].split('_').map(Number);const active=sura===selection.sura&&aya===selection.aya;
            return <Pressable key={rect.id} testID={`ayah-${rect.id}`} accessibilityRole="button" accessibilityLabel={t(`سورة ${sura}، الآية ${aya}`,`Surah ${sura}, ayah ${aya}`)} accessibilityState={{selected:active}} aria-pressed={active} onPress={()=>onSelect({sura,aya})}
              style={{position:'absolute',left:rect.left*frame.scale,top:rect.top*frame.scale,width:rect.width*frame.scale,height:rect.height*frame.scale,backgroundColor:active?'rgba(23,107,87,0.18)':'transparent',borderRadius:3}}/>;
          }):null}
        </View>
      </ScrollView>
    </ScrollView>:null}
  </View>;
});
