import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, Dimensions } from 'react-native';

// อินเตอร์เฟซสำหรับอัลบั้ม - กำหนดโครงสร้างข้อมูลอัลบั้ม
export interface AlbumItem {
    name: string;         // ชื่ออัลบั้ม
    path: string;         // พาธที่เก็บไฟล์ในอัลบั้ม
    count: number;        // จำนวนไฟล์ในอัลบั้ม
    thumbnail: string | null;  // พาธของรูปภาพตัวอย่าง
}

// กำหนด Props ที่จำเป็นสำหรับ AlbumsGrid
interface AlbumsGridProps {
    albums: AlbumItem[],             // รายการอัลบั้ม
    isLoading: boolean,              // สถานะกำลังโหลดข้อมูล
    onAlbumPress: (album: AlbumItem) => void  // ฟังก์ชันเรียกเมื่อกดที่อัลบั้ม
}

/**
 * คอมโพเนนต์แสดงอัลบั้มแบบตารางกริด
 * ใช้สำหรับแสดงรายการอัลบั้มในหน้าต่างๆ เช่น หน้ารูปภาพ, วิดีโอ
 */
const AlbumsGrid = ({ albums, isLoading, onAlbumPress }: AlbumsGridProps) => {
    // คำนวณขนาดของแต่ละไอเทมตามความกว้างหน้าจอ
    const { width } = Dimensions.get('window');
    const numColumns = 2;  // แสดง 2 คอลัมน์
    const itemWidth = (width - 30) / numColumns;
    
    // แสดงส่วนกำลังโหลดข้อมูล
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>กำลังโหลดอัลบั้ม...</Text>
            </View>
        );
    }
    
    // แสดงข้อความเมื่อไม่พบอัลบั้ม
    if (albums.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>ไม่พบอัลบั้ม</Text>
            </View>
        );
    }
    
    console.log('Rendering albums:', albums.length);
    
    // แสดงรายการอัลบั้มในรูปแบบตาราง
    return (
        <FlatList
            data={albums}
            numColumns={numColumns}
            keyExtractor={(item) => item.path}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={{ 
                        width: itemWidth, 
                        height: itemWidth * 1.2, 
                        margin: 5,
                        borderRadius: 10,
                        overflow: 'hidden',
                        backgroundColor: '#ffffff',
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                    }}
                    onPress={() => onAlbumPress(item)}
                >
                    {/* แสดงรูปตัวอย่างของอัลบั้ม หรือไอคอนเริ่มต้นถ้าไม่มีรูปตัวอย่าง */}
                    {item.thumbnail ? (
                        <Image 
                            source={{ uri: `file://${item.thumbnail}` }} 
                            style={{ width: '100%', height: '70%' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={{ 
                            width: '100%', 
                            height: '70%',
                            backgroundColor: '#f0f0f0',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {/* แสดงอิโมจิตามชื่ออัลบั้ม */}
                            {item.name === 'Camera' ? (
                                <Text style={{ fontSize: 40 }}>📷</Text>
                            ) : item.name === 'Screenshots' ? (
                                <Text style={{ fontSize: 40 }}>📱</Text>
                            ) : item.name === 'Download' || item.name === 'Downloads' ? (
                                <Text style={{ fontSize: 40 }}>📥</Text>
                            ) : item.name === 'All Photos' ? (
                                <Text style={{ fontSize: 40 }}>🖼️</Text>
                            ) : (
                                <Text style={{ fontSize: 40 }}>📁</Text>
                            )}
                        </View>
                    )}
                    {/* แสดงชื่ออัลบั้มและจำนวนไฟล์ด้านล่าง */}
                    <View style={{ padding: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14 }} numberOfLines={1}>{item.name}</Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>{item.count} รูป</Text>
                    </View>
                </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 5, paddingVertical: 10 }}
        />
    );
};

export default AlbumsGrid;