import { SafeAreaView, View, StatusBar, Text, TouchableOpacity, Modal, Alert, BackHandler, TextInput } from "react-native";
import { PathDisplayer } from '../components/PathDisplayer';
import { Path } from "../FileSystem";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from "../components/SelectionToolbar";
import { AntDesign, Feather, FontAwesome, Foundation, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { useRoute } from '@react-navigation/native';
import * as RNFS from 'react-native-fs';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

import BottomBarItem from "../components/ContentContainer/BottomBarItem";
import BottomBarOptions from "../components/ContentContainer/BottomBarOptions";
import ContentList from "../components/ContentContainer/ContentList";

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

enum SortType {
    ALPHABETICAL,
    DATE,
}

enum CreationType {
    FOLDER,
    FILE,
}



export function ContentContainer({ navigation }: NativeStackScreenProps<RootStackParamList>) {

    const route = useRoute();
    const routeParams = route.params as ContentContainerRouteParams;
    const [{ selectionSet, isSelecting }, updateSelectionState] = useState<{ selectionSet: Set<RNFS.ReadDirItem>, isSelecting: boolean }>({ selectionSet: new Set(), isSelecting: false });
    const [currentViewMode, setCurrentViewMode] = useState(ViewMode.FILES);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);//modal

    const [itemCreatorVisible, setItemCreatorVisible] = useState(false);

    const [sortType, setSortType] = useState(SortType.ALPHABETICAL);
    const [navpath, setNavPath] = useState(routeParams.path);

    const storageName = routeParams.containerName ?? "ERROR!! I LOVE FIXING ERRORS!";
    const containerType = routeParams.containerType;

    const [content, setContent] = useState<RNFS.ReadDirItem[] | null>(null);

    function fetchContent() {
        setContent(null);
        RNFS.readDir(navpath.build())
            .then((items) => {
                console.log("Sorting by: ", sortType);
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
                console.log("Got items");
                setContent(hiddenFolders.concat(folders).concat(files));
            })
            .catch(() => {
                console.log("An error occured");
            });
    }

    useEffect(() => fetchContent(), [sortType]);

    useEffect(() => {
        const backAction = () => {
            if (navpath.nodes.length == 0) {
                navigation.goBack();
                return true;
            }
            navpath.nodes.pop();
            console.log("new path: ", navpath.build());
            setNavPath(navpath);
            unselectAll();
            fetchContent();
            return true; // Prevent default behavior
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        fetchContent();
        console.log("Fetch Content");

        return () => backHandler.remove();
    }, []);

    function updateSortType(type: SortType) {
        if (sortType != type) {
            setSortType(type);
        }
    }

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
        } else if (item.isDirectory()) {
            navpath.nodes.push(item.name);
            console.log("Open directory", navpath.build());
            setNavPath(navpath);
            unselectAll();
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
                        createHandler={containerType == ContainerType.DEFAULT ? () => { setItemCreatorVisible(true); console.log("Create Action") } : undefined}
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
                    : <ItemViewModeSelection onChange={(mode) => {//Display Viewing Options
                        setCurrentViewMode(mode);
                        fetchContent();
                        unselectAll();
                    }} />
            }

            {/* Content is displayed here */}
            <View style={{ margin: 10, flex: 1 }}>
                <ContentList content={content} handleOpen={handleOpen} handleSelect={handleSelect} selectionSet={selectionSet} />
            </View>

        </View>
        {
            isSelecting
                ? <View style={{ backgroundColor: '#d9d9d9', borderTopWidth: 1, borderColor: '#e7e7e7', flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 }}>
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
                        updateSortType(SortType.ALPHABETICAL);
                        setSortByOptionVisible(false);
                    }} />
                    <BottomBarOptions name='Date' icon={<FontAwesome name="sort-numeric-asc" size={30} style={{ padding: 15 }} />} onPress={() => {
                        updateSortType(SortType.DATE);
                        setSortByOptionVisible(false);
                    }} />
                </View>
            </View>
        </Modal>

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

