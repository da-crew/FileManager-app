import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_NOTIFY_DATE_KEY = 'lastStorageNotificationDate';

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Notification permission not granted");
    }
  }
};

PushNotification.configure({
  onNotification: function (notification: any) {
    console.log("NOTIFICATION:", notification);
  },
  requestPermissions: Platform.OS === 'ios',
});

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

// แจ้งเตือน (ไม่มี ongoing, กดแล้วลบได้)
const notifyStorageFull = () => {
  PushNotification.localNotification({
    channelId: "storage-alert",
    title: "Storage Warning",
    message: "Your device storage is over 95% full!",
    playSound: true,
    soundName: "default",
    autoCancel: true, //กดแล้วลบได้
  });
};

//ฟังก์ชันเรียกใช้เมื่อต้องการแจ้งเตือน
export const checkStorageUsage = async () => {
  try {
    const stats = await RNFS.getFSInfo();
    const freeSpace = stats.freeSpace;
    const totalSpace = stats.totalSpace;

    const usedPercentage = ((totalSpace - freeSpace) / totalSpace) * 100;

    console.log(`Storage Used: ${usedPercentage.toFixed(5)}%`);

    if (usedPercentage >= 95) {
      notifyStorageFull();
      await AsyncStorage.setItem(LAST_NOTIFY_DATE_KEY, new Date().toISOString());
    }
  } catch (error) {
    console.error("Error checking storage:", error);
  }
};
