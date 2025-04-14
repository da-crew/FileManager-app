import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar, Modal, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from '../components/SelectionToolbar';
import ItemCard from '../components/ItemCard';
import * as RNFS from "react-native-fs";
import { Feather, Foundation, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import BottomBarItem from "../components/ContentContainer/BottomBarItem";
import BottomBarOptions from "../components/ContentContainer/BottomBarOptions";
import { Platform, PermissionsAndroid } from "react-native";
import { getFileType, openWith } from "../utils/openWith";

// กำหนดโครงสร้างข้อมูลสำหรับไฟล์ที่ซ้ำกัน
interface DuplicateGroup {
    id: string;
    files: RNFS.ReadDirItem[];
}

// เพิ่ม enum สำหรับประเภทการเรียงลำดับ
enum SortType {
    ALPHABETICAL,
    DATE,
    SIZE,
}

export default function Duplicates() {
    const navigation = useNavigation();
    const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
    const [allFiles, setAllFiles] = useState<RNFS.ReadDirItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);
    const [sortType, setSortType] = useState<SortType>(SortType.ALPHABETICAL);

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
            
            // สแกนไดเร็กทอรีที่ระบุ
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
            
            // ค้นหาไฟล์ซ้ำโดยเช็คจากชื่อไฟล์
            const filesByName: { [key: string]: RNFS.ReadDirItem[] } = {};
            
            // จัดกลุ่มไฟล์ตามชื่อไฟล์ (ไม่รวมนามสกุล)
            for (const file of foundFiles) {
                // แยกชื่อไฟล์ออกจากนามสกุล
                const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
                const ext = file.name.substring(file.name.lastIndexOf('.'));
                
                // คอยตรวจหาไฟล์ที่มีชื่อคล้ายกัน เช่น file.jpg และ file_copy.jpg
                const baseName = nameWithoutExt.replace(/_copy|_duplicate|_backup|[\d]*$/, '');
                
                if (!filesByName[baseName]) {
                    filesByName[baseName] = [];
                }
                
                filesByName[baseName].push(file);
            }
            
            // กรองเฉพาะกลุ่มไฟล์ที่มีไฟล์มากกว่า 1 ไฟล์ (ไฟล์ซ้ำ)
            const duplicates: DuplicateGroup[] = [];
            for (const [baseName, files] of Object.entries(filesByName)) {
                if (files.length > 1) {
                    duplicates.push({
                        id: baseName,
                        files: files
                    });
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
        }, [sortType])
    );

    // อัพเดทประเภทการเรียง
    function updateSortType(type: SortType) {
        if (sortType !== type) {
            setSortType(type);
        }
    }

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
            "ลบไฟล์",
            `ต้องการลบไฟล์ที่เลือกจำนวน ${selectedItems.length} ไฟล์หรือไม่?`,
            [
                { text: "ยกเลิก", style: "cancel" },
                { 
                    text: "ลบ", 
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        
                        for (const filePath of selectedItems) {
                            try {
                                await RNFS.unlink(filePath);
                            } catch (error) {
                                console.error(`เกิดข้อผิดพลาดในการลบไฟล์: ${filePath}`, error);
                            }
                        }
                        
                        resetSelection();
                        
                        // แสดงข้อความแจ้งเตือนเมื่อลบเสร็จ
                        Alert.alert(
                            "สำเร็จ",
                            `ลบไฟล์จำนวน ${selectedItems.length} ไฟล์เรียบร้อยแล้ว`,
                            [{ text: "ตกลง" }]
                        );
                        
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
                    <Text style={styles.emptyText}>Searching for duplicate files...</Text>
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
                        data={duplicateGroups.flatMap(group => group.files)}
                        keyExtractor={(item) => item.path}
                        renderItem={({ item }) => (
                            <View style={styles.fileItem}>
                                <ItemCard
                                    item={item}
                                    onSelect={handleItemSelect}
                                    onOpen={handleItemOpen}
                                    isSelected={selectedItems.includes(item.path)}
                                />
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

            <Modal visible={sortByOptionVisible} transparent={true} onRequestClose={() => setSortByOptionVisible(false)} animationType="slide">
                <TouchableOpacity 
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    activeOpacity={1} 
                    onPress={() => setSortByOptionVisible(false)}
                >
                    <View 
                        style={{ 
                            backgroundColor: 'white', 
                            borderTopLeftRadius: 20, 
                            borderTopRightRadius: 20,
                            paddingVertical: 20
                        }}
                    >
                        <View style={{ alignItems: 'center', marginBottom: 15 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Sort by</Text>
                            <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginTop: 10 }} />
                        </View>
                        
                        <TouchableOpacity
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                paddingVertical: 12, 
                                paddingHorizontal: 20,
                                backgroundColor: sortType === SortType.ALPHABETICAL ? '#f0f0f0' : 'transparent'
                            }}
                            onPress={() => {
                                updateSortType(SortType.ALPHABETICAL);
                                setSortByOptionVisible(false);
                            }}
                        >
                            <FontAwesome name="sort-alpha-asc" size={24} color="#007AFF" style={{ marginRight: 20 }} />
                            <Text style={{ fontSize: 16, color: '#333' }}>Filename (A-Z)</Text>
                            {sortType === SortType.ALPHABETICAL && (
                                <MaterialIcons name="check" size={24} color="#007AFF" style={{ marginLeft: 'auto' }} />
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center',
                                paddingVertical: 12, 
                                paddingHorizontal: 20,
                                backgroundColor: sortType === SortType.DATE ? '#f0f0f0' : 'transparent'
                            }}
                            onPress={() => {
                                updateSortType(SortType.DATE);
                                setSortByOptionVisible(false);
                            }}
                        >
                            <MaterialIcons name="access-time" size={24} color="#FF9500" style={{ marginRight: 20 }} />
                            <Text style={{ fontSize: 16, color: '#333' }}>Date Modified (Latest)</Text>
                            {sortType === SortType.DATE && (
                                <MaterialIcons name="check" size={24} color="#007AFF" style={{ marginLeft: 'auto' }} />
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center',
                                paddingVertical: 12, 
                                paddingHorizontal: 20,
                                backgroundColor: sortType === SortType.SIZE ? '#f0f0f0' : 'transparent'
                            }}
                            onPress={() => {
                                updateSortType(SortType.SIZE);
                                setSortByOptionVisible(false);
                            }}
                        >
                            <MaterialIcons name="format-size" size={24} color="#5856D6" style={{ marginRight: 20 }} />
                            <Text style={{ fontSize: 16, color: '#333' }}>File Size (Large-Small)</Text>
                            {sortType === SortType.SIZE && (
                                <MaterialIcons name="check" size={24} color="#007AFF" style={{ marginLeft: 'auto' }} />
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
    }
});
