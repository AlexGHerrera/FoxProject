import type { ISpendRepository } from '@/adapters/db/ISpendRepository';

/**
 * Caso de uso: Eliminar un gasto
 * 
 * @param id - ID del gasto a eliminar
 * @param userId - ID del usuario propietario
 * @param repository - Repositorio de gastos
 */
export async function deleteSpend(
  id: string,
  userId: string,
  repository: ISpendRepository
): Promise<void> {
  try {
    await repository.delete(id, userId);

    console.log('deleteSpend: success', { id });
  } catch (error) {
    console.error('deleteSpend: error', error);
    throw error;
  }
}

