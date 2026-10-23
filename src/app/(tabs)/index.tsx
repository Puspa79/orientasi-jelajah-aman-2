// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { useTheme } from "../../context/ThemeContext";
import { cariKota } from "../../services/geocodingService";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
} from "../../services/cacheRepository";
import {
  mintaIzinLokasi,
  ambilKoordinatSaatIni,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { simpanRiwayat } from "../../services/riwayatStorage";

export default function HalamanUtama() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
    nama?: string;
    lat?: string;
    lon?: string;
  }>();
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    []
  );
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }

  useFocusEffect(
    useCallback(() => {
      bersihkanCacheLama(BATAS_CACHE_MS)
        .then(muatKotaTersimpan)
        .catch(() => {});
    }, [])
  );

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    setHasilPencarian([]);
    setTeksCari("");

    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui }
      );
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(data);

      await simpanRiwayat({
        id: kota.id,
        nama: kota.name,
        latitude: kota.latitude,
        longitude: kota.longitude,
      });

      muatKotaTersimpan();
    } catch (err) {
      console.error(">>> ERROR FETCH CUACA:", err);

      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Kota ini belum memiliki data tersimpan di perangkat. Sambungkan ke internet terlebih dahulu untuk membuka kota baru."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  useEffect(() => {
    if (params.nama && params.lat && params.lon) {
      pilihKota({
        id: Number(params.id ?? -1),
        name: params.nama,
        latitude: Number(params.lat),
        longitude: Number(params.lon),
        country: "",
      });
    }
  }, [params.id, params.nama, params.lat, params.lon]);

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi(
        "Izin lokasi ditolak. Silakan cari kota secara manual di atas."
      );
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual."
      );
      return;
    }
    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} />
        <Button
          title="Gunakan Lokasi Saat Ini"
          onPress={gunakanLokasiSaatIni}
        />
        {pesanLokasi && (
          <Text style={{ color: colors.subtext }}>{pesanLokasi}</Text>
        )}
        {hasilPencarian.map((kota) => (
          <TouchableOpacity
            key={kota.id}
            onPress={() => pilihKota(kota)}
            style={{
              padding: 10,
              backgroundColor: colors.card,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text }}>{kota.name}</Text>
          </TouchableOpacity>
        ))}
        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "bold", color: colors.text }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k: any) => {
              const idKota = k.id ?? k.kota_id;
              const namaKota = k.nama ?? k.nama_kota;
              return (
                <TouchableOpacity
                  key={k.kunci ?? idKota}
                  style={{
                    padding: 10,
                    backgroundColor: colors.card,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={() =>
                    pilihKota({
                      id: Number(idKota),
                      name: String(namaKota),
                      latitude: Number(k.latitude),
                      longitude: Number(k.longitude),
                      country: "",
                    })
                  }
                >
                  <Text style={{ color: colors.text }}>{namaKota}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {sedangMemuat && <ActivityIndicator color={colors.primary} />}
        {pesanError && (
          <View>
            <Text style={{ color: "#ef4444" }}>{pesanError}</Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca?.saatIni?.suhu ?? 0}
              tingkatAQI={konversiTingkatAQI(
                hasil.kualitasUdara?.indeksAQI ?? 0
              )}
            />
            <Text style={{ fontSize: 12, color: colors.subtext }}>
              Kondisi:{" "}
              {labelKodeCuaca(hasil.cuaca?.saatIni?.kodeCuaca ?? 0)}{" "}
              {"\u2022"} Angin {hasil.cuaca?.saatIni?.kecepatanAngin ?? 0} km/j
            </Text>
            <Button
              title="Perbarui Sekarang"
              onPress={() => pilihKota(kotaTerpilih, true)}
            />
            <Button
              title="Tambahkan ke Favorit"
              onPress={() =>
                router.push({
                  pathname: "/tambah-favorit",
                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
            />
          </>
        )}
        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}