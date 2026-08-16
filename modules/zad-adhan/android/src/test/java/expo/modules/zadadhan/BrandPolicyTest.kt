package expo.modules.zadadhan
import org.junit.Assert.*
import org.junit.Test
class BrandPolicyTest {
  private fun day(date:String)=EsaDay(date,"",listOf("05:35","07:00","12:40","15:45","18:15","19:33"))
  @Test fun sunriseIsInclusiveAndIshaStartsNight(){
    val d=day("2026-10-25");val days=listOf(d,day("2026-10-26"));val sunrise=EsaParser.epoch(d.date,"07:00");val isha=EsaParser.epoch(d.date,"19:33")
    assertEquals("night",BrandPolicy.resolve(days,sunrise-1).variant)
    assertEquals("day",BrandPolicy.resolve(days,sunrise).variant)
    assertEquals("day",BrandPolicy.resolve(days,isha-1).variant)
    assertEquals("night",BrandPolicy.resolve(days,isha).variant)
    assertEquals(EsaParser.epoch("2026-10-26","07:00"),BrandPolicy.resolve(days,isha).boundary)
  }
  @Test fun nextBoundaryCrossesCairoDstAndMonthWithoutFixedHours(){
    val dates=listOf(day("2026-10-29"),day("2026-10-30"),day("2026-10-31"),day("2026-11-01"))
    for(date in listOf("2026-10-29","2026-10-31")){
      val now=EsaParser.epoch(date,"23:30");val next=if(date.endsWith("29"))"2026-10-30" else "2026-11-01"
      assertEquals("night",BrandPolicy.resolve(dates,now).variant);assertEquals(EsaParser.epoch(next,"07:00"),BrandPolicy.resolve(dates,now).boundary)
    }
  }
  @Test fun missingOfficialDayKeepsPreviousIconWithoutInventingTimes(){
    val now=EsaParser.epoch("2026-10-25","12:00")
    assertEquals(BrandDecision("night",null,false),BrandPolicy.resolve(emptyList(),now,"night"))
    assertEquals(BrandDecision("day",null,false),BrandPolicy.resolve(emptyList(),now,"bad"))
  }
  @Test fun corruptOfficialTimesFailValidation(){
    try{BrandPolicy.resolve(listOf(day("2026-10-25").copy(times=List(6){"99:00"})),EsaParser.epoch("2026-10-25","12:00"));fail()}catch(_:IllegalArgumentException){}
  }
}
