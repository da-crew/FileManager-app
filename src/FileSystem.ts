import { Alert, Linking } from "react-native";
import RNFS, { writeFile } from 'react-native-fs';

export type StorageCapacity = {
    totalSpace: number,
    freeSpace: number,
};

export type PathType = {
    root: { displayName: string, path: string };
    nodes: string[];
}

export class Path implements PathType {
    root: { displayName: string, path: string };
    nodes: string[];

    constructor(displayName: string, path: string, nodes: string[]) {
        this.root = {
            displayName,
            path
        };
        this.nodes = nodes;
    }

    clone() {
        return new Path(this.root.displayName, this.root.path, [...this.nodes]);
    }

    appendToPath(itemPath: string) {
        return this.build() + "/" + itemPath;
    }

    build() {
        let fullPath = this.root.path;
        for (const p of this.nodes) {
            fullPath += "/" + p;
        }
        return fullPath;
    }
}

export class StorageDevice {
    displayName: string;
    unit: string;
    devicePath: string;
    constructor(displayName: string, devicePath: string) {
        this.displayName = displayName;
        this.unit = 'GB';
        this.devicePath = devicePath;
    }

    async getCapacity(): Promise<StorageCapacity> {
        let capacity = await RNFS.getFSInfo();

        return {
            totalSpace: parseFloat((capacity.totalSpace / (1024 ** 3)).toPrecision(3)),
            freeSpace: parseFloat((capacity.freeSpace / (1024 ** 3)).toPrecision(3)),
        }
    }
}

export async function openAppSettings() {
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