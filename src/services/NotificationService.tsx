import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ตั้งค่าการแจ้งเตือน
PushNotification.configure({
  onNotification: function (notification: any) {
    console.log("NOTIFICATION:", notification);
  },
  requestPermissions: Platform.OS === 'ios',
});

// สร้างช่องทางแจ้งเตือน (Android เท่านั้น)
if (Platform.OS === 'android') {
  PushNotification.createChannel(
    {
      channelId: "storage-alert",
      channelName: "Storage Alerts",
      importance: 4,
      vibrate: true,
    },
    (created: boolean) => console.log(`createChannel returned '${created}'`)
  );
}

// แจ้งเตือน local notification
const notifyStorageFull = () => {
  PushNotification.localNotification({
    channelId: "storage-alert",
    title: "Storage Warning",
    message: "Your device storage is over 95% full!",
    playSound: true,
    soundName: "default",
  });
};

// helper: เช็คว่าวันเดียวกันมั้ย
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// KEY สำหรับบันทึกวันที่แจ้งเตือน
const LAST_NOTIFY_DATE_KEY = 'lastStorageNotificationDate';

// เช็คและแจ้งเตือน ถ้ายังไม่ได้แจ้งวันนี้
export const checkStorageUsage = async () => {
  try {
    const stats = await RNFS.getFSInfo();
    const freeSpace = stats.freeSpace;
    const totalSpace = stats.totalSpace;

    const usedPercentage = ((totalSpace - freeSpace) / totalSpace) * 100;

    console.log(`Storage Used: ${usedPercentage.toFixed(5)}%`);

    if (usedPercentage >= 95) {
      const today = new Date();
      const lastNotify = await AsyncStorage.getItem(LAST_NOTIFY_DATE_KEY);

      if (lastNotify) {
        const lastDate = new Date(lastNotify);
        if (isSameDay(today, lastDate)) {
          console.log("Already notified today.");
          return; // ไม่แจ้งซ้ำ
        }
      }

      notifyStorageFull();
      await AsyncStorage.setItem(LAST_NOTIFY_DATE_KEY, today.toISOString());
    }

  } catch (error) {
    console.error("Error checking storage:", error);
  }
};
