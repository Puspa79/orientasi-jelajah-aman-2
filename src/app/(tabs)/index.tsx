// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef } from "react"; // Tambahkan useRef di sini
import { View, Text, ActivityIndicator, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasil, setHasil] = useState<HasilGeocoding[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  // NO 2: Mengubah nilai delay debounce dari 500 menjadi 800
  const teksTertunda = useDebounce(teksCari, 800);

  // =========================================================================
  // TAHAP 7 POIN 1: Siapkan penanda permintaan menggunakan useRef
  // Nomor urut permintaan yang bertahan antar-render tanpa memicu render ulang
  // =========================================================================
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasil([]);
      setPesanError(null);
      return;
    }
    ambilData(teksTertunda);
  }, [teksTertunda]);

  async function ambilData(nama: string) {
    const idSaatIni = ++requestIdRef.current;

    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await cariKota(nama);
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(data);
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setPesanError("Gagal mengambil data. Periksa koneksi internet Anda.");
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setSedangMemuat(false);
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <SearchBox onCari={setTeksCari} />

      {sedangMemuat && <ActivityIndicator />}

      {/* NO 3: Menambahkan accessibilityLabel pada pesan error */}
      {pesanError && (
        <View>
          <Text accessibilityLabel="Pesan error: Gagal memuat data cuaca">
            {pesanError}
          </Text>
          <Button title="Coba Lagi" onPress={() => ambilData(teksTertunda)} />
        </View>
      )}

      {/* NO 3: Menambahkan accessibilityLabel pada pesan kosong */}
      {!sedangMemuat && !pesanError && teksTertunda.length > 0 && hasil.length === 0 && (
        <Text accessibilityLabel="Pesan kosong: Kota tidak ditemukan">
          Kota tidak ditemukan
        </Text>
      )}

      {/* NO 1: Menambahkan teks indikator jumlah hasil di atas daftar WeatherCard */}
      {hasil.length > 0 && (
        <Text style={{ fontWeight: "bold" }}>
          Ditemukan {hasil.length} kota
        </Text>
      )}

      {hasil.map((kota) => (
        <WeatherCard key={kota.id} kota={kota.name} suhu={29} tingkatAQI="BAIK" />
      ))}
    </SafeAreaView>
  );
}
