import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useProgress } from "./ProgressContext";

const ProgressBar: React.FC = () => {
    const { progressState, quitProgress, cancelProgress } = useProgress();

    if (!progressState) return null;

    const { progress, maxProgress, actionTitle } = progressState;

    return (
        <Modal visible={true} transparent={true}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>{actionTitle}</Text>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                            {`Progress: ${progress}`} {maxProgress < 0 ? '' : `of ${maxProgress}`}
                        </Text>
                        <View
                            style={{
                                width: "100%",
                                height: 10,
                                backgroundColor: "#e0e0e0",
                                borderRadius: 5,
                                overflow: "hidden",
                                marginBottom: 10,
                            }}
                        >
                            <View
                                style={{
                                    width: `${(progress / maxProgress) * 100}%`,
                                    height: "100%",
                                    backgroundColor: "#007BFF",
                                }}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={{
                            backgroundColor: "#007BFF",
                            padding: 10,
                            borderRadius: 5,
                            alignItems: "center",
                            width: "100%",
                        }}
                        onPress={() => cancelProgress()}
                    >
                        <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default ProgressBar;