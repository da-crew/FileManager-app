import { SafeAreaView, View, StatusBar, Text, TouchableOpacity, Modal, BackHandler } from "react-native";
import { PathDisplayer } from '../components/PathDisplayer';
import { Path } from "../FileSystem";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from "../components/SelectionToolbar";
import { FontAwesome, } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { useRoute } from '@react-navigation/native';
import * as RNFS from 'react-native-fs';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

import BottomBarOptions from "../components/ContentContainer/BottomBarOptions";
import ContentList from "../components/ContentContainer/ContentList";
import SelectionBottomBar from "../components/ContentContainer/SelectionBottomBar";
import ItemCreator from "../components/ContentContainer/ItemCreator";
import { ContainerType, ContentContainerRouteParams, MoveType, MovingState, SortType, ViewMode } from "../components/ContentContainer/common";
import ItemViewModeSelection from "../components/ContentContainer/ItemViewModeSelection";

export function ContentContainer({ navigation }: NativeStackScreenProps<RootStackParamList>) {

    const route = useRoute();
    const routeParams = route.params as ContentContainerRouteParams;
    const storageName = routeParams.containerName;
    const containerType = routeParams.containerType;

    const [{ selectionSet, isSelecting }, updateSelectionState] = useState<{ selectionSet: Set<RNFS.ReadDirItem>, isSelecting: boolean }>({ selectionSet: new Set(), isSelecting: false });
    const [movingState, setMovingState] = useState<MovingState | null>(null);
    const [movingProgress, setMovingProgress] = useState<number | null>(null);

    const [currentViewMode, setCurrentViewMode] = useState(ViewMode.FILES);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);//modal

    const [itemCreatorVisible, setItemCreatorVisible] = useState(false);

    const [sortType, setSortType] = useState(SortType.ALPHABETICAL);
    const [navpath, setNavPath] = useState(routeParams.path);


    const [content, setContent] = useState<RNFS.ReadDirItem[] | null>(null);
    const { theme } = useTheme();

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

    function handleGoBack() {
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

    useEffect(() => {
        const backAction = () => {
            handleGoBack();
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

    async function pasteAction(sourcePath: string, destPath: string) {

        if (movingState == null) throw new Error("movingState shouldn't be null!");
        try {
            let finalDestPath = destPath;
            let attempt = 0;
            console.log("Path: ", finalDestPath);
            while (await RNFS.exists(finalDestPath)) {
                attempt += 1;
                let extIdx = destPath.lastIndexOf('.');
                let ext = destPath.slice(extIdx);
                finalDestPath = `${destPath.slice(0, extIdx)} (${attempt})${ext}`;
            }

            console.log("Final Path: ", finalDestPath);

            if (attempt > 0) {
                await RNFS.writeFile(finalDestPath, "");
            }

            switch (movingState.moveType) {
                case MoveType.COPY:
                    await RNFS.copyFile(sourcePath, finalDestPath);
                    break;
                case MoveType.CUT:
                    await RNFS.moveFile(sourcePath, finalDestPath);
                    break;
            }
        } catch (e) {
            console.log("Error: ", e);
        }

        //increment progress

    }

    async function handlePasteAction() {
        if (movingState == null) {
            throw new Error("movingState shouldn't be null!");
        }

        let destPath = navpath.clone();

        type DirNode = {
            name: string | null,
            items: RNFS.ReadDirItem[],
        }

        let dirStack: DirNode[] = [{ name: null, items: Array.from(movingState.items) }];

        const buildStackPath = () => {
            let path = destPath.build();
            dirStack.forEach((node, i) => {
                if (node.name == null && i > 0) throw new Error("Unexpected null value for directory name in stack path.");
                if (node.name == null) return;
                path += "/" + node.name;
            });
            return path;
        }

        setMovingProgress(0);
        while (dirStack.length > 0) {
            if (movingState == null) break;

            let stackHead = dirStack[dirStack.length - 1];
            let increased = false;

            while (stackHead.items.length > 0) {
                if (movingState == null) break;

                let headPath = buildStackPath();
                let itemHead = stackHead.items.pop() as RNFS.ReadDirItem;
                if (itemHead.isFile()) {
                    let source = itemHead.path;
                    let dest = headPath + "/" + itemHead.name;
                    console.log(`mv ${source} ${dest}`);
                    await pasteAction(source, dest);

                } else if (itemHead.isDirectory()) {
                    let finalName = itemHead.name;
                    let p = headPath + "/" + finalName;

                    let attempts = 0;
                    while (await RNFS.exists(p)) {
                        if (movingState == null) break;
                        attempts += 1;
                        finalName = itemHead.name + `(${attempts})`;
                        p = headPath + "/" + finalName;
                    }
                    
                    console.log("mkdir " + p);
                    await RNFS.mkdir(p);
                    try {
                        let items = await RNFS.readDir(itemHead.path);
                        console.log("Got " + items.length + " items");
                        dirStack.push({
                            name: finalName,
                            items,
                        });
                        increased = true;
                    } catch (e) {
                        console.log("Error while reading directory: ", e);
                    }
                    break;
                }
            }

            if (stackHead.items.length == 0 && !increased) {
                let headPath = buildStackPath();
                let n = dirStack.pop();
                setMovingProgress((prevProgress) => {//this makes the operation atomic i think
                    if (movingState == null) return null;
                    let newProgress = (prevProgress ?? 0) + 1;
                    if (newProgress == movingState.items.length) return null;
                    return newProgress;
                });
                console.log("Popped node: ", n?.name);
            }
        }
        
        fetchContent();
        setMovingState(null);
        setMovingProgress(null);
    }

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

        <SelectionBottomBar 
        isSelecting={selectionSet.size > 0} 
        isMoving={movingState != null} 
        isPasteLocationValid={movingState?.sourceDir.build() != navpath.build()}
            copyActionHandler={function (): void {
                setMovingProgress(null);
                let itemArray = Array.from(selectionSet);

                setMovingState({
                    sourceDir: navpath.clone(),
                    moveType: MoveType.COPY,
                    items: itemArray,
                });

                unselectAll();
            }} moveActionHandler={function (): void {
                throw new Error("Move action not implemented.");
            }} renameActionHandler={function (): void {
                throw new Error("Rename action not implemented.");
            }} deleteActionHandler={function (): void {
                throw new Error("Delete action not implemented.");
            }} pasteCancelActionHandler={function (): void {
                setMovingState(null);
            }} pasteActionHandler={() => handlePasteAction().then(() => {})}
        />

        <Modal visible={sortByOptionVisible} transparent={true} onRequestClose={() => setSortByOptionVisible(false)} >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }} >
                <View style={{ backgroundColor: 'white', justifyContent: 'space-between', paddingBottom: 5 }} >
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

        <Modal visible={movingProgress != null && movingState != null} transparent={true}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Moving Items</Text>
                    {movingState && movingProgress !== null ? (
                        <>
                            <Text style={{ fontSize: 16, marginBottom: 10 }}>
                                {`Moving ${movingProgress + 1} of ${movingState.items.length} items...`}
                            </Text>
                            <View style={{ width: '100%', height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
                                <View
                                    style={{
                                        width: `${((movingProgress + 1) / movingState.items.length) * 100}%`,
                                        height: '100%',
                                        backgroundColor: '#007BFF',
                                    }}
                                />
                            </View>
                        </>
                    ) : (
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>Preparing to move items...</Text>
                    )}
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#007BFF',
                            padding: 10,
                            borderRadius: 5,
                            alignItems: 'center',
                            width: '100%',
                        }}
                        onPress={() => setMovingState(null)}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                    </TouchableOpacity>
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
    const { theme } = useTheme()
    useEffect(() => {
        setNewItemOptionVisible(props.enabled);
        setCreationState(null);
    }, [props.enabled]);

    return (<>
        <Modal visible={newItemOptionVisible} transparent={true} onRequestClose={() => props.onCreationCanceled()}>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.background }}>
                <View style={{ backgroundColor: theme.background, justifyContent: 'space-between', paddingBottom: 5 }}>
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
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.background, padding: 30 }}>
                <View style={{ padding: 15, backgroundColor: theme.background, borderRadius: 5 }}>
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
                            style={{ flex: 1, backgroundColor: theme.background, marginRight: 5, padding: 10, alignItems: 'center', borderRadius: 5 }}
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
                                                        //fetchContent();
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
                            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Ok</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: theme.text, marginLeft: 5, padding: 10, alignItems: 'center', borderRadius: 5 }}
                            onPress={() => props.onCreationCanceled()}
                        >
                            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </Modal>
    </>);
}


export default ContentContainer;