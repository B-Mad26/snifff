import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { colors, space, radius } from '../theme';
import { Auth } from '../api/endpoints';
import { useAuth } from '../stores/authStore';

export function OtpScreen({ route }: any) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useAuth(s => s.signIn);

  const verify = async () => {
    setLoading(true);
    try {
      const r = await Auth.verifyOtp(phone, code);
      await signIn(r.accessToken, r.refreshToken);
    } catch (e: any) { Alert.alert(e?.response?.data?.message ?? 'Invalid code'); }
    finally { setLoading(false); }
  };

  return (
    <View style={s.root}>
      <Text style={s.h1}>Enter the code</Text>
      <Text style={s.p}>Sent to {phone}</Text>
      <TextInput value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad"
        autoFocus maxLength={6} style={s.input} placeholderTextColor={colors.grey} />
      <Pressable onPress={verify} disabled={loading || code.length < 4} style={[s.cta, (loading || code.length < 4) && { opacity: 0.6 }]}>
        <Text style={s.ctaText}>{loading ? 'Verifying…' : 'Verify'}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: space.xl, paddingTop: 80, backgroundColor: colors.cream },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink },
  p: { color: colors.grey, marginTop: 8, marginBottom: 24 },
  input: { backgroundColor: 'white', borderRadius: radius.lg, padding: 16, fontSize: 28, color: colors.ink, textAlign: 'center', letterSpacing: 12 },
  cta: { backgroundColor: colors.coral, borderRadius: radius.pill, paddingVertical: 18, alignItems: 'center', marginTop: 24 },
  ctaText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
