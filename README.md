# Personnel Evaluation System - Backend API

## Overview
โปรเจกต์นี้เป็นส่วนของ **Backend API** สำหรับ ระบบประเมินบุคลากร Personnel Evaluation System ซึ่งพัฒนาขึ้นเพื่อใช้ในการแข่งขัน ทักษะการพัฒนาระบบประเมินบุคลากรด้วยระบบเทคโนโลยีสารสนเทศสมัยใหม่ ระบบนี้ถูกออกแบบด้วยสถาปัตยกรรมแบบแยกส่วน Decoupled โดยเน้นไปที่ความปลอดภัย การจัดการสิทธิ์ผู้ใช้งานที่ซับซ้อน และการทำงานที่รวดเร็ว

## Key Features
*   **Authentication & Security:** ระบบ Login และยืนยันตัวตนด้วย JWT (JSON Web Token)
*   **Role-Based Access Control (RBAC):** มีการจัดการสิทธิ์ผู้ใช้งาน 3 ระดับอย่างเข้มงวดผ่าน Middleware:
    *   `Admin`: ผู้ดูแลระบบ (จัดการข้อมูลผู้ใช้งานและภาพรวม)
    *   `Evaluator`: ผู้ประเมิน (ให้คะแนนและจัดการแบบประเมิน)
    *   `User`: ผู้ถูกประเมิน/พนักงานทั่วไป
*   **RESTful API Design:** โครงสร้าง API ที่เป็นมาตรฐาน ง่ายต่อการนำไปเชื่อมต่อกับ Frontend ทุกประเภท

## Tech Stack
*   **Runtime Environment:** Node.js
*   **Framework:** Express.js
*   **Security:** JSON Web Token, bcrypt (สำหรับการแฮชรหัสผ่าน)
*   **Database:** MySQL

## Project Structure
โครงสร้างของโฟลเดอร์ถูกแบ่งตามหลักการ Separation of Concerns เพื่อให้โค้ดดูแลรักษาง่าย:

```text testCoding
 ┣ middleware      # ระบบจัดการสิทธิ์และความปลอดภัย
 ┃ ┣ checkAdmin.js
 ┃ ┣ checkEvaluator.js
 ┃ ┗ verifyToken.js
 ┣ routes          # ระบบจัดการ API Endpoints
 ┃ ┣ adminRoute.js
 ┃ ┣ authRoute.js
 ┃ ┣ evaluatorRoute.js
 ┃ ┗ userRoute.js
 ┣ db.js           # การตั้งค่าการเชื่อมต่อฐานข้อมูล
 ┣ index.js        # ไฟล์หลักสำหรับรันเซิร์ฟเวอร์ (Entry Point)
 ┗ package.json
