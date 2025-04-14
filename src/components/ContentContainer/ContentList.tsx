import React from "react";
import { SafeAreaView, View, StatusBar, Text, ScrollView, TouchableOpacity, Modal, GestureResponderEvent, Alert, BackHandler, FlatList, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import ItemCard from "../ItemCard";
import * as RNFS from "react-native-fs"

// กำหนด Props ที่จำเป็นสำหรับ ContentList
interface ContentListProps {
    content: RNFS.ReadDirItem[] | null;  // รายการไฟล์และโฟลเดอร์
    selectionSet: Set<RNFS.ReadDirItem>;  // ชุดของไอเทมที่ถูกเลือก
    handleSelect: (select: boolean, item: RNFS.ReadDirItem) => void;  // ฟังก์ชันจัดการการเลือกไอเทม
    handleOpen: (item: RNFS.ReadDirItem) => void;  // ฟังก์ชันจัดการการเปิดไอเทม
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
export const ContentList = ({content, selectionSet, handleSelect, handleOpen}: ContentListProps) => {
    if (content) {
        // กรณีไม่มีไฟล์หรือโฟลเดอร์
        if (content.length == 0) {
            return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15 }}>Empty</Text>
            </View>);
        }
        // แสดงรายการไฟล์และโฟลเดอร์
        return (
            <FlatList
                data={content}
                keyExtractor={(item, i) => item + i.toString()}
                renderItem={({ item }) =>
                    <ItemCard item={item}
                        onSelect={handleSelect}
                        onOpen={handleOpen}
                        isSelected={selectionSet.has(item)}
                    />
                }
            />
        );
    } else if (content === null) {
        // แสดงตัวโหลดขณะกำลังโหลดข้อมูล
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loaderText}>Loading files...</Text>
            </View>
        );
    } else {
        // กรณีอื่นๆ แสดงข้อความ Loading
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15 }}>Loading</Text>
            </View>
        );
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