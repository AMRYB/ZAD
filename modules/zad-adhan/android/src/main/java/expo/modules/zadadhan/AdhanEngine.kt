package expo.modules.zadadhan

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.job.JobInfo
import android.app.job.JobScheduler
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.media.AudioManager
import android.os.Build
import androidx.core.app.NotificationManagerCompat
import org.json.JSONArray
import org.json.JSONObject

object AdhanEngine {
  const val REMINDER_CHANNEL="zad-prayer-reminders-v1"
  const val PLAYBACK_CHANNEL="zad-adhan-playback-v1"
  const val REFRESH_JOB=71031
  private const val PREFS="zad-adhan-v1"
  private val lock=Any()
  fun prefs(c:Context)=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE)
  fun config(c:Context)=JSONObject(prefs(c).getString("config","{}")!!)
  fun exact(c:Context)=Build.VERSION.SDK_INT<31||c.getSystemService(AlarmManager::class.java).canScheduleExactAlarms()
  fun notifications(c:Context):Boolean {
    if(!NotificationManagerCompat.from(c).areNotificationsEnabled())return false
    if(Build.VERSION.SDK_INT>=26){val m=c.getSystemService(NotificationManager::class.java);return listOf(REMINDER_CHANNEL,PLAYBACK_CHANNEL).all { m.getNotificationChannel(it)?.importance!=NotificationManager.IMPORTANCE_NONE }}
    return true
  }
  fun channels(c:Context){if(Build.VERSION.SDK_INT>=26){val m=c.getSystemService(NotificationManager::class.java);val en=config(c).optString("locale")=="en";m.createNotificationChannel(NotificationChannel(REMINDER_CHANNEL,if(en)"Prayer reminders" else "تذكير الصلاة",NotificationManager.IMPORTANCE_DEFAULT));m.createNotificationChannel(NotificationChannel(PLAYBACK_CHANNEL,if(en)"Adhan playback" else "تشغيل الأذان",NotificationManager.IMPORTANCE_LOW).apply { setSound(null,null) })}}
  private fun pending(c:Context,event:JSONObject,flags:Int=PendingIntent.FLAG_UPDATE_CURRENT):PendingIntent? {
    val intent=Intent(c,AdhanAlarmReceiver::class.java).setAction("${c.packageName}.ADHAN").setData(Uri.parse("zad-adhan://alarm/"+Uri.encode(event.getString("id")))).putExtra("event",event.toString())
    return PendingIntent.getBroadcast(c,0,intent,flags or PendingIntent.FLAG_IMMUTABLE)
  }
  private fun cancel(c:Context){val alarms=c.getSystemService(AlarmManager::class.java);val events=JSONArray(prefs(c).getString("alarms","[]")!!);for(i in 0 until events.length()){val p=pending(c,events.getJSONObject(i),PendingIntent.FLAG_NO_CREATE);if(p!=null){alarms.cancel(p);p.cancel()}};prefs(c).edit().putString("alarms","[]").apply()}
  fun setSettings(c:Context,settings:String):Map<String,Any> {
    val next=JSONObject(settings);val city=next.optString("city");require(city.length<=80);require(!next.getBoolean("enabled")||city.isNotEmpty()&&city!="null")
    synchronized(lock){
      val old=config(c);if(old.optString("city")!=city||old.optBoolean("enabled")!=next.getBoolean("enabled")||old.optBoolean("reminder",true)!=next.getBoolean("reminder")){
        cancel(c);c.stopService(Intent(c,AdhanPlaybackService::class.java));prefs(c).edit().putLong("generation",prefs(c).getLong("generation",0)+1).apply()
      }
      prefs(c).edit().putString("config",next.toString()).apply();channels(c);installJob(c)
    }
    return status(c)
  }
  fun configure(c:Context,settings:String):Map<String,Any>{setSettings(c,settings);refresh(c);return status(c)}
  fun installJob(c:Context){val scheduler=c.getSystemService(JobScheduler::class.java)
    if(!config(c).optBoolean("enabled")){scheduler.cancel(REFRESH_JOB);return}
    if(scheduler.getPendingJob(REFRESH_JOB)==null)scheduler.schedule(JobInfo.Builder(REFRESH_JOB,ComponentName(c,AdhanRefreshJob::class.java)).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPeriodic(86400000,21600000).setPersisted(true).build())
  }
  fun refresh(c:Context){
    val snapshot=config(c);if(!snapshot.optBoolean("enabled"))return
    val generation=prefs(c).getLong("generation",0);val city=snapshot.getString("city");val month=EsaParser.today().take(7)
    var error=""
    try{EsaClient.ensureAudio(c)}catch(_:Exception){error="AUDIO_UNAVAILABLE"}
    try{EsaClient.month(c,city,month)}catch(_:Exception){error="ESA_UNAVAILABLE"}
    val next=EsaParser.nextMonth(month)
    // The official monthly form has no year selector; never relabel last year's January.
    if(next.take(4)==month.take(4)){try{EsaClient.month(c,city,next)}catch(_:Exception){if(error.isEmpty())error="ESA_NEXT_MONTH_UNAVAILABLE"}}
    synchronized(lock){if(generation!=prefs(c).getLong("generation",0)||config(c).optString("city")!=city||!config(c).optBoolean("enabled"))return
      prefs(c).edit().putString("error",error).apply();replan(c)
    }
  }
  fun replan(c:Context){synchronized(lock){
    cancel(c);val settings=config(c)
    if(!settings.optBoolean("enabled")||!exact(c)||!notifications(c))return
    val city=settings.getString("city");val now=System.currentTimeMillis();val month=EsaParser.today().take(7);val events=JSONArray();val generation=prefs(c).getLong("generation",0)
    for(key in listOf(month,EsaParser.nextMonth(month))){val data=EsaClient.cached(c,city,key)?:continue;val days=data.getJSONArray("days")
      for(i in 0 until days.length()){val day=days.getJSONObject(i);val date=day.getString("date");val times=day.getJSONObject("times")
        for(prayer in EsaParser.keys.filter { it!="sunrise" }){val at=EsaParser.epoch(date,times.getString(prayer));if(at>now+14*86400000L)continue
          for(reminder in if(settings.optBoolean("reminder",true))listOf(false,true) else listOf(false)){val trigger=at-if(reminder)600000 else 0;if(trigger<=now)continue
            val id="$city:$date:$prayer:$reminder";events.put(JSONObject().put("id",id).put("at",trigger).put("date",date).put("city",city).put("prayer",prayer).put("reminder",reminder).put("generation",generation))
          }
        }
      }
    }
    // Persist first so a crash cannot leave untracked PendingIntents.
    prefs(c).edit().putString("alarms",events.toString()).commit()
    try{val manager=c.getSystemService(AlarmManager::class.java);for(i in 0 until events.length()){val event=events.getJSONObject(i);manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,event.getLong("at"),requireNotNull(pending(c,event)))}}
    catch(_:SecurityException){cancel(c);prefs(c).edit().putString("error","EXACT_ALARM_DENIED").apply()}
  }}
  fun validEvent(c:Context,event:JSONObject):Boolean {val settings=config(c);return settings.optBoolean("enabled")&&event.optLong("generation",-1)==prefs(c).getLong("generation",0)&&event.optString("city")==settings.optString("city")&&System.currentTimeMillis()-event.getLong("at") in -1000L..120000L}
  fun status(c:Context):Map<String,Any>{val events=JSONArray(prefs(c).getString("alarms","[]")!!);val now=System.currentTimeMillis();val audio=c.getSystemService(AudioManager::class.java);val future=(0 until events.length()).map {events.getJSONObject(it)}.filter { it.optLong("at")>now };return mapOf("available" to true,"exact" to exact(c),"notifications" to notifications(c),"audio" to EsaClient.audioFile(c).exists(),"count" to future.size,"until" to (future.maxByOrNull {it.getLong("at")}?.optString("date")?:""),"error" to prefs(c).getString("error","")!!,"playing" to AdhanPlaybackService.playing,"enabled" to config(c).optBoolean("enabled"),"alarmVolume" to audio.getStreamVolume(AudioManager.STREAM_ALARM),"alarmMuted" to audio.isStreamMute(AudioManager.STREAM_ALARM))}
  fun test(c:Context){synchronized(lock){require(exact(c)&&notifications(c)&&EsaClient.audioFile(c).exists()&&config(c).optBoolean("enabled"));val now=System.currentTimeMillis();val events=JSONArray(prefs(c).getString("alarms","[]")!!)
    for(reminder in listOf(true,false)){val event=JSONObject().put("id","test:$reminder").put("at",now+if(reminder)30000 else 60000).put("date",EsaParser.today()).put("city",config(c).getString("city")).put("prayer","test").put("reminder",reminder).put("generation",prefs(c).getLong("generation",0));events.put(event)}
    prefs(c).edit().putString("alarms",events.toString()).commit();val manager=c.getSystemService(AlarmManager::class.java);for(i in events.length()-2 until events.length()){val event=events.getJSONObject(i);manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,event.getLong("at"),requireNotNull(pending(c,event)))}
  }}
}
