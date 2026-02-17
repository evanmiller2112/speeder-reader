import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { firstIndexOfPage, WordEntry } from '../utils/pdfParser';
import { saveProgress, clearProgress } from '../utils/progress';
import { t } from '../utils/i18n';
import { useLanguage } from '../contexts/LanguageContext';

// WebView is only used on native for the dictionary modal; web uses window.open instead
const WebView = Platform.OS !== 'web' ? require('react-native-webview').default : null;

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;

const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
});

const CONTEXT_BEFORE = 14;
const CONTEXT_AFTER = 14;

// ORP: middle letter for odd-length words; left-of-center for even-length words
function midIndex(word: string): number {
  return Math.ceil(word.length / 2) - 1;
}

function WordDisplay({ word }: { word: string }) {
  if (!word) return null;
  const mid = midIndex(word);
  const before = word.slice(0, mid);
  const highlight = word.slice(mid, mid + 1);
  const after = word.slice(mid + 1);
  return (
    // flex-row: left half right-aligns up to center, highlight sits at center,
    // right half left-aligns from center — ORP always at screen midpoint
    <View style={styles.wordRow}>
      <View style={styles.wordLeft}>
        <Text style={styles.wordNormal} allowFontScaling={false}>{before}</Text>
      </View>
      <Text style={styles.wordHighlight} allowFontScaling={false}>{highlight}</Text>
      <View style={styles.wordRight}>
        <Text style={styles.wordNormal} allowFontScaling={false}>{after}</Text>
      </View>
    </View>
  );
}

function ContextDisplay({ words, currentIndex }: { words: WordEntry[]; currentIndex: number }) {
  const start = Math.max(0, currentIndex - CONTEXT_BEFORE);
  const end = Math.min(words.length, currentIndex + CONTEXT_AFTER + 1);
  const slice = words.slice(start, end);
  const hiOffset = currentIndex - start;

  return (
    <Text style={styles.context} numberOfLines={3}>
      {slice.map((w, i) => (
        <Text
          key={start + i}
          style={i === hiOffset ? styles.contextCurrent : styles.contextWord}
        >
          {i > 0 ? ' ' : ''}{w.word}
        </Text>
      ))}
    </Text>
  );
}

