import {SafeAreaView,View,Text,StyleSheet,StatusBar} from 'react-native';

export default function RecycleBin() {

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Text>Recycle Bin Screen</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    }
});
