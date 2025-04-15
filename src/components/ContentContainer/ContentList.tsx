import {SafeAreaView, View, StatusBar, Text, ScrollView, TouchableOpacity, Modal, GestureResponderEvent, Alert, BackHandler, FlatList, StyleSheet, Dimensions, ActivityIndicator  } from "react-native";
import ItemCard from "../ItemCard";
import * as RNFS from "react-native-fs"
import { useTheme } from "../ThemeContext";

// กำหนด Props ที่จำเป็นสำหรับ ContentList
interface ContentListProps {
    content: RNFS.ReadDirItem[] | null;  // รายการไฟล์และโฟลเดอร์
    selectionSet: Set<RNFS.ReadDirItem>;  // ชุดของไอเทมที่ถูกเลือก
    handleSelect: (select: boolean, item: RNFS.ReadDirItem) => void;  // ฟังก์ชันจัดการการเลือกไอเทม
    handleOpen: (item: RNFS.ReadDirItem) => void;  // ฟังก์ชันจัดการการเปิดไอเทม
    hideCheckbox?: boolean;  // ซ่อนกล่องเช็คบ็อกซ์หรือไม่
}

/**
 * คอมโพเนนต์แสดงรายการไฟล์และโฟลเดอร์
 * แสดงผลด้วย FlatList พร้อมกับรองรับการเลือกรายการ
 * 
 * @param {RNFS.ReadDirItem[] | null} content - รายการไฟล์และโฟลเดอร์ที่จะแสดง
 * @param {Set<RNFS.ReadDirItem>} selectionSet - ชุดของไอเทมที่ถูกเลือก
 * @param {Function} handleSelect - ฟังก์ชันจัดการการเลือกไอเทม
 * @param {Function} handleOpen - ฟังก์ชันจัดการการเปิดไอเทม
 */
export const ContentList = ({content, selectionSet, handleSelect, handleOpen, hideCheckbox}: ContentListProps) => {
    if (content) {
        // กรณีไม่มีไฟล์หรือโฟลเดอร์
        if (content.length === 0) {
            return <Text style={{textAlign: 'center', marginTop: 10}}>No items</Text>;
        }
        return (
            <FlatList
                data={content}
                keyExtractor={(item) => item.path}
                renderItem={({ item }) => (
                    <View style={{ marginVertical: 4 }}>
                        <ItemCard
                            item={item}
                            onSelect={handleSelect}
                            onOpen={handleOpen}
                            isSelected={selectionSet.has(item)}
                            hideCheckbox={hideCheckbox}
                            showPath={hideCheckbox}
                        />
                    </View>
                )}
                contentContainerStyle={{ paddingVertical: 8 }}
            />
        );
    } else {
        // กรณีกำลังโหลดข้อมูล
        return <Text style={{textAlign: 'center', marginTop: 10}}>Loading...</Text>;
    }
}

// สไตล์สำหรับคอมโพเนนต์
const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#444',
    },
});