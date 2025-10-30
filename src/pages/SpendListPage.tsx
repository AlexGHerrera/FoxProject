import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SpendList, FilterModal, SearchBar, SpendEditModal, BulkEditModal, BulkEditChanges } from '@/components/spend';
import { FoxyAvatar } from '@/components/foxy';
import { PageIndicator, BottomNavSelection, ConfirmDialog } from '@/components/ui';
import { useSpendStore } from '@/stores';
import { useSpendFilters } from '@/hooks';
import { deleteSpend } from '@/application/deleteSpend';
import { updateSpend } from '@/application/updateSpend';
import { SupabaseSpendRepository } from '@/adapters/db/SupabaseSpendRepository';
import { supabase } from '@/config/supabase';
import { useUIStore } from '@/stores';
import { Spend, UpdateSpendData } from '@/domain/models';
import { DEMO_USER_ID } from '@/config/constants';

const repository = new SupabaseSpendRepository(supabase);
const ROUTES = ['/', '/spends', '/settings'] as const;

export function SpendListPage() {
  const location = useLocation();
  const { spends, isLoading, updateSpend: updateSpendInStore, deleteSpend: deleteSpendFromStore } = useSpendStore();
  const { showSuccess, showError, setSelectionModeActive } = useUIStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingSpend, setEditingSpend] = useState<Spend | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bottomNavHeight, setBottomNavHeight] = useState(200); // Altura inicial estimada
  const currentIndex = ROUTES.indexOf(location.pathname as typeof ROUTES[number]);

  // Sync selection mode with UI store
  useEffect(() => {
    setSelectionModeActive(selectionMode);
  }, [selectionMode, setSelectionModeActive]);

  // Measure BottomNavSelection height when it's visible
  // Note: Since BottomNavSelection uses Portal, we can't measure it directly
  // Using estimated height based on breakpoints: ~200px mobile, ~240px desktop
  useEffect(() => {
    if (!selectionMode) return;
    
    const updateHeight = () => {
      // Estimar altura basada en viewport width
      const width = window.innerWidth;
      // Móvil: 3 botones h-12 (48px) + 2 gaps (8px) + padding + counter ≈ 200px
      // Desktop: 3 botones h-14 (56px) + 2 gaps (12px) + padding + counter ≈ 240px
      const estimatedHeight = width < 640 ? 200 : 240;
      setBottomNavHeight(estimatedHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [selectionMode]);

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
    setEditingSpend(spend);
  };

  const handleEditSave = async (updatedData: UpdateSpendData) => {
    if (!editingSpend) return;

    try {
      await updateSpend(editingSpend.id, DEMO_USER_ID, updatedData, repository);
      
      // Update in store
      updateSpendInStore(editingSpend.id, updatedData);
      
      showSuccess('Gasto actualizado');
      setEditingSpend(null);
    } catch (error) {
      console.error('Error updating spend:', error);
      showError('Error al actualizar el gasto');
      throw error; // Re-throw to let modal handle it
    }
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

  const handleSelect = (spend: Spend) => {
    // Enter selection mode and select this spend
    setSelectionMode(true);
    setSelectedIds(new Set([spend.id]));
  };

  const handleToggleSelect = (spend: Spend) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(spend.id)) {
        next.delete(spend.id);
      } else {
        next.add(spend.id);
      }
      return next;
    });
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    // Force close any open swipe cards by triggering a re-render
    // This is handled by SpendCard's useEffect that closes on external interactions
  };

  const handleBulkEdit = () => {
    setShowBulkEdit(true);
  };

  const handleBulkEditSave = async (changes: BulkEditChanges) => {
    const selectedSpends = Array.from(selectedIds);
    
    try {
      // Update each spend in DB
      await Promise.all(
        selectedSpends.map((id) =>
          updateSpend(id, DEMO_USER_ID, changes, repository)
        )
      );

      // Update in store
      selectedSpends.forEach((id) => {
        updateSpendInStore(id, changes);
      });

      showSuccess(`${selectedSpends.length} ${selectedSpends.length === 1 ? 'gasto actualizado' : 'gastos actualizados'}`);
      handleCancelSelection();
    } catch (error) {
      console.error('Error updating spends:', error);
      showError('Error al actualizar los gastos');
      throw error;
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const handleBulkDeleteConfirm = async () => {
    const selectedSpends = Array.from(selectedIds);

    try {
      setIsDeleting(true);

      // Delete each spend from DB
      await Promise.all(
        selectedSpends.map((id) =>
          deleteSpend(id, DEMO_USER_ID, repository)
        )
      );

      // Remove from store
      selectedSpends.forEach((id) => {
        deleteSpendFromStore(id);
      });

      showSuccess(`${selectedSpends.length} ${selectedSpends.length === 1 ? 'gasto eliminado' : 'gastos eliminados'}`);
      handleCancelSelection();
    } catch (error) {
      console.error('Error deleting spends:', error);
      showError('Error al eliminar los gastos');
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  return (
    <div className="h-full bg-background overflow-y-auto">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
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
          totalPages={ROUTES.length}
          className="py-2"
        />
      </header>

      {/* Main Content */}
      <main 
        className={`max-w-4xl mx-auto px-4 py-6 ${selectionMode ? 'pb-28' : 'pb-28'}`}
        style={selectionMode ? { paddingBottom: `${bottomNavHeight + 16}px` } : undefined}
      >
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
          onSelect={handleSelect}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          emptyMessage={
            searchQuery || filters.categories.length > 0
              ? 'No se encontraron gastos con estos filtros'
              : 'No hay gastos este mes'
          }
        />
      </main>

      {/* Selection Mode Bottom Nav - Renderizado via Portal en BottomNavSelection */}
      {selectionMode && (
        <BottomNavSelection
          count={selectedIds.size}
          onEdit={handleBulkEdit}
          onDelete={handleBulkDelete}
          onCancel={handleCancelSelection}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        currentFilters={filters}
        onApply={applyFilters}
      />

      {/* Edit Modal */}
      {editingSpend && (
        <SpendEditModal
          isOpen={!!editingSpend}
          onClose={() => setEditingSpend(null)}
          spend={editingSpend}
          onSave={handleEditSave}
        />
      )}

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        count={selectedIds.size}
        onSave={handleBulkEditSave}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDeleteConfirm}
        title={`¿Eliminar ${selectedIds.size} ${selectedIds.size === 1 ? 'gasto' : 'gastos'}?`}
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </div>
  );
}

