import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Animated,Linking,Platform,View,useWindowDimensions} from 'react-native';
import {router,useFocusEffect} from 'expo-router';
import {useApp} from '../state/AppContext';
import {angleDelta,qiblaDirection,reliableQibla} from '../core/qibla';
import {useQibla} from '../services/useQibla';
import {useAmbientMotion} from '../ui/useAmbientMotion';
import {AppIcon} from '../ui/AppIcon';
import {Button,Card,Row,Screen,Txt} from '../ui/components';
import {IconButton} from './quran/ReaderControls';

export function Qibla(){
  const {t,colors}=useApp(),sensor=useQibla(),dimensions=useWindowDimensions(),motion=useAmbientMotion();
  const [clock,setClock]=useState(Date.now),[rotation]=useState(()=>new Animated.Value(0)),angle=useRef(0);
  useFocusEffect(useCallback(()=>{const timer=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(timer);},[]));
  const point=sensor.position,heading=sensor.heading,direction=point?qiblaDirection(point.coords.latitude,point.coords.longitude):null;
  const portrait=dimensions.height>dimensions.width,trueNorth=!!heading&&heading.trueHeading>=0,hasDirection=direction&&direction.distance>50&&direction.distance<19990000;
  const confident=!!(point&&heading&&direction&&portrait&&reliableQibla({accuracy:point.coords.accuracy,compass:heading.accuracy,trueHeading:heading.trueHeading,distance:direction.distance,mocked:!!point.mocked,age:Math.max(clock-point.timestamp,clock-heading.receivedAt)}));
  const delta=direction&&trueNorth?angleDelta(direction.bearing,heading!.trueHeading):null,aligned=confident&&delta!==null&&Math.abs(delta)<=5;
  const target=delta??0;
  const loadingLabel=sensor.phase==='permission'?t('بانتظار إذن الموقع…','Waiting for location permission…'):sensor.phase==='position'?t('جارٍ تحديد موقعك…','Finding your location…'):t('جارٍ التقاط اتجاه الهاتف…','Reading the phone compass…');
  useEffect(()=>{if(!trueNorth)return;const next=angle.current+angleDelta(target,angle.current);angle.current=next;const animation=Animated.timing(rotation,{toValue:next,duration:motion?180:0,useNativeDriver:true});animation.start();return()=>animation.stop();},[target,rotation,motion,trueNorth]);
  const size=Math.min(dimensions.width-80,300),center=size/2;
  const problems={permission:t('اسمح بالموقع أثناء استخدام صفحة القبلة، أو فعّله من إعدادات الهاتف.','Allow location while using Qibla, or enable it in phone settings.'),disabled:t('خدمة الموقع مقفولة. فعّلها ثم أعد المحاولة.','Location services are off. Enable them, then retry.'),location:t('لم تصل قراءة موقع موثوقة. جرّب مكانًا مكشوفًا ثم أعد المحاولة.','A location fix is unavailable. Try an open area, then retry.'),compass:t('البوصلة لم ترسل قراءة. حرّك الهاتف برفق؛ قد يكون جهازك بدون حساس بوصلة.','No compass reading. Move the phone gently; the device may have no compass sensor.'),unsupported:t('البوصلة الحية متاحة في نسخة Android على هاتف يدعم الحساسات.','Live Qibla is available in the Android build on a phone with compass sensors.')};
  return <Screen title={t('اتجاه القبلة','Qibla direction')} subtitle={t('دليل مساعد عندما لا تعرف الاتجاه','A guide when you do not know the direction')} trailing={<IconButton icon="xmark" label={t('العودة للمزيد','Back to more')} onPress={()=>router.canGoBack()?router.back():router.replace('/more')}/>}>
    <Card style={{alignItems:'center',padding:16,gap:16}}>
      <View testID="qibla-status" style={{backgroundColor:aligned?colors.primary:colors.soft,borderRadius:24,paddingHorizontal:16,paddingVertical:8}}><Txt bold size={14} style={{color:aligned?colors.onPrimary:colors.primary,textAlign:'center'}}>{sensor.busy?loadingLabel:!sensor.active?t('ابدأ بتحديد موقعك','Start with your location'):!portrait?t('امسك الهاتف بالوضع الرأسي','Hold the phone in portrait'):!hasDirection?t('الاتجاه يحتاج تحققًا مباشرًا','Direction needs direct verification'):!trueNorth?t('بانتظار الشمال الحقيقي','Waiting for true north'):!confident?t('قراءة تقريبية · راجع المعايرة','Approximate · check calibration'):aligned?t('أعلى الهاتف يشير نحو القبلة تقريبًا','Phone top points approximately toward Qibla'):t('لفّ الهاتف حتى يشير السهم لأعلى','Turn until the arrow points up')}</Txt></View>
      <View accessible accessibilityLabel={delta!==null&&hasDirection?t(`اتجاه القبلة ${Math.round(direction!.bearing)} درجة من الشمال الحقيقي، لف ${Math.round(Math.abs(delta))} درجة ${delta>0?'يمينًا':'يسارًا'}`,`Qibla ${Math.round(direction!.bearing)} degrees from true north, turn ${Math.round(Math.abs(delta))} degrees ${delta>0?'right':'left'}`):t('لا توجد قراءة اتجاه موثوقة بعد','No reliable direction reading yet')} style={{width:size,height:size,borderRadius:center,borderWidth:1,borderColor:colors.border,backgroundColor:colors.background,direction:'ltr'}}>
        {Array.from({length:48},(_,i)=>{const a=i/48*2*Math.PI,r=center-12;return <View key={i} style={{position:'absolute',left:center+Math.sin(a)*r-1,top:center-Math.cos(a)*r-3,width:i%4===0?2:1,height:i%4===0?9:4,borderRadius:2,backgroundColor:i%4===0?colors.primary:colors.border,transform:[{rotate:`${i*7.5}deg`}]}}/>;})}
        <View style={{position:'absolute',top:12,left:center-30,width:60,alignItems:'center'}}><AppIcon name="chevron-up" size={17} color={colors.primary}/></View>
        <View style={{position:'absolute',left:30,right:30,top:center-32,alignItems:'center'}}><View style={{width:48,height:44,borderRadius:7,backgroundColor:'#172D27',borderWidth:1,borderColor:colors.accent,transform:[{rotate:'-6deg'}],overflow:'hidden'}}><View style={{position:'absolute',top:10,width:'100%',height:7,backgroundColor:colors.accent}}/></View><Txt size={11} muted>{t('الكعبة','Kaaba')}</Txt></View>
        {trueNorth&&hasDirection&&portrait?<Animated.View pointerEvents="none" style={{position:'absolute',width:size,height:size,transform:[{rotate:rotation.interpolate({inputRange:[-360,360],outputRange:['-360deg','360deg'],extrapolate:'extend'})}]}}><View style={{position:'absolute',top:42,left:center-16}}><AppIcon name="arrow-up" size={28} color={aligned?colors.primary:colors.accent}/></View><View style={{position:'absolute',top:78,left:center-1,width:2,height:Math.max(8,center-110),backgroundColor:colors.primary,opacity:.5}}/></Animated.View>:null}
      </View>
      {hasDirection?<Txt bold size={17} style={{textAlign:'center',color:colors.primary}}>{Math.round(direction!.bearing)}° · {t('من الشمال الحقيقي','from true north')}</Txt>:<Txt muted size={13} style={{textAlign:'center'}}>{t('لن يظهر سهم قبل وصول قراءة حقيقية','The arrow appears only after real sensor readings')}</Txt>}
      {point?<Txt muted size={11}>{t('دقة الموقع: ','Location accuracy: ')}{point.coords.accuracy===null?t('غير معروفة','Unknown'):`± ${Math.ceil(point.coords.accuracy)} ${t('متر','m')}`}{point.mocked?t(' · موقع تجريبي',' · Mock location'):''}</Txt>:null}
      {heading?<Txt muted size={11}>{t('معايرة البوصلة: ','Compass calibration: ')}{heading.accuracy>=3?t('جيدة بحسب الحساس','High, as reported by sensor'):heading.accuracy===2?t('متوسطة','Medium'):t('ضعيفة أو غير معروفة','Low or unknown')}</Txt>:null}
      <Button label={sensor.busy?loadingLabel:sensor.active?t('إعادة القياس والمعايرة','Measure again'):t('استخدام موقعي لتحديد القبلة','Use my location for Qibla')} disabled={sensor.busy} onPress={()=>void sensor.start()}/>
      {sensor.active?<Button secondary label={t('إيقاف الحساسات','Stop sensors')} onPress={sensor.stop}/>:null}
      {sensor.problem?<Txt style={{color:colors.danger,textAlign:'center'}} size={13}>{problems[sensor.problem]}</Txt>:null}
      {sensor.problem==='permission'&&Platform.OS!=='web'?<Button secondary label={t('إعدادات إذن الموقع','Location permission settings')} onPress={()=>void Linking.openSettings()}/>:null}
    </Card>
    <Card><Txt bold size={18}>{t('عشان القراءة تبقى أفضل','For a better reading')}</Txt>{[
      t('اسمح بالموقع الدقيق، واستخدم مكانًا مكشوفًا لو دقة الموقع ضعيفة.','Allow precise location and use an open area if location accuracy is low.'),
      t('امسك الهاتف بالطول وموازيًا للأرض، وأعلى الهاتف هو اتجاه نظرك.','Hold the phone in portrait, flat and parallel to the ground; its top is your facing direction.'),
      t('حرّك الهاتف برفق على شكل 8 لمعايرة البوصلة، ثم ثبّته.','Gently move the phone in a figure eight to calibrate the compass, then hold it steady.'),
      t('ابعد عن الحديد، السماعات، المغناطيس، الجراب المغناطيسي والسيارة.','Move away from metal, speakers, magnets, magnetic cases and vehicles.'),
      t('لو السهم بيقفز أو المعايرة ضعيفة، غيّر مكانك وأعد القياس.','If the arrow jumps or calibration is low, change position and measure again.'),
    ].map((line,i)=><Row key={i} style={{flexWrap:'nowrap',alignItems:'flex-start'}}><Txt bold style={{color:colors.primary}}>{i+1}</Txt><Txt size={13} style={{flex:1}}>{line}</Txt></Row>)}</Card>
    <Card style={{backgroundColor:colors.soft}}><Txt bold>{t('الدقة مش مضمونة 100٪','Accuracy is not guaranteed')}</Txt><Txt size={13}>{t('دي وسيلة مساعدة لو مش عارف اتجاه القبلة. حساس الهاتف، التشويش المغناطيسي، الميل ودقة الموقع ممكن يغيّروا القراءة حتى لو ظهرت المعايرة جيدة. لو عندك اتجاه موثوق في مسجد أو مكانك، اتبعه وتحقق منه.','This is a guide when you do not know Qibla. Sensors, magnetic interference, tilt and location accuracy can affect it even when calibration appears high. Prefer and verify an established direction at your mosque or location.')}</Txt><Txt size={11} muted>{t('الموقع لحساب الاتجاه على جهازك فقط؛ لا نحفظ الإحداثيات ولا نرسلها لخادم زاد. الحساسات تتوقف عند مغادرة الصفحة أو قفل التطبيق.','Direction is calculated on your device; coordinates are neither saved nor sent to ZAD servers. Sensors stop when you leave the page or background the app.')}</Txt></Card>
  </Screen>;
}
