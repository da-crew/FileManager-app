import React from 'react';
import { MaterialCommunityIcons, FontAwesome5, FontAwesome, Ionicons } from '@expo/vector-icons';

// ส่งคืน icon component ตามประเภทไฟล์
export const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    
    // Document types
    if (['doc', 'docx'].includes(extension)) {
        return <MaterialCommunityIcons name="file-word" size={40} color="#2B579A" />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
        return <MaterialCommunityIcons name="file-excel" size={40} color="#217346" />;
    } else if (['ppt', 'pptx'].includes(extension)) {
        return <MaterialCommunityIcons name="file-powerpoint" size={40} color="#D24726" />;
    } else if (extension === 'pdf') {
        return <MaterialCommunityIcons name="file-pdf-box" size={40} color="#FF0000" />;
    } else if (['txt', 'rtf', 'md'].includes(extension)) {
        return <MaterialCommunityIcons name="file-document-outline" size={40} color="#5F6368" />;
    }
    
    // Image types
    else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
        return <MaterialCommunityIcons name="file-image" size={40} color="#4285F4" />;
    }
    
    // Video types
    else if (['mp4', 'mov', 'avi', 'mkv', 'wmv', '3gp', 'webm'].includes(extension)) {
        return <MaterialCommunityIcons name="file-video" size={40} color="#FF5252" />;
    }
    
    // Audio types
    else if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(extension)) {
        return <FontAwesome5 name="file-audio" size={40} color="#F57C00" />;
    }
    
    // Archive types
    else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
        return <MaterialCommunityIcons name="zip-box" size={40} color="#8D6E63" />;
    }
    
    // Code files
    else if (['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml'].includes(extension)) {
        return <MaterialCommunityIcons name="xml" size={40} color="#00BCD4" />;
    }
    
    // APK
    else if (extension === 'apk') {
        return <FontAwesome5 name="android" size={40} color="#A4C639" />;
    }
    
    // Default icon for unknown file types
    return <MaterialCommunityIcons name="file-outline" size={40} color="#607D8B" />;
}; 