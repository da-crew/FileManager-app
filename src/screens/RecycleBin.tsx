import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Modal, Alert, ActivityIndicator, Platform, Linking } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons, AntDesign, FontAwesome5, Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import SelectionToolBar from '../components/SelectionToolbar';
import * as RNFS from 'react-native-fs';
import { getFileIcon } from '../utils/fileIcons';
import { PermissionsAndroid } from 'react-native';
import { getRecycleBinPath } from '../FileSystem';

type RootStackParamList = {
  Search: undefined; 
  RecycleBin: undefined;
};

interface RecycleBinItem {
    id: string;
    name: string;
    originalName: string;
    originalPath: string;
    path: string;
    metaPath: string;
    size: number;
    date: string;
    dateTimestamp: number;
    expireDate: string;
    expireTimestamp: number;
    isFile: boolean;
    isDirectory: boolean;
}

export default function RecycleBin() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [isConfirmRestoreVisible, setConfirmRestoreVisible] = useState(false);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<RecycleBinItem[]>([]);
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [currentSortBy, setCurrentSortBy] = useState<string>('date_desc');

    // โหลดข้อมูลเมื่อเข้าหน้า
    useFocusEffect(
        React.useCallback(() => {
            checkAndLoadItems();
        }, [])
    );

    // ตรวจสอบสิทธิ์และโหลดข้อมูล
    const checkAndLoadItems = async () => {
        const hasPermission = await checkStoragePermission();
        if (hasPermission) {
            loadRecycleBinItems();
        } else {
            const granted = await requestStoragePermission();
            if (granted) {
                loadRecycleBinItems();
            } else {
                setLoading(false);
                Alert.alert(
                    "ต้องการสิทธิ์การเข้าถึง",
                    "แอปต้องการสิทธิ์ในการเข้าถึงพื้นที่จัดเก็บข้อมูลเพื่อแสดงไฟล์ในถังขยะ",
                    [
                        { text: "ยกเลิก", style: "cancel" },
                        { text: "ตั้งค่าแอป", onPress: () => Linking.openSettings() }
                    ]
                );
            }
        }
    };

    // ตรวจสอบการขออนุญาตเข้าถึงพื้นที่จัดเก็บข้อมูล
    const checkStoragePermission = async () => {
        try {
            if (Platform.OS === 'android') {
                if (Platform.Version >= 33) {
                    // Android 13+ ใช้สิทธิ์ใหม่แยกตามประเภทมีเดีย
                    const grantedImages = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    );
                    const grantedVideos = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
                    );
                    const grantedAudio = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
                    );
                    const allGranted = grantedImages && grantedVideos && grantedAudio;
                    setHasPermission(allGranted);
                    return allGranted;
                } else {
                    // Android 12 และเก่ากว่า ใช้สิทธิ์แบบเดิม
                    const granted = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                    );
                    setHasPermission(granted);
                    return granted;
                }
            }
            return true;
        } catch (error) {
            console.error("Error checking permissions:", error);
            return false;
        }
    };

    // ขอสิทธิ์การเข้าถึงพื้นที่จัดเก็บข้อมูล
    const requestStoragePermission = async () => {
        try {
            if (Platform.OS === 'android') {
                if (Platform.Version >= 33) {
                    // Android 13+ ใช้สิทธิ์ใหม่แยกตามประเภทมีเดีย
                    const grantedImages = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                        {
                            title: "ขออนุญาตเข้าถึงรูปภาพ",
                            message: "แอปนี้ต้องการเข้าถึงรูปภาพเพื่อแสดงไฟล์ในถังขยะ",
                            buttonNeutral: "ถามภายหลัง",
                            buttonNegative: "ยกเลิก",
                            buttonPositive: "ตกลง"
                        }
                    );
                    
                    const grantedVideos = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                        {
                            title: "ขออนุญาตเข้าถึงวิดีโอ",
                            message: "แอปนี้ต้องการเข้าถึงวิดีโอเพื่อแสดงไฟล์ในถังขยะ",
                            buttonNeutral: "ถามภายหลัง",
                            buttonNegative: "ยกเลิก",
                            buttonPositive: "ตกลง"
                        }
                    );
                    
                    const grantedAudio = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
                        {
                            title: "ขออนุญาตเข้าถึงไฟล์เสียง",
                            message: "แอปนี้ต้องการเข้าถึงไฟล์เสียงเพื่อแสดงไฟล์ในถังขยะ",
                            buttonNeutral: "ถามภายหลัง",
                            buttonNegative: "ยกเลิก",
                            buttonPositive: "ตกลง"
                        }
                    );
                    
                    const allGranted = 
                        grantedImages === PermissionsAndroid.RESULTS.GRANTED &&
                        grantedVideos === PermissionsAndroid.RESULTS.GRANTED &&
                        grantedAudio === PermissionsAndroid.RESULTS.GRANTED;
                    
                    setHasPermission(allGranted);
                    return allGranted;
                } else {
                    // Android 12 และเก่ากว่า ใช้สิทธิ์แบบเดิม
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        {
                            title: "ขออนุญาตเข้าถึงพื้นที่จัดเก็บ",
                            message: "แอปนี้ต้องการเข้าถึงพื้นที่จัดเก็บเพื่อแสดงไฟล์ในถังขยะ",
                            buttonNeutral: "ถามภายหลัง",
                            buttonNegative: "ยกเลิก",
                            buttonPositive: "ตกลง"
                        }
                    );
                    
                    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
                    setHasPermission(isGranted);
                    return isGranted;
                }
            }
            return true;
        } catch (error) {
            console.error("Error requesting permissions:", error);
            return false;
        }
    };

    // อ่านไฟล์จากถังขยะ
    const loadRecycleBinItems = async () => {
        setLoading(true);
        try {
            // ใช้ฟังก์ชัน getRecycleBinPath เพื่อหาเส้นทางถังขยะ
            const recycleBinPath = await getRecycleBinPath();
            
            if (!recycleBinPath) {
                console.error("ไม่สามารถเข้าถึงหรือสร้างถังขยะได้");
                Alert.alert("Error", "Could not access or create recycle bin directory");
                setFiles([]);
                setLoading(false);
                return;
            }
            
            // อ่านไฟล์จากถังขยะ
            let items;
            try {
                items = await RNFS.readDir(recycleBinPath);
                console.log(`พบรายการ ${items.length} รายการในถังขยะ`);
            } catch (readError) {
                console.error("เกิดข้อผิดพลาดในการอ่านถังขยะ:", readError);
                Alert.alert("Error", "Could not read recycle bin directory: " + readError.message);
                setLoading(false);
                return;
            }
            
            const recycleBinItems: RecycleBinItem[] = [];
            
            for (const item of items) {
                // ข้ามไฟล์ .meta เพราะเราจะอ่านแยก
                if (item.name.endsWith('.meta')) continue;
                
                try {
                    // อ่านไฟล์ .meta ที่เกี่ยวข้อง
                    const metaPath = `${recycleBinPath}/${item.name}.meta`;
                    const metaExists = await RNFS.exists(metaPath);
                    
                    if (!metaExists) {
                        console.log(`ไม่พบไฟล์ meta สำหรับ ${item.name} ข้ามรายการนี้`);
                        continue; // ข้ามถ้าไม่มีไฟล์ meta
                    }
                    
                    try {
                        const metaContent = await RNFS.readFile(metaPath);
                        const meta = JSON.parse(metaContent);
                        
                        // คำนวณเวลาที่แสดง
                        const deletedAt = new Date(meta.deletedAt);
                        const expireAt = new Date(meta.expireAt);
                        
                        // เพิ่มไฟล์เข้ารายการ
                        recycleBinItems.push({
                            id: item.path,
                            name: item.name,
                            originalName: meta.originalName,
                            originalPath: meta.originalPath,
                            path: item.path,
                            metaPath: metaPath,
                            size: meta.size || item.size,
                            date: formatDate(deletedAt),
                            dateTimestamp: meta.deletedAt,
                            expireDate: formatDate(expireAt),
                            expireTimestamp: meta.expireAt,
                            isFile: meta.isFile,
                            isDirectory: meta.isDirectory
                        });
                        
                        console.log(`โหลดข้อมูลสำเร็จสำหรับ: ${item.name}`);
                    } catch (parseError) {
                        console.error(`เกิดข้อผิดพลาดในการอ่านหรือแปลงข้อมูล meta สำหรับ ${item.name}:`, parseError);
                    }
                } catch (error) {
                    console.error(`Error parsing metadata for ${item.name}:`, error);
                }
            }
            
            console.log(`โหลดรายการที่มี metadata ทั้งหมด ${recycleBinItems.length} รายการ`);
            
            // เรียงลำดับตามที่ผู้ใช้เลือกไว้
            const sortedItems = sortItems(recycleBinItems, currentSortBy);
            
            setFiles(sortedItems);
        } catch (error) {
            console.error("Error loading recycle bin items:", error);
            Alert.alert("Error", `Could not load recycle bin items: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    // ฟังก์ชันฟอร์แมตวันที่
    const formatDate = (date: Date | number): string => {
        if (!date) return "ไม่ระบุวันที่";
        
        try {
            // แปลงให้เป็น Date object ถ้าเป็น timestamp (number)
            const dateObj = date instanceof Date ? date : new Date(date);
            
            const now = new Date();
            const diff = Math.abs(now.getTime() - dateObj.getTime());
            const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                // วันนี้
                return `วันนี้ ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            } else if (diffDays === 1) {
                // เมื่อวาน
                return `เมื่อวาน ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            } else if (diffDays < 7) {
                // ภายใน 1 สัปดาห์
                const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
                return `วัน${days[dateObj.getDay()]} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            } else {
                // เกิน 1 สัปดาห์
                return `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            }
        } catch (error) {
            console.error("Error formatting date:", error, date);
            return "วันที่ไม่ถูกต้อง";
        }
    };
    
    // ฟังก์ชันฟอร์แมตขนาดไฟล์
    const formatFileSize = (bytes: number | undefined): string => {
        if (!bytes) return "0 B";
        
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };
    
    const toggleSelect = (id: string) => {
        if (!isSelecting) setIsSelecting(true);
        setSelectedItems(prev => {
            const newSelection = prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id];
            
            // ถ้าไม่มีไฟล์ที่เลือกแล้ว ให้ปิดโหมดการเลือก
            if (newSelection.length === 0) {
                setIsSelecting(false);
            }
            
            return newSelection;
        });
    };
    
    // ฟังก์ชันลบไฟล์อย่างถาวร
    const permanentlyDeleteSelected = async () => {
        try {
            // หาไฟล์ที่ตรงกับ id ที่เลือก
            const itemsToDelete = files.filter(file => selectedItems.includes(file.id));
            
            let deleteCount = 0;
            let errorCount = 0;
            
            for (const item of itemsToDelete) {
                try {
                    console.log(`กำลังลบไฟล์ถาวร: ${item.path}`);
                    
                    // ตรวจสอบว่าไฟล์ยังอยู่หรือไม่
                    const fileExists = await RNFS.exists(item.path);
                    const metaExists = await RNFS.exists(item.metaPath);
                    
                    if (!fileExists) {
                        console.log(`ไม่พบไฟล์ที่: ${item.path}`);
                    }
                    
                    if (!metaExists) {
                        console.log(`ไม่พบไฟล์ meta ที่: ${item.metaPath}`);
                    }
                    
                    // ลบไฟล์และไฟล์ meta
                    if (fileExists) {
                        await RNFS.unlink(item.path);
                        console.log(`ลบไฟล์สำเร็จ: ${item.path}`);
                    }
                    
                    if (metaExists) {
                        await RNFS.unlink(item.metaPath);
                        console.log(`ลบไฟล์ meta สำเร็จ: ${item.metaPath}`);
                    }
                    
                    deleteCount++;
                } catch (deleteError) {
                    console.error(`Error deleting ${item.path}:`, deleteError);
                    errorCount++;
                }
            }
            
            // รีเฟรชรายการไฟล์
            loadRecycleBinItems();
            setSelectedItems([]);
            setIsSelecting(false);
            setConfirmDeleteVisible(false);
            
            if (errorCount > 0) {
                Alert.alert(
                    "ลบเสร็จสิ้น",
                    `ลบสำเร็จ: ${deleteCount} รายการ\nลบไม่สำเร็จ: ${errorCount} รายการ`,
                    [{ text: "ตกลง" }]
                );
            } else {
                Alert.alert(
                    "ลบเรียบร้อย",
                    `ลบไฟล์จำนวน ${deleteCount} รายการเรียบร้อยแล้ว`,
                    [{ text: "ตกลง" }]
                );
            }
        } catch (error) {
            console.error("Error permanently deleting items:", error);
            Alert.alert("Error", `Could not delete items permanently: ${error.message}`);
            setConfirmDeleteVisible(false);
        }
    };
    
    // ฟังก์ชันกู้คืนไฟล์
    const restoreSelected = async () => {
        try {
            // หาไฟล์ที่ตรงกับ id ที่เลือก
            const itemsToRestore = files.filter(file => selectedItems.includes(file.id));
            let restoredCount = 0;
            let errorCount = 0;
            
            for (const item of itemsToRestore) {
                try {
                    console.log(`กำลังกู้คืนไฟล์: ${item.path} ไปยัง ${item.originalPath}`);
                    
                    // ตรวจสอบว่าเส้นทางต้นทางยังอยู่หรือไม่
                    const originalPathDir = item.originalPath.substring(0, item.originalPath.lastIndexOf('/'));
                    const originalPathExists = await RNFS.exists(originalPathDir);
                    
                    if (!originalPathExists) {
                        // ถ้าโฟลเดอร์ต้นทางไม่มีอยู่ ให้สร้างใหม่
                        console.log(`สร้างโฟลเดอร์ต้นทาง: ${originalPathDir}`);
                        try {
                            await RNFS.mkdir(originalPathDir, { NSURLIsExcludedFromBackupKey: false });
                            console.log(`สร้างโฟลเดอร์สำเร็จ: ${originalPathDir}`);
                        } catch (mkdirError) {
                            console.error(`ไม่สามารถสร้างโฟลเดอร์ต้นทาง: ${originalPathDir}`, mkdirError);
                            throw new Error(`Cannot create original directory: ${mkdirError.message}`);
                        }
                    }
                    
                    // ตรวจสอบว่าไฟล์ในถังขยะยังมีอยู่หรือไม่
                    const recycleFileExists = await RNFS.exists(item.path);
                    if (!recycleFileExists) {
                        console.error(`ไม่พบไฟล์ในถังขยะ: ${item.path}`);
                        throw new Error(`File not found in recycle bin: ${item.path}`);
                    }
                    
                    // ตรวจสอบว่ามีไฟล์ที่ชื่อเดียวกันอยู่แล้วหรือไม่
                    const originalPathFileExists = await RNFS.exists(item.originalPath);
                    let destinationPath = item.originalPath;
                    
                    if (originalPathFileExists) {
                        // ถ้ามีไฟล์อยู่แล้ว ให้เปลี่ยนชื่อไฟล์ด้วยการเพิ่ม "(recovered)"
                        const fileExt = item.originalName.includes('.') 
                            ? item.originalName.substring(item.originalName.lastIndexOf('.')) 
                            : '';
                        const fileName = item.originalName.includes('.')
                            ? item.originalName.substring(0, item.originalName.lastIndexOf('.'))
                            : item.originalName;
                        
                        destinationPath = `${originalPathDir}/${fileName} (recovered)${fileExt}`;
                        console.log(`พบไฟล์ที่มีชื่อซ้ำ เปลี่ยนเส้นทางเป็น: ${destinationPath}`);
                    }
                    
                    // ย้ายไฟล์กลับไปที่เดิม
                    try {
                        await RNFS.moveFile(item.path, destinationPath);
                        console.log(`ย้ายไฟล์สำเร็จจาก ${item.path} ไปยัง ${destinationPath}`);
                    } catch (moveError) {
                        console.error(`ไม่สามารถย้ายไฟล์: ${item.path} ไปยัง ${destinationPath}`, moveError);
                        throw new Error(`Cannot move file: ${moveError.message}`);
                    }
                    
                    // ลบไฟล์ meta
                    const metaExists = await RNFS.exists(item.metaPath);
                    if (metaExists) {
                        try {
                            await RNFS.unlink(item.metaPath);
                            console.log(`ลบไฟล์ meta สำเร็จ: ${item.metaPath}`);
                        } catch (unlinkError) {
                            console.error(`ไม่สามารถลบไฟล์ meta: ${item.metaPath}`, unlinkError);
                            // ไม่ต้อง throw error เพราะการลบ metadata ไม่สำคัญเท่ากับการย้ายไฟล์
                        }
                    } else {
                        console.log(`ไม่พบไฟล์ meta: ${item.metaPath}`);
                    }
                    
                    restoredCount++;
                } catch (restoreError) {
                    console.error(`เกิดข้อผิดพลาดในการกู้คืน ${item.path}:`, restoreError);
                    errorCount++;
                }
            }
            
            // รีเฟรชรายการไฟล์
            loadRecycleBinItems();
            setSelectedItems([]);
            setIsSelecting(false);
            setConfirmRestoreVisible(false);
            
            if (errorCount > 0) {
                Alert.alert(
                    "กู้คืนเสร็จสิ้น",
                    `กู้คืนสำเร็จ: ${restoredCount} รายการ\nกู้คืนไม่สำเร็จ: ${errorCount} รายการ`,
                    [{ text: "ตกลง" }]
                );
            } else {
                Alert.alert(
                    "กู้คืนเรียบร้อย",
                    `กู้คืนไฟล์จำนวน ${restoredCount} รายการเรียบร้อยแล้ว`,
                    [{ text: "ตกลง" }]
                );
            }
        } catch (error) {
            console.error("Error restoring items:", error);
            Alert.alert("Error", `Could not restore items: ${error.message}`);
            setConfirmRestoreVisible(false);
        }
    };
    
    // ฟังก์ชันล้างถังขยะทั้งหมด
    const emptyRecycleBin = async () => {
        try {
            // ใช้ฟังก์ชัน getRecycleBinPath เพื่อหาเส้นทางถังขยะ
            const recycleBinPath = await getRecycleBinPath();
            
            if (!recycleBinPath) {
                Alert.alert("Error", "Could not find recycle bin directory");
                return;
            }
            
            // อ่านรายการไฟล์ในถังขยะ
            let items;
            try {
                items = await RNFS.readDir(recycleBinPath);
                console.log(`พบรายการ ${items.length} รายการในถังขยะที่จะลบ`);
            } catch (readError) {
                console.error("เกิดข้อผิดพลาดในการอ่านถังขยะ:", readError);
                Alert.alert("Error", "Could not read recycle bin directory: " + readError.message);
                return;
            }
            
            // ลบไฟล์ทั้งหมด
            let deleteCount = 0;
            let errorCount = 0;
            
            for (const item of items) {
                try {
                    console.log(`กำลังลบ: ${item.path}`);
                    await RNFS.unlink(item.path);
                    deleteCount++;
                } catch (deleteError) {
                    console.error(`เกิดข้อผิดพลาดในการลบ ${item.path}:`, deleteError);
                    errorCount++;
                }
            }
            
            loadRecycleBinItems();
            
            if (errorCount > 0) {
                Alert.alert(
                    "ล้างถังขยะเสร็จสิ้น",
                    `ลบสำเร็จ: ${deleteCount} รายการ\nลบไม่สำเร็จ: ${errorCount} รายการ`,
                    [{ text: "ตกลง" }]
                );
            } else {
                Alert.alert(
                    "ล้างถังขยะเรียบร้อย",
                    `ลบไฟล์ทั้งหมด ${deleteCount} รายการในถังขยะเรียบร้อยแล้ว`,
                    [{ text: "ตกลง" }]
                );
            }
        } catch (error) {
            console.error("Error emptying recycle bin:", error);
            Alert.alert("Error", `Could not empty recycle bin: ${error.message}`);
        } finally {
            setMenuVisible(false);
        }
    };

    // ฟังก์ชันเรียงลำดับข้อมูล
    const sortItems = (items: RecycleBinItem[], sortType: string): RecycleBinItem[] => {
        const sortedItems = [...items];

        switch (sortType) {
            case 'date_desc': // วันที่ลบล่าสุดไปเก่าสุด (ค่าเริ่มต้น)
                return sortedItems.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
            case 'date_asc': // วันที่ลบเก่าสุดไปล่าสุด
                return sortedItems.sort((a, b) => a.dateTimestamp - b.dateTimestamp);
            case 'name_asc': // ชื่อไฟล์ A-Z
                return sortedItems.sort((a, b) => a.originalName.localeCompare(b.originalName));
            case 'name_desc': // ชื่อไฟล์ Z-A
                return sortedItems.sort((a, b) => b.originalName.localeCompare(a.originalName));
            case 'size_desc': // ขนาดใหญ่สุดไปเล็กสุด
                return sortedItems.sort((a, b) => b.size - a.size);
            case 'size_asc': // ขนาดเล็กสุดไปใหญ่สุด
                return sortedItems.sort((a, b) => a.size - b.size);
            case 'expire_asc': // วันหมดอายุใกล้สุดไปไกลสุด
                return sortedItems.sort((a, b) => a.expireTimestamp - b.expireTimestamp);
            default:
                return sortedItems;
        }
    };

    // ฟังก์ชันจัดการเมื่อเลือกวิธีเรียงลำดับ
    const handleSortChange = (sortType: string) => {
        setCurrentSortBy(sortType);
        setFiles(sortItems(files, sortType));
        setSortByOptionVisible(false);
    };

    // ฟังก์ชันแปลงชื่อการเรียงลำดับเป็นภาษาไทย
    const getSortByLabel = (sortType: string): string => {
        switch (sortType) {
            case 'date_desc': return 'วันที่ลบล่าสุด';
            case 'date_asc': return 'วันที่ลบเก่าสุด';
            case 'name_asc': return 'ชื่อไฟล์ (A-Z)';
            case 'name_desc': return 'ชื่อไฟล์ (Z-A)';
            case 'size_desc': return 'ขนาดไฟล์ (ใหญ่-เล็ก)';
            case 'size_asc': return 'ขนาดไฟล์ (เล็ก-ใหญ่)';
            case 'expire_asc': return 'วันหมดอายุใกล้สุด';
            default: return 'ไม่ระบุ';
        }
    };

    const renderItem = ({ item }: { item: RecycleBinItem }) => {
        const isSelected = selectedItems.includes(item.id);
        
        return (
            <TouchableOpacity
                style={[
                    styles.itemContainer,
                    isSelected && styles.selectedItem,
                ]}
                onPress={() => (isSelecting ? toggleSelect(item.id) : null)}
                onLongPress={() => toggleSelect(item.id)}
            >
                <View style={styles.fileIconContainer}>
                    {item.isDirectory ? (
                        <MaterialIcons name="folder" size={40} color="#FFC107" />
                    ) : (
                        getFileIcon(item.originalName || item.name)
                    )}
                </View>
                <View style={styles.fileInfoContainer}>
                    <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                        {item.originalName || item.name}
                    </Text>
                    <Text style={styles.fileDetails}>
                        {formatFileSize(item.size)} • {formatDate(item.dateTimestamp)}
                    </Text>
                    <Text style={styles.expireText}>
                        Expires: {formatDate(item.expireTimestamp)}
                    </Text>
                </View>
                <View style={styles.selectIconContainer}>
                    {isSelecting && (
                        <MaterialIcons
                            name={isSelected ? "check-circle" : "radio-button-unchecked"}
                            size={24}
                            color={isSelected ? "#4CAF50" : "#9E9E9E"}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // แสดงข้อความเมื่อกำลังโหลดหรือไม่พบไฟล์
    const renderEmptyContent = () => {
        if (loading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.emptyText}>กำลังโหลดข้อมูล...</Text>
                </View>
            );
        }
        
        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="delete-outline" size={80} color="#cccccc" />
                <Text style={styles.emptyText}>ไม่มีไฟล์ในถังขยะ</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            {!isSelecting ? (
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios-new" size={20} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>ถังขยะ</Text>
                    
                    {/* ปุ่มค้นหาที่ลิงก์ไปยังหน้าค้นหา */}
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate("Search")}
                    >
                        <Ionicons name="search" size={24} color="black" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => setSortByOptionVisible(true)}
                    >
                        <FontAwesome5 name="sort" size={24} color="black" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => setMenuVisible(true)}
                    >
                        <MaterialIcons name="more-vert" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            ) : (
                <SelectionToolBar
                    onCancel={() => { setIsSelecting(false); setSelectedItems([]); }}
                    onSelectAll={() => {
                        if (files.length === selectedItems.length) {
                            setSelectedItems([]);
                            setIsSelecting(false);
                        } else {
                            setSelectedItems(files.map(file => file.id));
                        }
                    }}
                    count={selectedItems.length}
                    maxCount={files.length}
                />
            )}

            <Text style={styles.subHeader}>ไฟล์จะถูกลบแบบถาวรหลังจาก 30 วัน</Text>

            <FlatList
                data={files}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyContent}
            />

            {/* แสดงแถบเครื่องมือด้านล่างเมื่อมีการเลือก */}
            {isSelecting && selectedItems.length > 0 && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity 
                        style={styles.bottomButton} 
                        onPress={() => setConfirmRestoreVisible(true)}
                    >
                        <Feather name="refresh-cw" size={24} color="#2196F3" />
                        <Text style={[styles.bottomButtonText, { color: '#2196F3' }]}>กู้คืน</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.bottomButton}
                        onPress={() => setConfirmDeleteVisible(true)}
                    >
                        <MaterialIcons name="delete-forever" size={24} color="#FF3B30" />
                        <Text style={[styles.bottomButtonText, { color: '#FF3B30' }]}>ลบถาวร</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal ยืนยันการลบ */}
            <Modal
                transparent
                visible={isConfirmDeleteVisible}
                animationType="fade"
                onRequestClose={() => setConfirmDeleteVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <MaterialIcons name="delete-forever" size={50} color="#FF3B30" style={{ marginBottom: 15 }} />
                        <Text style={styles.modalTitle}>ลบถาวร</Text>
                        <Text style={styles.modalMessage}>
                            คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ที่เลือกแบบถาวร ({selectedItems.length} รายการ)? 
                            การกระทำนี้ไม่สามารถยกเลิกได้
                        </Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#f0f0f0' }]}
                                onPress={() => setConfirmDeleteVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, styles.cancelText]}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#ffeded' }]}
                                onPress={permanentlyDeleteSelected}
                            >
                                <Text style={[styles.modalButtonText, styles.deleteText]}>ลบถาวร</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal ยืนยันการกู้คืน */}
            <Modal
                transparent
                visible={isConfirmRestoreVisible}
                animationType="fade"
                onRequestClose={() => setConfirmRestoreVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Feather name="refresh-cw" size={50} color="#2196F3" style={{ marginBottom: 15 }} />
                        <Text style={styles.modalTitle}>กู้คืนไฟล์</Text>
                        <Text style={styles.modalMessage}>
                            คุณต้องการกู้คืนไฟล์ที่เลือก ({selectedItems.length} รายการ) กลับไปยังตำแหน่งเดิมหรือไม่?
                        </Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#f0f0f0' }]}
                                onPress={() => setConfirmRestoreVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, styles.cancelText]}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#e3f2fd' }]}
                                onPress={restoreSelected}
                            >
                                <Text style={[styles.modalButtonText, { color: '#2196F3' }]}>กู้คืน</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* เมนูสามจุด */}
            <Modal
                transparent
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.menuModalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity 
                            style={styles.menuItem} 
                            onPress={() => {
                                setMenuVisible(false);
                                setSelectedItems(files.map(file => file.id));
                                setIsSelecting(true);
                            }}
                        >
                            <MaterialCommunityIcons name="select-all" size={24} color="black" />
                            <Text style={styles.menuItemText}>เลือกทั้งหมด</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.menuItem} 
                            onPress={() => {
                                setMenuVisible(false);
                                Alert.alert(
                                    "ล้างถังขยะ",
                                    "คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ทั้งหมดในถังขยะแบบถาวร? การกระทำนี้ไม่สามารถยกเลิกได้",
                                    [
                                        { text: "ยกเลิก", style: "cancel" },
                                        { text: "ล้างถังขยะ", style: "destructive", onPress: emptyRecycleBin }
                                    ]
                                );
                            }}
                        >
                            <Ionicons name="trash-bin" size={24} color="#FF3B30" />
                            <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>ล้างถังขยะ</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.menuItem} 
                            onPress={() => {
                                setMenuVisible(false);
                                loadRecycleBinItems();
                            }}
                        >
                            <MaterialIcons name="refresh" size={24} color="black" />
                            <Text style={styles.menuItemText}>รีเฟรช</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal ตัวเลือกการเรียงลำดับ */}
            <Modal
                transparent
                visible={sortByOptionVisible}
                animationType="fade"
                onRequestClose={() => setSortByOptionVisible(false)}
            >
                <TouchableOpacity
                    style={styles.menuModalOverlay}
                    activeOpacity={1}
                    onPress={() => setSortByOptionVisible(false)}
                >
                    <View style={styles.sortOptionsContainer}>
                        <View style={styles.sortHeader}>
                            <Text style={styles.sortTitle}>เรียงตาม</Text>
                            <TouchableOpacity onPress={() => setSortByOptionVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.sortOption, currentSortBy === 'date_desc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('date_desc')}
                        >
                            <MaterialIcons
                                name="arrow-downward"
                                size={22}
                                color={currentSortBy === 'date_desc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, currentSortBy === 'date_desc' && styles.activeSortText]}>
                                วันที่ลบล่าสุด
                            </Text>
                            {currentSortBy === 'date_desc' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, currentSortBy === 'date_asc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('date_asc')}
                        >
                            <MaterialIcons
                                name="arrow-upward"
                                size={22}
                                color={currentSortBy === 'date_asc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, currentSortBy === 'date_asc' && styles.activeSortText]}>
                                วันที่ลบเก่าสุด
                            </Text>
                            {currentSortBy === 'date_asc' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, currentSortBy === 'name_asc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('name_asc')}
                        >
                            <MaterialIcons
                                name="sort-by-alpha"
                                size={22}
                                color={currentSortBy === 'name_asc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, currentSortBy === 'name_asc' && styles.activeSortText]}>
                                ชื่อไฟล์ (A-Z)
                            </Text>
                            {currentSortBy === 'name_asc' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, currentSortBy === 'name_desc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('name_desc')}
                        >
                            <AntDesign
                                name="swap"
                                size={22}
                                color={currentSortBy === 'name_desc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, currentSortBy === 'name_desc' && styles.activeSortText]}>
                                ชื่อไฟล์ (Z-A)
                            </Text>
                            {currentSortBy === 'name_desc' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, currentSortBy === 'size_desc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('size_desc')}
                        >
                            <FontAwesome5
                                name="sort-amount-down"
                                size={22}
                                color={currentSortBy === 'size_desc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, currentSortBy === 'size_desc' && styles.activeSortText]}>
                                ขนาดไฟล์ (ใหญ่-เล็ก)
                            </Text>
                            {currentSortBy === 'size_desc' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, currentSortBy === 'size_asc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('size_asc')}
                        >
                            <FontAwesome5
                                name="sort-amount-up"
                                size={22}
                                color={currentSortBy === 'size_asc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, currentSortBy === 'size_asc' && styles.activeSortText]}>
                                ขนาดไฟล์ (เล็ก-ใหญ่)
                            </Text>
                            {currentSortBy === 'size_asc' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, currentSortBy === 'expire_asc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('expire_asc')}
                        >
                            <MaterialIcons
                                name="timelapse"
                                size={22}
                                color={currentSortBy === 'expire_asc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, currentSortBy === 'expire_asc' && styles.activeSortText]}>
                                วันหมดอายุใกล้สุด
                            </Text>
                            {currentSortBy === 'expire_asc' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2",
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(242, 242, 242, 0.6)'
    },
    headerButton: {
        padding: 8,
        marginLeft: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(242, 242, 242, 0.6)'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        flex: 1,
        marginHorizontal: 10,
        color: "#333",
    },
    subHeader: {
        fontSize: 14,
        color: "#757575",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2"
    },
    sortInfoBar: {
        flexDirection: "row",
        backgroundColor: "#f8f8f8",
        padding: 12,
        paddingHorizontal: 16,
        borderRadius: 25,
        marginHorizontal: 10,
        marginVertical: 8,
        alignItems: "center",
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    sortInfoText: {
        fontSize: 14,
        color: "#757575",
        flex: 1,
    },
    sortChangeButton: {
        fontSize: 14,
        color: "#2196F3",
        fontWeight: "600",
    },
    listContainer: {
        padding: 8,
        flexGrow: 1
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    selectedItem: {
        backgroundColor: '#E3F2FD',
        borderWidth: 1,
        borderColor: '#2196F3',
    },
    fileIconContainer: {
        marginRight: 16,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileInfoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    fileName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212121',
        marginBottom: 4,
    },
    fileDetails: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 2,
    },
    expireText: {
        fontSize: 11,
        color: '#F44336',
        fontStyle: 'italic',
    },
    selectIconContainer: {
        width: 30,
        alignItems: 'center',
    },
    bottomBar: {
        backgroundColor: '#ffffff', 
        borderTopWidth: 1, 
        borderColor: '#f2f2f2', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        paddingHorizontal: 15,
        paddingVertical: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bottomButton: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        justifyContent: "center"
    },
    bottomButtonText: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 4
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyIcon: {
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        width: '85%',
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: "#333"
    },
    modalMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        color: "#666",
        lineHeight: 20
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 8,
        borderRadius: 8
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600'
    },
    cancelText: {
        color: '#666'
    },
    deleteText: {
        color: '#FF3B30'
    },
    menuModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    menuContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemText: {
        marginLeft: 16,
        fontSize: 16,
        color: '#333',
    },
    sortOptionsContainer: {
        position: 'absolute',
        top: '15%',
        left: '10%',
        right: '10%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    sortHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10
    },
    sortTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#333"
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        width: '100%'
    },
    activeSortOption: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
    },
    sortOptionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        marginLeft: 12
    },
    activeSortText: {
        fontWeight: 'bold',
        color: '#2196F3'
    },
});