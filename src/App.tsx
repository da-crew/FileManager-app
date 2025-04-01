import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import ContentContainer, { ContentContainerRouteParams } from './screens/ContentContainer';
import DuplicateFiles from './screens/Duplicates';
import HomeScreen from './screens/HomeScreen';
import LargeFiles from './screens/LargeFiles';
import RecycleBin from './screens/RecycleBin';
import SearchScreen from './screens/Search';
import SettingsScreen from './screens/Settings';
import TestScreen from './screens/TestScreen';
import TextEditor from './screens/TextEditor';

export type RootStackParamList = {
    Home: undefined,
    LargeFiles: undefined,
    Duplicates: undefined,
    RecycleBin: undefined,
    Test: undefined,
    Container: ContentContainerRouteParams,
    TextEditor: ContentContainerRouteParams,
};

const Stack = createNativeStackNavigator();

export default function App() {
    return <NavigationContainer>
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
    </NavigationContainer>;
}
