import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { colors, space, radius } from '../theme';
import { Auth } from '../api/endpoints';

export function PhoneSignInScreen({ navigation }: any) {
  const [phone, setPhone] = useState('+1');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!/^\+\d{8,15}$/.test(phone)) { Alert.alert('Use E.164 format e.g. +14155551212'); return; }
    setLoading(true);
    try {
      await Auth.sendOtp(phone);
      navigation.navigate('Otp', { phone });
    } catch (e: any) { Alert.alert(e?.response?.data?.message ?? 'Failed to send code'); }
    finally { setLoading(false); }
  };

  return (
    <View style={s.root}>
      <Text style={s.h1}>What’s your number?</Text>
      <Text style={s.p}>We’ll text you a one-time code to sign in.</Text>
      <TextInput
        value={phone} onChangeText={setPhone} placeholder="+1 415 555 1212" keyboardType="phone-pad"
        autoFocus style={s.input} placeholderTextColor={colors.grey}
      />
      <Pressable onPress={send} disabled={loading} style={[s.cta, loading && { opacity: 0.6 }]}>
        <Text style={s.ctaText}>{loading ? 'Sending…' : 'Continue'}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: space.xl, paddingTop: 80, backgroundColor: colors.cream },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink },
  p: { color: colors.grey, marginTop: 8, marginBottom: 24 },
  input: { backgroundColor: 'white', borderRadius: radius.lg, padding: 16, fontSize: 18, color: colors.ink },
  cta: { backgroundColor: colors.coral, borderRadius: radius.pill, paddingVertical: 18, alignItems: 'center', marginTop: 24 },
  ctaText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
