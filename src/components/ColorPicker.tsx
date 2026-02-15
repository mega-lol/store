import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets: string[];
}

export default function ColorPicker({ label, value, onChange, presets }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {presets.map(color => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
              value === color ? 'border-primary scale-110 ring-2 ring-primary/50' : 'border-border'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
        <div className="relative w-8 h-8">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center text-xs text-muted-foreground"
            style={{ background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` }}
          />
        </div>
      </div>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="#000000"
        className="w-28 h-8 text-xs font-mono"
      />
    </div>
  );
}
