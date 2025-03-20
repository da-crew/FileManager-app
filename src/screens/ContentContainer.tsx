import { SafeAreaView, View, StatusBar, Text, ScrollView, TouchableOpacity, Modal, GestureResponderEvent } from "react-native";
import { Path, PathDisplayer } from '../components/PathDisplayer';
import Toolbar from "../components/Toolbar";
import ItemCard, { BaseItem, FileItem, FolderItem } from "../components/ItemCard";
import SelectionToolBar from "../components/SelectionToolbar";
import { AntDesign, Feather, FontAwesome, Foundation, MaterialIcons } from '@expo/vector-icons';
import { ReactNode, useState } from "react";
import { useRoute } from '@react-navigation/native';


let entry = {
    root: { displayname: "Internal Storage", path: "/storage/emulated/0" },
    items: [
        { type: "Folder", name: "Documents" },
        { type: "Folder", name: "Pictures" },
        { type: "Folder", name: "Music" },
        { type: "Folder", name: "Videos" },
        { type: "File", name: "Resume", extension: "pdf" },
        { type: "File", name: "Vacation", extension: "jpg" },
        { type: "File", name: "Song", extension: "mp3" },
        { type: "File", name: "Movie", extension: "mp4" },
    ],
};

export enum ContainerType {
    CATEGORIZED,
    DEFAULT,
}

export enum ViewMode {
    FILES,
    FOLDERS,
}

// export const ContainerType = Object.freeze({
//     CATEGORIZED: 'CATEGORIZED',
//     GOOGLE_DRIVE: 'GDRIVE',
//     DEFAULT: 'DEFAULT',
// });

// export const ViewMode = Object.freeze({
//     FILES: 'FILES',
//     FOLDERS: 'FOLDERS',
// });

export class ContentContainerRouteParams {

    containerName: string;
    path: Path;
    containerType: ContainerType;

    /**
     * Creates an instance of ContentContainer.
     * 
     * @constructor
     * @param {string} containerName - The name of the container.
     * @param {Path} path - The path associated with the container.
     * @param {ContainerType} containerType - Container type
     */
    constructor(containerName: string, path: Path, containerType: ContainerType) {
        this.containerName = containerName;
        this.path = path;
        this.containerType = containerType;
    }

