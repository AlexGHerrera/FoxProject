import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpendList, FilterModal, SearchBar } from '@/components/spend';
import { FoxyAvatar } from '@/components/foxy';
import { BottomNav } from '@/components/ui';
import { useSpendStore } from '@/stores';
import { useSpendFilters } from '@/hooks/useSpendFilters';
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
  const [showFilters, setShowFilters] = useState(false);

  // Filters and search
  const {
    filters,
    searchQuery,
    filteredSpends,
    applyFilters,
    updateSearchQuery,
    resetFilters,
  } = useSpendFilters(spends);

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
        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={updateSearchQuery}
            placeholder="Buscar por establecimiento o nota..."
          />
        </div>

        {/* Stats Summary */}
        <div className="mb-6 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total de gastos</p>
              <p className="text-2xl font-bold text-text">
                {filteredSpends.length}
                {filteredSpends.length !== spends.length && (
                  <span className="text-sm text-muted ml-1">/ {spends.length}</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Total filtrado</p>
              <p className="text-2xl font-bold text-brand-cyan">
                {(filteredSpends.reduce((sum, s) => sum + s.amountCents, 0) / 100).toFixed(2)} €
              </p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card text-text rounded-lg border border-border hover:bg-brand-cyan/10 transition-colors"
          >
            <span>🔧</span>
            <span>Filtros</span>
            {(filters.categories.length > 0 ||
              filters.paymentMethod !== 'all' ||
              filters.dateRange !== 'this-month') && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-brand-cyan text-white rounded-full">
                {filters.categories.length +
                  (filters.paymentMethod !== 'all' ? 1 : 0) +
                  (filters.dateRange !== 'this-month' ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Active filters display */}
          {filters.categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {filters.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 text-xs font-medium bg-brand-cyan/10 text-brand-cyan rounded-full whitespace-nowrap"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Spend List */}
        <SpendList
          spends={filteredSpends}
          loading={isLoading || isDeleting}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={
            searchQuery || filters.categories.length > 0
              ? 'No se encontraron gastos con estos filtros'
              : 'No hay gastos este mes'
          }
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

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        currentFilters={filters}
        onApply={applyFilters}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

