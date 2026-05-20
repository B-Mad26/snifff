import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space, radius } from '../theme';

export function OnboardingScreen({ navigation }: any) {
  return (
    <LinearGradient colors={[colors.coral, colors.peach]} style={s.root}>
      <View style={s.center}>
        <Text style={s.brand}>SNIFFF</Text>
        <Text style={s.tag}>The home page of pet life.</Text>
        <Text style={s.sub}>Match. Play. Adopt. Sniff.</Text>
      </View>
      <Pressable style={s.cta} onPress={() => navigation.navigate('PhoneSignIn')}>
        <Text style={s.ctaText}>Get started</Text>
      </Pressable>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'space-between', padding: space.xl, paddingTop: 96, paddingBottom: 56 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  brand: { color: 'white', fontWeight: '900', fontSize: 80, letterSpacing: 4 },
  tag: { color: 'white', fontSize: 24, marginTop: 16, fontStyle: 'italic' },
  sub: { color: colors.cream, fontSize: 16, marginTop: 8 },
  cta: { backgroundColor: 'white', borderRadius: radius.pill, paddingVertical: 18, alignItems: 'center' },
  ctaText: { color: colors.coral, fontWeight: '700', fontSize: 18 },
});
