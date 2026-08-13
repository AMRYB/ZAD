import React from 'react';
import {router} from 'expo-router';
import {useAuth} from '../../state/AuthContext';
import {useApp} from '../../state/AppContext';
import {Button,Card,Screen,Txt} from '../../ui/components';
export default function AuthCallback(){const {session,error}=useAuth(),{t}=useApp();return <Screen title={t('تسجيل الدخول','Signing in')}><Card><Txt>{session?t('تم تسجيل الدخول بأمان. اختر إعدادات حسابك والمزامنة.','Signed in securely. Choose your account and sync settings.'):error?t('تعذّر إكمال الرابط. افتحه على الجهاز الذي طلبته منه، أو اطلب رابطًا جديدًا.','The link could not be completed. Open it on the device that requested it, or request a new one.'):t('جارٍ التحقق من رابط الدخول…','Verifying your sign-in link…')}</Txt><Button label={t('حسابي ونسختي','My account & backup')} onPress={()=>router.replace('/account')}/></Card></Screen>;}
