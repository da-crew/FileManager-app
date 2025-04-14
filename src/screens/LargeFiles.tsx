import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar, Modal, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from '../components/SelectionToolbar';
import ItemCard from '../components/ItemCard';
import * as RNFS from "react-native-fs";
import { Feather, Foundation, MaterialIcons, FontAwesome, FontAwesome5, AntDesign } from '@expo/vector-icons';
import BottomBarItem from "../components/ContentContainer/BottomBarItem";
import BottomBarOptions from "../components/ContentContainer/BottomBarOptions";
import { Platform, PermissionsAndroid } from "react-native";
import { getFileType, openWith } from "../utils/openWith";
import SortOptionsBar from '../components/ContentContainer/SortOptionsBar';

// เปลี่ยนขนาดไฟล์ขั้นต่ำเป็น 200MB
const LARGE_FILE_SIZE_THRESHOLD = 200 * 1024 * 1024; // 200MB ในหน่วย bytes

// เพิ่ม enum สำหรับประเภทการเรียงลำดับ
enum SortType {
    SIZE_DESC, // ขนาดใหญ่ไปเล็ก (ค่าเริ่มต้น)
    SIZE_ASC,  // ขนาดเล็กไปใหญ่
    NAME_ASC,  // ชื่อไฟล์ A-Z
    NAME_DESC, // ชื่อไฟล์ Z-A
    DATE_DESC, // วันที่ล่าสุดไปเก่าสุด
    DATE_ASC,  // วันที่เก่าสุดไปล่าสุด
}

