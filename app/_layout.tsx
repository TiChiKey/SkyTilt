// Cloud9 App Layout - Dedicated Triple-Marble Experience
import React, { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Animated, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { gameStore } from '../game';
import { CLOUD9_COLORS } from '../game/constants/cloud9';

// Custom fade-to-blue transition component
function FadeTransition({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const blueOverlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading) {
      // Fade from blue to content
      Animated.sequence([
        Animated.timing(blueOverlay, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(blueOverlay, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isLoading]);

  return (
    <View style={styles.transitionContainer}>
      {children}
      <Animated.View
        style={[
          styles.blueOverlay,
          {
            opacity: blueOverlay,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize game store
    gameStore.initialize().then(() => {
      setIsInitialized(true);
    });
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingContent}>
          <Animated.View style={styles.loadingLogo}>
            <Image
              source={require('../assets/images/cloud9-logo-new.png')}
              style={styles.loadingLogoImage}
              resizeMode="contain"
            />
          </Animated.View>
          <ActivityIndicator size="large" color={CLOUD9_COLORS.primary} style={styles.spinner} />
        </View>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <FadeTransition isLoading={!isInitialized}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: CLOUD9_COLORS.background },
          animation: 'fade',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="levels" />
        <Stack.Screen name="calibration" />
        <Stack.Screen name="settings" />
        <Stack.Screen
          name="game/[levelId]"
          options={{
            gestureEnabled: false,
            animation: 'fade',
          }}
        />
      </Stack>
    </FadeTransition>
  );
}

const styles = StyleSheet.create({
  transitionContainer: {
    flex: 1,
  },
  blueOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CLOUD9_COLORS.primary,
    zIndex: 1000,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CLOUD9_COLORS.background,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    // No shadow to ensure seamless blending with white background
  },
  loadingLogoImage: {
    width: 180,
    height: 180,
    backgroundColor: 'transparent',
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
});
