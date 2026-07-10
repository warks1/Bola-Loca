# Crazy Ball v5 Online

Demo web jugable para móvil y ordenador.

## Incluye
- Ranking de puntuaciones.
- Chat entre jugadores.
- Nombre de jugador persistente.
- Modo local automático para probar sin configurar servidor.
- Modo online real mediante Supabase.
- Niveles con dificultad creciente.
- Rangos implícitos por progreso de nivel.
- Skins comprables con monedas y cambio de color de la bola.
- Escudo corregido: protege frente a obstáculos.
- Súper bola dorada indestructible temporal.
- Imán de monedas.
- Multiplicador x3.
- Más monedas y obstáculos variados.
- Control táctil limitado: la bola no salta directamente debajo del dedo.

## Probar
Abre `index.html` o publica la carpeta completa en GitHub Pages.

## Activar online real
1. Crea un proyecto gratuito en Supabase.
2. Abre el editor SQL y ejecuta `supabase.sql`.
3. En Supabase, copia la URL del proyecto y la clave `anon public`.
4. Pega ambas en `config.js`.
5. Sube todos los archivos a GitHub Pages.

Sin claves, ranking y chat funcionan en modo local y se sincronizan entre pestañas del mismo dispositivo.

## Seguridad antes de publicar a gran escala
La demo permite inserciones públicas para facilitar las pruebas. Para una versión final conviene añadir autenticación, moderación, filtros anti-spam, rate limiting y validación mediante funciones del servidor.
