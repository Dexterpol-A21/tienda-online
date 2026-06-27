-- Tienda Online - Schema PostgreSQL
-- 1. CREATE DATABASE tienda;
-- 2. \c tienda
-- 3. \i db/schema.sql

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100)        NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT                NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(200)   NOT NULL,
  descripcion TEXT,
  precio_usd  NUMERIC(10, 2) NOT NULL,
  imagen_url  TEXT,
  categoria   VARCHAR(100)   DEFAULT 'General'
);

INSERT INTO productos (nombre, descripcion, precio_usd, imagen_url, categoria) VALUES
  ('Laptop',      'Computadora personal portátil.',        899.99, 'laptop',     'Electrónica'),
  ('Auriculares', 'Dispositivo de audio sobre las orejas.', 79.99, 'headphones', 'Electrónica'),
  ('Cámara',      'Dispositivo para capturar imágenes.',   349.99, 'camera',     'Electrónica'),
  ('Mochila',     'Bolsa para transportar objetos.',         45.99, 'backpack',   'Accesorios'),
  ('Monitor',     'Pantalla de visualización externa.',    399.99, 'monitor',    'Electrónica'),
  ('Mouse',       'Dispositivo apuntador.',                  29.99, 'mouse',      'Electrónica'),
  ('Teclado',     'Periférico de entrada.',                  89.99, 'keyboard',   'Electrónica'),
  ('Smartwatch',  'Reloj inteligente digital.',             199.99, 'watch',      'Electrónica'),
  ('Tablet',      'Computadora portátil táctil.',           279.99, 'tablet',     'Electrónica');
