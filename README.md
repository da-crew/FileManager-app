### วิธี build เป็นไฟล์ aab
ก่อนอื่น อย่าลืมกำหนดค่าของ`FILEMANAGER_KEY_PASSWORD`กับ`FILEMANAGER_STORE_PASSWORD`ในไฟล์`gradle.properties`(ถ้าไม่มีก็สร้างซะ) ที่อยู่ใน`C:\Users\<ชื่อuser>\.gradle\` แบบนี้:
```
FILEMANAGER_STORE_PASSWORD=<รหัส>  
FILEMANAGER_KEY_PASSWORD=<รหัส>
```
ส่วนรหัสสามารถขอได้ที่ @khemachat-sittiritkawin (กูนี้แหละ)   

อีกอย่างที่ต้องใช้ก็คือไฟล์keystore`file-manager.keystore` ไปเอามาได้จากห้อง`#ลับ` แล้วก็เอาไปวางไว้ใน`./android/app/` **ห้ามวางที่อื่น*เด็ดขาด*** (ไฟล้นี้เอาไว้signแอปที่จะbuild)

แล้วพอมีทุกอย่างครบแล้วก็รันคำสั้งนี้:
```
npx react-native build-android --mode=release
```
