import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, radius, space } from '../theme';
import { Auth, Pets } from '../api/endpoints';
import { useAuth } from '../stores/authStore';

export function MeScreen({ navigation }: any) {
  const me   = useQuery({ queryKey: ['me'], queryFn: Auth.me });
  const pets = useQuery({ queryKey: ['my-pets'], queryFn: Pets.mine });
  const signOut = useAuth(s => s.signOut);

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: space.xl, paddingTop: 64 }}>
      <Text style={s.h1}>You</Text>
      <View style={s.card}>
        <Text style={s.tier}>{me.data?.subscriptionTier ?? 'FREE'} tier</Text>
        <Text style={s.streak}>🔥 {me.data?.streak ?? 0}-day streak</Text>
      </View>

      <Text style={s.section}>Your pets</Text>
      {pets.data?.map((p: any) => (
        <View key={p.id} style={s.petRow}>
          <Image source={{ uri: p.photos?.[0]?.url }} style={s.petImg} />
          <View style={{ flex: 1 }}>
            <Text style={s.petName}>{p.name}</Text>
            <Text style={s.petMeta}>{p.breedPrimary ?? p.species} · {p.size ?? 'medium'}</Text>
          </View>
        </View>
      ))}
      <Pressable style={s.cta} onPress={() => navigation.navigate('AddPet')}>
        <Text style={s.ctaText}>+ Add another pet</Text>
      </Pressable>

      <Text style={s.section}>Premium</Text>
      <Pressable style={[s.cta, { backgroundColor: colors.gold }]}>
        <Text style={s.ctaText}>Upgrade to Snifff+</Text>
      </Pressable>

      <Pressable style={[s.cta, { backgroundColor: 'transparent', marginTop: 32 }]} onPress={signOut}>
        <Text style={[s.ctaText, { color: colors.grey }]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink, marginBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: radius.lg, padding: 18 },
  tier: { color: colors.coral, fontWeight: '700' },
  streak: { color: colors.ink, marginTop: 6 },
  section: { fontSize: 12, color: colors.grey, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 28, marginBottom: 8 },
  petRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: radius.lg, padding: 12, marginBottom: 8 },
  petImg: { width: 56, height: 56, borderRadius: 28, marginRight: 12, backgroundColor: colors.lightCoral },
  petName: { fontWeight: '700', color: colors.ink, fontSize: 16 },
  petMeta: { color: colors.grey, marginTop: 2, fontSize: 13 },
  cta: { backgroundColor: colors.coral, borderRadius: radius.pill, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  ctaText: { color: 'white', fontWeight: '700' },
});
