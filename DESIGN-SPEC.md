# 🎨 Design Specification - Foxy MVP

> Especificación visual basada en mockups oficiales

---

## 📁 Mockups de Referencia

Los mockups están en `public/mockups/`. Ver `MANIFEST.txt` para mapeo de nombres.

### Pantallas Principales

1. **Dashboard** (`05_dashboard_light_dark_compare.png`, `06_dashboard_white_mobile_desktop.png`)
2. **Voice Input** (`08_voice_input_v2_wide.png`)
3. **Confirm Modal** (`09_confirm_v1.png`)
4. **Expenses List** (`12_expenses_v2_wide.png`)
5. **Filters** (`13_filters_mobile_desktop.png`)
6. **Foxy States** (`03_foxy_v3_humanoid_states.png`)

---

## 🦊 Foxy Avatar - Estados y Características

### Estados Visuales

| Estado | Descripción | Uso |
|--------|-------------|-----|
| **Idle** | Zorro sonriente con sudadera azul marino, brazos cruzados | Dashboard en reposo |
| **Listening** | Con auriculares cyan y sudadera naranja | Durante grabación de voz |
| **Happy** | Sonrisa grande, brazos cruzados, ojos cerrados | Después de guardar gasto exitosamente |
| **Alert** | Capucha puesta, mirada seria, tablet en mano | Cuando se acerca al límite presupuestario |

### Características de Diseño

