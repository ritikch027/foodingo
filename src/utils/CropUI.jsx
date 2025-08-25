import React, { useRef, useState } from 'react';
import { View, Button, StyleSheet, useColorScheme } from 'react-native';
import { CropView } from 'react-native-image-crop-tools';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyCropScreen() {
  const insets = useSafeAreaInsets();
  const cropRef = useRef(null);
  const [uri, setUri] = useState(null);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, res => {
      if (res.assets?.[0]?.uri) setUri(res.assets[0].uri);
    });
  };

  const saveCropped = () => {
    cropRef.current?.saveImage(true, 90);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Button title="Pick Image" onPress={pickImage} />

      {uri && (
        <CropView
          sourceUrl={uri}
          style={styles.cropView}
          ref={cropRef}
          keepAspectRatio
          aspectRatio={{ width: 1, height: 1 }}
          onImageCrop={res => console.log('cropped URI:', res.uri)}
        />
      )}

      {uri && <Button title="Crop & Save" onPress={saveCropped} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cropView: { flex: 1, margin: 10, borderRadius: 10 },
});
