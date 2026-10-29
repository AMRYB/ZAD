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
    @Volatile var muted=false
    @Volatile var suspended=false
    @Volatile private var controlSession=""
    const val STOP="zad.adhan.STOP"
    const val MUTE="zad.adhan.MUTE"
    const val UNMUTE="zad.adhan.UNMUTE"
    private const val ID=71033
    private val cancellation=java.util.concurrent.atomic.AtomicInteger()
    fun start(c:Context,intent:Intent){ContextCompat.startForegroundService(c,intent.putExtra("audioGeneration",cancellation.get()))}
    fun stop(c:Context){cancellation.incrementAndGet();c.stopService(Intent(c,AdhanPlaybackService::class.java))}
    fun setMuted(c:Context,value:Boolean){val token=controlSession;if(playing&&token.isNotEmpty())c.startService(Intent(c,AdhanPlaybackService::class.java).setAction(if(value)MUTE else UNMUTE).putExtra("session",token))}
  }
  private var player:MediaPlayer?=null
  private var focus:AudioFocusRequest?=null
  private var focusHeld=false
  private var prepared=false
  private var started=false
  private var resumePending=false
  private val focusPolicy=AdhanFocusPolicy()
  private var focusListener:AudioManager.OnAudioFocusChangeListener?=null
  private var wake:PowerManager.WakeLock?=null
  private var run=0
  private var stopping=false
  private var replacement:Intent?=null
  private var session=""
  private var activeEvent:JSONObject?=null
  private var notificationClip=""
  private val handler=Handler(Looper.getMainLooper())
  private val timeout=Runnable { fail() }
  private fun applySoundState(){
    suspended=focusPolicy.paused
    val volume=focusPolicy.volume(muted)
    player?.let {if(prepared){
      it.setVolume(volume,volume)
      if(suspended){if(started&&(it.isPlaying||it.currentPosition<it.duration)){resumePending=true;if(it.isPlaying)it.pause()}}
      else if(!started||resumePending){it.start();started=true;resumePending=false}
    }}
    handler.removeCallbacks(timeout)
    if(suspended){if(wake?.isHeld==true)wake?.release()}
    else {if(wake?.isHeld==false)wake?.acquire(660000);handler.postDelayed(timeout,600000)}
  }
  private fun resumeFocus(){
    val audio=getSystemService(AudioManager::class.java)
    val granted=if(Build.VERSION.SDK_INT>=26)focus?.let {audio.requestAudioFocus(it)} else focusListener?.let {listener->
      @Suppress("DEPRECATION")
      audio.requestAudioFocus(listener,AudioManager.STREAM_ALARM,AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
    }
    if(granted==AudioManager.AUDIOFOCUS_REQUEST_GRANTED)focusPolicy.change(AudioManager.AUDIOFOCUS_GAIN)
  }
  override fun onBind(intent:Intent?):IBinder?=null
  private fun notification(event:JSONObject?,clip:String){
    notificationClip=clip
    val en=AdhanEngine.config(this).optString("locale")=="en"
    fun control(action:String)=PendingIntent.getService(this,ID,Intent(this,AdhanPlaybackService::class.java).setAction(action)
      .setData(android.net.Uri.parse("zad-adhan://playback/$session/$action")).putExtra("session",session),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val stop=control(STOP)
    val sound=control(if(muted||suspended)UNMUTE else MUTE)
    val n=NotificationCompat.Builder(this,AdhanEngine.PLAYBACK_CHANNEL).setSmallIcon(R.drawable.zad_notification).setLargeIcon(NotificationBrand.artwork(this))
      .setContentTitle(AdhanNotification.title(this,event)).setContentText(AdhanAudio.label(this,clip,en)+(if(suspended){if(en)" · Paused for other audio" else " · متوقف مؤقتًا لصوت آخر"}else if(muted){if(en)" · Muted" else " · مكتوم"}else ""))
      .setContentIntent(AdhanNotification.open(this)).setOngoing(true).setOnlyAlertOnce(true)
      .setCategory(NotificationCompat.CATEGORY_ALARM).setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
      .addAction(android.R.drawable.ic_media_pause,if(en)"Stop audio" else "إيقاف الصوت",stop)
      .addAction(if(muted||suspended)android.R.drawable.ic_lock_silent_mode_off else android.R.drawable.ic_lock_silent_mode,
        if(suspended){if(en)"Resume" else "استئناف الصوت"}else if(muted){if(en)"Unmute" else "تشغيل الصوت"}else{if(en)"Mute" else "كتم الصوت"},sound).build()
    if(playing){NotificationManagerCompat.from(this).notify(ID,n)}
    else if(Build.VERSION.SDK_INT>=29)startForeground(ID,n,ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
    else startForeground(ID,n)
  }
  override fun onStartCommand(intent:Intent?,flags:Int,startId:Int):Int {
    if(intent?.action==Branding.MEDIA_REFRESH){if(playing&&currentClip.isNotEmpty())notification(activeEvent,currentClip);return START_NOT_STICKY}
    if(intent?.action in listOf(STOP,MUTE,UNMUTE)){
      // A notification from an earlier run must never control a later prayer.
      if(!playing||session.isEmpty()||intent?.getStringExtra("session")!=session){if(!playing)stopSelf();return START_NOT_STICKY}
      if(intent?.action==STOP){cancellation.incrementAndGet();replacement=null;halt()}
      else try{muted=intent?.action==MUTE;if(!muted&&focusPolicy.paused)resumeFocus();applySoundState();notification(activeEvent,notificationClip)}catch(_:Exception){fail()}
      return START_NOT_STICKY
    }
    if(intent==null||intent.getIntExtra("audioGeneration",cancellation.get())!=cancellation.get()){halt();return START_NOT_STICKY}
    // A new start can arrive after stopSelf but before Android calls onDestroy.
    // Save it for the new instance; never prepare audio in the instance being destroyed.
    if(stopping){replacement=Intent(intent);return START_NOT_STICKY}
    val event=try{intent?.getStringExtra("event")?.let(::JSONObject)}catch(_:Exception){null}
    val preview=intent?.getBooleanExtra("preview",false)==true
    if(!preview&&(event==null||!AdhanEngine.validEvent(this,event))){halt();return START_NOT_STICKY}
    try{
      release();handler.removeCallbacks(timeout);AdhanEngine.channels(this)
      session=java.util.UUID.randomUUID().toString();controlSession=session;activeEvent=event
      val date=if(preview)requireNotNull(intent?.getStringExtra("date")) else event!!.getString("date")
      val prayer=if(preview)requireNotNull(intent?.getStringExtra("prayer")) else event!!.getString("prayer")
      val clips=AdhanAudio.sequence(this,date,prayer)
      notification(event,clips.first());playing=true
      val attributes=AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()
      val audio=getSystemService(AudioManager::class.java)
      val token=run;val stopVersion=cancellation.get()
      focusListener=AudioManager.OnAudioFocusChangeListener {change->handler.post {
        if(token==run&&stopVersion==cancellation.get()&&focusHeld&&playing&&!stopping)try{focusPolicy.change(change);applySoundState();notification(activeEvent,notificationClip)}catch(_:Exception){fail()}
      }}
      val result=if(Build.VERSION.SDK_INT>=26){
        focus=AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT).setAudioAttributes(attributes).setOnAudioFocusChangeListener(focusListener!!,handler).setAcceptsDelayedFocusGain(false).build()
        audio.requestAudioFocus(focus!!)
      }else{@Suppress("DEPRECATION") audio.requestAudioFocus(focusListener!!,AudioManager.STREAM_ALARM,AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)}
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
      prepared=false;started=false;resumePending=false;player?.release();player=null
      val clip=clips[index];val recording=AdhanAudio.ensure(this,clip)
      val next=MediaPlayer();player=next
      next.setAudioAttributes(attributes);next.setDataSource(recording.absolutePath)
      next.setOnPreparedListener {if(token==run&&player===it){prepared=true;currentClip=clip;applySoundState();notification(event,clip)}}
      next.setOnCompletionListener {if(token==run&&player===it)play(clips,index+1,token,attributes,event)}
      next.setOnErrorListener {_,_,_->if(token==run)fail();true}
      next.prepareAsync()
    }catch(_:Exception){fail()}
  }
  private fun fail(){AdhanEngine.prefs(this).edit().putString("error","PLAYBACK_FAILED").apply();halt()}
  private fun halt(){if(stopping)return;stopping=true;handler.removeCallbacks(timeout);release();stopSelf()}
  private fun release(){
    run++;playing=false;currentClip="";muted=false;suspended=false;session="";controlSession="";activeEvent=null;notificationClip="";focusHeld=false;prepared=false;started=false;resumePending=false;focusPolicy.reset();player?.release();player=null
    if(wake?.isHeld==true)wake?.release();wake=null
    val audio=getSystemService(AudioManager::class.java)
    if(Build.VERSION.SDK_INT>=26){val old=focus;focus=null;old?.let {audio.abandonAudioFocusRequest(it)}}
    else{focusListener?.let {listener->@Suppress("DEPRECATION") audio.abandonAudioFocus(listener)}}
    focusListener=null
  }
  override fun onDestroy(){
    val next=replacement;replacement=null;handler.removeCallbacks(timeout);release();stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy()
    if(next!=null&&next.getIntExtra("audioGeneration",-1)==cancellation.get())try{ContextCompat.startForegroundService(this,next)}catch(_:Exception){AdhanEngine.prefs(this).edit().putString("error","PLAYBACK_RESTART_FAILED").apply()}
  }
}
