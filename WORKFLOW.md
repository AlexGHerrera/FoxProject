# 🔄 Workflow de Desarrollo - Foxy

## Estrategia de Ramas

Para evitar problemas y facilitar las iteraciones, seguimos este flujo:

### Ramas principales

- **`main`**: Código estable y funcional
- **`feat/nombre-feature`**: Desarrollo de nuevas features
- **`fix/nombre-bug`**: Corrección de bugs

### Flujo de trabajo

1. **Crear rama desde main**:
   ```bash
   git checkout main
   git pull
   git checkout -b feat/nueva-feature
   ```

2. **Desarrollar con commits pequeños**:
   ```bash
   git add -A
   git commit -m "feat(scope): descripción del cambio"
   ```

3. **Probar localmente**:
   ```bash
   npm run dev
   # Verificar en navegador
   npm run lint
   npm run type-check
   npm run test
   ```

4. **Merge a main SOLO si todo funciona**:
   ```bash
   git checkout main
   git merge feat/nueva-feature
   git push
   ```

5. **Si algo falla**: permanecer en la rama, NO mergear a main

---

## Problema Resuelto: Caché NPM Corrupto

### Síntoma
- Navegador en blanco
- Error: `SyntaxError: Importing binding name 'Spend' is not found`
- Código que antes funcionaba deja de funcionar

### Causa
Caché de npm corrupto con archivos de root

### Solución
```bash
# 1. Arreglar permisos del caché
sudo chown -R 501:20 "/Users/alexg.herrera/.npm"

# 2. Limpiar e reinstalar
cd foxy-app
rm -rf node_modules package-lock.json
npm install

# 3. Limpiar caché de Vite
rm -rf node_modules/.vite dist

# 4. Reiniciar servidor
npm run dev
```

---

## Checklist antes de Merge a Main

- [ ] El código compila sin errores (`npm run type-check`)
- [ ] El linter pasa (`npm run lint`)
- [ ] La app funciona en el navegador (sin errores en consola)
- [ ] Los tests pasan (`npm run test`)
- [ ] La arquitectura hexagonal se respeta
- [ ] Los commits son claros y descriptivos
- [ ] Se probó en navegador limpio (Cmd+Shift+R)

---

## Estado Actual

### ✅ En `main` (Estable)
- Fase 1-6: Setup, arquitectura, flujo de voz básico
- Fase 7: Dashboard completo con navegación

### 🚧 En `feat/fase-8-gestion-gastos` (En desarrollo)
- SpendCard y SpendList components
- FilterModal con todos los filtros
- SearchBar con debounce
- useSpendFilters hook
- BottomNav navigation
- SpendListPage completa
- Casos de uso: updateSpend, deleteSpend

### 📋 Pendiente
- Fase 9: Onboarding
- Fase 10: Settings y exportación
- PWA: Service Worker, manifest
- Auth: Supabase authentication

---

## Tips para Desarrollo

1. **Siempre trabajar en ramas**: nunca commitear directamente a main
2. **Commits pequeños**: un cambio lógico por commit
3. **Probar antes de mergear**: verificar que todo funciona
4. **Limpiar caché si hay errores raros**: `rm -rf node_modules/.vite`
5. **Usar Conventional Commits**: `feat(scope): descripción`
6. **Documentar decisiones**: actualizar este archivo cuando sea necesario

---

**Última actualización**: 27 Octubre 2025  
**Mantenedor**: Alex G. Herrera

