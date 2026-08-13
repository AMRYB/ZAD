import React from 'react';
import {Pressable,View} from 'react-native';
import {router,usePathname} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRecitation} from '../state/RecitationContext';
import {useApp} from '../state/AppContext';
import {quran} from '../data/quran';
import {IconButton} from '../screens/quran/ReaderControls';
import {Row,Txt} from './components';
export function RecitationBar(){
  const audio=useRecitation(),{t,colors}=useApp(),path=usePathname();
  if(!audio.verse||path==='/quran'||path==='/listening')return null;
  return <SafeAreaView edges={['bottom']} style={{backgroundColor:colors.surface,borderTopWidth:1,borderTopColor:colors.border}}><Row style={{paddingHorizontal:14,paddingVertical:5,flexWrap:'nowrap',gap:5}}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('فتح مشغّل التلاوة','Open recitation player')} onPress={()=>router.push('/listening')} style={{flex:1,minHeight:52,justifyContent:'center'}}><Txt bold size={14} numberOfLines={1}>{t(`سورة ${quran.Sura[audio.verse.sura]!.name}`,`Surah ${audio.verse.sura}`)}</Txt><Txt muted size={11}>{t(`الآية ${audio.verse.aya}`,`Ayah ${audio.verse.aya}`)} · {audio.error?t('تعذّر التشغيل','Playback error'):audio.playing?t('قيد التلاوة','Playing'):t('متوقف مؤقتًا','Paused')}</Txt></Pressable>
    <View><IconButton icon={audio.playing?'pause':'play'} label={audio.playing?t('إيقاف التلاوة مؤقتًا','Pause recitation'):t('متابعة التلاوة','Resume recitation')} onPress={audio.toggle}/></View><IconButton icon="xmark" label={t('إنهاء التلاوة','Stop recitation')} onPress={audio.stop}/>
  </Row></SafeAreaView>;
}
