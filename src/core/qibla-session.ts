/** Permission dialogs may temporarily hide the activity before the user grants access. */
export class QiblaSession {
  private generation=0;
  private prompt:number|null=null;
  begin(){return ++this.generation;}
  valid(token:number){return token===this.generation;}
  cancel(){this.generation++;}
  requestingPermission(token:number){if(this.valid(token))this.prompt=token;}
  permissionComplete(token:number){if(this.prompt===token)this.prompt=null;}
  pauseForAppState(){if(this.prompt===this.generation)return false;this.cancel();return true;}
}
