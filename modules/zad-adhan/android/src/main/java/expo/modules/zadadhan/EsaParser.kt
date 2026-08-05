package expo.modules.zadadhan

import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

data class EsaDay(val date: String, val hijri: String, val times: List<String>)
object EsaParser {
  val keys = listOf("fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha")
  private fun matches(pattern: String, text: String) = Regex(pattern, setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL)).findAll(text)
  fun text(value: String): String = value.replace(Regex("<[^>]*>"), "").replace("&nbsp;", " ").replace("&quot;", "\"").replace("&#39;", "'").replace("&amp;", "&").replace(Regex("\\s+"), " ").trim()
  fun normalize(value: String) = value.replace("ـ", "").trim()
  fun time(value: String): String {
    val m = Regex("^(\\d{1,2}):(\\d{1,2})\\s*([صم])$").matchEntire(value) ?: error("ESA_INVALID_TIME")
    val h=m.groupValues[1].toInt(); val min=m.groupValues[2].toInt()
    require(h in 1..12 && min in 0..59) { "ESA_INVALID_TIME" }
    return String.format(Locale.US,"%02d:%02d", h%12 + if(m.groupValues[3]=="م") 12 else 0,min)
  }
  fun calendar(date: String): Calendar {
    val format=SimpleDateFormat("yyyy-MM-dd",Locale.US).apply { timeZone=TimeZone.getTimeZone("UTC"); isLenient=false }
    require(Regex("\\d{4}-\\d{2}-\\d{2}").matches(date))
    return Calendar.getInstance(TimeZone.getTimeZone("UTC"),Locale.US).apply { time=requireNotNull(format.parse(date)); require(format.format(time)==date) }
  }
  fun parse(html: String, city: String, month: String): List<EsaDay> {
    val cal=calendar("$month-01")
    val table=matches("<table\\b[^>]*id=\"placeholder1_GridView1\"[^>]*>(.*?)</table>",html).firstOrNull()?.groupValues?.get(1) ?: error("ESA_NO_TABLE")
    val days=matches("<tr\\b[^>]*>(.*?)</tr>",table).mapNotNull { row ->
      val cells=matches("<td\\b[^>]*>(.*?)</td>",row.groupValues[1]).map { text(it.groupValues[1]) }.toList()
      if(cells.size!=9 || !Regex("\\d{4}-\\d{2}-\\d{2}").matches(cells[1])) null else {
        require(normalize(cells[0])==normalize(city) && cells[1].startsWith("$month-")) { "ESA_WRONG_CITY_OR_MONTH" }
        calendar(cells[1]);val times=cells.drop(3).map(::time)
        require(times.zipWithNext().all { (a,b)->a<b }) { "ESA_INVALID_ORDER" }
        EsaDay(cells[1],cells[2],times)
      }
    }.toList()
    require(days.size==cal.getActualMaximum(Calendar.DAY_OF_MONTH) && days.map { it.date }.toSet().size==days.size) { "ESA_INCOMPLETE_MONTH" }
    return days.sortedBy { it.date }
  }
  fun form(html: String, city: String, month: String): String {
    calendar("$month-01")
    val options=matches("<option\\b[^>]*value=\"([^\"]+)\"",html).map { text(it.groupValues[1]) }.toSet()
    require(city in options && city!="كل المدن") { "ESA_INVALID_CITY" }
    val fields=linkedMapOf<String,String>()
    for(tag in matches("<input\\b[^>]*>",html)) {
      val n=Regex("\\bname=\"([^\"]+)\"").find(tag.value)?.groupValues?.get(1) ?: continue
      if(!Regex("__(?:EVENTTARGET|EVENTARGUMENT|LASTFOCUS|VIEWSTATE\\d*|VIEWSTATEFIELDCOUNT|VIEWSTATEGENERATOR|EVENTVALIDATION)").matches(n)) continue
      fields[n]=text(Regex("\\bvalue=\"([^\"]*)\"").find(tag.value)?.groupValues?.get(1) ?: "")
    }
    require(fields.containsKey("__VIEWSTATE")&&fields.containsKey("__EVENTVALIDATION")) { "ESA_FORM_CHANGED" }
    fields["__EVENTTARGET"]="ctl00\$placeholder1\$DropDownList2"; fields["__EVENTARGUMENT"]=""
    fields["ctl00\$placeholder1\$DropDownList1"]=city; fields["ctl00\$placeholder1\$DropDownList2"]=month.takeLast(2).toInt().toString()
    return fields.entries.joinToString("&") { URLEncoder.encode(it.key,"UTF-8")+"="+URLEncoder.encode(it.value,"UTF-8") }
  }
  fun epoch(date: String, time: String): Long = requireNotNull(SimpleDateFormat("yyyy-MM-dd HH:mm",Locale.US).apply { timeZone=TimeZone.getTimeZone("Africa/Cairo"); isLenient=false }.parse("$date $time")).time
  fun today(now: Long=System.currentTimeMillis())=SimpleDateFormat("yyyy-MM-dd",Locale.US).apply { timeZone=TimeZone.getTimeZone("Africa/Cairo") }.format(now)
  fun nextMonth(month: String): String { val cal=calendar("$month-01");cal.add(Calendar.MONTH,1);return SimpleDateFormat("yyyy-MM",Locale.US).apply { timeZone=TimeZone.getTimeZone("UTC") }.format(cal.time) }
}
