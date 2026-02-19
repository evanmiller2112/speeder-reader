/**
 * Web-specific HomeScreen — supports PDF, EPUB, HTML, Markdown, plain text.
 * PDF/EPUB parsed in a hidden <iframe> via PARSER_HTML (PDF.js + JSZip on CDN).
 * TXT/MD/HTML parsed directly in JS (no network dependency).
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import Logo from "../components/Logo";
import {
  buildWordList,
  firstIndexOfPage,
  PARSER_HTML,
  WordEntry,
} from "../utils/pdfParser";
import {
  detectFileType,
  FileType,
  parseTextContent,
} from "../utils/textParser";
import {
  loadProgress,
  clearProgress,
  makeFileKey,
  SavedProgress,
} from "../utils/progress";
import {
  GutenbergBook,
  GutenbergFormat,
  bestGutenbergFormat,
  fetchGutenbergSearch,
} from "../utils/gutenberg";
import { t, formatTimeLeft } from "../utils/i18n";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { getTheme, ThemeColors } from "../utils/theme";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
type ParseState = "idle" | "loading" | "parsing" | "ready" | "error";
type InputMode = "file" | "gutenberg";

const SERIF = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia",
});
const MAX_WPM = 750;

const FORMAT_LABEL_BASE: Record<FileType, string> = {
  pdf: "PDF",
  epub: "EPUB",
  html: "HTML",
  md: "Markdown",
  txt: "",
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

export default function HomeScreen({ navigation }: Props) {
  const { lang, toggleLang } = useLanguage();
  const { scheme, toggleTheme } = useTheme();
  const c = getTheme(scheme);
  const styles = useMemo(() => makeStyles(c), [scheme]);

  const FORMAT_LABEL: Record<FileType, string> = {
    ...FORMAT_LABEL_BASE,
    txt: t(lang, "plainText"),
  };
  const [wpm, setWpm] = useState(250);
  const [parseState, setParseState] = useState<ParseState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType>("pdf");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [words, setWords] = useState<WordEntry[]>([]);
  const [numPages, setNumPages] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>("file");

  // Progress / starting page state
  const [fileKey, setFileKey] = useState("");
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(
    null,
  );
  const [startPage, setStartPage] = useState(1);
  const [startPageText, setStartPageText] = useState("1");
  const [startWordIndex, setStartWordIndex] = useState(0);

  const [gutenbergQuery, setGutenbergQuery] = useState("");
  const [gutenbergResults, setGutenbergResults] = useState<GutenbergBook[]>([]);
  const [gutenbergSearching, setGutenbergSearching] = useState(false);

  // Refs so the focus listener always reads the latest values without re-registering
  const fileKeyRef = useRef<string>("");
  const parseStateRef = useRef<ParseState>("idle");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeReady = useRef(false);
  const pendingMsg = useRef<object | null>(null);

  const [iframeSrc] = useState(() => {
    const blob = new Blob([PARSER_HTML], { type: "text/html" });
    return URL.createObjectURL(blob);
  });
  useEffect(() => () => URL.revokeObjectURL(iframeSrc), [iframeSrc]);

  const sendToIframe = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), "*");
  }, []);

  const dispatch = useCallback(
    (msg: object) => {
      if (iframeReady.current) sendToIframe(msg);
      else pendingMsg.current = msg;
    },
    [sendToIframe],
  );

  // Messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return;
      try {
        const msg =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        switch (msg.type) {
          case "READY":
            iframeReady.current = true;
            if (pendingMsg.current) {
              sendToIframe(pendingMsg.current);
              pendingMsg.current = null;
            }
            break;
          case "PROGRESS":
            setProgress({ current: msg.current, total: msg.total });
            break;
          case "DONE": {
            const parsed = buildWordList(msg.pages as string[]);
            setWords(parsed);
            setNumPages(msg.numPages as number);
            setParseState("ready");
            break;
          }
          case "ERROR":
            alert("Parse error: " + (msg.error ?? "unknown"));
            setParseState("error");
            break;
        }
      } catch (_) {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [sendToIframe]);

  // Mount hidden file input + iframe
  useEffect(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.epub,.txt,.md,.markdown,.html,.htm";
    input.style.display = "none";
    document.body.appendChild(input);
    fileInputRef.current = input;

    const iframe = document.createElement("iframe");
    iframe.src = iframeSrc;
    iframe.style.cssText = "display:none;width:0;height:0;border:none;";
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    return () => {
      document.body.removeChild(input);
      document.body.removeChild(iframe);
    };
  }, [iframeSrc]);

  // Keep refs current so the focus listener always has fresh values
  fileKeyRef.current = fileKey;
  parseStateRef.current = parseState;

  const applyProgress = useCallback((saved: SavedProgress | null) => {
    setSavedProgress(saved);
    const page = saved?.page ?? 1;
    const wordIdx = saved?.wordIndex ?? 0;
    setStartPage(page);
    setStartPageText(String(page));
    setStartWordIndex(wordIdx);
  }, []);

  // Load saved progress whenever parsing first finishes
  useEffect(() => {
    if (parseState !== "ready" || !fileKey) return;
    loadProgress(fileKey).then(applyProgress);
  }, [parseState, fileKey, applyProgress]);

  // Re-load saved progress whenever the screen comes back into focus (e.g. returning from Reader)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (!fileKeyRef.current || parseStateRef.current !== "ready") return;
      loadProgress(fileKeyRef.current).then(applyProgress);
    });
    return unsubscribe;
  }, [navigation, applyProgress]);

  // ── File upload ───────────────────────────────────────────────────────────
  const pickFile = useCallback(() => {
    const input = fileInputRef.current;
    if (!input) return;
    const handleChange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      input.removeEventListener("change", handleChange);

      const name = file.name;
      const type = detectFileType(name);
      const key = makeFileKey(name);

      setFileName(name);
      setFileType(type);
      setFileKey(key);
      setSavedProgress(null);
      setStartPage(1);
      setStartPageText("1");
      setStartWordIndex(0);
      setParseState("loading");
      setWords([]);
      setProgress({ current: 0, total: 0 });

      try {
        if (type === "txt" || type === "md" || type === "html") {
          const raw = await readFileAsText(file);
          const { words: parsed, numPages: np } = parseTextContent(raw, type);
          setWords(parsed);
          setNumPages(np);
          setParseState("ready");
        } else {
          const base64 = await readFileAsBase64(file);
          const msgType = type === "epub" ? "PARSE_EPUB" : "PARSE_PDF";
          setParseState("parsing");
          dispatch({ type: msgType, base64 });
        }
      } catch (err) {
        alert(
          "Failed to read file: " +
            (err instanceof Error ? err.message : String(err)),
        );
        setParseState("error");
      }
      input.value = "";
    };
    input.addEventListener("change", handleChange);
    input.click();
  }, [dispatch]);

  const searchGutenberg = useCallback(async () => {
    const q = gutenbergQuery.trim();
    if (!q) return;
    setGutenbergSearching(true);
    setGutenbergResults([]);
    try {
      setGutenbergResults(await fetchGutenbergSearch(q));
    } catch (err) {
      alert(
        "Search failed: Could not reach Project Gutenberg catalog. Check your connection.",
      );
    } finally {
      setGutenbergSearching(false);
    }
  }, [gutenbergQuery]);

  const loadGutenbergBook = useCallback(
    (book: GutenbergBook, fmt: GutenbergFormat) => {
      if (fmt.type === "txt") {
        const open = window.confirm(
          t(lang, "txtOnlyMsg", { title: book.title }),
        );
        if (open) window.open(fmt.url, "_blank");
        return;
      }
      // EPUB or PDF — download in new tab, then switch to Upload
      window.open(fmt.url, "_blank");
      setInputMode("file");
    },
    [lang],
  );

  const startReading = useCallback(() => {
    navigation.navigate("Reader", {
      words,
      wpm,
      numPages,
      startIndex: startWordIndex,
      fileKey,
    });
  }, [navigation, words, wpm, numPages, startWordIndex, fileKey]);

  const adjustWpm = (delta: number) =>
    setWpm((prev) => Math.min(MAX_WPM, Math.max(50, prev + delta)));

  const adjustStartPage = (delta: number) => {
    setStartPage((prev) => {
      const next = Math.min(numPages, Math.max(1, prev + delta));
      setStartPageText(String(next));
      setStartWordIndex(firstIndexOfPage(words, next));
      return next;
    });
  };

  const handleStartPageText = (t: string) => {
    setStartPageText(t);
    const n = parseInt(t, 10);
    if (!isNaN(n) && n >= 1 && n <= numPages) {
      setStartPage(n);
      setStartWordIndex(firstIndexOfPage(words, n));
    }
  };

  const isBusy = parseState === "loading" || parseState === "parsing";
  const fillPct = ((wpm - 50) / (MAX_WPM - 50)) * 100;

  return (
    <View style={styles.container}>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={56} color={c.textPrimary} />
          <Text style={styles.title}>SpeederReader</Text>
          <View style={styles.headerBtns}>
            <TouchableOpacity onPress={toggleLang} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>
                {lang === "en" ? "ES" : "EN"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>
                {scheme === "dark" ? "☀" : "☾"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WPM */}
        <View style={styles.section}>
          <Text style={styles.label}>{t(lang, "readingSpeed")}</Text>
          <View style={styles.wpmRow}>
            <TouchableOpacity
              style={styles.wpmBtn}
              onPress={() => adjustWpm(-25)}
            >
              <Text style={styles.wpmBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.wpmValue}>
              {wpm} {t(lang, "wpm")}
            </Text>
            <TouchableOpacity
              style={styles.wpmBtn}
              onPress={() => adjustWpm(25)}
            >
              <Text style={styles.wpmBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.trackWrap}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${fillPct}%` as any }]} />
            </View>
            <View style={styles.trackLabels}>
              <Text style={styles.trackLabel}>50</Text>
              <Text style={styles.trackLabel}>{MAX_WPM}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              inputMode === "file" && styles.modeBtnActive,
            ]}
            onPress={() => {
              setInputMode("file");
              if (!isBusy) pickFile();
            }}
          >
            <Text
              style={[
                styles.modeBtnText,
                inputMode === "file" && styles.modeBtnActiveText,
              ]}
            >
              {t(lang, "upload")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              inputMode === "gutenberg" && styles.modeBtnActive,
            ]}
            onPress={() => setInputMode("gutenberg")}
          >
            <Text
              style={[
                styles.modeBtnText,
                inputMode === "gutenberg" && styles.modeBtnActiveText,
              ]}
            >
              {t(lang, "browse")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.formatsNote}>{t(lang, "formatsNote")}</Text>

        {inputMode === "file" && (
          <TouchableOpacity
            style={[styles.uploadBtn, isBusy && styles.dimmed]}
            onPress={pickFile}
            disabled={isBusy}
          >
            <Text style={styles.uploadBtnText}>
              {isBusy
                ? parseState === "loading"
                  ? t(lang, "readingFile")
                  : t(lang, "parsing")
                : parseState === "ready"
                  ? t(lang, "chooseAnother")
                  : t(lang, "chooseFile")}
            </Text>
          </TouchableOpacity>
        )}

        {inputMode === "gutenberg" && (
          <View>
            <View style={styles.urlRow}>
              <TextInput
                style={styles.urlInput}
                value={gutenbergQuery}
                onChangeText={setGutenbergQuery}
                placeholder={t(lang, "searchPlaceholder")}
                placeholderTextColor={c.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={searchGutenberg}
                editable={!isBusy && !gutenbergSearching}
              />
              <TouchableOpacity
                style={[
                  styles.urlBtn,
                  (isBusy || gutenbergSearching || !gutenbergQuery.trim()) &&
                    styles.dimmed,
                ]}
                onPress={searchGutenberg}
                disabled={
                  isBusy || gutenbergSearching || !gutenbergQuery.trim()
                }
              >
                <Text style={styles.urlBtnText}>
                  {gutenbergSearching ? "…" : t(lang, "search")}
                </Text>
              </TouchableOpacity>
            </View>
            {gutenbergSearching && (
              <View style={styles.progressRow}>
                <ActivityIndicator color={c.accent} size="small" />
                <Text style={styles.progressText}>
                  {t(lang, "searchingGutenberg")}
                </Text>
              </View>
            )}
            {gutenbergResults.map((book) => {
              const fmt = bestGutenbergFormat(book.formats);
              const authors = book.authors.map((a) => a.name).join(", ");
              return (
                <TouchableOpacity
                  key={book.id}
                  style={[styles.bookResult, (!fmt || isBusy) && styles.dimmed]}
                  onPress={() => fmt && loadGutenbergBook(book, fmt)}
                  disabled={!fmt || isBusy}
                >
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {book.title}
                  </Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                    {authors}
                  </Text>
                  <Text style={styles.bookMeta}>
                    {book.download_count.toLocaleString()}{" "}
                    {t(lang, "downloads")} ·{" "}
                    {fmt ? fmt.type.toUpperCase() : t(lang, "unavailable")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {isBusy && (
          <View style={styles.progressRow}>
            <ActivityIndicator color={c.accent} size="small" />
            <Text style={styles.progressText}>
              {parseState === "loading"
                ? t(lang, "fetching")
                : `${FORMAT_LABEL[fileType]} · ${
                    progress.total
                      ? t(lang, "pageOf", {
                          current: progress.current,
                          total: progress.total,
                        })
                      : t(lang, "pageNum", { current: progress.current })
                  }`}
            </Text>
          </View>
        )}

        {parseState === "ready" && fileName && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileInfoName} numberOfLines={1}>
              ✓ {fileName}
            </Text>
            <Text style={styles.fileInfoMeta}>
              {FORMAT_LABEL[fileType]} · {numPages}{" "}
              {numPages === 1 ? t(lang, "page") : t(lang, "pages")} ·{" "}
              {words.length.toLocaleString()} {t(lang, "words")}
            </Text>
            <Text style={styles.fileInfoTime}>
              {formatTimeLeft(lang, words.length - startWordIndex, wpm)}
            </Text>
          </View>
        )}

        {parseState === "ready" && (
          <>
            {/* Saved progress banner */}
            {savedProgress && (
              <View style={styles.savedBanner}>
                <Text style={styles.savedText}>
                  {t(lang, "savedProgress", { page: savedProgress.page })}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    clearProgress(fileKey);
                    setSavedProgress(null);
                    setStartPage(1);
                    setStartPageText("1");
                  }}
                >
                  <Text style={styles.savedClear}>{t(lang, "clear")}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Start page picker */}
            <View style={styles.startPageRow}>
              <Text style={styles.startPageLabel}>
                {t(lang, "startFromPage")}
              </Text>
              <View style={styles.startPageControls}>
                <TouchableOpacity
                  style={styles.startPageBtn}
                  onPress={() => adjustStartPage(-1)}
                >
                  <Text style={styles.startPageBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.startPageInput}
                  value={startPageText}
                  onChangeText={handleStartPageText}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.startPageBtn}
                  onPress={() => adjustStartPage(1)}
                >
                  <Text style={styles.startPageBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={startReading}>
              <Text style={styles.startBtnText}>{t(lang, "startReading")}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.siteLink}
          onPress={() => Linking.openURL("https://speederreader.org/FEATURES/")}
        >
          <Text style={styles.siteLinkText}>
            {t(lang, "featureDocumentation")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scroll: {
      paddingHorizontal: 28,
      paddingVertical: 40,
      maxWidth: 520,
      alignSelf: "center" as any,
      width: "100%",
    },

    header: { alignItems: "center", marginBottom: 40, gap: 14 },
    title: {
      fontSize: 28,
      fontFamily: SERIF,
      fontWeight: "700",
      color: c.textPrimary,
      letterSpacing: 0.3,
    },
    headerBtns: { flexDirection: "row", gap: 8 },
    headerBtn: {
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
    },
    headerBtnText: {
      fontFamily: SERIF,
      fontSize: 12,
      color: c.textSecondary,
      letterSpacing: 1,
    },

    section: { marginBottom: 8 },
    label: {
      fontSize: 11,
      fontFamily: SERIF,
      color: c.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginBottom: 16,
    },

    wpmRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    wpmBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    wpmBtnText: { fontSize: 20, color: c.textPrimary, lineHeight: 22 },
    wpmValue: {
      fontSize: 26,
      fontFamily: SERIF,
      fontWeight: "700",
      color: c.textPrimary,
    },

    trackWrap: { marginBottom: 4 },
    track: {
      height: 3,
      backgroundColor: c.divider,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: 6,
    },
    fill: { height: 3, backgroundColor: c.accent, borderRadius: 2 },
    trackLabels: { flexDirection: "row", justifyContent: "space-between" },
    trackLabel: { fontSize: 11, color: c.textTertiary, fontFamily: SERIF },

    divider: { height: 1, backgroundColor: c.divider, marginVertical: 28 },

    modeToggle: {
      flexDirection: "row",
      marginBottom: 10,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      overflow: "hidden",
    },
    modeBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
    modeBtnActive: { backgroundColor: c.activeTabBg },
    modeBtnText: { fontFamily: SERIF, fontSize: 14, color: c.textSecondary },
    modeBtnActiveText: { color: c.activeTabText },

    formatsNote: {
      fontFamily: SERIF,
      fontSize: 11,
      color: c.textTertiary,
      textAlign: "center",
      marginBottom: 18,
    },

    uploadBtn: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      borderStyle: "dashed",
      paddingVertical: 20,
      alignItems: "center",
      marginBottom: 16,
    },
    dimmed: { opacity: 0.45 },
    uploadBtnText: { fontFamily: SERIF, fontSize: 16, color: c.textPrimary },

    urlRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    urlInput: {
      flex: 1,
      backgroundColor: c.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      fontFamily: SERIF,
      fontSize: 14,
      color: c.textPrimary,
      paddingHorizontal: 12,
      paddingVertical: 11,
    },
    urlBtn: {
      backgroundColor: c.primaryBtn,
      borderRadius: 8,
      paddingHorizontal: 18,
      justifyContent: "center",
    },
    urlBtnText: {
      color: c.primaryBtnText,
      fontFamily: SERIF,
      fontSize: 15,
      fontWeight: "600",
    },

    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    },
    progressText: { fontFamily: SERIF, fontSize: 14, color: c.textSecondary },

    fileInfo: {
      backgroundColor: c.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      marginBottom: 16,
    },
    fileInfoName: {
      fontFamily: SERIF,
      fontSize: 14,
      color: c.textPrimary,
      fontWeight: "600",
    },
    fileInfoMeta: {
      fontFamily: SERIF,
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 3,
    },
    fileInfoTime: {
      fontFamily: SERIF,
      fontSize: 12,
      color: c.accent,
      marginTop: 4,
    },

    savedBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: c.savedBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.savedBorder,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 14,
    },
    savedText: { fontFamily: SERIF, fontSize: 13, color: c.savedText },
    savedClear: {
      fontFamily: SERIF,
      fontSize: 12,
      color: c.savedClear,
      textDecorationLine: "underline",
    },

    startPageRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    startPageLabel: {
      fontFamily: SERIF,
      fontSize: 14,
      color: c.textMuted,
    },
    startPageControls: { flexDirection: "row", alignItems: "center", gap: 8 },
    startPageBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    startPageBtnText: { fontSize: 18, color: c.textPrimary, lineHeight: 20 },
    startPageInput: {
      width: 58,
      backgroundColor: c.card,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: c.border,
      fontFamily: SERIF,
      fontSize: 15,
      color: c.textPrimary,
      textAlign: "center",
      paddingVertical: 5,
    },

    startBtn: {
      backgroundColor: c.primaryBtn,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: "center",
    },
    startBtnText: {
      fontFamily: SERIF,
      fontSize: 18,
      fontWeight: "700",
      color: c.primaryBtnText,
      letterSpacing: 0.3,
    },

    siteLink: { alignItems: "center", paddingVertical: 24 },
    siteLinkText: {
      fontFamily: SERIF,
      fontSize: 12,
      color: c.textTertiary,
      letterSpacing: 0.5,
    },

    bookResult: {
      backgroundColor: c.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      marginBottom: 10,
    },
    bookTitle: {
      fontFamily: SERIF,
      fontSize: 15,
      color: c.textPrimary,
      fontWeight: "600",
      marginBottom: 3,
    },
    bookAuthor: {
      fontFamily: SERIF,
      fontSize: 13,
      color: c.textMuted,
      marginBottom: 4,
    },
    bookMeta: { fontFamily: SERIF, fontSize: 11, color: c.textTertiary },
  });
}
