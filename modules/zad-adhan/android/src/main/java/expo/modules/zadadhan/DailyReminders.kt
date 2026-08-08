package expo.modules.zadadhan

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONArray
import org.json.JSONObject

/** Optional personal reminders. Independent of exact ESA prayer alarms and their opt-in. */
object DailyReminders {
  const val CHANNEL="zad-personal-reminders-v1"
  private fun prefs(c:Context)=c.getSharedPreferences("zad-personal-reminders-v1",Context.MODE_PRIVATE)
  private fun config(c:Context)=JSONObject(prefs(c).getString("config","{\"locale\":\"ar\",\"entries\":[]}")!!)
  fun channels(c:Context){if(Build.VERSION.SDK_INT>=26){val en=config(c).optString("locale")=="en";c.getSystemService(NotificationManager::class.java).createNotificationChannel(NotificationChannel(CHANNEL,if(en)"Personal reminders" else "تذكيرات الأذكار وأعمال الخير",NotificationManager.IMPORTANCE_DEFAULT))}}
  private fun allowed(c:Context)=NotificationManagerCompat.from(c).areNotificationsEnabled()&&(Build.VERSION.SDK_INT<26||c.getSystemService(NotificationManager::class.java).getNotificationChannel(CHANNEL)?.importance!=NotificationManager.IMPORTANCE_NONE)
  private fun pending(c:Context,id:String,at:Long,test:Boolean=false,flags:Int=PendingIntent.FLAG_UPDATE_CURRENT):PendingIntent? {
    val intent=Intent(c,DailyReminderReceiver::class.java).setAction("zad.reminder.DELIVER").setData(Uri.parse("zad-reminder://alarm/$id/$test"))
      .putExtra("id",id).putExtra("at",at).putExtra("test",test).putExtra("generation",prefs(c).getLong("generation",0))
    return PendingIntent.getBroadcast(c,0,intent,flags or PendingIntent.FLAG_IMMUTABLE)
  }
  @Synchronized fun configure(c:Context,text:String):Map<String,Any> {
    require(text.length<=3000);val next=JSONObject(text);require(next.getString("locale") in listOf("ar","en"));val entries=next.getJSONArray("entries");require(entries.length()<=6)
    val seen=mutableSetOf<String>();for(i in 0 until entries.length()){val e=entries.getJSONObject(i);val id=e.getString("id");require(id in DailyReminderPolicy.ids&&seen.add(id));DailyReminderPolicy.next(e.getString("time"),System.currentTimeMillis())}
    if(config(c).toString()!=next.toString()){
      val manager=c.getSystemService(AlarmManager::class.java);for(id in DailyReminderPolicy.ids){val p=pending(c,id,0,true,PendingIntent.FLAG_NO_CREATE);if(p!=null){manager.cancel(p);p.cancel()}}
      check(prefs(c).edit().putString("config",next.toString()).putLong("generation",prefs(c).getLong("generation",0)+1).commit())
    }
    plan(c);return status(c)
  }
  @Synchronized fun plan(c:Context){
    channels(c);val manager=c.getSystemService(AlarmManager::class.java)
    for(id in DailyReminderPolicy.ids){val p=pending(c,id,0,false,PendingIntent.FLAG_NO_CREATE);if(p!=null){manager.cancel(p);p.cancel()}}
    val planned=JSONObject();if(allowed(c)){val entries=config(c).getJSONArray("entries");for(i in 0 until entries.length()){val e=entries.getJSONObject(i);val id=e.getString("id");val at=DailyReminderPolicy.next(e.getString("time"),System.currentTimeMillis());manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,requireNotNull(pending(c,id,at)));planned.put(id,at)}}
    prefs(c).edit().putString("planned",planned.toString()).apply()
  }
  fun status(c:Context):Map<String,Any>{channels(c);val values=JSONObject(prefs(c).getString("planned","{}")!!);return mapOf("available" to true,"notifications" to allowed(c),"count" to values.keys().asSequence().count {values.optLong(it)>System.currentTimeMillis()})}
  @Synchronized fun deliver(c:Context,intent:Intent){
    val id=intent.getStringExtra("id")?:return;if(id !in DailyReminderPolicy.ids||intent.getLongExtra("generation",-1)!=prefs(c).getLong("generation",0))return
    val entries=config(c).getJSONArray("entries");if((0 until entries.length()).none {entries.getJSONObject(it).getString("id")==id})return
    val at=intent.getLongExtra("at",0);val test=intent.getBooleanExtra("test",false);val now=System.currentTimeMillis()
    if(!test&&JSONObject(prefs(c).getString("planned","{}")!!).optLong(id)!=at)return
    val key="$id:$test";val seen=prefs(c).getLong("last:$key",0)
    if(now-at in -1000L..10800000L&&seen!=at&&allowed(c)){
      val en=config(c).getString("locale")=="en";val deeds=id.startsWith("deeds-")
      val title=if(deeds){if(en)"A moment for good" else "فرصة لعمل خير"}else when(id){"adhkar-morning"->if(en)"Morning adhkar" else "أذكار الصباح";"adhkar-evening"->if(en)"Evening adhkar" else "أذكار المساء";else->if(en)"Before-sleep adhkar" else "أذكار النوم"}
      val body=if(deeds){if(en)"A small act can brighten someone’s day. See your choices for today." else "عمل بسيط ممكن يسعد حد. شوف اختياراتك للنهارده."}else if(en)"Take a quiet moment for your remembrance. Continue where you left off." else "خد لحظة لوردك، وكمّل من آخر موضع محفوظ."
      val open=PendingIntent.getActivity(c,0,Intent(Intent.ACTION_VIEW,Uri.parse("ramadanjourney://"+DailyReminderPolicy.route(id))).setPackage(c.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
      val n=NotificationCompat.Builder(c,CHANNEL).setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle((if(test){if(en)"Test · " else "اختبار · "}else "")+title).setContentText(body).setStyle(NotificationCompat.BigTextStyle().bigText(body)).setContentIntent(open).setAutoCancel(true).setVisibility(NotificationCompat.VISIBILITY_PRIVATE).setCategory(NotificationCompat.CATEGORY_REMINDER).build()
      try{NotificationManagerCompat.from(c).notify(id,71036,n);prefs(c).edit().putLong("last:$key",at).commit()}catch(_:SecurityException){}
    }
    if(!test){val planned=JSONObject(prefs(c).getString("planned","{}")!!);val entry=(0 until entries.length()).map {entries.getJSONObject(it)}.first {it.getString("id")==id}
      if(allowed(c)){val next=DailyReminderPolicy.next(entry.getString("time"),System.currentTimeMillis());c.getSystemService(AlarmManager::class.java).setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next,requireNotNull(pending(c,id,next)));planned.put(id,next)}else planned.remove(id)
      prefs(c).edit().putString("planned",planned.toString()).apply()
    }
  }
  fun test(c:Context,kind:String){require(kind in listOf("adhkar","deeds")&&allowed(c));val entries=config(c).getJSONArray("entries");val id=(0 until entries.length()).map {entries.getJSONObject(it).getString("id")}.first {it.startsWith("$kind-")};val at=System.currentTimeMillis()+15000;val manager=c.getSystemService(AlarmManager::class.java);val p=requireNotNull(pending(c,id,at,true));if(AdhanEngine.exact(c))manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,p)else manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,p)}
}
class DailyReminderReceiver:BroadcastReceiver(){override fun onReceive(context:Context,intent:Intent){try{DailyReminders.deliver(context,intent)}catch(_:Exception){/* A corrupt or stale personal reminder never affects prayer alarms. */}}}
