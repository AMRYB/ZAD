package expo.modules.zadadhan
import org.junit.Assert.*
import org.junit.Test
class AdhanFocusPolicyTest {
  @Test fun notificationDucksAndRestoresWithoutPausing(){val p=AdhanFocusPolicy();p.change(-3);assertFalse(p.paused);assertEquals(.2f,p.volume(false),.0001f);p.change(1);assertFalse(p.paused);assertEquals(1f,p.volume(false),.0001f)}
  @Test fun transientLossPreservesPauseUntilGain(){val p=AdhanFocusPolicy();p.change(-2);assertTrue(p.paused);assertEquals(0f,p.volume(false),.0001f);p.change(1);assertFalse(p.paused);assertEquals(1f,p.volume(false),.0001f)}
  @Test fun gainCannotOverrideManualMute(){val p=AdhanFocusPolicy();p.change(-3);assertEquals(0f,p.volume(true),.0001f);p.change(-2);p.change(1);assertEquals(0f,p.volume(true),.0001f);assertEquals(1f,p.volume(false),.0001f)}
  @Test fun permanentLossDoesNotDiscardTheSession(){val p=AdhanFocusPolicy();p.change(-1);assertTrue(p.paused);p.change(1);assertFalse(p.paused);p.reset();assertEquals(1f,p.volume(false),.0001f)}
}
