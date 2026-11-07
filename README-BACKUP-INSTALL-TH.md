# ชุดไฟล์ติดตั้ง PETCHNAKA BACKUP & RESTORE

## ตำแหน่งติดตั้ง
นำโฟลเดอร์และไฟล์ทั้งหมดใน ZIP นี้ไปวางที่รากของ Repository เดิม:
`kidairhotmailcom-ui/PETCHNAKA-PROJECT-HUB`

จากนั้น Commit และ Push ไปยัง Branch หลักเดิม

## สิ่งที่ต้องตั้งใน GitHub
1. Repository > Settings > Actions > General
2. ใน Workflow permissions เลือก `Read and write permissions`
3. บันทึกการตั้งค่า
4. ไปที่ Actions และเปิดใช้งาน Workflow หาก GitHub ขอให้อนุญาต
5. เรียก `Project Backup` ด้วย Run workflow เพื่อสำรองรอบแรก
6. เรียก `Verify Backup` เพื่อตรวจ SHA-256
7. เรียก `Restore Backup To Test Branch` เพื่อทดสอบกู้คืนไป Branch แยก

## Branch
ระบบจะสร้าง/ใช้ Branch ชื่อ `backup` และสร้าง Branch `restore-test-<run id>` สำหรับทดสอบกู้คืน

## เวลา
สำรองทุกวันเวลา 01:30 น. และตรวจสอบทุกวันเวลา 01:45 น. ตามเวลาไทย (GitHub cron ใช้ UTC)

## ข้อควรระวัง
- ห้ามนำ `.env`, `.env.production`, API keys, รหัสผ่าน, Supabase service role key หรือข้อมูลลับขึ้น Git
- Workflow ตั้งใจไม่สำรองไฟล์ `.env*` และ `node_modules`
- Branch `backup` อยู่ใน Repository เดียวกัน ไม่ใช่สำเนานอกบัญชี หาก Repository หรือบัญชีถูกลบ/ถูกยึด ทั้งต้นฉบับและสำรองอาจได้รับผลกระทบ
- Restore workflow สร้าง Branch ทดสอบเท่านั้น ไม่เขียนทับ Branch หลัก
- ตรวจผลการทดสอบบน Branch restore-test ก่อนนำการกู้คืนไปใช้จริง
- ตรวจโครงสร้างและไฟล์เฉพาะของโปรเจกต์ก่อนติดตั้งจริง โดยเฉพาะไฟล์ลับและไฟล์ build ที่โปรเจกต์ต้องใช้
