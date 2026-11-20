import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from './api';
import { dialog } from '../store/dialogStore';

const MAX_BYTES = 4.5 * 1024 * 1024;

const pickerOptions = (aspect) => ({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.5,
    base64: true,
});

/** Asks only for the permission the chosen source needs, at the moment it is needed. */
const launch = async (source, aspect) => {
    if (Platform.OS !== 'web') {
        const permission = source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
            dialog.alert('Permission required', source === 'camera'
                ? 'Allow camera access in your settings to take a photo.'
                : 'Allow photo access in your settings to choose a picture.');
            return null;
        }
    }
    const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions(aspect))
        : await ImagePicker.launchImageLibraryAsync(pickerOptions(aspect));
    if (result.canceled || !result.assets?.[0]?.base64) return null;

    const asset = result.assets[0];
    if ((asset.base64.length * 3) / 4 > MAX_BYTES) {
        dialog.alert('Image too large', 'Please choose a smaller picture (max 4.5 MB).');
        return null;
    }
    const mime = asset.mimeType && asset.mimeType.startsWith('image/') ? asset.mimeType : 'image/jpeg';
    return { uri: asset.uri, dataUrl: `data:${mime === 'image/jpg' ? 'image/jpeg' : mime};base64,${asset.base64}` };
};

/**
 * Lets the user choose Camera or Gallery, then returns { uri, dataUrl } or null.
 */
export const pickImage = ({ aspect = [4, 3], title = 'Add a photo' } = {}) =>
    new Promise((resolve) => {
        dialog.alert(title, 'Choose where to get the image from', [
            { text: 'Camera', onPress: () => launch('camera', aspect).then(resolve) },
            { text: 'Gallery', onPress: () => launch('library', aspect).then(resolve) },
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
        ], { icon: 'camera' }); // tapping outside counts as Cancel
    });

/** Uploads a picked image to the API (which stores it on Cloudinary). Returns { url, publicId }. */
export const uploadImage = (dataUrl, kind) => api('/uploads/image', { method: 'POST', body: { image: dataUrl, kind } });
