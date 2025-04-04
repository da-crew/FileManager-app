import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from '../components/SelectionToolbar';
import ItemCard from '../components/ItemCard';
import * as RNFS from "react-native-fs";
import { Feather, Foundation, MaterialIcons } from '@expo/vector-icons';
import BottomBarItem from "../components/ContentContainer/BottomBarItem";

// ใช้ RNFS.ReadDirItem แทน FileItem
/*
type ReadDirItem = {
  ctime: date;     // The creation date of the file (iOS only)
  mtime: date;     // The last modified date of the file
  name: string;     // The name of the item
  path: string;     // The absolute path to the item
  size: string;     // Size in bytes
  isFile: () => boolean;        // Is the item just a file?
  isDirectory: () => boolean;   // Is the item a directory?
};
*/

// Mock data สำหรับไฟล์ซ้ำ
const mockDuplicateFiles: RNFS.ReadDirItem[] = [
    {
        name: "Report_v1.pdf",
        path: RNFS.ExternalStorageDirectoryPath + "/Report_v1.pdf",
        size: 5452595, // 5.2 MB
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false
    },
    {
        name: "Report_v1_copy.pdf",
        path: RNFS.ExternalStorageDirectoryPath + "/Report_v1_copy.pdf",
        size: 5452595, // 5.2 MB (ขนาดเท่ากัน)
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false
    },
    {
        name: "Photo_001.jpg",
        path: RNFS.ExternalStorageDirectoryPath + "/Photo_001.jpg",
        size: 3984588, // 3.8 MB
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false
    },
    {
        name: "Photo_001_duplicate.jpg",
        path: RNFS.ExternalStorageDirectoryPath + "/Photo_001_duplicate.jpg",
        size: 3984588, // 3.8 MB (ขนาดเท่ากัน)
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false
    },
    {
        name: "Presentation.pptx",
        path: RNFS.ExternalStorageDirectoryPath + "/Presentation.pptx",
        size: 13107200, // 12.5 MB
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false
    },
    {
        name: "Presentation_backup.pptx",
        path: RNFS.ExternalStorageDirectoryPath + "/Presentation_backup.pptx", 
        size: 13107200, // 12.5 MB (ขนาดเท่ากัน)
        mtime: new Date(),
        ctime: new Date(),
        isFile: () => true,
        isDirectory: () => false
    }
];

export default function Duplicates() {
    const navigation = useNavigation();
    const [duplicateFiles, setDuplicateFiles] = useState<RNFS.ReadDirItem[]>(mockDuplicateFiles);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);

    // อัพเดทรายการไฟล์
    const updateFileList = async () => {
        // สำหรับ mock data ไม่ต้องตรวจสอบว่าไฟล์มีอยู่จริง
        setDuplicateFiles(mockDuplicateFiles);
        
        // อัพเดท selectedItems ให้มีเฉพาะไฟล์ที่ยังอยู่ในรายการ
        setSelectedItems(prev => 
            prev.filter(path => mockDuplicateFiles.some(file => file.path === path))
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
                    containerName="Duplicate Files"
                    sortByHandler={() => console.log("Sort Duplicates")}
                />
            ) : (
                <SelectionToolBar
                    onCancel={resetSelection}
                    onSelectAll={() => {
                        if (duplicateFiles.length === selectedItems.length) {
                            setSelectedItems([]);
                        } else {
                            setSelectedItems(duplicateFiles.map(file => file.path));
                        }
                    }}
                    count={selectedItems.length}
                    maxCount={duplicateFiles.length}
                />
            )}

            <View style={styles.contentContainer}>
                <FlatList
                    data={duplicateFiles}
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
