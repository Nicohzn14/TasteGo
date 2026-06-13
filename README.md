# Bienvenidos a Taste Go app 

TasteGo es una aplicación móvil de descubrimiento gastronómico desarrollada para la plataforma Android. Su propósito es permitir a los usuarios encontrar restaurantes cercanos a su ubicación, explorar sus menús, visualizar platos en 3D, guardar favoritos y obtener rutas de navegación hacia los establecimientos de su interés.

## Para empezar

1. Instalar todas las dependencias del package.json

   ```bash
   npm install
   ```

2. descargamos todas las herramientas y paquetes que se usaron en este proyecto

2.1 Dependencias base de Expo 

   ```bash
   npx expo install expo-router
   ```

   ```bash
  npx expo install expo-status-bar
   ```

   ```bash
   npx expo install expo-constants
   ```
2.2 Base de datos SQLite

   ```bash
   npx expo install expo-sqlite
   ```

2.3 Almacenamiento local

   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```

2.4 Criptografía (hash de contraseñas)

    ```bash
   npx expo install expo-crypto
   ```

2.5 Ubicación GPS

   ```bash
   npx expo install expo-location
   ```

2.6 Mapas

   ```bash
   npx expo install react-native-maps
   ```
2.7 WebView (para el visor 3D)

   ```bash
   npx expo install react-native-webview
   ```
2.8 Safe Area (para notch y bordes del dispositivo)

   ```bash
   npx expo install react-native-safe-area-context
   ```
2.9 Gradientes de colores

   ```bash
   npx expo install expo-linear-gradient
   ```

3. Correr el proyecto

   ```bash
   npx expo start
   ```

## La api de Google maps debe ser puesta en app.json, especficiamente en dos partes

    "android": {
       "permissions": [
    "android.permission.CAMERA",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION"
     ],
      "config": {
        "googleMaps": {
          "apiKey": "" // en esta primera parte
        }
      },

    "extra": {
     "googlePlacesKey": "", // y en esta segunda parte
     "router": {},
     
## Dsecargar la app

Para descargar la app de Taste Go entrar en este link de Google drive y descarga el apk

https://drive.google.com/drive/folders/16-hisSGf2JO1XNuXr8ufJ2WXHxiCI4eP?usp=sharing
