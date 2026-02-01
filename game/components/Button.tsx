import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 14, paddingHorizontal: 28 },
    large: { paddingVertical: 18, paddingHorizontal: 36 },
  };

  const textSizes = {
    small: 14,
    medium: 16,
    large: 18,
  };

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.buttonBase, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isDisabled
              ? [COLORS.charcoalLight, COLORS.charcoal]
              : [COLORS.skyBlueLight, COLORS.skyBlue, COLORS.skyBlueDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, sizeStyles[size], styles.rounded]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              {icon}
              <Text
                style={[
                  styles.textPrimary,
                  { fontSize: textSizes[size] },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.buttonBase,
          styles.secondaryButton,
          sizeStyles[size],
          isDisabled && styles.disabledButton,
          style,
        ]}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.skyBlue} />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.textSecondary,
                { fontSize: textSizes[size] },
                isDisabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Ghost variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.buttonBase,
        styles.ghostButton,
        sizeStyles[size],
        style,
      ]}
      activeOpacity={0.6}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.textSecondary} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.textGhost,
              { fontSize: textSizes[size] },
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// Icon button for back, settings, etc.
interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: number;
  style?: ViewStyle;
}

export function IconButton({ onPress, icon, size = 44, style }: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.iconButton,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 25,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rounded: {
    borderRadius: 25,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.skyBlue,
    borderRadius: 25,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    borderColor: COLORS.textMuted,
  },
  textPrimary: {
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  textSecondary: {
    color: COLORS.skyBlue,
    fontWeight: '600',
    textAlign: 'center',
  },
  textGhost: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledText: {
    color: COLORS.textMuted,
  },
  iconButton: {
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.skyBlueTranslucent,
  },
});
