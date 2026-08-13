package expo.modules.zadadhan
import org.junit.Assert.*
import org.junit.Test
class WidgetPolicyTest {
  @Test fun skipsSunriseAndSelectsTomorrowFajr(){
    val today=EsaDay("2026-10-24","",listOf("05:35","07:00","12:40","15:45","18:15","19:33"))
    val tomorrow=today.copy(date="2026-10-25")
    val next=WidgetPolicy.next(listOf(today,tomorrow),EsaParser.epoch(today.date,"23:00"))!!
    assertEquals("fajr",next.prayer);assertEquals(tomorrow.date,next.date)
    assertEquals("dhuhr",WidgetPolicy.next(listOf(today),EsaParser.epoch(today.date,"06:00"))!!.prayer)
  }
  @Test fun rejectsCorruptTimesAndNeverInventsTimesForEmptyCache(){
    assertNull(WidgetPolicy.next(emptyList(),System.currentTimeMillis()))
    try{WidgetPolicy.next(listOf(EsaDay("2026-10-24","",List(6){"99:99"})),EsaParser.epoch("2026-10-24","00:00"));fail()}catch(_:IllegalArgumentException){}
  }
}
