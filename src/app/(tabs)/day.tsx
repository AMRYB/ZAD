import {useLocalSearchParams} from 'expo-router';
import {Day} from '../../screens/Day';
export default function DayRoute(){const {date}=useLocalSearchParams<{date?:string}>();return <Day key={date??'today'} initialDate={date}/>;}
