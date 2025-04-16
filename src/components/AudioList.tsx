import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import * as RNFS from 'react-native-fs';
import { MaterialIcons } from '@expo/vector-icons';

// กำหนด Props ที่จำเป็นสำหรับ AudioList
interface AudioListProps {
    audioFiles: RNFS.ReadDirItem[],      // รายการไฟล์เสียง
    isLoading: boolean,                  // สถานะกำลังโหลดข้อมูล
    onAudioPress: (item: RNFS.ReadDirItem) => void,  // ฟังก์ชันเรียกเมื่อกดที่ไฟล์เสียง
    onAudioLongPress?: (item: RNFS.ReadDirItem) => void,  // ฟังก์ชันเรียกเมื่อกดค้างที่ไฟล์เสียง (ใช้ในการเลือก)
    selectedAudio: Set<RNFS.ReadDirItem>  // รายการไฟล์เสียงที่ถูกเลือก
}

/**
 * คอมโพเนนต์แสดงรายการไฟล์เสียง
 * ใช้สำหรับแสดงรายการไฟล์เสียงในหน้า Audio
 */
const AudioList = ({ audioFiles, isLoading, onAudioPress, onAudioLongPress, selectedAudio }: AudioListProps) => {
    // แสดงส่วนกำลังโหลดข้อมูล
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>Loading audio file...</Text>
            </View>
        );
    }
    
    // แสดงข้อความเมื่อไม่พบไฟล์เสียง
    if (audioFiles.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>Audio file not found</Text>
            </View>
        );
    }
    
    // ฟังก์ชันแปลงเวลาเป็นรูปแบบ นาที:วินาที
    const formatDuration = (duration: number): string => {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    
    // แสดงรายการไฟล์เสียงในรูปแบบลิสต์
    return (
        <FlatList
            data={audioFiles}
            keyExtractor={(item) => item.path}
            renderItem={({ item }) => {
                // สมมติความยาวของเพลงแบบสุ่ม (ในแอพจริงควรอ่านข้อมูลจริงจาก metadata)
                const randomDuration = Math.floor(Math.random() * 300) + 60; // 1-6 นาที
                
                return (
                    <TouchableOpacity 
                        style={{ 
                            flexDirection: 'row',
                            padding: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f0f0f0',
                            backgroundColor: selectedAudio.has(item) ? '#e3f2fd' : 'white', // สีพื้นหลังเปลี่ยนเมื่อถูกเลือก
                            alignItems: 'center'
                        }}
                        onPress={() => onAudioPress(item)}
                        onLongPress={() => onAudioLongPress && onAudioLongPress(item)}
                    >
                        {/* ไอคอนเพลง */}
                        <View style={{ 
                            width: 45, 
                            height: 45, 
                            borderRadius: 22.5, 
                            backgroundColor: '#f0f0f0',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 15
                        }}>
                            <MaterialIcons name="music-note" size={24} color="#FF9500" />
                        </View>
                        {/* ข้อมูลไฟล์เสียง */}
                        <View style={{ flex: 1 }}>
                            {/* ชื่อไฟล์ */}
                            <Text style={{ fontSize: 16, fontWeight: '500' }} numberOfLines={1}>
                                {item.name.substring(0, item.name.lastIndexOf('.'))}
                            </Text>
                            {/* ความยาวและวันที่ */}
                            <View style={{ flexDirection: 'row', marginTop: 2, alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, color: '#666', marginRight: 10 }}>
                                    {formatDuration(randomDuration)}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#888' }}>
                                    {new Date(item.mtime?.getTime() || 0).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                        {/* ปุ่มเล่น */}
                        <MaterialIcons name="play-circle-outline" size={32} color="#666" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                );
            }}
        />
    );
};

export default AudioList; 