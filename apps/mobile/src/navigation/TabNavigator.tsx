import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SniffScreen } from '../screens/SniffScreen';
import { TailsScreen } from '../screens/TailsScreen';
import { PostScreen } from '../screens/PostScreen';
import { ChatsScreen } from '../screens/ChatsScreen';
import { MeScreen } from '../screens/MeScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 22, fontWeight: '700', color: focused ? colors.coral : colors.grey }}>{label}</Text>
  </View>
);

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: colors.bone, borderTopWidth: 0, height: 72, paddingTop: 12, elevation: 8 },
        tabBarIcon: ({ focused }) => {
          const map: any = { Sniff: 'S', Tails: 'T', Post: '+', Chats: 'C', Me: 'M' };
          return <TabIcon label={map[route.name]} focused={focused} />;
        },
      })}>
      <Tab.Screen name="Sniff" component={SniffScreen} />
      <Tab.Screen name="Tails" component={TailsScreen} />
      <Tab.Screen name="Post"  component={PostScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Me"    component={MeScreen} />
    </Tab.Navigator>
  );
}
