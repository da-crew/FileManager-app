import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, Dimensions } from 'react-native';
import * as RNFS from 'react-native-fs';

// กำหนด Props ที่จำเป็นสำหรับ ImageGrid
interface ImageGridProps {
    images: RNFS.ReadDirItem[],        // รายการไฟล์รูปภาพ
    isLoading: boolean,                // สถานะกำลังโหลดข้อมูล
    onImagePress: (item: RNFS.ReadDirItem) => void,  // ฟังก์ชันเรียกเมื่อกดที่รูปภาพ
    onImageLongPress?: (item: RNFS.ReadDirItem) => void,  // ฟังก์ชันเรียกเมื่อกดค้างที่รูปภาพ (ใช้ในการเลือก)
    selectedImages: Set<RNFS.ReadDirItem>  // รายการรูปภาพที่ถูกเลือก
}

/**
 * คอมโพเนนต์แสดงรูปภาพแบบตารางกริด
 * ใช้สำหรับแสดงรายการรูปภาพในหน้ารูปภาพและอัลบั้ม
 */
const ImageGrid = ({ images, isLoading, onImagePress, onImageLongPress, selectedImages }: ImageGridProps) => {
    // คำนวณขนาดของแต่ละไอเทมตามความกว้างหน้าจอ
    const { width } = Dimensions.get('window');
    const numColumns = 3;  // แสดง 3 คอลัมน์
    const itemWidth = (width - 20) / numColumns;
    
    // แสดงส่วนกำลังโหลดข้อมูล
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>Loading image file...</Text>
            </View>
        );
    }
    
    // แสดงข้อความเมื่อไม่พบรูปภาพ
    if (images.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>Image file not found</Text>
            </View>
        );
    }
    
    // แสดงรายการรูปภาพในรูปแบบตาราง
    return (
        <FlatList
            data={images}
            numColumns={numColumns}
            keyExtractor={item => item.path}
            renderItem={({ item }) => (
                <View style={{ width: itemWidth, height: itemWidth, padding: 1 }}>
                    <TouchableOpacity
                        onPress={() => onImagePress(item)}
                        onLongPress={() => onImageLongPress && onImageLongPress(item)}
                        style={{ flex: 1 }}
                    >
                        <Image
                            source={{ uri: `file://${item.path}` }}
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                borderWidth: selectedImages.has(item) ? 3 : 0,  // แสดงขอบเมื่อถูกเลือก
                                borderColor: '#2196F3',
                            }}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                </View>
            )}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews={true}
        />
    );
};

export default ImageGrid;
