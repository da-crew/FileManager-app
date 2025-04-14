import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useProgress } from "./ProgressContext";
import { useTheme } from '../ThemeContext';

const ProgressBar: React.FC = () => {
    const { progressState, quitProgress, cancelProgress } = useProgress();

    if (!progressState) return null;

    const { progress, maxProgress, actionTitle } = progressState;
    const { theme } = useTheme();
    return (
        <Modal visible={true} transparent={true}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
                <View style={{ backgroundColor: theme.background, padding: 20, borderRadius: 10, alignItems: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>{actionTitle}</Text>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                            {`Progress: ${progress}`} {maxProgress < 0 ? '' : `of ${maxProgress}`}
                        </Text>
                        <View
                            style={{
                                width: "100%",
                                height: 10,
                                backgroundColor: theme.background,
                                borderRadius: 5,
                                overflow: "hidden",
                                marginBottom: 10,
                            }}
                        >
                            <View
                                style={{
                                    width: `${(progress / maxProgress) * 100}%`,
                                    height: "100%",
                                    backgroundColor: theme.background,
                                }}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={{
                            backgroundColor: theme.background,
                            padding: 10,
                            borderRadius: 5,
                            alignItems: "center",
                            width: "100%",
                        }}
                        onPress={() => cancelProgress()}
                    >
                        <Text style={{ color: theme.text, fontWeight: "bold" }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default ProgressBar;