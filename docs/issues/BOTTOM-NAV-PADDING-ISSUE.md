# 🐛 Problema Pendiente: Padding en Botones de Selección Múltiple

**Fecha**: Octubre 30, 2025  
**Estado**: ⚠️ **NO RESUELTO**  
**Componente**: `src/components/ui/BottomNavSelection.tsx`

## 📋 Descripción del Problema

Los botones de la barra inferior en modo de selección múltiple **se cortan por los laterales** en pantallas pequeñas, especialmente en dispositivos móviles con ancho < 320px.

## 🔍 Cambios Realizados

1. ✅ Agregado `backdrop-blur-md` y `bg-background/80` (igual que header)
2. ✅ Implementado padding responsive: `px-3` (12px) mínimo móvil, `sm:px-4` (16px), `md:px-6` (24px)
3. ✅ Agregado `min-w-0` y `truncate` en botones para prevenir overflow
4. ✅ Mantenido layout siempre vertical (`flex-col`)

## ⚠️ Problema Persiste

A pesar de los cambios, **los botones aún se cortan** en pantallas muy pequeñas. Posibles causas:

1. **El contenedor `max-w-4xl mx-auto`** puede estar restringiendo el espacio disponible
2. **El padding `px-3` puede no ser suficiente** para pantallas < 320px
3. **Los botones tienen `rounded-xl`** que puede estar causando overflow visual
4. **Falta considerar `safe-area-inset`** en dispositivos con notch/home indicator

## 🔧 Soluciones a Probar

### Opción 1: Eliminar max-w-4xl en pantallas pequeñas
```tsx
<div className="w-full px-3 py-3 sm:px-4 sm:max-w-4xl sm:mx-auto sm:py-4 md:px-6">
```

### Opción 2: Usar padding más conservador
```tsx
<div className="w-full px-4 py-3 sm:px-4 sm:py-4 md:px-6">
```

### Opción 3: Usar `calc()` para padding dinámico
```tsx
<div className="w-full" style={{ paddingLeft: 'max(12px, env(safe-area-inset-left))', paddingRight: 'max(12px, env(safe-area-inset-right))' }}>
```

### Opción 4: Revisar si hay overflow en el contenedor padre
Verificar que `SpendListPage` no tenga `overflow-hidden` u otras restricciones.

## 📝 Próximos Pasos

1. Probar en dispositivo real o simulador con ancho < 320px
2. Inspeccionar el elemento en DevTools para identificar el overflow exacto
3. Considerar usar `box-sizing: border-box` explícitamente
4. Verificar que no haya otros elementos con `overflow-hidden` que afecten

---

**Para continuar**: Este problema requiere testing en dispositivo real o simulador móvil para identificar la causa exacta del corte.


