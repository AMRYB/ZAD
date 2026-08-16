const {withAndroidManifest,withAndroidStyles}=require('expo/config-plugins');
function launcherAliases(manifest,pkg){
  const app=manifest.application?.[0];if(!app)throw new Error('ANDROID_APPLICATION_MISSING');
  const main=app.activity?.find(a=>a.$?.['android:name']==='.MainActivity'||a.$?.['android:name']===pkg+'.MainActivity');
  if(!main)throw new Error('ANDROID_MAIN_ACTIVITY_MISSING');
  main['intent-filter']=(main['intent-filter']??[]).filter(f=>!(f.action?.some(a=>a.$?.['android:name']==='android.intent.action.MAIN')&&f.category?.some(c=>c.$?.['android:name']==='android.intent.category.LAUNCHER')));
  const names=[pkg+'.MorningIcon',pkg+'.EveningIcon'];
  app['activity-alias']=(app['activity-alias']??[]).filter(a=>!names.includes(a.$?.['android:name']));
  for(const [index,variant] of ['day','night'].entries())app['activity-alias'].push({$: {'android:name':names[index],'android:targetActivity':pkg+'.MainActivity','android:exported':'true','android:enabled':index===0?'true':'false','android:label':'@string/app_name','android:icon':'@drawable/zad_launcher_'+variant},'intent-filter':[{action:[{$:{'android:name':'android.intent.action.MAIN'}}],category:[{$:{'android:name':'android.intent.category.LAUNCHER'}}]}]});
  return manifest;
}
module.exports=config=>{
  config=withAndroidManifest(config,c=>{c.modResults.manifest=launcherAliases(c.modResults.manifest,c.android.package);return c;});
  return withAndroidStyles(config,c=>{
    const styles=c.modResults.resources.style??=[];
    let splash=styles.find(s=>s.$?.name==='Theme.App.SplashScreen');
    if(!splash){splash={$:{name:'Theme.App.SplashScreen',parent:'AppTheme'},item:[]};styles.push(splash);}
    const values={'android:windowBackground':'#080E13','android:windowSplashScreenBackground':'#080E13','android:windowSplashScreenAnimatedIcon':'@drawable/zad_splash_blank','android:windowSplashScreenIconBackgroundColor':'@android:color/transparent'};
    splash.item=(splash.item??[]).filter(i=>!(i.$?.name in values));
    for(const [name,value] of Object.entries(values))splash.item.push({$:{name},_:value});
    return c;
  });
};
module.exports.launcherAliases=launcherAliases;
