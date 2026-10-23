// src/services/cuacaRepository.ts
import { ambilCuaca } from "./weatherService";
import { ambilKualitasUdara } from "./airQualityService";
import { ambilCache, simpanCache } from "./cacheRepository";
import { HasilCuacaOffline, KotaUntukCache } from "../types/cache";

export const TTL_SEGAR_MS = 30 * 60 * 1000;
export const BATAS_CACHE_MS = 7 * 24 * 60 * 60 * 1000;

interface OpsiAmbil {
  paksaPerbarui?: boolean;
}

export async function ambilCuacaOfflineFirst(
  kota: KotaUntukCache,
  opsi: OpsiAmbil = {}
): Promise<HasilCuacaOffline> {
  const cache = await ambilCache(kota);
  const umur = cache ? Date.now() - cache.disimpanPada : Infinity;

  if (cache && umur < TTL_SEGAR_MS && !opsi.paksaPerbarui) {
    return { ...cache, sumber: "cache-segar" };
  }

  const dariJaringan = await Promise.all([
    ambilCuaca(kota.latitude, kota.longitude),
    ambilKualitasUdara(kota.latitude, kota.longitude),
  ]).catch(() => null);

  if (!dariJaringan) {
    if (cache) return { ...cache, sumber: "cache-basi" };
    throw new Error("Tidak ada koneksi dan belum ada data tersimpan");
  }

  const [cuaca, kualitasUdara] = dariJaringan;
  try {
    await simpanCache(kota, cuaca, kualitasUdara);
  } catch (err) {
    console.error("Gagal simpan cache:", err);
  }

  return {
    kotaId: kota.id,
    namaKota: kota.nama,
    latitude: kota.latitude,
    longitude: kota.longitude,
    cuaca,
    kualitasUdara,
    disimpanPada: Date.now(),
    sumber: "jaringan",
  };
}