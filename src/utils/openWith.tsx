import mime from "mime";
import { Alert, Platform } from "react-native";
import * as RNFS from "react-native-fs";
import Share from "react-native-share";

export function getFileType(item: RNFS.ReadDirItem): string {
  const extension = item.name.split(".").pop(); // Get file extension
  return mime.getType(extension || "") || "application/octet-stream"; // Default if unknown
}

export async function openWith(fileUri: string, fileType?: string) {
  try {
    if (!fileUri) {
      Alert.alert("Error", "No file URI provided");
      return;
    }

    const options = {
      url: Platform.OS === "android" ? `file://${fileUri}` : fileUri, // Ensure correct file path format
      type: fileType || "application/octet-stream", // Default MIME type if unknown
    };

    await Share.open(options); // Show "Open With" dialog
    console.log("Success?")
  } catch (err) {
    console.error("Error opening file:", err);
    Alert.alert("Error", "Could not open file");
  }
}
