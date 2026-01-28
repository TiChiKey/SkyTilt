import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, PanResponder, Animated } from 'react-native';
import { JoystickInput } from '../types';
import { COLORS } from '../constants';

interface VirtualJoystickProps {
  size?: number;
  onMove: (input: JoystickInput) => void;
  disabled?: boolean;
}

export function VirtualJoystick({
  size = 120,
  onMove,
  disabled = false,
}: VirtualJoystickProps) {
  const [isActive, setIsActive] = useState(false);
  const knobPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const containerRef = useRef<View>(null);

  const maxOffset = size / 2 - 20; // Knob size is 40

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,

      onPanResponderGrant: () => {
        setIsActive(true);
      },

      onPanResponderMove: (_, gestureState) => {
        // Calculate offset from center
        let offsetX = gestureState.dx;
        let offsetY = gestureState.dy;

        // Clamp to circle
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        if (distance > maxOffset) {
          offsetX = (offsetX / distance) * maxOffset;
          offsetY = (offsetY / distance) * maxOffset;
        }

        // Update knob position
        knobPosition.setValue({ x: offsetX, y: offsetY });

        // Calculate normalized input (-1 to 1)
        const normalizedX = offsetX / maxOffset;
        const normalizedY = offsetY / maxOffset;

        onMove({
          x: normalizedX,
          y: normalizedY,
          active: true,
        });
      },

      onPanResponderRelease: () => {
        // Reset to center
        Animated.spring(knobPosition, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: false,
        }).start();

        setIsActive(false);
        onMove({ x: 0, y: 0, active: false });
      },

      onPanResponderTerminate: () => {
        // Reset to center
        Animated.spring(knobPosition, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: false,
        }).start();

        setIsActive(false);
        onMove({ x: 0, y: 0, active: false });
      },
    })
  ).current;

  if (disabled) {
    return null;
  }

  return (
    <View
      ref={containerRef}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: isActive ? 1 : 0.6,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Base circle */}
      <View
        style={[
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />

      {/* Direction indicators */}
      <View style={styles.indicators}>
        <View style={[styles.indicator, styles.indicatorTop]} />
        <View style={[styles.indicator, styles.indicatorBottom]} />
        <View style={[styles.indicator, styles.indicatorLeft]} />
        <View style={[styles.indicator, styles.indicatorRight]} />
      </View>

      {/* Knob */}
      <Animated.View
        style={[
          styles.knob,
          {
            transform: [
              { translateX: knobPosition.x },
              { translateY: knobPosition.y },
            ],
            backgroundColor: isActive ? COLORS.skyBlue : COLORS.skyBlueLight,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  base: {
    position: 'absolute',
    backgroundColor: 'rgba(45, 175, 229, 0.2)',
    borderWidth: 2,
    borderColor: COLORS.skyBlueTranslucent,
  },
  indicators: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    width: 4,
    height: 10,
    backgroundColor: COLORS.skyBlueTranslucent,
    borderRadius: 2,
  },
  indicatorTop: {
    top: 8,
    left: '50%',
    marginLeft: -2,
  },
  indicatorBottom: {
    bottom: 8,
    left: '50%',
    marginLeft: -2,
  },
  indicatorLeft: {
    left: 8,
    top: '50%',
    marginTop: -5,
    width: 10,
    height: 4,
  },
  indicatorRight: {
    right: 8,
    top: '50%',
    marginTop: -5,
    width: 10,
    height: 4,
  },
  knob: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
