// src/db/database.web.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SQLiteDatabase } from "expo-sqlite";

const KUNCI_STORAGE_WEB = "@jelajah_aman:cache_cuaca_web_v5";

async function ambilSemuaCache(): Promise<any[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_STORAGE_WEB);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function simpanSemuaCache(list: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KUNCI_STORAGE_WEB, JSON.stringify(list));
  } catch (err) {
    console.error("Gagal menyimpan cache web:", err);
  }
}

const mockWebDatabase = {
  execAsync: async () => {},

  runAsync: async (sql: string, params: any[] = []) => {
    const list = await ambilSemuaCache();
    const sqlLower = sql.toLowerCase();

    if (sqlLower.includes("delete")) {
      if (!sqlLower.includes("where")) {
        await simpanSemuaCache([]);
        return { lastInsertRowId: 0, changes: 1 };
      }

      const target = params[0];
      const sisa = list.filter(
        (item) =>
          item.kunci !== String(target) &&
          item.kota_id !== Number(target) &&
          item.id !== Number(target) &&
          item.nama_kota?.toLowerCase() !== String(target).toLowerCase() &&
          item.nama?.toLowerCase() !== String(target).toLowerCase()
      );
      await simpanSemuaCache(sisa);
      return { lastInsertRowId: 0, changes: 1 };
    }

    if (sqlLower.includes("cache_cuaca")) {
      const [
        kunci,
        kota_id,
        nama_kota,
        latitude,
        longitude,
        cuaca_json,
        aqi_json,
        disimpan_pada,
      ] = params;

      const cuacaStr =
        typeof cuaca_json === "string"
          ? cuaca_json
          : JSON.stringify(cuaca_json ?? {});
      const aqiStr =
        typeof aqi_json === "string"
          ? aqi_json
          : JSON.stringify(aqi_json ?? {});

      const idFix = Number(kota_id ?? 0);
      const namaFix = String(nama_kota ?? "");

      const newItem = {
        kunci: String(kunci || `${idFix}-${namaFix}`),
        kota_id: idFix,
        id: idFix,
        nama_kota: namaFix,
        nama: namaFix,
        latitude: Number(latitude ?? 0),
        longitude: Number(longitude ?? 0),
        cuaca_json: cuacaStr,
        aqi_json: aqiStr,
        disimpan_pada: Number(disimpan_pada || Date.now()),
      };

      const sisa = list.filter(
        (i) =>
          Number(i.kota_id) !== Number(newItem.kota_id) &&
          i.nama_kota?.toLowerCase() !== newItem.nama_kota?.toLowerCase() &&
          i.kunci !== newItem.kunci
      );

      await simpanSemuaCache([newItem, ...sisa]);
    }
    return { lastInsertRowId: 1, changes: 1 };
  },

  getAllAsync: async <T = any>(sql: string) => {
    if (sql.includes("PRAGMA")) return [{ user_version: 2 }] as T[];
    const list = await ambilSemuaCache();
    return list as T[];
  },

  getFirstAsync: async <T = any>(sql: string, params: any[] = []) => {
    if (sql.includes("PRAGMA")) return { user_version: 2 } as T;

    const list = await ambilSemuaCache();
    if (params.length === 0) return (list[0] || null) as T | null;

    const paramCari = params[0];
    if (paramCari === undefined || paramCari === null) return null;

    const paramStr = String(paramCari).toLowerCase().trim();
    const paramNum = Number(paramCari);

    const ditemukan = list.find((item) => {
      if (!isNaN(paramNum) && paramNum !== 0) {
        if (Number(item.kota_id) === paramNum || Number(item.id) === paramNum)
          return true;
      }
      if (item.kunci && String(item.kunci).toLowerCase() === paramStr)
        return true;
      if (item.nama_kota && String(item.nama_kota).toLowerCase() === paramStr)
        return true;
      if (item.nama && String(item.nama).toLowerCase() === paramStr)
        return true;
      return false;
    });

    return (ditemukan || null) as T | null;
  },

  withTransactionAsync: async (cb: () => Promise<void>) => {
    await cb();
  },
} as unknown as SQLiteDatabase;

export function ambilDatabase(): Promise<SQLiteDatabase> {
  return Promise.resolve(mockWebDatabase);
}