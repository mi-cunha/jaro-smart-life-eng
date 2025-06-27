
import { useState, useEffect } from 'react';

export type WeightUnit = 'lb' | 'kg';

export function useWeightUnit() {
  const [unit, setUnit] = useState<WeightUnit>('lb'); // Default to pounds

  useEffect(() => {
    const savedUnit = localStorage.getItem('weightUnit') as WeightUnit;
    if (savedUnit) {
      setUnit(savedUnit);
    }
  }, []);

  const toggleUnit = () => {
    const newUnit = unit === 'lb' ? 'kg' : 'lb';
    setUnit(newUnit);
    localStorage.setItem('weightUnit', newUnit);
  };

  const convertWeight = (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
    if (fromUnit === toUnit) return weight;
    
    if (fromUnit === 'kg' && toUnit === 'lb') {
      return weight * 2.20462;
    } else if (fromUnit === 'lb' && toUnit === 'kg') {
      return weight / 2.20462;
    }
    
    return weight;
  };

  const formatWeight = (weight: number, showUnit: boolean = true): string => {
    const formatted = weight.toFixed(1);
    return showUnit ? `${formatted} ${unit}` : formatted;
  };

  const convertToDisplayWeight = (weightInKg: number): number => {
    return unit === 'lb' ? convertWeight(weightInKg, 'kg', 'lb') : weightInKg;
  };

  const convertToStorageWeight = (displayWeight: number): number => {
    return unit === 'lb' ? convertWeight(displayWeight, 'lb', 'kg') : displayWeight;
  };

  const convertFromDisplayWeight = (displayWeight: number): number => {
    return unit === 'lb' ? convertWeight(displayWeight, 'lb', 'kg') : displayWeight;
  };

  return {
    unit,
    toggleUnit,
    convertWeight,
    formatWeight,
    convertToDisplayWeight,
    convertToStorageWeight,
    convertFromDisplayWeight
  };
}
