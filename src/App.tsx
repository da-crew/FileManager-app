import * as FileSystem from 'expo-file-system';
import * as React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './components/ThemeContext';
import HomeScreen from './screens/HomeScreen';
import ContentContainer, { ContentContainerRouteParams } from './screens/ContentContainer';
import LargeFiles from './screens/LargeFiles';
import DuplicateFiles from './screens/Duplicates';
import RecycleBin from './screens/RecycleBin';
import SearchScreen from './screens/Search';
import SettingsScreen from './screens/Settings';
import TestScreen from './screens/TestScreen';

export type RootStackParamList = {
    Home: undefined,
    LargeFiles: undefined,
    Duplicates: undefined,
    RecycleBin: undefined,
    Test: undefined,
    Container: ContentContainerRouteParams,
};

const Stack = createNativeStackNavigator();

export default function App() {
    return (
    <ThemeProvider>
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Container" component={ContentContainer} />
                <Stack.Screen name="LargeFiles" component={LargeFiles} />
             <Stack.Screen name="Duplicates" component={DuplicateFiles} />
                <Stack.Screen name="RecycleBin" component={RecycleBin} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Test" component={TestScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    </ThemeProvider>
    );
}
