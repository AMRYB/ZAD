# توثيق طلبات المصحف الإلكتروني بجامعة الملك سعود

تاريخ الفحص: **22 أكتوبر 2026**، وفق المنطقة الزمنية `Africa/Cairo`.

المصدر الوحيد للفحص هو [quran.ksu.edu.sa](https://quran.ksu.edu.sa/) وموارده التي حمّلتها واجهته. هذا توثيق لسلوك واجهة الويب المشاهد، وليس مواصفة API منشورة من الجامعة أو تعهدًا باستقرارها.

## 1. النتيجة ومستويات الإثبات

| الوظيفة | المسار الأصلي | نوع الاستجابة المشاهد | الإثبات |
|---|---|---|---|
| صور مصحف حفص | `/ayat/safahat1/{page}.png` | `image/png` | طلبات المتصفح للصور 1، 2، 3، 4 |
| صوت الحصري لكل آية | `/ayat/mp3/Husary_64kbps/{SSS}{AAA}.mp3` | `audio/mpeg`، الحالة `206` | تشغيل 1:1 ثم 1:2، وتحميل 1:3 مقدمًا |
| إحداثيات التحديد | `/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page={page}` | JSON لنقاط نهاية الآيات | طلبات الصفحات 1، 2، 3، ومقارنة مستطيلات DOM |
| هامش التفسير الميسر | `/interface.php?ui=pc&do=tarjama&tafsir=ar_mu&b_sura=…&b_aya=…&e_sura=…&e_aya=…&11` | JSON تحت المفتاح `tafsir` | نطاقات الصفحات 1، 2، 3 |
| نافذة تفسير السعدي | `/interface.php?ui=pc&do=tafsir&author=sa3dy&sura=…&aya=…` | نص آية ثم `|||` ثم HTML | الآيتان 1:4 و1:5 |
| السور والصفحات | `/js/quran-data.js` مع `/js/engine.js` | JavaScript وبيانات تنقل محلية | نقر قائمة السور وأزرار الصفحات، وفحص الشيفرة |

نستخدم ثلاثة أوصاف:

- **متحقق بالتشغيل:** ظهر طلب أو سلوك فعلي في المتصفح، أو طابقت نتيجة حسابية DOM المرصود.
- **متحقق من الشيفرة فقط:** موجود في JavaScript المحمّل، لكن لم يُشغّل ذلك الفرع خلال الفحص.
- **غير محسوم:** لا تكفي العينة أو الشيفرة لإثباته. لا يُعامل كتخمين مؤكد.

## 2. المنهج والأدلة

فُتح الموقع أولًا في المتصفح المدمج، ثم نُقر «الدخول للمصحف الإلكتروني». لا تعرض أدوات هذا المتصفح واجهة Network/CDP، لذلك جرى الالتقاط في جلسة Chrome منفصلة مؤقتة، بلا استخدام ملف تعريف المستخدم، بواسطة Playwright و**Chrome DevTools Protocol**. الإصدار الذي أعاده `Browser.getVersion`: `Chrome/156.0.8078.47`، إصدار البروتوكول `1.3`. جلسة الالتقاط كانت headless، والتفاعلات نقرات على عناصر الواجهة نفسها.

استُخدمت `Network.enable` وأحداث `Network.requestWillBeSent` و`Network.responseReceived` و`Network.loadingFinished` و`Network.loadingFailed`، ثم `Network.getResponseBody`. مصدر Method وURL هو حدث الطلب، ومصدر Status وContent-Type هو حدث الاستجابة. فُحصت أجسام JavaScript التي حملها المتصفح، ولم تُستبدل بخادم أو مكتبة قرآن أخرى.

سُجلت 81 عملية تحميل/طلب في جلسة المتصفح، معظمها صور واجهة وCSS؛ السجل المرفق يحتفظ بـ27 سجلًا ذا صلة بالتحليل، بما فيها التكرارات من cache، و8 طلبات `interface.php`. التحقق الإضافي للأمثلة أرسل **خمسة طلبات متتابعة فقط**. لم يُجرَ مسح شامل للصفحات أو القراء أو التفاسير، ولا تعديل على محتوى الموقع أو إرسال نماذج.

لم تُحفظ أو تُنشر ترويسات Cookie أو Set-Cookie أو Authorization، أو Tokens، أو حالة التخزين الخاصة بالمستخدم. يحتوي سجل الأدلة على قائمة حقول محدودة للطلبات العامة، ولا يمثل HAR كاملًا.

الملفات المرافقة:

- [ksu-network-evidence.json](ksu-network-evidence.json): الطلبات، المعاملات، الحالات، الأنواع، initiator لبعض XHR، عينات مقتضبة، وبصمات المصادر.
- [ksu-api-examples.ts](ksu-evidence/ksu-api-examples.ts): بناء الروابط، تحليل التفسير، حساب التظليل وربط الآية بالصفحة، واختبارات قابلة للتشغيل.
- [ksu-highlight-fixtures.json](ksu-evidence/ksu-highlight-fixtures.json): نقاط JSON ومستطيلات DOM الفعلية لثلاث صفحات.
- [ksu-navigation-metadata.json](ksu-evidence/ksu-navigation-metadata.json): نسخة بيانات التنقل المقروءة من `QuranData` في صفحة KSU أثناء الفحص.
- [لقطة نافذة تفسير السعدي](ksu-evidence/ksu-tafsir-evidence.png).

عينات النصوص في التوثيق والسجل مقتطفات أو إسقاطات من الاستجابة، وليست الاستجابات النصية الكاملة. يشير `sampleTruncated` إلى ذلك. بيانات الإحداثيات العددية المستخدمة في الاختبارات كاملة للصفحات الثلاث.

## 3. التفاعلات التي أجريت

| التفاعل | ما تحقق منه |
|---|---|
| فتح `index.php` | بدء `1_1`، مصحف `hafs`، قارئ `husary`، هامش `ar_mu`؛ تحميل صورتي 1 و2، وإحداثيات ومعاني الصفحة 1 |
| نقر «تشغيل» | طلب `001001.mp3` مع `Range: bytes=0-`، ثم انتقال تلقائي إلى `001002.mp3` |
| مراقبة الآية الثانية | الصوت الأساسي يعمل عند `currentTime=1.345022`، ومدته `6.243265` ثانية؛ العناصر النشطة `1_2__hilite_1` و`1_2__hilite_2`؛ المشغل الثاني يحمل `001003.mp3` وهو متوقف |
| نقر «إيقاف»، ثم منطقة الآية 1:4 | تغير `#aya=1_4` والتظليل إلى `1_4__hilite_1`؛ لا طلب جديد لخدمة آية عند الاختيار وحده في صفحة محملة |
| فتح «التفسير» واختيار «السعدي» | XHR `do=tafsir&author=sa3dy&sura=1&aya=4`، ثم نافذة تعرض الآية والتفسير |
| نقر التالي داخل التفسير | XHR للآية 1:5؛ بقي عنوان قارئ المصحف `#aya=1_4`، أي أن تنقل نافذة التفسير مستقل عن تحديد المصحف في هذه الحالة |
| اختيار البقرة من قائمة السور | تغير العنوان إلى `#aya=2_1` والصفحة إلى 2 |
| نقر الصفحة التالية | `#aya=2_6` والصفحة 3؛ تحميل صورتي 3 و4، وإحداثيات ومعاني الصفحة 3 |
| الرجوع للصفحة السابقة | اكتمال إحداثيات ومعاني الصفحة 2؛ صورتا 1 و2 ظهرتا من disk cache |
| اختيار الفاتحة مرة أخرى | تحديد 1:1 وإعادة استخدام إحداثيات ومعاني الصفحة 1 من ذاكرة JavaScript |

اختيرت البقرة ثم الصفحة التالية قبل اكتمال طبقات الصفحة 2 أول مرة؛ لذلك ترد طلبات بيانات الصفحة 2 في السجل تحت `prev-page-2`. لا تُنسب تلك الطلبات إلى نقرة السورة السابقة بأثر رجعي. جرى انتظار ظهور طبقات الصفحة الفعلية قبل أخذ fixtures؛ `networkidle` وحده لا يكفي دائمًا بسبب حركة تقليب الصفحات والمؤقتات.

## 4. صور الصفحات

**متحقق بالتشغيل**:

```http
GET https://quran.ksu.edu.sa/ayat/safahat1/1.png
GET https://quran.ksu.edu.sa/ayat/safahat1/2.png
GET https://quran.ksu.edu.sa/ayat/safahat1/3.png
GET https://quran.ksu.edu.sa/ayat/safahat1/4.png
```

لكل منها: Query Parameters = لا يوجد، Status = `200`، Content-Type = `image/png`.

نموذج Response ثنائي، وليس JSON:

```text
1.png: 104404 bytes
أول 16 بايت: 89504e470d0a1a0a0000000d49484452
```

قُرئت الأبعاد الطبيعية `456 × 672` من الصور 1 و2 ثم 3 و4 في DOM. في الرجوع للصفحة 2 أعاد CDP عرض `200` مع `fromDiskCache=true` للصور 1 و2؛ هذه إعادة استخدام cache، وليست إثباتًا لرحلة HTTP جديدة إلى الخادم أو استجابة `304`.

الربط بالواجهة في [engine.js](https://quran.ksu.edu.sa/js/engine.js)، الأسطر 106–127:

- إذا كانت الصفحة الحالية فردية، يحمل `n1=page` و`n2=page+1`.
- إذا كانت زوجية، يحمل `n1=page-1` و`n2=page`.
- الصورة الفردية في `img_right_cont` والزوجية في `img_left_cont`؛ وضع العرض المتقدم يضع هامش المعاني فوق الجانب المقابل للصفحة المحددة.
- العدد بلا أصفار بادئة: `1.png`، لا `001.png`.

تحدد `masahef.hafs` المسار `ayat/safahat1/` فعليًا. توجد في الشيفرة مسارات `warsh/` و`tajweed_png/`، لكن **لم تُختبر** صورها أو حالات HTTP الخاصة بها.

## 5. ملفات التلاوة

**متحقق بالتشغيل**:

| Method | URL | Query | Status | Content-Type | العلاقة بالواجهة |
|---|---|---|---|---|---|
| GET | `https://quran.ksu.edu.sa/ayat/mp3/Husary_64kbps/001001.mp3` | لا يوجد | 206 | `audio/mpeg` | تشغيل 1:1 |
| GET | `https://quran.ksu.edu.sa/ayat/mp3/Husary_64kbps/001002.mp3` | لا يوجد | 206 | `audio/mpeg` | تحميل مقدم، ثم تشغيل 1:2 |
| GET | `https://quran.ksu.edu.sa/ayat/mp3/Husary_64kbps/001003.mp3` | لا يوجد | 206 | `audio/mpeg` | تحميل مقدم للآية التالية؛ لم يُثبت تشغيلها |

ترويسة الطلب المشاهدة للملفات الثلاثة: `Range: bytes=0-`. نموذج جسم الاستجابة لـ`001001.mp3` من CDP: `42003` بايت، وأول 16 بايت:

```text
fff38064000000000000000000000000
```

الترميز هو `SSSAAA.mp3`: السورة والآية، كل منهما ثلاثة أرقام. الربط `husary → Husary_64kbps` موجود في `quraa_map`، و`playAya` يبني اسم الملف بعد padding. تغيير `qaree` في fragment يستخدم مفتاح الواجهة؛ اسم مجلد الصوت هو القيمة المقابلة في الخريطة، فلا يُفترض أنه نفس المفتاح.

**من الشيفرة فقط:** ملفات الاستعاذة والبسملة الخاصة، ومجلدات القراء الآخرين، والترجمة الصوتية. لم تُختبر صلاحيتها جميعًا. `base_mp3url` في الشيفرة هو نفس نطاق KSU؛ لم تُستخدم مصادر صوت بديلة.

## 6. إحداثيات Highlight

**متحقق بالتشغيل** للطلبات الثلاثة:

```http
GET https://quran.ksu.edu.sa/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page=1
GET https://quran.ksu.edu.sa/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page=2
GET https://quran.ksu.edu.sa/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page=3
```

Status = `200`، Content-Type الحرفي = `application/json; charset="utf-8"`.

| Query Parameter | القيمة المشاهدة | ما يمكن إثباته |
|---|---|---|
| `ui` | `pc` | ثابت واجهة الحاسوب في `url_interface` |
| `do` | `hilites` | اختيار بيانات نقاط التظليل |
| `mosshaf` | `hafs` | المصحف المختار؛ لم تختبر قيم أخرى |
| `t` | `28` | ثابت في طلب `drawHilites`؛ دلالته على الخادم غير محسومة |
| `page` | `1`، `2`، `3` | رقم الصفحة |

الاستجابة الكاملة للصفحة 1:

```json
{"1":{"1_1":[181,301],"1_2":[159,325],"1_3":[243,353],"1_4":[138,352],"1_5":[173,378],"1_6":[227,406],"1_7":[191,459]}}
```

الصفحة 2:

```json
{"2":{"2_1":[283,324],"2_2":[284,352],"2_3":[231,380],"2_4":[138,405],"2_5":[191,457]}}
```

الصفحة 3:

```json
{"3":{"2_6":[335,106],"2_7":[148,146],"2_8":[59,185],"2_9":[314,263],"2_10":[136,302],"2_11":[117,340],"2_12":[149,380],"2_13":[112,460],"2_14":[223,537],"2_15":[260,579],"2_16":[60,616]}}
```

مفتاح المستوى الأول رقم الصفحة كنص، ومفتاح المستوى الثاني `sura_aya`. القيم `[x,y]` تُستخدم كنقطة نهاية للآية في ترتيب القراءة. ليست `[left,top,width,height]`؛ يمتد التظليل من نقطة الآية السابقة إلى الحالية مع مراعاة نزول السطر وعنوان السورة. ينبغي الحفاظ على ترتيب الآيات في كائن الاستجابة.

### حساب المستطيلات من JavaScript

المصدر: `engine.js`، `drawHilites` 394–414، `_hlMeta` 418–473، `hilitePage` 474–585، `hl_draw` 587–610.

| ثابت حفص | الصفحتان 1 و2 | بقية الصفحات |
|---|---|---|
| ارتفاع شريط السطر `h` | 20 | 30 |
| الحد الأيسر `mgwidth` | 80 | 40 |
| الحد الأيمن `twidth` | 376 | 416 |
| خصم X، `ofwidth` | 5 | 10 |
| خصم Y، `ofheight` | 10 | 15 |
| بداية أول شريط `prev_top` | 270 | 80 إذا كانت أول آية رقمها 1؛ وإلا 37 |

لكل آية: `left=x-ofwidth` و`top=y-ofheight`. البداية الأفقية للآية الأولى `prev_left=twidth`. عند بداية سورة أخرى داخل الصفحة يضيف الكود `110` إلى `prev_top` ويعيد `prev_left=twidth`. ثم يحسب `diff=top-prev_top`:

1. إذا `diff > 1.6*h`: ثلاثة مستطيلات، نهاية السطر السابق `(mgwidth,prev_top,prev_left-mgwidth,h)`، وبداية السطر الأخير `(left,top,twidth-left,h)`، ثم المساحة الوسطى `(mgwidth,prev_top+h,twidth-mgwidth,diff-h)`.
2. وإلا إذا `diff > 0.6*h`: أول مستطيلين فقط.
3. وإلا: مستطيل واحد `(left,top,prev_left-left,h)`.

الترتيب في الصيغ السابقة هو `(left,top,width,height)`. بعد كل آية تُحدّث `prev_top` و`prev_left`. أسماء العناصر `sura_aya__hilite_1` وحتى `_3`؛ وقد يوجد جزء واحد أو جزآن فقط.

`hl_draw` يستنسخ العنصر `#hilite` ويضعه داخل حاوية الصورة بـCSS `position:absolute`. رغم تمرير إزاحات الحاوية `b_top/b_left`، تعيد الدالة تعيينهما إلى صفر؛ لذلك قيم top/left محلية للحاوية. أسطر تحويل المقاييس في هذه النسخة معلّقة وليست حسابًا فعالًا. لا تُطبّق صيغة تحويل من أبعاد صور عالية الدقة استنادًا إلى التعليقات.

مثال **متحقق بالمقارنة مع DOM**: الآية 2:9، بعد 2:8 ذات `[59,185]`، تعطي `prev_top=170` و`prev_left=49`، ونقطة 2:9 تعطي `top=248` و`left=304`؛ الفرق `78 > 48`:

```json
[
  {"id":"2_9__hilite_1","top":170,"left":40,"width":9,"height":30},
  {"id":"2_9__hilite_2","top":248,"left":304,"width":112,"height":30},
  {"id":"2_9__hilite_3","top":200,"left":40,"width":376,"height":48}
]
```

طابق حساب TypeScript **52 مستطيلًا**: 14 في الصفحة 1، و12 في الصفحة 2، و26 في الصفحة 3، مطابقة عددية تامة لـDOM. فرع وجود بداية سورة وسط الصفحة معروف من الشيفرة، لكنه غير ممثل في هذه الصفحات الثلاث. الكود المرفق مخصص لحفص في وضع القراءة؛ وضع الحفظ وورش والتجويد لم تختبر هندستها.

التنسيق المحمّل من [CSS الأصلي](https://quran.ksu.edu.sa/provider/index.php?g=css&456) يربط `a.hiliter.active` بخلفية `#006a9d` وشفافية `0.1`. حالة hover منفصلة. إضافة `active` هي ما يفعّل الشكل المرئي للتحديد.

## 7. التفسير وهامش المعاني

### أ. نافذة التفسير: `do=tafsir`

```http
GET https://quran.ksu.edu.sa/interface.php?ui=pc&do=tafsir&author=sa3dy&sura=1&aya=4
GET https://quran.ksu.edu.sa/interface.php?ui=pc&do=tafsir&author=sa3dy&sura=1&aya=5
```

لكل طلب: Status `200`، Content-Type الحرفي `text/html;charset="utf-8"`.

| Parameter | المعنى المستدل من التشغيل والشيفرة |
|---|---|
| `ui=pc` | واجهة الحاسوب |
| `do=tafsir` | جلب تفسير آية لنافذة التفسير |
| `author=sa3dy` | تفسير السعدي |
| `sura=1` | رقم السورة |
| `aya=4` أو `5` | رقم الآية |

نموذج مقتطع من الاستجابة الأولى؛ `…` علامة حذف تحريرية:

```html
مَالِكِ يَوْمِ الدِّينِ|||<p><span class="t4">{ مَالِكِ يَوْمِ الدِّينِ }</span> المالك: هو من اتصف بصفة الملك …</p>
```

نموذج بداية الاستجابة الثانية:

```html
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ|||<p>…</p>
```

يعالج `doTafsir` الاستجابة بواسطة `split('|||')`: الجزء الأول للآية، والثاني HTML التفسير. يضيف شريط اختيار السورة والآية والمفسر، وأزرار السابق والتالي. مصدر الطلب في stack كان `doTafsir` عند السطر 1265؛ التالي يستعمل `gotoTafsir` عند 1351.

تتضمن الشيفرة قيم `baghawy` و`katheer` و`qortoby` و`tabary` وغيرها. **المتحقق فعليًا هنا هو `sa3dy` فقط**. تبني الشيفرة رابط قراءة/طباعة مستقلًا تحت `/tafseer/{author}/sura{sura}-aya{aya}.html`، لكن لم يُفتح أو يتحقق Status لذلك الرابط خلال هذه الجلسة.

### ب. هامش المعاني: `do=tarjama`

```http
GET https://quran.ksu.edu.sa/interface.php?ui=pc&do=tarjama&tafsir=ar_mu&b_sura=1&b_aya=1&e_sura=2&e_aya=1&11
GET https://quran.ksu.edu.sa/interface.php?ui=pc&do=tarjama&tafsir=ar_mu&b_sura=2&b_aya=1&e_sura=2&e_aya=6&11
GET https://quran.ksu.edu.sa/interface.php?ui=pc&do=tarjama&tafsir=ar_mu&b_sura=2&b_aya=6&e_sura=2&e_aya=17&11
```

لكل طلب: Status `200`، Content-Type `application/json; charset="utf-8"`.

| Parameter | المعنى المتحقق |
|---|---|
| `ui=pc`, `do=tarjama` | خدمة هامش المعاني |
| `tafsir=ar_mu` | التفسير الميسر المختار في الهامش؛ ليس `author` الخاص بالنافذة |
| `b_sura`, `b_aya` | بداية نطاق الصفحة |
| `e_sura`, `e_aya` | بداية الصفحة التالية، حد نهاية غير مشمول في العينات |
| `11` | مفتاح عارٍ بلا `=`؛ تقرأه URLSearchParams بقيمة فارغة؛ وظيفته على الخادم غير محسومة |

إسقاط قصير من استجابة الصفحة 1:

```json
{"tafsir":{"1_1":{"text":"سورة الفاتحة سميت هذه السورة بالفاتحة؛ لأنه يفتتح بها القرآن العظيم"}}}
```

حُذفت بقية النص والمفاتيح من هذا النموذج. الاستجابة الفعلية تضمنت `1_1` إلى `1_7`. الصفحة 2 تضمنت `2_1` إلى `2_5`، والصفحة 3 تضمنت `2_6` إلى `2_16`، دون `2_17`. يحدد `getTranslation` الحدين من `QuranData.Page[page]` و`[page+1]`، ويخزن النتيجة تحت `tarajem[language][mosshaf][page]`. لا تُعمم خصائص النطاقات غير الصالحة أو حدود آخر صفحة دون فحص إضافي.

## 8. التنقل بين السور والصفحات

لا يظهر في هذا المسار طلب منفصل باسم «قائمة سور» أو «انتقال». بيانات السور وبدايات الصفحات حُمّلت مرة ضمن [quran-data.js](https://quran.ksu.edu.sa/js/quran-data.js): GET، دون Query، `200`، `application/javascript`.

عينات من المصدر وبيانات runtime:

```javascript
QuranData.Sura[1] // [0,7,5,1,'الفاتحة','Al-Faatiha','The Opening','Meccan']
QuranData.Page[1] // [1,1]
QuranData.Page[2] // [2,1]
QuranData.Page[3] // [2,6]
QuranData.Page[4] // [2,17]
// آخر حد في الجدول [115,1] هو sentinel، وليس سورة متاحة.
```

`gotoSura(n)` ينادي `gotoAya(n,1)`. و`gotoPage(n)` يأخذ أول آية من `QuranData[page_key][n]`. دالة `suraSafha` تبحث عن أول بداية صفحة أكبر من الآية أو مساوية لها: تعيد نفس الصفحة في حالة التساوي، والصفحة السابقة عند تجاوز الآية. `page_key='Page'` لحفص. تختلف جداول الروايات الأخرى في الشيفرة؛ لم تُختبر.

أزرار السابق والتالي تزيد/تنقص صفحة واحدة في الوضع المتقدم المشاهد. من الشيفرة: الوضع البسيط ووضع الحفظ ينتقلان بصفحتين. `loadImg` يحمل زوج الصور المناسب، ثم `manOverlays` يجلب بيانات التظليل والمعاني للصفحة المحددة إذا لم تكن في الذاكرة.

مثال العنوان المرصود:

```text
https://quran.ksu.edu.sa/index.php#aya=2_6&m=hafs&qaree=husary&trans=ar_mu
```

ما بعد `#` هو **fragment محلي**، وليس Query Parameters ولا يُرسل في HTTP. تغييره وحده لا يعني طلب document جديدًا. يؤثر في حالة الواجهة، التي قد تطلب الصور والبيانات والصوت بحسب الصفحة وحالة التشغيل. تكتب الواجهة أيضًا تفضيلات محلية؛ قيمها ليست ضمن هذا التوثيق.

## 9. مزامنة التلاوة والتحديد

تحليل [engine.js](https://quran.ksu.edu.sa/js/engine.js)، مع تحقق عملي للانتقال 1:1 → 1:2:

1. `setCurrAya` يحدّث `currAya` وfragment الخاص بـ`aya`.
2. `playAya` يفحص `verifyAya`: إذا لم توافق الآية الصفحة الحالية، ينادي `loadAya` لتحميل الصفحة المناسبة أولًا.
3. ينادي `hiliteCurrAya` **قبل** اختبار `globalPlay`، لذلك يعمل التحديد حتى عندما يكون الصوت متوقفًا.
4. يزيل `hiliteCurrAya` صنف `active` من أجزاء الآية السابقة والهامش، ثم يضيفه لأجزاء الآية الحالية `__hilite_1/2/3` ولـ`__trans`، ويحدّث أسماء السورة ورقم الآية والصفحة والجزء. وقد يُمرر الهامش إلى الآية المحددة.
5. إذا كان التشغيل فعالًا، يبني `playAya` رابط MP3 للآية ويستعمل jPlayer `setMedia(...).play()` في `#player`.
6. بعد نحو ثانية ينادي `preloadAya`: يحمل الآية التالية في `#player2` باستخدام `load()`؛ وجود طلب لآية لاحقة لا يثبت تشغيلها.
7. مع حدث jPlayer `ended`، وفي المسار العادي، ينادي `setNextAya()` ثم `playAya()`؛ تتقدم الآية والتظليل ويبدأ ملفها. يتعامل `setNextAya` مع نهاية السورة والرجوع إلى الفاتحة بعد آخر سورة.

المزامنة هنا على **مستوى الآية/الملف**. لا يَرِد في الفرع الذي فُحص طلب timing JSON للكلمات، ولا يعتمد الانتقال العادي على حساب مستطيل من زمن داخل ملف صوت طويل. لا يعني ذلك نفي وجود ميزات أو واجهات أخرى في المشروع.

النقر على أي جزء من تظليل آية يقرأ المفتاح قبل `__` عبر `ayaClick`، ثم يوقف الملف الحالي ويحدّث الآية ويستدعي `playAya`. أسماء الأجزاء تربط الهندسة والسورة/الآية والصوت وهامش المعاني بمفتاح موحد.

**من الشيفرة فقط:** حدث `ended` يحتوي فروعًا للبَسملة/الاستعاذة، وتكرار الآيات، وتشغيل ترجمة صوتية قبل التقدم. لم تُختبر هذه الفروع؛ لا يُعامل كل حدث `ended` في جميع الأوضاع باعتباره انتقالًا للآية التالية.

## 10. أمثلة TypeScript واختبارها

الملف [ksu-api-examples.ts](ksu-evidence/ksu-api-examples.ts) مستقل، بلا مكتبات خارجية، ويعمل بـNode.js 24؛ الإصدار الذي اختُبر عليه `v24.19.0`. شغّل من المجلد الذي يحتوي الملفات:

```powershell
# اختبارات محلية فقط؛ لا HTTP
node ./ksu-api-examples.ts

# الاختبارات المحلية ثم خمسة GET متتابعة إلى KSU
node ./ksu-api-examples.ts --live
```

مثال استخدام وظائف الملف:

```typescript
import {
  pageImage, husaryAudio, hilitesUrl, saadieTafsirUrl,
  translationUrl, splitTafsir, hafsRects, pageForAya
} from './ksu-api-examples.ts';

console.log(pageImage(3));
console.log(husaryAudio(1, 2));
console.log(saadieTafsirUrl(1, 4));
console.log(translationUrl([2, 6], [2, 17]));

const response = await fetch(hilitesUrl(3), { credentials: 'omit' });
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const points = (await response.json())['3'];
console.log(hafsRects(3, points).filter(r => r.id.startsWith('2_9__')));
```

`splitTafsir` يفصل عند أول `|||` ويحافظ على باقي HTML. `pageForAya` يقبل جدول البدايات، بما فيه آخر sentinel، من ملف metadata المرفق. تحقق السورة/الآية الأساسي في بناة الروابط لا يغني عن التحقق من عدد آيات السورة باستخدام `Sura[sura].ayas` عند قبول مدخلات عامة.

النتائج التي نُفذت بالفعل:

| الاختبار | النتيجة |
|---|---|
| مقارنة هندسة التظليل مع DOM | PASS: 52 مستطيلًا / 3 صفحات |
| حالات حدود ربط الآيات بالصفحات | PASS: 7، ومنها 2:5→2، 2:6→3، 2:17→4، 114:6→604 |
| بناء اسم ملف الصوت، وفصل التفسير، ورفض الصفحة 0 | PASS |
| GET صورة الصفحة 1 | PASS: 200، PNG، 104404 بايت |
| GET صوت 1:1 مع `Range: bytes=0-15` | PASS: 206، `audio/mpeg`، 16 بايت |
| GET إحداثيات الصفحة 1 | PASS: 200، تطابق `1_1=[181,301]` |
| GET تفسير السعدي 1:4 | PASS: 200، الفاصل وHTML موجودان |
| GET معاني الصفحة 1 | PASS: 200، `tafsir["1_1"].text` نص |

هذه الاختبارات الخمسة الأخيرة HTTP من Node وليست سجل نقرات المتصفح؛ فُصلت عن التقاط CDP. لا يُستنتج منها أن CORS يسمح باستدعاء الخدمات من موقع آخر؛ سياسة CORS لم تُختبر.

## 11. حدود الاستنتاج وإعادة الفحص

- الصور والأصوات المحددة أعلاه، `hafs`، `ar_mu`، `sa3dy`، والصفحات 1–3 هي نطاق التحقق الديناميكي. أسماء الملفات العامة استُخرجت من الشيفرة؛ لم يُختبر كل رقم صفحة/آية أو كل قارئ.
- `t=28` و`&11` ثابتان رُصدا؛ سبب وجودهما ليس مثبتًا. لا يوصفان على أنهما token أو رقم إصدار أو cache buster دون دليل.
- لا توجد مصادقة مطلوبة للطلبات الخمسة التي نجحت من Node بلا Cookies، لكن لم تُختبر جميع ظروف الخدمة أو سياسات الاستخدام أو معدلات الطلبات.
- لا توجد نتائج مقاسة لـPOST أو المعاملات الناقصة أو أرقام خارج الحدود أو أخطاء الخادم أو جميع حالات cache. الحالة المسجلة تخص جلسة الفحص.
- لم يُختبر عرض ورش/التجويد، أو الحفظ والتكرار، أو الصوت المترجم، أو واجهة الجوال/الطباعة. ما ورد عنها مقتصر على وجود فروع في المصدر.
- أمثلة إعادة الاستخدام توضح سلوكًا خاصًا بالموقع وقد يتغير. تحفظ بصمات المصادر في سجل الأدلة لتحديد النسخة التي بُني عليها التحليل.

## 12. مواضع الشيفرة الأصلية

الأرقام التالية تخص جسم `engine.js` الذي التقطه المتصفح في هذه الجلسة:

| الوظيفة | الأسطر |
|---|---|
| مسارات الصور والصوت وخريطة القراء | 14–96 |
| تحميل زوج الصفحات | 106–127 |
| تحديث الآية | 220–241 |
| تشغيل الصوت وتحميل التالي | 246–315 |
| تقدم الآية وتحديث التحديد | 334–390 |
| طلب النقاط وحساب المستطيلات | 394–610 |
| جلب هامش المعاني | 673–702 |
| نقر الآية وربطها بالصفحة | 824–850 |
| تنقل الصفحات والسور | 1013–1050 |
| استكمال التشغيل بعد تحميل الصورة | 1097–1107 |
| طلب نافذة التفسير | 1261–1274 |
| تحديث نافذة التفسير | 1332–1360 |
| تغيير القارئ | 1431–1452 |
| حدث انتهاء التلاوة | 2421–2460 |
| مشغل التحميل المقدم | 2463–2476 |

المصدران الأساسيان: [engine.js](https://quran.ksu.edu.sa/js/engine.js)، [quran-data.js](https://quran.ksu.edu.sa/js/quran-data.js). تعريف `QuranData.Page` يبدأ عند السطر 464 في النسخة الملتقطة. بيانات التنقل التي استُخدمت جاءت من هذا الملف على نطاق KSU نفسه.

```text
SHA-256(engine.js)
dc45ce8c2d8e9326f7d809eb8df58b70a30dc7b8af745fe914fe17ad60d8146a

SHA-256(quran-data.js)
6e93fd099e2897638f7ccd18756663b66b10c2334eaaf760b3f1c99ac0806804
```

البصمات لأجسام الاستجابة التي أعادها CDP بعد فك ترميز النقل، وليست بالضرورة للبايتات المضغوطة على الشبكة.

## 13. سجل الطلبات التفصيلي

الجدول التالي مولّد من سجل CDP المنقح. يُورد URL كاملًا، والمعاملات مستقلة، والحالة وContent-Type لكل سجل. عينات الاستجابة وعلاقة الطلب بالواجهة موثقتان في الأقسام السابقة؛ ملفات مكتبات الواجهة أدناه موارد تم تحميلها وليست endpoints لبيانات القرآن.

| CDP requestId | Method | URL الكامل | Query Parameters | Status | Content-Type | disk cache | نموذج الاستجابة / الوظيفة |
|---|---|---|---|---|---|---|---|
| `3AD882E92626F266E5C14A51398755D0` | GET | `https://quran.ksu.edu.sa/index.php` | `{}` | 200 | `text/html; charset=UTF-8` | لا | HTML؛ هيكل واجهة المصحف |
| `2780.3` | GET | `https://quran.ksu.edu.sa/lang.php?ejs=1&l=ar` | `{"ejs":"1","l":"ar"}` | 200 | `text/html; charset=UTF-8` | لا | JavaScript بترويسة HTML؛ تسميات عربية |
| `2780.4` | GET | `https://quran.ksu.edu.sa/js/quran-data.js` | `{}` | 200 | `application/javascript` | لا | §8: JavaScript؛ بيانات التنقل |
| `2780.5` | GET | `https://quran.ksu.edu.sa/js/jquery-1.7.2.min.js` | `{}` | 200 | `application/javascript` | لا | JavaScript؛ مكتبة مساعدة للواجهة |
| `2780.6` | GET | `https://quran.ksu.edu.sa/js/jquery.easing.1.3.js` | `{}` | 200 | `application/javascript` | لا | JavaScript؛ مكتبة مساعدة للواجهة |
| `2780.7` | GET | `https://quran.ksu.edu.sa/js/p200.js` | `{}` | 200 | `application/javascript` | لا | JavaScript؛ مكتبة مساعدة للواجهة |
| `2780.8` | GET | `https://quran.ksu.edu.sa/js/jquery.booklet.1.1.0.js` | `{}` | 200 | `application/javascript` | لا | JavaScript؛ مكتبة مساعدة للواجهة |
| `2780.9` | GET | `https://quran.ksu.edu.sa/js/jquery.hasher.min.js` | `{}` | 200 | `application/javascript` | لا | JavaScript؛ مكتبة مساعدة للواجهة |
| `2780.10` | GET | `https://quran.ksu.edu.sa/js/engine.js` | `{}` | 200 | `application/javascript` | لا | §12: JavaScript؛ منطق الواجهة |
| `2780.75` | GET | `https://quran.ksu.edu.sa/ayat/safahat1/1.png` | `{}` | 200 | `image/png` | لا | §4: PNG؛ صورة الصفحة |
| `2780.76` | GET | `https://quran.ksu.edu.sa/ayat/safahat1/2.png` | `{}` | 200 | `image/png` | لا | §4: PNG؛ صورة الصفحة |
| `2780.78` | GET | `https://quran.ksu.edu.sa/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page=1` | `{"ui":"pc","do":"hilites","mosshaf":"hafs","t":"28","page":"1"}` | 200 | `application/json; charset="utf-8"` | لا | §6: JSON نقاط؛ رسم التحديد |
| `2780.79` | GET | `https://quran.ksu.edu.sa/interface.php?ui=pc&do=tarjama&tafsir=ar_mu&b_sura=1&b_aya=1&e_sura=2&e_aya=1&11` | `{"11":"","ui":"pc","do":"tarjama","tafsir":"ar_mu","b_sura":"1","b_aya":"1","e_sura":"2","e_aya":"1"}` | 200 | `application/json; charset="utf-8"` | لا | §7ب: JSON؛ هامش المعاني |
| `2780.81` | GET | `https://quran.ksu.edu.sa/ayat/mp3/Husary_64kbps/001001.mp3` | `{}` | 206 | `audio/mpeg` | لا | §5: MPEG؛ تشغيل/تحميل مقدم |
| `2780.85` | GET | `https://quran.ksu.edu.sa/ayat/mp3/Husary_64kbps/001002.mp3` | `{}` | 206 | `audio/mpeg` | لا | §5: MPEG؛ تشغيل/تحميل مقدم |
| `2780.87` | GET | `https://quran.ksu.edu.sa/ayat/mp3/Husary_64kbps/001003.mp3` | `{}` | 206 | `audio/mpeg` | لا | §5: MPEG؛ تشغيل/تحميل مقدم |
| `2780.89` | GET | `https://quran.ksu.edu.sa/interface.php?ui=pc&do=tafsir&author=sa3dy&sura=1&aya=4` | `{"ui":"pc","do":"tafsir","author":"sa3dy","sura":"1","aya":"4"}` | 200 | `text/html;charset="utf-8"` | لا | §7أ: نص + HTML؛ نافذة التفسير |
| `2780.93` | GET | `https://quran.ksu.edu.sa/interface.php?ui=pc&do=tafsir&author=sa3dy&sura=1&aya=5` | `{"ui":"pc","do":"tafsir","author":"sa3dy","sura":"1","aya":"5"}` | 200 | `text/html;charset="utf-8"` | لا | §7أ: نص + HTML؛ نافذة التفسير |
| `2780.101` | GET | `https://quran.ksu.edu.sa/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page=3` | `{"ui":"pc","do":"hilites","mosshaf":"hafs","t":"28","page":"3"}` | 200 | `application/json; charset="utf-8"` | لا | §6: JSON نقاط؛ رسم التحديد |
| `2780.102` | GET | `https://quran.ksu.edu.sa/interface.php?ui=pc&do=tarjama&tafsir=ar_mu&b_sura=2&b_aya=6&e_sura=2&e_aya=17&11` | `{"11":"","ui":"pc","do":"tarjama","tafsir":"ar_mu","b_sura":"2","b_aya":"6","e_sura":"2","e_aya":"17"}` | 200 | `application/json; charset="utf-8"` | لا | §7ب: JSON؛ هامش المعاني |
| `2780.103` | GET | `https://quran.ksu.edu.sa/ayat/safahat1/3.png` | `{}` | 200 | `image/png` | لا | §4: PNG؛ صورة الصفحة |
| `2780.104` | GET | `https://quran.ksu.edu.sa/ayat/safahat1/4.png` | `{}` | 200 | `image/png` | لا | §4: PNG؛ صورة الصفحة |
| `2780.106` | GET | `https://quran.ksu.edu.sa/ayat/safahat1/1.png` | `{}` | 200 | `image/png` | نعم | §4: PNG؛ صورة الصفحة |
| `2780.107` | GET | `https://quran.ksu.edu.sa/ayat/safahat1/2.png` | `{}` | 200 | `image/png` | نعم | §4: PNG؛ صورة الصفحة |
| `2780.108` | GET | `https://quran.ksu.edu.sa/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page=2` | `{"ui":"pc","do":"hilites","mosshaf":"hafs","t":"28","page":"2"}` | 200 | `application/json; charset="utf-8"` | لا | §6: JSON نقاط؛ رسم التحديد |
| `2780.109` | GET | `https://quran.ksu.edu.sa/interface.php?ui=pc&do=tarjama&tafsir=ar_mu&b_sura=2&b_aya=1&e_sura=2&e_aya=6&11` | `{"11":"","ui":"pc","do":"tarjama","tafsir":"ar_mu","b_sura":"2","b_aya":"1","e_sura":"2","e_aya":"6"}` | 200 | `application/json; charset="utf-8"` | لا | §7ب: JSON؛ هامش المعاني |
| `2780.11` | GET | `https://quran.ksu.edu.sa/provider/index.php?g=css&456` | `{"456":"","g":"css"}` | 200 | `text/css; charset=utf-8` | لا | §6: CSS؛ شكل التظليل |

عينات الموارد المساعدة موجودة أيضًا في `responseSample` داخل سجل JSON، مع `sampleTruncated` عند الاقتصار على بداية الجسم. لا تُدرج Cookies أو ترويسات المصادقة في أي من الجدولين أو الملفات.
