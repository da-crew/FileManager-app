import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Switch, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../App";
import { requestNotificationPermission, checkStorageUsage } from "../services/NotificationService";
import { useTheme } from "../components/ThemeContext";

export default function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
    const { theme, changeTheme, isDarkMode } = useTheme();

    const [imageViewer, setImageViewer] = useState(true);
    const [videoPlayer, setVideoPlayer] = useState(true);
    const [musicPlayer, setMusicPlayer] = useState(true);
    const [textEditor, setTextEditor] = useState(true);

    const [storageFull, setStorageFull] = useState(true);
    const [recycleBin, setRecycleBin] = useState(true);
    const [recycleConfirm, setRecycleConfirm] = useState(true);

    const version = "1.0.0";

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="default" backgroundColor={theme.background} />
            <View style={[styles.header, { backgroundColor: theme.toolbarColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <AntDesign name="left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
                {/* Built-in apps */}
                <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Built-in apps</Text>
                <View style={[styles.sectionContainer, { backgroundColor: theme.toolbarColor }]}>
                    <SettingItem
                        icon="image-outline"
                        iconColor="#007AFF"
                        iconBgColor="#007AFF20"
                        label="Image viewer"
                        value={imageViewer}
                        onValueChange={setImageViewer}
                    />
                    <SettingItem
                        icon="videocam-outline"
                        iconColor="#FF2D55"
                        iconBgColor="#FF2D5520"
                        label="Video player"
                        value={videoPlayer}
                        onValueChange={setVideoPlayer}
                    />
                    <SettingItem
                        icon="musical-notes-outline"
                        iconColor="#FF9500"
                        iconBgColor="#FF950020"
                        label="Music player"
                        value={musicPlayer}
                        onValueChange={setMusicPlayer}
                    />
                    <SettingItem
                        icon="document-text-outline"
                        iconColor="#34C759"
                        iconBgColor="#34C75920"
                        label="Text editor"
                        value={textEditor}
                        onValueChange={setTextEditor}
                        isLast={true}
                    />
                </View>

                {/* Appearance */}
                <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Appearance</Text>
                <View style={[styles.sectionContainer, { backgroundColor: theme.toolbarColor }]}>
                    <TouchableOpacity style={[styles.row, { borderBottomWidth: undefined }]}>
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.text} style={styles.rowIcon} />
                            <Text style={[styles.label, { color: theme.text }]}>Dark mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={(value) => {
                                changeTheme(!isDarkMode);
                            }}
                            trackColor={{ false: "#767577", true: theme.text }}
                            thumbColor={isDarkMode ? theme.text : "#f4f3f4"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Notifications */}
                <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Notifications</Text>
                <View style={[styles.sectionContainer, { backgroundColor: theme.toolbarColor }]}>
                    <TouchableOpacity
                        style={[styles.row, { borderBottomWidth: undefined }]}
                        onPress={() => setStorageFull(!storageFull)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="harddisk" size={24} color={theme.text} style={styles.rowIcon} />
                            <View>
                                <Text style={[styles.label, { color: theme.text }]}>Storage is full</Text>
                                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>
                                    Show when the storage is over 98% full
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons
                            name={storageFull ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.iconColor}
                        />
                    </TouchableOpacity>
                </View>

                {/* Recycle bin */}
                <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Recycle bin</Text>
                <View style={[styles.sectionContainer, { backgroundColor: theme.toolbarColor }]}>
                    <SettingItem
                        icon="trash-outline"
                        iconColor="#8E8E93"
                        iconBgColor="#8E8E9320"
                        label="Use recycle bin"
                        value={recycleBin}
                        onValueChange={setRecycleBin}
                    />
                    <SettingItem
                        icon="alert-circle-outline"
                        iconColor="#FF9500"
                        iconBgColor="#FF950020"
                        label="Confirm before deleting"
                        value={recycleConfirm}
                        onValueChange={setRecycleConfirm}
                        isLast={true}
                    />
                </View>

                {/* About */}
                <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>About</Text>
                <View style={[styles.sectionContainer, { backgroundColor: theme.toolbarColor }]}>
                    <View style={[styles.row, { borderBottomWidth: 0 }]}>
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#5856D620' }]}>
                                <Ionicons name="information-circle-outline" size={20} color="#5856D6" />
                            </View>
                            <Text style={styles.label}>Version</Text>
                        </View>
                        <Text style={styles.versionText}>{version}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>File Manager App © 2023-2024</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function SettingItem({
    icon,
    iconColor,
    iconBgColor,
    label,
    value,
    onValueChange,
    isLast = false
}: {
    icon: any;
    iconColor: string;
    iconBgColor: string;
    label: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
    isLast?: boolean;
}) {
    return (
        <TouchableOpacity
            style={[styles.row, isLast && { borderBottomWidth: 0 }]}
            onPress={() => onValueChange(!value)}
        >
            <View style={styles.rowContent}>
                <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
                <Text style={styles.label}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                thumbColor={value ? "#007AFF" : "#fff"}
                ios_backgroundColor="#E5E5EA"
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    rowIcon: {
        marginRight: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 16,
    },
    sectionContainer: {
        borderRadius: 12,
        marginHorizontal: 16,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
    },
    subLabel: {
        fontSize: 13,
        marginTop: 3,
    },
    versionText: {
        fontSize: 15,
    },
    footer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        marginBottom: 20,
    },
    footerText: {
        fontSize: 13,
    },
});