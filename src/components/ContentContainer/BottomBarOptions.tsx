import { Text, TouchableOpacity, GestureResponderEvent, StyleSheet } from "react-native";
import { ReactNode } from "react";

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
<<<<<<< HEAD
            {/* ส่วนแสดงไอคอน */}
            <View style={styles.iconContainer}>
                {icon}
            </View>
            {/* ส่วนแสดงชื่อตัวเลือก */}
=======
            {icon}
>>>>>>> parent of 771c477 (-0- แก้ไขหลายอย่างโครตเยอะ)
            <Text style={styles.text}>{name}</Text>
        </TouchableOpacity>
    );
};

// สไตล์สำหรับคอมโพเนนต์
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(242, 242, 242, 0.6)',
        marginRight: 10,
    },
    text: {
        textAlignVertical: 'center',
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '500',
        color: '#333'
    }
});

export default BottomBarOptions;