import {SafeAreaView,Text,StyleSheet,StatusBar} from "react-native";

export default function LargeFiles() {

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Text>Large File Scanner Screen</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
});