// คอมโพเนนต์หน้าจอค้นหาไฟล์ขนาดใหญ่
export default function LargeFiles() {
    const navigation = useNavigation();
    
    // สถานะต่างๆ ของหน้าจอ
    const [largeFiles, setLargeFiles] = useState<RNFS.ReadDirItem[]>([]); // เก็บรายการไฟล์ขนาดใหญ่ที่พบ
    const [isLoading, setIsLoading] = useState(true);                     // สถานะกำลังโหลดข้อมูล
    const [selectedItems, setSelectedItems] = useState<string[]>([]);     // รายการไฟล์ที่ถูกเลือก
    const [isSelecting, setIsSelecting] = useState(false);                // สถานะโหมดการเลือกไฟล์
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false); // สถานะการแสดงตัวเลือกการเรียงลำดับ
    const [sortType, setSortType] = useState<SortType>(SortType.SIZE_DESC); // ประเภทการเรียงลำดับปัจจุบัน (เริ่มต้นที่เรียงตามขนาดใหญ่ไปเล็ก)
    
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
                            title: "Request Photo Access",
                            message: "This app needs access to your photos to find large files",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );
                    
                    const requestVideos = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                        {
                            title: "Request Video Access",
                            message: "This app needs access to your videos to find large files",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );
                    
                    const requestAudio = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
                        {
                            title: "Request Audio Access",
                            message: "This app needs access to your audio files to find large files",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
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
                            title: "Request Storage Access",
                            message: "This app needs access to your storage to find large files",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
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

    // ฟังก์ชันเรียงลำดับข้อมูล
    const sortItems = (items: RNFS.ReadDirItem[], sortType: SortType): RNFS.ReadDirItem[] => {
        const sortedItems = [...items];

        switch (sortType) {
            case SortType.SIZE_DESC: // ขนาดใหญ่ไปเล็ก (ค่าเริ่มต้น)
                return sortedItems.sort((a, b) => (b.size || 0) - (a.size || 0));
            case SortType.SIZE_ASC: // ขนาดเล็กไปใหญ่
                return sortedItems.sort((a, b) => (a.size || 0) - (b.size || 0));
            case SortType.NAME_ASC: // ชื่อไฟล์ A-Z
                return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
            case SortType.NAME_DESC: // ชื่อไฟล์ Z-A
                return sortedItems.sort((a, b) => b.name.localeCompare(a.name));
            case SortType.DATE_DESC: // วันที่ล่าสุดไปเก่าสุด
                return sortedItems.sort((a, b) => {
                    const timeA = a.mtime ? a.mtime.getTime() : 0;
                    const timeB = b.mtime ? b.mtime.getTime() : 0;
                    return timeB - timeA;
                });
            case SortType.DATE_ASC: // วันที่เก่าสุดไปล่าสุด
                return sortedItems.sort((a, b) => {
                    const timeA = a.mtime ? a.mtime.getTime() : 0;
                    const timeB = b.mtime ? b.mtime.getTime() : 0;
                    return timeA - timeB;
                });
            default:
                return sortedItems;
        }
    };

    // ฟังก์ชันจัดการเมื่อเลือกวิธีเรียงลำดับ
    const handleSortChange = (type: SortType) => {
        setSortType(type);
        setLargeFiles(sortItems(largeFiles, type));
        setSortByOptionVisible(false);
    };

    // ฟังก์ชันแปลงชื่อการเรียงลำดับเป็นข้อความที่แสดงบนหน้าจอ
    const getSortByLabel = (type: SortType): string => {
        switch (type) {
            case SortType.SIZE_DESC: return 'File Size (Large-Small)';
            case SortType.SIZE_ASC: return 'File Size (Small-Large)';
            case SortType.NAME_ASC: return 'Filename (A-Z)';
            case SortType.NAME_DESC: return 'Filename (Z-A)';
            case SortType.DATE_DESC: return 'Date Modified (Latest)';
            case SortType.DATE_ASC: return 'Date Modified (Oldest)';
            default: return 'Not specified';
        }
    };

    // ค้นหาไฟล์ขนาดใหญ่จากพื้นที่จัดเก็บข้อมูล
    const findLargeFiles = async () => {
        setIsLoading(true);
        setLargeFiles([]);

        try {
            // ตรวจสอบสิทธิ์การเข้าถึง
            let hasPermission = await checkStoragePermission();
            
            if (!hasPermission) {
                console.log('ขอสิทธิ์การเข้าถึงไฟล์');
                hasPermission = await requestStoragePermission();
            }
            
            if (!hasPermission) {
                Alert.alert(
                    "Cannot access files",
                    "Please grant storage permission to find large files",
                    [{ text: "OK" }]
                );
                setIsLoading(false);
                return;
            }

            // โฟลเดอร์ที่มักจะมีไฟล์ขนาดใหญ่
            const baseDirs = [
                RNFS.ExternalStorageDirectoryPath + '/Download',
                RNFS.ExternalStorageDirectoryPath + '/DCIM',
                RNFS.ExternalStorageDirectoryPath + '/Movies',
                RNFS.ExternalStorageDirectoryPath + '/Pictures',
                RNFS.ExternalStorageDirectoryPath + '/Music',
                RNFS.ExternalStorageDirectoryPath + '/Documents',
                RNFS.DocumentDirectoryPath,
            ];
            
            let foundFiles: RNFS.ReadDirItem[] = [];
            
            // สแกนไดเร็กทอรีที่ระบุ
            for (const baseDir of baseDirs) {
                try {
                    // ตรวจสอบว่าไดเร็กทอรีมีอยู่จริง
                    const exists = await RNFS.exists(baseDir);
                    if (!exists) continue;
                    
                    console.log(`Scanning directory: ${baseDir}`);
                    const items = await RNFS.readDir(baseDir);
                    
                    // หาไฟล์ขนาดใหญ่ในระดับบนสุด
                    for (const item of items) {
                        if (item.isFile() && item.size && item.size > LARGE_FILE_SIZE_THRESHOLD) {
                            console.log(`Found large file: ${item.name} (${formatFileSize(item.size)})`);
                            foundFiles.push(item);
                        }
                    }
                    
                    // หาไฟล์ขนาดใหญ่ในโฟลเดอร์ย่อย (แค่ระดับเดียว)
                    for (const item of items) {
                        if (item.isDirectory() && !item.name.startsWith('.')) {
                            try {
                                const subItems = await RNFS.readDir(item.path);
                                for (const subItem of subItems) {
                                    if (subItem.isFile() && subItem.size && subItem.size > LARGE_FILE_SIZE_THRESHOLD) {
                                        console.log(`Found large file in subfolder: ${subItem.name} (${formatFileSize(subItem.size)})`);
                                        foundFiles.push(subItem);
                                    }
                                }
                            } catch (error) {
                                console.log(`Error reading subfolder: ${item.path}`, error);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`Error scanning directory ${baseDir}:`, error);
                }
            }
            
            // เรียงลำดับตามที่ผู้ใช้เลือกไว้
            const sortedFiles = sortItems(foundFiles, sortType);
            setLargeFiles(sortedFiles);
            
        } catch (error) {
            console.error("Error finding large files:", error);
            Alert.alert("Error", "Cannot find large files");
        } finally {
            setIsLoading(false);
        }
    };

    // อัพเดทรายการไฟล์เมื่อเริ่มต้นหรือเมื่อประเภทการเรียงเปลี่ยน
    useFocusEffect(
        React.useCallback(() => {
            findLargeFiles();
        }, [sortType])
    );

    // ฟังก์ชันแสดงขนาดไฟล์ในรูปแบบที่อ่านง่าย
    function formatFileSize(bytes: number | undefined): string {
        if (!bytes) return "0 B";
        
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
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
    const handleOpen = async (item: RNFS.ReadDirItem) => {
        try {
            const fileSizeInMB = (item.size || 0) / (1024 * 1024);
            
            // แสดงข้อความเตือนเมื่อไฟล์มีขนาดใหญ่มาก (>100MB)
            if (fileSizeInMB > 100) {
                Alert.alert(
                    "Very Large File",
                    `This file is ${formatFileSize(item.size)} in size. Do you want to open it?`,
                    [
                        { text: "Cancel", style: "cancel" },
                        { 
                            text: "Open", 
                            onPress: () => openFile(item)
                        }
                    ]
                );
            } else {
                // ไฟล์ขนาดไม่ใหญ่มาก เปิดทันที
                openFile(item);
            }
        } catch (error) {
            console.error("Error opening file:", error);
            Alert.alert(
                "Cannot Open File",
                "Error opening file",
                [{ text: "OK" }]
            );
        }
    };

    // เปิดไฟล์ด้วยแอพที่เหมาะสม
    const openFile = (item: RNFS.ReadDirItem) => {
        try {
            console.log("Opening file:", item.path);
            openWith(item.path, getFileType(item));
        } catch (error) {
            console.error("Error opening file:", error);
            Alert.alert(
                "Cannot Open File",
                "No appropriate app found for this file type or the file may be corrupted",
                [{ text: "OK" }]
            );
        }
    };

    const handleItemSelect = (selected: boolean, item: RNFS.ReadDirItem) => {
        handleSelect(selected, item);
    };

    const handleItemOpen = (item: RNFS.ReadDirItem) => {
        handleOpen(item);
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
            `Do you want to delete ${selectedItems.length} selected files?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        
                        for (const filePath of selectedItems) {
                            try {
                                await RNFS.unlink(filePath);
                            } catch (error) {
                                console.error(`Error deleting file: ${filePath}`, error);
                            }
                        }
                        
                        resetSelection();
                        
                        // Show confirmation when deletion is complete
                        Alert.alert(
                            "Success",
                            `${selectedItems.length} files have been deleted`,
                            [{ text: "OK" }]
                        );
                        
                        // อัพเดทรายการไฟล์หลังลบ
                        findLargeFiles();
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
                    <Text style={styles.emptyText}>Searching for large files...</Text>
                </View>
            );
        }
        
        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="find-in-page" size={80} color="#cccccc" />
                <Text style={styles.emptyText}>No large files found</Text>
                <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={findLargeFiles}
                >
                    <Text style={styles.refreshButtonText}>Search Again</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // สร้างตัวเลือกการเรียงลำดับสำหรับ SortOptionsBar
    const sortOptions = [
        {
            id: SortType.SIZE_DESC,
            label: 'File Size (Large-Small)',
            icon: <FontAwesome5 name="sort-amount-down" size={24} color="#007AFF" />
        },
        {
            id: SortType.SIZE_ASC,
            label: 'File Size (Small-Large)',
            icon: <FontAwesome5 name="sort-amount-up" size={24} color="#FF9500" />
        },
        {
            id: SortType.NAME_ASC,
            label: 'Filename (A-Z)',
            icon: <MaterialIcons name="sort-by-alpha" size={24} color="#34C759" />
        },
        {
            id: SortType.NAME_DESC,
            label: 'Filename (Z-A)',
            icon: <AntDesign name="swap" size={24} color="#FF2D55" />
        },
        {
            id: SortType.DATE_DESC,
            label: 'Date Modified (Latest)',
            icon: <MaterialIcons name="access-time" size={24} color="#5856D6" />
        },
        {
            id: SortType.DATE_ASC,
            label: 'Date Modified (Oldest)',
            icon: <MaterialIcons name="history" size={24} color="#8E8E93" />
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {!isSelecting ? (
                <Toolbar
                    goBackHandler={() => navigation.goBack()}
                    navigation={navigation}
                    containerName="Large Files"
                    sortByHandler={() => setSortByOptionVisible(true)}
                />
            ) : (
                <SelectionToolBar
                    onCancel={resetSelection}
                    onSelectAll={() => {
                        if (largeFiles.length === selectedItems.length) {
                            setSelectedItems([]);
                            setIsSelecting(false);
                        } else {
                            setSelectedItems(largeFiles.map(file => file.path));
                        }
                    }}
                    count={selectedItems.length}
                    maxCount={largeFiles.length}
                />
            )}

            <View style={styles.contentContainer}>
                {largeFiles.length > 0 ? (
                <FlatList
                    data={largeFiles}
                    keyExtractor={(item) => item.path}
                    renderItem={({ item }) => (
                            <View style={styles.fileItem}>
                        <ItemCard
                            item={item}
                            onSelect={handleItemSelect}
                            onOpen={handleItemOpen}
                            isSelected={selectedItems.includes(item.path)}
                        />
                                <Text style={styles.fileSize}>
                                    {formatFileSize(item.size)}
                                </Text>
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

            {/* ใช้ SortOptionsBar แทน Modal เดิม */}
            <SortOptionsBar
                visible={sortByOptionVisible}
                onClose={() => setSortByOptionVisible(false)}
                options={sortOptions}
                selectedOption={sortType}
                onSelectOption={(option) => handleSortChange(option as SortType)}
            />
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
        marginTop: -18,
        marginLeft: 60,
        marginBottom: 8
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
