import React, { useState } from "react";
import {SafeAreaView,ScrollView,View,Text,Switch,StyleSheet,TouchableOpacity,Platform, StatusBar} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { RootStackParamList } from "../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from '../components/ThemeContext';
import { lightTheme, darkTheme } from '../components/theme'; 

export default function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
    const [imageViewer, setImageViewer] = useState(true);
    const [videoPlayer, setVideoPlayer] = useState(true);
    const [musicPlayer, setMusicPlayer] = useState(true);
    const [textEditor, setTextEditor] = useState(true);
    const {isDarkMode, toggleDarkMode, theme } = useTheme();
    const [storageFull, setStorageFull] = useState(true);
    const [recycleBin, setRecycleBin] = useState(true);
    const [recycleConfirm, setRecycleConfirm] = useState(true);
    const [detectUSB, setDetectUSB] = useState(false);
    const styles = getStyles(theme);
    const [update, setUpdate] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='default'/>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionHeader}>Built-in apps</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setImageViewer(!imageViewer)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="image" size={24} color={theme.textSecondary} style={styles.rowIcon} />
                            <Text style={styles.label}>Image viewer</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={imageViewer ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setVideoPlayer(!videoPlayer)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="video" size={24} color={theme.textSecondary} style={styles.rowIcon} />
                            <Text style={styles.label}>Video player</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={videoPlayer ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setMusicPlayer(!musicPlayer)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="music" size={24} color={theme.textSecondary} style={styles.rowIcon} />
                            <Text style={styles.label}>Music player</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={musicPlayer ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setTextEditor(!textEditor)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="text-box" size={24} color={theme.textSecondary} style={styles.rowIcon} />
                            <Text style={styles.label}>Text editor</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={textEditor ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.primary}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>Appearance</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={toggleDarkMode}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.textSecondary} style={styles.rowIcon} />
                            <Text style={styles.label}>Dark mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={isDarkMode ? "#F2F2F7" : "#f4f3f4"}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>Notification Setting</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setStorageFull(!storageFull)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="harddisk" size={24} color={theme.textSecondary} style={styles.rowIcon} />
                            <View>
                                <Text style={styles.label}>Storage is full</Text>
                                <Text style={styles.subLabel}>
                                    Show when the storage is over 98% full
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons
                            name={storageFull ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.primary}
                        />
                    </TouchableOpacity>
                </View>

                {/* <Text style={styles.sectionHeader}>Recycle Bin Settings</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setRecycleBin(!recycleBin)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="delete" size={24} color={theme.textSecondary} style={styles.rowIcon} />
                            <Text style={styles.label}>Use Recycle bin by default</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={recycleBin ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setRecycleConfirm(!recycleConfirm)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="alert-circle" size={24} color={theme.textSecondary} style={styles.rowIcon} />
                            <Text style={styles.label}>Show recycle confirmation</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={recycleConfirm ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.primary}
                        />
                    </TouchableOpacity>
                </View> */}

                {/* <Text style={styles.sectionHeader}>Advanced Settings</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setDetectUSB(!detectUSB)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="usb" size={24} color={theme.textSecondary} style={styles.rowIcon} />
                            <Text style={styles.label}>Detect USB connection</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={detectUSB ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.primary}
                        />
                    </TouchableOpacity>
                </View> */}
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background, 
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.card, 
        borderBottomWidth: 1,
        borderBottomColor: theme.border, 
        marginTop: Platform.OS === 'ios' ? 0 : 20
    },
    backButton: {
        padding: 8
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: theme.text, 
        flex: 1,
        textAlign: 'center'
    },
    content: {
        padding: 16
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 8,
        color: theme.textSecondary, 
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    sectionContainer: {
        backgroundColor: theme.card, 
        borderRadius: 10,
        overflow: 'hidden'
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
       
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    rowIcon: {
        marginRight: 12
    },
    label: {
        fontSize: 17,
        color: theme.text 
    },
    subLabel: {
        fontSize: 13,
        color: theme.textSecondary, 
        marginTop: 2
    }
});

