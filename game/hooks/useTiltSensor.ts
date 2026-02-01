import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import { TiltInput, CalibrationData } from '../types';

interface UseTiltSensorOptions {
  calibration: CalibrationData;
  enabled: boolean;
}

interface UseTiltSensorReturn {
  tilt: TiltInput;
  isAvailable: boolean;
}

export function useTiltSensor({
  calibration,
  enabled,
}: UseTiltSensorOptions): UseTiltSensorReturn {
  const [tilt, setTilt] = useState<TiltInput>({ x: 0, y: 0 });
  const [isAvailable, setIsAvailable] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAvailability = async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();
        if (mounted) {
          setIsAvailable(available);
        }
      } catch {
        if (mounted) {
          setIsAvailable(false);
        }
      }
    };

    checkAvailability();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !isAvailable) {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      setTilt({ x: 0, y: 0 });
      return;
    }

    // Set update interval (16ms = ~60fps)
    Accelerometer.setUpdateInterval(16);

    const handleUpdate = (data: AccelerometerMeasurement) => {
      // Apply calibration offset
      // Note: On mobile devices:
      // x: left/right tilt (positive = right)
      // y: forward/backward tilt (positive = forward/up)
      const calibratedX = data.x - calibration.neutralX;
      const calibratedY = data.y - calibration.neutralY;

      // Clamp values to [-1, 1] range
      const clampedX = Math.max(-1, Math.min(1, calibratedX));
      const clampedY = Math.max(-1, Math.min(1, calibratedY));

      setTilt({
        x: clampedX,
        y: -clampedY, // Invert Y for natural ball movement
      });
    };

    subscriptionRef.current = Accelerometer.addListener(handleUpdate);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [enabled, isAvailable, calibration]);

  return { tilt, isAvailable };
}

// Hook for calibration - captures current orientation as neutral
// Also exposes raw tilt data for visualization
export function useCalibration() {
  const [measurements, setMeasurements] = useState<AccelerometerMeasurement[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [rawTilt, setRawTilt] = useState<TiltInput>({ x: 0, y: 0 });
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const rawSubscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  // Start listening to raw tilt data for visualization
  useEffect(() => {
    let mounted = true;

    const setupRawListener = async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();
        if (!available || !mounted) return;

        Accelerometer.setUpdateInterval(50);

        rawSubscriptionRef.current = Accelerometer.addListener((data) => {
          if (mounted) {
            setRawTilt({
              x: data.x,
              y: data.y,
            });
          }
        });
      } catch {
        // Accelerometer not available
      }
    };

    setupRawListener();

    return () => {
      mounted = false;
      if (rawSubscriptionRef.current) {
        rawSubscriptionRef.current.remove();
        rawSubscriptionRef.current = null;
      }
    };
  }, []);

  const startCalibration = useCallback(() => {
    setMeasurements([]);
    setIsCalibrating(true);

    Accelerometer.setUpdateInterval(50);

    subscriptionRef.current = Accelerometer.addListener((data) => {
      setMeasurements((prev) => [...prev, data]);
    });

    // Collect for 1 second
    setTimeout(() => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      setIsCalibrating(false);
    }, 1000);
  }, []);

  const getCalibrationData = useCallback((): CalibrationData | null => {
    if (measurements.length === 0) return null;

    // Average all measurements
    const sum = measurements.reduce(
      (acc, m) => ({
        x: acc.x + m.x,
        y: acc.y + m.y,
        z: acc.z + m.z,
      }),
      { x: 0, y: 0, z: 0 }
    );

    return {
      neutralX: sum.x / measurements.length,
      neutralY: sum.y / measurements.length,
      neutralZ: sum.z / measurements.length,
      isCalibrated: true,
    };
  }, [measurements]);

  return {
    startCalibration,
    getCalibrationData,
    isCalibrating,
    sampleCount: measurements.length,
    rawTilt,
  };
}
