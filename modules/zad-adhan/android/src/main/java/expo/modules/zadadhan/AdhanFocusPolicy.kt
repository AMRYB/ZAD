package expo.modules.zadadhan

/** Android focus event values; independent of MediaPlayer for deterministic JVM tests. */
class AdhanFocusPolicy {
  private var mode=1
  val paused get()=mode == -1 || mode == -2
  fun change(event:Int){if(event in listOf(1,-1,-2,-3))mode=event}
  fun volume(muted:Boolean):Float=if(muted||paused)0f else if(mode == -3).2f else 1f
  fun reset(){mode=1}
}
