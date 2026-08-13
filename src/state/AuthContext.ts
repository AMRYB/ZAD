import {createContext,useContext} from 'react';
import type {Session} from '@supabase/supabase-js';
export interface AuthValue {ready:boolean;session:Session|null;owner:string|null;error:boolean;signOut:(expectedOwner?:string)=>Promise<void>}
export const AuthContext=createContext<AuthValue|null>(null);
export function useAuth(){const v=useContext(AuthContext);if(!v)throw new Error('AUTH_PROVIDER_MISSING');return v;}
