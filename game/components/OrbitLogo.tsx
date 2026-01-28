import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../constants';

interface OrbitLogoProps {
  size?: number;
  color?: string;
}

// SVG path that recreates the Cloud9-style interlocking loops logo
export function OrbitLogo({ size = 100, color = COLORS.skyBlue }: OrbitLogoProps) {
  const scale = size / 100;

  return (
    <View style={[styles.container, { width: size, height: size * 0.7 }]}>
      <Svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 100 70"
      >
        <Defs>
          <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.skyBlueLight} />
            <Stop offset="100%" stopColor={COLORS.skyBlue} />
          </LinearGradient>
        </Defs>

        {/* Left loop */}
        <Path
          d="M 20 35
             C 20 20, 35 10, 50 20
             C 45 15, 35 15, 30 20
             C 15 30, 15 45, 30 55
             C 35 60, 45 55, 50 45
             C 35 55, 20 50, 20 35
             Z"
          fill="url(#logoGradient)"
        />

        {/* Right loop */}
        <Path
          d="M 80 35
             C 80 20, 65 10, 50 20
             C 55 15, 65 15, 70 20
             C 85 30, 85 45, 70 55
             C 65 60, 55 55, 50 45
             C 65 55, 80 50, 80 35
             Z"
          fill="url(#logoGradient)"
        />

        {/* Bottom connector loop */}
        <Path
          d="M 50 45
             C 40 50, 35 60, 45 65
             C 48 67, 52 67, 55 65
             C 65 60, 60 50, 50 45
             Z"
          fill="url(#logoGradient)"
        />

        {/* Center overlap detail */}
        <Path
          d="M 45 30
             C 48 28, 52 28, 55 30
             C 55 35, 52 38, 50 40
             C 48 38, 45 35, 45 30
             Z"
          fill={COLORS.bgDark}
          opacity={0.3}
        />
      </Svg>
    </View>
  );
}

// Simpler stylized O for smaller uses
export function OrbitIcon({ size = 40, color = COLORS.skyBlue }: OrbitLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
          <LinearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.skyBlueLight} />
            <Stop offset="100%" stopColor={COLORS.skyBlueDark} />
          </LinearGradient>
        </Defs>

        {/* Outer ring */}
        <Path
          d="M 20 2
             A 18 18 0 1 1 20 38
             A 18 18 0 1 1 20 2
             M 20 8
             A 12 12 0 1 0 20 32
             A 12 12 0 1 0 20 8"
          fill="url(#iconGradient)"
          fillRule="evenodd"
        />

        {/* Orbital path accent */}
        <Path
          d="M 8 20
             C 8 28, 14 34, 22 34
             C 18 30, 16 26, 16 20
             C 16 14, 18 10, 22 6
             C 14 6, 8 12, 8 20"
          fill={COLORS.white}
          opacity={0.3}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
