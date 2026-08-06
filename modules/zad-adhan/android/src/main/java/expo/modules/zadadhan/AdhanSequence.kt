package expo.modules.zadadhan

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

/** Uses the saved Cairo calendar date, independently of the device's timezone. */
object AdhanSequence {
  val prayers=listOf("fajr","dhuhr","asr","maghrib","isha")
  fun slot(date:String,prayer:String):String {
    require(prayer in prayers);require(Regex("\\d{4}-\\d{2}-\\d{2}").matches(date))
    val format=SimpleDateFormat("yyyy-MM-dd",Locale.US).apply { isLenient=false;timeZone=TimeZone.getTimeZone("UTC") }
    val parsed=requireNotNull(format.parse(date));require(format.format(parsed)==date)
    val day=Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply { time=parsed }.get(Calendar.DAY_OF_WEEK)
    return if(prayer=="dhuhr"&&day==Calendar.FRIDAY)"friday" else prayer
  }
}
