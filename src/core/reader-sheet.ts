export interface SheetBounds {min:number;max:number;initial:number}
export function sheetBounds(viewport:number,topInset=0):SheetBounds{
  const max=Math.max(160,viewport-Math.max(topInset,16));
  return {max,min:Math.min(max,Math.max(180,viewport*.38)),initial:Math.min(max,Math.max(220,viewport*.72))};
}
export function sheetDragHeight(start:number,dy:number,bounds:SheetBounds){
  return Math.min(bounds.max,Math.max(0,start-dy));
}
export function sheetReleaseHeight(height:number,velocityY:number,bounds:SheetBounds,cancelled=false){
  if(!cancelled&&(height<bounds.min*.62||(height<bounds.min&&velocityY>.9)))return 0;
  return Math.min(bounds.max,Math.max(bounds.min,height));
}
export function shouldDragSheet(dx:number,dy:number,scrollY:number,height:number,max:number,handle=false){
  return Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)*1.2&&(handle||(scrollY<=1&&(dy>0||height<max-1)));
}
