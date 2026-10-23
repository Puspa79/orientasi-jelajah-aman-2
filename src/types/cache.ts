// src/types/cache.ts
import { DataCuacaLengkap, DataKualitasUdara } from "./weather";

export type SumberData = "jaringan" | "cache-segar" | "cache-basi";

export interface KotaUntukCache {
  id?: number;
  nama: string;
  latitude: number;
  longitude: number;
}

export interface DataTersimpan {
  kotaId?: number;
  namaKota?: string;
  latitude?: number;
  longitude?: number;
  cuaca: DataCuacaLengkap | any;
  kualitasUdara: DataKualitasUdara | any;
  disimpanPada: number;
}

export interface CacheCuaca extends DataTersimpan {}

export interface HasilCuacaOffline extends DataTersimpan {
  sumber: SumberData;
}

export interface RingkasanKotaTersimpan {
  id: number;
  kota_id?: number;
  nama: string;
  nama_kota?: string;
  latitude: number;
  longitude: number;
  kunci: string;
  disimpanPada: number;
}