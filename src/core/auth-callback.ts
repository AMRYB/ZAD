export function authCallbackCode(value:string,webOrigin?:string):string|null{
  try{
    const url=new URL(value);
    const native=url.protocol==='ramadanjourney:'&&url.hostname==='auth'&&url.pathname==='/callback';
    const web=!!webOrigin&&url.origin===webOrigin&&url.pathname==='/auth/callback';
    if((!native&&!web)||url.username||url.password||url.hash||url.searchParams.getAll('code').length!==1)return null;
    const code=url.searchParams.get('code')!;return /^[a-zA-Z0-9_-]{8,200}$/.test(code)?code:null;
  }catch{return null;}
}
export function authCallbackFlow(value:string):string|undefined{try{const params=new URL(value).searchParams;const id=params.get('sb_flow_id');return params.getAll('sb_flow_id').length===1&&id&&/^[a-zA-Z0-9_-]{8,64}$/.test(id)?id:undefined;}catch{return undefined;}}
