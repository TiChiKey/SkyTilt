import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

// Lazy load Skia for web support
const SkiaContext = React.createContext<boolean>(false);

export function useSkiaReady() {
  return React.useContext(SkiaContext);
}

interface AsyncSkiaProviderProps {
  children: React.ReactNode;
}

export function AsyncSkiaProvider({ children }: AsyncSkiaProviderProps) {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // On native, Skia is always ready
    // On web, we need to wait for WASM to load
    const checkSkia = async () => {
      try {
        // Import Skia to trigger WASM loading
        await import('@shopify/react-native-skia');
        setIsReady(true);
      } catch (error) {
        console.error('Failed to load Skia:', error);
        // Still set ready to show fallback
        setIsReady(true);
      }
    };

    checkSkia();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.skyBlue} />
      </View>
    );
  }

  return (
    <SkiaContext.Provider value={isReady}>
      {children}
    </SkiaContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
  },
});
