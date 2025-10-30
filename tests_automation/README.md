# 🧪 Tests Automatizados - Foxy

Scripts de testing automatizados para verificar funcionalidad crítica de Foxy.

---

## 🚀 Setup Rápido

### 1. Activar entorno conda

```bash
# Desde la raíz del proyecto foxy-app/
conda activate foxy-testing
```

### 2. Verificar instalación

```bash
python --version  # Debe mostrar 3.11.x
node --version    # Debe mostrar 20.x
pip list | grep playwright
```

---

## 📋 Tests Disponibles

### test_deepseek_api.py

Verifica que la API de DeepSeek funciona correctamente y parsea gastos como esperado.

**Ejecutar:**

```bash
conda activate foxy-testing
cd tests_automation
python test_deepseek_api.py
```

**Qué verifica:**

- ✅ Conexión a API DeepSeek
- ✅ Parsing de frases simples ("3 euros café")
- ✅ Parsing de frases complejas ("6€ vermut y frutos secos en la bohem con tarjeta")
- ✅ Detección de: importe, categoría, establecimiento, forma de pago, notas
- ✅ Confidence scores (>= 0.8 para auto-confirm)
- ✅ Latencia aceptable (<3s)

**Output esperado:**

```
🧪 Test de API DeepSeek - Foxy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1/6: 3 euros café
  ✅ PASSED (847ms)
  → 3.0€ | Café | conf: 0.95

Test 2/6: 10€ con tarjeta en zara una camiseta
  ✅ PASSED (1124ms)
  → 10.0€ | Compras | conf: 0.90

...

📊 Resumen de Tests
┌───────────────────────┬───────┐
│ Métrica               │ Valor │
├───────────────────────┼───────┤
│ Total tests           │ 6     │
│ ✅ Passed             │ 6     │
│ ⚠️  Partial           │ 0     │
│ ❌ Failed             │ 0     │
│ ⏱️  Latencia promedio │ 956ms │
└───────────────────────┴───────┘

🎉 Todos los tests pasaron!
```

---

## 🔧 Troubleshooting

### Error: "VITE_DEEPSEEK_API_KEY no encontrada"

**Solución:** Verifica que `.env.local` en la raíz del proyecto contiene:

```bash
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
```

### Error: "Timeout after 10s"

**Posibles causas:**

1. API DeepSeek caída (revisar status.deepseek.com)
2. Problema de red/firewall
3. API key inválida

**Debug:**

```bash
# Verificar conectividad
curl -I https://api.deepseek.com

# Verificar API key
echo $VITE_DEEPSEEK_API_KEY
```

### Tests fallan con errores de parsing

**Posible causa:** Cambio en el comportamiento de DeepSeek.

**Solución:** Ajustar el prompt en:

- `tests_automation/test_deepseek_api.py` (para tests)
- `src/adapters/ai/DeepSeekProvider.ts` (para app)
- `PROMPTS.json` (fuente de verdad)

---

## 🛠️ Desarrollo de Nuevos Tests

### Añadir caso de prueba

Edita `test_deepseek_api.py`:

```python
TEST_CASES.append({
    'input': '50€ cena en el restaurante',
    'expected': {
        'amount_eur': 50.0,
        'category': 'Comida fuera',
        'confidence_min': 0.7
    }
})
```

### Crear nuevo test script

```python
#!/usr/bin/env python3
"""
test_mi_nueva_feature.py
"""

import asyncio
from rich.console import Console

console = Console()

async def test_mi_feature():
    console.print("[cyan]🧪 Testing mi feature...[/cyan]")
    # Tu lógica aquí
    return True

if __name__ == '__main__':
    success = asyncio.run(test_mi_feature())
    exit(0 if success else 1)
```

---

## 📊 CI/CD Integration (Futuro)

Estos tests están diseñados para integrarse con GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: conda-incubator/setup-miniconda@v2
        with:
          environment-file: environment.yml
          activate-environment: foxy-testing
      - run: python tests_automation/test_deepseek_api.py
        env:
          VITE_DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
```

---

## 📝 Notas

- **Python 3.11+**: Requerido para `asyncio` y type hints modernos
- **Rich**: Para output colorido y tablas bonitas
- **httpx**: Cliente HTTP async (más moderno que `requests`)
- **pytest**: Opcional, por si queremos estructura de tests más compleja

---

## 🔗 Referencias

- [Entorno conda](../environment.yml)
- [DeepSeek API Docs](https://platform.deepseek.com/api-docs/)
- [Prompts](../config/PROMPTS.json)
- [Arquitectura Hexagonal](../docs/development/AGENTS.md)

---

**Última actualización:** Oct 29, 2025  
**Autor:** Alex G. Herrera




