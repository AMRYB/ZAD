import React from 'react';
import {Modal,Pressable,ScrollView,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../../state/AppContext';
import {Row,Txt} from '../../ui/components';

export type ReaderIcon=React.ComponentProps<typeof Ionicons>['name'];
export function IconButton({icon,label,onPress,active,disabled=false,prominent=false}:{icon:ReaderIcon;label:string;onPress:()=>void;active?:boolean;disabled?:boolean;prominent?:boolean}){
  const {colors}=useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled,selected:active}} aria-disabled={disabled} aria-pressed={active} disabled={disabled} onPress={onPress}
    style={({pressed})=>({width:prominent?56:48,height:prominent?56:48,borderRadius:28,alignItems:'center',justifyContent:'center',backgroundColor:prominent?colors.primary:active?colors.soft:'transparent',opacity:disabled?.35:pressed?.65:1,transform:[{scale:pressed?.96:1}]})}>
    <Ionicons name={icon} size={prominent?25:22} color={prominent?colors.onPrimary:active?colors.primary:colors.text}/>
  </Pressable>;
}
export function ReaderChip({label,icon,onPress,selected=false}:{label:string;icon?:ReaderIcon;onPress:()=>void;selected?:boolean}){
  const {colors,rtl}=useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({pressed})=>({minHeight:48,maxWidth:'100%',borderRadius:24,paddingHorizontal:15,backgroundColor:selected?colors.primary:colors.soft,flexDirection:rtl?'row-reverse':'row',alignItems:'center',justifyContent:'center',gap:7,opacity:pressed?.7:1})}>
    {icon?<Ionicons name={icon} size={18} color={selected?colors.onPrimary:colors.primary}/>:null}<Txt size={13} bold numberOfLines={1} style={{color:selected?colors.onPrimary:colors.primary,flexShrink:1}}>{label}</Txt>
  </Pressable>;
}
export function OptionRow({title,detail,selected,onPress,icon='musical-notes-outline'}:{title:string;detail?:string;selected?:boolean;onPress:()=>void;icon?:ReaderIcon}){
  const {colors,rtl}=useApp();
  return <Pressable accessibilityRole={selected===undefined?'button':'radio'} accessibilityLabel={title} accessibilityState={{checked:selected}} aria-checked={selected} onPress={onPress} style={({pressed})=>({minHeight:66,paddingVertical:12,paddingHorizontal:14,borderRadius:18,backgroundColor:selected?colors.soft:pressed?colors.background:'transparent',flexDirection:rtl?'row-reverse':'row',alignItems:'center',gap:12})}>
    <View style={{width:40,height:40,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:colors.soft}}><Ionicons name={icon} size={21} color={colors.primary}/></View>
    <View style={{flex:1,gap:1}}><Txt bold size={15}>{title}</Txt>{detail?<Txt muted size={12}>{detail}</Txt>:null}</View>
    <Ionicons name={selected?'checkmark-circle':selected===undefined?(rtl?'chevron-back':'chevron-forward'):'ellipse-outline'} size={21} color={selected?colors.primary:colors.muted}/>
  </Pressable>;
}
export function ReaderSheet({visible,title,subtitle,onClose,children}:{visible:boolean;title:string;subtitle?:string;onClose:()=>void;children:React.ReactNode}){
  const {colors,t}=useApp();const insets=useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={{flex:1,justifyContent:'flex-end',alignItems:'center',backgroundColor:'rgba(4,13,12,0.48)',direction:'ltr'}}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('إغلاق اللوحة','Close panel')} onPress={onClose} style={{position:'absolute',top:0,bottom:0,left:0,right:0}}/>
      <View accessibilityViewIsModal role="dialog" aria-modal style={{width:'100%',maxWidth:680,maxHeight:'88%',backgroundColor:colors.surface,borderTopLeftRadius:30,borderTopRightRadius:30,paddingBottom:Math.max(insets.bottom,16),paddingTop:10}}>
        <View style={{alignSelf:'center',width:36,height:4,borderRadius:4,backgroundColor:colors.border,marginBottom:5}}/>
        <Row style={{paddingHorizontal:20,justifyContent:'space-between',flexWrap:'nowrap'}}><View style={{flex:1}}><Txt bold size={23} accessibilityRole="header">{title}</Txt>{subtitle?<Txt muted size={12}>{subtitle}</Txt>:null}</View><IconButton icon="close" label={t('إغلاق','Close')} onPress={onClose}/></Row>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,gap:12}} style={{flexShrink:1}}>{children}</ScrollView>
      </View>
    </View>
  </Modal>;
}
