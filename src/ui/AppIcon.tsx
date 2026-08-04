import React from 'react';
import {Text,View} from 'react-native';
import {iconCodepoints,type AppIconName} from '../data/fa-icons';
import {iconFontFamily} from './icon-fonts';

export {iconFonts} from './icon-fonts';
export type {AppIconName} from '../data/fa-icons';
export function AppIcon({name,size=22,color,regular=false}:{name:AppIconName;size?:number;color:string;regular?:boolean}){
  return <View pointerEvents="none" accessible={false} aria-hidden style={{width:size+4,height:size+4,alignItems:'center',justifyContent:'center'}}>
    <Text accessible={false} selectable={false} style={{fontFamily:iconFontFamily??(regular?'FontAwesome7Regular':'FontAwesome7Solid'),fontSize:size,lineHeight:size+4,color,textAlign:'center',includeFontPadding:false,writingDirection:'ltr'}}>{String.fromCodePoint(iconCodepoints[name])}</Text>
  </View>;
}
