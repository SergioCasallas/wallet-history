import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useState, useEffect } from "react";
import { Button, ScrollView, Text, View, Alert } from "react-native";

export default function App() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    async function checkPermissions() {
      const result = await ExpoSpeechRecognitionModule.getPermissionsAsync();

      if (result.granted) {
        setHasPermission(true);
      } else if (!result.canAskAgain) {
        Alert.alert(
          "Permiso requerido",
          "Debes habilitar manualmente el permiso de micrófono en la configuración del dispositivo.",
          [{ text: "OK" }]
        );
      }
    }
    checkPermissions();
  }, []);

  const requestPermission = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (result.granted) {
      setHasPermission(true);
    } else {
      Alert.alert(
        "Permiso denegado",
        "No puedes usar el reconocimiento de voz sin conceder permisos."
      );
    }
  };

  const handleStart = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 2,
      continuous: true,
      requiresOnDeviceRecognition: false,
      addsPunctuation: true,
      contextualStrings: ["Carlsen", "Nepomniachtchi", "Praggnanandhaa"],
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 300,
      },
    });
  };

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("result", (event) => {
    console.log(event.results);
    setTranscript(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("Error code:", event.error, "Error message:", event.message);
  });

  return (
    <View>
      {!recognizing ? (
        <Button title="Start" onPress={handleStart} />
      ) : (
        <Button
          title="Stop"
          onPress={() => ExpoSpeechRecognitionModule.stop()}
        />
      )}

      {!hasPermission && (
        <Button title="Solicitar Permiso" onPress={requestPermission} />
      )}

      <ScrollView>
        <Text>{transcript}</Text>
      </ScrollView>
    </View>
  );
}
