# CHABAB EL IHSSAN — تقرير تحسين الأداء

## ملاحظة مهمة عن نسخة المشروع
الأرشيف الذي تم تسليمه يحتوي على **Vite + React** (`vite.config.js` و`vite build`) وليس Next.js. لذلك لم أغيّر إطار العمل أو ملفات النشر إلى Next.js؛ التعديلات هنا مطابقة للمشروع الفعلي داخل الأرشيف.

## ما تم تعديله
1. `index.html`
   - إضافة preload للصورة الأولى في Hero مع `fetchpriority="high"` حتى يكتشفها المتصفح من HTML مبكراً.
2. `vite.config.js`
   - جعل مسار preload ديناميكياً من `src/content/media.json`، حتى يتغير تلقائياً إذا غُيّرت صورة Hero من لوحة الإدارة.
3. `src/components/Hero.jsx`
   - إعطاء الصورة الأولى أولوية تحميل عالية، مع إبقاء `loading="eager"` لها وعدم تطبيق lazy loading عليها.
   - إضافة `width` و`height` لصور Hero لتثبيت نسبة الأبعاد.
4. ضغط ملفات صور شرائح Hero الحالية بصيغة WebP مع الحفاظ على نفس الأبعاد ونسبة العرض إلى الارتفاع:
   - `/images/uploads/img-mwwa8gvd7pt.webp`
   - `/images/uploads/img-mwwa8p45rca.webp`
   - `/images/hero/hero-3.webp`
   - `/images/uploads/img-mwwa91diadk.webp`
   - `/images/hero/hero-5.webp`

## ما لم أغيّره ولماذا
- لم أحذف JavaScript أو مكتبات؛ رقم 59 KiB وحده لا يحدد أي كود غير مستخدم بأمان، والحذف دون تحليل coverage قد يكسر ميزات.
- لم أغيّر تحميل الخطوط أو CSS؛ لا توجد بيانات waterfall أو أسماء الموارد تثبت أي ملف بعينه كسبب حاسم لحجب العرض.
- لم أغيّر التصميم أو النصوص أو الألوان أو الأنيميشن أو الوظائف.

## قياسات فعلية للصور
أحجام الملفات الخمسة قبل/بعد الضغط:
| الملف | قبل | بعد |
|---|---:|---:|
| img-mwwa8gvd7pt.webp | 143,962 B | 141,750 B |
| img-mwwa8p45rca.webp | 170,376 B | 167,494 B |
| hero-3.webp | 146,736 B | 139,626 B |
| img-mwwa91diadk.webp | 147,650 B | 145,578 B |
| hero-5.webp | 162,224 B | 157,502 B |
| **المجموع** | **770,948 B** | **751,950 B** |

التوفير المقاس: **18,998 bytes (حوالي 18.6 KiB)** عبر شرائح Hero الخمس. لم أعتبر هذا تحسناً في LCP أو PageSpeed؛ يجب إعادة الاختبار على الموقع المنشور.

## عنصر LCP
المرشح الأرجح هو صورة Hero الأولى:
`/images/uploads/img-mwwa8gvd7pt.webp`
وهي أول صورة في `heroSlides`، وتظهر كخلفية Hero وكذلك في البطاقة الأمامية. لكن قيم PageSpeed المرسلة لا تتضمن تقرير عنصر LCP أو لقطة Performance trace، لذلك لا يمكن الجزم أنها عنصر LCP الفعلي دون تفاصيل PSI → Largest Contentful Paint element.

## الاختبار
لم يكتمل `npm ci` في بيئة التنفيذ بسبب انتهاء المهلة أثناء تثبيت الحزم، ولم يتوفر ملف Vite التنفيذي؛ لذلك **لم أتمكن من تشغيل build** ولا أزعم نجاحه. شغّل محلياً:
```bash
npm ci
npm run build
```
إذا نجح، ارفع محتويات `dist/` إلى مجلد الموقع على cPanel بالطريقة المعتادة.

## ملاحظة لإكمال التشخيص
لإثبات عنصر LCP الفعلي وتحديد موارد CSS/JS غير المستخدمة بدقة، يلزم تقرير PSI التفصيلي الذي يعرض: Largest Contentful Paint element، وRender-blocking resources، وReduce unused JavaScript، أو ملف trace من Lighthouse.
