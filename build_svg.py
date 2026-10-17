from pathlib import Path
import base64

OUT = Path('/home/ubuntu/tech-design-studio/teq-landing-page.svg')
ASSETS = Path('/home/ubuntu/webdev-static-assets')

def img_data(name):
    data = base64.b64encode((ASSETS / name).read_bytes()).decode('ascii')
    return f'data:image/jpeg;base64,{data}'

hero = img_data('tech-hero.jpg')
branding = img_data('tech-branding.jpg')
ui = img_data('tech-ui.jpg')
motion = img_data('tech-motion.jpg')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1440" height="5650" viewBox="0 0 1440 5650">
  <defs>
    <style>
      .body{{font-family:'IBM Plex Sans Arabic',Arial,sans-serif;fill:#121210}}
      .display{{font-family:'Noto Kufi Arabic',Arial,sans-serif;font-weight:800;fill:#121210}}
      .small{{font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:16px;fill:#777166}}
      .mono{{font-family:monospace;letter-spacing:2px;font-size:12px}}
    </style>
    <filter id="shadow" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="10" dy="10" stdDeviation="0" flood-color="#ee7248"/></filter>
    <filter id="soft" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#121210" flood-opacity=".12"/></filter>
    <clipPath id="heroClip"><rect x="75" y="260" width="660" height="570"/></clipPath>
    <clipPath id="card1"><rect x="75" y="1820" width="610" height="350"/></clipPath>
    <clipPath id="card2"><rect x="755" y="1820" width="610" height="350"/></clipPath>
    <clipPath id="card3"><rect x="75" y="2290" width="610" height="350"/></clipPath>
    <clipPath id="card4"><rect x="755" y="2290" width="610" height="350"/></clipPath>
  </defs>

  <g id="page-background"><rect width="1440" height="5650" fill="#f7f1e5"/></g>
  <g id="top-bar"><rect width="1440" height="36" fill="#121210"/><text x="720" y="24" text-anchor="middle" direction="rtl" class="body" font-size="12" fill="#fffaf0">نحوّل الأفكار إلى علامات تُرى وتُتذكّر 　↙　 الرياض · جدة · عن بُعد</text></g>
  <g id="header">
    <circle cx="1352" cy="90" r="22" fill="#f2b520" stroke="#121210" stroke-width="2"/><text x="1352" y="98" text-anchor="middle" class="display" font-size="22">ت</text><text x="1308" y="99" text-anchor="end" class="display" font-size="25">تيك</text><text x="1246" y="97" text-anchor="end" class="small" font-size="12">استوديو تصميم</text>
    <text x="1010" y="99" text-anchor="middle" class="body" font-size="16">الخدمات</text><text x="900" y="99" text-anchor="middle" class="body" font-size="16">أعمالنا</text><text x="790" y="99" text-anchor="middle" class="body" font-size="16">منهجيتنا</text><text x="665" y="99" text-anchor="middle" class="body" font-size="16">آراء العملاء</text>
    <rect x="80" y="67" width="128" height="44" rx="23" fill="#f2b520" stroke="#121210" stroke-width="2"/><text x="144" y="95" text-anchor="middle" class="body" font-weight="700" font-size="15">لنتحدث　↗</text>
  </g>

  <g id="hero">
    <text x="1365" y="215" text-anchor="end" class="small" font-size="14">●　استوديو تصميم مستقل</text>
    <text x="1365" y="335" text-anchor="end" class="display" font-size="70">نصمّم حضورًا</text><text x="1365" y="425" text-anchor="end" class="display" font-size="70">يصعب نسيانه.</text><path d="M890 438 Q1110 450 1368 431" stroke="#f2b520" stroke-width="24" fill="none"/>
    <text x="1365" y="500" text-anchor="end" class="body" font-size="18" fill="#777166">في تيك، نمنح الأفكار الجيدة شكلاً يليق بها — من أول انطباع إلى كل تفاعل بعده.</text>
    <rect x="1110" y="560" width="215" height="54" rx="3" fill="#121210"/><text x="1217" y="595" text-anchor="middle" class="body" fill="#fffaf0" font-weight="700" font-size="16">اطلب عرضك　↗</text><text x="1000" y="595" text-anchor="middle" class="body" font-size="16" text-decoration="underline">شاهد أعمالنا　↓</text>
    <rect x="75" y="260" width="660" height="570" fill="#f2b520" stroke="#121210" stroke-width="2" filter="url(#shadow)"/><image x="75" y="260" width="660" height="570" preserveAspectRatio="xMidYMid slice" xlink:href="{hero}" clip-path="url(#heroClip)"/><circle cx="145" cy="320" r="48" fill="#fffaf0" stroke="#121210" stroke-width="2"/><text x="145" y="314" text-anchor="middle" class="display" font-size="14">صمّم</text><text x="145" y="335" text-anchor="middle" class="display" font-size="14">بجرأة</text><circle cx="670" cy="760" r="38" fill="#ee7248" stroke="#121210" stroke-width="2"/><text x="670" y="768" text-anchor="middle" class="display" font-size="15">ت + ك</text>
    <text x="75" y="858" class="mono" fill="#9b927f">visual stories / 2024—25</text><text x="1365" y="755" text-anchor="end" class="mono" fill="#9b927f">01　 إلى الأعلى ↖</text>
    <path d="M0 900 L510 872" stroke="#f2b520" stroke-width="7" opacity=".8"/><path d="M0 920 L480 892" stroke="#f2b520" stroke-width="7" opacity=".45"/><path d="M0 940 L450 912" stroke="#f2b520" stroke-width="7" opacity=".2"/>
  </g>

  <g id="clients"><line x1="75" y1="1005" x2="1365" y2="1005" stroke="#121210" stroke-opacity=".18"/><text x="1365" y="1050" text-anchor="end" class="small">يثق بنا أصحاب الأفكار الطموحة</text><text x="1180" y="1050" text-anchor="middle" class="display" font-size="20" fill="#6f6a60">نواة</text><text x="950" y="1050" text-anchor="middle" class="display" font-size="20" fill="#6f6a60">سُرى</text><text x="720" y="1050" text-anchor="middle" class="display" font-size="20" fill="#6f6a60">مدار</text><text x="490" y="1050" text-anchor="middle" class="display" font-size="20" fill="#6f6a60">آفاق</text><text x="260" y="1050" text-anchor="middle" class="display" font-size="20" fill="#6f6a60">مِداد</text><line x1="75" y1="1080" x2="1365" y2="1080" stroke="#121210" stroke-opacity=".18"/></g>

  <g id="services">
    <text x="1365" y="1270" text-anchor="end" class="small">●　ماذا نصنع؟</text><text x="1365" y="1360" text-anchor="end" class="display" font-size="54">أفكارك،</text><text x="1365" y="1435" text-anchor="end" class="display" font-size="54" fill="#ee7248">بصوتها الخاص.</text><text x="75" y="1380" class="body" font-size="17" fill="#777166">لا نؤمن بالحلول الجاهزة. نبحث عن الزاوية التي تجعل علامتك مختلفة، ثم نبني لها نظامًا يقدر أن يكبر معها.</text>
    <g id="service-01"><rect x="75" y="1510" width="300" height="250" fill="#f2b520" stroke="#121210" stroke-width="2"/><text x="98" y="1543" class="mono">01</text><text x="350" y="1550" text-anchor="end" class="display" font-size="28">✦</text><text x="350" y="1670" text-anchor="end" class="display" font-size="25">هوية بصرية</text><text x="350" y="1705" text-anchor="end" class="body" font-size="14">نظام بصري متكامل يترجم شخصية علامتك.</text><circle cx="113" cy="1715" r="21" fill="none" stroke="#121210" stroke-width="2"/><text x="113" y="1722" text-anchor="middle" class="body">↗</text></g>
    <g id="service-02"><rect x="395" y="1510" width="300" height="250" fill="#121210" stroke="#121210" stroke-width="2"/><text x="418" y="1543" class="mono" fill="#fffaf0">02</text><text x="670" y="1550" text-anchor="end" class="display" font-size="28" fill="#fffaf0">↗</text><text x="670" y="1670" text-anchor="end" class="display" font-size="25" fill="#fffaf0">موشن جرافيك</text><text x="670" y="1705" text-anchor="end" class="body" font-size="14" fill="#fffaf0" opacity=".7">نحرّك فكرتك بإيقاع يحكي ويلفت.</text><circle cx="433" cy="1715" r="21" fill="none" stroke="#fffaf0" stroke-width="2"/><text x="433" y="1722" text-anchor="middle" class="body" fill="#fffaf0">↗</text></g>
    <g id="service-03"><rect x="715" y="1510" width="300" height="250" fill="#ee7248" stroke="#121210" stroke-width="2"/><text x="738" y="1543" class="mono">03</text><text x="990" y="1550" text-anchor="end" class="display" font-size="28">◒</text><text x="990" y="1670" text-anchor="end" class="display" font-size="25">واجهات وتجارب</text><text x="990" y="1705" text-anchor="end" class="body" font-size="14">تجارب رقمية سلسة تجمع الجمال والنتيجة.</text><circle cx="753" cy="1715" r="21" fill="none" stroke="#121210" stroke-width="2"/><text x="753" y="1722" text-anchor="middle" class="body">↗</text></g>
    <g id="service-04"><rect x="1035" y="1510" width="330" height="250" fill="#fffaf0" stroke="#121210" stroke-width="2"/><text x="1058" y="1543" class="mono">04</text><text x="1340" y="1550" text-anchor="end" class="display" font-size="28">✳</text><text x="1340" y="1670" text-anchor="end" class="display" font-size="25">تصاميم الحملات</text><text x="1340" y="1705" text-anchor="end" class="body" font-size="14">حملات بصرية تصل إلى جمهورك بذكاء.</text><circle cx="1073" cy="1715" r="21" fill="none" stroke="#121210" stroke-width="2"/><text x="1073" y="1722" text-anchor="middle" class="body">↗</text></g>
  </g>

  <g id="portfolio"><text x="1365" y="1950" text-anchor="end" class="small">●　مختارات من أعمالنا</text><text x="1365" y="2040" text-anchor="end" class="display" font-size="54">شغلنا يتكلم</text><text x="1365" y="2115" text-anchor="end" class="display" font-size="54" fill="#ee7248">قبلنا.</text><rect x="75" y="2010" width="430" height="42" rx="21" fill="none" stroke="#121210" stroke-opacity=".2"/><rect x="80" y="2015" width="90" height="32" rx="16" fill="#121210"/><text x="125" y="2037" text-anchor="middle" class="body" font-size="13" fill="#fffaf0">الكل</text><text x="235" y="2037" text-anchor="middle" class="body" font-size="13">هوية</text><text x="335" y="2037" text-anchor="middle" class="body" font-size="13">واجهات</text><text x="430" y="2037" text-anchor="middle" class="body" font-size="13">موشن</text>
    <rect x="75" y="2220" width="610" height="350" fill="#f2b520" stroke="#121210" stroke-width="2"/><image x="75" y="2220" width="610" height="350" preserveAspectRatio="xMidYMid slice" xlink:href="{branding}" clip-path="url(#card1)"/><text x="75" y="2605" class="small">هوية</text><text x="75" y="2640" class="display" font-size="20">نواة — هوية غذائية</text>
    <rect x="755" y="2220" width="610" height="350" fill="#121210" stroke="#121210" stroke-width="2"/><image x="755" y="2220" width="610" height="350" preserveAspectRatio="xMidYMid slice" xlink:href="{ui}" clip-path="url(#card2)"/><text x="755" y="2605" class="small">واجهات</text><text x="755" y="2640" class="display" font-size="20">سُرى — منصة سفر</text>
    <rect x="75" y="2690" width="610" height="350" fill="#ee7248" stroke="#121210" stroke-width="2"/><image x="75" y="2690" width="610" height="350" preserveAspectRatio="xMidYMid slice" xlink:href="{motion}" clip-path="url(#card3)"/><text x="75" y="3075" class="small">موشن</text><text x="75" y="3110" class="display" font-size="20">بُعد — حملة إطلاق</text>
    <rect x="755" y="2690" width="610" height="350" fill="#fffaf0" stroke="#121210" stroke-width="2"/><image x="755" y="2690" width="610" height="350" preserveAspectRatio="xMidYMid slice" xlink:href="{branding}" clip-path="url(#card4)"/><text x="755" y="3075" class="small">هوية</text><text x="755" y="3110" class="display" font-size="20">مسار — نظام علامة</text><text x="720" y="3240" text-anchor="middle" class="body" text-decoration="underline">استكشف كل المشاريع　↗</text>
  </g>

  <g id="method"><rect x="0" y="3370" width="1440" height="690" fill="#121210"/><text x="1365" y="3520" text-anchor="end" class="small" fill="#fffaf0" opacity=".55">●　كيف نشتغل؟</text><text x="1365" y="3640" text-anchor="end" class="display" font-size="61" fill="#fffaf0">من الفكرة</text><text x="1365" y="3720" text-anchor="end" class="display" font-size="61" fill="#f2b520">إلى الفرق.</text><text x="1365" y="3800" text-anchor="end" class="body" font-size="17" fill="#fffaf0" opacity=".6">شراكة مرنة، خطوات واضحة، واهتمام بالتفاصيل التي لا يراها أحد… لكنه يشعر بها.</text><circle cx="1290" cy="3940" r="22" fill="none" stroke="#fffaf0" stroke-opacity=".5"/><text x="1290" y="3948" text-anchor="middle" class="body" fill="#f2b520">▶</text><text x="1235" y="3948" class="body" font-size="14" fill="#fffaf0" opacity=".6">شاهد دقيقة عن طريقتنا</text>
    <g id="steps"><line x1="75" y1="3490" x2="950" y2="3490" stroke="#fffaf0" stroke-opacity=".3"/><line x1="75" y1="3660" x2="950" y2="3660" stroke="#fffaf0" stroke-opacity=".3"/><line x1="75" y1="3830" x2="950" y2="3830" stroke="#fffaf0" stroke-opacity=".3"/><text x="75" y="3540" class="mono" fill="#f2b520">01</text><text x="165" y="3540" class="display" font-size="23" fill="#fffaf0">نسمع</text><text x="165" y="3580" class="body" font-size="14" fill="#fffaf0" opacity=".6">نفهم ما وراء المشروع: الطموح، الجمهور، والشيء الذي تريد أن يتغير.</text><text x="75" y="3710" class="mono" fill="#f2b520">02</text><text x="165" y="3710" class="display" font-size="23" fill="#fffaf0">نرسم</text><text x="165" y="3750" class="body" font-size="14" fill="#fffaf0" opacity=".6">نحوّل الرؤية إلى اتجاه بصري له سبب وشخصية ومساحة للنمو.</text><text x="75" y="3880" class="mono" fill="#f2b520">03</text><text x="165" y="3880" class="display" font-size="23" fill="#fffaf0">نطلق</text><text x="165" y="3920" class="body" font-size="14" fill="#fffaf0" opacity=".6">نسلّمك نظامًا جاهزًا للحياة، لا مجرد ملف جميل ينتهي عند التصدير.</text></g>
  </g>

  <g id="review"><text x="75" y="4280" class="display" font-size="48" fill="#ee7248">❝</text><text x="1365" y="4290" text-anchor="end" class="small">●　قالوا عن التجربة</text><text x="1365" y="4400" text-anchor="end" class="display" font-size="36">«تيك ما صمّم لنا هوية فقط،</text><text x="1365" y="4465" text-anchor="end" class="display" font-size="36">بل أعطانا طريقة جديدة نرى بها</text><text x="1365" y="4530" text-anchor="end" class="display" font-size="36">مشروعنا. كل تفصيل كان في مكانه.»</text><circle cx="1165" cy="4620" r="22" fill="#f2b520" stroke="#121210"/><text x="1165" y="4628" text-anchor="middle" class="display" font-size="17">ل</text><text x="1125" y="4615" text-anchor="end" class="body" font-size="15" font-weight="700">ليان السالم</text><text x="1125" y="4640" text-anchor="end" class="small">مؤسسة نواة</text><text x="75" y="4450" class="mono" fill="#9a9284">04/04</text><text x="1365" y="4720" text-anchor="end" class="body" fill="#ee7248">★★★★★</text></g>

  <g id="contact"><rect x="0" y="4840" width="1440" height="650" fill="#f2b520"/><text x="1365" y="4990" text-anchor="end" class="small">●　خلّنا نبدأ</text><text x="1365" y="5090" text-anchor="end" class="display" font-size="54">جاهز تخلي</text><text x="1365" y="5165" text-anchor="end" class="display" font-size="54" fill="#ee7248">فكرتك تُرى؟</text><text x="1365" y="5240" text-anchor="end" class="body" font-size="16">أرسل لنا نبذة بسيطة عن مشروعك، وسنعود إليك باقتراح واضح يناسب مرحلتك وميزانيتك.</text><text x="1365" y="5320" text-anchor="end" class="body" font-size="15">✉　hello@teq.studio</text><text x="1365" y="5360" text-anchor="end" class="body" font-size="15">↗　+966 50 000 0000</text>
    <g id="form"><rect x="75" y="4930" width="600" height="500" fill="#fffaf0" stroke="#121210" stroke-width="2" filter="url(#soft)"/><text x="115" y="4985" class="display" font-size="20">لنبدأ من هنا　✦</text><line x1="115" y1="5010" x2="635" y2="5010" stroke="#121210" stroke-opacity=".14"/><text x="115" y="5055" class="small">الاسم الكامل</text><line x1="115" y1="5080" x2="635" y2="5080" stroke="#121210" stroke-opacity=".2"/><text x="115" y="5130" class="small">البريد الإلكتروني</text><line x1="115" y1="5155" x2="635" y2="5155" stroke="#121210" stroke-opacity=".2"/><text x="115" y="5205" class="small">نوع الخدمة</text><line x1="115" y1="5230" x2="635" y2="5230" stroke="#121210" stroke-opacity=".2"/><text x="115" y="5280" class="small">حدثنا عن مشروعك</text><line x1="115" y1="5310" x2="635" y2="5310" stroke="#121210" stroke-opacity=".2"/><rect x="115" y="5350" width="520" height="48" rx="3" fill="#121210"/><text x="375" y="5381" text-anchor="middle" class="body" fill="#fffaf0" font-weight="700" font-size="15">أرسل الطلب　↗</text></g>
  </g>

  <g id="footer"><text x="1365" y="5580" text-anchor="end" class="display" font-size="23">تيك</text><text x="720" y="5580" text-anchor="middle" class="small">نصمّم الأشياء التي تجعل العلامات أقرب.</text><text x="75" y="5580" class="small">© 2025 تيك استوديو</text></g>
</svg>'''

OUT.write_text(svg, encoding='utf-8')
print(OUT)
print(f'{OUT.stat().st_size} bytes')
