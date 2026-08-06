package expo.modules.zadadhan
import org.junit.Assert.*
import org.junit.Test
import java.util.TimeZone
class AdhanSequenceTest {
  @Test fun fridayOnlyChangesDhuhr(){for(date in listOf("2026-10-23","2026-10-30","2027-01-01")){assertEquals("friday",AdhanSequence.slot(date,"dhuhr"));for(prayer in AdhanSequence.prayers.filter {it!="dhuhr"})assertEquals(prayer,AdhanSequence.slot(date,prayer))}}
  @Test fun otherDatesKeepDhuhr(){for(date in listOf("2026-10-22","2026-10-24","2026-12-31"))assertEquals("dhuhr",AdhanSequence.slot(date,"dhuhr"))}
  @Test fun deviceTimezoneCannotChangeTheSavedPrayerDay(){val previous=TimeZone.getDefault();try{TimeZone.setDefault(TimeZone.getTimeZone("Pacific/Honolulu"));assertEquals("friday",AdhanSequence.slot("2026-10-23","dhuhr"))}finally{TimeZone.setDefault(previous)}}
  @Test(expected=IllegalArgumentException::class) fun noSunriseAdhan(){AdhanSequence.slot("2026-10-24","sunrise")}
  @Test(expected=java.text.ParseException::class) fun invalidDateRejected(){AdhanSequence.slot("2026-02-30","dhuhr")}
}
