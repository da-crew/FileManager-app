import { SafeAreaView, View, StatusBar, Text, TouchableOpacity, Modal, BackHandler, Alert, TextInput, Platform, PermissionsAndroid, Dimensions, ActivityIndicator, FlatList, Image } from "react-native";
import { PathDisplayer } from '../components/PathDisplayer';
import { Path } from "../FileSystem";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from "../components/SelectionToolbar";
import React, { useEffect, useRef, useState } from "react";
import { AntDesign, Feather, FontAwesome, Foundation, MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as RNFS from 'react-native-fs';
import { RootStackParamList } from "../App";
import { getRecycleBinPath } from "../FileSystem";

import BottomBarOptions from "../components/ContentContainer/BottomBarOptions";
import { ContentList } from "../components/ContentContainer/ContentList";
import SelectionBottomBar from "../components/ContentContainer/SelectionBottomBar";
import ItemCreator from "../components/ContentContainer/ItemCreator";
import { ContainerType, ContentContainerRouteParams, MoveType, MovingState, SortType, ViewMode } from "../components/ContentContainer/common";
import ItemViewModeSelection from "../components/ContentContainer/ItemViewModeSelection";
import { getFileType, openWith } from "../utils/openWith";
import { useProgress } from "../components/ProgressBar/ProgressContext";
import ProgressBar from "../components/ProgressBar/ProgressBar";
import { useTheme } from "../components/ThemeContext";

// รายการนามสกุลไฟล์รูปภาพ
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.3gp', '.webm'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

// รวมทุกประเภทไฟล์ที่รองรับ
const ALL_SUPPORTED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS, ...DOCUMENT_EXTENSIONS];

// อินเตอร์เฟซสำหรับอัลบั้ม
interface AlbumItem {
    name: string;
    path: string;
    count: number;
    thumbnail: string | null;
}

// ตัวแทนองค์ประกอบ ImageGrid เพื่อแก้ปัญหาเรื่องการนำเข้า
const ImageGrid = ({ images, isLoading, onImagePress, onImageLongPress, selectedImages }: { 
    images: RNFS.ReadDirItem[], 
    isLoading: boolean,
    onImagePress: (item: RNFS.ReadDirItem) => void,
    onImageLongPress?: (item: RNFS.ReadDirItem) => void,
    selectedImages: Set<RNFS.ReadDirItem>
}) => {
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

// ตัวแทนองค์ประกอบ AlbumsGrid เพื่อแก้ปัญหาเรื่องการนำเข้า
const AlbumsGrid = ({ albums, isLoading, onAlbumPress }: {
    albums: AlbumItem[],
    isLoading: boolean,
    onAlbumPress: (album: AlbumItem) => void
}) => {
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

const VideoGrid = ({ videos, isLoading, onVideoPress, onVideoLongPress, selectedVideos }: { 
    videos: RNFS.ReadDirItem[], 
    isLoading: boolean,
    onVideoPress: (item: RNFS.ReadDirItem) => void,
    onVideoLongPress?: (item: RNFS.ReadDirItem) => void,
    selectedVideos: Set<RNFS.ReadDirItem>
}) => {
    const { width } = Dimensions.get('window');
    const numColumns = 3;
    const itemWidth = (width - 20) / numColumns;
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>Loading videos...</Text>
            </View>
        );
    }
    
    if (videos.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>No videos found</Text>
            </View>
        );
    }
    
    return (
        <FlatList
            data={videos}
            numColumns={numColumns}
            keyExtractor={item => item.path}
            renderItem={({ item }) => (
                <View style={{ width: itemWidth, height: itemWidth, padding: 1 }}>
                    <TouchableOpacity
                        onPress={() => onVideoPress(item)}
                        onLongPress={() => onVideoLongPress && onVideoLongPress(item)}
                        style={{ flex: 1 }}
                    >
                        <View style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderWidth: selectedVideos.has(item) ? 3 : 0,
                            borderColor: '#2196F3',
                            position: 'relative'
                        }}>
                            <Image
                                source={{ uri: `file://${item.path}` }}
                                style={{ 
                                    width: '100%', 
                                    height: '100%',
                                    backgroundColor: '#f0f0f0'
                                }}
                                resizeMode="cover"
                            />
                            <View style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                padding: 5,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                borderTopLeftRadius: 5
                            }}>
                                <FontAwesome name="play-circle" size={20} color="white" />
                            </View>
                        </View>
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

// AudioList component สำหรับแสดงรายการไฟล์เสียง
const AudioList = ({ audioFiles, isLoading, onAudioPress, onAudioLongPress, selectedAudio }: { 
    audioFiles: RNFS.ReadDirItem[], 
    isLoading: boolean,
    onAudioPress: (item: RNFS.ReadDirItem) => void,
    onAudioLongPress?: (item: RNFS.ReadDirItem) => void,
    selectedAudio: Set<RNFS.ReadDirItem>
}) => {
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
    
    return (
        <FlatList
            data={audioFiles}
            keyExtractor={(item) => item.path}
            renderItem={({ item }) => (
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
                        width: 40, 
                        height: 40, 
                        borderRadius: 20, 
                        backgroundColor: '#f0f0f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 15
                    }}>
                        <FontAwesome name="music" size={20} color="#2196F3" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '500' }} numberOfLines={1}>
                            {item.name.substring(0, item.name.lastIndexOf('.'))}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                            {new Date(item.mtime?.getTime() || 0).toLocaleDateString()}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
};

