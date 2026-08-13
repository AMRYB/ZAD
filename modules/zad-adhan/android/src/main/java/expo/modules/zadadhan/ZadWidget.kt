package expo.modules.zadadhan

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.SystemClock
import android.widget.RemoteViews
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ZadWidget:AppWidgetProvider(){
  override fun onUpdate(c:Context,m:AppWidgetManager,ids:IntArray){refreshAll(c)}
  override fun onReceive(c:Context,i:Intent){super.onReceive(c,i);if(i.action==REFRESH)refreshAll(c)}
  override fun onDisabled(c:Context){c.getSystemService(AlarmManager::class.java).cancel(refreshIntent(c))}
  companion object {
    const val REFRESH="zad.widget.REFRESH"
    private fun preferences(c:Context)=c.getSharedPreferences("zad-widget-v1",Context.MODE_PRIVATE)
    private fun refreshIntent(c:Context)=PendingIntent.getBroadcast(c,71081,Intent(c,ZadWidget::class.java).setAction(REFRESH),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    private fun open(c:Context,route:String,code:Int)=PendingIntent.getActivity(c,code,Intent(Intent.ACTION_VIEW,Uri.parse("ramadanjourney://$route")).setPackage(c.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    fun configure(c:Context,text:String){
      val data=JSONObject(text);require(data.optString("locale") in listOf("ar","en"));require(data.optString("city").length<=80);require(data.optString("cityName").length<=100)
      require(data.optInt("sura") in 1..114&&data.optInt("aya") in 1..286)
      preferences(c).edit().putString("settings",data.toString()).apply();refreshAll(c)
    }
    fun pin(c:Context):Boolean {
      if(Build.VERSION.SDK_INT<26)return false
      val manager=c.getSystemService(AppWidgetManager::class.java)
      return manager.isRequestPinAppWidgetSupported&&manager.requestPinAppWidget(ComponentName(c,ZadWidget::class.java),null,null)
    }
    fun refreshAll(c:Context){
      val manager=c.getSystemService(AppWidgetManager::class.java);val ids=manager.getAppWidgetIds(ComponentName(c,ZadWidget::class.java));if(ids.isEmpty())return
      val data=try{JSONObject(preferences(c).getString("settings","{}")!!)}catch(_:Exception){JSONObject()}
      val en=data.optString("locale")=="en"
      val dark=data.optBoolean("dark")
      val city=data.optString("city")
      val month=EsaParser.today().take(7)
      val next=try{
        val days=listOf(month,EsaParser.nextMonth(month)).flatMap {m->
          val array=EsaClient.cached(c,city,m)?.getJSONArray("days")
          if(array==null)emptyList() else (0 until array.length()).map {i->val day=array.getJSONObject(i);EsaDay(day.getString("date"),day.optString("hijri"),EsaParser.keys.map {key->day.getJSONObject("times").getString(key)})}
        };WidgetPolicy.next(days,System.currentTimeMillis())
      }catch(_:Exception){null}
      val views=RemoteViews(c.packageName,R.layout.zad_widget)
      views.setInt(R.id.zad_widget_root,"setBackgroundResource",if(dark)R.drawable.zad_widget_dark else R.drawable.zad_widget_light)
      val text=android.graphics.Color.parseColor(if(dark)"#F2F5FC" else "#172D27")
      val accent=android.graphics.Color.parseColor(if(dark)"#9ABCEB" else "#176B57")
      listOf(R.id.zad_widget_title,R.id.zad_widget_city,R.id.zad_widget_prayer,R.id.zad_widget_time,R.id.zad_widget_read,R.id.zad_widget_tasbih).forEach {views.setTextColor(it,text)}
      views.setTextViewText(R.id.zad_widget_title,if(en)"ZAD · Your next prayer" else "زاد · الصلاة القادمة")
      views.setTextViewText(R.id.zad_widget_city,data.optString("cityName").ifEmpty {if(en)"Choose a city in ZAD" else "اختار مدينتك في زاد"})
      val names=mapOf("fajr" to "الفجر","dhuhr" to "الظهر","asr" to "العصر","maghrib" to "المغرب","isha" to "العشاء")
      views.setTextViewText(R.id.zad_widget_prayer,if(next==null){if(en)"Open ZAD to load times" else "افتح زاد لتحميل المواقيت"}else if(en)next.prayer.replaceFirstChar {it.uppercase()} else "صلاة ${names[next.prayer]}")
      views.setTextColor(R.id.zad_widget_prayer,accent)
      views.setTextViewText(R.id.zad_widget_time,if(next==null)"—" else SimpleDateFormat("h:mm a",if(en)Locale.US else Locale("ar")).apply {timeZone=TimeZone.getTimeZone("Africa/Cairo")}.format(java.util.Date(next.at)))
      views.setTextViewText(R.id.zad_widget_read,if(en)"Continue reading" else "متابعة القراءة");views.setTextViewText(R.id.zad_widget_tasbih,if(en)"Tasbih" else "السبحة")
      views.setOnClickPendingIntent(R.id.zad_widget_title,open(c,"adhan",71082));views.setOnClickPendingIntent(R.id.zad_widget_prayer,open(c,"adhan",71082))
      views.setOnClickPendingIntent(R.id.zad_widget_read,open(c,"quran?sura=${data.optInt("sura",1)}&aya=${data.optInt("aya",1)}",71083));views.setOnClickPendingIntent(R.id.zad_widget_tasbih,open(c,"tasbih",71084))
      manager.updateAppWidget(ids,views)
      val alarm=c.getSystemService(AlarmManager::class.java);alarm.cancel(refreshIntent(c))
      val at=next?.at?:System.currentTimeMillis()+1800000
      if(Build.VERSION.SDK_INT<31||alarm.canScheduleExactAlarms())alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at+1000,refreshIntent(c))
      else alarm.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP,SystemClock.elapsedRealtime()+(at-System.currentTimeMillis()).coerceAtLeast(1000),refreshIntent(c))
    }
  }
}
