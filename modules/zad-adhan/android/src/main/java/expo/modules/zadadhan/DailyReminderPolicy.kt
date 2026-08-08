package expo.modules.zadadhan

import java.util.Calendar
import java.util.TimeZone

object DailyReminderPolicy {
  val ids=listOf("adhkar-morning","adhkar-evening","adhkar-sleep","deeds-0","deeds-1","deeds-2")
  fun next(time:String,now:Long,zone:TimeZone=TimeZone.getDefault()):Long {
    require(Regex("([01][0-9]|2[0-3]):[0-5][0-9]").matches(time))
    val parts=time.split(':').map {it.toInt()}
    val calendar=Calendar.getInstance(zone).apply {timeInMillis=now;set(Calendar.HOUR_OF_DAY,parts[0]);set(Calendar.MINUTE,parts[1]);set(Calendar.SECOND,0);set(Calendar.MILLISECOND,0)}
    if(calendar.timeInMillis<=now)calendar.add(Calendar.DAY_OF_MONTH,1)
    return calendar.timeInMillis
  }
  fun route(id:String):String {require(id in ids);return if(id.startsWith("deeds-"))"good-deeds" else "adhkar?category="+id.removePrefix("adhkar-")}
}
