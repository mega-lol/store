import { useMemo, useState } from 'react';
import HatScene, { CAMERA_PRESETS } from '@/components/HatScene';
import { useToast } from '@/hooks/use-toast';
import { buildHat, Colorway, Decal, Finish, Style } from '@/types/hat';

/**
 * /editor — the decal alignment bench. Select a decal, nudge it numerically
 * or flip on Place and click the surface to stamp it (position + normal from
 * the hit). Copy JSON emits the decal array to paste into types/hat.ts —
 * the editor tunes values, the file stays the one source of truth.
 */
export default function Editor() {
  const [colorway, setColorway] = useState<Colorway>('black');
  const [style, setStyle] = useState<Style>('heritage');
  const [finish] = useState<Finish>('gold');
  const [decals, setDecals] = useState<Decal[]>(() => buildHat('black', 'gold', 'heritage').decals);
  const [selected, setSelected] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [preset, setPreset] = useState(-1);
  const [presetTrigger, setPresetTrigger] = useState(0);
  const { toast } = useToast();

  const config = useMemo(() => buildHat(colorway, finish, style), [colorway, finish, style]);
  const sel = decals.find((d) => d.id === selected);

  const reset = (cw: Colorway, st: Style) => {
    setColorway(cw);
    setStyle(st);
    setDecals(buildHat(cw, finish, st).decals);
    setSelected(null);
  };

  const update = (id: string, updates: Partial<Decal>) => {
    setDecals((ds) => ds.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const nudge = (axis: 0 | 1 | 2, delta: number, field: 'position' | 'scale') => {
    if (!sel) return;
    const next = [...sel[field]] as [number, number, number];
    next[axis] += delta;
    update(sel.id, { [field]: next });
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(decals, null, 2));
    toast({ title: 'Copied', description: 'Decal array on the clipboard — paste into types/hat.ts.' });
  };

  return (
    <main className="min-h-[100dvh] bg-black text-white pt-12">
      <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-3rem)]">
        <div className="flex-1 relative h-[55vh] lg:h-auto">
          <HatScene
            hatColor={config.hatColor}
            bandColor={config.bandColor}
            text=""
            brimText={config.brimText}
            textColor={config.textColor}
            textStyle={config.textStyle}
            font={config.font}
            decals={decals}
            onDecalUpdate={update}
            selectedDecalId={selected ?? undefined}
            onDecalSelect={setSelected}
            placementMode={placing && !!selected}
            cameraPreset={preset}
            cameraPresetTrigger={presetTrigger}
            className="w-full h-full"
          />
          <div className="absolute right-4 top-4 z-10 flex flex-wrap gap-1 max-w-[260px] justify-end">
            {CAMERA_PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => { setPreset(i); setPresetTrigger((t) => t + 1); }}
                className="rounded border border-white/20 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-wide text-white/80 hover:border-white/50"
              >
                {p.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <aside className="lg:w-[380px] border-l border-white/5 p-6 space-y-5 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">Editor</p>
            <h1 className="text-xl font-bold tracking-tight">Decal Bench</h1>
          </div>

          <div className="flex gap-2">
            {(['black', 'white'] as const).map((cw) => (
              <button key={cw} onClick={() => reset(cw, style)}
                className={`flex-1 h-9 rounded border text-xs uppercase tracking-wide ${colorway === cw ? 'border-white bg-white text-black' : 'border-white/15 text-white/60'}`}>
                {cw}
              </button>
            ))}
            {(['classic', 'heritage'] as const).map((st) => (
              <button key={st} onClick={() => reset(colorway, st)}
                className={`flex-1 h-9 rounded border text-xs uppercase tracking-wide ${style === st ? 'border-white bg-white text-black' : 'border-white/15 text-white/60'}`}>
                {st}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            {decals.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id === selected ? null : d.id)}
                className={`w-full text-left rounded border px-3 py-2 text-xs ${selected === d.id ? 'border-white bg-white/10' : 'border-white/10 text-white/60 hover:border-white/25'}`}
              >
                {d.id} <span className="text-white/35">· {d.zone}</span>
              </button>
            ))}
          </div>

          {sel && (
            <div className="space-y-3 rounded border border-white/10 p-3">
              <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/70">
                <input type="checkbox" checked={placing} onChange={(e) => setPlacing(e.target.checked)} />
                Place on click
              </label>
              {(['position', 'scale'] as const).map((field) => (
                <div key={field}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">{field}</p>
                  <div className="grid grid-cols-3 gap-1">
                    {([0, 1, 2] as const).map((axis) => (
                      <div key={axis} className="flex items-center gap-1">
                        <button onClick={() => nudge(axis, field === 'scale' ? -2 : -2, field)} className="h-7 w-7 rounded border border-white/15 text-white/70 hover:border-white/40">−</button>
                        <span className="flex-1 text-center text-xs tabular-nums">{sel[field][axis].toFixed(0)}</span>
                        <button onClick={() => nudge(axis, field === 'scale' ? 2 : 2, field)} className="h-7 w-7 rounded border border-white/15 text-white/70 hover:border-white/40">+</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={copyJson} className="w-full h-10 rounded bg-white text-black text-xs font-bold uppercase tracking-[0.15em]">
            Copy JSON
          </button>
          <p className="text-xs text-white/35 leading-relaxed">
            Click a decal on the hat or in the list. Nudge, or enable Place and
            click the surface. Copy JSON, paste into <code>types/hat.ts</code>.
          </p>
        </aside>
      </div>
    </main>
  );
}
