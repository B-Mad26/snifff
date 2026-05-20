import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { TabNavigator } from './TabNavigator';
import { useAuth } from '../stores/authStore';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PhoneSignInScreen } from '../screens/PhoneSignInScreen';
import { OtpScreen } from '../screens/OtpScreen';
import { AddPetScreen } from '../screens/AddPetScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { MatchScreen } from '../screens/MatchScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { hydrated, authed, hydrate } = useAuth();
  useEffect(() => { hydrate(); }, []);

  if (!hydrated) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cream }}>
      <ActivityIndicator size="large" color={colors.coral} />
    </View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        {!authed ? (
          <>
            <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
            <Stack.Screen name="PhoneSignIn" component={PhoneSignInScreen} />
            <Stack.Screen name="Otp"         component={OtpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="AddPet" component={AddPetScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Match"  component={MatchScreen}  options={{ presentation: 'transparentModal', animation: 'fade' }} />
            <Stack.Screen name="Chat"   component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
