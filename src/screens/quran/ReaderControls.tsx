import React from 'react';
import {Pressable,View} from 'react-native';
import {AppIcon,type AppIconName} from '../../ui/AppIcon';
import {useApp} from '../../state/AppContext';
import {Txt} from '../../ui/components';

export type ReaderIcon=AppIconName;
export function IconButton({icon,label,onPress,active,disabled=false,prominent=false}:{icon:ReaderIcon;label:string;onPress:()=>void;active?:boolean;disabled?:boolean;prominent?:boolean}){
  const {colors}=useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled,selected:active}} aria-disabled={disabled} aria-pressed={active} disabled={disabled} onPress={onPress}
    style={({pressed})=>({width:prominent?56:48,height:prominent?56:48,borderRadius:28,alignItems:'center',justifyContent:'center',backgroundColor:prominent?colors.primary:active?colors.soft:'transparent',opacity:disabled?.35:pressed?.65:1,transform:[{scale:pressed?.96:1}]})}>
    <AppIcon name={icon} regular={icon==='bookmark'&&!active} size={prominent?24:21} color={prominent?colors.onPrimary:active?colors.primary:colors.text}/>
  </Pressable>;
}
export function ReaderChip({label,icon,onPress,selected=false,large=false,compact=false}:{label:string;icon?:ReaderIcon;onPress:()=>void;selected?:boolean;large?:boolean;compact?:boolean}){
  const {colors,rtl}=useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({pressed})=>({minHeight:large?56:48,maxWidth:'100%',borderRadius:28,paddingHorizontal:compact?7:large?22:15,backgroundColor:selected?colors.primary:colors.soft,flexDirection:rtl?'row-reverse':'row',alignItems:'center',justifyContent:'center',gap:7,opacity:pressed?.7:1})}>
    {icon?<AppIcon name={icon} size={18} color={selected?colors.onPrimary:colors.primary}/>:null}<Txt size={compact?12:large?17:13} bold numberOfLines={1} style={{color:selected?colors.onPrimary:colors.primary,flexShrink:1}}>{label}</Txt>
  </Pressable>;
}
export function OptionRow({title,detail,selected,onPress,icon='music'}:{title:string;detail?:string;selected?:boolean;onPress:()=>void;icon?:ReaderIcon}){
  const {colors,rtl}=useApp();
  return <Pressable accessibilityRole={selected===undefined?'button':'radio'} accessibilityLabel={title} accessibilityState={{checked:selected}} aria-checked={selected} onPress={onPress} style={({pressed})=>({minHeight:66,paddingVertical:12,paddingHorizontal:14,borderRadius:18,backgroundColor:selected?colors.soft:pressed?colors.background:'transparent',flexDirection:rtl?'row-reverse':'row',alignItems:'center',gap:12})}>
    <View style={{width:40,height:40,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:colors.soft}}><AppIcon name={icon} size={21} color={colors.primary}/></View>
    <View style={{flex:1,gap:1}}><Txt bold size={15}>{title}</Txt>{detail?<Txt muted size={12}>{detail}</Txt>:null}</View>
    <AppIcon regular={selected===false} name={selected?'circle-check':selected===undefined?(rtl?'chevron-left':'chevron-right'):'circle'} size={21} color={selected?colors.primary:colors.muted}/>
  </Pressable>;
}
