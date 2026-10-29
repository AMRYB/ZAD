package expo.modules.zadadhan

import android.content.Context
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest

/** Fixed, hash-pinned private-build recordings. Never substitutes a different voice. */
object AdhanAudio {
  private fun catalogue(c:Context)=JSONObject(c.assets.open("zad-adhan/catalogue.json").bufferedReader().use { it.readText() })
  fun clips(c:Context)=catalogue(c).getJSONObject("clips")
  fun sequence(c:Context,date:String,prayer:String):List<String> {
    val data=catalogue(c);val entry=data.getJSONObject("sequences").getJSONObject(AdhanSequence.slot(date,prayer))
    return listOf(entry.getString("intro"),entry.getString("adhan"),data.getString("afterAdhan"))
  }
  private fun hash(bytes:ByteArray)=MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") {"%02x".format(it)}
  private fun file(c:Context,id:String)=File(File(c.filesDir,"adhan-audio-v1"),"$id.mp3")
  fun ready(c:Context):Boolean=try { val clips=clips(c);clips.keys().asSequence().all {file(c,it).length()==clips.getJSONObject(it).getLong("bytes")} }catch(_:Exception){false}
  @Synchronized fun ensure(c:Context,id:String):File {
    val clip=clips(c).getJSONObject(id);require(Regex("[a-z-]+").matches(id))
    val expected=clip.getString("sha256");val target=file(c,id)
    if(target.length()==clip.getLong("bytes")&&hash(target.readBytes())==expected)return target
    val bytes=c.assets.open("zad-adhan/$id.mp3").use { input->
      val out=java.io.ByteArrayOutputStream();val buffer=ByteArray(8192)
      while(true){val count=input.read(buffer);if(count<0)break;require(out.size()+count<=8000000);out.write(buffer,0,count)};out.toByteArray()
    }
    require(bytes.size.toLong()==clip.getLong("bytes")&&hash(bytes)==expected) {"AUDIO_CHANGED"}
    target.parentFile!!.mkdirs();val temp=File(target.parentFile,"$id.tmp");temp.writeBytes(bytes);check(temp.renameTo(target));return target
  }
  fun ensureAll(c:Context){val ids=clips(c).keys();while(ids.hasNext())ensure(c,ids.next())}
  fun label(c:Context,id:String,en:Boolean)=clips(c).getJSONObject(id).getString(if(en)"en" else "ar")
}
