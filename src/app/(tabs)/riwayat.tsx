// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { daftarKotaTersimpan, hapusCacheKota } from "../../services/cacheRepository";
import { KotaFavorit } from "../../types/favorit";
import { RingkasanKotaTersimpan } from "../../types/cache";

export default function TabRiwayat() {
  const { colors } = useTheme();
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<RingkasanKotaTersimpan[]>([]);
  const router = useRouter();

  const muatData = async () => {
    const favorit = await ambilSemuaFavorit();
    const riwayat = await daftarKotaTersimpan();
    setDaftarFavorit(favorit);
    setDaftarRiwayat(riwayat);
  };

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [])
  );

  async function hapusFav(id: number) {
    await hapusFavorit(id);
    muatData();
  }

  function konfirmasiHapusFavorit(id: number, nama: string) {
    if (Platform.OS === "web") {
      if (window.confirm(`Yakin hapus ${nama} dari favorit?`)) hapusFav(id);
    } else {
      Alert.alert("Konfirmasi Hapus", `Yakin hapus ${nama} dari favorit?`, [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => hapusFav(id) },
      ]);
    }
  }

  async function hapusCache(kunci: string) {
    await hapusCacheKota(kunci);
    muatData();
  }

  function konfirmasiHapusCache(kunci: string, nama: string) {
    if (Platform.OS === "web") {
      if (window.confirm(`Yakin hapus cache cuaca ${nama}?`)) hapusCache(kunci);
    } else {
      Alert.alert(
        "Konfirmasi Hapus Cache",
        `Apakah Anda yakin ingin menghapus data cache cuaca untuk ${nama}?`,
        [
          { text: "Batal", style: "cancel" },
          { text: "Hapus", style: "destructive", onPress: () => hapusCache(kunci) },
        ]
      );
    }
  }

  function pilihKota(item: { id: number; nama: string; latitude: number; longitude: number }) {
    router.push({
      pathname: "/",
      params: {
        id: String(item.id),
        nama: item.nama,
        lat: String(item.latitude),
        lon: String(item.longitude),
      },
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ gap: 20 }}>
        {/* Riwayat Pencarian */}
        <View style={styles.section}>
          <Text style={[styles.judul, { color: colors.text }]}>
            Riwayat Pencarian (Cache Offline)
          </Text>
          <Text style={[styles.subjudul, { color: colors.subtext }]}>
            Maksimal 10 pencarian terakhir
          </Text>

          {daftarRiwayat.length === 0 ? (
            <Text style={{ color: colors.subtext, fontStyle: "italic" }}>
              Belum ada riwayat pencarian.
            </Text>
          ) : (
            daftarRiwayat.map((item) => (
              <View
                key={item.kunci}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  style={styles.infoKota}
                  onPress={() => pilihKota(item)}
                >
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={[styles.textKota, { color: colors.text }]}>
                    {item.nama}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => konfirmasiHapusCache(item.kunci, item.nama)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Kota Favorit */}
        <View style={styles.section}>
          <Text style={[styles.judul, { color: colors.text }]}>
            Kota Favorit ({daftarFavorit.length})
          </Text>

          {daftarFavorit.length === 0 ? (
            <Text style={{ color: colors.subtext, fontStyle: "italic" }}>
              Belum ada kota favorit.
            </Text>
          ) : (
            daftarFavorit.map((kota) => (
              <View
                key={kota.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  style={styles.infoKota}
                  onPress={() =>
                    pilihKota({
                      id: kota.id,
                      nama: kota.nama,
                      latitude: kota.latitude,
                      longitude: kota.longitude,
                    })
                  }
                >
                  <Ionicons name="heart" size={20} color="#e11d48" />
                  <Text style={[styles.textKota, { color: colors.text }]}>
                    {kota.nama}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => konfirmasiHapusFavorit(kota.id, kota.nama)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { gap: 8 },
  judul: { fontSize: 18, fontWeight: "bold" },
  subjudul: { fontSize: 12, marginBottom: 4 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoKota: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  textKota: { fontSize: 15, fontWeight: "500" },
});