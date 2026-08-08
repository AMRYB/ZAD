package expo.modules.zadadhan
import java.util.Calendar
import java.util.TimeZone
import org.junit.Assert.*
import org.junit.Test

class DailyReminderPolicyTest {
  private fun instant(year:Int,month:Int,day:Int,hour:Int,minute:Int,zone:TimeZone)=Calendar.getInstance(zone).apply {clear();set(year,month-1,day,hour,minute,0)}.timeInMillis
  @Test fun nextReminderUsesLocalClockAndIsStrictlyFuture(){val zone=TimeZone.getTimeZone("UTC");val now=instant(2026,10,24,8,0,zone);assertEquals(instant(2026,10,24,9,0,zone),DailyReminderPolicy.next("09:00",now,zone));assertEquals(instant(2026,10,25,9,0,zone),DailyReminderPolicy.next("09:00",instant(2026,10,24,9,0,zone),zone))}
  @Test fun midnightRollsToNextCalendarDay(){val z=TimeZone.getTimeZone("UTC");assertEquals(instant(2027,1,1,0,0,z),DailyReminderPolicy.next("00:00",instant(2026,12,31,23,59,z),z))}
  @Test fun cairoDstKeepsTheChosenHour(){val z=TimeZone.getTimeZone("Africa/Cairo");val now=instant(2026,10,29,9,1,z);val next=Calendar.getInstance(z).apply {timeInMillis=DailyReminderPolicy.next("09:00",now,z)};assertEquals(30,next.get(Calendar.DAY_OF_MONTH));assertEquals(9,next.get(Calendar.HOUR_OF_DAY));assertEquals(0,next.get(Calendar.MINUTE))}
  @Test fun malformedTimesFailClosed(){for(time in listOf("9:00","24:00","12:60","-1:30","09:00:00","../path")){try{DailyReminderPolicy.next(time,0);fail(time)}catch(_:IllegalArgumentException){}}}
  @Test fun onlySixKnownDestinationsAreAllowed(){assertEquals(6,DailyReminderPolicy.ids.size);assertEquals("good-deeds",DailyReminderPolicy.route("deeds-2"));assertEquals("adhkar?category=evening",DailyReminderPolicy.route("adhkar-evening"));try{DailyReminderPolicy.route("https://example.com");fail()}catch(_:IllegalArgumentException){}}
}
