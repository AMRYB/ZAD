import {ProfileStore} from '../core/cloud';
import {readProfile,writeProfile} from '../storage/repository';
export const profiles=new ProfileStore({read:readProfile,write:writeProfile});
