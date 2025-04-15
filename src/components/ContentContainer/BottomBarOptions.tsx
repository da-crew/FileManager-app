import { Text, TouchableOpacity, GestureResponderEvent, StyleSheet, View } from "react-native";
import { ReactNode } from "react";
import React from 'react'

/**
 * คอมโพเนนต์ปุ่มตัวเลือกในแถบด้านล่าง
 * ใช้แสดงตัวเลือกการทำงานต่างๆ ในแถบเครื่องมือด้านล่างของหน้าจอ
 * 
 * @param {string} name - ชื่อของตัวเลือก
 * @param {ReactNode} icon - ไอคอนที่แสดงประกอบชื่อ
 * @param {Function} onPress - ฟังก์ชันที่จะเรียกเมื่อกดที่ตัวเลือก
 */
const BottomBarOptions = ({ name, icon, onPress }: {
    name: string,             // ชื่อตัวเลือก
    icon: ReactNode,          // ไอคอนของตัวเลือก
    onPress: (event: GestureResponderEvent) => void,  // ฟังก์ชันเรียกเมื่อกดที่ตัวเลือก
}) => {
    return (
        <TouchableOpacity 
            style={styles.container} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* ส่วนแสดงไอคอน */}
            <View style={styles.iconContainer}>
                {icon}
            </View>
            {/* ส่วนแสดงชื่อตัวเลือก */}
            <Text style={styles.text}>{name}</Text>
        </TouchableOpacity>
    );
};

// สไตล์สำหรับคอมโพเนนต์
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: 'white',
        marginVertical: 6,
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderColor: '#f0f0f0',
        borderWidth: 1,
    },
    iconContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    }
});

export default BottomBarOptions;