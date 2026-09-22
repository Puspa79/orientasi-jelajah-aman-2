// src/app/(tabs)/tentang.tsx
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTentangScreen() {
  return (
    // Menggunakan warna #f2f2f2 agar abu-abunya sama persis dengan halaman lain
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <View style={{ padding: 16, backgroundColor: "transparent" }}>
        <Text 
          style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#000000" }}
          accessible={true}
          accessibilityLabel="Judul Halaman: Tentang Aplikasi"
          accessibilityRole="header"
        >
          Tentang Aplikasi
        </Text>
        
        <Text style={{ fontSize: 14, marginBottom: 4, color: "#000000" }}>Nama Aplikasi: Jelajah Aman</Text>
        <Text style={{ fontSize: 14, marginBottom: 4, color: "#000000" }}>Versi: 1.0.0</Text>
        <Text style={{ fontSize: 14, color: "#000000" }}>Pembuat: Puspa</Text>
      </View>
    </SafeAreaView>
  );
}
