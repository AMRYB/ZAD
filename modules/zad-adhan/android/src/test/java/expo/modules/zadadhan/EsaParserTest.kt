package expo.modules.zadadhan

import org.junit.Assert.*
import org.junit.Test
import java.time.Instant

class EsaParserTest {
  private fun fixture()=javaClass.classLoader!!.getResource("cairo-2026-10.html")!!.readText()
  @Test fun fullOfficialMonthAndClockChange(){val days=EsaParser.parse(fixture(),"القـاهـرة","2026-10");assertEquals(31,days.size);assertEquals("05:35",days[22].times[0]);assertEquals("04:39",days[29].times[0]);assertEquals("11:39",days[29].times[2])}
  @Test fun timezoneDoesNotFollowDeviceZone(){assertEquals(Instant.parse("2026-10-29T02:39:00Z").toEpochMilli(),EsaParser.epoch("2026-10-29","05:39"));assertEquals(Instant.parse("2026-10-30T02:39:00Z").toEpochMilli(),EsaParser.epoch("2026-10-30","04:39"))}
  @Test(expected=IllegalArgumentException::class) fun wrongYearRejected(){EsaParser.parse(fixture(),"القـاهـرة","2027-10")}
  @Test(expected=IllegalArgumentException::class) fun wrongCityRejected(){EsaParser.parse(fixture(),"الأسكندرية","2026-10")}
  @Test(expected=IllegalArgumentException::class) fun duplicateDayRejected(){EsaParser.parse(fixture().replace("2026-10-23","2026-10-22"),"القـاهـرة","2026-10")}
  @Test fun validWallClocks(){assertEquals("00:02",EsaParser.time("12:2 ص"));assertEquals("12:39",EsaParser.time("12:39 م"));assertEquals("15:01",EsaParser.time("3:1 م"))}
}
