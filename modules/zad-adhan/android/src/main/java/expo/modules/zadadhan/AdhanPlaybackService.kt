package expo.modules.zadadhan

import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import org.json.JSONObject

class AdhanPlaybackService:Service(){
  companion object {@Volatile var playing=false;const val STOP="zad.adhan.STOP";private const val ID=71033}
  private var player:MediaPlayer?=null;private var focus:AudioFocusRequest?=null;private var wake:PowerManager.WakeLock?=null
  private val handler=Handler(Looper.getMainLooper());private val timeout=Runnable {stopSelf()}
  private val focusListener=AudioManager.OnAudioFocusChangeListener {change->if(change<0)stopSelf()}
  override fun onBind(intent:Intent?):IBinder?=null
  override fun onStartCommand(intent:Intent?,flags:Int,startId:Int):Int {
    if(intent?.action==STOP){stopSelf();return START_NOT_STICKY}
    val event=try{intent?.getStringExtra("event")?.let(::JSONObject)}catch(_:Exception){null}
    if(intent?.getBooleanExtra("preview",false)!=true&&(event==null||!AdhanEngine.validEvent(this,event))){stopSelf();return START_NOT_STICKY}
    try{
      AdhanEngine.channels(this);val en=AdhanEngine.config(this).optString("locale")=="en"
      val stop=PendingIntent.getService(this,ID,Intent(this,AdhanPlaybackService::class.java).setAction(STOP),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
      val notification=NotificationCompat.Builder(this,AdhanEngine.PLAYBACK_CHANNEL).setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle(AdhanNotification.title(this,event))
        .setContentText(if(en)"Cairo Adhan · Mohamed Rifaat" else "أذان القاهرة · محمد رفعت").setContentIntent(AdhanNotification.open(this)).setOngoing(true)
        .setCategory(NotificationCompat.CATEGORY_ALARM).setVisibility(NotificationCompat.VISIBILITY_PRIVATE).addAction(android.R.drawable.ic_media_pause,if(en)"Stop Adhan" else "إيقاف الأذان",stop).build()
      if(Build.VERSION.SDK_INT>=29)startForeground(ID,notification,ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK) else startForeground(ID,notification)
      releasePlayer()
      val attributes=AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()
      val audio=getSystemService(AudioManager::class.java)
      val result=if(Build.VERSION.SDK_INT>=26){focus=AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT).setAudioAttributes(attributes).setOnAudioFocusChangeListener(focusListener).setAcceptsDelayedFocusGain(false).build();audio.requestAudioFocus(focus!!)}else{@Suppress("DEPRECATION") audio.requestAudioFocus(focusListener,AudioManager.STREAM_ALARM,AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)}
      if(result!=AudioManager.AUDIOFOCUS_REQUEST_GRANTED){stopSelf();return START_NOT_STICKY}
      wake=getSystemService(PowerManager::class.java).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"$packageName:adhan").apply {acquire(300000)}
      player=MediaPlayer().apply {
        setAudioAttributes(attributes);setDataSource(EsaClient.audioFile(this@AdhanPlaybackService).absolutePath)
        setOnPreparedListener {it.start();playing=true};setOnCompletionListener {stopSelf()}
        setOnErrorListener {_,_,_->AdhanEngine.prefs(this@AdhanPlaybackService).edit().putString("error","PLAYBACK_FAILED").apply();stopSelf();true};prepareAsync()
      }
      handler.removeCallbacks(timeout);handler.postDelayed(timeout,240000)
    }catch(_:Exception){AdhanEngine.prefs(this).edit().putString("error","PLAYBACK_FAILED").apply();stopSelf()}
    return START_NOT_STICKY
  }
  private fun releasePlayer(){playing=false;player?.release();player=null;if(wake?.isHeld==true)wake?.release();wake=null
    val audio=getSystemService(AudioManager::class.java);if(Build.VERSION.SDK_INT>=26){focus?.let {audio.abandonAudioFocusRequest(it)};focus=null}else{@Suppress("DEPRECATION") audio.abandonAudioFocus(focusListener)}
  }
  override fun onDestroy(){handler.removeCallbacks(timeout);releasePlayer();stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy()}
}
