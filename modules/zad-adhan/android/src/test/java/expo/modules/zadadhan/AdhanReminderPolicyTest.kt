package expo.modules.zadadhan

import org.junit.Assert.*
import org.junit.Test

class AdhanReminderPolicyTest {
  @Test fun productionReminderIsExactlyTenMinutesBeforePrayer(){
    assertEquals(1600000L,AdhanReminderPolicy.prayerAt(1000000L,true,false))
    assertEquals(1600000L,AdhanReminderPolicy.prayerAt(1600000L,false,false))
  }
  @Test fun testReminderUsesItsActualThirtySecondLead(){
    assertEquals(1030000L,AdhanReminderPolicy.prayerAt(1000000L,true,true))
  }
  @Test fun muteCannotLeakToAnotherPrayerDayCityOrGeneration(){
    fun key(city:String="Cairo",date:String="2026-10-24",prayer:String="isha",generation:Long=1,at:Long=1600000,test:Boolean=false)=AdhanReminderPolicy.key(city,date,prayer,generation,at,test)
    val original=key()
    for(other in listOf(key(city="Giza"),key(date="2026-10-25"),key(prayer="fajr"),key(generation=2),key(at=1600001),key(test=true)))assertNotEquals(original,other)
    assertNotEquals(key(city="a|1:b"),key(city="a|1:b|"))
  }
  @Test fun expiredAndPrematureControlsAreRejected(){
    assertTrue(AdhanReminderPolicy.canChange(1000000,1000000,1600000))
    assertTrue(AdhanReminderPolicy.canChange(1599999,1000000,1600000))
    assertFalse(AdhanReminderPolicy.canChange(1600000,1000000,1600000))
    assertFalse(AdhanReminderPolicy.canChange(998999,1000000,1600000))
  }
}