export default function ReaderScreen({ route, navigation }: Props) {
  const { lang } = useLanguage();
  const { words, wpm: initialWpm, numPages, startIndex, fileKey } = route.params;

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [wpm, setWpm] = useState(initialWpm);
  const [showJumper, setShowJumper] = useState(false);
  const [pageInput, setPageInput] = useState('');

  const [flowReading, setFlowReading] = useState(true);

  const indexRef = useRef(currentIndex);
  const wpmRef = useRef(wpm);
  const flowReadingRef = useRef(flowReading);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRef = useRef<() => void>(() => {});

  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { wpmRef.current = wpm; }, [wpm]);
  useEffect(() => { flowReadingRef.current = flowReading; }, [flowReading]);

  // Inline so it always closes over latest `words`; assigned to scheduleRef each render
  // so recursive timeout callbacks always call the current version.
  const scheduleNext = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const word = words[indexRef.current]?.word ?? '';
    const hasPunct = flowReadingRef.current && /[.,!?;:\-—–]/.test(word);
    const baseDelay = Math.round(60000 / wpmRef.current);
    const delay = hasPunct ? baseDelay * 2 : baseDelay;
    timeoutRef.current = setTimeout(() => {
      const next = indexRef.current + 1;
      if (next >= words.length) { setIsPlaying(false); return; }
      indexRef.current = next;
      setCurrentIndex(next);
      scheduleRef.current();
    }, delay);
  };
  scheduleRef.current = scheduleNext;

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isPlaying) scheduleRef.current();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [isPlaying, wpm, flowReading]);

  const currentWord = words[currentIndex];
  const currentPage = currentWord?.page ?? 1;

  // Save progress whenever the page changes (not on every word)
  const lastSavedPage = useRef(-1);
  useEffect(() => {
    if (currentPage !== lastSavedPage.current) {
      lastSavedPage.current = currentPage;
      saveProgress(fileKey, { wordIndex: currentIndex, page: currentPage });
    }
  }, [currentPage, fileKey, currentIndex]);

  // Clear saved progress when finished
  const isFinished = currentIndex >= words.length;
  useEffect(() => {
    if (isFinished) clearProgress(fileKey);
  }, [isFinished, fileKey]);

  const handleTap = useCallback(() => {
    setIsPlaying((p) => {
      const next = !p;
      if (!next) {
        // Pausing — save exact position immediately
        saveProgress(fileKey, { wordIndex: indexRef.current, page: words[indexRef.current]?.page ?? 1 });
      }
      return next;
    });
  }, [fileKey, words]);

  const [dictUrl, setDictUrl] = useState<string | null>(null);

  const lookUpWord = useCallback(() => {
    const clean = (currentWord?.word ?? '').replace(/[^a-zA-Z'-]/g, '').toLowerCase();
    if (!clean) return;
    const url = `https://www.dictionary.com/browse/${clean}`;
    if (Platform.OS === 'web') {
      // Open in a new browser tab on web
      (window as any).open(url, '_blank');
    } else {
      setDictUrl(url);
    }
  }, [currentWord]);

  const stepWord = useCallback((delta: number) => {
    const next = Math.min(words.length - 1, Math.max(0, indexRef.current + delta));
    indexRef.current = next;
    setCurrentIndex(next);
  }, [words.length]);

  const adjustWpm = (delta: number) =>
    setWpm((prev) => Math.min(750, Math.max(50, prev + delta)));

  const jumpToPage = useCallback(() => {
    const page = parseInt(pageInput, 10);
    if (isNaN(page) || page < 1 || page > numPages) {
      Alert.alert(t(lang, 'invalidPage'), t(lang, 'invalidPageMsg', { max: numPages }));
      return;
    }
    const idx = firstIndexOfPage(words, page);
    indexRef.current = idx;                                    // sync immediately — don't wait for effect
    setCurrentIndex(idx);
    saveProgress(fileKey, { wordIndex: idx, page });           // persist to storage
    setShowJumper(false);
    setPageInput('');
    setIsPlaying(true);                                        // auto-resume after jump
  }, [pageInput, numPages, words, fileKey]);

  const handleBack = useCallback(async () => {
    setIsPlaying(false);
    const idx = indexRef.current;
    await saveProgress(fileKey, { wordIndex: idx, page: words[idx]?.page ?? 1 });
    navigation.goBack();
  }, [fileKey, words, navigation]);

  const progress = words.length > 0 ? currentIndex / words.length : 0;

  if (isFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneIcon}>◎</Text>
          <Text style={styles.doneTitle}>{t(lang, 'finished')}</Text>
          <Text style={styles.doneSub}>
            {t(lang, 'finishedSub', { count: words.length.toLocaleString(), wpm })}
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>{t(lang, 'backBtn')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      {/* Context paragraph */}
      <View style={styles.contextContainer}>
        <ContextDisplay words={words} currentIndex={currentIndex} />
      </View>

      {/* Word-step arrows — visible when paused */}
      {!isPlaying && (
        <View style={styles.stepRow}>
          <TouchableOpacity
            style={[styles.stepBtn, currentIndex <= 0 && styles.stepBtnDisabled]}
            onPress={() => stepWord(-1)}
            disabled={currentIndex <= 0}
          >
            <Text style={styles.stepBtnText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.stepBtn, currentIndex >= words.length - 1 && styles.stepBtnDisabled]}
            onPress={() => stepWord(1)}
            disabled={currentIndex >= words.length - 1}
          >
            <Text style={styles.stepBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reading area */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.wordArea}>
          <WordDisplay word={currentWord?.word ?? ''} />

          {!isPlaying && (
            <View style={styles.pausedHint}>
              <Text style={styles.pausedHintText}>{t(lang, 'tapToResume')}</Text>
              <TouchableOpacity style={styles.lookupBtn} onPress={lookUpWord}>
                <Text style={styles.lookupBtnText}>{t(lang, 'lookUpWord')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Speed controls */}
      <View style={styles.speedBar}>
        <View style={styles.speedRow}>
          <TouchableOpacity onPress={() => adjustWpm(-25)} style={styles.speedBtn}>
            <Text style={styles.speedBtnText}>−25</Text>
          </TouchableOpacity>
          <Text style={styles.speedValue}>{wpm} wpm</Text>
          <TouchableOpacity onPress={() => adjustWpm(25)} style={styles.speedBtn}>
            <Text style={styles.speedBtnText}>+25</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.flowBtn, flowReading && styles.flowBtnActive]}
          onPress={() => setFlowReading(v => !v)}
        >
          <Text style={[styles.flowBtnText, flowReading && styles.flowBtnTextActive]}>
            {flowReading ? t(lang, 'flowOn') : t(lang, 'flowOff')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t(lang, 'back')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pageBtn}
          onPress={() => { setIsPlaying(false); setShowJumper(true); }}
        >
          <Text style={styles.pageBtnText}>
            {currentPage} / {numPages}
          </Text>
        </TouchableOpacity>

        <Text style={styles.wpmLabel}>{wpm}</Text>
      </View>

      {/* Page jump modal */}
      <Modal visible={showJumper} transparent animationType="fade" onRequestClose={() => setShowJumper(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t(lang, 'jumpToPage')}</Text>
            <Text style={styles.modalSub}>1 – {numPages}</Text>
            <TextInput
              style={styles.modalInput}
              value={pageInput}
              onChangeText={setPageInput}
              keyboardType="number-pad"
              placeholder={String(currentPage)}
              placeholderTextColor="#6a5a4a"
              autoFocus
              returnKeyType="go"
              onSubmitEditing={jumpToPage}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { setShowJumper(false); setPageInput(''); }}
              >
                <Text style={styles.modalCancelText}>{t(lang, 'cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={jumpToPage}>
                <Text style={styles.modalConfirmText}>{t(lang, 'jump')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Dictionary WebView modal (native only — web uses window.open) */}
      {dictUrl && (
        <Modal visible animationType="slide" onRequestClose={() => setDictUrl(null)}>
          <SafeAreaView style={styles.dictModal}>
            <View style={styles.dictHeader}>
              <Text style={styles.dictTitle}>{t(lang, 'dictionaryCom')}</Text>
              <TouchableOpacity onPress={() => setDictUrl(null)} style={styles.dictClose}>
                <Text style={styles.dictCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: dictUrl }}
              style={{ flex: 1 }}
              javaScriptEnabled
              domStorageEnabled
            />
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18100A',
  },

  progressTrack: {
    height: 2,
    backgroundColor: '#2C1D12',
  },
  progressFill: {
    height: 2,
    backgroundColor: '#C8A951',
  },

  // ── Context paragraph ─────────────────────────────────────────────────────
  contextContainer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#221508',
  },
  context: {
    fontFamily: SERIF,
    fontSize: 13,
    lineHeight: 20,
    color: '#4A3828',
    textAlign: 'center',
  },
  contextWord: {
    color: '#4A3828',
    fontFamily: SERIF,
    fontSize: 13,
  },
  contextCurrent: {
    color: '#9A8060',
    fontFamily: SERIF,
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Step arrows ───────────────────────────────────────────────────────────
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#221508',
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#4A3020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.2,
  },
  stepBtnText: {
    color: '#C8A951',
    fontSize: 20,
    fontFamily: SERIF,
  },

  // ── Word area ─────────────────────────────────────────────────────────────
  wordArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  // Stretch across full width so left/right halves each get exactly 50%,
  // placing the highlighted letter at the horizontal screen center
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  wordLeft: {
    flex: 1,
    alignItems: 'flex-end',
  },
  wordRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  wordNormal: {
    color: '#F4ECD8',
    fontFamily: SERIF,
    fontSize: 46,
  },
  wordHighlight: {
    color: '#C8A951',
    fontFamily: SERIF,
    fontSize: 46,
    fontWeight: '700',
  },
  pausedHint: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    gap: 12,
  },
  pausedHintText: {
    color: '#6A5A4A',
    fontSize: 13,
    fontFamily: SERIF,
    letterSpacing: 0.5,
  },
  lookupBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A3020',
  },
  lookupBtnText: {
    color: '#C8A951',
    fontSize: 12,
    fontFamily: SERIF,
    letterSpacing: 0.5,
  },

  // ── Dictionary modal ───────────────────────────────────────────────────────
  dictModal: {
    flex: 1,
    backgroundColor: '#18100A',
  },
  dictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C1D12',
  },
  dictTitle: {
    color: '#C8A951',
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '600',
  },
  dictClose: {
    padding: 6,
  },
  dictCloseText: {
    color: '#6A5A4A',
    fontSize: 16,
  },

  // ── Speed overlay ─────────────────────────────────────────────────────────
  speedBar: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 14,
    backgroundColor: '#211509',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#2C1D12',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  speedBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4A3020',
    borderRadius: 6,
  },
  speedBtnText: {
    color: '#C8A951',
    fontSize: 14,
    fontFamily: SERIF,
  },
  speedValue: {
    color: '#F4ECD8',
    fontSize: 18,
    fontFamily: SERIF,
    minWidth: 90,
    textAlign: 'center',
  },
  flowBtn: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A3020',
  },
  flowBtnActive: {
    borderColor: '#C8A951',
    backgroundColor: 'rgba(200,169,81,0.1)',
  },
  flowBtnText: {
    color: '#6A5A4A',
    fontSize: 12,
    fontFamily: SERIF,
    letterSpacing: 0.5,
  },
  flowBtnTextActive: {
    color: '#C8A951',
  },

  // ── Bottom bar ────────────────────────────────────────────────────────────
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#120C06',
    borderTopWidth: 1,
    borderTopColor: '#2C1D12',
  },
  backBtn: { minWidth: 60 },
  backBtnText: {
    color: '#6A5A4A',
    fontSize: 13,
    fontFamily: SERIF,
  },
  pageBtn: { alignItems: 'center' },
  pageBtnText: {
    color: '#C8A951',
    fontSize: 16,
    fontFamily: SERIF,
    fontWeight: '600',
  },
  wpmLabel: {
    color: '#6A5A4A',
    fontSize: 13,
    fontFamily: SERIF,
    minWidth: 60,
    textAlign: 'right',
  },

  // ── Done screen ───────────────────────────────────────────────────────────
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  doneIcon: {
    fontSize: 48,
    color: '#C8A951',
    marginBottom: 20,
  },
  doneTitle: {
    color: '#F4ECD8',
    fontSize: 32,
    fontFamily: SERIF,
    fontWeight: '700',
    marginBottom: 8,
  },
  doneSub: {
    color: '#6A5A4A',
    fontSize: 15,
    fontFamily: SERIF,
    marginBottom: 40,
  },
  doneBtn: {
    borderWidth: 1,
    borderColor: '#C8A951',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  doneBtnText: {
    color: '#C8A951',
    fontSize: 16,
    fontFamily: SERIF,
  },

  // ── Page jump modal ───────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '78%',
    backgroundColor: '#211509',
    borderRadius: 12,
    padding: 28,
    borderWidth: 1,
    borderColor: '#3A2515',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#F4ECD8',
    fontSize: 20,
    fontFamily: SERIF,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSub: {
    color: '#6A5A4A',
    fontSize: 13,
    fontFamily: SERIF,
    marginBottom: 18,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#180E06',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A2515',
    color: '#F4ECD8',
    fontSize: 28,
    fontFamily: SERIF,
    textAlign: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A2515',
  },
  modalCancelText: {
    color: '#6A5A4A',
    fontFamily: SERIF,
    fontSize: 15,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#C8A951',
  },
  modalConfirmText: {
    color: '#18100A',
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '700',
  },
});
