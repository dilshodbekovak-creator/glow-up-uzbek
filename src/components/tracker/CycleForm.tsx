import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CycleFormProps {
  onSubmit: (data: { startDate: Date; periodLength: number; cycleLength: number }) => void;
  isLoading: boolean;
}

const CycleForm = ({ onSubmit, isLoading }: CycleFormProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!startDate) return;
    onSubmit({ startDate, periodLength, cycleLength });
    setStartDate(undefined);
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card space-y-4">
      <h3 className="text-sm font-bold text-foreground">Yangi davr qo'shish</h3>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Hayz boshlanish sanasi</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-11 rounded-xl",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd.MM.yyyy") : "Sanani tanlang"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(d) => { setStartDate(d); setOpen(false); }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Hayz davomiyligi (kun)</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={periodLength}
            onChange={(e) => setPeriodLength(Math.min(10, Math.max(1, Number(e.target.value))))}
            className="h-11 rounded-xl text-center"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Sikl uzunligi (kun)</Label>
          <Input
            type="number"
            min={21}
            max={40}
            value={cycleLength}
            onChange={(e) => setCycleLength(Math.min(40, Math.max(21, Number(e.target.value))))}
            className="h-11 rounded-xl text-center"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!startDate || isLoading}
        className="w-full h-11 rounded-xl gradient-warm text-primary-foreground font-semibold"
      >
        <Plus size={16} className="mr-1" />
        Saqlash
      </Button>
    </div>
  );
};

export default CycleForm;
