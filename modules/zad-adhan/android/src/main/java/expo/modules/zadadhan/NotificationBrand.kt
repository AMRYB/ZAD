package expo.modules.zadadhan

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory

object NotificationBrand {
  @Volatile private var cached:Bitmap?=null
  @Synchronized fun artwork(c:Context):Bitmap {
    cached?.let {return it}
    val bitmap=BitmapFactory.decodeResource(c.resources,R.drawable.zad_brand_art)
    return Bitmap.createScaledBitmap(bitmap,256,256,true).also {cached=it;if(it!==bitmap)bitmap.recycle()}
  }
}
