package expo.modules.zadadhan

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

object EsaClient {
  const val SOURCE="https://www.esa.gov.eg/monthlymwaket.aspx"
  const val AUDIO="https://quran-fjamfcbbeybteyat.z01.azurefd.net/Audio3/Adan/1027.mp3"
  const val AUDIO_SHA="39964e1b6df88cfc30e66ca18cbc8efe5829fbf82d24210ebddc3d435eebd96c"
  private fun sha(bytes: ByteArray)=MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
  private fun request(url: String, body: String?=null, referer: String?=null, limit: Int=1000000): ByteArray {
    val connection=URL(url).openConnection() as HttpURLConnection
    try {
      connection.instanceFollowRedirects=false;connection.connectTimeout=15000;connection.readTimeout=20000
      connection.setRequestProperty("User-Agent","Mozilla/5.0 (compatible; ZAD prayer timetable reader)")
      if(referer!=null)connection.setRequestProperty("Referer",referer)
      if(body!=null){ connection.requestMethod="POST";connection.doOutput=true;connection.setRequestProperty("Content-Type","application/x-www-form-urlencoded");connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) } }
      require(connection.responseCode==200) { "HTTP_${connection.responseCode}" }
      val result=connection.inputStream.use { it.readBytesBounded(limit) };require(result.isNotEmpty());return result
    } finally { connection.disconnect() }
  }
  private fun java.io.InputStream.readBytesBounded(limit: Int): ByteArray {
    val out=java.io.ByteArrayOutputStream();val buffer=ByteArray(8192)
    while(true){ val count=read(buffer);if(count<0)break;require(out.size()+count<=limit) { "RESPONSE_TOO_LARGE" };out.write(buffer,0,count) };return out.toByteArray()
  }
  private fun key(city: String,month: String)="month-"+sha("$city:$month".toByteArray())+".json"
  private fun directory(context: Context)=File(context.filesDir,"esa-months").apply { mkdirs() }
  fun cached(context: Context,city: String,month: String): JSONObject? = try {
    val data=JSONObject(File(directory(context),key(city,month)).readText())
    require(data.getString("city")==city&&data.getString("month")==month&&data.getString("source")==SOURCE)
    require(data.getJSONArray("days").length() in 28..31);data
  }catch(_:Exception){null}
  @Synchronized fun month(context: Context,city: String,month: String): JSONObject {
    require(city.length in 1..80);EsaParser.calendar("$month-01")
    val cached=cached(context,city,month)
    if(cached!=null&&System.currentTimeMillis()-cached.getLong("fetchedAt")<86400000)return cached
    try{
      val form=request(SOURCE).toString(Charsets.UTF_8)
      val html=request(SOURCE,EsaParser.form(form,city,month),SOURCE).toString(Charsets.UTF_8)
      val parsed=EsaParser.parse(html,city,month)
      val days=JSONArray();for(day in parsed){val times=JSONObject();EsaParser.keys.forEachIndexed { i,key->times.put(key,day.times[i]) };days.put(JSONObject().put("date",day.date).put("hijri",day.hijri).put("times",times))}
      val result=JSONObject().put("city",city).put("month",month).put("days",days).put("fetchedAt",System.currentTimeMillis()).put("source",SOURCE)
      val dir=directory(context);val file=File(dir,key(city,month));val temp=File(dir,"${file.name}.tmp");temp.writeText(result.toString());check(temp.renameTo(file))
      dir.listFiles()?.filter { it.name.endsWith(".json") }?.sortedByDescending { it.lastModified() }?.drop(24)?.forEach { it.delete() }
      return result
    }catch(e:Exception){if(cached!=null)return cached;throw e}
  }
  fun audioFile(context: Context)=File(context.filesDir,"adhan-rifaat.mp3")
  @Synchronized fun ensureAudio(context: Context): File {
    val file=audioFile(context)
    if(file.exists()&&sha(file.readBytes())==AUDIO_SHA)return file
    val bytes=request(AUDIO,referer="https://audio.islamweb.net/",limit=2000000)
    require(sha(bytes)==AUDIO_SHA) { "AUDIO_CHANGED" }
    val temp=File(context.filesDir,"adhan-rifaat.tmp");temp.writeBytes(bytes);check(temp.renameTo(file));return file
  }
}
