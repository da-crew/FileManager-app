import { View, Text, TouchableOpacity, Modal, Alert, TextInput } from "react-native";

import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import * as RNFS from 'react-native-fs';
import { Path } from "../../FileSystem";
import BottomBarOptions from "./BottomBarOptions";
import { CreationType } from "./common";


export default function ItemCreator(props: {
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