import React from 'react';
import {useApp} from '../state/AppContext';
import {FeatureTile} from '../ui/FeatureTile';
import {Row,Screen,Section} from '../ui/components';
import {cloudConfigured} from '../services/cloud-client';
export function More(){const {t}=useApp();return <Screen title={t('المزيد','Explore')} subtitle={t('كل ما يعينك على يومك، في مكانه','Everything for your day, in its place')}>
  <Section title={t('وردك ويومك','Your daily companions')}/><Row style={{alignItems:'stretch'}}>
    <FeatureTile title={t('الأذان','Adhan')} detail={t('المواقيت والتنبيهات','Prayer times & alerts')} icon="bell" href="/adhan"/>
    <FeatureTile title={t('اتجاه القبلة','Qibla direction')} detail={t('بوصلة وإرشادات المعايرة','Compass & calibration guide')} icon="compass" href="/qibla"/>
    <FeatureTile title={t('الأذكار','Adhkar')} detail={t('وردك بمصادره','Your sourced remembrance')} icon="sun" href="/adhkar"/>
    <FeatureTile title={t('أعمال الخير','Good deeds')} detail={t('خطوات تختارها لنفسك','Steps you choose yourself')} icon="heart" href="/good-deeds"/>
    <FeatureTile title={t('خطط القراءة','Reading plans')} detail={t('ورد يناسب وقتك','Reading that fits your time')} icon="book-open" href="/plans"/>
    <FeatureTile title={t('تسميع بالكتابة','Written recall')} detail={t('راجع الحروف من حفظك','Check letters from memory')} icon="keyboard" href="/recall"/>
    <FeatureTile title={t('التلاوة','Listening')} detail={t('التشغيل ومؤقت الإيقاف','Playback & sleep timer')} icon="headphones" href="/listening"/>
  </Row>
  <Section title={t('رحلتك','Your journey')}/><Row style={{alignItems:'stretch'}}>
    <FeatureTile title={t('إنجازاتي','My achievements')} detail={t('المستوى والنقاط والشارات','Levels, XP & badges')} icon="star" href="/achievements"/>
    <FeatureTile title={t('تقاريري','My reports')} detail={t('نظرة على أسبوعك وشهرك','Your week & month')} icon="chart-simple" href="/reports"/>
    <FeatureTile title={t('خصص رحلتك','Make it yours')} detail={t('اختصاراتك وتذكيراتك','Shortcuts & reminders')} icon="sliders" href="/setup"/>
    <FeatureTile title={t('أداة الشاشة الرئيسية','Home-screen widget')} detail={t('زاد على شاشة هاتفك','ZAD at a glance')} icon="house" href="/widget"/>
    <FeatureTile title={t('الإعدادات','Settings')} detail={t('المظهر واللغة والبيانات','Appearance, language & data')} icon="table-cells-large" href="/settings"/>
    {cloudConfigured?<FeatureTile title={t('حسابي ونسختي','My account & backup')} detail={t('دخول اختياري ومزامنة خاصة','Optional sign-in & private sync')} icon="bookmark" href="/account"/>:null}
  </Row>
  </Screen>;}
