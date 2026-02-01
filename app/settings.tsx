// Cloud9 Settings - Refined Triple-Marble Controls
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import {
  Button,
  IconButton,
  GAME_CONFIG,
  useSettings,
  useCalibrationData,
  useProgress,
  useHaptics,
} from '../game';
import { CLOUD9_COLORS, MARBLE_COLORS } from '../game/constants/cloud9';

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

// Sensitivity level indicator
function SensitivityIndicator({ level }: { level: number }) {
  const getSensitivityLabel = () => {
    if (level < 0.7) return { label: 'Low', color: CLOUD9_COLORS.success };
    if (level < 1.0) return { label: 'Medium', color: CLOUD9_COLORS.warning };
    if (level < 1.3) return { label: 'High', color: CLOUD9_COLORS.error };
    return { label: 'Very High', color: CLOUD9_COLORS.error };
  };

  const { label, color } = getSensitivityLabel();

  return (
    <View style={styles.sensitivityIndicator}>
      <View style={[styles.sensitivityDot, { backgroundColor: color }]} />
      <Text style={[styles.sensitivityLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function Cloud9SettingsScreen() {
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
      'Are you sure you want to reset all Cloud9 game progress? This includes completed levels, stars, and best times.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            haptics.pitFall();
            await resetProgress();
            Alert.alert('Progress Reset', 'Your Cloud9 progress has been reset.');
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
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <IconButton
          onPress={handleBack}
          icon={<Ionicons name="arrow-back" size={24} color={CLOUD9_COLORS.textPrimary} />}
          style={styles.backButton}
        />
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Triple Marble Control</Text>
        </View>
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
        {/* Sensitivity Section - Enhanced for triple marble */}
        <SettingSection title="Tilt Sensitivity">
          <View style={styles.sensitivityCard}>
            <View style={styles.sensitivityHeader}>
              <View style={styles.sensitivityTitle}>
                <Ionicons name="speedometer" size={22} color={CLOUD9_COLORS.primary} />
                <Text style={styles.sensitivityTitleText}>Control Precision</Text>
              </View>
              <SensitivityIndicator level={settings.tiltSensitivity} />
            </View>

            <Text style={styles.sensitivityHint}>
              Lower sensitivity recommended for managing three marbles
            </Text>

            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Gentle</Text>
              <Slider
                style={styles.slider}
                minimumValue={GAME_CONFIG.minSensitivity}
                maximumValue={GAME_CONFIG.maxSensitivity}
                value={settings.tiltSensitivity}
                onSlidingComplete={updateSensitivity}
                minimumTrackTintColor={CLOUD9_COLORS.primary}
                maximumTrackTintColor={CLOUD9_COLORS.grayLight}
                thumbTintColor={CLOUD9_COLORS.primary}
              />
              <Text style={styles.sliderLabel}>Fast</Text>
            </View>

            <View style={styles.sensitivityValue}>
              <Text style={styles.sensitivityValueText}>
                {(settings.tiltSensitivity * 100).toFixed(0)}%
              </Text>
            </View>

            {/* Visual sensitivity preview */}
            <View style={styles.sensitivityPreview}>
              <View style={[styles.previewMarble, { backgroundColor: MARBLE_COLORS.red.main }]} />
              <View style={[styles.previewMarble, { backgroundColor: MARBLE_COLORS.blue.main }]} />
              <View style={[styles.previewMarble, { backgroundColor: MARBLE_COLORS.green.main }]} />
            </View>
          </View>
        </SettingSection>

        {/* Controls Section */}
        <SettingSection title="Controls">
          <SettingRow
            icon={
              <Ionicons
                name="game-controller-outline"
                size={22}
                color={CLOUD9_COLORS.primary}
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
              trackColor={{ false: CLOUD9_COLORS.grayLight, true: CLOUD9_COLORS.primary }}
              thumbColor={CLOUD9_COLORS.white}
            />
          </SettingRow>
        </SettingSection>

        {/* Calibration Section */}
        <SettingSection title="Calibration">
          <View style={styles.calibrationCard}>
            <View style={styles.calibrationStatus}>
              <View style={styles.calibrationInfo}>
                <View
                  style={[
                    styles.calibrationIndicator,
                    {
                      backgroundColor: calibration.isCalibrated
                        ? CLOUD9_COLORS.success
                        : CLOUD9_COLORS.warning,
                    },
                  ]}
                />
                <View>
                  <Text style={styles.calibrationText}>
                    {calibration.isCalibrated ? 'Device Calibrated' : 'Not Calibrated'}
                  </Text>
                  <Text style={styles.calibrationSubtext}>
                    {calibration.isCalibrated
                      ? 'Your neutral position is set'
                      : 'Calibration improves control precision'}
                  </Text>
                </View>
              </View>
            </View>
            <Button
              title={calibration.isCalibrated ? 'Recalibrate' : 'Calibrate Now'}
              onPress={handleRecalibrate}
              variant={calibration.isCalibrated ? 'secondary' : 'primary'}
              size="medium"
              icon={<Ionicons name="locate" size={18} color={calibration.isCalibrated ? CLOUD9_COLORS.primary : CLOUD9_COLORS.white} />}
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
                color={CLOUD9_COLORS.primary}
              />
            }
            label="Sound Effects"
            description="Collision and goal sounds"
          >
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => toggleSetting('soundEnabled', value)}
              trackColor={{ false: CLOUD9_COLORS.grayLight, true: CLOUD9_COLORS.primary }}
              thumbColor={CLOUD9_COLORS.white}
            />
          </SettingRow>

          <SettingRow
            icon={
              <Ionicons
                name="hand-left-outline"
                size={22}
                color={CLOUD9_COLORS.primary}
              />
            }
            label="Haptic Feedback"
            description="Wall hits & marble collisions"
          >
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(value) => toggleSetting('hapticsEnabled', value)}
              trackColor={{ false: CLOUD9_COLORS.grayLight, true: CLOUD9_COLORS.primary }}
              thumbColor={CLOUD9_COLORS.white}
            />
          </SettingRow>
        </SettingSection>

        {/* Data Section */}
        <SettingSection title="Data">
          <View style={styles.dangerZone}>
            <View style={styles.dangerInfo}>
              <Ionicons name="warning-outline" size={20} color={CLOUD9_COLORS.error} />
              <Text style={styles.dangerText}>
                Reset all Cloud9 progress including completed levels, stars, and best times.
              </Text>
            </View>
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
            <View style={styles.aboutLogo}>
              <View style={[styles.aboutMarble, { backgroundColor: MARBLE_COLORS.red.main }]} />
              <View style={[styles.aboutMarble, { backgroundColor: MARBLE_COLORS.blue.main }]} />
              <View style={[styles.aboutMarble, { backgroundColor: MARBLE_COLORS.green.main }]} />
            </View>
            <Text style={styles.aboutTitle}>CLOUD9</Text>
            <Text style={styles.aboutVersion}>Version 2.0.0</Text>
            <Text style={styles.aboutDescription}>
              A premium triple-marble challenge game. Guide Red, Blue, and Green
              marbles to their matching goals using precise tilt controls.
            </Text>
          </View>
        </SettingSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CLOUD9_COLORS.background,
  },
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
  },
  bgCircle1: {
    width: 350,
    height: 350,
    top: -100,
    right: -100,
    opacity: 0.15,
  },
  bgCircle2: {
    width: 250,
    height: 250,
    bottom: 100,
    left: -80,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
  },
  headerTitle: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: CLOUD9_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: CLOUD9_COLORS.textSecondary,
    marginTop: 2,
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
    fontSize: 13,
    fontWeight: '600',
    color: CLOUD9_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: CLOUD9_COLORS.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLOUD9_COLORS.primaryTranslucent,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: CLOUD9_COLORS.grayLight,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CLOUD9_COLORS.overlayLight,
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
    color: CLOUD9_COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: 13,
    color: CLOUD9_COLORS.textSecondary,
    marginTop: 2,
  },
  settingControl: {
    marginLeft: 12,
  },
  sensitivityCard: {
    padding: 20,
  },
  sensitivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensitivityTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sensitivityTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: CLOUD9_COLORS.textPrimary,
  },
  sensitivityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: CLOUD9_COLORS.overlayLight,
    borderRadius: 12,
  },
  sensitivityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sensitivityLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sensitivityHint: {
    fontSize: 13,
    color: CLOUD9_COLORS.textSecondary,
    marginBottom: 16,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: CLOUD9_COLORS.textMuted,
    width: 40,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sensitivityValue: {
    alignItems: 'center',
    marginTop: 8,
  },
  sensitivityValueText: {
    fontSize: 24,
    fontWeight: '700',
    color: CLOUD9_COLORS.primary,
  },
  sensitivityPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  previewMarble: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  calibrationCard: {
    padding: 16,
    gap: 16,
  },
  calibrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calibrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calibrationIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  calibrationText: {
    fontSize: 15,
    fontWeight: '600',
    color: CLOUD9_COLORS.textPrimary,
  },
  calibrationSubtext: {
    fontSize: 12,
    color: CLOUD9_COLORS.textSecondary,
    marginTop: 2,
  },
  dangerZone: {
    padding: 16,
    gap: 16,
  },
  dangerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dangerText: {
    flex: 1,
    fontSize: 14,
    color: CLOUD9_COLORS.textSecondary,
    lineHeight: 20,
  },
  dangerButton: {
    borderColor: CLOUD9_COLORS.error,
    alignSelf: 'flex-start',
  },
  dangerButtonText: {
    color: CLOUD9_COLORS.error,
  },
  aboutContent: {
    padding: 24,
    alignItems: 'center',
  },
  aboutLogo: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  aboutMarble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: CLOUD9_COLORS.primary,
    letterSpacing: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: CLOUD9_COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    color: CLOUD9_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
