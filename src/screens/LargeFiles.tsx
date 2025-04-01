import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from '../components/SelectionToolbar';
import ItemCard from '../components/ItemCard';
import * as RNFS from "react-native-fs";

interface FileItem {
    name: string;
    path: string;
    size: number;
    mtime: Date;
    ctime: Date;
    isFile: () => boolean;
    isDirectory: () => boolean;
    isSymbolicLink: () => boolean;
    type: string;
}

// Mock data
const mockLargeFiles: FileItem[] = [
    {
        name: "BigVideo_2024.mp4",
        path: RNFS.ExternalStorageDirectoryPath + "/BigVideo_2024.mp4",
        size: 1.5 * 1024 * 1024 * 1024, // 1.5 GB
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false,
        isSymbolicLink: () => false,
        type: "file"
    },
    {
        name: "GameInstaller.exe",
        path: RNFS.ExternalStorageDirectoryPath + "/GameInstaller.exe",
        size: 4.2 * 1024 * 1024 * 1024, // 4.2 GB
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false,
        isSymbolicLink: () => false,
        type: "file"
    },
    {
        name: "BackupArchive.zip",
        path: RNFS.ExternalStorageDirectoryPath + "/BackupArchive.zip",
        size: 2.8 * 1024 * 1024 * 1024, // 2.8 GB
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false,
        isSymbolicLink: () => false,
        type: "file"
    }
];

export default function LargeFiles() {
    const navigation = useNavigation();
    const [largeFiles, setLargeFiles] = useState<FileItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);

    // รีเซ็ตสถานะเมื่อออกจากหน้านี้
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsSelecting(false);
            setSelectedItems([]);
        });

        return unsubscribe;
    }, [navigation]);

    // อ่านไฟล์จาก storage
    const readFilesFromStorage = async () => {
        try {
            // อ่านไฟล์จาก internal storage
            const files = await RNFS.readDir(RNFS.ExternalStorageDirectoryPath);
            
            // กรองเอาเฉพาะไฟล์ที่มีขนาดใหญ่ (มากกว่า 100MB)
            const largeFiles = files.filter(file => 
                file.isFile() && file.size > 100 * 1024 * 1024 // 100MB
            );

            // แปลงเป็น FileItem
            const fileItems: FileItem[] = largeFiles.map(file => ({
                name: file.name,
                path: file.path,
                size: file.size,
                mtime: file.mtime ? new Date(file.mtime) : new Date(),
                ctime: file.ctime ? new Date(file.ctime) : new Date(),
                isFile: () => true,
                isDirectory: () => false,
                isSymbolicLink: () => false,
                type: "file"
            }));

            // รวม mock data กับไฟล์จริง
            setLargeFiles([...mockLargeFiles, ...fileItems]);
        } catch (error) {
            console.error("Error reading files:", error);
            // ถ้าเกิด error ให้แสดงแค่ mock data
            setLargeFiles(mockLargeFiles);
        }
    };

    // เช็คว่าไฟล์ยังมีอยู่จริงไหม
    const checkFileExists = async (path: string) => {
        try {
            return await RNFS.exists(path);
        } catch (error) {
            console.error("Error checking file existence:", error);
            return false;
        }
    };

    // อัพเดทรายการไฟล์
    const updateFileList = async () => {
        await readFilesFromStorage();
        
        // ถ้าไฟล์ที่เลือกไว้ถูกลบ ให้ลบออกจาก selectedItems ด้วย
        setSelectedItems(prev => 
            prev.filter(path => largeFiles.some(file => file.path === path))
        );
    };

    // เรียกใช้ updateFileList เมื่อหน้าจอถูกโฟกัส
    useFocusEffect(
        React.useCallback(() => {
            updateFileList();
        }, [])
    );

    const handleSelect = (selected: boolean, item: FileItem) => {
        if (!isSelecting) setIsSelecting(true);
        setSelectedItems(prev => {
            const newSelection = selected 
                ? [...prev, item.path]
                : prev.filter(path => path !== item.path);
            
            // ถ้าไม่มีไฟล์ที่เลือกแล้ว ให้ปิดโหมดการเลือก
            if (newSelection.length === 0) {
                setIsSelecting(false);
            }
            
            return newSelection;
        });
    };

    const handleOpen = async (item: FileItem) => {
        // เช็คว่าไฟล์ยังมีอยู่ก่อนเปิด
        const exists = await checkFileExists(item.path);
        if (exists) {
            console.log("Opening file:", item.name);
        } else {
            // ถ้าไฟล์ไม่มีอยู่แล้ว ให้อัพเดทรายการ
            updateFileList();
        }
    };

    const handleItemSelect = (selected: boolean, item: RNFS.ReadDirItem) => {
        handleSelect(selected, item as unknown as FileItem);
    };

    const handleItemOpen = (item: RNFS.ReadDirItem) => {
        handleOpen(item as unknown as FileItem);
    };

    // ฟังก์ชันรีเซ็ตการเลือกทั้งหมด
    const resetSelection = () => {
        setIsSelecting(false);
        setSelectedItems([]);
        // อัพเดทรายการไฟล์เพื่อให้แน่ใจว่าสถานะตรงกับความเป็นจริง
        updateFileList();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {!isSelecting ? (
                <Toolbar
                    navigation={navigation}
                    containerName="Large Files"
                    sortByHandler={() => console.log("Sort Large Files")}
                />
            ) : (
                <SelectionToolBar
                    onCancel={resetSelection}
                    onSelectAll={() => {
                        if (largeFiles.length === selectedItems.length) {
                            setSelectedItems([]);
                        } else {
                            setSelectedItems(largeFiles.map(file => file.path));
                        }
                    }}
                    count={selectedItems.length}
                    maxCount={largeFiles.length}
                />
            )}

            <FlatList
                data={largeFiles}
                keyExtractor={(item) => item.path}
                renderItem={({ item }) => (
                    <ItemCard
                        item={item as unknown as RNFS.ReadDirItem}
                        onSelect={handleItemSelect}
                        onOpen={handleItemOpen}
                        isSelected={selectedItems.includes(item.path)}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7"
    }
});
