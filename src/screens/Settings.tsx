import React, { useState } from "react";
import {SafeAreaView,ScrollView,View,Text,Switch,StyleSheet,TouchableOpacity} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { RootStackParamList } from "../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export default function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
    const [imageViewer, setImageViewer] = useState(true);
    const [videoPlayer, setVideoPlayer] = useState(true);
    const [musicPlayer, setMusicPlayer] = useState(true);
    const [textEditor, setTextEditor] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [storageFull, setStorageFull] = useState(true);
    const [recycleBin, setRecycleBin] = useState(true);
    const [recycleConfirm, setRecycleConfirm] = useState(true);
    const [detectUSB, setDetectUSB] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionHeader}>Built-in apps</Text>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setImageViewer(!imageViewer)}
                >
                    <Text style={styles.label}>Image viewer</Text>
                    <MaterialCommunityIcons
                        name={imageViewer ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setVideoPlayer(!videoPlayer)}
                >
                    <Text style={styles.label}>Video player</Text>
                    <MaterialCommunityIcons
                        name={videoPlayer ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setMusicPlayer(!musicPlayer)}
                >
                    <Text style={styles.label}>Music player</Text>
                    <MaterialCommunityIcons
                        name={musicPlayer ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setTextEditor(!textEditor)}
                >
                    <Text style={styles.label}>Text editor</Text>
                    <MaterialCommunityIcons
                        name={textEditor ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>Appearance</Text>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setDarkMode(!darkMode)}
                >
                    <Text style={styles.label}>Dark mode</Text>
                    <Switch
                        value={darkMode}
                        onValueChange={(value) => setDarkMode(value)}
                    />
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>Notification Setting</Text>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setStorageFull(!storageFull)}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Storage is full</Text>
                        <Text style={styles.subLabel}>
                            Show when the storage is over 98% full
                        </Text>
                    </View>
                    <MaterialCommunityIcons
                        name={storageFull ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>Recycle Bin Settings</Text>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setRecycleBin(!recycleBin)}
                >
                    <Text style={styles.label}>Use Recycle bin by default</Text>
                    <MaterialCommunityIcons
                        name={recycleBin ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setRecycleConfirm(!recycleConfirm)}
                >
                    <Text style={styles.label}>Show recycle confirmation</Text>
                    <MaterialCommunityIcons
                        name={recycleConfirm ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>Advanced Settings</Text>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => setDetectUSB(!detectUSB)}
                >
                    <Text style={styles.label}>Detect USB connection</Text>
                    <MaterialCommunityIcons
                        name={detectUSB ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        marginTop: 20
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
        flex: 1,
        marginHorizontal: 10
    },
    content: {
        padding: 16
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: "bold",
        marginVertical: 10,
        color: "black"
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#000"
    },
    label: {
        fontSize: 15,
        flex: 1,
        color: "black"
    },
    subLabel: {
        fontSize: 13,
        color: "black"
    },
    divider: {
        marginVertical: 10,
    }
});
