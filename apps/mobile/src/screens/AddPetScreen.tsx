import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, radius, space } from '../theme';
import { Pets } from '../api/endpoints';

export function AddPetScreen({ navigation }: any) {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>({ name: '', species: 'DOG', breedPrimary: '', size: 'MEDIUM', gender: 'MALE' });

  const create = useMutation({
    mutationFn: async () => {
      const loc = await Location.getCurrentPositionAsync({}).catch(() => null);
      return Pets.create({ ...form, lat: loc?.coords.latitude, lng: loc?.coords.longitude });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-pets'] }); navigation.goBack(); },
    onError: (e: any) => Alert.alert(e?.response?.data?.message ?? 'Failed'),
  });

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: space.xl }}>
      <Text style={s.h1}>Add a pet</Text>
      <Field label="Name"><TextInput style={s.input} value={form.name} onChangeText={t => setForm({...form, name: t})} placeholderTextColor={colors.grey} placeholder="Luna" /></Field>
      <Field label="Species">
        <SegRow value={form.species} onChange={v => setForm({...form, species: v})} options={['DOG','CAT','RABBIT','BIRD','EXOTIC','OTHER']} />
      </Field>
      <Field label="Breed"><TextInput style={s.input} value={form.breedPrimary} onChangeText={t => setForm({...form, breedPrimary: t})} placeholderTextColor={colors.grey} placeholder="Golden Retriever" /></Field>
      <Field label="Size">
        <SegRow value={form.size} onChange={v => setForm({...form, size: v})} options={['TOY','SMALL','MEDIUM','LARGE','GIANT']} />
      </Field>
      <Field label="Gender">
        <SegRow value={form.gender} onChange={v => setForm({...form, gender: v})} options={['MALE','FEMALE']} />
      </Field>
      <Pressable onPress={() => create.mutate()} disabled={!form.name || create.isPending} style={[s.cta, (!form.name || create.isPending) && { opacity: 0.5 }]}>
        <Text style={s.ctaText}>{create.isPending ? 'Saving…' : 'Save pet'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const Field = ({ label, children }: any) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={s.label}>{label}</Text>
    {children}
  </View>
);

const SegRow = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    {options.map(opt => (
      <Pressable key={opt} onPress={() => onChange(opt)}
        style={[s.chip, value === opt && { backgroundColor: colors.coral }]}>
        <Text style={[s.chipText, value === opt && { color: 'white' }]}>{opt}</Text>
      </Pressable>
    ))}
  </View>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink, marginBottom: 24 },
  label: { fontSize: 12, color: colors.grey, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: 'white', borderRadius: radius.lg, padding: 14, color: colors.ink },
  chip: { backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  chipText: { color: colors.ink, fontWeight: '600' },
  cta: { backgroundColor: colors.coral, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  ctaText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
