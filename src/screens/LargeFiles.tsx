import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from '../components/SelectionToolbar';
import ItemCard from '../components/ItemCard';
import * as RNFS from "react-native-fs";
import { Feather, Foundation, MaterialIcons } from '@expo/vector-icons';
import BottomBarItem from "../components/ContentContainer/BottomBarItem";

// Mock data
const mockLargeFiles: RNFS.ReadDirItem[] = [
    {
        name: "BigVideo_2024.mp4",
        path: RNFS.ExternalStorageDirectoryPath + "/BigVideo_2024.mp4",
        size: 1610612736, // 1.5 GB
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false
    },
    {
        name: "GameInstaller.exe",
        path: RNFS.ExternalStorageDirectoryPath + "/GameInstaller.exe",
        size: 4508876800, // 4.2 GB
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false
    },
    {
        name: "BackupArchive.zip",
        path: RNFS.ExternalStorageDirectoryPath + "/BackupArchive.zip",
        size: 3006477107, // 2.8 GB
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false
    }
];

export default function LargeFiles() {
    const navigation = useNavigation();
    const [largeFiles, setLargeFiles] = useState<RNFS.ReadDirItem[]>(mockLargeFiles);
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

    // อัพเดทรายการไฟล์
    const updateFileList = async () => {
        // สำหรับ mock data ไม่ต้องตรวจสอบว่าไฟล์มีอยู่จริง
        setLargeFiles(mockLargeFiles);
        
        // อัพเดท selectedItems ให้มีเฉพาะไฟล์ที่ยังอยู่ในรายการ
        setSelectedItems(prev => 
            prev.filter(path => mockLargeFiles.some(file => file.path === path))
        );
    };

    // เรียกใช้ updateFileList เมื่อหน้าจอถูกโฟกัส
    useFocusEffect(
        React.useCallback(() => {
            updateFileList();
        }, [])
    );

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

    const handleOpen = async (item: RNFS.ReadDirItem) => {
        // สำหรับ mock data เราแค่แสดง log แทนการตรวจสอบไฟล์
        console.log("Attempting to open file:", item.name);
        console.log("File path:", item.path);
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

            <View style={styles.contentContainer}>
                <FlatList
                    data={largeFiles}
                    keyExtractor={(item) => item.path}
                    renderItem={({ item }) => (
                        <ItemCard
                            item={item}
                            onSelect={handleItemSelect}
                            onOpen={handleItemOpen}
                            isSelected={selectedItems.includes(item.path)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            {isSelecting && (
                <View style={styles.bottomBar}>
                    <BottomBarItem name='Copy' icon={<Feather name='copy' size={30} />} onPress={() => console.log('Copy')} />
                    <BottomBarItem name='Move' icon={<Feather name='scissors' size={30} />} onPress={() => console.log('Move')} />
                    <BottomBarItem name='Rename' icon={<Foundation name='pencil' size={30} />} onPress={() => console.log('Rename')} />
                    <BottomBarItem name='Delete' icon={<MaterialIcons name='delete' size={30} />} onPress={() => console.log('Delete')} />
                    <BottomBarItem name='More' icon={<MaterialIcons name='more-vert' size={30} />} onPress={() => console.log('More')} />
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
    bottomBar: {
        backgroundColor: '#d9d9d9', 
        borderTopWidth: 1, 
        borderColor: '#e7e7e7', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20,
        paddingVertical: 10
    }
});
