package expo.modules.zadadhan

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool

/** Foreground UI effect only. Never requests audio focus or changes device volume. */
object TasbihSound {
  private var pool: SoundPool? = null
  private var sample = 0
  private var stream = 0
  private var ready = false

  @Synchronized fun prepare(context: Context) {
    if (pool != null) return
    val sound = SoundPool.Builder().setMaxStreams(1).setAudioAttributes(
      AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
    ).build()
    pool = sound
    sound.setOnLoadCompleteListener { loaded, id, status ->
      synchronized(this) { if (pool === loaded && sample == id) ready = status == 0 }
    }
    try { sample = sound.load(context.applicationContext, R.raw.tasbih_bead, 1) }
    catch (_: Exception) { release() }
  }

  @Synchronized fun play(): Boolean {
    if (!ready) return false
    stream = pool?.play(sample, .55f, .55f, 1, 0, 1f) ?: 0
    return stream != 0
  }

  @Synchronized fun stop() { if (stream != 0) pool?.stop(stream); stream = 0 }
  @Synchronized fun release() {
    stop(); ready = false; sample = 0
    val old = pool; pool = null; old?.release()
  }
}
