// src/services/riwayatStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat";

export interface ItemRiwayat {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  disimpanPada: number;
}

export async function ambilRiwayat(): Promise<ItemRiwayat[]> {
  const json = await AsyncStorage.getItem(KUNCI_RIWAYAT);
  return json ? JSON.parse(json) : [];
}

export async function simpanRiwayat(
  kota: Omit<ItemRiwayat, "disimpanPada">
): Promise<void> {
  const daftar = await ambilRiwayat();
  const sisa = daftar.filter((k) => k.id !== kota.id);
  const daftarBaru = [
    { ...kota, disimpanPada: Date.now() },
    ...sisa,
  ].slice(0, 10);
  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(daftarBaru));
}

export async function hapusSatuRiwayat(id: number): Promise<void> {
  const daftar = await ambilRiwayat();
  const daftarBaru = daftar.filter((k) => k.id !== id);
  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(daftarBaru));
}

export async function hapusSemuaRiwayat(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI_RIWAYAT);
}