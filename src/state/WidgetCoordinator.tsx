import {useEffect} from 'react';
import {useApp} from './AppContext';
import {esaCity,cityName} from '../data/esa-cities';
import {adhanNative} from '../services/adhan-native';
export function WidgetCoordinator(){
  const {state,dark}=useApp(),city=esaCity(state.adhan.city);
  const payload=JSON.stringify({city:city?.id??'',cityName:city?cityName(city,state.locale):'',locale:state.locale,dark,sura:state.lastRead.sura,aya:state.lastRead.aya});
  useEffect(()=>{adhanNative?.configureWidget(payload);},[payload]);return null;
}
