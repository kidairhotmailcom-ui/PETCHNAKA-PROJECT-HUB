AUTO SHOP PRO - GitHub Pages promo package

ไฟล์ในชุดนี้
- promo-section.html : โค้ดส่วนแสดงแบนเนอร์และวิดีโอ ให้นำไปแทรกใน index.html
- promo-style.css : CSS ของส่วนประชาสัมพันธ์ ให้นำไปวางใน <style>...</style> ของ index.html
- assets/images/auto-shop-banner.svg : ภาพแบนเนอร์ที่แสดงได้ทันที
- assets/videos/ : ที่เก็บไฟล์วิดีโอ MP4 (ต้องอัปโหลดไฟล์จริงเอง)

วิธีติดตั้ง
1. ใน repository ของหน้า AUTO SHOP PRO ให้สร้างโฟลเดอร์ assets/images และ assets/videos
2. อัปโหลด auto-shop-banner.svg ไปที่ assets/images/
3. อัปโหลดไฟล์ใน promo-section.html ไปแทรกใน index.html ก่อน <section class="promo" id="promotion"> ตามตำแหน่งที่ระบุในคอมเมนต์
4. คัดลอกเนื้อหา promo-style.css ไปวางภายในแท็ก <style> ที่มีอยู่แล้วใน index.html ก่อน </style>
5. เมื่อมีวิดีโอภาษาไทยแล้ว ตั้งชื่อไฟล์ auto-shop-pro-th.mp4 และอัปโหลดไปที่ assets/videos/
6. เปิดหน้าเว็บและทดสอบแบนเนอร์กับวิดีโอ

สำคัญ
- ห้ามอัปโหลดไฟล์ MP4 ที่ยังไม่มีจริง หรือเปลี่ยนชื่อไฟล์ไม่ตรงกับ source ใน HTML
- แบนเนอร์ SVG ใช้ได้ทันที ไม่ต้องแปลงเป็น PNG
- ชุดนี้ไม่แก้หรือเขียนทับ index.html เดิม
