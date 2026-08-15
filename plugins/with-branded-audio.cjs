const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {withDangerousMod}=require('expo/config-plugins');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const changes={
 'AudioModule.kt':{hash:'6613ccc5b2ed971ec6ff4fa65ccafc04cce95f88d6e21d88a12cd3d124b9a523',edits:[[
`                else -> MediaItem.fromUri(uri)
              }
            }
          }
          playlist.loadInitialPlaylist()`,
`                else -> MediaItem.fromUri(uri)
              }.buildUpon().setMediaMetadata(androidx.media3.common.MediaMetadata.Builder().setTitle(source.name).build()).build()
            }
          }
          playlist.loadInitialPlaylist()`]]},
 'service/AudioControlsService.kt':{hash:'81784e7bee485a6342df944cef20cae755d8f79fda8d8d20aca6ba5fffeb8608',edits:[['          updateMetadata(metadata)','          updateMetadata(metadata)\n          updateArtwork(currentArtwork)'],[
'.setSmallIcon(androidx.media3.session.R.drawable.media3_icon_circular_play)',
'.setSmallIcon(resources.getIdentifier("zad_notification", "drawable", packageName).takeIf { it != 0 } ?: androidx.media3.session.R.drawable.media3_icon_circular_play)'],[
`      currentArtwork = bitmap
      postOrStartForegroundNotification(startInForeground = false)`,
`      currentArtwork = bitmap
      sessionMetadataPlayer?.updateArtwork(bitmap)
      postOrStartForegroundNotification(startInForeground = false)`],[
`      override fun onPlaybackStateChanged(playbackState: Int) {
        postOrStartForegroundNotification(startInForeground = false)
      }`,
`      override fun onPlaybackStateChanged(playbackState: Int) {
        sessionMetadataPlayer?.refreshMetadata()
        postOrStartForegroundNotification(startInForeground = false)
      }

      override fun onMediaItemTransition(mediaItem: androidx.media3.common.MediaItem?, reason: Int) {
        sessionMetadataPlayer?.refreshMetadata()
        postOrStartForegroundNotification(startInForeground = false)
      }

      override fun onTimelineChanged(timeline: androidx.media3.common.Timeline, reason: Int) {
        sessionMetadataPlayer?.refreshMetadata()
      }`]]},
 'service/MetadataInjectingPlayer.kt':{hash:'03cec884ac2c75ee8aedb06357eb280f0bcc0d56a56e9d89effce3f4001d9626',edits:[[
'  private var injectedMetadata: Metadata? = null',
'  private var injectedMetadata: Metadata? = null\n  private var artworkBytes: ByteArray? = null'],[
'      .setTitle(metadata?.title)',
'      .setTitle(currentMediaItem?.mediaMetadata?.title?.takeIf { it.isNotBlank() } ?: metadata?.title)\n      .setDurationMs(duration.takeIf { it > 0 })'],[
'      .setArtworkData(null, null)',
'      .setArtworkData(artworkBytes, MediaMetadata.PICTURE_TYPE_FRONT_COVER)'],[
`    val events = Player.Events(`,
`    refreshMetadata()
  }

  fun updateArtwork(bitmap: android.graphics.Bitmap?) {
    if (Looper.myLooper() != applicationLooper) {
      handler.post { updateArtwork(bitmap) }
      return
    }
    artworkBytes = bitmap?.let { image -> java.io.ByteArrayOutputStream().use { stream -> image.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, stream); stream.toByteArray() } }
    refreshMetadata()
  }

  // Publish the loaded ayah duration/title to Android even when JavaScript is suspended.
  fun refreshMetadata() {
    if (Looper.myLooper() != applicationLooper) {
      handler.post { refreshMetadata() }
      return
    }
    val newMetadata = mediaMetadata
    val events = Player.Events(`]]}
};
function replaceAllChecked(text,from,to){if(!text.includes(from))throw new Error('EXPO_AUDIO_PATCH_CONTEXT_CHANGED');return text.split(from).join(to);}
function patchText(name,input){
 const spec=changes[name];if(!spec)throw new Error('UNKNOWN_AUDIO_PATCH');const text=input.replaceAll('\r\n','\n');
 if(sha(text)===spec.hash)return spec.edits.reduce((value,[from,to])=>replaceAllChecked(value,from,to),text);
 let original=text;
 try{for(const [from,to] of [...spec.edits].reverse())original=replaceAllChecked(original,to,from);}catch{throw new Error('EXPO_AUDIO_PATCH_SOURCE_CHANGED');}
 if(sha(original)!==spec.hash)throw new Error('EXPO_AUDIO_PATCH_SOURCE_CHANGED');return text;
}
function apply(projectRoot,{verify=false}={}){
 if(!JSON.parse(fs.readFileSync(path.join(projectRoot,'package.json'),'utf8')).expo?.autolinking?.android?.buildFromSource?.includes('expo-audio'))throw new Error('EXPO_AUDIO_SOURCE_BUILD_REQUIRED');
 const root=path.dirname(require.resolve('expo-audio/package.json',{paths:[projectRoot]}));
 if(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version!=='58.0.10')throw new Error('EXPO_AUDIO_PATCH_VERSION_CHANGED');
 const base=path.join(root,'android/src/main/java/expo/modules/audio');const result={};
 for(const name of Object.keys(changes)){const file=path.join(base,name),input=fs.readFileSync(file,'utf8'),next=patchText(name,input);if(verify&&input.replaceAll('\r\n','\n')!==next)throw new Error('EXPO_AUDIO_PATCH_MISSING');if(!verify)fs.writeFileSync(file,next);result[name]=sha(next);}
 return result;
}
module.exports=config=>withDangerousMod(config,['android',async c=>{apply(c.modRequest.projectRoot);return c;}]);
module.exports.apply=apply;module.exports.patchText=patchText;module.exports.files=Object.keys(changes);
if(require.main===module)process.stdout.write(JSON.stringify(apply(path.resolve(process.argv[2]??'.'),{verify:process.argv.includes('--verify')}),null,2)+'\n');
