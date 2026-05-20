import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { colors, radius, space } from '../theme';
import { Chats } from '../api/endpoints';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'http://localhost:4000/ws';

export function ChatScreen({ route, navigation }: any) {
  const { chatId, match } = route.params;
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const socketRef = useRef<Socket | null>(null);

  const messages = useQuery({ queryKey: ['chat', chatId], queryFn: () => Chats.messages(chatId) });

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      socketRef.current = io(WS_URL, { auth: { token }, transports: ['websocket'] });
      socketRef.current.emit('chat:join', { chatId });
      socketRef.current.on('message:new', (msg: any) => {
        qc.setQueryData(['chat', chatId], (old: any) => [msg, ...(old ?? [])]);
      });
    })();
    return () => { socketRef.current?.disconnect(); };
  }, [chatId]);

  const send = async () => {
    if (!text.trim()) return;
    await Chats.send(chatId, { type: 'TEXT', content: text });
    setText('');
    messages.refetch();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()}><Text style={s.back}>‹</Text></Pressable>
        <Text style={s.title}>{match.petA.name} ↔ {match.petB.name}</Text>
      </View>
      <FlatList
        inverted
        data={messages.data ?? []}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.blocked && { opacity: 0.4 }]}>
            {item.blocked && <Text style={s.warn}>⚠ blocked by safety filter</Text>}
            <Text style={s.bubbleText}>{item.content}</Text>
          </View>
        )}
      />
      <View style={s.composer}>
        <TextInput
          value={text} onChangeText={setText}
          placeholder="Say something nice…" placeholderTextColor={colors.grey}
          style={s.input} multiline
        />
        <Pressable onPress={send} style={s.send}><Text style={s.sendText}>↑</Text></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: 'row', alignItems: 'center', padding: space.lg, paddingTop: 56, backgroundColor: 'white', gap: 12 },
  back: { fontSize: 28, color: colors.coral, paddingHorizontal: 8 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink },
  bubble: { backgroundColor: 'white', padding: 12, borderRadius: radius.lg, marginVertical: 4, alignSelf: 'flex-start', maxWidth: '85%' },
  bubbleText: { color: colors.ink },
  warn: { color: colors.coral, fontSize: 10, marginBottom: 4 },
  composer: { flexDirection: 'row', padding: 12, backgroundColor: 'white', gap: 8, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: colors.cream, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 10, color: colors.ink, maxHeight: 100 },
  send: { backgroundColor: colors.coral, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: 'white', fontSize: 22, fontWeight: '900' },
});
