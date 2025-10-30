#!/usr/bin/env python3
"""
Test automatizado para la API de DeepSeek
Verifica que el parsing de gastos funciona correctamente
"""

import os
import sys
import json
import time
from pathlib import Path
from dotenv import load_dotenv
import httpx
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import print as rprint

# Cargar variables de entorno
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(env_path)

console = Console()

# Configuración
API_KEY = os.getenv('VITE_DEEPSEEK_API_KEY')
API_URL = 'https://api.deepseek.com/v1/chat/completions'
TIMEOUT = 10.0

SYSTEM_PROMPT = """Eres un parser financiero para español (España). Devuelves SIEMPRE JSON válido sin texto extra."""

INSTRUCTION_PROMPT = """Extrae {amount_eur}, {category}, {merchant}, {note}, {paid_with}, {confidence} de la frase del usuario.
- Admite formatos: '10,55', '10.55', '10 con 55', '€10', '10 euros'.
- Si hay varias cantidades, elige la más probable como IMPORTE.
- Categoriza en una de: ['Café','Comida fuera','Supermercado','Transporte','Ocio','Hogar','Salud','Compras','Otros'].
- {merchant} es el establecimiento (Zara, Starbucks, etc.).
- {paid_with} detecta forma de pago: 'tarjeta', 'efectivo', 'transferencia' o null si no se menciona.
- {note} es el comentario o descripción de los artículos (ej: 'una camiseta', '2 pantalones', 'camiseta y 2 pantalones').
- {confidence} en 0..1 (≥0.8 auto‑confirm).
- IMPORTANTE: El usuario puede decir los campos en cualquier orden.
Responde SOLO con JSON."""

# Casos de prueba
TEST_CASES = [
    {
        'input': '3 euros café',
        'expected': {
            'amount_eur': 3.0,
            'category': 'Café',
            'confidence_min': 0.8
        }
    },
    {
        'input': '10€ con tarjeta en zara una camiseta',
        'expected': {
            'amount_eur': 10.0,
            'category': 'Compras',
            'merchant': 'Zara',
            'paid_with': 'tarjeta',
            'note_contains': 'camiseta',
            'confidence_min': 0.8
        }
    },
    {
        'input': '6€ vermut y frutos secos en la bohem con tarjeta',
        'expected': {
            'amount_eur': 6.0,
            'category': 'Comida fuera',
            'merchant': 'La Bohem',
            'paid_with': 'tarjeta',
            'confidence_min': 0.7
        }
    },
    {
        'input': '15,50 euros supermercado en efectivo',
        'expected': {
            'amount_eur': 15.5,
            'category': 'Supermercado',
            'paid_with': 'efectivo',
            'confidence_min': 0.8
        }
    },
    {
        'input': '25 euros taxi al aeropuerto',
        'expected': {
            'amount_eur': 25.0,
            'category': 'Transporte',
            'note_contains': 'aeropuerto',
            'confidence_min': 0.7
        }
    },
    {
        'input': '3€ con tarjeta en zara una camiseta y 2 pantalones',
        'expected': {
            'amount_eur': 3.0,
            'category': 'Compras',
            'merchant': 'Zara',
            'paid_with': 'tarjeta',
            'note_contains': 'pantalones',
            'confidence_min': 0.7
        }
    }
]


