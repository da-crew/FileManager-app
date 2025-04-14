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

    push(dirName: string) {
        this.nodes.push(dirName);
    }

    pop(): string | undefined {
        return this.nodes.pop();
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

// ฟังก์ชันสำหรับช่วยหาหรือสร้างเส้นทางถังขยะที่เหมาะสม
export async function getRecycleBinPath(): Promise<string | null> {
    // ทดลองใช้เส้นทางถังขยะหลายตัวเลือก
    const pathOptions = [
        RNFS.ExternalStorageDirectoryPath + '/.RecycleBin',      // ตัวเลือกที่ 1 (เดิม)
        RNFS.DocumentDirectoryPath + '/.RecycleBin',             // ตัวเลือกที่ 2 (ควรเข้าถึงได้ง่ายกว่า)
        RNFS.CachesDirectoryPath + '/.RecycleBin'                // ตัวเลือกที่ 3 (ใช้ในกรณีฉุกเฉิน)
    ];
    
    // ทดสอบแต่ละเส้นทางเพื่อหาที่สามารถเข้าถึงได้
    for (const path of pathOptions) {
        console.log(`ทดสอบเส้นทางถังขยะที่: ${path}`);
        try {
            const exists = await RNFS.exists(path);
            if (exists) {
                console.log(`พบถังขยะที่: ${path}`);
                return path;
            } else {
                try {
                    // ลองสร้างโฟลเดอร์
                    await RNFS.mkdir(path);
                    console.log(`สร้างถังขยะสำเร็จที่: ${path}`);
                    return path;
                } catch (mkdirError) {
                    console.log(`ไม่สามารถสร้างถังขยะที่: ${path} เนื่องจาก: ${mkdirError}`);
                }
            }
        } catch (e) {
            console.log(`ไม่สามารถเข้าถึงเส้นทาง: ${path} เนื่องจาก: ${e}`);
        }
    }
    
    console.error("ไม่สามารถเข้าถึงหรือสร้างถังขยะได้ในทุกเส้นทาง");
    return null;
}

// ดึงรายการไฟล์ในถังขยะ
export async function getRecycleBinContents(): Promise<RNFS.ReadDirItem[]> {
    try {
        await ensureRecycleBinExists();
        
        // อ่านรายการไฟล์ในถังขยะ
        const files = await RNFS.readDir(RECYCLE_BIN_PATH);
        
        // กรองเฉพาะไฟล์ที่ไม่ใช่ไฟล์ข้อมูล .info
        return files.filter(file => !file.name.endsWith('.info'));
    } catch (error) {
        console.error("Error getting Recycle Bin contents:", error);
        return [];
    }
}

// กู้คืนไฟล์จากถังขยะไปยังตำแหน่งเดิม
export async function restoreFromRecycleBin(recycleBinPath: string): Promise<{success: boolean, restoredPath: string}> {
    try {
        // ตรวจสอบว่าไฟล์ยังมีอยู่ในถังขยะหรือไม่
        const fileExists = await RNFS.exists(recycleBinPath);
        if (!fileExists) {
            console.error("File not found in Recycle Bin:", recycleBinPath);
            return { success: false, restoredPath: "" };
        }
        
        // อ่านข้อมูลเกี่ยวกับไฟล์จากไฟล์ .info
        const infoPath = `${recycleBinPath}.info`;
        const infoExists = await RNFS.exists(infoPath);
        
        if (infoExists) {
            // อ่านข้อมูลจากไฟล์ .info
            const infoContent = await RNFS.readFile(infoPath, 'utf8');
            const fileInfo = JSON.parse(infoContent);
            const originalPath = fileInfo.originalPath;
            
            // สร้างโฟลเดอร์ปลายทางหากยังไม่มี
            const dirPath = originalPath.substring(0, originalPath.lastIndexOf('/'));
            const dirExists = await RNFS.exists(dirPath);
            
            if (!dirExists) {
                try {
                    await RNFS.mkdir(dirPath, { NSURLIsExcludedFromBackupKey: false });
                } catch (error) {
                    console.error("Could not create directory for restored file:", error);
                    return { success: false, restoredPath: "" };
                }
            }
            
            // ตรวจสอบว่ามีไฟล์ชื่อนี้อยู่แล้วหรือไม่
            let finalPath = originalPath;
            if (await RNFS.exists(originalPath)) {
                // หากมีไฟล์ชื่อซ้ำ ให้เพิ่ม "(restored)" ต่อท้ายชื่อ
                const lastDotIndex = originalPath.lastIndexOf('.');
                if (lastDotIndex !== -1) {
                    // มีนามสกุลไฟล์
                    const name = originalPath.substring(0, lastDotIndex);
                    const ext = originalPath.substring(lastDotIndex);
                    finalPath = `${name} (restored)${ext}`;
                } else {
                    // ไม่มีนามสกุลไฟล์
                    finalPath = `${originalPath} (restored)`;
                }
            }
            
            // ย้ายไฟล์กลับไปยังตำแหน่งเดิม
            await RNFS.moveFile(recycleBinPath, finalPath);
            
            // ลบไฟล์ .info
            await RNFS.unlink(infoPath);
            
            return { success: true, restoredPath: finalPath };
        } else {
            // ถ้าไม่มีไฟล์ .info ให้ย้ายไปยังโฟลเดอร์ Restored
            const fileName = recycleBinPath.split('/').pop();
            if (!fileName) {
                return { success: false, restoredPath: "" };
            }
            
            // แปลงชื่อไฟล์ ลบ timestamp prefix ออก
            const displayName = fileName.replace(/^\d+_/, '');
            
            // สร้างโฟลเดอร์ Restored ถ้ายังไม่มี
            const restoredDir = `${RNFS.DocumentDirectoryPath}/Restored`;
            if (!(await RNFS.exists(restoredDir))) {
                await RNFS.mkdir(restoredDir);
            }
            
            const restoredPath = `${restoredDir}/${displayName}`;
            let finalPath = restoredPath;
            
            // ตรวจสอบว่ามีไฟล์ชื่อซ้ำหรือไม่
            if (await RNFS.exists(restoredPath)) {
                const lastDotIndex = displayName.lastIndexOf('.');
                if (lastDotIndex !== -1) {
                    // มีนามสกุลไฟล์
                    const name = displayName.substring(0, lastDotIndex);
                    const ext = displayName.substring(lastDotIndex);
                    finalPath = `${restoredDir}/${name} (restored)${ext}`;
                } else {
                    // ไม่มีนามสกุลไฟล์
                    finalPath = `${restoredDir}/${displayName} (restored)`;
                }
            }
            
            // ย้ายไฟล์ไปยังโฟลเดอร์ Restored
            await RNFS.moveFile(recycleBinPath, finalPath);
            
            return { success: true, restoredPath: finalPath };
        }
    } catch (error) {
        console.error("Error restoring file from Recycle Bin:", error);
        return { success: false, restoredPath: "" };
    }
}