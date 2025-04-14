import { View, Text, TouchableOpacity, GestureResponderEvent } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../ThemeContext";
import { StyleSheet } from "react-native";

/**
 * คอมโพเนนต์ปุ่มในแถบด้านล่าง
 * ใช้สำหรับแสดงปุ่มพร้อมไอคอนและข้อความในแถบเครื่องมือด้านล่าง
 * 
 * @param {string} name - ชื่อของปุ่ม
 * @param {ReactNode} icon - ไอคอนที่จะแสดง
 * @param {Function} onPress - ฟังก์ชันที่จะเรียกเมื่อกดปุ่ม
 * @param {boolean} [disabled] - สถานะการปิดใช้งานปุ่ม
 */
const BottomBarItem = ({ name, icon, onPress, disabled }: {
    name: string,             // ชื่อปุ่ม
    icon: ReactNode,          // ไอคอนของปุ่ม
    onPress: (event: GestureResponderEvent) => void,  // ฟังก์ชันเรียกเมื่อกดปุ่ม
    disabled?: boolean,       // สถานะการปิดใช้งานปุ่ม (ตัวเลือก)
}) => {
    return (
        <TouchableOpacity 
            style={[
                styles.container,
                { opacity: disabled ? 0.5 : 1 }  // ลดความทึบเมื่อปุ่มถูกปิดใช้งาน
            ]} 
            onPress={disabled ? undefined : onPress} 
            disabled={disabled}
            activeOpacity={0.7}
        >
            {/* ส่วนแสดงไอคอน */}
            <View style={styles.iconContainer}>
                {icon}
            </View>
            {/* ส่วนแสดงชื่อปุ่ม */}
            <Text style={styles.text}>{name}</Text>
        </TouchableOpacity>
    );
};

// สไตล์สำหรับคอมโพเนนต์
const styles = StyleSheet.create({
    container: {
        padding: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 4,
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center'
    }
});

export default BottomBarItem;