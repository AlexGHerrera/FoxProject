/**
 * Tests: Budget Calculator
 * Tests unitarios de reglas de negocio
 */

import { describe, it, expect } from 'vitest'
import {
  calculateBudgetStatus,
  canAffordSpend,
  calculateDailyAverage,
  projectMonthlyTotal,
} from '@/domain/rules/budgetCalculator'

describe('budgetCalculator', () => {
  describe('calculateBudgetStatus', () => {
    it('should return ok status when under 70%', () => {
      const result = calculateBudgetStatus(6000, 10000) // 60%
      expect(result.status).toBe('ok')
      expect(result.percentageUsed).toBe(0.6)
      expect(result.remainingCents).toBe(4000)
    })

    it('should return warning status between 70-89%', () => {
      const result = calculateBudgetStatus(7500, 10000) // 75%
      expect(result.status).toBe('warning')
      expect(result.percentageUsed).toBe(0.75)
    })

    it('should return alert status at 90% or more', () => {
      const result = calculateBudgetStatus(9500, 10000) // 95%
      expect(result.status).toBe('alert')
      expect(result.percentageUsed).toBe(0.95)
    })

    it('should handle zero limit', () => {
      const result = calculateBudgetStatus(5000, 0)
      expect(result.percentageUsed).toBe(0)
      expect(result.status).toBe('ok')
    })

    it('should handle exceeding limit', () => {
      const result = calculateBudgetStatus(12000, 10000)
      expect(result.remainingCents).toBe(0)
      expect(result.status).toBe('alert')
    })
  })

  describe('canAffordSpend', () => {
    it('should allow spend within limit', () => {
      const canAfford = canAffordSpend(5000, 10000, 3000)
      expect(canAfford).toBe(true)
    })

    it('should disallow spend exceeding limit', () => {
      const canAfford = canAffordSpend(9000, 10000, 2000)
      expect(canAfford).toBe(false)
    })

    it('should allow any spend when limit is 0', () => {
      const canAfford = canAffordSpend(5000, 0, 99999)
      expect(canAfford).toBe(true)
    })
  })

  describe('calculateDailyAverage', () => {
    it('should calculate correct daily average', () => {
      const avg = calculateDailyAverage(30000, 30) // 1000 cents per day
      expect(avg).toBe(1000)
    })

    it('should return 0 for 0 days', () => {
      const avg = calculateDailyAverage(5000, 0)
      expect(avg).toBe(0)
    })
  })

  describe('projectMonthlyTotal', () => {
    it('should project total correctly', () => {
      const projected = projectMonthlyTotal(10000, 10, 30) // spent 10000 in 10 days
      expect(projected).toBe(30000) // projects to 30000 for full month
    })

    it('should return current total when no days passed', () => {
      const projected = projectMonthlyTotal(5000, 0, 30)
      expect(projected).toBe(5000)
    })
  })
})

