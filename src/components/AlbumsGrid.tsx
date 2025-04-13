import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, Dimensions } from 'react-native';

// อินเตอร์เฟซสำหรับอัลบั้ม
export interface AlbumItem {
    name: string;
    path: string;
    count: number;
    thumbnail: string | null;
}

interface AlbumsGridProps {
    albums: AlbumItem[],
    isLoading: boolean,
    onAlbumPress: (album: AlbumItem) => void
}

const AlbumsGrid = ({ albums, isLoading, onAlbumPress }: AlbumsGridProps) => {
    const { width } = Dimensions.get('window');
    const numColumns = 2;
    const itemWidth = (width - 30) / numColumns;
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>กำลังโหลดอัลบั้ม...</Text>
            </View>
        );
    }
    
    if (albums.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>ไม่พบอัลบั้ม</Text>
            </View>
        );
    }
    
    console.log('Rendering albums:', albums.length);
    
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