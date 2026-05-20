import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Pressable, Image } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space } from '../theme';
import { Posts } from '../api/endpoints';

const { height } = Dimensions.get('window');
const TAIL_H = height - 72;

export function TailsScreen() {
  const q = useQuery({ queryKey: ['tails'], queryFn: () => Posts.feedTails() });

  return (
    <FlatList
      data={q.data ?? []}
      keyExtractor={(item: any) => item.id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={TAIL_H}
      decelerationRate="fast"
      renderItem={({ item }) => <TailCard tail={item} />}
      style={{ backgroundColor: colors.ink }}
    />
  );
}

function TailCard({ tail }: any) {
  const like = useMutation({
    mutationFn: () => Posts.like(tail.id),
    onMutate: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  });
  const photo = tail.media?.[0]?.url ?? tail.pet?.photos?.[0]?.url;
  return (
    <View style={s.root}>
      {photo ? <Image source={{ uri: photo }} style={s.img} /> : <View style={[s.img, { backgroundColor: colors.coral }]} />}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={s.fade} />
      <View style={s.meta}>
        <Text style={s.name}>{tail.pet?.name ?? 'Snifff pup'}</Text>
        <Text style={s.caption} numberOfLines={3}>{tail.caption}</Text>
      </View>
      <View style={s.actions}>
        <Pressable onPress={() => like.mutate()} style={s.actBtn}><Text style={s.actText}>♥</Text></Pressable>
        <Pressable style={s.actBtn}><Text style={s.actText}>💬</Text></Pressable>
        <Pressable style={s.actBtn}><Text style={s.actText}>↗</Text></Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { width: '100%', height: TAIL_H, justifyContent: 'flex-end' },
  img:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  fade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  meta: { padding: space.xl, paddingBottom: 80 },
  name: { color: 'white', fontWeight: '700', fontSize: 20 },
  caption: { color: 'white', marginTop: 8, fontSize: 14, opacity: 0.95 },
  actions: { position: 'absolute', right: 12, bottom: 100, alignItems: 'center', gap: 18 },
  actBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  actText: { color: 'white', fontSize: 24 },
});
