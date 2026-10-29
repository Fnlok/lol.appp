# Builds Locas LoL (app de escritorio)

App para Windows, macOS y Linux con builds raras de League of Legends, los 173 campeones del parche 26.21, equipos exóticos, imágenes oficiales y generador con IA.

## Probarla en tu equipo
Necesitas Node.js 20 o superior.

    npm install
    npm start

## Crear los instaladores
En cada sistema operativo se construye su propio instalador:

    npm run dist:win      # Windows (.exe)
    npm run dist:mac      # macOS (.dmg, Intel y Apple Silicon)
    npm run dist:linux    # Linux (.AppImage y .deb)

Los archivos quedan en la carpeta `dist/`.

## Crear los tres instaladores sin tener los tres sistemas
1. Sube esta carpeta a un repositorio de GitHub.
2. En la pestaña Actions ejecuta "Construir instaladores" (o sube una etiqueta como `v1.0.0`).
3. Al terminar, descarga los instaladores desde los artefactos del trabajo.

## La IA
La app no incluye ninguna clave. Cada persona pega su propia clave de la API de Anthropic en la app. Se guarda cifrada con el sistema operativo cuando está disponible; en Linux sin llavero se guarda en un archivo con permisos restringidos. Las consultas se cobran a la cuenta de esa persona. El modelo se cambia en `main.js` (constante `MODEL`).
Sin clave siguen funcionando las builds curadas, las imágenes y el modo caos sin IA.

## Avisos al instalar
Los instaladores no están firmados. Windows puede mostrar SmartScreen ("Más información" y "Ejecutar de todos modos"). En macOS, abre la app con clic derecho y "Abrir" la primera vez. Para evitarlo hay que pagar certificados de firma.

## Actualizar al siguiente parche
En `renderer/index.html` cambia la constante `PATCH` y el texto del pie de página, y revisa la lista `KNOWN`. Con internet, la app lee el parche y los objetos reales desde Data Dragon, el servicio oficial de Riot.

## Icono
Usa el icono por defecto de Electron. Para uno propio crea una carpeta `build/` con `icon.png` (512x512 o más) y vuelve a construir.
