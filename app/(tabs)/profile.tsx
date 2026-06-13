/**
 * TasteGo — Pantalla de Perfil
 *
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/layout/SafeScreen';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useAuth } from '@/src/context/AuthContext';
import { borrarCacheRestaurantes } from '@/src/context/RestaurantesContext';




export default function ProfileScreen() {
  const router = useRouter();
  const { usuario, logout } = useAuth();

  const handleLogout = async () => {
  if (usuario) await borrarCacheRestaurantes(usuario.id_usuario);
  await logout();
  router.replace('/(auth)/login');
};

  return (
   <SafeScreen padded={false} scrollable>
  <View style={styles.header}>
    <View />
  </View>

  <View style={styles.avatarSection}>
    <View style={styles.avatarBorder}>
      <Image
        source={{
          uri: 'https://i.pravatar.cc/300',
        }}
        style={styles.avatar}
      />
    </View>

    <TouchableOpacity style={styles.cameraButton}>
      <Text style={{ color: '#fff' }}>📷</Text>
    </TouchableOpacity>
  </View>

  <Text style={styles.name}>
    {usuario?.nombre ?? 'Usuario'}
  </Text>

  <View style={styles.card}>
    <View style={styles.iconContainer}>
      <Text>👤</Text>
    </View>

    <View>
      <Text style={styles.label}>Nombre completo</Text>
      <Text style={styles.value}>
        {usuario?.nombre ?? 'Usuario'}
      </Text>
    </View>
  </View>

  <View style={styles.card}>
    <View style={styles.iconContainer}>
      <Text>✉️</Text>
    </View>

    <View>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>
        {usuario?.email ?? 'No encontrado'}
      </Text>
    </View>
  </View>

  <View style={styles.card}>
    <View style={styles.iconContainer}>
      <Text>📞</Text>
    </View>

    <View>
      <Text style={styles.label}>Telefono</Text>
      <Text style={styles.value}>
        {usuario?.telefono ?? 'No encontrado'}
      </Text>
    </View>
  </View>

   <View style={styles.card}>
    <View style={styles.iconContainer}>
      <Text>📆</Text>
    </View>

    <View>
      <Text style={styles.label}>Fecha de nacimiento</Text>
      <Text style={styles.value}>
        {usuario?.fecha_nacimiento ?? 'No encontrado'}
      </Text>
    </View>
  </View>

   <View style={styles.card}>
    <View style={styles.iconContainer}>
      <Text>✅</Text>
    </View>

    <View>
      <Text style={styles.label}>Fecha de registro</Text>
      <Text style={styles.value}>
        {usuario?.fecha_registro ?? 'No encontrado'}
      </Text>
    </View>
  </View>

  <TouchableOpacity
    style={styles.logoutButton}
    onPress={handleLogout}
  >
    <Text style={styles.logoutButtonText}>
      Cerrar sesión
    </Text>
  </TouchableOpacity>
</SafeScreen>
  );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#F8F8F8',
},

header: {
  paddingTop: 20,
  alignItems: 'center',
},

avatarSection: {
  marginTop: 30,
  alignItems: 'center',
},

avatarBorder: {
  borderWidth: 2,
  borderStyle: 'dashed',
  borderColor: Colors.primary,
  borderRadius: 100,
  padding: 6,
},

avatar: {
  width: 120,
  height: 120,
  borderRadius: 60,
},

cameraButton: {
  position: 'absolute',
  bottom: 0,
  width: 34,
  height: 34,
  borderRadius: 17,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: Colors.textPrimary,
  borderWidth: 3,
  borderColor: '#fff',
},

name: {
  marginTop: 18,
  textAlign: 'center',
  fontSize: 30,
  fontWeight: '700',
  color: '#6B6B6B',
  marginBottom: 28,
},

card: {
  backgroundColor: '#fff',
  flexDirection: 'row',
  alignItems: 'center',
  padding: 18,
  borderRadius: 15,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#ECECEC',
  marginHorizontal: Layout.horizontalPadding,
},

iconContainer: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: '#F2F4F7',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 15,
},

label: {
  color: '#B0B7C3',
  fontSize: 12,
  marginBottom: 4,
},

value: {
  fontSize: 15,
  fontWeight: '700',
  color: '#000',
},

statsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 10,
  marginBottom: 20,
},

logoutButton: {
  marginHorizontal: Layout.horizontalPadding,
  marginTop: 10,
  marginBottom: 40,
  backgroundColor: '#EF4444',
  paddingVertical: 16,
  borderRadius: 15,
  alignItems: 'center',
},

logoutButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
});