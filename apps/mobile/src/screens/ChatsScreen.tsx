import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, radius, space } from '../theme';
import { Chats } from '../api/endpoints';

export function ChatsScreen({ navigation }: any) {
  const q = useQuery({ queryKey: ['chats'], queryFn: Chats.list });

  return (
    <View style={s.root}>
      <Text style={s.h1}>Chats</Text>
      <FlatList
        data={q.data ?? []}
        keyExtractor={(item: any) => item.id}
        ListEmptyComponent={<Text style={s.empty}>No chats yet — keep sniffing 🐾</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.row} onPress={() => navigation.navigate('Chat', { chatId: item.id, match: item.match })}>
            <Image source={{ uri: item.match.petA.photos?.[0]?.url }} style={s.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.match.petA.name} ↔ {item.match.petB.name}</Text>
              <Text style={s.preview} numberOfLines={1}>{item.messages?.[0]?.content ?? 'Say hi!'}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, padding: space.lg, paddingTop: 64 },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink, marginBottom: 16 },
  empty: { color: colors.grey, textAlign: 'center', marginTop: 64 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderRadius: radius.lg, marginBottom: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: colors.lightCoral },
  name: { fontWeight: '700', color: colors.ink },
  preview: { color: colors.grey, marginTop: 2, fontSize: 13 },
});
