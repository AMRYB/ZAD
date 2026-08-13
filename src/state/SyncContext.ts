import {createContext,useContext} from 'react';
import type {Profile,SyncResult} from '../core/cloud';
export interface SyncValue {profile:Profile|null;result:SyncResult|null;status:'local'|'syncing'|'synced'|'offline'|'signin'|'conflict'|'remote'|'error';run:()=>Promise<void>;enable:(enabled:boolean)=>Promise<void>;resolveLocal:()=>Promise<void>;resolveRemote:()=>Promise<void>;refresh:()=>Promise<void>}
export const SyncContext=createContext<SyncValue|null>(null);
export function useSync(){const v=useContext(SyncContext);if(!v)throw new Error('SYNC_PROVIDER_MISSING');return v;}
