import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpendList } from '@/components/spend';
import { FoxyAvatar } from '@/components/foxy';
import { BottomNav } from '@/components/ui';
import { useSpendStore } from '@/stores';
import { deleteSpend } from '@/application/deleteSpend';
import { SupabaseSpendRepository } from '@/adapters/db/SupabaseSpendRepository';
import { supabase } from '@/config/supabase';
import { useUIStore } from '@/stores';
import { Spend } from '@/domain/models';

const repository = new SupabaseSpendRepository(supabase);
const DEMO_USER_ID = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a'; // TODO: Replace with real auth

export function SpendListPage() {
  const navigate = useNavigate();
  const { spends, isLoading } = useSpendStore();
  const { showSuccess, showError } = useUIStore();
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current month/year for header
  const currentDate = new Date();
  const monthYear = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const handleEdit = (spend: Spend) => {
    // TODO: Navigate to edit page or open modal
    console.log('Edit spend:', spend);
    showError('Edición aún no implementada');
  };

  const handleDelete = async (spend: Spend) => {
    try {
      setIsDeleting(true);
      await deleteSpend(spend.id, DEMO_USER_ID, repository);
      
      // Remove from store
      useSpendStore.getState().deleteSpend(spend.id);
      
      showSuccess('Gasto eliminado');
    } catch (error) {
      console.error('Error deleting spend:', error);
      showError('Error al eliminar el gasto');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text">Mis gastos</h1>
              <p className="text-sm text-muted capitalize">
                Mostrando gastos de {monthYear}
              </p>
            </div>
            
            {/* Foxy Avatar */}
            <div className="flex-shrink-0 ml-4">
              <FoxyAvatar state="idle" size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Summary (optional) */}
        <div className="mb-6 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total de gastos</p>
              <p className="text-2xl font-bold text-text">
                {spends.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Este mes</p>
              <p className="text-2xl font-bold text-brand-cyan">
                {(spends.reduce((sum, s) => sum + s.amountCents, 0) / 100).toFixed(2)} €
              </p>
            </div>
          </div>
        </div>

        {/* Filters Bar (placeholder for now) */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          <button className="px-4 py-2 text-sm font-medium bg-brand-cyan text-white rounded-lg whitespace-nowrap">
            Todos
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-surface text-text rounded-lg whitespace-nowrap hover:bg-brand-cyan/10">
            Alimentación
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-surface text-text rounded-lg whitespace-nowrap hover:bg-brand-cyan/10">
            Transporte
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-surface text-text rounded-lg whitespace-nowrap hover:bg-brand-cyan/10">
            Ocio
          </button>
        </div>

        {/* Spend List */}
        <SpendList
          spends={spends}
          loading={isLoading || isDeleting}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No hay gastos este mes"
        />
      </main>

      {/* Settings Button (bottom right) */}
      <button
        onClick={() => navigate('/settings')}
        className="fixed bottom-24 right-6 w-12 h-12 bg-brand-cyan text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        aria-label="Configuración"
      >
        ⚙️
      </button>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

