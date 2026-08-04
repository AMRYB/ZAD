export interface Point {x:number;y:number}
export interface ReaderTransform {zoom:number;x:number;y:number}
export interface GestureBounds {width:number;height:number;pageWidth:number;pageHeight:number}
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const center=(points:readonly Point[]):Point=>points.length>1?{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2}:points[0];
const distance=(points:readonly Point[])=>points.length>1?Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y):0;

export function containTransform(value:ReaderTransform,bounds:GestureBounds):ReaderTransform{
  const zoom=clamp(value.zoom,1,3);
  const x=Math.max(0,(bounds.pageWidth*zoom-bounds.width)/2);
  const y=Math.max(0,(bounds.pageHeight*zoom-bounds.height)/2);
  return {zoom,x:clamp(value.x,-x,x),y:clamp(value.y,-y,y)};
}

// A cancelled gesture, a pinch, or a pan inside an enlarged page cannot turn a page.
export function swipePage(dx:number,dy:number,width:number,rtl:boolean,page:number,blocked=false):number{
  if(blocked||Math.abs(dx)<Math.max(72,width*.24)||Math.abs(dx)<Math.abs(dy)*1.4)return 0;
  const delta=(dx>0?1:-1)*(rtl?1:-1);
  return page+delta>=1&&page+delta<=604?delta:0;
}

export class ReaderGesture {
  value:ReaderTransform={zoom:1,x:0,y:0};
  dragX=0;
  private bounds:GestureBounds={width:0,height:0,pageWidth:0,pageHeight:0};
  private anchor:ReaderTransform=this.value;
  private start:Point={x:0,y:0};
  private first:Point=this.start;
  private last:Point=this.start;
  private gap=0;
  private count=0;
  private blocked=false;
  private moved=false;

  configure(bounds:GestureBounds,zoom=1){
    this.bounds=bounds;this.value=containTransform({zoom,x:0,y:0},bounds);this.count=0;this.dragX=0;
  }
  begin(points:readonly Point[]){
    if(!points.length)return;
    this.blocked=points.length>1||this.value.zoom>1.02;this.moved=false;this.dragX=0;
    this.first=center(points);this.last=this.first;this.rebase(points);
  }
  private rebase(points:readonly Point[]){
    this.count=points.length;this.anchor={...this.value};this.start=center(points);this.gap=distance(points);
    if(points.length>1){this.blocked=true;this.dragX=0;}
  }
  shouldCapture(points:readonly Point[]){
    if(!points.length)return false;
    if(points.length>1)return true;
    const p=center(points),dx=p.x-this.first.x,dy=p.y-this.first.y;
    return Math.hypot(dx,dy)>9&&(this.value.zoom>1.02||Math.abs(dx)>Math.abs(dy)*1.2||this.bounds.pageHeight>this.bounds.height+1);
  }
  update(points:readonly Point[]){
    if(!points.length)return this.value;
    if(points.length!==this.count){this.rebase(points);return this.value;}
    const p=center(points);this.last=p;
    if(Math.hypot(p.x-this.first.x,p.y-this.first.y)>6||points.length>1)this.moved=true;
    if(points.length>1){
      const zoom=clamp(this.anchor.zoom*distance(points)/Math.max(1,this.gap),1,3),ratio=zoom/this.anchor.zoom;
      // Keep the same source pixel under the moving pinch midpoint.
      this.value=containTransform({zoom,
        x:p.x-this.bounds.width/2-(this.start.x-this.bounds.width/2-this.anchor.x)*ratio,
        y:p.y-this.bounds.height/2-(this.start.y-this.bounds.height/2-this.anchor.y)*ratio},this.bounds);
    }else{
      this.value=containTransform({...this.value,x:this.anchor.x+p.x-this.start.x,y:this.anchor.y+p.y-this.start.y},this.bounds);
      if(!this.blocked)this.dragX=clamp(p.x-this.first.x,-this.bounds.width,this.bounds.width);
    }
    return this.value;
  }
  finish(rtl:boolean,page:number,cancelled=false){
    const delta=swipePage(this.last.x-this.first.x,this.last.y-this.first.y,this.bounds.width,rtl,page,this.blocked||cancelled);
    const moved=this.moved;this.count=0;this.dragX=0;
    return {delta,moved};
  }
}

// Both lateral directions cycle cards. Vertical movement belongs to the child controls.
export function sidewaysCardDrag(dx:number,dy:number,released=false){
  return Math.abs(dx)>(released?64:9)&&Math.abs(dx)>Math.abs(dy)*1.35;
}
