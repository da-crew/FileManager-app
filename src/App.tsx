import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import ContentContainer from './screens/ContentContainer';
import LargeFiles from './screens/LargeFiles';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import DuplicateFiles from './screens/Duplicates';
import RecycleBin from './screens/RecycleBin';
import SearchScreen from './screens/Search';
import SettingsScreen from './screens/Settings';
import TestScreen from './screens/TestScreen';
import { ContentContainerRouteParams } from './components/ContentContainer/common';
import TextEditor from './screens/TextEditor';
import { ProgressProvider } from './components/ProgressBar/ProgressContext';
import ImageViewer from './screens/ImageViewer';
import ProgressBar from './components/ProgressBar/ProgressBar';
import { ThemeProvider } from './components/ThemeContext';

export type RootStackParamList = {
    Home: undefined,
    LargeFiles: undefined,
    Duplicates: undefined,
    RecycleBin: undefined,
    Test: undefined,
    Container: ContentContainerRouteParams,
    TextEditor: ContentContainerRouteParams,
    Search: ContentContainerRouteParams,
    Settings: undefined,
    ImageViewer: {
        imagePath: string;
        imageName: string;
    }
};

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <ThemeProvider>
            <ProgressProvider>
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
                        <Stack.Screen name="TextEditor" component={TextEditor} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ProgressProvider>
        </ThemeProvider>
    );
}
