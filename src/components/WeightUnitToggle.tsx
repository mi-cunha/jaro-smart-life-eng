
import { Button } from "@/components/ui/button";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { Scale } from "lucide-react";

export function WeightUnitToggle() {
  const { unit, toggleUnit } = useWeightUnit();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleUnit}
      className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
    >
      <Scale className="w-4 h-4 mr-2" />
      {unit.toUpperCase()}
    </Button>
  );
}
