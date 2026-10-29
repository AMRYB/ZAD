/** One deliberate single-finger pull yields at most one count; taps remain Pressable's job. */
export class TasbihPull {
  private cancelled=false;
  private distance=0;
  direction:1|-1=1;
  progress=0;
  begin(){this.cancelled=false;this.distance=0;this.progress=0;this.direction=1;}
  capture(dx:number,dy:number,touches:number){return touches>1||touches===1&&(Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)*1.15||dy>10&&dy>Math.abs(dx)*1.4);}
  update(dx:number,dy:number,touches:number){
    if(touches>1)this.cancelled=true;
    if(this.cancelled){this.distance=0;this.progress=0;return;}
    const sideways=Math.abs(dx)>Math.abs(dy)*1.15;
    this.distance=sideways?Math.abs(dx):dy>Math.abs(dx)*1.4?Math.max(0,dy):0;
    this.direction=sideways&&dx>0?-1:1;
    this.progress=Math.min(.54,this.distance/120*.55);
  }
  finish(cancelled=false){const result={count:!cancelled&&!this.cancelled&&this.distance>=28,direction:this.direction,progress:this.progress};this.cancelled=true;return result;}
}
