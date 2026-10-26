import React,{useState} from 'react';
import { ActivityIndicator,Modal, Pressable, ScrollView, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../state/AppContext';

export function Txt({children, size=16, muted=false, bold=false, style, ...props}: React.ComponentProps<typeof Text> & {size?:number;muted?:boolean;bold?:boolean}) {
  const {colors,rtl}=useApp();
  return <Text {...props} style={[{color:muted?colors.muted:colors.text,fontFamily:bold?'Cairo_700Bold':'Cairo_400Regular',fontSize:size,lineHeight:size*1.65,textAlign:rtl?'right':'left',writingDirection:rtl?'rtl':'ltr'},style]}>{children}</Text>;
}
export function Row({children,style}: {children:React.ReactNode;style?:StyleProp<ViewStyle>}) {
  const {rtl}=useApp();
  return <View style={[{flexDirection:rtl?'row-reverse':'row',alignItems:'center',gap:12,flexWrap:'wrap'},style]}>{children}</View>;
}
export function Screen({title,subtitle,children,scroll=true,trailing,contentStyle}: {title:string;subtitle?:string;children:React.ReactNode;scroll?:boolean;trailing?:React.ReactNode;contentStyle?:StyleProp<ViewStyle>}) {
  const {colors,t,saving,saveError,retrySave}=useApp();
  const content=<View style={[{width:'100%',maxWidth:860,alignSelf:'center',padding:20,gap:20,paddingBottom:36},contentStyle]}>
    <Row style={{justifyContent:'space-between',flexWrap:'nowrap',marginTop:8}}>
      <View style={{flex:1}}><Txt size={11} bold style={{color:colors.primary,letterSpacing:2}}>{t('زاد','ZAD')}</Txt><Txt size={30} bold accessibilityRole="header">{title}</Txt>{subtitle?<Txt muted size={14}>{subtitle}</Txt>:null}</View>{trailing}
    </Row>
    {saveError?<Card><Txt style={{color:colors.danger}}>{t('تعذّر الحفظ. تغييراتك الحالية لم تُحفظ بعد.','Saving failed. Current changes have not been saved.')}</Txt><Button label={t('إعادة الحفظ','Retry saving')} onPress={retrySave} secondary /></Card>:null}
    {children}
    {saving?<Txt muted size={12} accessibilityLiveRegion="polite">{t('جارٍ الحفظ على هذا الجهاز…','Saving on this device…')}</Txt>:null}
  </View>;
  return <SafeAreaView edges={['top','left','right']} style={{flex:1,backgroundColor:colors.background,direction:'ltr'}}>
    {scroll?<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1}}>{content}</ScrollView>:content}
  </SafeAreaView>;
}
export function Card({children,style}: {children:React.ReactNode;style?:StyleProp<ViewStyle>}) {
  const {colors}=useApp();
  return <View style={[{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:22,padding:20,gap:12},style]}>{children}</View>;
}
export function Button({label,onPress,secondary=false,disabled=false,small=false,danger=false,testID}: {label:string;onPress:()=>void;secondary?:boolean;disabled?:boolean;small?:boolean;danger?:boolean;testID?:string}) {
  const {colors}=useApp();
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} aria-disabled={disabled} disabled={disabled} onPress={onPress}
    style={({pressed})=>({minHeight:48,borderRadius:14,paddingHorizontal:small?14:20,paddingVertical:10,alignItems:'center',justifyContent:'center',backgroundColor:secondary?colors.soft:colors.primary,opacity:disabled?.45:pressed?.72:1,borderWidth:danger?1:0,borderColor:colors.danger})}>
    <Txt bold size={small?14:16} style={{color:danger?colors.danger:secondary?colors.primary:colors.onPrimary,textAlign:'center'}}>{label}</Txt>
  </Pressable>;
}
export function Field({label,style,...props}: TextInputProps & {label:string}) {
  const {colors,rtl}=useApp();
  return <View style={{gap:6,flexGrow:1}}><Txt bold size={14}>{label}</Txt><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props}
    style={[{minHeight:50,borderRadius:12,borderWidth:1,borderColor:colors.border,paddingHorizontal:14,paddingVertical:10,color:colors.text,backgroundColor:colors.background,fontFamily:'Cairo_400Regular',fontSize:16,textAlign:rtl?'right':'left',writingDirection:rtl?'rtl':'ltr'},style]} /></View>;
}
export function Section({title,action}: {title:string;action?:React.ReactNode}) {
  return <Row style={{justifyContent:'space-between'}}><Txt bold size={20} accessibilityRole="header">{title}</Txt>{action}</Row>;
}
export function Meter({value,total}: {value:number;total:number}) {
  const {colors,rtl,t}=useApp();
  const percent=Math.max(0,Math.min(100,total?100*value/total:0));
  return <View accessibilityRole="progressbar" accessibilityLabel={t('التقدم','Progress')} accessibilityValue={{min:0,max:total,now:value}} aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} style={{height:8,borderRadius:20,backgroundColor:colors.soft,overflow:'hidden',flexDirection:rtl?'row-reverse':'row'}}><View style={{height:8,width:`${percent}%`,backgroundColor:colors.primary,borderRadius:20}} /></View>;
}
export function Stat({label,value}: {label:string;value:string|number}) {
  const {colors}=useApp();
  return <Card style={{flex:1,minWidth:120}}><Txt size={30} bold style={{color:colors.primary,writingDirection:'ltr'}}>{value}</Txt><Txt muted size={13}>{label}</Txt></Card>;
}
export function Choice<T extends string>({value,options,onChange}: {value:T;options:{value:T;label:string}[];onChange:(value:T)=>void}) {
  const {colors}=useApp();
  return <Row style={{gap:8}}>{options.map(option=><Pressable key={option.value} accessibilityRole="radio" accessibilityState={{checked:value===option.value}} aria-checked={value===option.value} accessibilityLabel={option.label} onPress={()=>onChange(option.value)}
    style={{minHeight:48,paddingHorizontal:14,paddingVertical:10,borderRadius:12,backgroundColor:value===option.value?colors.primary:colors.soft,justifyContent:'center'}}><Txt size={14} bold style={{color:value===option.value?colors.onPrimary:colors.text}}>{option.label}</Txt></Pressable>)}</Row>;
}
export function Loading(){const {colors,t}=useApp();return <Row><ActivityIndicator color={colors.primary}/><Txt muted>{t('جارٍ التحميل…','Loading…')}</Txt></Row>;}
export function ConfirmDialog({visible,title,detail,confirmLabel,onConfirm,onCancel}:{visible:boolean;title:string;detail:string;confirmLabel:string;onConfirm:()=>void;onCancel:()=>void}){
  const {t}=useApp();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}><View style={{flex:1,backgroundColor:'rgba(0,0,0,0.55)',justifyContent:'center',padding:20}}><Card style={{width:'100%',maxWidth:440,alignSelf:'center'}}><Txt bold size={21} accessibilityRole="header">{title}</Txt><Txt>{detail}</Txt><Button label={confirmLabel} onPress={onConfirm}/><Button secondary label={t('إلغاء','Cancel')} onPress={onCancel}/></Card></View></Modal>;
}
export function ConfirmButton({label,detail,onConfirm}:{label:string;detail:string;onConfirm:()=>void}){
  const {t}=useApp();const [open,setOpen]=useState(false);
  return <><Button secondary small danger label={label} onPress={()=>setOpen(true)}/><ConfirmDialog visible={open} title={label} detail={detail} confirmLabel={t('تأكيد الإزالة','Confirm removal')} onCancel={()=>setOpen(false)} onConfirm={()=>{setOpen(false);onConfirm();}}/></>;
}
export const formMessage: TextStyle={fontSize:14};
