
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RestrictionsModalProps {
  restrictions: string[];
  onUpdate: (restrictions: string[]) => void;
}

export function RestrictionsModal({ restrictions, onUpdate }: RestrictionsModalProps) {
  const [newRestriction, setNewRestriction] = useState("");
  const [localRestrictions, setLocalRestrictions] = useState(restrictions);

  const addRestriction = () => {
    if (!newRestriction.trim()) {
      toast.error("Enter a valid restriction!");
      return;
    }
    
    if (localRestrictions.includes(newRestriction.trim())) {
      toast.error("This restriction has already been added!");
      return;
    }

    const updated = [...localRestrictions, newRestriction.trim()];
    setLocalRestrictions(updated);
    setNewRestriction("");
    toast.success("Restriction added!");
  };

  const removeRestriction = (restriction: string) => {
    const updated = localRestrictions.filter(r => r !== restriction);
    setLocalRestrictions(updated);
    toast.success("Restriction removed!");
  };

  const handleSave = () => {
    onUpdate(localRestrictions);
    toast.success("Dietary restrictions updated!");
  };

  const commonRestrictions = [
    "Lactose", "Gluten", "Peanuts", "Seafood", "Eggs", 
    "Soy", "Nuts", "Fish", "Shellfish", "Sesame"
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Dietary Restrictions
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-bg border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Manage Dietary Restrictions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-white/80 font-medium mb-3">Your Current Restrictions:</h4>
            {localRestrictions.length === 0 ? (
              <p className="text-white/60 text-sm italic">No restrictions registered</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {localRestrictions.map((restriction, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="border-orange-400/30 text-orange-400 flex items-center gap-1"
                  >
                    {restriction}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-500/20"
                      onClick={() => removeRestriction(restriction)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-white/80 font-medium mb-3">Add New Restriction:</h4>
            <div className="flex gap-2">
              <Input
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                placeholder="Enter a dietary restriction..."
                className="bg-white/5 border-white/20 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addRestriction()}
              />
              <Button 
                onClick={addRestriction}
                className="bg-neon-green text-black hover:bg-neon-green/90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-white/80 font-medium mb-3">Common Restrictions:</h4>
            <div className="flex flex-wrap gap-2">
              {commonRestrictions.map((restriction, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!localRestrictions.includes(restriction)) {
                      setLocalRestrictions([...localRestrictions, restriction]);
                      toast.success(`${restriction} added to restrictions!`);
                    }
                  }}
                  className="border-white/20 text-white/70 hover:border-orange-400/30 hover:text-orange-400"
                  disabled={localRestrictions.includes(restriction)}
                >
                  {restriction}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <DialogTrigger asChild>
              <Button 
                onClick={handleSave}
                className="bg-neon-green text-black hover:bg-neon-green/90 flex-1"
              >
                Save Restrictions
              </Button>
            </DialogTrigger>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
