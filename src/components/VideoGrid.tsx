import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, Dimensions } from 'react-native';
import * as RNFS from 'react-native-fs';
import { MaterialIcons } from '@expo/vector-icons';

interface VideoGridProps {
    videos: RNFS.ReadDirItem[], 
    isLoading: boolean,
    onVideoPress: (item: RNFS.ReadDirItem) => void,
    onVideoLongPress?: (item: RNFS.ReadDirItem) => void,
    selectedVideos: Set<RNFS.ReadDirItem>
}

const VideoGrid = ({ videos, isLoading, onVideoPress, onVideoLongPress, selectedVideos }: VideoGridProps) => {
    const { width } = Dimensions.get('window');
    const numColumns = 2;
    const itemWidth = (width - 24) / numColumns;
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>กำลังโหลดวิดีโอ...</Text>
            </View>
        );
    }
    
    if (videos.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>ไม่พบวิดีโอ</Text>
            </View>
        );
    }
    
    const formatDuration = (duration: number): string => {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    
    return (
        <FlatList
            data={videos}
            numColumns={numColumns}
            keyExtractor={(item) => item.path}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={{ 
                        width: itemWidth,
                        height: itemWidth * 0.8,
                        margin: 6,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#000',
                        borderWidth: selectedVideos.has(item) ? 3 : 0,
                        borderColor: '#2196F3',
                    }}
                    onPress={() => onVideoPress(item)}
                    onLongPress={() => onVideoLongPress && onVideoLongPress(item)}
                >
                    <Image
                        source={{ uri: `file://${item.path}` }}
                        style={{ width: '100%', height: '70%' }}
                        resizeMode="cover"
                    />
                    <View style={{ 
                        position: 'absolute', 
                        top: 5, 
                        right: 5, 
                        backgroundColor: 'rgba(0,0,0,0.6)', 
                        borderRadius: 12,
                        padding: 3,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <MaterialIcons name="access-time" size={12} color="#fff" style={{ marginRight: 2 }} />
                        <Text style={{ color: '#fff', fontSize: 11 }}>
                            {/* ตรงนี้ควรมีการคำนวณความยาววิดีโอจริงๆ */}
                            {formatDuration(Math.floor(Math.random() * 300) + 30)}
                        </Text>
                    </View>
                    <View style={{ 
                        position: 'absolute',
                        top: '30%',
                        left: '42%',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        borderRadius: 30,
                        padding: 5
                    }}>
                        <MaterialIcons name="play-arrow" size={30} color="#fff" />
                    </View>
                    <View style={{ padding: 8, height: '30%', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#333', fontSize: 14 }} numberOfLines={1}>
                            {item.name.substring(0, item.name.lastIndexOf('.'))}
                        </Text>
                        <Text style={{ color: '#666', fontSize: 12 }}>
                            {new Date(item.mtime?.getTime() || 0).toLocaleDateString()}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 3, paddingVertical: 10 }}
        />
    );
};

export default VideoGrid; 