function ItemCreator(props: {
    enabled: boolean,
    currentPath: Path,
    onCreationDone: () => void,
    onCreationCanceled: () => void
}) {

    const [creationState, setCreationState] = useState<{ itemName: string, creationType: CreationType } | null>(null);
    const [newItemOptionVisible, setNewItemOptionVisible] = useState(false);

    useEffect(() => {
        setNewItemOptionVisible(props.enabled);
        setCreationState(null);
    }, [props.enabled]);

    return (<>
        <Modal visible={newItemOptionVisible} transparent={true} onRequestClose={() => props.onCreationCanceled()}>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ backgroundColor: 'white', justifyContent: 'space-between', paddingBottom: 5 }}>
                    <BottomBarOptions name='New Folder' icon={<MaterialIcons name="create-new-folder" size={30} style={{ padding: 15 }} />} onPress={() => {
                        setNewItemOptionVisible(false);
                        setCreationState({
                            itemName: "",
                            creationType: CreationType.FOLDER,
                        })
                    }} />
                    <BottomBarOptions name='New File' icon={<AntDesign name="addfile" size={30} style={{ padding: 15 }} />} onPress={() => {
                        setNewItemOptionVisible(false);
                        setCreationState({
                            itemName: "",
                            creationType: CreationType.FILE,
                        });
                    }} />
                </View>
            </View>
        </Modal>

        <Modal visible={creationState != null && props.enabled} transparent={true} onRequestClose={() => props.onCreationCanceled()}>
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 30 }}>
                <View style={{ padding: 15, backgroundColor: 'white', borderRadius: 5 }}>
                    <Text style={{ fontSize: 20, paddingBottom: 10 }}>Enter a name</Text>
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
                        onChangeText={(text) => {
                            if (creationState == null) {
                                throw new Error("creationState cannot be null!");
                            }
                            setCreationState({
                                ...creationState,
                                itemName: text,
                            });
                        }}
                    />

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', paddingTop: 10, justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: '#007BFF', marginRight: 5, padding: 10, alignItems: 'center', borderRadius: 5 }}
                            onPress={() => {
                                if (creationState == null) {
                                    throw new Error("creationState is null!");
                                }
                                if (creationState.creationType == null) {
                                    throw new Error("creationType is null!");
                                }
                                if (creationState.itemName.length <= 0) {
                                    Alert.alert("Error", "Name cannot be empty!", [{ text: "Dismiss" }]);
                                    return;
                                }

                                let fullPath = props.currentPath.build() + "/" + creationState.itemName;
                                console.log("Create: ", fullPath);
                                RNFS.exists(fullPath)
                                    .then((itemExists) => {
                                        if (itemExists) {
                                            console.log("Item already exists! Cannot create item!");
                                            Alert.alert("Error", "Item already exists", [{ text: "Dismiss" }]);
                                            return;
                                        } else {
                                            console.log("Can create: ");
                                            try {
                                                let promise;
                                                switch (creationState.creationType) {
                                                    case CreationType.FOLDER:
                                                        promise = RNFS.mkdir(fullPath);
                                                        break;
                                                    case CreationType.FILE:
                                                        promise = RNFS.writeFile(fullPath, "");
                                                        break;
                                                }
                                                promise
                                                    .then(() => {
                                                        console.log("Created ", fullPath);
                                                        props.onCreationDone();
                                                    })
                                                    .catch((reason) => {
                                                        Alert.alert("Error Creating Item", reason, [{ text: "Dismiss" }]);
                                                    });
                                            } catch (err) {
                                                console.log("Error while creating item. ", err);
                                            }
                                        }
                                    })
                                    .catch((reason) => {
                                        console.log("Error checking for item's existence. Reason: ", reason);
                                    });
                                setCreationState(null);
                                props.onCreationCanceled();
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Ok</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: '#6C757D', marginLeft: 5, padding: 10, alignItems: 'center', borderRadius: 5 }}
                            onPress={() => props.onCreationCanceled()}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </Modal>
    </>);
}

export default ContentContainer;