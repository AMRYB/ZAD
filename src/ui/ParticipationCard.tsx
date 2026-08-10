import React,{useMemo} from 'react';
import {router} from 'expo-router';
import {View} from 'react-native';
import {achievementProgress,xpSummary} from '../core/gamification';
import {useApp} from '../state/AppContext';
import {AppIcon} from './AppIcon';
import {Button,Card,Meter,Row,Txt} from './components';
import {useLocalDate} from './useLocalDate';

export function ParticipationCard(){
  const {state,t,colors}=useApp();const date=useLocalDate();
  const summary=useMemo(()=>xpSummary(state.gamification,date),[state.gamification,date]);
  const unlocked=useMemo(()=>achievementProgress(state.gamification).filter(b=>b.earnedOn).length,[state.gamification]);
  return <Card>
    <Row style={{flexWrap:'nowrap'}}><View style={{padding:12,borderRadius:18,backgroundColor:colors.soft}}><AppIcon name="star" color={colors.primary} size={26}/></View><View style={{flex:1}}><Txt bold size={20}>{t('خطواتك بتفرق','Your steps add up')}</Txt><Txt muted size={13}>{t(`المستوى ${summary.level} · ${unlocked} شارة`, `Level ${summary.level} · ${unlocked} ${unlocked===1?'badge':'badges'}`)}</Txt></View><Txt bold size={22} style={{color:colors.primary,writingDirection:'ltr'}}>{summary.total} XP</Txt></Row>
    <Meter value={summary.current} total={summary.required}/>
    <Txt muted size={13}>{t(`${summary.remaining} نقطة للمستوى التالي · ${summary.today} نقطة اليوم`,`${summary.remaining} XP to the next level · ${summary.today} today`)}</Txt>
    <Button secondary label={t('إنجازاتي','My achievements')} onPress={()=>router.push('/achievements')}/>
  </Card>;
}
