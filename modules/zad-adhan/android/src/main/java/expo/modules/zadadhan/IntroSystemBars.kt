package expo.modules.zadadhan

import android.app.Activity
import android.view.Window
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.util.WeakHashMap

/** Window-scoped immersive intro; repeated resume calls retain the original bar state. */
object IntroSystemBars {
  private data class Previous(val status:Boolean,val navigation:Boolean,val behavior:Int)
  private val saved=WeakHashMap<Window,Previous>()
  fun set(activity:Activity,enabled:Boolean) {
    val window=activity.window
    val controller=WindowCompat.getInsetsController(window,window.decorView)
    val status=WindowInsetsCompat.Type.statusBars();val navigation=WindowInsetsCompat.Type.navigationBars()
    if(enabled){
      if(!saved.containsKey(window)){
        val insets=ViewCompat.getRootWindowInsets(window.decorView)
        saved[window]=Previous(insets?.isVisible(status)?:true,insets?.isVisible(navigation)?:true,controller.systemBarsBehavior)
      }
      controller.systemBarsBehavior=WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      controller.hide(status or navigation)
    } else {
      val previous=saved.remove(window)?:return
      controller.systemBarsBehavior=previous.behavior
      if(previous.status)controller.show(status)else controller.hide(status)
      if(previous.navigation)controller.show(navigation)else controller.hide(navigation)
    }
  }
}
