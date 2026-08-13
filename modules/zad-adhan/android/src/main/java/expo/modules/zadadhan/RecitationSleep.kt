package expo.modules.zadadhan

import android.app.ActivityManager
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.SystemClock

object RecitationSleep {
  private const val SERVICE="expo.modules.audio.service.AudioControlsService"
  private fun prefs(c:Context)=c.getSharedPreferences("zad-recitation-sleep-v1",Context.MODE_PRIVATE)
  private fun pending(c:Context,generation:Long)=PendingIntent.getBroadcast(c,71080,Intent(c,RecitationSleepReceiver::class.java).putExtra("generation",generation),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  @Synchronized fun schedule(c:Context,minutes:Int):Map<String,Any>{
    require(minutes in listOf(0,5,15,30,60))
    val p=prefs(c);val generation=p.getLong("generation",0)+1
    val alarm=c.getSystemService(AlarmManager::class.java);alarm.cancel(pending(c,generation))
    val deadline=if(minutes==0)0L else System.currentTimeMillis()+minutes*60000L
    p.edit().putLong("generation",generation).putLong("deadline",deadline).apply()
    val exact=Build.VERSION.SDK_INT<31||alarm.canScheduleExactAlarms()
    if(minutes>0){val at=SystemClock.elapsedRealtime()+minutes*60000L
      if(exact)alarm.setExactAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP,at,pending(c,generation))
      else alarm.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP,at,pending(c,generation))
    }
    return mapOf("exact" to exact,"deadline" to deadline)
  }
  fun deliver(c:Context,generation:Long){
    val p=prefs(c);if(generation!=p.getLong("generation",0)||p.getLong("deadline",0)==0L)return
    p.edit().putLong("deadline",0).apply()
    // Only the already-running, app-owned Expo media service may be paused. Never send a global media key.
    @Suppress("DEPRECATION") val running=c.getSystemService(ActivityManager::class.java).getRunningServices(Int.MAX_VALUE).any {it.service.className==SERVICE&&it.service.packageName==c.packageName}
    if(running)try{c.startService(Intent().setClassName(c.packageName,SERVICE).setAction("expo.modules.audio.action.PAUSE"))}catch(_:IllegalStateException){}
  }
}
class RecitationSleepReceiver:BroadcastReceiver(){override fun onReceive(c:Context,i:Intent){RecitationSleep.deliver(c,i.getLongExtra("generation",-1))}}
