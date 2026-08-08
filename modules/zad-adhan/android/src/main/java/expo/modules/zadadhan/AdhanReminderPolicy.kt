package expo.modules.zadadhan

/** Identity is shared by a reminder and its prayer, including isolated test alarms. */
object AdhanReminderPolicy {
  const val LEAD_MS=600000L
  fun prayerAt(at:Long,reminder:Boolean,test:Boolean)=at+if(reminder){if(test)30000L else LEAD_MS}else 0L
  fun key(city:String,date:String,prayer:String,generation:Long,at:Long,test:Boolean)=
    listOf(city,date,prayer,generation.toString(),at.toString(),test.toString()).joinToString("|"){"${it.length}:$it"}
  fun canChange(now:Long,reminderAt:Long,prayerAt:Long)=now>=reminderAt-1000L&&now<prayerAt
}
