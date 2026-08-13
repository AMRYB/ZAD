package expo.modules.zadadhan

data class WidgetPrayer(val date:String,val prayer:String,val time:String,val at:Long)
object WidgetPolicy {
  fun next(days:List<EsaDay>,now:Long):WidgetPrayer? {
    val today=EsaParser.today(now)
    return days.filter {it.date>=today}.flatMap {day->
      EsaParser.calendar(day.date);require(day.times.size==6)
      day.times.mapIndexedNotNull {i,time->
        require(Regex("(?:[01][0-9]|2[0-3]):[0-5][0-9]").matches(time))
        if(i==1)null else WidgetPrayer(day.date,EsaParser.keys[i],time,EsaParser.epoch(day.date,time))
      }
    }.filter {it.at>now}.minByOrNull {it.at}
  }
}
