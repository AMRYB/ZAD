package expo.modules.zadadhan

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.interfaces.permissions.Permissions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ZadAdhanModule:Module(){
  private val previewVersion=java.util.concurrent.atomic.AtomicInteger()
  private val context get()=requireNotNull(appContext.reactContext)
  override fun definition()=ModuleDefinition {
    Name("ZadAdhan")
    AsyncFunction("month") Coroutine {city:String,month:String->withContext(Dispatchers.IO){EsaClient.month(context,city,month).toString()}}
    Function("configure"){settings:String->AdhanEngine.setSettings(context,settings)}
    AsyncFunction("refresh") Coroutine { -> withContext(Dispatchers.IO){AdhanEngine.refresh(context);AdhanEngine.status(context)}}
    Function("status"){AdhanEngine.status(context)}
    Function("configureReminders"){settings:String->DailyReminders.configure(context,settings)}
    Function("reminderStatus"){DailyReminders.status(context)}
    Function("testReminder"){kind:String->DailyReminders.test(context,kind);Unit}
    AsyncFunction("requestNotifications"){promise:Promise->
      AdhanEngine.channels(context)
      if(Build.VERSION.SDK_INT>=33)Permissions.askForPermissionsWithPermissionsManager(appContext.permissions,promise,Manifest.permission.POST_NOTIFICATIONS)
      else promise.resolve(mapOf("granted" to AdhanEngine.notifications(context)))
    }
    Function("openExactSettings") {if(Build.VERSION.SDK_INT>=31)context.startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,Uri.parse("package:${context.packageName}")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))}
    Function("openNotificationSettings"){context.startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE,context.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))}
    Function("openSoundSettings"){context.startActivity(Intent(Settings.ACTION_SOUND_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))}
    AsyncFunction("preview") Coroutine {date:String,prayer:String->val version=previewVersion.incrementAndGet();withContext(Dispatchers.IO){AdhanAudio.sequence(context,date,prayer).forEach {AdhanAudio.ensure(context,it)};if(version==previewVersion.get())AdhanPlaybackService.start(context,Intent(context,AdhanPlaybackService::class.java).putExtra("preview",true).putExtra("date",date).putExtra("prayer",prayer));Unit}}
    Function("stop"){previewVersion.incrementAndGet();AdhanPlaybackService.stop(context);Unit}
    Function("setMuted"){value:Boolean->AdhanPlaybackService.setMuted(context,value);Unit}
    AsyncFunction("testAlarm"){date:String,prayer:String->AdhanEngine.test(context,date,prayer)}
  }
}
