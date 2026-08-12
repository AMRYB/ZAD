export const homeSections=['quran','adhkar','tracker','deeds','tasbih'] as const;
export type HomeSection=typeof homeSections[number];
export interface Personalization {complete:boolean;sections:HomeSection[]}
export const initialPersonalization=():Personalization=>({complete:false,sections:[...homeSections]});
export function validPersonalization(value:unknown):value is Personalization{
  if(!value||typeof value!=='object'||!('complete' in value)||typeof value.complete!=='boolean'||!('sections' in value)||!Array.isArray(value.sections))return false;
  return value.sections.length>0&&new Set(value.sections).size===value.sections.length&&value.sections.every(s=>homeSections.includes(s));
}
