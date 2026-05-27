import { Upload } from "lucide-react";
import type { LogoPlacement } from "../types/order";

type LogoEditorProps = {
  logo: LogoPlacement;
  setLogo: React.Dispatch<React.SetStateAction<LogoPlacement>>;
};

const techniques: LogoPlacement["technique"][] = ["Bordado", "Estampa", "DTF", "Serigrafía"];
const areas: LogoPlacement["area"][] = ["Delantera", "Espalda", "Manga"];

export function LogoEditor({ logo, setLogo }: LogoEditorProps) {
  function updateLogo<K extends keyof LogoPlacement>(key: K, value: LogoPlacement[K]) {
    setLogo((current) => ({ ...current, [key]: value }));
  }

  function handleFile(file?: File) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setLogo((current) => ({
        ...current,
        fileName: file.name,
        imageUrl: String(reader.result),
      }));
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-xl">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.7rem] border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 text-center transition hover:border-black hover:bg-white">
          <Upload className="mb-3" />
          <strong>Subir logo o diseño</strong>
          <span className="mt-1 text-sm text-neutral-500">
            PNG, JPG o imagen del cliente
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>

        {logo.fileName && (
          <p className="mt-3 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700">
            Archivo: {logo.fileName}
          </p>
        )}

        <div className="mt-6 grid gap-4">
          <RangeControl
            label="Horizontal"
            value={logo.x}
            min={15}
            max={85}
            onChange={(value) => updateLogo("x", value)}
          />

          <RangeControl
            label="Vertical"
            value={logo.y}
            min={15}
            max={75}
            onChange={(value) => updateLogo("y", value)}
          />

          <RangeControl
            label="Escala"
            value={logo.scale}
            min={0.5}
            max={2}
            step={0.1}
            onChange={(value) => updateLogo("scale", value)}
          />

          <RangeControl
            label="Rotación"
            value={logo.rotation}
            min={-30}
            max={30}
            onChange={(value) => updateLogo("rotation", value)}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
          Personalización
        </p>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => updateLogo("area", area)}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                logo.area === area ? "bg-black text-white" : "bg-neutral-100 text-black"
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {techniques.map((technique) => (
            <button
              key={technique}
              onClick={() => updateLogo("technique", technique)}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                logo.technique === technique ? "bg-black text-white" : "bg-neutral-100 text-black"
              }`}
            >
              {technique}
            </button>
          ))}
        </div>

        <div className="rounded-[1.7rem] bg-neutral-100 p-5">
          <p className="mb-3 text-sm font-black">Vista de referencia</p>
          <div className="relative mx-auto h-[390px] max-w-[300px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-neutral-50 to-neutral-300 p-8">
            <div className="absolute left-1/2 top-1/2 h-64 w-48 -translate-x-1/2 -translate-y-1/2 rounded-b-[2rem] rounded-t-[4rem] bg-black shadow-2xl">
              <div className="absolute -left-12 top-14 h-28 w-16 rotate-12 rounded-[2rem] bg-neutral-900" />
              <div className="absolute -right-12 top-14 h-28 w-16 -rotate-12 rounded-[2rem] bg-neutral-900" />
              <div className="absolute left-1/2 top-3 h-10 w-20 -translate-x-1/2 rounded-b-full border-b border-neutral-600 bg-neutral-950" />

              <div
                className="absolute grid min-h-10 min-w-16 place-items-center border-2 border-dashed border-white/80 bg-white/5 p-1 text-[10px] font-black uppercase tracking-widest text-white"
                style={{
                  left: `${logo.x}%`,
                  top: `${logo.y}%`,
                  transform: `translate(-50%, -50%) scale(${logo.scale}) rotate(${logo.rotation}deg)`,
                }}
              >
                {logo.imageUrl ? (
                  <img src={logo.imageUrl} className="max-h-16 max-w-24 object-contain" />
                ) : (
                  "Logo"
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type RangeControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

function RangeControl({ label, value, min, max, step = 1, onChange }: RangeControlProps) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      <span className="flex justify-between">
        {label}
        <strong>{value}</strong>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-black"
      />
    </label>
  );
}
