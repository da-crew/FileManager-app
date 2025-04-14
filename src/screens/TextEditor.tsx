import { MaterialIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as RNFS from 'react-native-fs';
import { RootStackParamList } from '../App';
import { ContentContainerRouteParams } from '../components/ContentContainer/common';
import { useTheme } from '../components/ThemeContext';

export default function TextEditor({ route, navigation }: NativeStackScreenProps<RootStackParamList>) {
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { path, containerName } = route.params as ContentContainerRouteParams;
  const filePath = path.build();
  const { theme } = useTheme();
  useEffect(() => {
    loadFile();
  }, []);


  useEffect(() => {
    const backAction = () => {
      if (hasUnsavedChanges) {
        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Do you want to save them?',
          [
            {
              text: "Don't Save", style: 'destructive', onPress: () => {
                path.nodes.pop();
                navigation.goBack();
              }
            },
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save', onPress: async () => {
                await saveFile();
                path.nodes.pop();
                navigation.goBack();
              }
            },
          ]
        );
        return true; // Prevent default back behavior
      }
      path.nodes.pop();
      navigation.goBack();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation, hasUnsavedChanges, content]);

  const loadFile = async () => {
    try {
      console.log("Loading file from:", filePath);
      const fileContent = await RNFS.readFile(filePath, 'utf8');
      setContent(fileContent);
      setOriginalContent(fileContent);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error loading file:", error);
      Alert.alert('Error', 'Failed to load file.');
    }
  };

  const saveFile = async () => {
    if (hasUnsavedChanges) {
      try {
        console.log("Saving file to:", filePath);
        await RNFS.writeFile(filePath, content, 'utf8');
        setOriginalContent(content);
        setHasUnsavedChanges(false);
        Alert.alert('Success', 'File saved!');
      } catch (error) {
        console.error("Error saving file:", error);
        Alert.alert('Error', 'Failed to save file.');
      }
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== originalContent);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them?',
        [
          {
            text: "Don't Save", style: 'destructive', onPress: () => {
              path.nodes.pop();
              navigation.goBack();
            }
          },
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save', onPress: async () => {
              try {
                await saveFile();
                path.nodes.pop();
                navigation.goBack();
              } catch (error) {
                console.error("Save failed", error)
              }
            }
          },
        ]
      );
    } else {
      path.nodes.pop();
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background }}>
        <TouchableOpacity style={{ padding: 15, marginRight: 0 }} onPress={handleBack}>
          <MaterialIcons name="arrow-back-ios-new" size={20} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, color: theme.text }}>{filePath.split('/').pop()}</Text>
        <TouchableOpacity
          style={{ marginLeft: 'auto', marginRight: 15 }}
          onPress={saveFile}
        >
          <Ionicons name="save-sharp" size={24} color={hasUnsavedChanges ? "black" : "gray"} />
        </TouchableOpacity>
      </View>

      <View style={styles.editorContainer}>
        <TextInput
          style={styles.input}
          multiline
          value={content}
          onChangeText={handleContentChange}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editorContainer: {
    flex: 1,
    padding: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 0,
    borderRadius: 5,
  },
  saveButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonSaved: {
    backgroundColor: '#d9d9d9',
  },
  saveButtonUnsaved: {
    backgroundColor: '#007AFF',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unsavedChanges: {
    backgroundColor: '#FFE5B4',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  unsavedText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
  },
});
