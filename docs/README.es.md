# No Toques

**App de detección IA para superar hábitos como la tricotilomanía**

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md) | [Русский](README.ru.md)

---

## Descripción

Una aplicación de escritorio que usa tu cámara web para detectar en tiempo real cuando tu mano se acerca a tu cara. Ayuda a interrumpir comportamientos repetitivos como la **tricotilomanía** (arrancarse el pelo) y la **dermatilomanía** (rascarse la piel) mediante alertas visuales y sonoras.

Todo el procesamiento de video ocurre localmente en tu dispositivo: las imágenes de tu cámara nunca salen de él. Solo se recopilan estadísticas de uso anónimas (sin datos personales ni imágenes) para mejorar la app.

## Características

- Detección facial y de manos en tiempo real con MediaPipe
- Zonas de detección personalizables (cuero cabelludo, cejas, ojos, mejillas, etc.)
- Alertas a pantalla completa con sonidos personalizables (tonos integrados, clips de voz multilingües o tu propio audio)
- Estadísticas diarias y seguimiento de rachas
- Meditación de respiración integrada
- Soporte para bandeja del sistema
- Interfaz multiidioma

## Instalación

### Descarga

Obtén la última versión desde [Releases](https://github.com/writingdeveloper/dont-touch-electron/releases).

### Compilar desde código fuente

```bash
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron
npm install
npm run dev      # Modo desarrollo
npm run build    # Build de producción
```

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | Electron + Vite |
| UI | React + TypeScript |
| Estilos | TailwindCSS |
| Detección | MediaPipe Tasks Vision |
| Build | electron-builder |

## Privacidad

- Todo el procesamiento de video e imágenes se ejecuta localmente: los fotogramas de la cámara nunca salen de tu dispositivo
- Solo se recopilan estadísticas de uso anónimas (p. ej., apertura de la app, inicio/parada de detección) para mejorar la app: sin datos personales, imágenes ni video
- Los datos analíticos se tratan conforme a GDPR, CCPA y PIPEDA

## Licencia

[MIT](../LICENSE)
