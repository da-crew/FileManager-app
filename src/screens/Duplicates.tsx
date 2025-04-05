
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar, Modal } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from '../components/SelectionToolbar';
import ItemCard from '../components/ItemCard';
import * as RNFS from "react-native-fs";
import { Feather, Foundation, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import BottomBarItem from "../components/ContentContainer/BottomBarItem";
import BottomBarOptions from "../components/ContentContainer/BottomBarOptions";
import { useTheme } from '../components/ThemeContext';
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

// เพิ่ม enum สำหรับประเภทการเรียงลำดับ
enum SortType {
    ALPHABETICAL,
    DATE,

}

export default function Duplicates() {
    const navigation = useNavigation();

    const [duplicateFiles, setDuplicateFiles] = useState<RNFS.ReadDirItem[]>(mockDuplicateFiles);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);
    const [sortType, setSortType] = useState<SortType>(SortType.ALPHABETICAL);
    const { theme } = useTheme();
    // อัพเดทรายการไฟล์
    const updateFileList = async () => {
        // สำหรับ mock data ไม่ต้องตรวจสอบว่าไฟล์มีอยู่จริง
        // เรียงข้อมูลตามประเภทการเรียงที่เลือก
        const sortedFiles = [...mockDuplicateFiles].sort((a, b) => {
            switch (sortType) {
                case SortType.ALPHABETICAL:
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                case SortType.DATE:
                    return (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0);
                default:
                    return 0;
            }
        });
        
        setDuplicateFiles(sortedFiles);
        
        // อัพเดท selectedItems ให้มีเฉพาะไฟล์ที่ยังอยู่ในรายการ
        setSelectedItems(prev => 
            prev.filter(path => mockDuplicateFiles.some(file => file.path === path))
        );
    };

    // เรียกใช้ updateFileList เมื่อหน้าจอถูกโฟกัสหรือเมื่อประเภทการเรียงเปลี่ยน
    useFocusEffect(
        React.useCallback(() => {
            updateFileList();
        }, [sortType])
    );


    function updateSortType(type: SortType) {
        if (sortType !== type) {
            setSortType(type);
        }
    }

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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />


            {!isSelecting ? (
                <Toolbar
                    navigation={navigation}
                    goBackHandler={() => navigation.goBack()}
                    containerName="Duplicate Files"
                    sortByHandler={() => setSortByOptionVisible(true)}
                />
            ) : (
                <SelectionToolBar
                    onCancel={resetSelection}
                    onSelectAll={() => {
                        if (duplicateFiles.length === selectedItems.length) {
                            setSelectedItems([]);
                            setIsSelecting(false);
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
                <View style={{ backgroundColor: '#d9d9d9', borderTopWidth: 1, borderColor: '#e7e7e7', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                    <BottomBarItem name='Copy' icon={<Feather name='copy' size={30} />} onPress={() => console.log('Copy')} />
                    <BottomBarItem name='Move' icon={<Feather name='scissors' size={30} />} onPress={() => console.log('Move')} />
                    <BottomBarItem name='Rename' icon={<Foundation name='pencil' size={30} />} onPress={() => console.log('Rename')} />
                    <BottomBarItem name='Delete' icon={<MaterialIcons name='delete' size={30} />} onPress={() => console.log('Delete')} />
                    <BottomBarItem name='More' icon={<MaterialIcons name='more-vert' size={30} />} onPress={() => console.log('More')} />
                </View>
            )}

            <Modal visible={sortByOptionVisible} transparent={true} onRequestClose={() => setSortByOptionVisible(false)} >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', justifyContent: 'space-between', paddingBottom: 5 }}>
                        <BottomBarOptions name='Alphabetical' icon={<FontAwesome name="sort-alpha-asc" size={30} style={{ padding: 15 }} />} onPress={() => {
                            updateSortType(SortType.ALPHABETICAL);
                            setSortByOptionVisible(false);
                        }} />
                        <BottomBarOptions name='Date' icon={<FontAwesome name="sort-numeric-asc" size={30} style={{ padding: 15 }} />} onPress={() => {
                            updateSortType(SortType.DATE);
                            setSortByOptionVisible(false);
                        }} />
                    </View>
                </View>
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
    bottomBar: {
        backgroundColor: '#d9d9d9', 
        borderTopWidth: 1, 
        borderColor: '#e7e7e7', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 15,
        paddingVertical: 8
    }
});
