import { SafeAreaView, View, StatusBar, Text, ScrollView, TouchableOpacity, Modal, GestureResponderEvent, Alert, BackHandler } from "react-native";
import { PathDisplayer } from '../components/PathDisplayer';
import { Path } from "../FileSystem";
import Toolbar from "../components/Toolbar";
import ItemCard from "../components/ItemCard";
import SelectionToolBar from "../components/SelectionToolbar";
import { AntDesign, Feather, FontAwesome, Foundation, MaterialIcons } from '@expo/vector-icons';
import { ReactNode, useEffect, useState } from "react";
import { useRoute } from '@react-navigation/native';
import * as RNFS from 'react-native-fs';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";


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

export type ContentContainerRouteParams = {
    containerName: string,
    path: Path,
    containerType: ContainerType,
};


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

export function ContentContainer({ navigation }: NativeStackScreenProps<RootStackParamList>) {

    const route = useRoute();
    const routeParams = route.params as ContentContainerRouteParams;
    const [{ selectionSet, isSelecting }, updateSelectionState] = useState({ selectionSet: new Set(), isSelecting: false });
    const [currentViewMode, setCurrentViewMode] = useState(ViewMode.FILES);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);
    const [newItemOptionVisible, setNewItemOptionVisible] = useState(false);
    const [navpath, setNavPath] = useState(routeParams.path);

    const storageName = routeParams.containerName ?? "ERROR!! I LOVE FIXING ERRORS!";
    const containerType = routeParams.containerType;

    const [content, setContent] = useState<RNFS.ReadDirItem[] | null>(null);

    useEffect(() => {
        const backAction = () => {
            if (navpath.nodes.length == 0) {
                navigation.goBack();
                return true;
            }
            navpath.nodes.pop();
            console.log("new path: ", navpath.build());
            setNavPath(navpath);
            fetchContent();
            return true; // Prevent default behavior
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

    function fetchContent() {
        setContent(null);
        RNFS.readDir(navpath.build())
            .then((items) => setContent(items))
            .catch(() => {
                console.log("An error occured");
            });
    }

    useEffect(() => {
        fetchContent();
        console.log("Fetch Content");
    }, []);


    function handleSelect(select: boolean, item: RNFS.ReadDirItem) {
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

    function handleOpen(item: RNFS.ReadDirItem): void {
        if (item.isFile()) {
            console.log("Open file", item.name);
        } else if (item.isDirectory()) {
            navpath.nodes.push(item.name);
            console.log("Open directory", navpath.build());
            setNavPath(navpath);
            fetchContent();
        }
    }

    return <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
            <StatusBar />

            {//Toolbar 1
                !isSelecting
                    //Default Mode
                    ? <Toolbar navigation={navigation} containerName={storageName}
                        sortByHandler={() => { setSortByOptionVisible(true); }}
                        createHandler={containerType == ContainerType.DEFAULT ? () => { setNewItemOptionVisible(true); } : undefined}
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
                                        selectionSet.add(item.name);
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
                    : <ItemViewModeSelection onChange={(mode) => {//Display Viewing Options
                        setCurrentViewMode(mode);
                        fetchContent();
                        unselectAll();
                    }} />
            }

            {/* Content is displayed here */}
            <ScrollView style={{ margin: 10, flex: 1 }}>
                {
                    content
                        ? content.map(
                            (item: RNFS.ReadDirItem, i: number) => (
                                <ItemCard item={item} key={i}
                                    onSelect={handleSelect}
                                    onOpen={handleOpen}
                                    isSelected={selectionSet.has(item.name)}
                                />
                            ))
                        : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15 }}>Loading</Text>
                        </View>
                }
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