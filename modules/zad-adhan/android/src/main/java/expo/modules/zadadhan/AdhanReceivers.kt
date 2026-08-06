package expo.modules.zadadhan

import android.app.PendingIntent
import android.app.job.JobParameters
import android.app.job.JobService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONObject
import java.util.concurrent.Executors
import java.util.concurrent.Future

object AdhanNotification {
  fun title(c:Context,event:JSONObject?):String {
    val en=AdhanEngine.config(c).optString("locale")=="en"
    val key=event?.optString("prayer")?:"test"
    if(key=="dhuhr"&&event!=null&&AdhanSequence.slot(event.getString("date"),key)=="friday")return if(en)"Friday prayer" else "صلاة الجمعة"
    val names=mapOf("fajr" to "الفجر","dhuhr" to "الظهر","asr" to "العصر","maghrib" to "المغرب","isha" to "العشاء")
    return if(key=="test"){if(en)"Adhan preview" else "تجربة الأذان"}else if(en)"${key.replaceFirstChar {it.uppercase()}} prayer" else "صلاة ${names[key]?:""}"
  }
  fun open(c:Context):PendingIntent {
    val intent=Intent(Intent.ACTION_VIEW,Uri.parse("ramadanjourney://adhan")).setPackage(c.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    return PendingIntent.getActivity(c,71032,intent,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  }
  fun reminder(c:Context,event:JSONObject){
    val en=AdhanEngine.config(c).optString("locale")=="en"
    val n=NotificationCompat.Builder(c,AdhanEngine.REMINDER_CHANNEL).setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle(title(c,event))
      .setContentText(if(event.optBoolean("test")){if(en)"Adhan audio test" else "اختبار صوت الأذان"}else if(en)"In 10 minutes · ${EsaParser.normalize(event.getString("city"))}" else "بعد عشر دقائق · ${EsaParser.normalize(event.getString("city"))}")
      .setContentIntent(open(c)).setAutoCancel(true).setCategory(NotificationCompat.CATEGORY_REMINDER).setVisibility(NotificationCompat.VISIBILITY_PRIVATE).build()
    if(AdhanEngine.notifications(c))try{NotificationManagerCompat.from(c).notify(event.getString("id").hashCode(),n)}catch(_:SecurityException){}
  }
}
class AdhanAlarmReceiver:BroadcastReceiver(){override fun onReceive(context:Context,intent:Intent){
  try{
    val event=JSONObject(intent.getStringExtra("event")?:return)
    if(!AdhanEngine.validEvent(context,event)||!AdhanEngine.notifications(context))return
    AdhanEngine.channels(context)
    if(event.getBoolean("reminder"))AdhanNotification.reminder(context,event)
    else AdhanPlaybackService.start(context,Intent(context,AdhanPlaybackService::class.java).putExtra("event",event.toString()))
  }catch(_:Exception){AdhanEngine.prefs(context).edit().putString("error","ALARM_DELIVERY_FAILED").apply()}
}}
class AdhanRestoreReceiver:BroadcastReceiver(){override fun onReceive(context:Context,intent:Intent){
  // Boot restores alarms from saved official times; never starts a media service from BOOT_COMPLETED.
  AdhanEngine.channels(context);AdhanEngine.replan(context);AdhanEngine.installJob(context)
}}
class AdhanRefreshJob:JobService(){
  private val executor=Executors.newSingleThreadExecutor();private var work:Future<*>?=null
  override fun onStartJob(params:JobParameters):Boolean {work=executor.submit {try{AdhanEngine.refresh(applicationContext)}finally{jobFinished(params,false)}};return true}
  override fun onStopJob(params:JobParameters):Boolean {work?.cancel(true);return true}
  override fun onDestroy(){executor.shutdownNow();super.onDestroy()}
}
