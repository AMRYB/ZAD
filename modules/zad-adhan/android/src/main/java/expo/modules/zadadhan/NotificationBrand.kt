package expo.modules.zadadhan

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF

object NotificationBrand {
  private val cached=mutableMapOf<String,Bitmap>()
  @Synchronized fun artwork(c:Context):Bitmap {
    val variant=Branding.variant(c)
    cached[variant]?.let {return it}
    val bitmap=BitmapFactory.decodeResource(c.resources,if(variant=="night")R.drawable.zad_icon_night else R.drawable.zad_icon_day,BitmapFactory.Options().apply {inSampleSize=8})
    // Enlarge the artwork, removing the source's 12.5% outer whitespace.
    val result=Bitmap.createBitmap(256,256,Bitmap.Config.ARGB_8888)
    Canvas(result).drawBitmap(bitmap,null,RectF(-43.52f,-43.52f,299.52f,299.52f),Paint(Paint.FILTER_BITMAP_FLAG))
    bitmap.recycle()
    return result.also {cached[variant]=it}
  }
}
