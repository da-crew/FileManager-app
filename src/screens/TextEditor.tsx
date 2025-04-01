import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as RNFS from 'react-native-fs';
import { RootStackParamList } from '../App';
import { PathDisplayer } from '../components/PathDisplayer';
import Toolbar from '../components/Toolbar';
import { ContentContainerRouteParams } from './ContentContainer';

export default function TextEditor({ route, navigation }: NativeStackScreenProps<RootStackParamList>) {
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { path, containerName } = route.params as ContentContainerRouteParams;
  const filePath = path.build();

  useEffect(() => {
    loadFile();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (hasUnsavedChanges) {
        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Do you want to save them?',
          [
            { text: "Don't Save", style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
            { text: 'Cancel', style: 'cancel' },
            { text: 'Save', onPress: async () => {
              await saveFile();
              navigation.dispatch(e.data.action);
            }},
          ]
        );
      }
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

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
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== originalContent);
  };

  const handleBack = () => {
    // Remove the file name from the path before going back
    path.nodes.pop();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Toolbar 
        navigation={navigation} 
        containerName={containerName}
        onBack={handleBack}
      />
      <PathDisplayer navpath={path} />
      <View style={styles.editorContainer}>
        {hasUnsavedChanges && (
          <View style={styles.unsavedChanges}>
            <Text style={styles.unsavedText}>You have unsaved changes</Text>
          </View>
        )}
        <TextInput
          style={styles.input}
          multiline
          value={content}
          onChangeText={handleContentChange}
        />
        <TouchableOpacity 
          onPress={saveFile} 
          style={[
            styles.saveButton,
            hasUnsavedChanges ? styles.saveButtonUnsaved : styles.saveButtonSaved
          ]}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
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
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
