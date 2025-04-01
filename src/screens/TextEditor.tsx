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
  const { path, containerName } = route.params as ContentContainerRouteParams;
  const filePath = path.build();

  useEffect(() => {
    loadFile();
  }, []);

  const loadFile = async () => {
    try {
      console.log("Loading file from:", filePath);
      const fileContent = await RNFS.readFile(filePath, 'utf8');
      setContent(fileContent);
    } catch (error) {
      console.error("Error loading file:", error);
      Alert.alert('Error', 'Failed to load file.');
    }
  };

  const saveFile = async () => {
    try {
      console.log("Saving file to:", filePath);
      await RNFS.writeFile(filePath, content, 'utf8');
      Alert.alert('Success', 'File saved!');
    } catch (error) {
      console.error("Error saving file:", error);
      Alert.alert('Error', 'Failed to save file.');
    }
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
        <TextInput
          style={styles.input}
          multiline
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity onPress={saveFile} style={styles.saveButton}>
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
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
