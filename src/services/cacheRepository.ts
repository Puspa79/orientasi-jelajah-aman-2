// src/services/cacheRepository.ts
import { ambilDatabase } from "../db/database";
import {
  RingkasanKotaTersimpan,
  CacheCuaca,
  KotaUntukCache,
} from "../types/cache";

export const BATAS_CACHE_MS = 24 * 60 * 60 * 1000;

export async function simpanCache(
  kota: KotaUntukCache,
  cuaca: any,
  kualitasUdara: any
): Promise<void> {
  const db = await ambilDatabase();
  const disimpanPada = Date.now();
  const kunci = String(kota.id ?? `${kota.latitude}-${kota.longitude}`);

  await db.runAsync(
    `INSERT OR REPLACE INTO cache_cuaca 
    (kunci, kota_id, nama_kota, latitude, longitude, cuaca_json, aqi_json, disimpan_pada) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      kunci,
      kota.id ?? 0,
      kota.nama,
      kota.latitude,
      kota.longitude,
      JSON.stringify(cuaca),
      JSON.stringify(kualitasUdara),
      disimpanPada,
    ]
  );
}

export async function ambilCache(
  target: KotaUntukCache | number,
  longitude?: number
): Promise<CacheCuaca | null> {
  const db = await ambilDatabase();

  let paramCari: any;
  if (typeof target === "object") {
    paramCari = target.id ?? target.nama;
  } else if (longitude !== undefined) {
    paramCari = `${target}-${longitude}`;
  } else {
    paramCari = target;
  }

  const row = await db.getFirstAsync<any>(
    "SELECT * FROM cache_cuaca WHERE kota_id = ? OR nama_kota = ? OR kunci = ?",
    [paramCari, paramCari, String(paramCari)]
  );

  if (!row) return null;

  try {
    let cuacaObj = row.cuaca_json;
    if (typeof cuacaObj === "string") {
      try {
        cuacaObj = JSON.parse(cuacaObj);
      } catch {}
    }
    if (typeof cuacaObj === "string") {
      try {
        cuacaObj = JSON.parse(cuacaObj);
      } catch {}
    }

    let aqiObj = row.aqi_json;
    if (typeof aqiObj === "string") {
      try {
        aqiObj = JSON.parse(aqiObj);
      } catch {}
    }
    if (typeof aqiObj === "string") {
      try {
        aqiObj = JSON.parse(aqiObj);
      } catch {}
    }

    return {
      kotaId: row.kota_id ?? row.id,
      namaKota: row.nama_kota ?? row.nama,
      latitude: row.latitude,
      longitude: row.longitude,
      cuaca: cuacaObj,
      kualitasUdara: aqiObj,
      disimpanPada: row.disimpan_pada,
    };
  } catch (err) {
    console.error("Gagal parse cache cuaca:", err);
    return null;
  }
}

export async function bersihkanCacheLama(
  batasMs: number = BATAS_CACHE_MS
): Promise<void> {
  const db = await ambilDatabase();
  const batasWaktu = Date.now() - batasMs;
  await db.runAsync("DELETE FROM cache_cuaca WHERE disimpan_pada < ?", [
    batasWaktu,
  ]);
}

export async function daftarKotaTersimpan(): Promise<RingkasanKotaTersimpan[]> {
  const db = await ambilDatabase();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM cache_cuaca ORDER BY disimpan_pada DESC"
  );
  return rows.map((r) => ({
    id: r.id ?? r.kota_id,
    kota_id: r.kota_id ?? r.id,
    nama: r.nama ?? r.nama_kota,
    nama_kota: r.nama_kota ?? r.nama,
    latitude: r.latitude,
    longitude: r.longitude,
    disimpanPada: r.disimpan_pada,
    kunci: r.kunci ?? `${r.kota_id}-${r.nama_kota}`,
  }));
}

export async function hapusCacheKota(
  idAtauNama: string | number
): Promise<void> {
  const db = await ambilDatabase();
  await db.runAsync(
    "DELETE FROM cache_cuaca WHERE kota_id = ? OR nama_kota = ? OR kunci = ?",
    [idAtauNama, idAtauNama, String(idAtauNama)]
  );
}

export async function bersihkanSemuaCache(): Promise<void> {
  const db = await ambilDatabase();
  await db.runAsync("DELETE FROM cache_cuaca");
}