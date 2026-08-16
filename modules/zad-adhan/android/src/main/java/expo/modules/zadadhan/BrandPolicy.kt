package expo.modules.zadadhan

data class BrandDecision(val variant:String,val boundary:Long?,val known:Boolean)
object BrandPolicy {
  fun resolve(days:List<EsaDay>,now:Long,previous:String="day"):BrandDecision {
    val today=EsaParser.today(now)
    val current=days.firstOrNull {it.date==today}
    fun bounds(day:EsaDay):List<Long>{
      EsaParser.calendar(day.date);require(day.times.size==6)
      require(day.times.all {Regex("(?:[01][0-9]|2[0-3]):[0-5][0-9]").matches(it)})
      require(day.times.zipWithNext().all {(a,b)->a<b})
      return listOf(EsaParser.epoch(day.date,day.times[1]),EsaParser.epoch(day.date,day.times[5]))
    }
    val range=current?.let(::bounds)
    val variant=if(range!=null){if(now>=range[0]&&now<range[1])"day" else "night"}else if(previous=="night")"night" else "day"
    val next=days.filter {it.date>=today}.flatMap(::bounds).filter {it>now}.minOrNull()
    return BrandDecision(variant,next,range!=null)
  }
}
