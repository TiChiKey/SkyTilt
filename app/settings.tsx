import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import {
  COLORS,
  Button,
  IconButton,
  GAME_CONFIG,
  useSettings,
  useCalibrationData,
  useProgress,
  useHaptics,
} from '../game';

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ icon, label, description, children }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { calibration } = useCalibrationData();
  const { resetProgress } = useProgress();
  const haptics = useHaptics({ enabled: settings.hapticsEnabled });

  const handleBack = () => {
    haptics.button();
    router.back();
  };

  const handleRecalibrate = () => {
    haptics.button();
    router.push('/calibration');
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all game progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            haptics.pitFall();
            await resetProgress();
            Alert.alert('Progress Reset', 'Your game progress has been reset.');
          },
        },
      ]
    );
  };

  const toggleSetting = async (
    key: keyof typeof settings,
    value: boolean
  ) => {
    haptics.button();
    await updateSettings({ [key]: value });
  };

  const updateSensitivity = async (value: number) => {
    await updateSettings({ tiltSensitivity: value });
  };

  return (
    <LinearGradient
      colors={[COLORS.bgDark, COLORS.bgMid]}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <IconButton
          onPress={handleBack}
          icon={<Ionicons name="arrow-back" size={24} color={COLORS.white} />}
        />
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Controls Section */}
        <SettingSection title="Controls">
          <SettingRow
            icon={
              <Ionicons
                name="phone-portrait-outline"
                size={22}
                color={COLORS.skyBlue}
              />
            }
            label="Tilt Sensitivity"
            description={`${(settings.tiltSensitivity * 100).toFixed(0)}%`}
          >
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={GAME_CONFIG.minSensitivity}
                maximumValue={GAME_CONFIG.maxSensitivity}
                value={settings.tiltSensitivity}
                onSlidingComplete={updateSensitivity}
                minimumTrackTintColor={COLORS.skyBlue}
                maximumTrackTintColor={COLORS.charcoal}
                thumbTintColor={COLORS.skyBlue}
              />
            </View>
          </SettingRow>

          <SettingRow
            icon={
              <Ionicons
                name="game-controller-outline"
                size={22}
                color={COLORS.skyBlue}
              />
            }
            label="Virtual Joystick"
            description="Alternative touch controls"
          >
            <Switch
              value={settings.virtualJoystickEnabled}
              onValueChange={(value) =>
                toggleSetting('virtualJoystickEnabled', value)
              }
              trackColor={{ false: COLORS.charcoal, true: COLORS.skyBlue }}
              thumbColor={COLORS.white}
            />
          </SettingRow>
        </SettingSection>

        {/* Calibration Section */}
        <SettingSection title="Calibration">
          <View style={styles.calibrationStatus}>
            <View style={styles.calibrationInfo}>
              <View
                style={[
                  styles.calibrationIndicator,
                  {
                    backgroundColor: calibration.isCalibrated
                      ? COLORS.success
                      : COLORS.warning,
                  },
                ]}
              />
              <Text style={styles.calibrationText}>
                {calibration.isCalibrated
                  ? 'Calibrated'
                  : 'Not calibrated'}
              </Text>
            </View>
            <Button
              title="Recalibrate"
              onPress={handleRecalibrate}
              variant="secondary"
              size="small"
            />
          </View>
        </SettingSection>

        {/* Feedback Section */}
        <SettingSection title="Feedback">
          <SettingRow
            icon={
              <Ionicons
                name="volume-high-outline"
                size={22}
                color={COLORS.skyBlue}
              />
            }
            label="Sound Effects"
          >
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => toggleSetting('soundEnabled', value)}
              trackColor={{ false: COLORS.charcoal, true: COLORS.skyBlue }}
              thumbColor={COLORS.white}
            />
          </SettingRow>

          <SettingRow
            icon={
              <Ionicons
                name="phone-portrait-outline"
                size={22}
                color={COLORS.skyBlue}
              />
            }
            label="Haptic Feedback"
            description="Vibration on events"
          >
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(value) => toggleSetting('hapticsEnabled', value)}
              trackColor={{ false: COLORS.charcoal, true: COLORS.skyBlue }}
              thumbColor={COLORS.white}
            />
          </SettingRow>
        </SettingSection>

        {/* Data Section */}
        <SettingSection title="Data">
          <View style={styles.dangerZone}>
            <Text style={styles.dangerText}>
              Reset all game progress including completed levels and star
              ratings.
            </Text>
            <Button
              title="Reset Progress"
              onPress={handleResetProgress}
              variant="secondary"
              size="small"
              style={styles.dangerButton}
              textStyle={styles.dangerButtonText}
            />
          </View>
        </SettingSection>

        {/* About Section */}
        <SettingSection title="About">
          <View style={styles.aboutContent}>
            <Text style={styles.aboutTitle}>ORBIT</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              A high-end, professional tilt-based marble maze game with
              physics-based gameplay and beautiful circular maze designs.
            </Text>
          </View>
        </SettingSection>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.skyBlue,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: COLORS.overlayDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.skyBlueTranslucent,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.charcoal,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingControl: {
    marginLeft: 12,
  },
  sliderContainer: {
    width: 120,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  calibrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  calibrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calibrationIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  calibrationText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  dangerZone: {
    padding: 16,
  },
  dangerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  dangerButton: {
    borderColor: COLORS.error,
  },
  dangerButtonText: {
    color: COLORS.error,
  },
  aboutContent: {
    padding: 20,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
