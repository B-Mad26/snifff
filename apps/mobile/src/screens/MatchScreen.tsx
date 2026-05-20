import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, space } from '../theme';

export function MatchScreen({ route, navigation }: any) {
  const { match } = route.params;
  return (
    <LinearGradient colors={[colors.coral, colors.peach]} style={s.root}>
      <Text style={s.bang}>It’s a Sniff!</Text>
      <Text style={s.sub}>{match.petA.name} & {match.petB.name} matched. Compatibility {match.compatibilityScore}.</Text>
      <View style={s.row}>
        <Image source={{ uri: match.petA.photos?.[0]?.url }} style={s.avatar} />
        <Image source={{ uri: match.petB.photos?.[0]?.url }} style={s.avatar} />
      </View>
      <View style={s.actions}>
        <Pressable style={[s.cta, { backgroundColor: 'white' }]} onPress={() => navigation.replace('Chat', { chatId: match.chat.id, match })}>
          <Text style={[s.ctaText, { color: colors.coral }]}>Send a message</Text>
        </Pressable>
        <Pressable style={[s.cta, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={() => navigation.goBack()}>
          <Text style={s.ctaText}>Keep sniffing</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  bang: { color: 'white', fontWeight: '900', fontSize: 56 },
  sub:  { color: colors.cream, marginTop: 12, textAlign: 'center', fontSize: 16 },
  row:  { flexDirection: 'row', gap: -24, marginVertical: 40 },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: 'white', backgroundColor: colors.lightCoral },
  actions: { width: '100%', gap: 12 },
  cta: { borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
