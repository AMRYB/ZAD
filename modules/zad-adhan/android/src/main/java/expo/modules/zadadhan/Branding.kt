package expo.modules.zadadhan

import android.app.ActivityManager
import android.app.AlarmManager
import android.app.PendingIntent
import android.app.job.JobInfo
import android.app.job.JobParameters
import android.app.job.JobScheduler
import android.app.job.JobService
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import java.util.Calendar
import java.util.concurrent.Executors

object Branding {
  private const val PERIODIC=71090
  private const val FETCH=71091
  private const val ALARM=71092
  private const val SIX_HOURS=21600000L
  const val MEDIA_REFRESH="zad.media.REFRESH_ART"
  private fun prefs(c:Context)=c.getSharedPreferences("zad-brand-v1",Context.MODE_PRIVATE)
  private fun pending(c:Context)=PendingIntent.getBroadcast(c,ALARM,Intent(c,BrandingReceiver::class.java),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  private fun days(c:Context):List<EsaDay> {
    val city=prefs(c).getString("city","")!!;val month=EsaParser.today().take(7)
    return listOf(month,EsaParser.nextMonth(month)).flatMap { m->
      val list=EsaClient.cached(c,city,m)?.getJSONArray("days")
      if(list==null)emptyList() else (0 until list.length()).map { i->val d=list.getJSONObject(i);EsaDay(d.getString("date"),d.optString("hijri"),EsaParser.keys.map {d.getJSONObject("times").getString(it)})}
    }
  }
  private fun decision(c:Context):BrandDecision {
    val previous=prefs(c).getString("variant","day")!!
    return try{BrandPolicy.resolve(days(c),System.currentTimeMillis(),previous)}catch(_:Exception){BrandDecision(if(previous=="night")"night" else "day",null,false)}
  }
  fun variant(c:Context)=decision(c).variant
  fun configure(c:Context,city:String,locale:String):Map<String,Any> {
    require(city.length<=80&&locale in listOf("ar","en"))
    prefs(c).edit().putString("city",city).putString("locale",locale).apply()
    return refresh(c,true)
  }
  fun status(c:Context):Map<String,Any> {
    val d=decision(c);return mapOf("variant" to d.variant,"known" to d.known,"boundary" to (d.boundary?:0L))
  }
  internal fun applyVariant(c:Context,variant:String) {
    require(variant in listOf("day","night"))
    val pm=c.packageManager
    val target=ComponentName(c.packageName,c.packageName+if(variant=="day")".MorningIcon" else ".EveningIcon")
    val other=ComponentName(c.packageName,c.packageName+if(variant=="day")".EveningIcon" else ".MorningIcon")
    // Some isolated test hosts do not declare launcher aliases.
    try{pm.getActivityInfo(target,PackageManager.MATCH_DISABLED_COMPONENTS)}catch(_:PackageManager.NameNotFoundException){return}
    if(pm.getComponentEnabledSetting(target)==PackageManager.COMPONENT_ENABLED_STATE_ENABLED&&pm.getComponentEnabledSetting(other)==PackageManager.COMPONENT_ENABLED_STATE_DISABLED)return
    if(Build.VERSION.SDK_INT>=33)pm.setComponentEnabledSettings(listOf(
      PackageManager.ComponentEnabledSetting(target,PackageManager.COMPONENT_ENABLED_STATE_ENABLED,PackageManager.DONT_KILL_APP),
      PackageManager.ComponentEnabledSetting(other,PackageManager.COMPONENT_ENABLED_STATE_DISABLED,PackageManager.DONT_KILL_APP)
    )) else {
      pm.setComponentEnabledSetting(target,PackageManager.COMPONENT_ENABLED_STATE_ENABLED,PackageManager.DONT_KILL_APP)
      pm.setComponentEnabledSetting(other,PackageManager.COMPONENT_ENABLED_STATE_DISABLED,PackageManager.DONT_KILL_APP)
    }
  }
  @Synchronized fun refresh(c:Context,fetchMissing:Boolean=false):Map<String,Any> {
    val d=decision(c);val previous=prefs(c).getString("variant",null)
    applyVariant(c,d.variant);prefs(c).edit().putString("variant",d.variant).apply()
    val manager=c.getSystemService(AlarmManager::class.java);manager.cancel(pending(c))
    val at=d.boundary?:System.currentTimeMillis()+SIX_HOURS
    val exact=Build.VERSION.SDK_INT<31||manager.canScheduleExactAlarms()
    try{if(exact)manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,pending(c))else manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,pending(c))}catch(_:SecurityException){manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,pending(c))}
    installJobs(c,fetchMissing&&!d.known)
    if(previous!=d.variant){
      @Suppress("DEPRECATION") val running=c.getSystemService(ActivityManager::class.java).getRunningServices(Int.MAX_VALUE).map {it.service.className}.toSet()
      for(service in listOf("expo.modules.audio.service.AudioControlsService","expo.modules.zadadhan.AdhanPlaybackService"))if(service in running)try{c.startService(Intent().setClassName(c.packageName,service).setAction(MEDIA_REFRESH))}catch(_:IllegalStateException){}
    }
    return mapOf("variant" to d.variant,"known" to d.known,"boundary" to (d.boundary?:0L),"exact" to exact)
  }
  private fun installJobs(c:Context,immediate:Boolean) {
    if(prefs(c).getString("city","").isNullOrEmpty())return
    val scheduler=c.getSystemService(JobScheduler::class.java);val component=ComponentName(c,BrandRefreshJob::class.java)
    if(scheduler.getPendingJob(PERIODIC)==null)scheduler.schedule(JobInfo.Builder(PERIODIC,component).setPeriodic(SIX_HOURS).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPersisted(true).build())
    if(immediate&&scheduler.getPendingJob(FETCH)==null)scheduler.schedule(JobInfo.Builder(FETCH,component).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).build())
  }
  fun ensureMonths(c:Context) {
    val city=prefs(c).getString("city","")!!;if(city.isEmpty())return
    val today=EsaParser.today();val month=today.take(7)
    // EsaClient suppresses network work for a fresh 24-hour cache.
    EsaClient.month(c,city,month)
    val date=EsaParser.calendar(today)
    if(date.get(Calendar.DAY_OF_MONTH)==date.getActualMaximum(Calendar.DAY_OF_MONTH)){
      val next=EsaParser.nextMonth(month);if(EsaClient.cached(c,city,next)==null)EsaClient.month(c,city,next)
    }
  }
}
class BrandingReceiver:BroadcastReceiver(){override fun onReceive(c:Context,i:Intent){Branding.refresh(c,true)}}
class BrandRefreshJob:JobService(){
  private val worker=Executors.newSingleThreadExecutor();private var work:java.util.concurrent.Future<*>?=null
  override fun onStartJob(p:JobParameters):Boolean {work=worker.submit {try{Branding.ensureMonths(applicationContext)}catch(_:Exception){}finally{Branding.refresh(applicationContext);jobFinished(p,false)}};return true}
  override fun onStopJob(p:JobParameters):Boolean {work?.cancel(true);return true}
  override fun onDestroy(){worker.shutdownNow();super.onDestroy()}
}
