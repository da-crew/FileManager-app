### วิธี build เป็นไฟล์ aab
ก่อนอื่น อย่าลืมกำหนดค่าของ`FILEMANAGER_KEY_PASSWORD`กับ`FILEMANAGER_STORE_PASSWORD`ในไฟล์`gradle.properties`(ถ้าไม่มีก็สร้างซะ) ที่อยู่ใน`C:\Users\<ชื่อuser>\.gradle\` แบบนี้:
```
FILEMANAGER_STORE_PASSWORD=<รหัส>  
FILEMANAGER_KEY_PASSWORD=<รหัส>
```

วาง`file-manager.keystore`ใน`./android/app/` **ห้ามวางที่อื่น*เด็ดขาด*** (ไฟล้นี้เอาไว้signแอปที่จะbuild)

แล้วพอมีทุกอย่างครบแล้วรันคำสั้งนี้:
```
npx react-native build-android --mode=release
```
