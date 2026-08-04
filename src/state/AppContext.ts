import {createContext,useContext} from 'react';
import type {Action,State} from '../core/model';
import type {palette} from '../ui/theme';
export interface AppContextValue {
  state:State;dispatch:(action:Action)=>void;colors:typeof palette.light|typeof palette.dark;
  rtl:boolean;dark:boolean;t:(ar:string,en:string)=>string;saving:boolean;saveError:boolean;
  retrySave:()=>void;replaceState:(state:State)=>void;restoreEpoch:number;
}
// Keep context identity independent from Fast Refresh of the provider component.
export const AppContext=createContext<AppContextValue|null>(null);
export function useApp():AppContextValue{
  const value=useContext(AppContext);if(!value)throw new Error('APP_PROVIDER_MISSING');return value;
}
