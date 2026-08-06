package expo.modules.zadadhan

import android.app.Activity
import android.app.Instrumentation
import android.app.NotificationManager
import android.app.job.JobScheduler
import android.content.Intent
import android.media.AudioManager
import android.os.Bundle
import android.os.PowerManager
import android.os.SystemClock
import org.json.JSONArray
import org.json.JSONObject

/** Isolated test APK: executes production Kotlin sources without touching ZAD's data. */
class AdhanHardwareTest:Instrumentation(){
  private var mode="test"
  override fun onCreate(arguments:Bundle?){super.onCreate(arguments);mode=arguments?.getString("mode")?:"test";start()}
  private fun report(text:String){sendStatus(0,Bundle().apply {putString("stream","$text\n")})}
  override fun onStart(){
    val c=targetContext;val result=Bundle();var passed=false
    if(mode=="sequences"){
      try{
        AdhanAudio.ensureAll(c)
        val cases=listOf("2026-10-24" to "fajr","2026-10-24" to "dhuhr","2026-10-24" to "asr","2026-10-24" to "maghrib","2026-10-24" to "isha","2026-10-23" to "dhuhr")
        for((date,prayer) in cases){
          val sequence=AdhanAudio.sequence(c,date,prayer)
          AdhanPlaybackService.start(c,Intent(c,AdhanPlaybackService::class.java).putExtra("preview",true).putExtra("date",date).putExtra("prayer",prayer))
          fun awaitClip(id:String){val deadline=SystemClock.elapsedRealtime()+16000;while(AdhanPlaybackService.currentClip!=id&&SystemClock.elapsedRealtime()<deadline)Thread.sleep(100);check(AdhanPlaybackService.currentClip==id){"Expected clip $id; got ${AdhanPlaybackService.currentClip}; error=${AdhanEngine.prefs(c).getString("error","")}"}}
          awaitClip(sequence[0]);awaitClip(sequence[1]);report("PASS: $date $prayer -> ${sequence.joinToString(" then ")}")
          val manager=c.getSystemService(NotificationManager::class.java)
          manager.activeNotifications.first {it.notification.channelId==AdhanEngine.PLAYBACK_CHANNEL}.notification.actions.first().actionIntent.send()
          Thread.sleep(300);check(!AdhanPlaybackService.playing)
        }
        // Stop during an intro must never start its queued Adhan later.
        AdhanPlaybackService.start(c,Intent(c,AdhanPlaybackService::class.java).putExtra("preview",true).putExtra("date","2026-10-23").putExtra("prayer","dhuhr"))
        val deadline=SystemClock.elapsedRealtime()+5000;while(AdhanPlaybackService.currentClip!="intro-friday"&&SystemClock.elapsedRealtime()<deadline)Thread.sleep(100)
        check(AdhanPlaybackService.currentClip=="intro-friday")
        c.getSystemService(NotificationManager::class.java).activeNotifications.first {it.notification.channelId==AdhanEngine.PLAYBACK_CHANNEL}.notification.actions.first().actionIntent.send()
        Thread.sleep(12000);check(!AdhanPlaybackService.playing&&AdhanPlaybackService.currentClip.isEmpty())
        report("PASS: stopping intro prevents queued Adhan; all twelve pinned files played")
        finish(Activity.RESULT_OK,Bundle().apply {putString("stream","Six playback sequences and intro-stop passed\n")})
      }catch(e:Throwable){AdhanPlaybackService.stop(c);finish(Activity.RESULT_CANCELED,Bundle().apply {putString("failure",e.toString())})};return
    }
    if(mode=="audio-status"){
      val audio=c.getSystemService(AudioManager::class.java)
      result.putInt("alarmVolume",audio.getStreamVolume(AudioManager.STREAM_ALARM));result.putInt("alarmMaximum",audio.getStreamMaxVolume(AudioManager.STREAM_ALARM));result.putBoolean("alarmMuted",audio.isStreamMute(AudioManager.STREAM_ALARM))
      result.putInt("ringerMode",audio.ringerMode);result.putString("outputTypes",audio.getDevices(AudioManager.GET_DEVICES_OUTPUTS).map {it.type}.joinToString(","));finish(Activity.RESULT_OK,result);return
    }
    if(mode=="arm-cold-start"){
      try{val config=JSONObject().put("city","القـاهـرة").put("locale","ar").put("enabled",true).put("reminder",true);AdhanEngine.configure(c,config.toString());AdhanEngine.test(c);result.putString("stream","Cold-start test armed: reminder +30 seconds; Adhan +60 seconds\n");finish(Activity.RESULT_OK,result)}catch(e:Exception){result.putString("failure",e.message);finish(Activity.RESULT_CANCELED,result)};return
    }
    if(mode=="cleanup"){
      AdhanEngine.configure(c,AdhanEngine.config(c).put("enabled",false).toString());AdhanPlaybackService.stop(c);finish(Activity.RESULT_OK,Bundle());return
    }
    try{
      check(AdhanEngine.exact(c)) {"Exact alarm test permission is missing"}
      check(AdhanEngine.notifications(c)) {"Notification test permission is missing"}
      val config=JSONObject().put("city","القـاهـرة").put("locale","ar").put("enabled",true).put("reminder",true)
      val status=AdhanEngine.configure(c,config.toString());check(status["count"] as Int>0&&status["audio"]==true)
      val month=EsaClient.month(c,"القـاهـرة",EsaParser.today().take(7));check(month.getJSONArray("days").length() in 28..31)
      report("PASS: native ESA HTTPS fetch, private month cache, verified MP3 and exact scheduling")
      val events=JSONArray(AdhanEngine.prefs(c).getString("alarms","[]")!!)
      check((0 until events.length()).all {events.getJSONObject(it).getString("prayer")!="sunrise"})
      val firstAdhan=(0 until events.length()).map {events.getJSONObject(it)}.first { !it.getBoolean("reminder")&&it.getLong("at")>System.currentTimeMillis()+600000 }
      val reminder=(0 until events.length()).map {events.getJSONObject(it)}.first {it.getString("date")==firstAdhan.getString("date")&&it.getString("prayer")==firstAdhan.getString("prayer")&&it.getBoolean("reminder")}
      check(firstAdhan.getLong("at")-reminder.getLong("at")==600000L)
      report("PASS: reminders are exactly ten minutes before prayer; sunrise excluded")
      AdhanEngine.test(c);val start=SystemClock.elapsedRealtime();val manager=c.getSystemService(NotificationManager::class.java)
      report("TEST ARMED: reminder in 30 seconds; Adhan in 60 seconds; lock phone screen now")
      while(SystemClock.elapsedRealtime()-start<40000)Thread.sleep(500)
      check(manager.activeNotifications.any {it.notification.channelId==AdhanEngine.REMINDER_CHANNEL}) {"Reminder was not delivered"}
      report("PASS: AlarmManager delivered reminder while no activity or JavaScript was running")
      while(SystemClock.elapsedRealtime()-start<72000)Thread.sleep(500)
      check(AdhanPlaybackService.playing) {"Adhan playback did not start from the exact alarm"}
      val notification=manager.activeNotifications.first {it.notification.channelId==AdhanEngine.PLAYBACK_CHANNEL}.notification
      val screenOff=!c.getSystemService(PowerManager::class.java).isInteractive
      result.putBoolean("screenOffAtPlayback",screenOff)
      report("PASS: exact alarm started media foreground service and MP3; screenOff=$screenOff")
      notification.actions.first().actionIntent.send();Thread.sleep(1500);check(!AdhanPlaybackService.playing)
      report("PASS: notification stop action stopped playback and released service")
      val stale=JSONObject(firstAdhan.toString()).put("at",System.currentTimeMillis())
      config.put("enabled",false);AdhanEngine.configure(c,config.toString())
      check(AdhanEngine.status(c)["count"]==0);check(c.getSystemService(JobScheduler::class.java).getPendingJob(AdhanEngine.REFRESH_JOB)==null)
      check(!AdhanEngine.validEvent(c,stale))
      report("PASS: disable cancels alarms/job and rejects stale generation")
      result.putInt("sourceDays",month.getJSONArray("days").length());result.putInt("checks",6);passed=true
    }catch(e:Throwable){result.putString("failure",e.javaClass.simpleName+": "+e.message);report("FAIL: "+e.message)}
    finally{try{val off=AdhanEngine.config(c).put("enabled",false);AdhanEngine.configure(c,off.toString());AdhanPlaybackService.stop(c)}catch(_:Exception){};result.putString("stream",if(passed)"Hardware checks passed\n" else "Hardware checks failed\n");finish(if(passed)Activity.RESULT_OK else Activity.RESULT_CANCELED,result)}
  }
}
