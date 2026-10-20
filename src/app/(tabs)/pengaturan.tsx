// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity, Button, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { hapusSemuaCache } from "../../services/cacheRepository";

export default function TabPengaturan() {
  const { themeMode, setThemeMode, colors } = useTheme();
  const [pesan, setPesan] = useState<string | null>(null);

  async function hapusDataTersimpan() {
    await hapusSemuaCache();
    setPesan("Data cuaca tersimpan sudah dihapus.");
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.judul, { color: colors.text }]}>Pengaturan Aplikasi</Text>

      {/* Pilihan Mode Tampilan (Tugas 4 UTS) */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.subjudul, { color: colors.text }]}>Tema Tampilan</Text>
        
        <View style={styles.pilihanRow}>
          {(["light", "dark", "system"] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.tombolMode,
                { borderColor: colors.border },
                themeMode === mode && { backgroundColor: colors.primary },
              ]}
              onPress={() => setThemeMode(mode)}
            >
              <Text
                style={[
                  styles.teksMode,
                  { color: themeMode === mode ? "#ffffff" : colors.text },
                ]}
              >
                {mode === "light" ? "Terang" : mode === "dark" ? "Gelap" : "Sistem"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hapus Data Cache */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.subjudul, { color: colors.text }]}>Penyimpanan Cache</Text>
        <Button title="Hapus Data Cuaca Tersimpan" onPress={hapusDataTersimpan} />
        {pesan && <Text style={{ color: colors.subtext, marginTop: 8 }}>{pesan}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  judul: { fontSize: 20, fontWeight: "bold" },
  subjudul: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  card: { padding: 16, borderRadius: 10, borderWidth: 1 },
  pilihanRow: { flexDirection: "row", gap: 8 },
  tombolMode: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  teksMode: { fontSize: 14, fontWeight: "500" },
});