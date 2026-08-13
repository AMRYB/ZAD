import React from 'react';
import {Pressable,View} from 'react-native';
import {router,type Href} from 'expo-router';
import {useApp} from '../state/AppContext';
import {AppIcon,type AppIconName} from './AppIcon';
import {Txt} from './components';
export function FeatureTile({title,detail,icon,href}:{title:string;detail:string;icon:AppIconName;href:Href}){
  const {colors}=useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={()=>router.push(href)} style={({pressed})=>({flexGrow:1,flexBasis:'45%',minWidth:130,minHeight:154,borderRadius:22,padding:18,gap:10,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,opacity:pressed?.72:1})}>
    <View style={{alignSelf:'center',padding:12,borderRadius:18,backgroundColor:colors.soft}}><AppIcon name={icon} size={25} color={colors.primary}/></View><Txt bold size={17}>{title}</Txt><Txt muted size={12}>{detail}</Txt>
  </Pressable>;
}
