import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import * as RNFS from 'react-native-fs';

// กำหนด Props ที่จำเป็นสำหรับ ItemCard
interface ItemCardProps {
    item: RNFS.ReadDirItem;            // ข้อมูลของไฟล์หรือโฟลเดอร์
    onSelect: (selected: boolean, item: RNFS.ReadDirItem) => void;  // ฟังก์ชันเรียกเมื่อเลือกไอเทม
    onOpen: (item: RNFS.ReadDirItem) => void;  // ฟังก์ชันเรียกเมื่อเปิดไอเทม
    isSelected: boolean;               // สถานะว่าไอเทมถูกเลือกหรือไม่
}

// รายการนามสกุลไฟล์ต่างๆ
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.3gp'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

/**
 * คอมโพเนนต์สำหรับแสดงไฟล์หรือโฟลเดอร์ในรูปแบบการ์ด
 * ใช้สำหรับแสดงรายการไฟล์และโฟลเดอร์ในหน้าต่างๆ ของแอป
 * 
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {RNFS.ReadDirItem} props.item - ข้อมูลของไฟล์หรือโฟลเดอร์ที่จะแสดง
 * @param {function(boolean, RNFS.ReadDirItem): void} props.onSelect - ฟังก์ชันเรียกเมื่อเลือกหรือยกเลิกการเลือกไอเทม
 * @param {function(RNFS.ReadDirItem): void} props.onOpen - ฟังก์ชันเรียกเมื่อเปิดไอเทม
 * @param {boolean} props.isSelected - สถานะว่าไอเทมถูกเลือกหรือไม่
 * @returns {JSX.Element} คอมโพเนนต์ที่เรนเดอร์แล้ว
 */

const ItemCard = ({ item, onSelect, onOpen, isSelected }: ItemCardProps) => {
    // คืนค่าไอคอนตามประเภทไฟล์
    const getFileIcon = () => {
        if (item.isDirectory()) {
            return <AntDesign name="folder1" size={40} color="#FFC107" />;
        }
        
        if (item.isFile()) {
            const extension = item.path.toLowerCase().substring(item.path.lastIndexOf('.'));
            
            // ไอคอนสำหรับรูปภาพ
            if (IMAGE_EXTENSIONS.includes(extension)) {
                return <AntDesign name="picture" size={40} color="#4CAF50" />;
            }
            
            // ไอคอนสำหรับวิดีโอ
            if (VIDEO_EXTENSIONS.includes(extension)) {
                return <AntDesign name="videocamera" size={40} color="#F44336" />;
            }
            
            // ไอคอนสำหรับเสียง
            if (AUDIO_EXTENSIONS.includes(extension)) {
                return <FontAwesome name="music" size={40} color="#2196F3" />;
            }
            
            // ไอคอนสำหรับเอกสาร
            if (DOCUMENT_EXTENSIONS.includes(extension)) {
                if (extension === '.pdf') {
                    return <AntDesign name="pdffile1" size={40} color="#FF5722" />;
                } else if (['.doc', '.docx'].includes(extension)) {
                    return <AntDesign name="wordfile1" size={40} color="#2196F3" />;
                } else if (['.xls', '.xlsx'].includes(extension)) {
                    return <AntDesign name="exclefile1" size={40} color="#4CAF50" />;
                } else if (['.ppt', '.pptx'].includes(extension)) {
                    return <AntDesign name="pptfile1" size={40} color="#FF9800" />;
                } else {
                    return <AntDesign name="file1" size={40} color="#607D8B" />;
                }
            }
            
            // ไอคอนเริ่มต้นสำหรับไฟล์อื่นๆ
            return <AntDesign name="file1" size={40} color="#607D8B" />;
        }
        
        // ไอคอนเริ่มต้นหากไม่รู้จักประเภท
        return <FontAwesome name="question" size={40} color="#9E9E9E" />;
    };
    
    // สร้างคอมโพเนนต์การ์ดแสดงไอเทม
    return <View style={{ marginVertical: 5, flexDirection: 'row', alignItems: 'center' }}>
        {/* ส่วนแสดงไอคอนและชื่อไฟล์ */}
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1}} onPress={() => onOpen(item)}>
            {getFileIcon()}
            <Text style={{ fontSize: 15, marginHorizontal: 10}}
                numberOfLines={1}
                ellipsizeMode="tail"
            >{item.name}</Text>
        </TouchableOpacity>
        {/* ปุ่มเลือกไอเทม */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={() => {
                onSelect(!isSelected, item);
            }} style={{ padding: 10 }}>
                <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={25}
                    color="black"
                />
            </TouchableOpacity>
        </View>
    </View>;
};

export default ItemCard;