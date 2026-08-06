package expo.modules.zadadhan

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import org.json.JSONObject

/** Shell-only receiver in the disposable test APK, never included in ZAD. */
class AdhanColdStartTest:BroadcastReceiver(){override fun onReceive(c:Context,intent:Intent){
  if(intent.getBooleanExtra("cleanup",false)){AdhanEngine.setSettings(c,AdhanEngine.config(c).put("enabled",false).toString());AdhanPlaybackService.stop(c);return}
  AdhanEngine.setSettings(c,JSONObject().put("city","القـاهـرة").put("locale","ar").put("enabled",true).put("reminder",true).toString())
  AdhanEngine.replan(c);AdhanEngine.test(c)
}}
