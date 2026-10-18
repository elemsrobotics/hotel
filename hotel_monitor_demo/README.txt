HOTEL MONITOR — Туршилтын веб хуудас

1. hotel_monitor.html файлыг Chrome/Firefox дээр давхар дарж нээнэ.
2. Үндсэн дэлгэц: 50 өрөөний төлөв, огноо, цагийн slider.
3. Өрөөний дугаар дээр дарж зөвхөн тухайн өрөөний timeline болон түүхийг үзнэ.
4. Dashboard руу буцах товчоор буцна.
5. Утас дээр туршихад hotel_monitor_demo хавтсыг бүтнээр нь хуулна.

ФАЙЛУУД:
- hotel_monitor.html — хуудасны бүтэц
- styles.css — responsive дизайн
- app.js — анхны demo логик, өөрчлөлтгүй
- assets/hotel-lobby.png — AI-аар үүсгэсэн интерьер зураг

Серверээр нээх бол энэ хавтсанд: python3 -m http.server 8000
Дараа нь: http://localhost:8000/hotel_monitor.html

АНХААРАХ:
- Энэ бол demo, бодит 24/7 систем биш.
- Мэдрэгч болон server/database холбоогүй, мэдээлэл жишээ өгөгдөл.
- Жинхэнэ ашиглалтад: мэдрэгчийн мэдээллийг серверт авах, 30 хоногийн event хадгалах,
  authentication, HTTPS, offline monitoring, backup, hosting шаардлагатай.

Энэхүү ZIP доторх HTML/CSS/JavaScript код нь засварлах боломжтой.
