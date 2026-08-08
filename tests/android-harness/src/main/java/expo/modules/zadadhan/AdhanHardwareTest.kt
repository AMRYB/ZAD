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
    if(mode=="personal-reminders"){
      val manager=c.getSystemService(NotificationManager::class.java);val preferences=c.getSharedPreferences("zad-personal-reminders-v1",android.content.Context.MODE_PRIVATE)
      fun awaitState(label:String,condition:()->Boolean){val until=SystemClock.elapsedRealtime()+5000;while(!condition()&&SystemClock.elapsedRealtime()<until)Thread.sleep(100);check(condition()){label};report("PASS: $label")}
      var failure:Throwable?=null
      val prayerConfig=AdhanEngine.prefs(c).getString("config",null)
      try{
        val settings=JSONObject().put("locale","ar").put("entries",JSONArray().apply {for((i,id) in DailyReminderPolicy.ids.withIndex())put(JSONObject().put("id",id).put("time",listOf("07:00","18:00","22:00","09:00","15:00","20:00")[i]))})
        check(DailyReminders.configure(c,settings.toString())["count"]==6);DailyReminders.plan(c);check(DailyReminders.status(c)["count"]==6)
        report("PASS: six independent personal reminders scheduled and restored without enabling Adhan")
        DailyReminders.test(c,"deeds");DailyReminders.test(c,"adhkar");DailyReminders.configure(c,settings.toString())
        val end=SystemClock.elapsedRealtime()+45000
        while(SystemClock.elapsedRealtime()<end&&manager.activeNotifications.count {it.notification.channelId==DailyReminders.CHANNEL}<2)Thread.sleep(200)
        val delivered=manager.activeNotifications.filter {it.notification.channelId==DailyReminders.CHANNEL};check(delivered.size==2)
        check(delivered.any {it.notification.extras.getCharSequence(android.app.Notification.EXTRA_TITLE).toString().contains("فرصة لعمل خير")})
        check(delivered.any {it.notification.extras.getCharSequence(android.app.Notification.EXTRA_TITLE).toString().contains("أذكار الصباح")})
        check(delivered.all {it.notification.contentIntent!=null})
        report("PASS: AlarmManager delivered Arabic good-deed and Adhkar notifications with opening actions")
        val id="deeds-0";val at=preferences.getLong("last:$id:true",0);check(at>0);val generation=preferences.getLong("generation",0)
        val duplicate=Intent().putExtra("id",id).putExtra("at",at).putExtra("test",true).putExtra("generation",generation)
        val posted=manager.activeNotifications.first {it.tag==id}.postTime;Thread.sleep(30);DailyReminders.deliver(c,duplicate);check(manager.activeNotifications.first {it.tag==id}.postTime==posted)
        check(DailyReminders.status(c)["count"]==6)
        report("PASS: duplicate delivery ignored; unchanged foreground configuration preserves armed tests")
        DailyReminders.configure(c,settings.put("locale","en").toString());val english=Intent().putExtra("id","adhkar-evening").putExtra("at",System.currentTimeMillis()).putExtra("test",true).putExtra("generation",preferences.getLong("generation",0))
        DailyReminders.deliver(c,english);awaitState("English evening reminder delivered"){manager.activeNotifications.any {it.notification.extras.getCharSequence(android.app.Notification.EXTRA_TITLE).toString().contains("Evening adhkar")}}
        DailyReminders.configure(c,JSONObject().put("locale","ar").put("entries",JSONArray()).toString());check(DailyReminders.status(c)["count"]==0)
        manager.cancelAll();awaitState("own notifications cleared"){manager.activeNotifications.isEmpty()};DailyReminders.deliver(c,duplicate);Thread.sleep(150);check(manager.activeNotifications.isEmpty())
        check(AdhanEngine.prefs(c).getString("config",null)==prayerConfig)
        report("PASS: English labels, disabling cancellation, stale-generation rejection; prayer configuration unchanged")
        report("Screen interactive at end: ${c.getSystemService(PowerManager::class.java).isInteractive}")
      }catch(e:Throwable){failure=e}
      finally{DailyReminders.configure(c,JSONObject().put("locale","ar").put("entries",JSONArray()).toString());manager.cancelAll()}
      finish(if(failure==null)Activity.RESULT_OK else Activity.RESULT_CANCELED,Bundle().apply {if(failure==null)putString("stream","Personal reminders hardware checks passed\n")else putString("failure",failure.stackTraceToString())});return
    }
    if(mode=="notification-controls"){
      val manager=c.getSystemService(NotificationManager::class.java)
      fun awaitState(label:String,timeout:Long=5000,condition:()->Boolean){val deadline=SystemClock.elapsedRealtime()+timeout;while(!condition()&&SystemClock.elapsedRealtime()<deadline)Thread.sleep(100);check(condition()){label};report("PASS: $label")}
      fun playback()=manager.activeNotifications.first {it.notification.channelId==AdhanEngine.PLAYBACK_CHANNEL&&it.notification.actions?.size==2}.notification
      try{
        check(AdhanEngine.exact(c)&&AdhanEngine.notifications(c))
        val config=JSONObject().put("city","القـاهـرة").put("locale","ar").put("enabled",true).put("reminder",true)
        AdhanEngine.configure(c,config.toString());manager.cancelAll()
        val events=JSONArray(AdhanEngine.prefs(c).getString("alarms","[]")!!)
        val alarm=(0 until events.length()).map {events.getJSONObject(it)}.first {!it.getBoolean("reminder")&&it.getLong("at")>System.currentTimeMillis()+600000}
        val reminder=(0 until events.length()).map {events.getJSONObject(it)}.first {it.getBoolean("reminder")&&AdhanEngine.audioKey(it)==AdhanEngine.audioKey(alarm)}
        check(alarm.getLong("at")-reminder.getLong("at")==600000L)
        val now=System.currentTimeMillis()
        val display=JSONObject(reminder.toString()).put("at",now).put("prayerAt",now+600000)
        AdhanNotification.reminder(c,display)
        val actual=manager.activeNotifications.first {it.notification.channelId==AdhanEngine.REMINDER_CHANNEL}.notification
        check(actual.extras.getCharSequence(android.app.Notification.EXTRA_TITLE).toString().contains("10 دقائق"))
        check(actual.`when`==now+600000&&actual.extras.getBoolean(android.app.Notification.EXTRA_SHOW_CHRONOMETER)&&actual.extras.getBoolean(android.app.Notification.EXTRA_CHRONOMETER_COUNT_DOWN))
        check(actual.actions.single().title.toString()=="كتم أذان الصلاة دي")
        AdhanNotification.dismissReminder(c,display)
        report("PASS: real schedule has exactly ten-minute spacing; Arabic reminder title, future countdown and mute action")
        AdhanEngine.test(c,"2026-10-24","isha")
        val tests=JSONArray(AdhanEngine.prefs(c).getString("alarms","[]")!!)
        val testReminder=tests.getJSONObject(tests.length()-2)
        val testPrayer=tests.getJSONObject(tests.length()-1)
        awaitState("AlarmManager delivered test reminder",40000){manager.activeNotifications.any {it.notification.channelId==AdhanEngine.REMINDER_CHANNEL}}
        fun reminderControl()=manager.activeNotifications.first {it.notification.channelId==AdhanEngine.REMINDER_CHANNEL}.notification.actions.single().actionIntent
        reminderControl().send();awaitState("reminder action mutes only its paired prayer"){AdhanEngine.muted(c,testPrayer)}
        check(!AdhanEngine.muted(c,JSONObject(testPrayer.toString()).put("prayer","fajr")))
        check(JSONObject(AdhanEngine.prefs(c).getString("mutedPrayers","{}")!!).has(AdhanEngine.audioKey(testPrayer)))
        reminderControl().send();awaitState("reminder unmute restores its prayer"){!AdhanEngine.muted(c,testPrayer)}
        reminderControl().send();awaitState("reminder can be muted again"){AdhanEngine.muted(c,testPrayer)}
        awaitState("muted alarm delivered a silent prayer notification without starting audio",40000){manager.activeNotifications.any {it.tag?.startsWith("muted:")==true}&&!AdhanPlaybackService.playing}
        check(manager.activeNotifications.none {it.notification.channelId==AdhanEngine.REMINDER_CHANNEL})
        check(!AdhanEngine.setPrayerMuted(c,testReminder,false))
        report("PASS: expired reminder control rejected; persisted mute does not affect another prayer")
        val next=JSONObject(testPrayer.toString()).put("test",false).put("id","next-prayer").put("prayer","asr").put("at",System.currentTimeMillis()).put("prayerAt",System.currentTimeMillis())
        AdhanAlarmReceiver().onReceive(c,Intent().putExtra("event",next.toString()))
        awaitState("next prayer starts normally after one-prayer mute"){AdhanPlaybackService.currentClip=="intro-asr"}
        val audio=c.getSystemService(AudioManager::class.java);val volume=audio.getStreamVolume(AudioManager.STREAM_ALARM)
        val staleMute=playback().actions[1].actionIntent
        staleMute.send();awaitState("playback notification mute action"){AdhanPlaybackService.muted}
        awaitState("mute persists from intro into Adhan",16000){AdhanPlaybackService.currentClip=="husary"&&AdhanPlaybackService.muted}
        playback().actions[1].actionIntent.send();awaitState("playback notification unmute action"){!AdhanPlaybackService.muted}
        check(audio.getStreamVolume(AudioManager.STREAM_ALARM)==volume)
        playback().actions[0].actionIntent.send();awaitState("notification stop releases audio"){!AdhanPlaybackService.playing}
        AdhanPlaybackService.start(c,Intent(c,AdhanPlaybackService::class.java).putExtra("preview",true).putExtra("date","2026-10-24").putExtra("prayer","fajr"))
        awaitState("new preview starts unmuted"){AdhanPlaybackService.currentClip=="intro-fajr"&&!AdhanPlaybackService.muted}
        staleMute.send();Thread.sleep(350);check(!AdhanPlaybackService.muted&&AdhanPlaybackService.playing)
        report("PASS: stale playback control cannot mute a later session; phone alarm volume unchanged")
        playback().actions[0].actionIntent.send();awaitState("preview stopped"){!AdhanPlaybackService.playing}
        AdhanEngine.setSettings(c,config.put("locale","en").toString())
        val enNow=System.currentTimeMillis();val enDisplay=JSONObject(display.toString()).put("at",enNow).put("prayerAt",enNow+600000)
        AdhanNotification.reminder(c,enDisplay)
        val en=manager.activeNotifications.first {it.notification.channelId==AdhanEngine.REMINDER_CHANNEL}.notification
        check(en.extras.getCharSequence(android.app.Notification.EXTRA_TITLE).toString().contains("in 10 minutes"))
        check(en.actions.single().title.toString()=="Mute this Adhan")
        report("PASS: English reminder labels; screenOff=${!c.getSystemService(PowerManager::class.java).isInteractive}")
        finish(Activity.RESULT_OK,Bundle().apply {putString("stream","Notification countdown, one-prayer mute, live mute/unmute, session isolation and stop passed\n")})
      }catch(e:Throwable){finish(Activity.RESULT_CANCELED,Bundle().apply {putString("failure",e.toString())})}
      finally{AdhanPlaybackService.stop(c);AdhanEngine.configure(c,AdhanEngine.config(c).put("enabled",false).toString());manager.cancelAll()}
      return
    }
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
      report("PASS: native ESA HTTPS fetch, private month cache, verified private recordings and exact scheduling")
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
