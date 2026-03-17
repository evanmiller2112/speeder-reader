import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Font from 'expo-font';

export type FontChoice = 'default' | 'opendyslexic';

const STORAGE_KEY = '@sr_font';

interface FontContextValue {
  font: FontChoice;
  fontsLoaded: boolean;
  toggleFont: () => void;
  serif: string;
  serifBold: string;
  isDyslexic: boolean;
}

const DEFAULT_SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' })!;

const FontContext = createContext<FontContextValue>({
  font: 'default',
  fontsLoaded: true,
  toggleFont: () => {},
  serif: DEFAULT_SERIF,
  serifBold: DEFAULT_SERIF,
  isDyslexic: false,
});

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFont] = useState<FontChoice>('default');
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        'OpenDyslexic': require('../../assets/fonts/OpenDyslexic-Regular.otf'),
        'OpenDyslexic-Bold': require('../../assets/fonts/OpenDyslexic-Bold.otf'),
      });
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'opendyslexic') setFont('opendyslexic');
      setFontsLoaded(true);
    })();
  }, []);

  const toggleFont = useCallback(() => {
    setFont(prev => {
      const next: FontChoice = prev === 'default' ? 'opendyslexic' : 'default';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isDyslexic = font === 'opendyslexic';
  const serif = isDyslexic ? 'OpenDyslexic' : DEFAULT_SERIF;
  const serifBold = isDyslexic ? 'OpenDyslexic-Bold' : DEFAULT_SERIF;

  return (
    <FontContext.Provider value={{ font, fontsLoaded, toggleFont, serif, serifBold, isDyslexic }}>
      {fontsLoaded ? children : null}
    </FontContext.Provider>
  );
}

export const useFont = () => useContext(FontContext);
