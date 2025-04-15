import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

// กำหนด Props ที่จำเป็นสำหรับ SelectionToolBar
interface SelectionToolBarProps {
    onCancel?: (event: GestureResponderEvent) => void,  // ฟังก์ชันเรียกเมื่อกดยกเลิกการเลือก
    onSelectAll?: (event: GestureResponderEvent) => void,  // ฟังก์ชันเรียกเมื่อกดเลือกทั้งหมด
    count: number,  // จำนวนไอเทมที่ถูกเลือก
    maxCount: number,  // จำนวนไอเทมทั้งหมด
}

/**
 * คอมโพเนนต์แถบเครื่องมือสำหรับการจัดการกับไอเทมที่ถูกเลือก
 * แสดงเมื่อมีการเลือกไอเทมในหน้าต่างๆ เช่น รูปภาพ, วิดีโอ, ไฟล์
 * 
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {Function} props.onCancel - ฟังก์ชันสำหรับยกเลิกการเลือกทั้งหมด
 * @param {Function} props.onSelectAll - ฟังก์ชันสำหรับเลือกไอเทมทั้งหมด
 * @param {number} props.count - จำนวนไอเทมที่ถูกเลือก
 * @param {number} props.maxCount - จำนวนไอเทมทั้งหมด
 * @returns {JSX.Element} คอมโพเนนต์ที่เรนเดอร์แล้ว
 */
export default function SelectionToolBar({ onCancel, onSelectAll, count, maxCount }: SelectionToolBarProps) {

    const { theme } = useTheme();

    return <View style={{backgroundColor: theme.toolbarColor }}>
        <View style={{marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', }}>
            {/* ปุ่มยกเลิกการเลือก */}
            <TouchableOpacity style={{ padding: 15, }} onPress={onCancel}>
                <MaterialCommunityIcons name="cancel" size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, marginLeft: 10, color: theme.text }}>{count}/{maxCount}</Text>
            <TouchableOpacity style={{ marginLeft: 'auto', marginRight: 15 }} onPress={onSelectAll}>
                <MaterialIcons name="select-all" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>
    </View>
    /*hi*/ 
}