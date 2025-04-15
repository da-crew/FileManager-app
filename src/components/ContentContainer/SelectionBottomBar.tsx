import React from "react";
import { View, Alert} from "react-native";
import { Feather, Foundation, MaterialIcons } from '@expo/vector-icons';
import BottomBarItem from "./BottomBarItem";
import * as RNFS from "react-native-fs";
import { useTheme } from "../ThemeContext";

// กำหนด Props ที่จำเป็นสำหรับ SelectionBottomBar
declare interface SelectionBottomBarProps {
    selectionSet: Set<RNFS.ReadDirItem>;       // ชุดของไอเทมที่ถูกเลือก
    isSelecting: boolean;                      // สถานะการเลือกไอเทม
    isMoving: boolean;                         // สถานะการย้ายไอเทม
    isPasteLocationValid: boolean;             // สถานะความถูกต้องของตำแหน่งที่จะวาง
    copyActionHandler: () => void;             // ฟังก์ชันจัดการการคัดลอก
    moveActionHandler: () => void;             // ฟังก์ชันจัดการการย้าย
    renameActionHandler: () => void;           // ฟังก์ชันจัดการการเปลี่ยนชื่อ
    deleteActionHandler: () => void;           // ฟังก์ชันจัดการการลบ
    pasteCancelActionHandler: () => void;      // ฟังก์ชันจัดการการยกเลิกการวาง
    pasteActionHandler: () => Promise<void>;   // ฟังก์ชันจัดการการวาง
}

/**
 * คอมโพเนนต์แสดงแถบเครื่องมือด้านล่างสำหรับการจัดการไอเทมที่เลือก
 * แสดงปุ่มต่างๆ เช่น คัดลอก, ย้าย, เปลี่ยนชื่อ, ลบ ตามสถานะการทำงาน
 * 
 * @param {SelectionBottomBarProps} props - คุณสมบัติของคอมโพเนนต์
 * @returns {JSX.Element} คอมโพเนนต์ที่เรนเดอร์แล้ว
 */
export default function SelectionBottomBar(props: SelectionBottomBarProps) {
    // แสดงแถบเครื่องมือเมื่อมีการเลือกไอเทม
    const { theme } = useTheme();
    if (props.isSelecting) {
        return (
            <View style={{  backgroundColor: theme.toolbarColor, borderTopWidth: 1, borderColor: theme.background, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20  }}>
                {/* ปุ่มคัดลอก */}
                <BottomBarItem name='Copy' icon={<Feather name='copy' size={30}  color={theme.text}/>} onPress={props.copyActionHandler} />
                {/* ปุ่มย้าย */}
                <BottomBarItem name='Move' icon={<Feather name='scissors' size={30}  color={theme.text}/>} onPress={props.moveActionHandler} />
                {/* ปุ่มเปลี่ยนชื่อ (ปิดใช้งานเมื่อเลือกมากกว่า 1 ไอเทม) */}
                <BottomBarItem name='Rename' icon={<Foundation name='pencil' size={30}  color={theme.text}/>} onPress={props.renameActionHandler} disabled={props.selectionSet.size > 1} />
                {/* ปุ่มลบ */}
                <BottomBarItem name='Delete' icon={<MaterialIcons name='delete' size={30}  color={theme.text}/>} onPress={props.deleteActionHandler} />
            </View>
        );
    }

    // แสดงแถบเครื่องมือเมื่อกำลังย้ายไอเทม
    if (props.isMoving) {
        return (<View style={{ backgroundColor: theme.toolbarColor, borderTopWidth: 1, borderColor: theme.background, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 }}>
            <BottomBarItem name='Cancel' icon={<MaterialIcons name='cancel' size={30} color={theme.text}/>} onPress={props.pasteCancelActionHandler} />
            <BottomBarItem name='Paste' icon={<MaterialIcons name='content-paste' size={30} color={theme.text}/>} onPress={props.pasteActionHandler} disabled={!props.isPasteLocationValid} />
        </View>);
    }

    // ไม่แสดงแถบเครื่องมือในกรณีอื่นๆ
    return <></>;
}