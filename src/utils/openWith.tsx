import mime from "mime";
import { Alert } from "react-native";
import FileViewer from 'react-native-file-viewer';
import * as RNFS from "react-native-fs";

export function getFileType(item: RNFS.ReadDirItem): string {
  const extension = item.name.split(".").pop(); // Get file extension
  return mime.getType(extension || "") || "application/octet-stream"; // Default if unknown
}

export async function openWith(location: string, mimeType: string) {
  try {
    // Ensure file exists
    const exists = await RNFS.exists(location);
    if (!exists) {
      Alert.alert('Error', 'File does not exist');
      return;
    }
    // Launch external viewer
    await FileViewer.open(`file://${location}`, {
      showOpenWithDialog: true, // optional
      displayName: 'Open File',
    });
  } catch (error) {
    console.error('Error opening file:', error);
    Alert.alert('Error', 'Could not open the file.');
  }
}

