import { Spend, UpdateSpendData } from '@/domain/models/Spend';
import { ISpendRepository } from '@/adapters/db/ISpendRepository';

/**
 * Caso de uso: Actualizar un gasto existente
 * 
 * @param id - ID del gasto a actualizar
 * @param userId - ID del usuario propietario
 * @param data - Datos parciales a actualizar
 * @param repository - Repositorio de gastos
 * @returns Gasto actualizado
 */
export async function updateSpend(
  id: string,
  userId: string,
  data: UpdateSpendData,
  repository: ISpendRepository
): Promise<Spend> {
  try {
    // Validar que hay datos para actualizar
    if (Object.keys(data).length === 0) {
      throw new Error('No data to update');
    }

    // Actualizar en el repositorio
    const updated = await repository.update(id, userId, data);

    console.log('updateSpend: success', { id, updated });
    return updated;
  } catch (error) {
    console.error('updateSpend: error', error);
    throw error;
  }
}

