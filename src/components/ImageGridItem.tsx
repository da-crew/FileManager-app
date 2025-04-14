import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import * as RNFS from 'react-native-fs';
import { FontAwesome5 } from '@expo/vector-icons';

export interface ImageGridItemProps {
    item: RNFS.ReadDirItem;
    onSelect: (select: boolean, item: RNFS.ReadDirItem) => void;
    onOpen: (item: RNFS.ReadDirItem) => void;
    isSelected: boolean;
    width?: number;
}

// Default width
const windowWidth = Dimensions.get('window').width;
const defaultItemWidth = (windowWidth - 40) / 3; // หักช่องว่างด้านข้าง

const ImageGridItem: React.FC<ImageGridItemProps> = ({ item, onSelect, onOpen, isSelected, width }) => {
    // ใช้ค่า width ที่ได้รับหรือค่า default
    const itemSize = width || defaultItemWidth;
    
    // รับชื่อไฟล์ที่ตัดออกมาเพื่อแสดง
    const fileName = item.name.length > 15 
        ? item.name.substring(0, 12) + '...' 
        : item.name;

    return (
        <View style={[styles.container, { width: itemSize, height: itemSize }]}>
            <TouchableOpacity 
                style={styles.touchable}
                onPress={() => onOpen(item)}
                activeOpacity={0.8}
            >
                <Image 
                    source={{ uri: `file://${item.path}` }}
                    style={[styles.image, { width: itemSize, height: itemSize }]}
                    resizeMode="cover"
                />
            </TouchableOpacity>
            
            {/* Checkbox สำหรับเลือกรูปภาพ */}
            <TouchableOpacity 
                style={[styles.checkboxContainer, isSelected && styles.checkboxSelected]} 
                onPress={() => onSelect(!isSelected, item)}
            >
                {isSelected && <FontAwesome5 name="check" size={10} color="#fff" />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 1,
        position: 'relative',
    },
    touchable: {
        width: '100%',
        height: '100%',
    },
    image: {
        borderRadius: 2,
    },
    checkboxContainer: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#2196F3',
    },
});

export default ImageGridItem;