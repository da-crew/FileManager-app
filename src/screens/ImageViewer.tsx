import React, { useState } from 'react';
import { View, Image, StyleSheet, StatusBar, TouchableOpacity, Text, ActivityIndicator, SafeAreaView, Dimensions, Share } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as RNFS from 'react-native-fs';

interface ImageViewerRouteParams {
    imagePath: string;
    imageName: string;
}

const ImageViewer = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { imagePath, imageName } = route.params as ImageViewerRouteParams;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // ขนาดหน้าจอสำหรับปรับขนาดรูปภาพ
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    // ฟังก์ชันแชร์รูปภาพ
    const shareImage = async () => {
        try {
            await Share.share({
                url: `file://${imagePath}`,
                title: imageName,
            });
        } catch (error) {
            console.error('Error sharing image:', error);
        }
    };

    // แสดงข้อมูลของไฟล์
    const showFileInfo = async () => {
        try {
            // ตรวจสอบขนาดไฟล์
            const fileStats = await RNFS.stat(imagePath);
            const fileSize = (fileStats.size / 1024 / 1024).toFixed(2) + ' MB';
            const lastModified = new Date(fileStats.mtime).toLocaleString();
            
            // แสดงข้อมูลไฟล์
            alert(
                `ข้อมูลไฟล์\n\n` +
                `ชื่อไฟล์: ${imageName}\n` +
                `ขนาดไฟล์: ${fileSize}\n` +
                `แก้ไขล่าสุด: ${lastModified}\n` +
                `ที่อยู่: ${imagePath}`
            );
        } catch (error) {
            console.error('Error getting file info:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar hidden />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="middle">
                    {imageName}
                </Text>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={shareImage} style={styles.actionButton}>
                        <Feather name="share" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={showFileInfo} style={styles.actionButton}>
                        <Feather name="info" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Image Container */}
            <View style={styles.imageContainer}>
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                )}
                
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>ไม่สามารถโหลดรูปภาพได้</Text>
                        <Text style={styles.errorSubtext}>{error}</Text>
                    </View>
                )}
                
                <Image
                    source={{ uri: `file://${imagePath}` }}
                    style={styles.image}
                    resizeMode="contain"
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onError={(e) => {
                        setLoading(false);
                        setError(e.nativeEvent.error);
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backButton: {
        padding: 8,
    },
    title: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        marginLeft: 10,
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 8,
        marginLeft: 10,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    errorContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    errorText: {
        color: 'white',
        fontSize: 18,
        marginBottom: 8,
    },
    errorSubtext: {
        color: '#FF6B6B',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default ImageViewer;