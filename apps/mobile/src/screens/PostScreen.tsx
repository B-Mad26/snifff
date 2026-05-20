import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors, radius, space } from '../theme';
import { Pets, Posts, Uploads } from '../api/endpoints';

export function PostScreen({ navigation }: any) {
  const pets = useQuery({ queryKey: ['my-pets'], queryFn: Pets.mine });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const pet = pets.data?.[0];

  const create = useMutation({
    mutationFn: async () => {
      if (!photoUri || !pet) throw new Error('missing');
      // 1. sign upload URL
      const sign = await Uploads.sign('post.jpg', 'image/jpeg');
      // 2. PUT to R2
      const blob = await (await fetch(photoUri)).blob();
      await fetch(sign.uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/jpeg' } });
      // 3. create post
      return Posts.create({
        petId: pet.id, type: 'PHOTO',
        media: [{ url: sign.publicUrl }],
        caption,
      });
    },
    onSuccess: () => { setPhotoUri(null); setCaption(''); Alert.alert('Posted!'); navigation.navigate('Tails'); },
    onError: (e: any) => Alert.alert(e?.message ?? 'Failed to post'),
  });

  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!r.canceled) setPhotoUri(r.assets[0].uri);
  };

  return (
    <View style={s.root}>
      <Text style={s.h1}>New post</Text>
      <Pressable onPress={pickPhoto} style={s.picker}>
        {photoUri ? <Image source={{ uri: photoUri }} style={s.preview} /> : <Text style={s.pickerText}>+ Pick a photo</Text>}
      </Pressable>
      <TextInput
        placeholder="Write a caption…"
        placeholderTextColor={colors.grey}
        value={caption} onChangeText={setCaption}
        multiline style={s.input}
      />
      <Pressable disabled={!photoUri || create.isPending} onPress={() => create.mutate()}
        style={[s.cta, (!photoUri || create.isPending) && { opacity: 0.5 }]}>
        <Text style={s.ctaText}>{create.isPending ? 'Posting…' : 'Share'}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, padding: space.xl, paddingTop: 64 },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink, marginBottom: 16 },
  picker: { backgroundColor: 'white', borderRadius: radius.lg, height: 280, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pickerText: { color: colors.grey, fontSize: 16 },
  preview: { width: '100%', height: '100%' },
  input: { backgroundColor: 'white', borderRadius: radius.lg, padding: 16, marginTop: 16, minHeight: 80, color: colors.ink },
  cta: { backgroundColor: colors.coral, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  ctaText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
