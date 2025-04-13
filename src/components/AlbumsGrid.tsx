import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';

interface AlbumItem {
    name: string;
    path: string;
    count: number;
    thumbnail: string | null;
}

interface AlbumsGridProps {
    isLoading: boolean;
    albums: AlbumItem[];
    onAlbumPress: (album: AlbumItem) => void;
}

const AlbumsGrid: React.FC<AlbumsGridProps> = ({ isLoading, albums, onAlbumPress }) => {
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333333' }}>Loading albums...</Text>
            </View>
        );
    }
    
    if (!albums || albums.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#ffffff' }}>
                <Text style={{ fontSize: 18, textAlign: 'center', color: '#333333' }}>
                    No albums found. Check app permissions to access photos.
                </Text>
            </View>
        );
    }

    // คำนวณขนาดคอลัมน์
    const numColumns = 3;
    const { width } = Dimensions.get('window');
    const itemWidth = width / numColumns;

    return (
        <FlatList
            style={{ flex: 1, backgroundColor: '#ffffff' }}
            data={albums}
            keyExtractor={(item) => item.path}
            numColumns={numColumns}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={{ 
                        width: itemWidth, 
                        height: itemWidth,
                        padding: 1
                    }}
                    onPress={() => onAlbumPress(item)}
                >
                    {item.thumbnail ? (
                        <Image 
                            source={{ uri: 'file://' + item.thumbnail }} 
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={{ 
                            width: '100%', 
                            height: '100%', 
                            backgroundColor: '#f0f0f0',
                            justifyContent: 'center',
                            alignItems: 'center' 
                        }}>
                            {item.name === 'Camera' ? (
                                <Text style={{ color: '#333333', fontSize: 36 }}>📷</Text>
                            ) : item.name === 'Screenshots' ? (
                                <Text style={{ color: '#333333', fontSize: 36 }}>📱</Text>
                            ) : item.name === 'Download' ? (
                                <Text style={{ color: '#333333', fontSize: 36 }}>📥</Text>
                            ) : item.name === 'All Photos' ? (
                                <Text style={{ color: '#333333', fontSize: 36 }}>🖼️</Text>
                            ) : item.name === 'Favorites' ? (
                                <Text style={{ color: '#333333', fontSize: 36 }}>⭐</Text>
                            ) : (
                                <Text style={{ color: '#333333', fontSize: 36 }}>📁</Text>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            )}
        />
    );
};

export default AlbumsGrid;