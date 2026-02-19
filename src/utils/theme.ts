export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  accent: string;
  // Home backgrounds
  bg: string;
  card: string;
  // Home text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  // Home borders / dividers
  border: string;
  divider: string;
  // Home saved-progress banner
  savedBg: string;
  savedBorder: string;
  savedText: string;
  savedClear: string;
  // Home misc
  placeholder: string;
  primaryBtn: string;
  primaryBtnText: string;
  activeTabBg: string;
  activeTabText: string;
  // Reader backgrounds
  readerBg: string;
  readerBarBg: string;
  readerBottomBg: string;
  // Reader borders
  readerBorder: string;
  readerBorderSubtle: string;
  // Reader text
  readerText: string;
  readerTextMuted: string;
  readerContextWord: string;
  readerContextCurrent: string;
  // Reader modal
  readerModalBg: string;
  readerModalBorder: string;
  readerModalInputBg: string;
  readerModalText: string;
  readerModalPlaceholder: string;
}

export const light: ThemeColors = {
  accent: '#C8A951',
  bg: '#F4F1EA',
  card: '#FDFAF5',
  textPrimary: '#382110',
  textSecondary: '#908787',
  textTertiary: '#C0B8B0',
  textMuted: '#6B5B4E',
  border: '#D4C9BC',
  divider: '#E8E2D9',
  savedBg: '#FDF6E3',
  savedBorder: '#E8D8A0',
  savedText: '#6B5B2E',
  savedClear: '#A89040',
  placeholder: '#B8AFA8',
  primaryBtn: '#382110',
  primaryBtnText: '#F4F1EA',
  activeTabBg: '#382110',
  activeTabText: '#F4F1EA',
  readerBg: '#FDFAF5',
  readerBarBg: '#F0EBE0',
  readerBottomBg: '#E8E3D8',
  readerBorder: '#E8E2D9',
  readerBorderSubtle: '#D4C9BC',
  readerText: '#382110',
  readerTextMuted: '#908787',
  readerContextWord: '#C0B8B0',
  readerContextCurrent: '#6B5B4E',
  readerModalBg: '#FDFAF5',
  readerModalBorder: '#D4C9BC',
  readerModalInputBg: '#F4F0E8',
  readerModalText: '#382110',
  readerModalPlaceholder: '#B8AFA8',
};

export const dark: ThemeColors = {
  accent: '#C8A951',
  bg: '#18100A',
  card: '#211509',
  textPrimary: '#F4ECD8',
  textSecondary: '#8A7A6A',
  textTertiary: '#5A4A3A',
  textMuted: '#9A8A7A',
  border: '#4A3020',
  divider: '#2C1D12',
  savedBg: '#251A0A',
  savedBorder: '#4A3020',
  savedText: '#C0A060',
  savedClear: '#C8A951',
  placeholder: '#5A4A3A',
  primaryBtn: '#C8A951',
  primaryBtnText: '#18100A',
  activeTabBg: '#C8A951',
  activeTabText: '#18100A',
  readerBg: '#18100A',
  readerBarBg: '#211509',
  readerBottomBg: '#120C06',
  readerBorder: '#2C1D12',
  readerBorderSubtle: '#221508',
  readerText: '#F4ECD8',
  readerTextMuted: '#6A5A4A',
  readerContextWord: '#4A3828',
  readerContextCurrent: '#9A8060',
  readerModalBg: '#211509',
  readerModalBorder: '#3A2515',
  readerModalInputBg: '#180E06',
  readerModalText: '#F4ECD8',
  readerModalPlaceholder: '#6A5A4A',
};

export function getTheme(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? dark : light;
}
