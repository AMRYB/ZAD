package expo.modules.zadadhan

import android.app.PendingIntent
import android.app.Service
import android.content.Context
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
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject

class AdhanPlaybackService:Service(){
  companion object {
    @Volatile var playing=false
    @Volatile var currentClip=""
    const val STOP="zad.adhan.STOP"
    private const val ID=71033
    @Volatile private var cancellation=0
    fun start(c:Context,intent:Intent){ContextCompat.startForegroundService(c,intent.putExtra("audioGeneration",cancellation))}
    fun stop(c:Context){cancellation++;c.stopService(Intent(c,AdhanPlaybackService::class.java))}
  }
  private var player:MediaPlayer?=null
  private var focus:AudioFocusRequest?=null
  private var focusHeld=false
  private var wake:PowerManager.WakeLock?=null
  private var run=0
  private var stopping=false
  private var replacement:Intent?=null
  private val handler=Handler(Looper.getMainLooper())
  private val timeout=Runnable { fail() }
  private val focusListener=AudioManager.OnAudioFocusChangeListener {change->if(change<0&&focusHeld)halt()}
  override fun onBind(intent:Intent?):IBinder?=null
  private fun notification(event:JSONObject?,clip:String){
    val en=AdhanEngine.config(this).optString("locale")=="en"
    val stop=PendingIntent.getService(this,ID,Intent(this,AdhanPlaybackService::class.java).setAction(STOP),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val n=NotificationCompat.Builder(this,AdhanEngine.PLAYBACK_CHANNEL).setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle(AdhanNotification.title(this,event)).setContentText(AdhanAudio.label(this,clip,en))
      .setContentIntent(AdhanNotification.open(this)).setOngoing(true).setOnlyAlertOnce(true)
      .setCategory(NotificationCompat.CATEGORY_ALARM).setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
      .addAction(android.R.drawable.ic_media_pause,if(en)"Stop audio" else "إيقاف الصوت",stop).build()
    if(playing){NotificationManagerCompat.from(this).notify(ID,n)}
    else if(Build.VERSION.SDK_INT>=29)startForeground(ID,n,ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
    else startForeground(ID,n)
  }
  override fun onStartCommand(intent:Intent?,flags:Int,startId:Int):Int {
    if(intent?.action==STOP){cancellation++;replacement=null;halt();return START_NOT_STICKY}
    if(intent==null||intent.getIntExtra("audioGeneration",cancellation)!=cancellation){halt();return START_NOT_STICKY}
    // A new start can arrive after stopSelf but before Android calls onDestroy.
    // Save it for the new instance; never prepare audio in the instance being destroyed.
    if(stopping){replacement=Intent(intent);return START_NOT_STICKY}
    val event=try{intent?.getStringExtra("event")?.let(::JSONObject)}catch(_:Exception){null}
    val preview=intent?.getBooleanExtra("preview",false)==true
    if(!preview&&(event==null||!AdhanEngine.validEvent(this,event))){halt();return START_NOT_STICKY}
    try{
      release();handler.removeCallbacks(timeout);AdhanEngine.channels(this)
      val date=if(preview)requireNotNull(intent?.getStringExtra("date")) else event!!.getString("date")
      val prayer=if(preview)requireNotNull(intent?.getStringExtra("prayer")) else event!!.getString("prayer")
      val clips=AdhanAudio.sequence(this,date,prayer)
      notification(event,clips.first());playing=true
      val attributes=AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()
      val audio=getSystemService(AudioManager::class.java)
      val result=if(Build.VERSION.SDK_INT>=26){
        focus=AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT).setAudioAttributes(attributes).setOnAudioFocusChangeListener(focusListener).setAcceptsDelayedFocusGain(false).build()
        audio.requestAudioFocus(focus!!)
      }else{@Suppress("DEPRECATION") audio.requestAudioFocus(focusListener,AudioManager.STREAM_ALARM,AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)}
      if(result!=AudioManager.AUDIOFOCUS_REQUEST_GRANTED){AdhanEngine.prefs(this).edit().putString("error","AUDIO_FOCUS_DENIED").apply();halt();return START_NOT_STICKY}
      focusHeld=true
      wake=getSystemService(PowerManager::class.java).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"$packageName:adhan").apply {acquire(660000)}
      handler.postDelayed(timeout,600000)
      play(clips,0,run,attributes,event)
    }catch(_:Exception){fail()}
    return START_NOT_STICKY
  }
  private fun play(clips:List<String>,index:Int,token:Int,attributes:AudioAttributes,event:JSONObject?){
    if(token!=run)return
    if(index==clips.size){halt();return}
    try{
      player?.release();player=null
      val clip=clips[index];val recording=AdhanAudio.ensure(this,clip)
      val next=MediaPlayer();player=next
      next.setAudioAttributes(attributes);next.setDataSource(recording.absolutePath)
      next.setOnPreparedListener {if(token==run&&player===it){it.start();currentClip=clip;notification(event,clip)}}
      next.setOnCompletionListener {if(token==run&&player===it)play(clips,index+1,token,attributes,event)}
      next.setOnErrorListener {_,_,_->if(token==run)fail();true}
      next.prepareAsync()
    }catch(_:Exception){fail()}
  }
  private fun fail(){AdhanEngine.prefs(this).edit().putString("error","PLAYBACK_FAILED").apply();halt()}
  private fun halt(){if(stopping)return;stopping=true;handler.removeCallbacks(timeout);release();stopSelf()}
  private fun release(){
    run++;playing=false;currentClip="";focusHeld=false;player?.release();player=null
    if(wake?.isHeld==true)wake?.release();wake=null
    val audio=getSystemService(AudioManager::class.java)
    if(Build.VERSION.SDK_INT>=26){val old=focus;focus=null;old?.let {audio.abandonAudioFocusRequest(it)}}
    else{@Suppress("DEPRECATION") audio.abandonAudioFocus(focusListener)}
  }
  override fun onDestroy(){
    val next=replacement;replacement=null;handler.removeCallbacks(timeout);release();stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy()
    if(next!=null&&next.getIntExtra("audioGeneration",-1)==cancellation)try{ContextCompat.startForegroundService(this,next)}catch(_:Exception){AdhanEngine.prefs(this).edit().putString("error","PLAYBACK_RESTART_FAILED").apply()}
  }
}
