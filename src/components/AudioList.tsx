import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import * as RNFS from 'react-native-fs';
import { MaterialIcons } from '@expo/vector-icons';

interface AudioListProps {
    audioFiles: RNFS.ReadDirItem[], 
    isLoading: boolean,
    onAudioPress: (item: RNFS.ReadDirItem) => void,
    onAudioLongPress?: (item: RNFS.ReadDirItem) => void,
    selectedAudio: Set<RNFS.ReadDirItem>
}

const AudioList = ({ audioFiles, isLoading, onAudioPress, onAudioLongPress, selectedAudio }: AudioListProps) => {
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>กำลังโหลดไฟล์เสียง...</Text>
            </View>
        );
    }
    
    if (audioFiles.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>ไม่พบไฟล์เสียง</Text>
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
                            backgroundColor: selectedAudio.has(item) ? '#e3f2fd' : 'white',
                            alignItems: 'center'
                        }}
                        onPress={() => onAudioPress(item)}
                        onLongPress={() => onAudioLongPress && onAudioLongPress(item)}
                    >
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
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '500' }} numberOfLines={1}>
                                {item.name.substring(0, item.name.lastIndexOf('.'))}
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: 2, alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, color: '#666', marginRight: 10 }}>
                                    {formatDuration(randomDuration)}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#888' }}>
                                    {new Date(item.mtime?.getTime() || 0).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                        <MaterialIcons name="play-circle-outline" size={32} color="#666" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                );
            }}
        />
    );
};

export default AudioList; 