import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SpendList, FilterModal, SearchBar } from '@/components/spend';
import { FoxyAvatar } from '@/components/foxy';
import { BottomNav, PageIndicator } from '@/components/ui';
import { useSpendStore } from '@/stores';
import { useSpendFilters, useSwipeNavigation } from '@/hooks';
import { deleteSpend } from '@/application/deleteSpend';
import { SupabaseSpendRepository } from '@/adapters/db/SupabaseSpendRepository';
import { supabase } from '@/config/supabase';
import { useUIStore } from '@/stores';
import { Spend } from '@/domain/models';

const repository = new SupabaseSpendRepository(supabase);
const DEMO_USER_ID = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a'; // TODO: Replace with real auth

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export function SpendListPage() {
  const navigate = useNavigate();
  const { spends, isLoading } = useSpendStore();
  const { showSuccess, showError } = useUIStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { onDragEnd, currentIndex, totalRoutes, direction } = useSwipeNavigation();

  // Variantes dinámicas basadas en la dirección del swipe
  const pageVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? 300 : dir < 0 ? -300 : 0,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : dir < 0 ? 300 : 0,
      opacity: 0,
    }),
  };

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
    <motion.div
      className="min-h-screen bg-background pb-20"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={onDragEnd}
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text">Mis gastos</h1>
              <p className="text-sm text-muted capitalize">
                Mostrando gastos de {monthYear}
              </p>
            </div>
            
            {/* Foxy Avatar - Click to open filters */}
            <div className="flex-shrink-0 ml-4 flex flex-col items-center gap-1">
              <button
                onClick={() => setShowFilters(true)}
                className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan rounded-full transition-transform hover:scale-105 active:scale-95"
                aria-label="Abrir filtros"
              >
                {/* Badge de filtros activos */}
                {(filters.categories.length > 0 ||
                  filters.paymentMethod !== 'all' ||
                  filters.dateRange !== 'this-month') && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold z-10">
                    {filters.categories.length +
                      (filters.paymentMethod !== 'all' ? 1 : 0) +
                      (filters.dateRange !== 'this-month' ? 1 : 0)}
                  </span>
                )}
                <FoxyAvatar state="idle" size="sm" />
              </button>
              <span className="text-[10px] text-muted font-medium">Filtros</span>
            </div>
          </div>
        </div>

        {/* Page Indicator */}
        <PageIndicator
          currentIndex={currentIndex}
          totalPages={totalRoutes}
          className="py-2"
        />
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

        {/* Active filters display */}
        {filters.categories.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto">
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

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        currentFilters={filters}
        onApply={applyFilters}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  );
}

