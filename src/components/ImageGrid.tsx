import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, Dimensions } from 'react-native';
import * as RNFS from 'react-native-fs';

interface ImageGridProps {
    images: RNFS.ReadDirItem[], 
    isLoading: boolean,
    onImagePress: (item: RNFS.ReadDirItem) => void,
    onImageLongPress?: (item: RNFS.ReadDirItem) => void,
    selectedImages: Set<RNFS.ReadDirItem>
}

const ImageGrid = ({ images, isLoading, onImagePress, onImageLongPress, selectedImages }: ImageGridProps) => {
    const { width } = Dimensions.get('window');
    const numColumns = 3;
    const itemWidth = (width - 20) / numColumns;
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>Loading images...</Text>
            </View>
        );
    }
    
    if (images.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>No images found</Text>
            </View>
        );
    }
    
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
                                borderWidth: selectedImages.has(item) ? 3 : 0,
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
