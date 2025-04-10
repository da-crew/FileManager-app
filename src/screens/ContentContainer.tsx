import { SafeAreaView, View, StatusBar, Text, TouchableOpacity, Modal, BackHandler, Alert, TextInput } from "react-native";
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


    const [itemCreatorVisible, setItemCreatorVisible] = useState(false);

    const [sortType, setSortType] = useState(SortType.ALPHABETICAL);
    const [navpath, setNavPath] = useState(routeParams.path);

    const [content, setContent] = useState<RNFS.ReadDirItem[] | null>(null);

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
            if (getFileType(item) == "text/plain") {
                console.log("Open Text editor", navpath.build())
                navpath.nodes.push(item.name);
                navigation.navigate("TextEditor", {
                    containerName: storageName,
                    path: navpath,
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