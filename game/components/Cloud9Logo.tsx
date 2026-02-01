// Cloud9 Logo Component - Iconic interlocking loops design
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { CLOUD9_COLORS } from '../constants/cloud9';

interface Cloud9LogoProps {
  size?: number;
  color?: string;
}

// Full Cloud9 logo with interlocking loops
export function Cloud9Logo({ size = 100, color = CLOUD9_COLORS.primary }: Cloud9LogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size * 0.7 }]}>
      <Svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 100 70"
      >
        <Defs>
          <LinearGradient id="cloud9Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={CLOUD9_COLORS.primaryLight} />
            <Stop offset="100%" stopColor={CLOUD9_COLORS.primary} />
          </LinearGradient>
        </Defs>

        {/* Left loop - larger and positioned */}
        <Path
          d="M 25 30
             C 25 15, 40 5, 55 18
             C 48 10, 38 12, 32 18
             C 18 28, 18 45, 32 55
             C 38 60, 48 58, 55 48
             C 40 60, 25 50, 25 30
             Z"
          fill="url(#cloud9Gradient)"
        />

        {/* Right loop - mirrored */}
        <Path
          d="M 75 30
             C 75 15, 60 5, 45 18
             C 52 10, 62 12, 68 18
             C 82 28, 82 45, 68 55
             C 62 60, 52 58, 45 48
             C 60 60, 75 50, 75 30
             Z"
          fill="url(#cloud9Gradient)"
        />

        {/* Bottom connector/cloud element */}
        <Path
          d="M 50 48
             C 38 55, 32 65, 45 68
             C 48 70, 52 70, 55 68
             C 68 65, 62 55, 50 48
             Z"
          fill="url(#cloud9Gradient)"
        />

        {/* Number 9 element - stylized */}
        <Path
          d="M 47 25
             C 47 22, 50 20, 53 22
             C 55 24, 55 28, 53 30
             C 51 32, 49 35, 50 40
             L 52 40
             C 53 35, 55 32, 57 30
             C 60 27, 60 22, 57 19
             C 54 16, 48 16, 45 19
             C 42 22, 42 28, 45 31
             C 46 32, 47 30, 47 25
             Z"
          fill={CLOUD9_COLORS.background}
          opacity={0.9}
        />
      </Svg>
    </View>
  );
}

// Simple circular Cloud9 icon
export function Cloud9Icon({ size = 50, color = CLOUD9_COLORS.primary }: Cloud9LogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 50 50">
        <Defs>
          <LinearGradient id="cloud9IconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={CLOUD9_COLORS.primaryLight} />
            <Stop offset="100%" stopColor={CLOUD9_COLORS.primaryDark} />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={25}
          cy={25}
          r={23}
          fill="url(#cloud9IconGradient)"
        />

        {/* Simplified cloud shape */}
        <Path
          d="M 15 22
             C 15 18, 20 15, 25 18
             C 30 15, 35 18, 35 22
             C 38 22, 40 25, 38 28
             C 40 31, 38 35, 35 35
             L 15 35
             C 12 35, 10 31, 12 28
             C 10 25, 12 22, 15 22
             Z"
          fill={CLOUD9_COLORS.background}
        />

        {/* Small 9 element */}
        <Circle cx={25} cy={26} r={3} fill={CLOUD9_COLORS.primary} />
        <Path
          d="M 26 26 L 26 32"
          stroke={CLOUD9_COLORS.primary}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

// Three marbles indicator for multi-marble mode
export function ThreeMarblesIcon({ size = 60 }: { size?: number }) {
  const marbleSize = size * 0.3;
  const spacing = size * 0.35;

  return (
    <View style={[styles.container, { width: size, height: size * 0.6 }]}>
      <Svg width={size} height={size * 0.6} viewBox="0 0 60 36">
        <Defs>
          <LinearGradient id="redMarble" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B61" />
            <Stop offset="100%" stopColor="#CC2E26" />
          </LinearGradient>
          <LinearGradient id="blueMarble" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4DA3FF" />
            <Stop offset="100%" stopColor="#0062CC" />
          </LinearGradient>
          <LinearGradient id="greenMarble" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5ED880" />
            <Stop offset="100%" stopColor="#28A745" />
          </LinearGradient>
        </Defs>

        {/* Red marble */}
        <Circle cx={15} cy={18} r={10} fill="url(#redMarble)" />
        <Circle cx={12} cy={15} r={3} fill="rgba(255,255,255,0.5)" />

        {/* Blue marble */}
        <Circle cx={30} cy={18} r={10} fill="url(#blueMarble)" />
        <Circle cx={27} cy={15} r={3} fill="rgba(255,255,255,0.5)" />

        {/* Green marble */}
        <Circle cx={45} cy={18} r={10} fill="url(#greenMarble)" />
        <Circle cx={42} cy={15} r={3} fill="rgba(255,255,255,0.5)" />
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
