// app/restaurant/[id]/menu.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';
import type { RestauranteMapa } from '@/src/types/restaurant';



// Categorías del menú
const CATEGORIAS_MENU = ['Todo', 'Entradas', 'Platos fuertes', 'Bebidas', 'Postres'];

const PLATOS_MOCK = [
  {
    id: 'p1', nombre: 'Mote de queso',
    descripcion: 'Sopa típica de la Costa Caribe con ñame y queso costeño.',
    precio: 18000, categoria: 'Platos fuertes',
    foto: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    modelo3d: 'https://raw.githubusercontent.com/Nicohzn14/modelos/main/models/vegetable_soup.glb',
  },
  {
    id: 'p2', nombre: 'Arroz con pollo costeño',
    descripcion: 'Arroz amarillo con pollo, verduras y especias locales.',
    precio: 22000, categoria: 'Platos fuertes',
    foto: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    modelo3d: 'https://raw.githubusercontent.com/Nicohzn14/modelos/main/models/chicken_meal.glb',
  },
  {
    id: 'p3', nombre: 'Patacones con hogao',
    descripcion: 'Tostones de plátano verde con salsa de tomate y cebolla.',
    precio: 10000, categoria: 'Entradas',
    foto: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
    modelo3d: 'https://raw.githubusercontent.com/Nicohzn14/modelos/main/models/day_47_-_1_scan_a_day_-_bananes_plantains.glb',
  },
  {
    id: 'p4', nombre: 'Limonada ',
    descripcion: 'Jugo natural de limon, fruta típica de la región.',
    precio: 6000, categoria: 'Bebidas',
    foto: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    modelo3d: 'https://raw.githubusercontent.com/Nicohzn14/modelos/main/models/lemonade__glass.glb',
  },
  {
    id: 'p5', nombre: 'Ensalada de frutas',
    descripcion: 'Mix de frutas tropicales con crema de leche.',
    precio: 9000, categoria: 'Postres',
    foto: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400',
    modelo3d: 'https://raw.githubusercontent.com/Nicohzn14/modelos/main/models/bowl_with_fruit_salad.glb',
  },
  {
    id: 'p6', nombre: 'Sancocho de gallina',
    descripcion: 'Tradicional sancocho con gallina criolla y yuca.',
    precio: 25000, categoria: 'Platos fuertes',
    foto: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    modelo3d: 'https://raw.githubusercontent.com/Nicohzn14/modelos/main/models/wagamama_chicken_raisukaree.glb',
  },
];

export default function MenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [catActiva, setCatActiva] = useState('Todo');
const restauranteId = String(params.id ?? '');
  const restaurante: RestauranteMapa | null = params.data
    ? JSON.parse(String(params.data))
    : null;

  const platosFiltrados = catActiva === 'Todo'
    ? PLATOS_MOCK
    : PLATOS_MOCK.filter((p) => p.categoria === catActiva);

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backTxt}>◀</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {restaurante?.nombre ?? 'Menú'}
          </Text>
          <Text style={styles.headerSub}>{platosFiltrados.length} platos</Text>
        </View>
      </View>

      {/* Chips de categoría */}
      <FlatList
        horizontal
        style={{
    flexGrow: 0,
    flexShrink: 0,
  }}
        data={CATEGORIAS_MENU}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
  styles.catList,
  { alignItems: 'center' }
]}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        renderItem={({ item }) => {
          const activo = catActiva === item;
          return (
            <TouchableOpacity
              style={[styles.chip, activo && styles.chipActivo]}
              onPress={() => setCatActiva(item)}
            >
              <Text style={[styles.chipTxt, activo && styles.chipTxtActivo]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Lista de platos */}
      <FlatList
  style={{ flex: 1 }}
  data={platosFiltrados}
  keyExtractor={(p) => p.id}
  contentContainerStyle={styles.listaPlatos}
  showsVerticalScrollIndicator={false}
  renderItem={({ item }) => (
    <PlatoCard item={item} restauranteId={restauranteId} />
  )}
  ListEmptyComponent={
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyTxt}>
        No hay platos en esta categoría.
      </Text>
    </View>
  }
/>

    </SafeAreaView>
  );
}

// ── Card de plato ─────────────────────────────────────────────────────────────
function PlatoCard({ item, restauranteId }: {
  item: typeof PLATOS_MOCK[0];
  restauranteId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState(false);

  return (
    <View style={platoStyles.card}>
      {!error ? (
        <Image
          source={{ uri: item.foto }}
          style={platoStyles.img}
          onError={() => setError(true)}
        />
      ) : (
        <View style={[platoStyles.img, platoStyles.imgFallback]}>
          <Text style={{ fontSize: 28 }}>🍽️</Text>
        </View>
      )}
      <View style={platoStyles.info}>
        <Text style={platoStyles.nombre}>{item.nombre}</Text>
        <Text style={platoStyles.desc} numberOfLines={2}>{item.descripcion}</Text>
        <View style={platoStyles.footer}>
          <Text style={platoStyles.precio}>
            ${item.precio.toLocaleString('es-CO')}
          </Text>


 {/* Botón Ver 3D — solo si tiene modelo */}
          {item.modelo3d ? (
            <TouchableOpacity
              style={platoStyles.btn3d}
              onPress={() =>
                router.push({
                   pathname: '../restaurant/ar',
                  params: {
                    id:       restauranteId,
                    modelUrl: item.modelo3d!,
                    nombre:   item.nombre,
                  },
                })
              }
            >
              <Text style={platoStyles.btn3dTxt}>Ver 3D</Text>
            </TouchableOpacity>
          ) : (
            <View style={platoStyles.catBadge}>
              <Text style={platoStyles.catTxt}>{item.categoria}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const platoStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.xl, marginBottom: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  img:         { width: 90, height: 90, resizeMode: 'cover' },
  imgFallback: { backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center' },
  info:        { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  nombre:      { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.textPrimary },
  desc:        { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 17 },
  footer:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  precio:      { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.primary },
  catBadge:    { backgroundColor: Colors.backgroundAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Layout.radius.full },
  catTxt:      { fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeights.medium },

    btn3d: {
     flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: Colors.primary,
    paddingVertical: 14, borderRadius: Layout.radius.lg, paddingRight:10, paddingLeft:10
  },
  btnRutaEmoji: { fontSize: 18 },
  btn3dTxt:   { color: Colors.primary, fontWeight: FontWeights.bold, fontSize: FontSizes.base },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Layout.horizontalPadding,
    paddingTop: 16, paddingBottom: 12, gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt:     { fontSize: 16 },
  headerInfo:  { flex: 1 },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.heavy, color: Colors.textPrimary },
  headerSub:   { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  catList: {
  paddingHorizontal: Layout.horizontalPadding,
  paddingBottom: 12,
  height: 50,

},
 chip: {
  height: 36,
  justifyContent: 'center',
  paddingHorizontal: 16,
  borderRadius: 20,
  backgroundColor: Colors.backgroundAlt,
  borderWidth: 1,
  borderColor: Colors.border,
},
  chipActivo:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt:       { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: FontWeights.medium },
  chipTxtActivo: { color: '#fff', fontWeight: FontWeights.bold },
  listaPlatos:   { paddingHorizontal: Layout.horizontalPadding, paddingBottom: 100, justifyContent:'flex-start' },
  empty:         { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji:    { fontSize: 48 },
  emptyTxt:      { fontSize: FontSizes.sm, color: Colors.textSecondary },
});