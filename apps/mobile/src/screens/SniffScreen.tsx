import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Image } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, radius, space } from '../theme';
import { Matches, Pets, Swipes } from '../api/endpoints';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;
const CARD_H = CARD_W * 1.4;
const SWIPE_THRESH = width * 0.3;

export function SniffScreen({ navigation }: any) {
  const myPets   = useQuery({ queryKey: ['my-pets'],         queryFn: Pets.mine });
  const myPetId  = myPets.data?.[0]?.id;
  const stack    = useQuery({ queryKey: ['stack', myPetId],  queryFn: () => Matches.stack(myPetId), enabled: !!myPetId });
  const [idx, setIdx] = useState(0);
  const card = stack.data?.[idx];

  const tx = useSharedValue(0);
  const rot = useSharedValue(0);

  const swipe = useMutation({
    mutationFn: (action: 'SNIFF' | 'SUPER_SNIFF' | 'PASS') =>
      Swipes.swipe({ swiperPetId: myPetId, targetPetId: card.id, action, mode: 'FRIENDS' }),
    onSuccess: (r) => {
      if (r?.matched) navigation.navigate('Match', { match: r.match });
      setIdx(i => i + 1);
    },
  });

  const fly = (dir: 'left' | 'right' | 'up') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const target = dir === 'left' ? -width : dir === 'right' ? width : 0;
    tx.value = withTiming(target, { duration: 220 }, () => runOnJS(reset)());
    if (dir === 'up') swipe.mutate('SUPER_SNIFF');
    if (dir === 'right') swipe.mutate('SNIFF');
    if (dir === 'left')  swipe.mutate('PASS');
  };
  const reset = () => { tx.value = 0; rot.value = 0; };

  const pan = Gesture.Pan()
    .onChange(e => { tx.value = e.translationX; rot.value = (e.translationX / width) * 15; })
    .onEnd(e => {
      if (e.translationX >  SWIPE_THRESH) runOnJS(fly)('right');
      else if (e.translationX < -SWIPE_THRESH) runOnJS(fly)('left');
      else { tx.value = withSpring(0); rot.value = withSpring(0); }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { rotate: `${rot.value}deg` }],
  }));

  if (!myPetId) return (
    <View style={[s.center, { backgroundColor: colors.cream }]}>
      <Text style={s.h1}>Add your first pet</Text>
      <Text style={s.p}>Create a profile to start sniffing.</Text>
      <Pressable style={s.cta} onPress={() => navigation.navigate('AddPet')}>
        <Text style={s.ctaText}>Add a pet</Text>
      </Pressable>
    </View>
  );

  if (!card) return (
    <View style={[s.center, { backgroundColor: colors.cream }]}>
      <Text style={s.h1}>You’re all caught up</Text>
      <Text style={s.p}>Come back soon for fresh paws.</Text>
    </View>
  );

  return (
    <View style={s.root}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[s.card, cardStyle]}>
          <Image
            source={card.photos?.[0]?.url ? { uri: card.photos[0].url } : require('../../assets/icon.png')}
            style={s.photo}
            defaultSource={require('../../assets/icon.png') as any}
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={s.gradient} />
          <View style={s.compatRing}><Text style={s.compatText}>{card.compatibilityScore ?? 0}</Text></View>
          <View style={s.info}>
            <Text style={s.name}>{card.name} · {card.distance_km != null ? `${card.distance_km.toFixed(1)} km` : ''}</Text>
            <Text style={s.meta}>{card.breed_primary ?? card.breedPrimary ?? '—'} · {card.size ?? '—'}</Text>
          </View>
        </Animated.View>
      </GestureDetector>

      <View style={s.actions}>
        <Pressable style={[s.btn, s.btnPass]}  onPress={() => fly('left')}><Text style={s.btnTextPass}>✕</Text></Pressable>
        <Pressable style={[s.btn, s.btnSuper]} onPress={() => fly('up')}><Text style={s.btnTextSuper}>★</Text></Pressable>
        <Pressable style={[s.btn, s.btnSniff]} onPress={() => fly('right')}><Text style={s.btnTextSniff}>♥</Text></Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', paddingTop: 32, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  h1: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  p:  { color: colors.grey, textAlign: 'center', marginBottom: 24 },
  cta: { backgroundColor: colors.coral, paddingHorizontal: 32, paddingVertical: 14, borderRadius: radius.pill },
  ctaText: { color: 'white', fontWeight: '700' },
  card: { width: CARD_W, height: CARD_H, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.coral, elevation: 8, shadowColor: colors.coral, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  photo: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' },
  compatRing: { position: 'absolute', top: 16, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 3, borderColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  compatText: { color: colors.coral, fontWeight: '900', fontSize: 18 },
  info: { position: 'absolute', bottom: 24, left: 20, right: 20 },
  name: { color: 'white', fontSize: 26, fontWeight: '700' },
  meta: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 24 },
  btn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  btnPass: {}, btnSuper: {}, btnSniff: {},
  btnTextPass:  { color: colors.grey, fontSize: 26 },
  btnTextSuper: { color: colors.sky,  fontSize: 26 },
  btnTextSniff: { color: colors.coral, fontSize: 26 },
});
