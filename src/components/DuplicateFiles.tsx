import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar, Alert, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toolbar from "./Toolbar";
import SelectionToolBar from './SelectionToolbar';
import ItemCard from './ItemCard';
import * as RNFS from "react-native-fs";
import { Feather, Foundation, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
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
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);
    const [sortType, setSortType] = useState<string>('size'); // Default sort by size

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
                            title: "Request access to images",
                            message: "This app needs access to your images to find duplicate files",
                            buttonNeutral: "Ask me later",
                            buttonNegative: "Cancel",
                            buttonPositive: "Allow"
                        }
                    );

                    const requestVideos = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                        {
                            title: "Request access to videos",
                            message: "This app needs access to your videos to find duplicate files",
                            buttonNeutral: "Ask me later",
                            buttonNegative: "Cancel",
                            buttonPositive: "Allow"
                        }
                    );

                    const requestAudio = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
                        {
                            title: "Request access to audio files",
                            message: "This app needs access to your audio files to find duplicate files",
                            buttonNeutral: "Ask me later",
                            buttonNegative: "Cancel",
                            buttonPositive: "Allow"
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
                            title: "Request access to storage",
                            message: "This app needs access to your storage to find duplicate files",
                            buttonNeutral: "Ask me later",
                            buttonNegative: "Cancel",
                            buttonPositive: "Allow"
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
                    "Cannot Access Files",
                    "Please grant storage access permission to search for duplicate files",
                    [{ text: "OK" }]
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
            "Delete Files",
            `Do you want to delete the selected ${selectedItems.length} files?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        
                        let deleteCount = 0;
                        let errorCount = 0;
                        
                        for (const filePath of selectedItems) {
                            try {
                                await RNFS.unlink(filePath);
                                deleteCount++;
                            } catch (error) {
                                console.error(`Error deleting file: ${filePath}`, error);
                                errorCount++;
                            }
                        }
                        
                        // Update the duplicate groups after deletion
                        findDuplicateFiles();
                        resetSelection();
                        
                        if (errorCount > 0) {
                            Alert.alert(
                                "Delete Complete",
                                `Successfully deleted: ${deleteCount} files\nFailed to delete: ${errorCount} files`,
                                [{ text: "OK" }]
                            );
                        } else {
                            Alert.alert(
                                "Delete Complete",
                                `Successfully deleted ${deleteCount} files`,
                                [{ text: "OK" }]
                            );
                        }
                    } 
                }
            ]
        );
    };

    // Show message when loading or no files found
    const renderEmptyContent = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.emptyText}>Searching for duplicate files... ({processedFiles}/{totalFiles})</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${scanProgress}%` }]} />
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="find-replace" size={80} color="#cccccc" />
                <Text style={styles.emptyText}>No duplicate files found on your device</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={findDuplicateFiles}
                >
                    <Text style={styles.refreshButtonText}>Search Again</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Sort types: 'name', 'date', 'size', 'name_desc', 'date_asc', 'size_asc'
    const sortItems = (items: DuplicateGroup[], sortType: string): DuplicateGroup[] => {
        const sortedItems = [...items];
        
        switch (sortType) {
            case 'size': // Sort by file size (largest first)
                return sortedItems.sort((a, b) => b.fileSize - a.fileSize);
            case 'size_asc': // Sort by file size (smallest first)
                return sortedItems.sort((a, b) => a.fileSize - b.fileSize);
            case 'name': // Sort by name (A-Z)
                return sortedItems.sort((a, b) => {
                    const nameA = a.files[0]?.name || '';
                    const nameB = b.files[0]?.name || '';
                    return nameA.localeCompare(nameB);
                });
            case 'name_desc': // Sort by name (Z-A)
                return sortedItems.sort((a, b) => {
                    const nameA = a.files[0]?.name || '';
                    const nameB = b.files[0]?.name || '';
                    return nameB.localeCompare(nameA);
                });
            case 'date': // Sort by date (newest first)
                return sortedItems.sort((a, b) => {
                    const timeA = a.files[0]?.mtime ? a.files[0].mtime.getTime() : 0;
                    const timeB = b.files[0]?.mtime ? b.files[0].mtime.getTime() : 0;
                    return timeB - timeA;
                });
            case 'date_asc': // Sort by date (oldest first)
                return sortedItems.sort((a, b) => {
                    const timeA = a.files[0]?.mtime ? a.files[0].mtime.getTime() : 0;
                    const timeB = b.files[0]?.mtime ? b.files[0].mtime.getTime() : 0;
                    return timeA - timeB;
                });
            default:
                return sortedItems;
        }
    };

    // Handle sort type change
    const handleSortChange = (type: string) => {
        setSortType(type);
        setDuplicateGroups(sortItems(duplicateGroups, type));
        setSortByOptionVisible(false);
    };

    // Convert sort type to display label
    const getSortByLabel = (type: string): string => {
        switch (type) {
            case 'size': return 'File Size (Large-Small)';
            case 'size_asc': return 'File Size (Small-Large)';
            case 'name': return 'Filename (A-Z)';
            case 'name_desc': return 'Filename (Z-A)';
            case 'date': return 'Date Modified (Latest)';
            case 'date_asc': return 'Date Modified (Oldest)';
            default: return 'Unknown';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {!isSelecting ? (
                <Toolbar
                    goBackHandler={() => navigation.goBack()}
                    navigation={navigation}
                    containerName="Duplicate Files"
                    sortByHandler={() => setSortByOptionVisible(true)}
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
                        data={sortItems(duplicateGroups, sortType)}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.duplicateGroup}>
                                <View style={styles.groupHeaderContainer}>
                                    <Text style={styles.groupHeaderText}>
                                        Duplicate Files: {item.files.length} files ({formatFileSize(item.fileSize)})
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
                    <BottomBarItem name='Delete' icon={<MaterialIcons name='delete' size={30} color="#FF3B30" />} onPress={handleDeleteFiles} />
                </View>
            )}

            {/* Sort options modal */}
            <Modal visible={sortByOptionVisible} transparent={true} 
                onRequestClose={() => setSortByOptionVisible(false)} 
                animationType="fade">
                <TouchableOpacity 
                    style={styles.menuModalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setSortByOptionVisible(false)}
                >
                    <View style={styles.sortOptionsContainer}>
                        <View style={styles.sortHeader}>
                            <Text style={styles.sortTitle}>Sort by</Text>
                            <TouchableOpacity onPress={() => setSortByOptionVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.sortOption, sortType === 'size' && styles.activeSortOption]}
                            onPress={() => handleSortChange('size')}
                        >
                            <FontAwesome5
                                name="sort-amount-down"
                                size={22}
                                color={sortType === 'size' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, sortType === 'size' && styles.activeSortText]}>
                                File Size (Large-Small)
                            </Text>
                            {sortType === 'size' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, sortType === 'size_asc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('size_asc')}
                        >
                            <FontAwesome5
                                name="sort-amount-up"
                                size={22}
                                color={sortType === 'size_asc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, sortType === 'size_asc' && styles.activeSortText]}>
                                File Size (Small-Large)
                            </Text>
                            {sortType === 'size_asc' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, sortType === 'name' && styles.activeSortOption]}
                            onPress={() => handleSortChange('name')}
                        >
                            <MaterialIcons
                                name="sort-by-alpha"
                                size={22}
                                color={sortType === 'name' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, sortType === 'name' && styles.activeSortText]}>
                                Filename (A-Z)
                            </Text>
                            {sortType === 'name' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, sortType === 'name_desc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('name_desc')}
                        >
                            <AntDesign
                                name="swap"
                                size={22}
                                color={sortType === 'name_desc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, sortType === 'name_desc' && styles.activeSortText]}>
                                Filename (Z-A)
                            </Text>
                            {sortType === 'name_desc' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, sortType === 'date' && styles.activeSortOption]}
                            onPress={() => handleSortChange('date')}
                        >
                            <MaterialIcons
                                name="arrow-downward"
                                size={22}
                                color={sortType === 'date' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, sortType === 'date' && styles.activeSortText]}>
                                Date Modified (Latest)
                            </Text>
                            {sortType === 'date' && (
                                <MaterialIcons name="check" size={22} color="#2196F3" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortOption, sortType === 'date_asc' && styles.activeSortOption]}
                            onPress={() => handleSortChange('date_asc')}
                        >
                            <MaterialIcons
                                name="arrow-upward"
                                size={22}
                                color={sortType === 'date_asc' ? '#2196F3' : '#666'}
                            />
                            <Text style={[styles.sortOptionText, sortType === 'date_asc' && styles.activeSortText]}>
                                Date Modified (Oldest)
                            </Text>
                            {sortType === 'date_asc' && (
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
    },
    menuModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    sortOptionsContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        width: '80%',
        maxHeight: '80%'
    },
    sortHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sortTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666'
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10
    },
    sortOptionText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10
    },
    activeSortOption: {
        backgroundColor: '#f0f0f0'
    },
    activeSortText: {
        fontWeight: 'bold'
    }
}); 