def extract_json_from_response(content: str) -> dict:
    """Extrae JSON de la respuesta, limpiando markdown si es necesario"""
    cleaned = content.strip()
    
    # Buscar JSON entre ```json y ```
    import re
    markdown_match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```', cleaned)
    if markdown_match:
        cleaned = markdown_match.group(1)
    
    # Buscar primer { y último }
    first_brace = cleaned.find('{')
    last_brace = cleaned.rfind('}')
    
    if first_brace != -1 and last_brace != -1:
        cleaned = cleaned[first_brace:last_brace + 1]
    
    return json.loads(cleaned)


async def test_deepseek_parse(text: str) -> dict:
    """Prueba el parsing de un texto con DeepSeek"""
    start_time = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                API_URL,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {API_KEY}'
                },
                json={
                    'model': 'deepseek-chat',
                    'messages': [
                        {'role': 'system', 'content': SYSTEM_PROMPT},
                        {
                            'role': 'user',
                            'content': f'{INSTRUCTION_PROMPT}\n\nFrase: "{text}"\n\nIMPORTANTE: Responde ÚNICAMENTE con el objeto JSON, sin texto adicional, sin markdown, sin explicaciones.'
                        }
                    ],
                    'temperature': 0.2,
                    'max_tokens': 300
                }
            )
        
        latency = (time.time() - start_time) * 1000  # ms
        
        if response.status_code != 200:
            return {
                'success': False,
                'error': f'API Error: {response.status_code}',
                'latency': latency
            }
        
        data = response.json()
        content = data.get('choices', [{}])[0].get('message', {}).get('content')
        
        if not content:
            return {
                'success': False,
                'error': 'No content in response',
                'latency': latency
            }
        
        # Parse JSON
        parsed = extract_json_from_response(content)
        
        # Validar campos requeridos
        required = ['amount_eur', 'category', 'confidence']
        missing = [f for f in required if f not in parsed]
        
        if missing:
            return {
                'success': False,
                'error': f'Missing fields: {", ".join(missing)}',
                'latency': latency,
                'raw_response': content
            }
        
        # Validar tipos
        if not isinstance(parsed['amount_eur'], (int, float)):
            return {
                'success': False,
                'error': f'amount_eur should be number, got {type(parsed["amount_eur"])}',
                'latency': latency,
                'parsed': parsed
            }
        
        return {
            'success': True,
            'parsed': parsed,
            'latency': latency,
            'raw_response': content
        }
        
    except httpx.TimeoutException:
        latency = (time.time() - start_time) * 1000
        return {
            'success': False,
            'error': f'Timeout after {TIMEOUT}s',
            'latency': latency
        }
    except json.JSONDecodeError as e:
        latency = (time.time() - start_time) * 1000
        return {
            'success': False,
            'error': f'JSON parse error: {str(e)}',
            'latency': latency
        }
    except Exception as e:
        latency = (time.time() - start_time) * 1000
        return {
            'success': False,
            'error': str(e),
            'latency': latency
        }


def validate_expectations(parsed: dict, expected: dict) -> tuple[bool, list[str]]:
    """Valida que el resultado cumpla las expectativas"""
    errors = []
    
    # Validar amount_eur
    if 'amount_eur' in expected:
        if parsed.get('amount_eur') != expected['amount_eur']:
            errors.append(f"amount_eur: esperado {expected['amount_eur']}, obtenido {parsed.get('amount_eur')}")
    
    # Validar category
    if 'category' in expected:
        if parsed.get('category') != expected['category']:
            errors.append(f"category: esperado {expected['category']}, obtenido {parsed.get('category')}")
    
    # Validar merchant (case insensitive)
    if 'merchant' in expected:
        merchant = parsed.get('merchant', '').lower()
        expected_merchant = expected['merchant'].lower()
        if expected_merchant not in merchant:
            errors.append(f"merchant: esperado contener '{expected['merchant']}', obtenido '{parsed.get('merchant')}'")
    
    # Validar paid_with
    if 'paid_with' in expected:
        if parsed.get('paid_with') != expected['paid_with']:
            errors.append(f"paid_with: esperado {expected['paid_with']}, obtenido {parsed.get('paid_with')}")
    
    # Validar note contiene texto
    if 'note_contains' in expected:
        note = parsed.get('note', '').lower()
        expected_text = expected['note_contains'].lower()
        if expected_text not in note:
            errors.append(f"note: esperado contener '{expected['note_contains']}', obtenido '{parsed.get('note')}'")
    
    # Validar confidence mínimo
    if 'confidence_min' in expected:
        conf = parsed.get('confidence', 0)
        if conf < expected['confidence_min']:
            errors.append(f"confidence: esperado >= {expected['confidence_min']}, obtenido {conf}")
    
    return len(errors) == 0, errors


async def run_tests():
    """Ejecuta todos los tests"""
    console.print(Panel.fit(
        "[bold cyan]🧪 Test de API DeepSeek - Foxy[/bold cyan]\n"
        f"[dim]API: {API_URL}[/dim]\n"
        f"[dim]API Key: {API_KEY[:10] if API_KEY else 'NOT SET'}...[/dim]",
        border_style="cyan"
    ))
    
    if not API_KEY:
        console.print("[bold red]❌ VITE_DEEPSEEK_API_KEY no encontrada en .env.local[/bold red]")
        sys.exit(1)
    
    results = []
    
    # Ejecutar tests
    for i, test_case in enumerate(TEST_CASES, 1):
        console.print(f"\n[bold]Test {i}/{len(TEST_CASES)}:[/bold] [cyan]{test_case['input']}[/cyan]")
        
        result = await test_deepseek_parse(test_case['input'])
        
        if result['success']:
            # Validar expectativas
            valid, errors = validate_expectations(result['parsed'], test_case['expected'])
            
            if valid:
                console.print(f"  [green]✅ PASSED[/green] ({result['latency']:.0f}ms)")
                console.print(f"  [dim]→ {result['parsed']['amount_eur']}€ | {result['parsed']['category']} | conf: {result['parsed']['confidence']:.2f}[/dim]")
            else:
                console.print(f"  [yellow]⚠️  PARTIAL[/yellow] ({result['latency']:.0f}ms)")
                for error in errors:
                    console.print(f"    [yellow]• {error}[/yellow]")
            
            results.append({
                'test': test_case['input'],
                'status': 'passed' if valid else 'partial',
                'latency': result['latency'],
                'parsed': result['parsed'],
                'validation_errors': errors
            })
        else:
            console.print(f"  [red]❌ FAILED[/red] ({result['latency']:.0f}ms)")
            console.print(f"  [red]→ {result['error']}[/red]")
            results.append({
                'test': test_case['input'],
                'status': 'failed',
                'latency': result['latency'],
                'error': result['error']
            })
        
        # Pequeña pausa entre requests
        if i < len(TEST_CASES):
            await asyncio.sleep(0.5)
    
    # Resumen
    console.print("\n" + "=" * 70)
    
    passed = len([r for r in results if r['status'] == 'passed'])
    partial = len([r for r in results if r['status'] == 'partial'])
    failed = len([r for r in results if r['status'] == 'failed'])
    total = len(results)
    
    avg_latency = sum(r['latency'] for r in results) / len(results)
    
    # Tabla resumen
    table = Table(title="📊 Resumen de Tests", border_style="cyan")
    table.add_column("Métrica", style="cyan")
    table.add_column("Valor", style="bold")
    
    table.add_row("Total tests", str(total))
    table.add_row("✅ Passed", f"[green]{passed}[/green]")
    table.add_row("⚠️  Partial", f"[yellow]{partial}[/yellow]")
    table.add_row("❌ Failed", f"[red]{failed}[/red]")
    table.add_row("⏱️  Latencia promedio", f"{avg_latency:.0f}ms")
    
    console.print(table)
    
    # Mostrar tests fallidos
    if failed > 0:
        console.print("\n[bold red]❌ Tests fallidos:[/bold red]")
        for r in results:
            if r['status'] == 'failed':
                console.print(f"  • [red]{r['test']}[/red]: {r['error']}")
    
    # Mostrar tests parciales
    if partial > 0:
        console.print("\n[bold yellow]⚠️  Tests con validación parcial:[/bold yellow]")
        for r in results:
            if r['status'] == 'partial':
                console.print(f"  • [yellow]{r['test']}[/yellow]")
                for error in r['validation_errors']:
                    console.print(f"    [dim]- {error}[/dim]")
    
    # Exit code
    exit_code = 0 if failed == 0 else 1
    
    console.print(f"\n[bold]{'🎉 Todos los tests pasaron!' if failed == 0 else '⚠️  Algunos tests fallaron'}[/bold]\n")
    
    return exit_code


if __name__ == '__main__':
    import asyncio
    exit_code = asyncio.run(run_tests())
    sys.exit(exit_code)




