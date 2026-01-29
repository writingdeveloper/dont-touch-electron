# No Toques

**App de detección IA para superar hábitos como la tricotilomanía**

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md) | [Русский](README.ru.md)

---

## Descripción

Una aplicación de escritorio que usa tu cámara web para detectar en tiempo real cuando tu mano se acerca a tu cara. Ayuda a interrumpir comportamientos repetitivos como la **tricotilomanía** (arrancarse el pelo) y la **dermatilomanía** (rascarse la piel) mediante alertas visuales y sonoras.

Todo el procesamiento ocurre localmente en tu dispositivo. No se recopilan ni transmiten datos.

## Características

- Detección facial y de manos en tiempo real con MediaPipe
- Zonas de detección personalizables (cuero cabelludo, cejas, ojos, mejillas, etc.)
- Alertas a pantalla completa + sonido de advertencia
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

- Todo el procesamiento de video se ejecuta localmente
- Las imágenes o datos no salen de tu dispositivo
- Cumple con GDPR, CCPA, PIPEDA

## Licencia

[MIT](../LICENSE)