// DocumentList component สำหรับแสดงรายการเอกสาร
const DocumentList = ({ documents, isLoading, onDocumentPress, onDocumentLongPress, selectedDocuments }: { 
    documents: RNFS.ReadDirItem[], 
    isLoading: boolean,
    onDocumentPress: (item: RNFS.ReadDirItem) => void,
    onDocumentLongPress?: (item: RNFS.ReadDirItem) => void,
    selectedDocuments: Set<RNFS.ReadDirItem>
}) => {
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>กำลังโหลดเอกสาร...</Text>
            </View>
        );
    }
    
    if (documents.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>ไม่พบเอกสาร</Text>
            </View>
        );
    }
    
    // เลือกไอคอนตามประเภทเอกสาร
    const getDocumentIcon = (fileName: string): any => {
        const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        
        if (ext === '.pdf') return 'file-pdf-o';
        if (['.doc', '.docx'].includes(ext)) return 'file-word-o';
        if (['.xls', '.xlsx'].includes(ext)) return 'file-excel-o';
        if (['.ppt', '.pptx'].includes(ext)) return 'file-powerpoint-o';
        if (ext === '.txt') return 'file-text-o';
        
        return 'file-o';
    };
    
    return (
        <FlatList
            data={documents}
            keyExtractor={(item) => item.path}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={{ 
                        flexDirection: 'row',
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0',
                        backgroundColor: selectedDocuments.has(item) ? '#e3f2fd' : 'white',
                        alignItems: 'center'
                    }}
                    onPress={() => onDocumentPress(item)}
                    onLongPress={() => onDocumentLongPress && onDocumentLongPress(item)}
                >
                    <View style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 5, 
                        backgroundColor: '#f0f0f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 15
                    }}>
                        <FontAwesome name={getDocumentIcon(item.name)} size={20} color="#2196F3" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '500' }} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                            {new Date(item.mtime?.getTime() || 0).toLocaleDateString()}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
};

