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


import BottomBarOptions from "../components/ContentContainer/BottomBarOptions";
import ContentList from "../components/ContentContainer/ContentList";
import SelectionBottomBar from "../components/ContentContainer/SelectionBottomBar";
import ItemCreator from "../components/ContentContainer/ItemCreator";
import { ContainerType, ContentContainerRouteParams, MoveType, MovingState, SortType, ViewMode } from "../components/ContentContainer/common";
import ItemViewModeSelection from "../components/ContentContainer/ItemViewModeSelection";
import { getFileType, openWith } from "../utils/openWith";
import { useProgress } from "../components/ProgressBar/ProgressContext";
import ProgressBar from "../components/ProgressBar/ProgressBar";

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

export function ContentContainer({ navigation }: NativeStackScreenProps<RootStackParamList>) {

    const route = useRoute();
    const routeParams = route.params as ContentContainerRouteParams;
    const storageName = routeParams.containerName;
    const containerType = routeParams.containerType;

    const [{ selectionSet, isSelecting }, updateSelectionState] = useState<{ selectionSet: Set<RNFS.ReadDirItem>, isSelecting: boolean }>({ selectionSet: new Set(), isSelecting: false });
    const [movingState, setMovingState] = useState<MovingState | null>(null);

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
            .catch(() => {
                console.log("An error occured");
            });
    }

    useEffect(() => {
        // เริ่มตรวจสอบการอนุญาตเมื่อเริ่มต้น
        if (containerType === ContainerType.CATEGORIZED && storageName === "Images") {
            console.log('Initial load: Starting image loading process');
            findAllImages();
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

    function handleOpen(item: RNFS.ReadDirItem): void {
        if (item.isFile()) {
            console.log("Open file", item.name);
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
        } else if (item.isDirectory()) {
            navpath.nodes.push(item.name);
            console.log("Open directory", navpath.build());
            setNavPath(navpath);
            unselectAll();
            fetchContent();
        }
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
        for (const item of items) {
            if (deleteCancelledRef.current) return;
            if (item.isFile()) {
                console.log(`Deleting file: ${item.path}`);
                await RNFS.unlink(item.path);
            } else if (item.isDirectory()) {
                await deleteItems(await RNFS.readDir(item.path));
                console.log(`Deleting directory: ${item.path}`);
                await RNFS.unlink(item.path);
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

    // ฟังก์ชันสำหรับการโหลดรูปภาพทั้งหมด
    async function findAllImages() {
        if (storageName === "Videos") {
            await loadAllVideos();
            return;
        }
        
        // ตรวจสอบสิทธิ์ก่อนค้นหารูปภาพ
        const hasPermission = await checkStoragePermission();
        if (!hasPermission) {
            const permissionRequested = await requestStoragePermission();
            if (!permissionRequested) {
                // ถ้าไม่อนุญาต ให้แสดง content เป็น array ว่าง
                setContent([]);
                return;
            }
        }
        
        console.log('Finding images in mode:', currentViewMode, 'Album:', currentAlbum);
        
        // สำหรับ Images หมวดหมู่ ให้เริ่มต้นที่โหมด Photos (FILES) เสมอ
        if (storageName === "Images" && containerType === ContainerType.CATEGORIZED) {
            setCurrentViewMode(ViewMode.FILES);
        }
        
        if (currentViewMode === ViewMode.FOLDERS && !currentAlbum) {
            // ถ้ามีแคชอยู่แล้ว ให้ใช้แคชเพื่อไม่ต้องโหลดอัลบั้มซ้ำๆ
            if (albumsCache.length > 0) {
                console.log('findAllImages: Using cached albums');
                setAlbums(albumsCache);
                setIsLoadingAlbums(false);
                
                // ตรวจสอบว่าควรอัปเดตแคชหรือไม่
                const currentTime = Date.now();
                if (currentTime - lastAlbumUpdateTime > 600000) { // 10 นาทีขึ้นไป
                    console.log('Cache is older than 10 minutes, will update later');
                    setTimeout(() => {
                        updateAlbumsCache();
                    }, 2000);
                }
            } else {
                // โหลดอัลบั้ม (ถ้าไม่มีแคช)
                createAlbums();
            }
        } else if (currentAlbum) {
            // โหลดรูปภาพในอัลบั้มที่เลือก
            loadAlbumImages(currentAlbum.path);
        } else {
            // โหลดรูปภาพทั้งหมด
            loadAllImages();
        }
    }

    // ตรวจสอบการขออนุญาตเข้าถึงพื้นที่จัดเก็บข้อมูล
    async function checkStoragePermission() {
        try {
            if (Platform.OS === 'android') {
                if (Platform.Version >= 33) {
                    if (storageName === "Videos") {
                        const granted = await PermissionsAndroid.check(
                            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
                        );
                        setHasPermission(granted);
                        return granted;
                    } else {
                        const granted = await PermissionsAndroid.check(
                            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                        );
                        setHasPermission(granted);
                        return granted;
                    }
                } else {
                    const granted = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                    );
                    setHasPermission(granted);
                    return granted;
                }
            }
            return true;
        } catch (error) {
            console.error("Error checking permissions:", error);
            setHasPermission(false);
            return false;
        }
    }

    // ขออนุญาตเข้าถึงพื้นที่จัดเก็บข้อมูล
    async function requestStoragePermission() {
        try {
            if (Platform.OS === 'android') {
                if (Platform.Version >= 33) {
                    if (storageName === "Videos") {
                        const granted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                            {
                                title: "Video Permission",
                                message: "This app needs access to your videos.",
                                buttonNeutral: "Ask Me Later",
                                buttonNegative: "Cancel",
                                buttonPositive: "OK"
                            }
                        );
                        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
                        setHasPermission(isGranted);
                        return isGranted;
                    } else {
                        const granted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                            {
                                title: "Photos Permission",
                                message: "This app needs access to your photos.",
                                buttonNeutral: "Ask Me Later",
                                buttonNegative: "Cancel",
                                buttonPositive: "OK"
                            }
                        );
                        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
                        setHasPermission(isGranted);
                        return isGranted;
                    }
                } else {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        {
                            title: "Storage Permission",
                            message: "This app needs access to your storage.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );
                    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
                    setHasPermission(isGranted);
                    return isGranted;
                }
            }
            return true;
        } catch (error) {
            console.error("Error requesting permissions:", error);
            setHasPermission(false);
            return false;
        }
    }

    // ฟังก์ชันช่วยกรองไฟล์ตามประเภทที่กำลังแสดง
    const filterFileByCurrentType = (extension: string): boolean => {
        switch (currentFileType) {
            case 'images':
                return IMAGE_EXTENSIONS.includes(extension.toLowerCase());
            case 'videos':
                return VIDEO_EXTENSIONS.includes(extension.toLowerCase());
            case 'audio':
                return AUDIO_EXTENSIONS.includes(extension.toLowerCase());
            case 'documents':
                return DOCUMENT_EXTENSIONS.includes(extension.toLowerCase());
            case 'all':
            default:
                return ALL_SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
        }
    };

    // ฟังก์ชันส่งคืนชื่อที่แสดงของประเภทไฟล์ปัจจุบัน
    const getFileTypeDisplayName = (): string => {
        switch (currentFileType) {
            case 'images':
                return 'image';
            case 'videos':
                return 'video';
            case 'audio':
                return 'audio';
            case 'documents':
                return 'document';
            case 'all':
            default:
                return 'media';
        }
    };

    // เพิ่มฟังก์ชัน loadAllImages ใหม่
    async function loadAllImages() {
        setContent(null); // รีเซ็ตข้อมูลเดิมก่อนเริ่มค้นหา
        setIsLoadingImages(true);
        
        try {
            // ค้นหาจากที่อยู่ที่มักจะมีไฟล์มีเดีย
            const baseDirs = [
                RNFS.ExternalStorageDirectoryPath + '/DCIM',
                RNFS.ExternalStorageDirectoryPath + '/DCIM/Camera',
                RNFS.ExternalStorageDirectoryPath + '/Pictures',
                RNFS.ExternalStorageDirectoryPath + '/Pictures/Screenshots',
                RNFS.ExternalStorageDirectoryPath + '/Download',
                RNFS.ExternalStorageDirectoryPath + '/Music',
                RNFS.ExternalStorageDirectoryPath + '/Movies',
                RNFS.ExternalStorageDirectoryPath + '/Documents',
                RNFS.DocumentDirectoryPath,
                RNFS.CachesDirectoryPath,
            ];
            
            let allFiles: RNFS.ReadDirItem[] = [];
            
            // สแกนไดเร็กทอรี่แบบไม่ลึกมาก
            for (const baseDir of baseDirs) {
                try {
                    // ตรวจสอบว่าไดเร็กทอรีมีอยู่จริง
                    const exists = await RNFS.exists(baseDir);
                    if (!exists) continue;
                    
                    console.log(`Scanning directory: ${baseDir}`);
                    const items = await RNFS.readDir(baseDir);
                    
                    // หาไฟล์ในระดับบนสุด
                    for (const item of items) {
                        if (item.isFile()) {
                            const extension = item.path.toLowerCase().substring(item.path.lastIndexOf('.'));
                            if (filterFileByCurrentType(extension)) {
                                allFiles.push(item);
                            }
                        }
                    }
                    
                    // หาไฟล์ในระดับลึกลงไปอีก 1 ระดับ
                    for (const item of items) {
                        if (item.isDirectory() && !item.name.startsWith('.')) {
                            try {
                                const subItems = await RNFS.readDir(item.path);
                                for (const subItem of subItems) {
                                    if (subItem.isFile()) {
                                        const extension = subItem.path.toLowerCase().substring(subItem.path.lastIndexOf('.'));
                                        if (filterFileByCurrentType(extension)) {
                                            allFiles.push(subItem);
                                        }
                                    }
                                }
                            } catch (error) {
                                console.log(`Error reading subdirectory: ${item.path}`, error);
                            }
                        }
                    }
                    
                    // แสดงไฟล์ที่พบบางส่วนทันทีถ้ามีมากกว่า 20 ไฟล์
                    if (allFiles.length > 20 && content === null) {
                        // เรียงตามวันที่
                        const sortedFiles = [...allFiles].sort((a, b) => 
                            (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0)
                        );
                        setContent(sortedFiles);
                    }
                } catch (error) {
                    console.log(`Error scanning directory ${baseDir}:`, error);
                }
            }
            
            // แสดงผลลัพธ์สุดท้าย
            if (allFiles.length > 0) {
                // เรียงตาม sortType ปัจจุบัน แทนที่จะเรียงตามวันที่เสมอ
                allFiles.sort((a, b) => {
                    switch (sortType) {
                        case SortType.ALPHABETICAL:
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                        case SortType.DATE:
                        default:
                            return (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0);
                    }
                });
                
                // จำกัดจำนวนไฟล์ที่แสดง
                const limitedFiles = allFiles.slice(0, 300);
                setContent(limitedFiles);
                console.log(`Found ${allFiles.length} files, displaying ${limitedFiles.length}, sorted by ${sortType === SortType.ALPHABETICAL ? 'alphabetical' : 'date'}`);
            } else {
                setContent([]);
                Alert.alert("No Files Found", `Could not find any ${getFileTypeDisplayName()} files on your device. Please check storage permissions.`);
            }
            
            setIsLoadingImages(false);
        } catch (error) {
            console.error("Error finding files:", error);
            Alert.alert("Error", "Failed to search for files on device");
            setContent([]);
            setIsLoadingImages(false);
        }
    }

    // ฟังก์ชันสร้างอัลบั้มให้เร็วขึ้น
    async function createAlbums() {
        console.log('Creating albums...');
        setIsLoadingAlbums(true);
        
        // ตรวจสอบแคชก่อน
        if (albumsCache.length > 0) {
            console.log('Using cached albums:', albumsCache.length);
            setAlbums(albumsCache);
            setIsLoadingAlbums(false);
            
            // อัปเดตแคชในพื้นหลังหลังจากผ่านไป 10 นาที (600,000 ms)
            const currentTime = Date.now();
            if (currentTime - lastAlbumUpdateTime > 600000) {
                console.log('Cache is older than 10 minutes, updating...');
                setTimeout(() => {
                    updateAlbumsCache();
                }, 1000);
            }
            return;
        }
        
        try {
            // โฟลเดอร์หลักที่มักมีรูปภาพ
            const mainImageDirectories = [
                { path: RNFS.ExternalStorageDirectoryPath + '/DCIM/Camera', name: 'Camera' },
                { path: RNFS.ExternalStorageDirectoryPath + '/Pictures/Screenshots', name: 'Screenshots' },
                { path: RNFS.ExternalStorageDirectoryPath + '/DCIM', name: 'DCIM' },
                { path: RNFS.ExternalStorageDirectoryPath + '/Pictures', name: 'Pictures' },
                { path: RNFS.ExternalStorageDirectoryPath + '/Download', name: 'Downloads' },
                // เพิ่มไดเร็กทอรีอื่นๆ ที่อาจมีรูปภาพ
                { path: RNFS.DocumentDirectoryPath, name: 'Documents' },
                { path: RNFS.CachesDirectoryPath, name: 'Cache' }
            ];
            
            let newAlbums: AlbumItem[] = [];
            
            // สร้างอัลบั้มสำหรับโฟลเดอร์หลัก
            for (const dir of mainImageDirectories) {
                try {
                    if (await RNFS.exists(dir.path)) {
                        console.log(`Checking directory: ${dir.path}`);
                        // ตรวจสอบจำนวนรูปในโฟลเดอร์
                        const items = await RNFS.readDir(dir.path).catch(() => []);
                        const images = items.filter(item => {
                            if (item.isFile()) {
                                const extension = item.path.toLowerCase().substring(item.path.lastIndexOf('.'));
                                return filterFileByCurrentType(extension);
                            }
                            return false;
                        });
             
                        if (images.length > 0) {
                            console.log(`Found album: ${dir.name} with ${images.length} images`);
                            // สร้างข้อมูลอัลบั้ม
                            newAlbums.push({
                                name: dir.name,
                                path: dir.path,
                                count: images.length,
                                thumbnail: images[0]?.path || null
                            });
                            
                            // แสดงผลทันทีเมื่อมีข้อมูลบางส่วน
                            if (newAlbums.length >= 2 && albums.length === 0) {
                                setAlbums([...newAlbums]);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`Error checking directory ${dir.path}:`, error);
                }
            }
            
            // เพิ่มอัลบั้มสำหรับรูปภาพทั้งหมด
            const totalImagesCount = newAlbums.reduce((total, album) => total + album.count, 0);
            if (totalImagesCount > 0) {
                newAlbums.unshift({
                    name: "All Photos",
                    path: "all",
                    count: totalImagesCount,
                    thumbnail: newAlbums[0]?.thumbnail || null
                });
            }
            
            setAlbums(newAlbums);
            setAlbumsCache(newAlbums);
            setLastAlbumUpdateTime(Date.now());
            setIsLoadingAlbums(false);
        } catch (error) {
            console.error("Error creating albums:", error);
            setIsLoadingAlbums(false);
            setAlbums([]);
        }
    }

    // อัปเดตแคชอัลบั้มในพื้นหลัง
    async function updateAlbumsCache() {
        try {
            // อัปเดตเวลาล่าสุดที่มีการอัปเดตแคช
            setLastAlbumUpdateTime(Date.now());
            createAlbums();
        } catch (error) {
            console.error("Error updating albums cache:", error);
        }
    }

    // เพิ่มฟังก์ชัน loadAlbumImages
    async function loadAlbumImages(albumPath: string) {
        if (albumPath === 'all') {
            // กรณีเลือก "All Photos" ให้แสดงรูปทั้งหมด
            loadAllImages();
            return;
        }
        
        setContent(null);
        setIsLoadingImages(true);
        
        try {
            // ตรวจสอบว่าไดเร็กทอรีมีอยู่จริง
            const exists = await RNFS.exists(albumPath);
            if (!exists) {
                setContent([]);
                setIsLoadingImages(false);
                return;
            }
            
            // อ่านรูปภาพในอัลบั้ม
            const items = await RNFS.readDir(albumPath);
            const images = items.filter(item => {
                if (item.isFile()) {
                    const extension = item.path.toLowerCase().substring(item.path.lastIndexOf('.'));
                    return filterFileByCurrentType(extension);
                }
                return false;
            });
            
            // เรียงตาม sortType ปัจจุบัน
            images.sort((a, b) => {
                switch (sortType) {
                    case SortType.ALPHABETICAL:
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    case SortType.DATE:
                    default:
                        return (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0);
                }
            });
            
            setContent(images);
            setIsLoadingImages(false);
        } catch (error) {
            console.error("Error loading album images:", error);
            setContent([]);
            setIsLoadingImages(false);
        }
    }

    // กลับไปหน้าอัลบั้ม
    const goBackToAlbums = () => {
        setCurrentAlbum(null);
        setContent(null);
        createAlbums();
    };

    function handleGoBack() {
        if (containerType === ContainerType.CATEGORIZED && 
            storageName === "Images" && 
            currentAlbum) {
            // กลับไปหน้าอัลบั้ม
            goBackToAlbums();
            return;
        }
        
        if (navpath.nodes.length == 0) {
            navigation.goBack();
            return;
        }
        navpath.nodes.pop();
        console.log("new path: ", navpath.build());
        setNavPath(navpath);
        unselectAll();
        fetchContent();
    }

    // เพิ่มฟังก์ชัน loadAllVideos
    async function loadAllVideos() {
        setContent(null);
        setIsLoadingImages(true);
        
        try {
            // เพิ่มโฟลเดอร์ที่มักจะมีวิดีโอ
            const baseDirs = [
                RNFS.ExternalStorageDirectoryPath + '/DCIM/Camera',
                RNFS.ExternalStorageDirectoryPath + '/DCIM',
                RNFS.ExternalStorageDirectoryPath + '/Movies',
                RNFS.ExternalStorageDirectoryPath + '/Download',
                RNFS.ExternalStorageDirectoryPath + '/WhatsApp/Media/WhatsApp Video',
                RNFS.ExternalStorageDirectoryPath + '/Telegram/Telegram Video',
                RNFS.ExternalStorageDirectoryPath + '/Pictures/Messenger',
                RNFS.ExternalStorageDirectoryPath + '/Android/media',
                RNFS.ExternalStorageDirectoryPath + '/Video',
                RNFS.ExternalStorageDirectoryPath + '/Videos'
            ];
            
            let allFiles: RNFS.ReadDirItem[] = [];
            
            // สแกนไดเร็กทอรี่
            for (const baseDir of baseDirs) {
                try {
                    console.log('Checking directory:', baseDir);
                    const exists = await RNFS.exists(baseDir);
                    if (!exists) {
                        console.log('Directory does not exist:', baseDir);
                        continue;
                    }
                    
                    console.log('Reading directory:', baseDir);
                    const items = await RNFS.readDir(baseDir);
                    console.log(`Found ${items.length} items in ${baseDir}`);
                    
                    // หาไฟล์วิดีโอในระดับบนสุด
                    for (const item of items) {
                        if (item.isFile()) {
                            const extension = item.path.toLowerCase().substring(item.path.lastIndexOf('.'));
                            if (VIDEO_EXTENSIONS.includes(extension)) {
                                console.log('Found video:', item.path);
                                allFiles.push(item);
                            }
                        }
                    }
                    
                    // หาไฟล์วิดีโอในโฟลเดอร์ย่อย
                    for (const item of items) {
                        if (item.isDirectory() && !item.name.startsWith('.')) {
                            try {
                                const subItems = await RNFS.readDir(item.path);
                                for (const subItem of subItems) {
                                    if (subItem.isFile()) {
                                        const extension = subItem.path.toLowerCase().substring(subItem.path.lastIndexOf('.'));
                                        if (VIDEO_EXTENSIONS.includes(extension)) {
                                            console.log('Found video in subfolder:', subItem.path);
                                            allFiles.push(subItem);
                                        }
                                    }
                                }
                            } catch (error) {
                                console.log(`Error reading subfolder: ${item.path}`, error);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`Error scanning directory ${baseDir}:`, error);
                }
            }
            
            console.log(`Total videos found: ${allFiles.length}`);
            
            if (allFiles.length > 0) {
                allFiles.sort((a, b) => {
                    switch (sortType) {
                        case SortType.ALPHABETICAL:
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                        case SortType.DATE:
                        default:
                            return (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0);
                    }
                });
                
                setContent(allFiles);
                console.log(`Displaying ${allFiles.length} videos`);
            } else {
                setContent([]);
                Alert.alert("ไม่พบวิดีโอ", "ไม่พบไฟล์วิดีโอในอุปกรณ์ของคุณ กรุณาตรวจสอบสิทธิ์การเข้าถึง");
            }
            
            setIsLoadingImages(false);
        } catch (error) {
            console.error("Error finding videos:", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถค้นหาวิดีโอในอุปกรณ์ได้");
            setContent([]);
            setIsLoadingImages(false);
        }
    }

    // ฟังก์ชันแสดงเนื้อหาตามประเภทหน้าจอ
    const renderContent = () => {
        if (containerType === ContainerType.CATEGORIZED) {
            if (!hasPermission) {
                return (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
                            This app requires permission to access storage to show your media.
                        </Text>
                        <TouchableOpacity 
                            style={{ 
                                backgroundColor: '#2196F3', 
                                padding: 15, 
                                borderRadius: 5
                            }}
                            onPress={requestStoragePermission}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                Grant Permission
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            
            if (currentViewMode === ViewMode.FOLDERS && !currentAlbum) {
                return (
                    <AlbumsGrid 
                        albums={albums} 
                        isLoading={isLoadingAlbums} 
                        onAlbumPress={(album) => {
                            console.log("Album selected:", album.name);
                            setCurrentAlbum(album);
                            loadAlbumImages(album.path);
                        }} 
                    />
                );
            } else if (currentAlbum || currentViewMode === ViewMode.FILES) {
                if (storageName === "Images") {
                    return (
                        <ImageGrid 
                            images={content || []} 
                            isLoading={isLoadingImages}
                            onImagePress={(item) => handleOpen(item)}
                            onImageLongPress={(item) => {
                                handleSelect(true, item);
                            }}
                            selectedImages={selectionSet}
                        />
                    );
                } else if (storageName === "Videos") {
                    return (
                        <VideoGrid 
                            videos={content || []} 
                            isLoading={isLoadingImages}
                            onVideoPress={(item) => handleOpen(item)}
                            onVideoLongPress={(item) => {
                                handleSelect(true, item);
                            }}
                            selectedVideos={selectionSet}
                        />
                    );
                }
            }
        }
        
        return (
            <ContentList 
                content={content} 
                handleOpen={handleOpen} 
                handleSelect={handleSelect} 
                selectionSet={selectionSet} 
            />
        );
    };

    return <SafeAreaView style={{ flex: 1 }}>
        <StatusBar />
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
                    : <ItemViewModeSelection 
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
            <View style={{ margin: 10, flex: 1 }}>
                {renderContent()}
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
            }} moveActionHandler={function (): void {
                let itemArray = Array.from(selectionSet);

                setMovingState({
                    sourceDir: navpath.clone(),
                    moveType: MoveType.CUT,
                    items: itemArray,
                });

                unselectAll();
            }} renameActionHandler={function (): void {
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
            }} pasteActionHandler={() => handlePasteAction().catch((reason) => { throw new Error(reason) })}
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
    </SafeAreaView>;
}

export default ContentContainer;
//hi