- **Color principal**: Naranja (#FF9500 aproximado)
- **Color secundario**: Azul marino/cyan (#00B8D9)
- **Estilo**: Cartoon humanizado, amigable
- **Proporciones**: Cabeza grande, cuerpo pequeño
- **Detalles**: Orejas grandes, cola esponjosa, ojos expresivos

### Implementación CSS

Para el MVP (placeholder CSS animado):
- Usar SVG o PNG con estados
- Transiciones suaves entre estados (300-600ms)
- Animaciones sutiles (respiración, parpadeo)

---

## 🎨 Color Palette (Actualizada según mockups)

### Light Mode

```css
--bg: #FAFAFA
--surface: #FFFFFF
--text: #1A1A1A
--muted: #6B7280
--brand-cyan: #00B8D9
--brand-orange: #FF9500
--success: #10B981
--warning: #F59E0B
--danger: #EF4444
--divider: #E5E7EB
```

### Dark Mode

```css
--bg: #1A1A1A
--surface: #2A2A2A
--text: #FAFAFA
--muted: #94A3B8
--brand-cyan: #00D3FF
--brand-orange: #FFB84C
--success: #34D399
--warning: #F59E0B
--danger: #F87171
--divider: #3A3A3A
```

### Colores de Categorías

| Categoría | Color | Código |
|-----------|-------|--------|
| Supermercado | Azul | #3B82F6 |
| Ocio/Entretenimiento | Púrpura | #8B5CF6 |
| Transporte | Naranja | #F97316 |
| Restaurante/Comida | Cyan | #06B6D4 |
| Café | Marrón claro | #D97706 |

---

## 📐 Layout y Espaciado

### Dashboard

```
┌─────────────────────────────────────┐
│  [Logo/Título]    54% of limit      │
│                                     │
│  ████████░░░░░░░░  $1,620 spent    │
│  ⭐⭐⭐⭐                            │
│                                     │
│         [Foxy Avatar]               │
│                                     │
│  [🛒] [🍽️] [🎮]  <- Quick Categories│
│                                     │
│  Recent expenses                    │
│  ├─ Dinner        $45.00           │
│  ├─ Movies        $30.00           │
│  ├─ Sneakers      $80.00           │
│  └─ Coffee        $4.50            │
│                                     │
│      [🎤 Mic Button]                │
└─────────────────────────────────────┘
```

### Voice Input Screen

```
┌─────────────────────────────────────┐
│                                     │
│    Estoy escuchando...              │
│    Camiseta 10 euros El Corte...    │
│                                     │
│                                     │
│         [Foxy Avatar]               │
│         con auriculares             │
│                                     │
│                                     │
│      🎤  <- Ondas animadas          │
│    ◉◉◉◉◉◉◉                          │
│                                     │
│   [Detener grabación]               │
│                                     │
└─────────────────────────────────────┘
```

### Confirm Modal

```
┌─────────────────────────────────────┐
│  ████████░░░ 48%/1,000€        🎤   │
│                                     │
│  He anotado un café de              │
│        3,50 €                       │
│     ¿Confirmo?                      │
│                                     │
│         [Foxy Avatar]               │
│       brazos cruzados               │
│                                     │
│  [Confirmar]    [Cancelar]          │
└─────────────────────────────────────┘
```

---

## 🔘 Componentes UI

### Buttons

#### Primary (Confirmar, Aplicar filtros)
- Background: `#00B8D9` (brand-cyan)
- Text: `#FFFFFF`
- Border radius: `12px`
- Padding: `12px 24px`
- Shadow: `0 4px 12px rgba(0, 184, 217, 0.3)`
- Hover: brillo +10%

#### Secondary (Cancelar, Borrar)
- Background: `#F3F4F6`
- Text: `#6B7280`
- Border radius: `12px`
- Padding: `12px 24px`
- Hover: background darken

#### Mic Button (circular)
- Diameter: `72px`
- Background: linear gradient `#00E5FF → #00B8D9`
- Shadow: `0 10px 30px rgba(0, 200, 255, 0.35)`
- Icono: micrófono blanco
- Animation: ondas concéntricas cuando activo

### Progress Bar

- Height: `12px`
- Border radius: `8px`
- Background (empty): `#E5E7EB`
- Fill: 
  - <70%: `#10B981` (verde)
  - 70-89%: `#F59E0B` (amarillo)
  - ≥90%: `#EF4444` (rojo)
- Animación: smooth transition 300ms

### Cards (Expense items)

- Background: `#FFFFFF` (light) / `#2A2A2A` (dark)
- Border: none
- Border radius: `16px`
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.08)`
- Padding: `16px`
- Layout: `[Icono] [Nombre + Categoría] [Precio]`

### Category Icons

- Size: `48px × 48px`
- Background: colored circle
- Icon: white, centered
- Border radius: `50%`

### Stars (Gamificación)

- Size: `32px`
- Color: `#FFB800` (filled)
- Color: `#D1D5DB` (empty)
- Spacing: `4px` entre estrellas

---

## 🎭 Animaciones

### Mic Button (Recording)

```css
@keyframes pulse-rings {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 30px rgba(0, 229, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 229, 255, 0);
  }
}
```

### Foxy Avatar Transitions

```css
.foxy-avatar {
  transition: all 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Estados */
.foxy-idle { /* normal */ }
.foxy-listening { transform: scale(1.05); }
.foxy-happy { transform: scale(1.1) rotate(5deg); }
.foxy-alert { filter: brightness(0.9); }
```

### Progress Bar Fill

```css
.progress-fill {
  transition: width 300ms ease-out, background-color 200ms ease;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile first */
--mobile: 320px - 767px
--tablet: 768px - 1023px
--desktop: 1024px+

/* Ajustes */
Mobile: 
  - 1 columna
  - Foxy tamaño mediano
  - Cards full width
  
Desktop:
  - 2-3 columnas en Dashboard
  - Foxy más grande
  - Sidebar opcional
```

---

## 🎯 Accesibilidad

### Contraste (WCAG AA)

- Text sobre fondo claro: ratio ≥ 4.5:1 ✓
- Botón cyan sobre blanco: ratio ≥ 3:1 ✓
- Estados de error claramente visibles

### Focus States

```css
*:focus-visible {
  outline: 3px solid #00B8D9;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Touch Targets

- Mínimo: `44px × 44px` ✓
- Mic button: `72px × 72px` ✓✓
- Botones de acción: `48px height` ✓

---

## 🖼️ Assets Necesarios

### Imágenes

- [ ] Foxy avatar - idle.svg/png
- [ ] Foxy avatar - listening.svg/png
- [ ] Foxy avatar - happy.svg/png
- [ ] Foxy avatar - alert.svg/png
- [ ] Logo Foxy (header)
- [ ] Iconos de categorías (SVG)

### Iconos

Usar librería: **Lucide Icons** o **Heroicons**

- Mic
- Settings (engranaje)
- Calendar
- Filter
- Shopping cart
- Utensils
- Car/Taxi
- Gamepad
- Coffee
- Home
- Heart
- Plus
- X (close)

---

## 🚀 Implementación Prioritaria

### Fase 1: Componentes Base ✅ (siguiente)

1. **Button** con variantes (primary, secondary, ghost)
2. **Card** para expense items
3. **ProgressBar** con colores dinámicos
4. **FoxyAvatar** placeholder (CSS simple)

### Fase 2: Layouts

1. **Dashboard** layout
2. **VoiceInput** screen
3. **ConfirmModal** overlay

### Fase 3: Interacciones

1. Animaciones de mic button
2. Transiciones de Foxy
3. Loading states

---

## 📝 Notas de Implementación

1. **Usar variables CSS** para colores y espaciados (ya en `index.css`)
2. **Tailwind utilities** para la mayoría del layout
3. **CSS modules** para componentes complejos si necesario
4. **SVG inline** para iconos (mejor performance que PNG)
5. **Lazy load** de estados de Foxy no usados inmediatamente

---

**Última actualización**: Octubre 2025  
**Basado en**: Mockups oficiales v3