    /**
     * Retrieves the content of the container based on the container name.
     * @param {ViewMode} viewMode - The view mode to filter the content. Only use this when container type is CATEGORIZED.
     * @returns {Array<FolderItem|FileItem>} An array of FolderItem and FileItem objects representing the content of the container.
     */
    getContent(viewMode: ViewMode) {
        if (this.containerType == ContainerType.DEFAULT) {
            switch (this.containerName) {
                case "Internal Storage":
                    return [
                        new FolderItem("guguaiywbd"),
                        new FolderItem("homework"),
                        new FileItem("report.docx", "docx"),
                        new FolderItem("projects"),
                        new FileItem("presentation.pptx", "pptx"),
                        new FolderItem("downloads"),
                        new FileItem("awa.mp4", "mp4"),
                        new FileItem("spreadsheet.xlsx", "xlsx"),
                        new FileItem("notes.txt", "txt"),
                    ];

                case "SD Card":
                    return [
                        new FolderItem("backup"),
                        new FolderItem("media"),
                        new FileItem("photo.jpg", "jpg"),
                        new FileItem("music.mp3", "mp3"),
                        new FolderItem("apps"),
                        new FileItem("document.pdf", "pdf"),
                        new FileItem("video.mp4", "mp4"),
                        new FileItem("archive.zip", "zip"),
                    ];
                case "Downloads":
                    return [
                        new FileItem("User_Manual.pdf", "pdf"),
                        new FileItem(".pdf", "pdf"),
                        new FileItem("totally-not-a-1024TB-zip-bomb.zip", "zip"),
                        new FileItem("Roblox hack infinite gem/money.apk", "apk"),
                        new FileItem("Cat_512x512.png", "png"),
                        new FileItem("Dog_512x512.png", "png"),
                    ];
                default:
                    return [];
            }
        }

        if (this.containerType == ContainerType.CATEGORIZED) {
            switch (this.containerName) {
                case "Images":
                    if (viewMode == ViewMode.FILES) {
                        return [
                            new FileItem("Vacation.jpg", "jpg"),
                            new FileItem("Profile.png", "png"),
                            new FileItem("Screenshot.bmp", "bmp"),
                            new FileItem("Wallpaper.gif", "gif"),
                        ];
                    } else if (viewMode == ViewMode.FOLDERS) {
                        return [
                            new FolderItem("Screenshots"),
                            new FolderItem("Wallpapers"),
                            new FolderItem("Camera"),
                            new FolderItem("Edited")
                        ];
                    } else { return []; }
                case "Videos":
                    if (viewMode == ViewMode.FILES) {
                        return [
                            new FileItem("Movie.mp4", "mp4"),
                            new FileItem("Clip.avi", "avi"),
                            new FileItem("Trailer.mkv", "mkv"),
                            new FileItem("Recording.mov", "mov"),
                        ];
                    } else if (viewMode == ViewMode.FOLDERS) {
                        return [
                            new FolderItem("Movies"),
                            new FolderItem("Clips"),
                            new FolderItem("Trailers"),
                            new FolderItem("Recordings"),
                        ];
                    } else { return []; }
                case "Audio":
                    if (viewMode == ViewMode.FILES) {
                        return [
                            new FileItem("Song.mp3", "mp3"),
                            new FileItem("Podcast.aac", "aac"),
                            new FileItem("Audiobook.m4b", "m4b"),
                            new FileItem("Recording.wav", "wav"),
                        ];
                    } else if (viewMode == ViewMode.FOLDERS) {
                        return [
                            new FolderItem("Music"),
                            new FolderItem("Podcasts"),
                            new FolderItem("Audiobooks"),
                            new FolderItem("Recordings"),
                        ];
                    } else { return []; }
                case "Documents":
                    if (viewMode == ViewMode.FILES) {
                        return [
                            new FileItem("Resume.pdf", "pdf"),
                            new FileItem("Report.docx", "docx"),
                            new FileItem("Presentation.pptx", "pptx"),
                            new FileItem("Spreadsheet.xlsx", "xlsx"),
                        ];
                    } else if (viewMode == ViewMode.FOLDERS) {
                        return [
                            new FolderItem("Work"),
                            new FolderItem("School"),
                            new FolderItem("Personal"),
                            new FolderItem("Projects"),
                        ];
                    } else { return []; }
                default:
            }
        }
        
        return [
            new FileItem("ERROR.bin", ".bin"),
            new FolderItem("This is not good at all"),
        ];
    }
}


const BottomBarItem = ({ name, icon, onPress }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
}) => {
    return <TouchableOpacity style={{ padding: 10 }} onPress={onPress}>
        <View style={{ alignItems: 'center' }}>
            {icon}
        </View>
        <Text style={{ fontSize: 16 }}>{name}</Text>
    </TouchableOpacity>;
};

const ItemViewModeSelection = ({ onChange }: { onChange: (mode: ViewMode) => void }) => {

    const highlightColor = '#B6B6B6';
    const [selection, setSelection] = useState(ViewMode.FILES);

    return <View style={{ flexDirection: 'row', backgroundColor: '#d9d9d9' }}>
        <TouchableOpacity onPress={() => {
            onChange(ViewMode.FILES);
            setSelection(ViewMode.FILES);
        }} style={{ flex: 1, backgroundColor: selection == ViewMode.FILES ? highlightColor : undefined, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 16 }}>Files</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
            onChange(ViewMode.FOLDERS);
            setSelection(ViewMode.FOLDERS);
        }} style={{ flex: 1, backgroundColor: selection == ViewMode.FOLDERS ? highlightColor : undefined, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 16 }}>Folders</Text>
        </TouchableOpacity>
    </View>;
};

const BottomBarOptions = ({ name, icon, onPress }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
}) => {
    return <TouchableOpacity style={{ flexDirection: 'row' }} onPress={onPress}>
        {icon}
        <Text style={{ textAlignVertical: 'center', fontSize: 15 }}>{name}</Text>
    </TouchableOpacity>;
}

