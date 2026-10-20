// src/app/(tabs)/tentang.tsx
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function TabTentang() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={{ gap: 16 }}>
        <Text style={[styles.judul, { color: colors.text }]}>
          Tentang Aplikasi Jelajah Aman
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.namaApp, { color: colors.primary }]}>
            Jelajah Aman
          </Text>
          <Text style={[styles.versi, { color: colors.subtext }]}>
            Versi 1.0.0 (Praktikum 7 & UTS)
          </Text>
          <Text style={[styles.deskripsi, { color: colors.text }]}>
            Jelajah Aman adalah aplikasi informasi cuaca dan kualitas udara
            lokal berbasis React Native / Expo yang mendukung mode offline-first
            menggunakan SQLite dan AsyncStorage.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.subjudul, { color: colors.text }]}>
            Sumber Data (Atribusi)
          </Text>
          <Text style={[styles.sumber, { color: colors.subtext }]}>
            {"\u2022"} Data Cuaca & Geocoding: Open-Meteo API
          </Text>
          <Text style={[styles.sumber, { color: colors.subtext }]}>
            {"\u2022"} Data Kualitas Udara: Open-Meteo Air Quality API
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  judul: { fontSize: 20, fontWeight: "bold" },
  namaApp: { fontSize: 18, fontWeight: "bold" },
  versi: { fontSize: 13, marginBottom: 8 },
  deskripsi: { fontSize: 14, lineHeight: 20 },
  subjudul: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  sumber: { fontSize: 14, marginBottom: 4 },
  card: { padding: 16, borderRadius: 10, borderWidth: 1 },
});