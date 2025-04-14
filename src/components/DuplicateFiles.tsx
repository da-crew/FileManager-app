import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toolbar from "./Toolbar";
import SelectionToolBar from './SelectionToolbar';
import ItemCard from './ItemCard';
import * as RNFS from "react-native-fs";
import { Feather, Foundation, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import BottomBarItem from "./ContentContainer/BottomBarItem";
import { Platform, PermissionsAndroid } from "react-native";
import { getFileType, openWith } from "../utils/openWith";

// กำหนดโครงสร้างข้อมูลสำหรับไฟล์ที่ซ้ำกัน
interface DuplicateGroup {
    id: string;
    files: RNFS.ReadDirItem[];
    fileSize: number;
}

// ช่วยในการนับจำนวนโดยชื่อไฟล์
interface FileNameCount {
    [key: string]: number;
}

export default function DuplicateFiles() {
    const navigation = useNavigation();
    const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
    const [allFiles, setAllFiles] = useState<RNFS.ReadDirItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);
    const [processedFiles, setProcessedFiles] = useState(0);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);

    // ฟังก์ชันแปลงชื่อไฟล์ เอาส่วนขยายออก
    const getBaseName = (filename: string): string => {
        // หาตำแหน่งจุดสุดท้าย
        const lastDotPosition = filename.lastIndexOf('.');
        // ถ้าไม่มีจุด ให้คืนชื่อไฟล์ทั้งหมด
        if (lastDotPosition === -1) return filename;
        // ตัดเอาส่วนก่อนจุดสุดท้าย
        return filename.substring(0, lastDotPosition);
    };

    // ฟังก์ชันเอาส่วนขยายของไฟล์
    const getExtension = (filename: string): string => {
        const lastDotPosition = filename.lastIndexOf('.');
        if (lastDotPosition === -1) return '';
        return filename.substring(lastDotPosition).toLowerCase();
    };

    // ตรวจสอบว่าชื่อไฟล์มีความคล้ายกันหรือไม่
    const isSimilarFilename = (name1: string, name2: string): boolean => {
        const baseName1 = getBaseName(name1).toLowerCase();
        const baseName2 = getBaseName(name2).toLowerCase();

        // ตรวจสอบชื่อที่เหมือนกันเลย
        if (baseName1 === baseName2) return true;

        // ตรวจสอบชื่อที่มีเลขท้าย
        const pattern1 = baseName1.replace(/[-_]?\d+$/, '');
        const pattern2 = baseName2.replace(/[-_]?\d+$/, '');
        if (pattern1 === pattern2 && pattern1.length > 3) return true;

        // ตรวจสอบชื่อที่มีคำลงท้ายพิเศษ
        const simPattern1 = baseName1.replace(/[-_]?(copy|duplicate|backup)(\d*)$/i, '');
        const simPattern2 = baseName2.replace(/[-_]?(copy|duplicate|backup)(\d*)$/i, '');
        if (simPattern1 === simPattern2 && simPattern1.length > 3) return true;

        return false;
    };

    // ตรวจสอบการขออนุญาตเข้าถึงพื้นที่จัดเก็บข้อมูล
    async function checkStoragePermission() {
        try {
            if (Platform.OS === 'android') {
                if (Platform.Version >= 33) {
                    // Android 13+ (API 33+) ใช้สิทธิ์ใหม่แยกตามประเภทมีเดีย
                    const grantedImages = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    );
                    const grantedVideos = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
                    );
                    const grantedAudio = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
                    );
                    return grantedImages && grantedVideos && grantedAudio;
                } else {
                    // Android 12 และเก่ากว่า ใช้สิทธิ์แบบเดิม
                    return await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                    );
                }
            }
            return true;
        } catch (error) {
            console.error("Error checking permissions:", error);
            return false;
        }
    }

    // ขออนุญาตเข้าถึงพื้นที่จัดเก็บข้อมูล
    async function requestStoragePermission() {
        try {
            if (Platform.OS === 'android') {
                if (Platform.Version >= 33) {
                    // Android 13+ ขอสิทธิ์แบบใหม่
                    const requestImages = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                        {
                            title: "ขออนุญาตเข้าถึงรูปภาพ",
                            message: "แอปนี้ต้องการเข้าถึงรูปภาพของคุณเพื่อค้นหาไฟล์ซ้ำ",
                            buttonNeutral: "ถามภายหลัง",
                            buttonNegative: "ยกเลิก",
                            buttonPositive: "ตกลง"
                        }
                    );

                    const requestVideos = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                        {
                            title: "ขออนุญาตเข้าถึงวิดีโอ",
                            message: "แอปนี้ต้องการเข้าถึงวิดีโอของคุณเพื่อค้นหาไฟล์ซ้ำ",
                            buttonNeutral: "ถามภายหลัง",
                            buttonNegative: "ยกเลิก",
                            buttonPositive: "ตกลง"
                        }
                    );

                    const requestAudio = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
                        {
                            title: "ขออนุญาตเข้าถึงไฟล์เสียง",
                            message: "แอปนี้ต้องการเข้าถึงไฟล์เสียงของคุณเพื่อค้นหาไฟล์ซ้ำ",
                            buttonNeutral: "ถามภายหลัง",
                            buttonNegative: "ยกเลิก",
                            buttonPositive: "ตกลง"
                        }
                    );

                    return (
                        requestImages === PermissionsAndroid.RESULTS.GRANTED &&
                        requestVideos === PermissionsAndroid.RESULTS.GRANTED &&
                        requestAudio === PermissionsAndroid.RESULTS.GRANTED
                    );
                } else {
                    // Android 12 และเก่ากว่า ใช้สิทธิ์แบบเดิม
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        {
                            title: "ขออนุญาตเข้าถึงพื้นที่จัดเก็บ",
                            message: "แอปนี้ต้องการเข้าถึงพื้นที่จัดเก็บของคุณเพื่อค้นหาไฟล์ซ้ำ",
                            buttonNeutral: "ถามภายหลัง",
                            buttonNegative: "ยกเลิก",
                            buttonPositive: "ตกลง"
                        }
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            }
            return true;
        } catch (error) {
            console.error("Error requesting permissions:", error);
            return false;
        }
    }

    // รีเซ็ตสถานะเมื่อออกจากหน้านี้
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsSelecting(false);
            setSelectedItems([]);
        });

        return unsubscribe;
    }, [navigation]);

    // ฟังก์ชันค้นหาไฟล์ซ้ำ
    const findDuplicateFiles = async () => {
        setIsLoading(true);
        setDuplicateGroups([]);
        setAllFiles([]);
        setScanProgress(0);
        setProcessedFiles(0);

        try {
            // ตรวจสอบสิทธิ์การเข้าถึง
            let hasPermission = await checkStoragePermission();

            if (!hasPermission) {
                console.log('ขอสิทธิ์การเข้าถึงไฟล์');
                hasPermission = await requestStoragePermission();
            }

            if (!hasPermission) {
                Alert.alert(
                    "ไม่สามารถเข้าถึงไฟล์ได้",
                    "โปรดให้สิทธิ์การเข้าถึงพื้นที่จัดเก็บเพื่อค้นหาไฟล์ซ้ำ",
                    [{ text: "ตกลง" }]
                );
                setIsLoading(false);
                return;
            }

            // โฟลเดอร์ที่มักจะมีไฟล์ซ้ำ
            const baseDirs = [
                RNFS.ExternalStorageDirectoryPath + '/Download',
                RNFS.ExternalStorageDirectoryPath + '/DCIM',
                RNFS.ExternalStorageDirectoryPath + '/Pictures',
                RNFS.ExternalStorageDirectoryPath + '/Documents',
                RNFS.DocumentDirectoryPath,
            ];

            let foundFiles: RNFS.ReadDirItem[] = [];

            // ขั้นตอนที่ 1: สแกนและรวบรวมไฟล์ทั้งหมด
            for (const baseDir of baseDirs) {
                try {
                    // ตรวจสอบว่าไดเร็กทอรีมีอยู่จริง
                    const exists = await RNFS.exists(baseDir);
                    if (!exists) continue;

                    console.log(`กำลังสแกนไดเร็กทอรี: ${baseDir}`);
                    const items = await RNFS.readDir(baseDir);

                    // เพิ่มไฟล์ในระดับบนสุด
                    for (const item of items) {
                        if (item.isFile()) {
                            foundFiles.push(item);
                        }
                    }

                    // ตรวจสอบโฟลเดอร์ย่อย (แค่ระดับเดียว)
                    for (const item of items) {
                        if (item.isDirectory() && !item.name.startsWith('.')) {
                            try {
                                const subItems = await RNFS.readDir(item.path);
                                for (const subItem of subItems) {
                                    if (subItem.isFile()) {
                                        foundFiles.push(subItem);
                                    }
                                }
                            } catch (error) {
                                console.log(`เกิดข้อผิดพลาดในการอ่านโฟลเดอร์ย่อย: ${item.path}`, error);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`เกิดข้อผิดพลาดในการสแกนไดเร็กทอรี ${baseDir}:`, error);
                }
            }

            setAllFiles(foundFiles);
            setTotalFiles(foundFiles.length);

            // นับไฟล์ที่มีชื่อเหมือนกัน
            const fileNameCount: FileNameCount = {};

            // ขั้นตอนที่ 2: จัดกลุ่มไฟล์ตามขนาดเพื่อลดจำนวนการเปรียบเทียบ
            const filesBySize: { [size: number]: RNFS.ReadDirItem[] } = {};

            // จัดกลุ่มไฟล์ตามขนาด
            for (const file of foundFiles) {
                const size = file.size || 0;
                if (!filesBySize[size]) {
                    filesBySize[size] = [];
                }
                filesBySize[size].push(file);

                // นับจำนวนไฟล์ที่มีชื่อเหมือนกัน
                const baseName = getBaseName(file.name).toLowerCase();
                fileNameCount[baseName] = (fileNameCount[baseName] || 0) + 1;
            }

            // ขั้นตอนที่ 3: ค้นหาไฟล์ซ้ำจากขนาดที่เท่ากันและชื่อที่คล้ายกัน
            const duplicates: DuplicateGroup[] = [];
            let processed = 0;

            for (const [sizeStr, files] of Object.entries(filesBySize)) {
                const size = parseInt(sizeStr);

                // ถ้ามีไฟล์ขนาดเดียวกันมากกว่า 1 ไฟล์ จึงวิเคราะห์ต่อ
                if (files.length > 1) {
                    // จัดกลุ่มไฟล์ตามชื่อ (คล้ายกัน) และนามสกุล
                    const groups: RNFS.ReadDirItem[][] = [];
                    const usedIndices = new Set<number>();

                    // ค้นหาไฟล์ที่มีชื่อคล้ายกัน
                    for (let i = 0; i < files.length; i++) {
                        if (usedIndices.has(i)) continue;

                        const currentFile = files[i];
                        const currentExt = getExtension(currentFile.name);
                        const group: RNFS.ReadDirItem[] = [currentFile];
                        usedIndices.add(i);

                        // ตรวจสอบไฟล์อื่นๆ ที่มีขนาดเท่ากัน
                        for (let j = i + 1; j < files.length; j++) {
                            if (usedIndices.has(j)) continue;

                            const nextFile = files[j];
                            const nextExt = getExtension(nextFile.name);

                            // ตรวจสอบนามสกุลและความคล้ายของชื่อ
                            if (currentExt === nextExt && isSimilarFilename(currentFile.name, nextFile.name)) {
                                group.push(nextFile);
                                usedIndices.add(j);
                            }
                        }

                        // ถ้ากลุ่มมีมากกว่า 1 ไฟล์ เพิ่มเข้าไปในกลุ่ม
                        if (group.length > 1) {
                            groups.push(group);
                        }
                    }

                    // เพิ่มกลุ่มที่พบลงในผลลัพธ์
                    for (let i = 0; i < groups.length; i++) {
                        const group = groups[i];
                        if (group.length > 1) {
                            const groupId = `group_${size}_${i}`;
                            duplicates.push({
                                id: groupId,
                                files: group,
                                fileSize: size
                            });
                        }
                    }
                }

                processed += files.length;
                setProcessedFiles(processed);
                setScanProgress(Math.floor((processed / foundFiles.length) * 100));
            }

            // ค้นหาไฟล์ที่มีชื่อเดียวกันแต่ขนาดต่างกัน (อาจเป็นรุ่นต่างกัน)
            const filenameGroups: { [name: string]: RNFS.ReadDirItem[] } = {};

            for (const file of foundFiles) {
                const baseName = getBaseName(file.name).toLowerCase();

                // ถ้าชื่อไฟล์นี้มีมากกว่า 1 ไฟล์
                if (fileNameCount[baseName] > 1) {
                    if (!filenameGroups[baseName]) {
                        filenameGroups[baseName] = [];
                    }
                    filenameGroups[baseName].push(file);
                }
            }

            // เพิ่มกลุ่มไฟล์ที่มีชื่อซ้ำกัน
            for (const [baseName, files] of Object.entries(filenameGroups)) {
                if (files.length > 1) {
                    // ตรวจสอบว่ากลุ่มนี้มีนามสกุลเหมือนกันหรือไม่
                    const extGroups: { [ext: string]: RNFS.ReadDirItem[] } = {};

                    for (const file of files) {
                        const ext = getExtension(file.name);
                        if (!extGroups[ext]) {
                            extGroups[ext] = [];
                        }
                        extGroups[ext].push(file);
                    }

                    // เพิ่มกลุ่มที่มีนามสกุลเดียวกัน
                    for (const [ext, extFiles] of Object.entries(extGroups)) {
                        if (extFiles.length > 1) {
                            duplicates.push({
                                id: `${baseName}${ext}`,
                                files: extFiles,
                                fileSize: extFiles[0].size || 0
                            });
                        }
                    }
                }
            }

            console.log(`พบกลุ่มไฟล์ซ้ำทั้งหมด: ${duplicates.length} กลุ่ม`);
            setDuplicateGroups(duplicates);

        } catch (error) {
            console.error("Error finding duplicate files:", error);
            Alert.alert(
                "เกิดข้อผิดพลาด",
                "เกิดข้อผิดพลาดในการค้นหาไฟล์ซ้ำ",
                [{ text: "ตกลง" }]
            );
        }

        setIsLoading(false);
    };

    // เริ่มค้นหาไฟล์ซ้ำเมื่อเข้าสู่หน้านี้
    useFocusEffect(
        React.useCallback(() => {
            findDuplicateFiles();
        }, [])
    );

    // ฟังก์ชันแสดงขนาดไฟล์ในรูปแบบที่อ่านง่าย
    function formatFileSize(bytes: number | undefined): string {
        if (!bytes) return "0 B";

        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));

        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }

    // ฟังก์ชันแปลงวันที่เป็นรูปแบบที่อ่านง่าย
    function formatDate(date: Date | null | undefined): string {
        if (!date) return '';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // วันนี้
            return `วันนี้ ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else if (diffDays === 1) {
            // เมื่อวาน
            return `เมื่อวาน ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else if (diffDays < 7) {
            // ภายใน 1 สัปดาห์
            const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
            return `วัน${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else {
            // เกิน 1 สัปดาห์
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
    }

    // จัดการเมื่อผู้ใช้เลือกไฟล์
    const handleSelect = (selected: boolean, item: RNFS.ReadDirItem) => {
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

    // จัดการเมื่อผู้ใช้เปิดไฟล์
    const handleOpen = (item: RNFS.ReadDirItem) => {
        try {
            console.log("กำลังเปิดไฟล์:", item.path);
            openWith(item.path, getFileType(item));
        } catch (error) {
            console.error("Error opening file:", error);
            Alert.alert(
                "ไม่สามารถเปิดไฟล์ได้",
                "ไม่พบแอพที่เหมาะสมสำหรับเปิดไฟล์นี้หรือไฟล์อาจเสียหาย",
                [{ text: "ตกลง" }]
            );
        }
    };

    // ฟังก์ชันรีเซ็ตการเลือกทั้งหมด
    const resetSelection = () => {
        setIsSelecting(false);
        setSelectedItems([]);
    };

    // ฟังก์ชันลบไฟล์ที่เลือก
    const handleDeleteFiles = async () => {
        if (selectedItems.length === 0) return;

        Alert.alert(
            "ลบไฟล์",
            `ต้องการลบไฟล์ที่เลือกจำนวน ${selectedItems.length} ไฟล์หรือไม่?`,
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ลบ",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        let deletedCount = 0;
                        let errorCount = 0;

                        for (const filePath of selectedItems) {
                            try {
                                await RNFS.unlink(filePath);
                                deletedCount++;
                            } catch (error) {
                                console.error(`เกิดข้อผิดพลาดในการลบไฟล์: ${filePath}`, error);
                                errorCount++;
                            }
                        }

                        resetSelection();

                        // แสดงข้อความแจ้งเตือนเมื่อลบเสร็จ
                        if (errorCount > 0) {
                            Alert.alert(
                                "ลบไฟล์เสร็จสิ้น",
                                `ลบไฟล์สำเร็จ: ${deletedCount} ไฟล์\nลบไฟล์ไม่สำเร็จ: ${errorCount} ไฟล์`,
                                [{ text: "ตกลง" }]
                            );
                        } else {
                            Alert.alert(
                                "สำเร็จ",
                                `ลบไฟล์จำนวน ${deletedCount} ไฟล์เรียบร้อยแล้ว`,
                                [{ text: "ตกลง" }]
                            );
                        }

                        // อัพเดทรายการไฟล์หลังลบ
                        findDuplicateFiles();
                    }
                }
            ]
        );
    };

    // แสดงข้อความเมื่อกำลังโหลดหรือไม่พบไฟล์
    const renderEmptyContent = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.emptyText}>กำลังค้นหาไฟล์ซ้ำ... ({processedFiles}/{totalFiles})</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${scanProgress}%` }]} />
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="find-replace" size={80} color="#cccccc" />
                <Text style={styles.emptyText}>ไม่พบไฟล์ซ้ำในอุปกรณ์ของคุณ</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={findDuplicateFiles}
                >
                    <Text style={styles.refreshButtonText}>ค้นหาอีกครั้ง</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {!isSelecting ? (
                <Toolbar
                    goBackHandler={() => navigation.goBack()}
                    navigation={navigation}
                    containerName="Duplicate Files"
                />
            ) : (
                <SelectionToolBar
                    onCancel={resetSelection}
                    onSelectAll={() => {
                        const allFilePaths = allFiles.map(file => file.path);
                        if (selectedItems.length === allFilePaths.length) {
                            setSelectedItems([]);
                            setIsSelecting(false);
                        } else {
                            setSelectedItems(allFilePaths);
                        }
                    }}
                    count={selectedItems.length}
                    maxCount={allFiles.length}
                />
            )}

            <View style={styles.contentContainer}>
                {duplicateGroups.length > 0 ? (
                    <FlatList
                        data={duplicateGroups.sort((a, b) => {
                            // เรียงกลุ่มตามขนาดไฟล์จากใหญ่ไปเล็ก
                            return b.fileSize - a.fileSize;
                        })}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.duplicateGroup}>
                                <View style={styles.groupHeaderContainer}>
                                    <Text style={styles.groupHeaderText}>
                                        ไฟล์ซ้ำ: {item.files.length} ไฟล์ ({formatFileSize(item.fileSize)})
                                    </Text>
                                </View>
                                {item.files.sort((a, b) => (b.mtime?.getTime() || 0) - (a.mtime?.getTime() || 0)).map(file => (
                                    <View key={file.path} style={styles.fileItem}>
                                        <ItemCard
                                            item={file}
                                            onSelect={handleSelect}
                                            onOpen={handleOpen}
                                            isSelected={selectedItems.includes(file.path)}
                                        />
                                        <View style={styles.fileInfoContainer}>
                                            <Text style={styles.fileSize}>
                                                {formatFileSize(file.size)}
                                            </Text>
                                            <Text style={styles.fileDate}>
                                                {formatDate(file.mtime)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                ) : renderEmptyContent()}
            </View>

            {isSelecting && (
                <View style={styles.bottomBar}>
                    <BottomBarItem name='Delete' icon={<MaterialIcons name='delete' size={30} />} onPress={handleDeleteFiles} />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7"
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 0,
        paddingBottom: 10
    },
    listContent: {
        paddingVertical: 0
    },
    fileItem: {
        flexDirection: 'column',
        marginBottom: 2
    },
    fileSize: {
        fontSize: 12,
        color: '#666',
        marginRight: 10
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 20
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 15,
        textAlign: 'center',
        fontWeight: '500'
    },
    refreshButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    groupHeaderContainer: {
        backgroundColor: '#f8f8f8',
        padding: 12,
        marginVertical: 10,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    groupHeaderText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333'
    },
    fileDate: {
        fontSize: 12,
        color: '#666'
    },
    fileInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: -15,
        marginLeft: 60,
        marginBottom: 8
    },
    duplicateGroup: {
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1
    },
    progressBarContainer: {
        width: '80%',
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginTop: 20,
        overflow: 'hidden'
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2196F3',
    }
}); 