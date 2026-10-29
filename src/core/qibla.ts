import geo from 'geographiclib-geodesic';
/** Fixed reference point at the Kaaba; all calculations run locally on WGS84. */
export const KAABA={latitude:21.422487,longitude:39.826206} as const;
export function degrees(value:number){return ((value%360)+360)%360;}
export function angleDelta(target:number,current:number){return ((target-current+540)%360+360)%360-180;}
export function qiblaDirection(latitude:number,longitude:number){
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)throw new Error('INVALID_COORDINATES');
  const result=geo.Geodesic.WGS84.Inverse(latitude,longitude,KAABA.latitude,KAABA.longitude);
  if(!Number.isFinite(result.azi1)||!Number.isFinite(result.s12))throw new Error('DIRECTION_UNAVAILABLE');
  return {bearing:degrees(result.azi1!),distance:result.s12!};
}
export function reliableQibla({accuracy,compass,trueHeading,distance,mocked,age}:{accuracy:number|null;compass:number;trueHeading:number;distance:number;mocked:boolean;age:number}){
  return Number.isFinite(trueHeading)&&trueHeading>=0&&trueHeading<360&&compass>=3&&accuracy!==null&&accuracy>=0&&accuracy<=100&&distance>Math.max(50,accuracy*5)&&distance<19990000&&!mocked&&age>=0&&age<60000;
}
