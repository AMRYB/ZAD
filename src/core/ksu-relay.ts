import {hilitesUrl,tafsirUrl,translationUrl} from './ksu.ts';
export function relayTarget(params:URLSearchParams):string{
  const operation=params.get('do');
  const keys=operation==='hilites'?['ui','do','mosshaf','t','page']:operation==='tafsir'?['ui','do','author','sura','aya']:['ui','do','tafsir','b_sura','b_aya','e_sura','e_aya','11'];
  for(const key of params.keys())if(!keys.includes(key)||params.getAll(key).length!==1)throw new Error('INVALID_QUERY');
  if(params.get('ui')!=='pc')throw new Error('INVALID_UI');
  const n=(key:string)=>{const text=params.get(key);if(!text||!/^\d+$/.test(text))throw new Error('INVALID_NUMBER');return Number(text);};
  if(operation==='hilites'&&params.get('mosshaf')==='hafs'&&params.get('t')==='28')return hilitesUrl(n('page'));
  if(operation==='tafsir')return tafsirUrl(params.get('author')??'',n('sura'),n('aya'));
  if(operation==='tarjama'&&params.get('tafsir')==='ar_mu')return translationUrl([n('b_sura'),n('b_aya')],[n('e_sura'),n('e_aya')]);
  throw new Error('UNSUPPORTED_KSU_OPERATION');
}
