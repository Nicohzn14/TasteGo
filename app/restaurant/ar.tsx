// app/restaurant/[id]/ar.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Colors } from '@/constants/Colors';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { Layout } from '@/constants/Layout';

export default function ARScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const modelUrl  = String(params.modelUrl  ?? '');
  const platoNombre = String(params.nombre ?? 'Plato');
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(false);

  // HTML que usa model-viewer de Google
  // ar-modes="webxr scene-viewer quick-look" activa la cámara en Android
const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script
      type="module"
      src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js">
    </script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        background: #111;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: sans-serif;
      }
      model-viewer {
        width: 100vw;
        height: 100vh;
        background: transparent;
      }
      .label {
        position: fixed;
        bottom: 24px;
        left: 0; right: 0;
        text-align: center;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        text-shadow: 0 1px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 10;
      }
      .ar-btn {
        position: fixed;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: #E8472A;
        color: #fff;
        border: none;
        border-radius: 99px;
        padding: 14px 32px;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 4px 12px rgba(232,71,42,0.4);
        white-space: nowrap;
      }
      #ar-status {
        position: fixed;
        top: 12px;
        left: 0; right: 0;
        text-align: center;
        color: #fff;
        font-size: 11px;
        background: rgba(0,0,0,0.5);
        padding: 4px;
        z-index: 20;
      }
    </style>
  </head>
  <body>
    <div id="ar-status">Cargando…</div>
    <model-viewer
      id="viewer"
      src="${modelUrl}"
      ar
      ar-modes="scene-viewer webxr quick-look"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      exposure="1"
      ar-scale="fixed"
    >
      <button class="ar-btn" slot="ar-button">
        📷 Ver en tu mesa
      </button>
    </model-viewer>
    <div class="label">${platoNombre} — Arrastra para rotar · Pellizca para escalar</div>

    <script>
      const viewer = document.getElementById('viewer');
      const status = document.getElementById('ar-status');

      viewer.addEventListener('load', () => {
        status.textContent = 'Modelo cargado ✓';
        setTimeout(() => status.style.display = 'none', 2000);
      });

      viewer.addEventListener('error', (e) => {
        status.textContent = 'Error: ' + (e.detail?.type ?? 'desconocido');
        status.style.background = 'rgba(200,0,0,0.7)';
      });

      viewer.addEventListener('ar-status', (e) => {
        status.style.display = 'block';
        status.textContent = 'AR: ' + e.detail.status;
        if (e.detail.status === 'failed') {
          status.style.background = 'rgba(200,0,0,0.7)';
          status.textContent = 'AR no disponible en este dispositivo';
        }
      });
    </script>
  </body>
  </html>
`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backTxt}>◀</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Vista 3D — {platoNombre}
          </Text>
          <Text style={styles.headerSub}>
            Toca "Ver en tu mesa" para activar la cámara
          </Text>
        </View>
      </View>

      {/* WebView con model-viewer */}
      <View style={styles.webviewContainer}>
        {cargando && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingTxt}>Cargando modelo 3D…</Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTxt}>
              No se pudo cargar el modelo. Verifica tu conexión.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => { setError(false); setCargando(true); }}
            >
              <Text style={styles.retryTxt}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ html }}
            style={styles.webview}
            onLoadEnd={() => setCargando(false)}
            onError={() => { setError(true); setCargando(false); }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            mixedContentMode="always"
            androidLayerType="hardware"
            // Permisos de cámara en Android
            androidHardwareAccelerationDisabled={false}
            onPermissionRequest={(event: any) => {
  event.nativeEvent.request.grant(
    event.nativeEvent.request.resources
  );
}}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#000' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Layout.horizontalPadding,
    paddingVertical: 12, gap: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt:     { fontSize: 16 },
  headerInfo:  { flex: 1 },
  headerTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // WebView
  webviewContainer: { flex: 1, position: 'relative' },
  webview:          { flex: 1, backgroundColor: '#000' },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
    gap: 16, zIndex: 10,
  },
  loadingTxt: {
    color: '#fff', fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },

  // Error
  errorContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#000', gap: 16,
    paddingHorizontal: Layout.horizontalPadding,
  },
  errorEmoji: { fontSize: 48 },
  errorTxt: {
    color: '#fff', fontSize: FontSizes.sm,
    textAlign: 'center', lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12, paddingHorizontal: 28,
    borderRadius: Layout.radius.lg,
  },
  retryTxt: { color: '#fff', fontWeight: FontWeights.bold },
});