export function ContentContainer({ navigation }: { navigation: any}) {
    const route = useRoute();
    const routeParams = route.params as ContentContainerRouteParams;
    const [{ selectionSet, isSelecting }, updateSelectionState] = useState({ selectionSet: new Set(), isSelecting: false });
    const [currentViewMode, setCurrentViewMode] = useState(ViewMode.FILES);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);
    const [newItemOptionVisible, setNewItemOptionVisible] = useState(false);


    const [content, setContent] = useState(routeParams.getContent(currentViewMode));
    const storageName = routeParams.containerName ?? "ERROR!! I LOVE FIXING ERRORS!";
    const containerType = routeParams.containerType;
    let navpath = routeParams.path;

    function handleSelect(select: boolean, item: FileItem | FolderItem) {
        if (select) {
            selectionSet.add(item.name);
        } else {
            selectionSet.delete(item.name);
        }
        updateSelectionState({ selectionSet, isSelecting: selectionSet.size > 0 });
    }

    function unselectAll() {
        updateSelectionState({ selectionSet: new Set(), isSelecting: false })
    }

    const contentComponents = content.map((item: BaseItem, i: number) => (<ItemCard item={item} key={i} onSelect={handleSelect} isSelected={selectionSet.has(item.name)} />));

    return <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
            <StatusBar />
            {
                !isSelecting
                    ? <Toolbar navigation={navigation} containerName={storageName}
                        sortByHandler={() => { setSortByOptionVisible(true); }}
                        createHandler={containerType == ContainerType.DEFAULT ? () => { setNewItemOptionVisible(true);} : undefined}
                    />
                    : <SelectionToolBar
                        onCancel={unselectAll}
                        onSelectAll={() => {
                            if (selectionSet.size == content.length) {
                                unselectAll();
                            } else {
                                for (const item of content) {
                                    selectionSet.add(item.name);
                                }
                                updateSelectionState({ selectionSet, isSelecting: selectionSet.size > 0 });
                            }
                        }}
                        count={selectionSet.size}
                        maxCount={content.length}
                    />
            }
            {
                containerType == ContainerType.DEFAULT
                    ? <PathDisplayer navpath={navpath} />
                    : <ItemViewModeSelection onChange={(mode) => {
                        setCurrentViewMode(mode);
                        setContent(routeParams.getContent(mode));
                        unselectAll();
                    }} />
            }

            <ScrollView style={{ margin: 10, flex: 1 }}>
                {contentComponents}
            </ScrollView>
        </View>
        {
            isSelecting
                ? <View style={{ backgroundColor: '#d9d9d9', borderTopWidth: 1, borderColor: '#e7e7e7', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                    <BottomBarItem name='Copy' icon={<Feather name='copy' size={30} />} onPress={() => { }} />
                    <BottomBarItem name='Move' icon={<Feather name='scissors' size={30} />} onPress={() => { }} />
                    <BottomBarItem name='Rename' icon={<Foundation name='pencil' size={30} />} onPress={() => { }} />
                    <BottomBarItem name='Delete' icon={<MaterialIcons name='delete' size={30} />} onPress={() => { }} />
                    <BottomBarItem name='More' icon={<MaterialIcons name='more-vert' size={30} />} onPress={() => { }} />
                </View>
                : <></>
        }
        <Modal visible={sortByOptionVisible} transparent={true} onRequestClose={() => setSortByOptionVisible(false)} >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ backgroundColor: 'white', justifyContent: 'space-between', paddingBottom: 5 }}>
                    <BottomBarOptions name='Alphabetical' icon={<FontAwesome name="sort-alpha-asc" size={30} style={{ padding: 15 }} />} onPress={() => {
                        setSortByOptionVisible(false);
                    }} />
                    <BottomBarOptions name='Date' icon={<FontAwesome name="sort-numeric-asc" size={30} style={{ padding: 15 }} />} onPress={() => {
                        setSortByOptionVisible(false);
                    }} />
                </View>
            </View>
        </Modal>
        <Modal visible={newItemOptionVisible} transparent={true} onRequestClose={() => setNewItemOptionVisible(false)} >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ backgroundColor: 'white', justifyContent: 'space-between', paddingBottom: 5 }}>
                    <BottomBarOptions name='New Folder' icon={<MaterialIcons name="create-new-folder" size={30} style={{ padding: 15 }} />} onPress={() => {
                        setNewItemOptionVisible(false);
                    }} />
                    <BottomBarOptions name='New File' icon={<AntDesign name="addfile" size={30} style={{ padding: 15 }} />} onPress={() => {
                        setNewItemOptionVisible(false); 
                    }} />
                </View>
            </View>
        </Modal>
    </SafeAreaView>;
}

export default ContentContainer;