// Cloud9 App Layout - Dedicated Triple-Marble Experience
import React, { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Animated } from 'react-native';
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
          <View style={styles.loadingLogo}>
            <View style={[styles.loadingDot, { backgroundColor: CLOUD9_COLORS.marbleRed }]} />
            <View style={[styles.loadingDot, { backgroundColor: CLOUD9_COLORS.marbleBlue }]} />
            <View style={[styles.loadingDot, { backgroundColor: CLOUD9_COLORS.marbleGreen }]} />
          </View>
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
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  loadingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
});
