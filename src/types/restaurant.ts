// src/types/restaurant.ts

export interface RestauranteMapa {
  id:            string;
  nombre:        string;
  tipo:          string;
  distancia:     string;
  distanciaRaw:  number;
  calificacion:  number;
  totalReviews:  number;
  foto:          string | null;
  coordenadas:   { latitude: number; longitude: number };
  abierto:       boolean | null;
  precioNivel:   string;
  tiempoEntrega: string;
}