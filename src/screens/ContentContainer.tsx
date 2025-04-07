import { SafeAreaView, View, StatusBar, Text, TouchableOpacity, Modal, BackHandler } from "react-native";
import { PathDisplayer } from '../components/PathDisplayer';
import { Path } from "../FileSystem";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from "../components/SelectionToolbar";
import React, { useEffect, useState } from "react";
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

    const [currentViewMode, setCurrentViewMode] = useState(ViewMode.FILES);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);//modal

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
        //increment progress
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
                await pasteAction(item.path, destPath.build());
            } else if (item.isDirectory()) {
                let newDestPath = destPath.clone();
                newDestPath.push(item.name);

                let newDestPathBuilt = newDestPath.build();
                
                if (!await RNFS.exists(newDestPathBuilt)) {
                    await RNFS.mkdir(newDestPathBuilt);
                }

                let innerItems = await RNFS.readDir(item.path);
                await moveItems(innerItems, destPath, onItemDone);

                if (movingState.moveType == MoveType.CUT) {
                    let popCount = await scanItems([item]);
                    if (popCount > 0) {
                        throw new Error(`The directory "${item.path}" is not empty after processing. ${popCount} items remain.`);
                    }
                    await RNFS.unlink(item.path);
                }
            }
            onItemDone();
        }
    }

    async function handlePasteAction() {
        if (movingState == null) {
            throw new Error("movingState shouldn't be null!");
        }

        progress.startProgress(0, -1, "Scanning for items", (done: boolean) => {
            if (!done) {
                console.log("Canceled");
                setMovingState(null);
            }
        });

        let items = await scanItems(movingState.items, progress.incrementProgress);
        progress.quitProgress(true, items);

        progress.startProgress(0, items, "Moving items", (done: boolean) => {
            if (!done) {
                console.log("Canceled");
                setMovingState(null);
            }
        });

        let destPath = navpath.clone();
        moveItems(movingState.items, destPath, progress.incrementProgress);

        // type DirNode = {
        //     name: string | null,
        //     directory: RNFS.ReadDirItem | null,
        //     items: RNFS.ReadDirItem[],
        // }

        // let dirStack: DirNode[] = [{ name: null, directory: null, items: Array.from(movingState.items) }];

        // const buildStackPath = () => {
        //     let path = destPath.build();
        //     dirStack.forEach((node, i) => {
        //         if (node.name == null && i > 0) throw new Error("Unexpected null value for directory name in stack path.");
        //         if (node.name == null) return;
        //         path += "/" + node.name;
        //     });
        //     return path;
        // }


        // while (dirStack.length > 0) {
        //     if (movingState == null) break;

        //     let stackHead = dirStack[dirStack.length - 1];
        //     let increased = false;

        //     while (stackHead.items.length > 0) {
        //         if (movingState == null) break;

        //         let headPath = buildStackPath();
        //         let itemHead = stackHead.items.pop() as RNFS.ReadDirItem;
        //         if (itemHead.isFile()) {
        //             let source = itemHead.path;
        //             let dest = headPath + "/" + itemHead.name;
        //             await pasteAction(source, dest);

        //         } else if (itemHead.isDirectory()) {
        //             let finalName = itemHead.name;
        //             let p = headPath + "/" + finalName;

        //             let attempts = 0;
        //             while (await RNFS.exists(p)) {
        //                 if (movingState == null) break;
        //                 attempts += 1;
        //                 finalName = itemHead.name + `(${attempts})`;
        //                 p = headPath + "/" + finalName;
        //             }

        //             console.log("mkdir " + p);
        //             await RNFS.mkdir(p);
        //             try {
        //                 let items = await RNFS.readDir(itemHead.path);
        //                 dirStack.push({
        //                     name: finalName,
        //                     directory: itemHead,
        //                     items,
        //                 });
        //                 increased = true;
        //             } catch (e) {
        //                 console.log("Error while reading directory: ", e);
        //             }
        //             break;
        //         }
        //     }

        //     if (stackHead.items.length == 0 && !increased) {
        //         let headPath = buildStackPath();
        //         let n = dirStack.pop() as DirNode;
        //         if (movingState.moveType == MoveType.CUT && n.directory) {
        //             if (!n.directory.isDirectory()) throw new Error("Item isnt a directory for some reason.");
        //             let items = await RNFS.readDir(n.directory.path);
        //             if (items.length > 0) {
        //                 throw new Error("the popped path isnt empty!!!!!");
        //             } else {
        //                 console.log("rm ", n.directory.path);
        //                 //await RNFS.unlink(headPath);
        //             }
        //         }

        //         //TODO: increment progress
        //     }
        // }

        fetchContent();
        setMovingState(null);
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
                throw new Error("Rename action not implemented.");
            }} deleteActionHandler={function (): void {
                throw new Error("Delete action not implemented.");
            }} pasteCancelActionHandler={function (): void {
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

        <ProgressBar/>

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