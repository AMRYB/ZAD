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
  const val MUTE_PRAYER="zad.adhan.MUTE_PRAYER"
  const val UNMUTE_PRAYER="zad.adhan.UNMUTE_PRAYER"
  private const val REMINDER_ID=71034
  private fun tag(event:JSONObject)="reminder:"+AdhanEngine.audioKey(event)
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
    val muted=AdhanEngine.muted(c,event);val at=AdhanEngine.prayerAt(event)
    val action=if(muted)UNMUTE_PRAYER else MUTE_PRAYER
    val control=PendingIntent.getBroadcast(c,REMINDER_ID,Intent(c,AdhanReminderActionReceiver::class.java).setAction(action)
      .setData(Uri.parse("zad-adhan://reminder/"+Uri.encode(AdhanEngine.audioKey(event))+"/$action")).putExtra("event",event.toString()),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val heading=if(event.optBoolean("test")){if(en)"Adhan test in 30 seconds" else "اختبار الأذان بعد 30 ثانية"}else if(en)"${title(c,event)} in 10 minutes" else "باقي 10 دقائق على ${title(c,event)}"
    val detail=EsaParser.normalize(event.getString("city"))+(if(muted){if(en)" · This Adhan is muted" else " · أذان الصلاة دي مكتوم"}else "")
    val n=NotificationCompat.Builder(c,AdhanEngine.REMINDER_CHANNEL).setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle(heading)
      .setContentText(detail).setContentIntent(open(c)).setAutoCancel(true).setOnlyAlertOnce(true)
      .setWhen(at).setShowWhen(true).setUsesChronometer(true).setChronometerCountDown(true).setTimeoutAfter((at-System.currentTimeMillis()).coerceAtLeast(1))
      .setCategory(NotificationCompat.CATEGORY_REMINDER).setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
      .addAction(if(muted)android.R.drawable.ic_lock_silent_mode_off else android.R.drawable.ic_lock_silent_mode,
        if(muted){if(en)"Unmute this Adhan" else "إلغاء كتم الأذان"}else{if(en)"Mute this Adhan" else "كتم أذان الصلاة دي"},control).build()
    if(AdhanEngine.notifications(c))try{NotificationManagerCompat.from(c).notify(tag(event),REMINDER_ID,n)}catch(_:SecurityException){}
  }
  fun dismissReminder(c:Context,event:JSONObject)=NotificationManagerCompat.from(c).cancel(tag(event),REMINDER_ID)
  fun mutedPrayer(c:Context,event:JSONObject){
    val en=AdhanEngine.config(c).optString("locale")=="en"
    val n=NotificationCompat.Builder(c,AdhanEngine.PLAYBACK_CHANNEL).setSmallIcon(android.R.drawable.ic_lock_silent_mode)
      .setContentTitle(title(c,event)).setContentText(if(en)"This Adhan was muted. The next prayer will play normally." else "أذان الصلاة دي مكتوم. الصلاة الجاية بصوتها عادي.")
      .setContentIntent(open(c)).setAutoCancel(true).setSilent(true).setCategory(NotificationCompat.CATEGORY_REMINDER).setVisibility(NotificationCompat.VISIBILITY_PRIVATE).build()
    try{NotificationManagerCompat.from(c).notify("muted:"+AdhanEngine.audioKey(event),71035,n)}catch(_:SecurityException){}
  }
}
class AdhanReminderActionReceiver:BroadcastReceiver(){override fun onReceive(context:Context,intent:Intent){
  if(intent.action !in listOf(AdhanNotification.MUTE_PRAYER,AdhanNotification.UNMUTE_PRAYER))return
  try{val event=JSONObject(intent.getStringExtra("event")?:return)
    if(AdhanEngine.setPrayerMuted(context,event,intent.action==AdhanNotification.MUTE_PRAYER))AdhanNotification.reminder(context,event)
  }catch(_:Exception){/* Expired or malformed controls must not affect another prayer. */}
}}
class AdhanAlarmReceiver:BroadcastReceiver(){override fun onReceive(context:Context,intent:Intent){
  try{
    val event=JSONObject(intent.getStringExtra("event")?:return)
    if(!AdhanEngine.validEvent(context,event)||!AdhanEngine.notifications(context))return
    AdhanEngine.channels(context)
    if(event.getBoolean("reminder"))AdhanNotification.reminder(context,event)
    else {AdhanNotification.dismissReminder(context,event)
      if(AdhanEngine.muted(context,event))AdhanNotification.mutedPrayer(context,event)
      else AdhanPlaybackService.start(context,Intent(context,AdhanPlaybackService::class.java).putExtra("event",event.toString()))
    }
  }catch(_:Exception){AdhanEngine.prefs(context).edit().putString("error","ALARM_DELIVERY_FAILED").apply()}
}}
class AdhanRestoreReceiver:BroadcastReceiver(){override fun onReceive(context:Context,intent:Intent){
  // Boot restores alarms from saved official times; never starts a media service from BOOT_COMPLETED.
  AdhanEngine.channels(context);AdhanEngine.replan(context);AdhanEngine.installJob(context);DailyReminders.plan(context);ZadWidget.refreshAll(context)
}}
class AdhanRefreshJob:JobService(){
  private val executor=Executors.newSingleThreadExecutor();private var work:Future<*>?=null
  override fun onStartJob(params:JobParameters):Boolean {work=executor.submit {try{AdhanEngine.refresh(applicationContext)}finally{jobFinished(params,false)}};return true}
  override fun onStopJob(params:JobParameters):Boolean {work?.cancel(true);return true}
  override fun onDestroy(){executor.shutdownNow();super.onDestroy()}
}
