import data from '../../assets/quran-reference/kfgqpc_hafs_v30.json';
export interface OfficialRecallVerse {id:number;sura_no:number;aya_no:number;aya_text_unicode:string;aya_text_emlaey:string}
const verses=new Map<string,OfficialRecallVerse>(data.map(row=>[`${row.sura_no}:${row.aya_no}`,row]));
export function recallVerse(surah:number,ayah:number){return verses.get(`${surah}:${ayah}`);}
