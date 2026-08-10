export const MUSHAF_WIDTH=456;
export const MUSHAF_HEIGHT=672;
export type PageFit='page'|'width';

// Image and every ayah rectangle share this single, undistorted coordinate plane.
export function pageFrame(availableWidth:number,availableHeight:number,fit:PageFit,zoom=1){
  if(!Number.isFinite(availableWidth)||!Number.isFinite(availableHeight)||availableWidth<=0||availableHeight<=0)return {width:0,height:0,scale:0};
  if(!Number.isFinite(zoom)||zoom<1||zoom>3)throw new RangeError('INVALID_READER_ZOOM');
  const scale=(fit==='page'?Math.min(availableWidth/MUSHAF_WIDTH,availableHeight/MUSHAF_HEIGHT):availableWidth/MUSHAF_WIDTH)*zoom;
  return {width:MUSHAF_WIDTH*scale,height:MUSHAF_HEIGHT*scale,scale};
}