export function ContentContainer({ navigation }: NativeStackScreenProps<RootStackParamList>) {

    const route = useRoute();
    const routeParams = route.params as ContentContainerRouteParams;
    const storageName = routeParams.containerName;
    const containerType = routeParams.containerType;

    const [{ selectionSet, isSelecting }, updateSelectionState] = useState<{ selectionSet: Set<RNFS.ReadDirItem>, isSelecting: boolean }>({ selectionSet: new Set(), isSelecting: false });
    const [movingState, setMovingState] = useState<MovingState | null>(null);

    const { theme } = useTheme();
    const progress = useProgress();

    const deleteCancelledRef = useRef(false);

    const [currentViewMode, setCurrentViewMode] = useState(ViewMode.FILES);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);//modal

    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [renameItem, setRenameItem] = useState<RNFS.ReadDirItem | null>(null);
    const [newName, setNewName] = useState("");

    // เพิ่มตัวแปรเกี่ยวกับรูปภาพและอัลบั้ม
    const [albums, setAlbums] = useState<AlbumItem[]>([]);
    const [albumsCache, setAlbumsCache] = useState<AlbumItem[]>([]);
    const [lastAlbumUpdateTime, setLastAlbumUpdateTime] = useState<number>(0);
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
    const [currentAlbum, setCurrentAlbum] = useState<AlbumItem | null>(null);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [currentFileType, setCurrentFileType] = useState<'all' | 'images' | 'videos' | 'audio' | 'documents'>('all');
    const [currentTab, setCurrentTab] = useState<'Videos' | 'Collections' | 'Audio'>('Videos');

    const [itemCreatorVisible, setItemCreatorVisible] = useState(false);

    const [sortType, setSortType] = useState(SortType.DATE);
    const [navpath, setNavPath] = useState(routeParams.path);

    const [content, setContent] = useState<RNFS.ReadDirItem[] | null>(null);

    // ตั้งค่า currentFileType ตาม storageName เมื่อ component โหลด
    useEffect(() => {
        if (containerType === ContainerType.CATEGORIZED) {
            // กำหนดประเภทไฟล์ตาม storageName
            switch (storageName) {
                case 'Images':
                    setCurrentFileType('images');
                    break;
                case 'Videos':
                    setCurrentFileType('videos');
                    break;
                case 'Audio':
                    setCurrentFileType('audio');
                    break;
                case 'Documents':
                    setCurrentFileType('documents');
                    break;
                default:
                    setCurrentFileType('all');
            }
            console.log(`Setting file type to: ${storageName.toLowerCase()}`);
        }
    }, [containerType, storageName]);

    function fetchContent() {
        setContent(null);
        RNFS.readDir(navpath.build())
            .then((items) => {
                const sortHandler = (a: RNFS.ReadDirItem, b: RNFS.ReadDirItem) => {
                    switch (sortType) {
                        case SortType.ALPHABETICAL:
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                        case SortType.DATE:
                            return (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0);
                        default:
                            return 0;
                    }
                };
                let hiddenFolders = items.filter((item) => item.isDirectory() && item.name.startsWith("."));
                let folders = items.filter((item) => item.isDirectory() && !item.name.startsWith(".")).sort(sortHandler);
                let files = items.filter((item) => item.isFile()).sort(sortHandler);
                setContent(hiddenFolders.concat(folders).concat(files));
            })
            .catch((e) => {
                console.log("Error while reading content: ", e);
            });
    }

    // เพิ่มฟังก์ชันโหลดไฟล์ในโฟลเดอร์ Downloads
    async function loadDownloadsFiles() {
        setContent(null);
        setIsLoadingImages(true);
        console.log('โหลดไฟล์จากโฟลเดอร์ดาวน์โหลดโดยตรง');
        
        try {
            const downloadPath = RNFS.ExternalStorageDirectoryPath + '/Download';
            console.log('ตรวจสอบโฟลเดอร์:', downloadPath);
            
            const exists = await RNFS.exists(downloadPath);
            if (!exists) {
                console.log('ไม่พบโฟลเดอร์ดาวน์โหลด');
                setContent([]);
                setIsLoadingImages(false);
                return;
            }
            
            const items = await RNFS.readDir(downloadPath);
            console.log(`พบไฟล์ในโฟลเดอร์ดาวน์โหลด: ${items.length} รายการ`);
            
            const sortHandler = (a: RNFS.ReadDirItem, b: RNFS.ReadDirItem) => {
                switch (sortType) {
                    case SortType.ALPHABETICAL:
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    case SortType.DATE:
                        return (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0);
                    default:
                        return 0;
                }
            };
            
            let hiddenFolders = items.filter((item) => item.isDirectory() && item.name.startsWith("."));
            let folders = items.filter((item) => item.isDirectory() && !item.name.startsWith(".")).sort(sortHandler);
            let files = items.filter((item) => item.isFile()).sort(sortHandler);
            
            setContent(hiddenFolders.concat(folders).concat(files));
            setIsLoadingImages(false);
            
            // กำหนดฟังก์ชันความจำและการแสดงผลให้เป็นแบบไฟล์ (ไม่ใช่แบบอัลบั้ม)
            setCurrentViewMode(ViewMode.FILES);
            
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการโหลดไฟล์จากโฟลเดอร์ดาวน์โหลด:", error);
            setContent([]);
            setIsLoadingImages(false);
        }
    }

    useEffect(() => {
        // เริ่มตรวจสอบการอนุญาตเมื่อเริ่มต้น
        if (containerType === ContainerType.CATEGORIZED) {
            if (storageName === "Images") {
                console.log('Initial load: Starting image loading process');
                findAllImages();
            } else if (storageName === "Videos") {
                console.log('Initial load: Starting video loading process');
                // ถ้าเป็นแท็บ Videos ให้โหลดวิดีโอทันที
                if (currentTab === 'Videos') {
                    loadAllVideos();
                } 
                // ถ้าเป็นแท็บ Collections ให้สร้างอัลบั้ม
                else if (currentTab === 'Collections') {
                    createVideoAlbums();
                }
            } else if (storageName === "Audio") {
                console.log('Initial load: Starting audio loading process');
                loadAllAudio();
            } else if (storageName === "Documents") {
                console.log('Initial load: Starting documents loading process');
                loadAllDocuments();
            } else if (storageName === "Downloads") {
                console.log('Initial load: Loading downloads directly');
                loadDownloadsFiles();
            }
        } else {
            // กรณีไม่ใช่ categorized container ให้โหลดเนื้อหาตามปกติ
            fetchContent();
        }
        
        const backAction = () => {
            handleGoBack();
            return true; // Prevent default behavior
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

    function updateSortType(type: SortType) {
        if (sortType !== type) {
            setSortType(type);
            console.log('Sort type changed to:', type);
            
            // กรณีแสดงรูปภาพหรืออัลบั้ม
            if (containerType === ContainerType.CATEGORIZED && storageName === "Images") {
                if (currentViewMode === ViewMode.FILES) {
                    // กรณีแสดงรูปภาพทั้งหมด
                    if (content && content.length > 0) {
                        const sortedContent = [...content].sort((a, b) => {
                            switch (type) {
                                case SortType.ALPHABETICAL:
                                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                                case SortType.DATE:
                                    return (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0);
                                default:
                                    return 0;
                            }
                        });
                        setContent(sortedContent);
                    } else {
                        // หากไม่มี content แสดงว่าอาจกำลังโหลดอยู่ จะโหลดใหม่เมื่อมีข้อมูล
                        loadAllImages();
                    }
                } else if (currentViewMode === ViewMode.FOLDERS) {
                    // กรณีแสดงอัลบั้ม
                    if (currentAlbum) {
                        // กำลังอยู่ในอัลบั้ม ให้เรียงรูปภาพในอัลบั้ม
                        loadAlbumImages(currentAlbum.path);
                    } else {
                        // กำลังดูรายการอัลบั้มทั้งหมด
                        const sortedAlbums = [...albums].sort((a, b) => {
                            switch (type) {
                                case SortType.ALPHABETICAL:
                                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                                case SortType.DATE:
                                    // ถ้าไม่มีการเก็บวันที่ของอัลบั้ม ให้เรียงตามจำนวนรูปแทน
                                    return b.count - a.count;
                                default:
                                    return 0;
                            }
                        });
                        setAlbums(sortedAlbums);
                    }
                }
            } else {
                // กรณีอื่นๆ (เช่น แสดงไฟล์ในโฟลเดอร์ทั่วไป)
                fetchContent();
            }
        }
        // ปิด modal หลังจากเลือก sort type
        setSortByOptionVisible(false);
    }
    
    // เพิ่ม useEffect เพื่อติดตามการเปลี่ยนแปลง sortType
    useEffect(() => {
        // เมื่อ sortType เปลี่ยน ให้เรียงลำดับข้อมูลใหม่ตาม type
        if (content && content.length > 0) {
            console.log('Sorting content by:', sortType === SortType.ALPHABETICAL ? 'alphabetical' : 'date');
            const newContent = [...content];
            const sortedContent = newContent.sort((a, b) => {
                switch (sortType) {
                    case SortType.ALPHABETICAL:
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    case SortType.DATE:
                        return (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0);
                    default:
                        return 0;
                }
            });
            // ใช้ JSON.stringify เพื่อตรวจสอบว่าข้อมูลมีการเปลี่ยนแปลงจริงหรือไม่
            if (JSON.stringify(sortedContent.map(item => item.path)) !== JSON.stringify(content.map(item => item.path))) {
                setContent(sortedContent);
            }
        }
    }, [sortType]); // ลบ content ออกจาก dependencies
    
    // เพิ่ม useEffect เพื่อเรียงลำดับอัลบั้มเมื่อ sortType เปลี่ยน
    useEffect(() => {
        if (albums && albums.length > 0 && currentViewMode === ViewMode.FOLDERS) {
            console.log('Sorting albums by:', sortType === SortType.ALPHABETICAL ? 'alphabetical' : 'date/count');
            const newAlbums = [...albums];
            const sortedAlbums = newAlbums.sort((a, b) => {
                switch (sortType) {
                    case SortType.ALPHABETICAL:
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    case SortType.DATE:
                        // เรียงตามจำนวนรูปภาพสำหรับอัลบั้ม (เนื่องจากอัลบั้มไม่มี timestamp)
                        return b.count - a.count;
                    default:
                        return 0;
                }
            });
            // ใช้ JSON.stringify เพื่อตรวจสอบว่าข้อมูลมีการเปลี่ยนแปลงจริงหรือไม่
            if (JSON.stringify(sortedAlbums.map(item => item.path)) !== JSON.stringify(albums.map(item => item.path))) {
                setAlbums(sortedAlbums);
            }
        }
    }, [sortType, currentViewMode]); // ลบ albums ออกจาก dependencies

    function handleSelect(select: boolean, item: RNFS.ReadDirItem) {
        if (select) {
            selectionSet.add(item);
        } else {
            selectionSet.delete(item);
        }
        updateSelectionState({ selectionSet, isSelecting: selectionSet.size > 0 });
    }

    function unselectAll() {
        updateSelectionState({ selectionSet: new Set(), isSelecting: false })
    }

    // จัดการเปิดไฟล์
    function handleOpen(item: RNFS.ReadDirItem): void {
        if (item.isFile()) {
            console.log("Open file", item.name);
            
            // ตรวจสอบว่าเป็นไฟล์ขนาดใหญ่หรือไม่ (มากกว่า 50MB)
            const fileSizeInMB = (item.size || 0) / (1024 * 1024);
            const isLargeFile = fileSizeInMB > 50;
            
            if (isLargeFile) {
                // แสดง Alert เตือนว่าเป็นไฟล์ขนาดใหญ่
                Alert.alert(
                    "ไฟล์ขนาดใหญ่",
                    `ไฟล์นี้มีขนาด ${fileSizeInMB.toFixed(2)} MB ต้องการเปิดหรือไม่?`,
                    [
                        { text: "ยกเลิก", style: "cancel" },
                        { 
                            text: "เปิด", 
                            onPress: () => {
                                // แสดงความคืบหน้าในการโหลดไฟล์
                                progress.startProgress(0, 100, `กำลังโหลด ${item.name}`, 
                                    () => {
                                        console.log("ยกเลิกการโหลดไฟล์");
                                    },
                                    () => {
                                        // เมื่อโหลดเสร็จให้เปิดไฟล์
                                        openLargeFile(item);
                                    }
                                );
                                
                                // จำลองการโหลดไฟล์
                                simulateFileLoading(100, () => {
                                    progress.quitProgress();
                                });
                            } 
                        }
                    ]
                );
            } else {
                // ไฟล์ขนาดปกติ เปิดตามปกติ
            if (getFileType(item) == "text/plain") {
                console.log("Open Text editor", navpath.build());
                const newPath = navpath.clone();
                newPath.push(item.name);
                navigation.navigate("Container", {
                    containerName: storageName,
                    path: newPath,
                    containerType: ContainerType.DEFAULT
                });
            }
            else {
                openWith(item.path, getFileType(item));
                }
            }
        } else if (item.isDirectory()) {
            navpath.nodes.push(item.name);
            console.log("Open directory", navpath.build());
            setNavPath(navpath);
            unselectAll();
            fetchContent();
        }
    }
    
    // ฟังก์ชันจำลองการโหลดไฟล์ขนาดใหญ่
    function simulateFileLoading(steps: number, onComplete: () => void) {
        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            progress.updateProgress(currentStep);
            
            if (currentStep >= steps) {
                clearInterval(interval);
                onComplete();
            }
        }, 50);
    }
    
    // ฟังก์ชันเปิดไฟล์ขนาดใหญ่
    function openLargeFile(item: RNFS.ReadDirItem) {
        try {
            console.log("เปิดไฟล์ขนาดใหญ่:", item.path);
            // ตรวจสอบประเภทไฟล์และส่งไปยังแอพที่เหมาะสม
            openWith(item.path, getFileType(item));
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการเปิดไฟล์ขนาดใหญ่:", error);
            Alert.alert(
                "ไม่สามารถเปิดไฟล์ได้", 
                "ไม่พบแอพที่เหมาะสมสำหรับเปิดไฟล์นี้หรือไฟล์อาจเสียหาย",
                [{ text: "ตกลง" }]
            );
        }
    }
    
    // แสดงขนาดไฟล์ในรูปแบบที่อ่านง่าย
    function formatFileSize(bytes: number | undefined): string {
        if (!bytes) return "0 B";
        
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }

    async function pasteAction(sourcePath: string, destPath: string) {

        if (movingState == null) throw new Error("movingState shouldn't be null!");
        try {
            let finalDestPath = destPath;
            let attempt = 0;
            while (await RNFS.exists(finalDestPath)) {
                attempt += 1;
                let extIdx = destPath.lastIndexOf('.');
                let ext = destPath.slice(extIdx);
                finalDestPath = `${destPath.slice(0, extIdx)} (${attempt})${ext}`;
            }

            console.log("Destination: ", finalDestPath);

            switch (movingState.moveType) {
                case MoveType.COPY:
                    await RNFS.copyFile(sourcePath, finalDestPath);
                    break;
                case MoveType.CUT:
                    await RNFS.moveFile(sourcePath, finalDestPath);
                    break;
            }

            console.log("Done: ", finalDestPath);
        } catch (e) {
            console.log("Error: ", e);
        }
    }

    async function scanItems(items: RNFS.ReadDirItem[], onItemFound?: () => void) {
        let total = 0;
        for (const parent of items) {
            total += 1;
            if (parent.isDirectory()) {
                total += await scanItems(await RNFS.readDir(parent.path), onItemFound);
            }
            if (onItemFound) onItemFound();
        }
        return total;
    }

    async function moveItems(items: RNFS.ReadDirItem[], destPath: Path, onItemDone: () => void) {
        for (const item of items) {
            if (movingState == null) return;

            if (item.isFile()) {
                await pasteAction(item.path, destPath.appendToPath(item.name));
                console.log(movingState.moveType == MoveType.COPY ? "cp" : movingState.moveType == MoveType.CUT ? "mv" : "UNKNOWN", " ", item.path, destPath.appendToPath(item.name));
            } else if (item.isDirectory()) {
                let newDestPath = destPath.clone();
                newDestPath.push(item.name);

                let newDestPathBuilt = newDestPath.build();

                if (!await RNFS.exists(newDestPathBuilt)) {
                    console.log("mkdir ", newDestPathBuilt);
                    await RNFS.mkdir(newDestPathBuilt);
                }

                let innerItems = await RNFS.readDir(item.path);
                await moveItems(innerItems, newDestPath, onItemDone);

                if (movingState.moveType == MoveType.CUT) {
                    let popCount = await scanItems([item]) - 1;
                    if (popCount > 0) {
                        throw new Error(`The directory "${item.path}" is not empty after processing. ${popCount} items remain.`);
                    }
                    console.log("rm ", item.path);
                    await RNFS.unlink(item.path);
                }
            }
            onItemDone();
        }
    }


    async function deleteItems(items: RNFS.ReadDirItem[], onItemDone?: () => void) {
        if (deleteCancelledRef.current) return;
        
        // ใช้ฟังก์ชัน getRecycleBinPath เพื่อหาเส้นทางถังขยะ
        const recycleBinPath = await getRecycleBinPath();
        
        // หากไม่พบถังขยะหรือไม่สามารถสร้างได้ในทุกตัวเลือก ลบไฟล์ถาวร
        if (!recycleBinPath) {
            console.error("ไม่สามารถเข้าถึงหรือสร้างถังขยะได้ ลบไฟล์ถาวร");
            for (const item of items) {
                if (deleteCancelledRef.current) return;
                if (item.isFile()) {
                    console.log(`ลบไฟล์ถาวร (ไม่มีถังขยะ): ${item.path}`);
                    await RNFS.unlink(item.path);
                } else if (item.isDirectory()) {
                    await deleteItems(await RNFS.readDir(item.path));
                    console.log(`ลบโฟลเดอร์ถาวร (ไม่มีถังขยะ): ${item.path}`);
                    await RNFS.unlink(item.path);
                }
                if (onItemDone) onItemDone();
            }
            return;
        }
        
        const currentTime = new Date().getTime();
        
        for (const item of items) {
            if (deleteCancelledRef.current) return;
            
            try {
                const fileName = item.name;
                const fileExt = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
                const fileBaseName = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
                
                // สร้างชื่อไฟล์ใหม่ที่มีเวลาลบและชื่อจริงของไฟล์
                const recycleName = `${fileBaseName}_${currentTime}${fileExt}`;
                const recyclePath = `${recycleBinPath}/${recycleName}`;
                
                // ข้อมูลเมตาที่จะบันทึกเพิ่มเติม (เช่น พาธต้นทาง, เวลาที่ลบ, ฯลฯ)
                const metaData = {
                    originalPath: item.path,
                    originalName: fileName,
                    deletedAt: currentTime,
                    expireAt: currentTime + (30 * 24 * 60 * 60 * 1000), // หมดอายุใน 30 วัน
                    isFile: item.isFile(),
                    isDirectory: item.isDirectory(),
                    size: item.size,
                    mtime: item.mtime?.getTime()
                };
                
                // บันทึกข้อมูลเมตาลงในไฟล์ .meta
                const metaPath = `${recycleBinPath}/${recycleName}.meta`;
                
                try {
                    await RNFS.writeFile(metaPath, JSON.stringify(metaData), 'utf8');
                    console.log(`บันทึกไฟล์ meta สำเร็จ: ${metaPath}`);
                } catch (writeError) {
                    console.error(`ไม่สามารถเขียนไฟล์ meta: ${metaPath}`, writeError);
                    throw writeError; // ถ้าเขียนไฟล์ meta ไม่ได้ ให้ลบแบบถาวรแทน
                }
                
                if (item.isFile()) {
                    console.log(`ย้ายไฟล์ไปยังถังขยะ: ${item.path} -> ${recyclePath}`);
                    await RNFS.moveFile(item.path, recyclePath);
                } else if (item.isDirectory()) {
                    // กรณีเป็นโฟลเดอร์ ลบโฟลเดอร์ย่อยก่อน
                    const subItems = await RNFS.readDir(item.path);
                    await deleteItems(subItems, onItemDone);
                    
                    console.log(`ย้ายโฟลเดอร์ไปยังถังขยะ: ${item.path} -> ${recyclePath}`);
                    await RNFS.moveFile(item.path, recyclePath);
                }
            } catch (error) {
                console.error(`เกิดข้อผิดพลาดในการย้ายไฟล์ไปยังถังขยะ: ${item.path}`, error);
                // ถ้าย้ายไปถังขยะไม่ได้ ลบแบบถาวร
                try {
                    if (item.isFile()) {
                        console.log(`ลบไฟล์ถาวรแทน: ${item.path}`);
                        await RNFS.unlink(item.path);
                    } else if (item.isDirectory()) {
                        const subItems = await RNFS.readDir(item.path);
                        for (const subItem of subItems) {
                            if (subItem.isFile()) {
                                await RNFS.unlink(subItem.path);
                            }
                        }
                        console.log(`ลบโฟลเดอร์ถาวรแทน: ${item.path}`);
                        await RNFS.unlink(item.path);
                    }
                } catch (unlinkError) {
                    console.error(`ไม่สามารถลบไฟล์ถาวร: ${item.path}`, unlinkError);
                }
            }
            
            if (onItemDone) onItemDone();
        }
    }

    async function handlePasteAction() {
        if (movingState == null) {
            throw new Error("movingState shouldn't be null!");
        }

        progress.startProgress(0, -1, "Scanning for items", () => {
            console.log("Canceled");
            setMovingState(null);
        }, () => {});

        let items = await scanItems(movingState.items, progress.incrementProgress);
        progress.quitProgress();

        progress.startProgress(0, items, "Moving items", () => {
            console.log("Canceled");
            setMovingState(null);
        }, () => {});

        let destPath = navpath.clone();

        try {
            await moveItems(movingState.items, destPath, progress.incrementProgress);
        } catch (error) {
            console.log("Error moving items: ", error);
        }

        fetchContent();
        setMovingState(null);
    }

    async function handleDeleteAction() {
        if (selectionSet.size === 0) {
            throw new Error("No items selected for deletion.");
        }
        deleteCancelledRef.current = false;

        const itemsToDelete = Array.from(selectionSet);
        const foldersCount = itemsToDelete.filter((item) => item.isDirectory()).length;
        const filesCount = itemsToDelete.filter((item) => item.isFile()).length;

        function getDeleteMessage(foldersCount: number, filesCount: number) {
            if (foldersCount > 0 && filesCount > 0) {
                return `${foldersCount} folder(s) and ${filesCount} file(s)?`;
            } else if (foldersCount > 0) {
                return `${foldersCount} folder(s)?`;
            } else if (filesCount > 0) {
                return `${filesCount} file(s)?`;
            } else {
                return "[how is this even possible]?";
            }
        }

        Alert.alert(
            "Delete Items",
            "Are you sure you want to delete " 
            + getDeleteMessage(foldersCount, filesCount),[
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        progress.startProgress(0, foldersCount + filesCount, "Deleting items", () => {deleteCancelledRef.current = true}, () => {});
                        try {
                            console.log("--------------DELETION BEGIN--------------");
                            await deleteItems(itemsToDelete, progress.incrementProgress);
                            console.log("--------------DELETION END--------------");
                        } catch (error) {
                            console.error("Error deleting items:", error);
                        }
                        fetchContent();
                    },
                }
            ]
        );

        unselectAll();
    }

    async function handleRename(item: RNFS.ReadDirItem, newName: string) {
        try {
            const sourcePath = item.path;
            const destPath = navpath.appendToPath(newName);

            if (await RNFS.exists(destPath)) {
                Alert.alert("Already Exists!", `An item with the name "${newName}" already exists!`, [{ text: "Dismiss" }]);
                return;
            }

            await RNFS.moveFile(sourcePath, destPath);

            console.log(`Renamed: ${sourcePath} -> ${destPath}`);
            fetchContent();
        } catch (error) {
            console.error("Error renaming item:", error);
        }
    }

    function openRenameModal(item: RNFS.ReadDirItem) {
        setRenameItem(item);
        setNewName(item.name);
        setRenameModalVisible(true);
    }

    function closeRenameModal() {
        setRenameModalVisible(false);
        setRenameItem(null);
        setNewName("");
    }

    function confirmRename() {
        if (renameItem && newName) {
            handleRename(renameItem, newName);
            closeRenameModal();
        }
    }

    return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar backgroundColor={theme.background}/>
        <View style={{ flex: 1 }}>
            {//Toolbar 1
                !isSelecting
                    //Default Mode
                    ? <Toolbar navigation={navigation} containerName={storageName}
                        goBackHandler={() => handleGoBack()}
                        sortByHandler={() => setSortByOptionVisible(true)}
                        createHandler={containerType == ContainerType.DEFAULT ? () => setItemCreatorVisible(true) : undefined}
                    />
                    //Selection Mode
                    : <SelectionToolBar
                        onCancel={unselectAll}
                        onSelectAll={() => {
                            if (content) {
                                if (selectionSet.size == content.length) {
                                    unselectAll();
                                } else {
                                    for (const item of content) {
                                        selectionSet.add(item);
                                    }
                                    updateSelectionState({ selectionSet, isSelecting: selectionSet.size > 0 });
                                }
                            }
                        }}
                        count={selectionSet.size}
                        maxCount={(content ?? []).length}
                    />
            }
            {//Toolbar 2
                containerType == ContainerType.DEFAULT
                    ? <PathDisplayer navpath={navpath} />//Display path
                        : storageName === "Videos" ? (
                            // แท็บสำหรับวิดีโอ
                            <View style={{ 
                                flexDirection: 'row', 
                                backgroundColor: '#f8f8f8', 
                                borderRadius: 30, 
                                overflow: 'hidden',
                                margin: 10,
                                elevation: 3,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.22,
                                shadowRadius: 2.22,
                                borderWidth: 0.5,
                                borderColor: '#e0e0e0',
                                padding: 4
                            }}>
                                <TouchableOpacity 
                                    style={{ 
                                        flex: 1, 
                                        backgroundColor: currentTab === 'Videos' ? '#FFFFFF' : 'transparent',
                                        paddingVertical: 12,
                                        paddingHorizontal: 5,
                                        alignItems: 'center',
                                        borderRadius: 25,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => switchTab('Videos')}
                                >
                                    <MaterialIcons 
                                        name="videocam" 
                                        size={18} 
                                        color={currentTab === 'Videos' ? '#2196F3' : '#757575'} 
                                        style={{marginRight: 6}}
                                    />
                                    <Text style={{ 
                                        fontWeight: currentTab === 'Videos' ? 'bold' : 'normal',
                                        color: currentTab === 'Videos' ? '#2196F3' : '#757575',
                                        fontSize: 15
                                    }}>Videos</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={{ 
                                        flex: 1, 
                                        backgroundColor: currentTab === 'Collections' ? '#FFFFFF' : 'transparent',
                                        paddingVertical: 12,
                                        paddingHorizontal: 5,
                                        alignItems: 'center',
                                        borderRadius: 25,
                                        flexDirection: 'row',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => switchTab('Collections')}
                                >
                                    <MaterialIcons 
                                        name="collections" 
                                        size={18} 
                                        color={currentTab === 'Collections' ? '#2196F3' : '#757575'} 
                                        style={{marginRight: 6}}
                                    />
                                    <Text style={{ 
                                        fontWeight: currentTab === 'Collections' ? 'bold' : 'normal',
                                        color: currentTab === 'Collections' ? '#2196F3' : '#757575',
                                        fontSize: 15
                                    }}>Collections</Text>
                                </TouchableOpacity>
                            </View>
                        ) : storageName === "Audio" || storageName === "Downloads" ? (
                            // ไม่แสดงแถบชื่อสำหรับหน้าเสียงและดาวน์โหลด
                            null
                        ) : <ItemViewModeSelection 
                        fileType={currentFileType}
                        initialMode={currentViewMode}
                        onChange={(mode) => {//Display Viewing Options
                            console.log('Changing view mode to:', mode);
                            setCurrentViewMode(mode);
                            if (mode === ViewMode.FOLDERS) {
                                setCurrentAlbum(null);
                                createAlbums();
                            } else {
                                loadAllImages();
                            }
                            unselectAll();
                        }} 
                      />
            }

            {/* Content is displayed here */}
            <View style={{ margin: 10, flex: 1, backgroundColor: theme.background }}>
                <ContentList content={content} handleOpen={handleOpen} handleSelect={handleSelect} selectionSet={selectionSet} />
            </View>
        </View>

        <SelectionBottomBar 
            selectionSet={selectionSet}
        isSelecting={selectionSet.size > 0} 
        isMoving={movingState != null} 
        isPasteLocationValid={movingState?.sourceDir.build() != navpath.build()}
            copyActionHandler={function (): void {
                let itemArray = Array.from(selectionSet);

                setMovingState({
                    sourceDir: navpath.clone(),
                    moveType: MoveType.COPY,
                    items: itemArray,
                });

                unselectAll();
                    }} 
                    moveActionHandler={function (): void {
                let itemArray = Array.from(selectionSet);

                setMovingState({
                    sourceDir: navpath.clone(),
                    moveType: MoveType.CUT,
                    items: itemArray,
                });

                unselectAll();
                    }} 
                    renameActionHandler={function (): void {
                if (selectionSet.size !== 1) {
                    throw new Error("Selection Set has more than element!");
                }

                const itemToRename = Array.from(selectionSet)[0];
                openRenameModal(itemToRename);
                unselectAll();
            }} deleteActionHandler={
                handleDeleteAction
            } pasteCancelActionHandler={function (): void {
                setMovingState(null);
                    }} 
                    pasteActionHandler={() => handlePasteAction().catch((reason) => { throw new Error(reason) })}
        />

        <Modal visible={sortByOptionVisible} transparent={true} onRequestClose={() => setSortByOptionVisible(false)} animationType="slide">
            <TouchableOpacity 
                style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                activeOpacity={1} 
                onPress={() => setSortByOptionVisible(false)}
            >
                <View 
                    style={{ 
                        backgroundColor: 'white', 
                        borderTopLeftRadius: 20, 
                        borderTopRightRadius: 20,
                        paddingVertical: 20
                    }}
                >
                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>เรียงลำดับตาม</Text>
                        <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginTop: 10 }} />
                    </View>
                    
                    <TouchableOpacity
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            paddingVertical: 12, 
                            paddingHorizontal: 20,
                            backgroundColor: sortType === SortType.ALPHABETICAL ? '#f0f0f0' : 'transparent'
                        }}
                        onPress={() => {
                            updateSortType(SortType.ALPHABETICAL);
                        }}
                    >
                        <FontAwesome name="sort-alpha-asc" size={24} color="#007AFF" style={{ marginRight: 20 }} />
                        <Text style={{ fontSize: 16, color: '#333' }}>เรียงตามชื่อ (A-Z)</Text>
                        {sortType === SortType.ALPHABETICAL && (
                            <MaterialIcons name="check" size={24} color="#007AFF" style={{ marginLeft: 'auto' }} />
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            paddingVertical: 12, 
                            paddingHorizontal: 20,
                            backgroundColor: sortType === SortType.DATE ? '#f0f0f0' : 'transparent'
                        }}
                        onPress={() => {
                            updateSortType(SortType.DATE);
                        }}
                    >
                        <MaterialIcons name="access-time" size={24} color="#FF9500" style={{ marginRight: 20 }} />
                        <Text style={{ fontSize: 16, color: '#333' }}>เรียงตามวันที่ (ล่าสุด)</Text>
                        {sortType === SortType.DATE && (
                            <MaterialIcons name="check" size={24} color="#007AFF" style={{ marginLeft: 'auto' }} />
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>

        <Modal visible={renameModalVisible} transparent={true} onRequestClose={closeRenameModal}>
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 30 }}>
                <View style={{ padding: 15, backgroundColor: 'white', borderRadius: 5 }}>
                    <Text style={{ fontSize: 20, paddingBottom: 10 }}>Rename Item</Text>
                    <TextInput
                        style={{
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#ddd',
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            fontSize: 17,
                            backgroundColor: '#fff',
                        }}
                        value={newName}
                        placeholder="Enter new name"
                        onChangeText={setNewName}
                    />

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', paddingTop: 10, justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: '#6C757D', marginRight: 5, padding: 10, alignItems: 'center', borderRadius: 5 }}
                            onPress={closeRenameModal}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                    </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: newName == "" ? '#6C757D' : '#007BFF', marginLeft: 5, padding: 10, alignItems: 'center', borderRadius: 5 }}
                            onPress={confirmRename}
                            disabled={newName == ""}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Rename</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

        <ProgressBar />

        <ItemCreator enabled={itemCreatorVisible} currentPath={navpath}
            onCreationCanceled={() => {
                setItemCreatorVisible(false);
            }}
            onCreationDone={() => {
                setItemCreatorVisible(false);
                fetchContent();
            }}
        />
            </View>
        </SafeAreaView>
    );
}

export default ContentContainer;