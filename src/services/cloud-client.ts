import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import {authStorage} from './auth-storage';
import {ensurePkceCrypto} from './pkce-crypto';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL??'',key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'';
export const cloudConfigured=/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)&&/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)&&ensurePkceCrypto();
export const cloudConfig={url,key};
export const cloudClient=cloudConfigured?createClient(url,key,{auth:{storage:authStorage,storageKey:'zad-auth-session-v1',autoRefreshToken:true,persistSession:true,detectSessionInUrl:false,flowType:'pkce'},global:{fetch:async(input,init)=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);try{return await fetch(input,{...init,signal:controller.signal});}finally{clearTimeout(timer);}}}}):null;
