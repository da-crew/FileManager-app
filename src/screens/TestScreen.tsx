import * as React from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import RNFS, { writeFile } from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import { checkManagePermission } from 'manage-external-storage';

async function requestStoragePermission() {
    try {
        console.log("Checking permission...");
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );

        console.log("Result:", granted);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Permission granted");
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
            console.log("Permission denied");
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log("Permission permanently denied");
            openAppSettings();
        }
    } catch (error) {
        console.error("Error requesting permission:", error);
    }
}

async function openAppSettings() {
    Alert.alert(
        "Permission Needed",
        "To use this feature, please enable storage permissions in the app settings.",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Go to Settings",
                onPress: () => Linking.openSettings(),
            },
        ]
    );
}

async function readTest() {
    let path = RNFS.ExternalStorageDirectoryPath;
    RNFS.readDir(path) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
        .then((result) => {
            console.log("Path: ", path);
            console.log('GOT ', result.length, ' RESULT');

            for (let r of result) {
                console.log(`${r.mtime}    ${r.isDirectory() ? "<DIR>" : ""} ${r.size}  ${r.name}`)
            }

            // stat the first file
            return Promise.all([RNFS.stat(result[0].path), result[0].path]);
        })
        // .then((statResult) => {
        //     if (statResult[0].isFile()) {
        //         // if we have a file, read it
        //         return RNFS.readFile(statResult[1], 'utf8');
        //     }

        //     return 'no file found';
        // })
        // .then((contents) => {
        //     // log the file contents
        //     console.log("Content: ", contents);
        // })
        .catch((err) => {
            console.log("Error: ", err.message, err.code);
        });
}

async function testWrite() {
    let path = RNFS.ExternalStorageDirectoryPath + "/hacked.txt";
    RNFS.writeFile(path, "Hacked.")
        .then(() => {
            console.log("File has been written successfully.");
        })
        .catch((error) => {
            console.error("Failed to write the file. Error: ", error);
        });
}

export default function TestScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>RNFS.ExternalStorageDirectoryPath {RNFS.ExternalStorageDirectoryPath}</Text>
            <TouchableOpacity style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, margin: 10 }}
                onPress={() => {
                    checkManagePermission().then((isManagePermitted) => {
                        if (!isManagePermitted) {
                            openAppSettings();
                        }
                    });
                }}>
                <Text>Gren Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: '#FF6347', padding: 10, borderRadius: 5, margin: 10 }}
                onPress={() => {
                    readTest();
                }}>
                <Text>Reed Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: '#87CEEB', padding: 10, borderRadius: 5, margin: 10 }}
                onPress={() => {
                    testWrite();
                }}>
                <Text>Raite Test</Text>
            </TouchableOpacity>
        </View>
    );
}













