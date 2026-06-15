import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Dispatch,
  PointerEvent as ReactPointerEvent,
  RefObject,
  SetStateAction,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { toJpeg } from "html-to-image";
import {
  ArrowLeft,
  ArrowRight,
  Buildings,
  CheckCircle,
  CloudArrowUp,
  CoatHanger,
  Eye,
  Hoodie,
  Package,
  Pants,
  PenNib,
  Plus,
  TShirt,
  Trash,
} from "@phosphor-icons/react";

import filtexLogo from "./assets/filtex-logo.png";
import remeraFront from "./assets/remera-front.png";
import remeraBack from "./assets/remera-back.png";
import modelFront from "./assets/model-front.png";

type Product = {
  id: string;
  name: string;
  line: string;
  sku: string;
  material: string;
  sizes: string[];
  colors: string[];
  icon: "shirt" | "hoodie" | "office" | "pants" | "jacket";
  views?: {
    front: string;
    back: string;
  };
  viewsByColor?: Record<
    string,
    {
      front: string;
      back: string;
    }
  >;
};

type ClientData = {
  company: string;
  contact: string;
  whatsapp: string;
  email: string;
  notes: string;
};

type Combo = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
};

type GarmentSide = "Delantera" | "Espalda";

type LogoArea =
  | "Pecho izquierdo"
  | "Pecho centro"
  | "Espalda centro"
  | "Manga derecha"
  | "Manga izquierda";

type Technique = "Bordado" | "Estampa" | "DTF" | "Serigrafía";

type LogoSizeCm = number;

type Decoration = {
  id: string;
  name: string;
  fileName: string;
  imageUrl: string;
  technique: Technique;
  side: GarmentSide;
  area: LogoArea;
  x: number;
  y: number;
  sizeCm: LogoSizeCm;
  rotation: number;
};

const products: Product[] = [
  {
    id: "remera-unisex",
    name: "Remera unisex",
    line: "Línea básica",
    sku: "Fu00006",
    material: "Jersey de algodón peinado 24/1. 100% algodón.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    colors: ["Negro", "Gris topo", "Gris melange", "Blanco", "Azul marino"],
    icon: "shirt",
    views: {
      front: remeraFront,
      back: remeraBack,
    },
    viewsByColor: {
      Negro: {
        front: "/products/remera-unisex/negro-front.png",
        back: "/products/remera-unisex/negro-back.png",
      },
      "Gris topo": {
        front: "/products/remera-unisex/gris-topo-front.png",
        back: "/products/remera-unisex/gris-topo-back.png",
      },
      "Gris melange": {
        front: "/products/remera-unisex/gris-melange-front.png",
        back: "/products/remera-unisex/gris-melange-back.png",
      },
      Blanco: {
        front: "/products/remera-unisex/blanco-front.png",
        back: "/products/remera-unisex/blanco-back.png",
      },
      "Azul marino": {
        front: "/products/remera-unisex/azul-marino-front.png",
        back: "/products/remera-unisex/azul-marino-back.png",
      },
    },
  },
  {
    id: "buzo-unisex",
    name: "Buzo unisex",
    line: "Línea básica",
    sku: "Fu00009",
    material: "Friza invisible. Moldería unisex.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    colors: ["Negro", "Gris topo", "Gris melange", "Azul marino"],
    icon: "hoodie",
  },
  {
    id: "chomba-pique",
    name: "Chomba piqué",
    line: "Línea oficina",
    sku: "Fh00004 / Fm00004",
    material: "Piqué 70% algodón - 30% poliéster.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    colors: ["Negro", "Gris melange", "Blanco", "Azul marino"],
    icon: "office",
    views: {
      front: "/products/chomba-pique-azul-marino-front.png",
      back: "/products/chomba-pique-azul-marino-back.png",
    },
  },
  {
    id: "camisa-oficina",
    name: "Camisa oficina",
    line: "Línea oficina",
    sku: "Fh00007 / Fm00001",
    material: "Algodón con spandex. Corte fit / slim fit.",
    sizes: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    colors: ["Blanco", "Celeste"],
    icon: "office",
    views: {
      front: "/products/chomba-pique-azul-marino-front.png",
      back: "/products/chomba-pique-azul-marino-back.png",
    },
  },
  {
    id: "pantalon-cargo",
    name: "Pantalón cargo",
    line: "Línea industria",
    sku: "Fh00014",
    material: "Gabardina con spandex 8 onzas.",
    sizes: ["30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50"],
    colors: ["Negro", "Azul marino"],
    icon: "pants",
  },
  {
    id: "campera-softshell",
    name: "Campera Softshell",
    line: "Línea abrigos",
    sku: "Fh00002",
    material: "Exterior softshell. Interior micro polar térmico.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    colors: ["Negro", "Azul marino"],
    icon: "jacket",
  },
];

const steps = ["Cliente", "Prenda", "Cantidades", "Logo", "Resumen"];

const initialClient: ClientData = {
  company: "",
  contact: "",
  whatsapp: "",
  email: "",
  notes: "",
};

function getAreaPreset(area: LogoArea) {
  if (area === "Pecho izquierdo") {
    return { side: "Delantera" as const, x: 42, y: 34, sizeCm: 10 };
  }

  if (area === "Pecho centro") {
    return { side: "Delantera" as const, x: 50, y: 38, sizeCm: 13 };
  }

  if (area === "Manga derecha") {
    return { side: "Delantera" as const, x: 74, y: 43, sizeCm: 10 };
  }

  if (area === "Manga izquierda") {
    return { side: "Delantera" as const, x: 26, y: 43, sizeCm: 10 };
  }

  return { side: "Espalda" as const, x: 50, y: 38, sizeCm: 20 };
}

function getVisualScale(sizeCm: LogoSizeCm) {
  return sizeCm / 13;
}

function getProductViews(product: Product, color: string) {
  const colorFiles: Record<string, string> = {
    Negro: "negro",
    "Gris topo": "gris-topo",
    "Gris melange": "gris-melange",
    Blanco: "blanco",
    "Azul marino": "azul-marino",
  };

  const fileKey = colorFiles[color] ?? "negro";

  if (product.id === "remera-unisex") {
    return {
      front: `/products/remera-unisex/${fileKey}-front.png`,
      back: `/products/remera-unisex/${fileKey}-back.png`,
    };
  }

  if (product.id === "buzo-unisex") {
    return {
      front: `/products/buzo-unisex/${fileKey}-front.png`,
      back: `/products/buzo-unisex/${fileKey}-back.png`,
    };
  }

  if (product.id === "chomba-pique") {
    return {
      front: `/products/chomba-pique-${fileKey}-front.png`,
      back: `/products/chomba-pique-${fileKey}-back.png`,
    };
  }

  return product.views;
}

function createDecoration(area: LogoArea = "Pecho izquierdo"): Decoration {
  const preset = getAreaPreset(area);

  return {
    id: crypto.randomUUID(),
    name: area,
    fileName: "",
    imageUrl: "",
    technique: "Bordado",
    side: preset.side,
    area,
    x: preset.x,
    y: preset.y,
    sizeCm: preset.sizeCm,
    rotation: 0,
  };
}

function getStepTitle(step: number) {
  if (step === 0) return "Datos del cliente";
  if (step === 1) return "Elegí la prenda";
  if (step === 2) return "Armá el pedido";
  if (step === 3) return "Ubicá los logos";
  return "Orden final";
}

function getStepMessage(step: number) {
  if (step === 0) return "Empezamos simple: cargá los datos básicos del pedido.";
  if (step === 1) return "Muy bien. Ahora elegimos la prenda adecuada.";
  if (step === 2) return "Vamos bien. Definí talles, colores y cantidades.";
  if (step === 3) return "Ya casi terminamos. Ahora ubicamos los logos.";
  return "Último paso: revisá todo y generá la orden visual.";
}

function getCompanionPhrase(step: number) {
  if (step === 0) return "";
  if (step === 1) return "Vamos bien, ya elegiste la base del pedido.";
  if (step === 2) return "Excelente, cada vez falta menos.";
  if (step === 3) return "Ya queda poco, estamos en la personalización final.";
  return "Último esfuerzo y queda lista.";
}

export default function App() {
  const [step, setStep] = useState(0);
  const [client, setClient] = useState<ClientData>(initialClient);
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [selectedColor, setSelectedColor] = useState(products[0].colors[0]);
  const [combos, setCombos] = useState<Combo[]>([]);

  const totalUnits = useMemo(
    () => combos.reduce((sum, combo) => sum + combo.quantity, 0),
    [combos]
  );
  const [decorations, setDecorations] = useState<Decoration[]>([
    createDecoration("Pecho izquierdo"),
  ]);
  const [selectedDecorationId, setSelectedDecorationId] = useState(decorations[0].id);

  const selectedDecoration =
    decorations.find((item) => item.id === selectedDecorationId) ?? decorations[0];

  const contentRef = useRef<HTMLElement | null>(null);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) ?? products[0];
  }, [selectedProductId]);

  useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}, [step]);

  function nextStep() {
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function prevStep() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function updateDecoration(id: string, updates: Partial<Decoration>) {
    setDecorations((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  function addDecoration(area: LogoArea = "Espalda centro") {
    const newDecoration = createDecoration(area);
    setDecorations((current) => [...current, newDecoration]);
    setSelectedDecorationId(newDecoration.id);
    return newDecoration;
  }

  function removeDecoration(id: string) {
    setDecorations((current) => {
      const filtered = current.filter((item) => item.id !== id);

      if (filtered.length === 0) {
        const fresh = createDecoration("Pecho izquierdo");
        setSelectedDecorationId(fresh.id);
        return [fresh];
      }

      if (selectedDecorationId === id) {
        setSelectedDecorationId(filtered[0].id);
      }

      return filtered;
    });
  }

  return (
    <main className="premium-app relative min-h-screen overflow-hidden bg-[#101417] text-black">
      <AnimatedThreadsBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col p-4 md:p-6">
        <TopBar totalUnits={totalUnits} decorationCount={decorations.length} />

        <section className="grid flex-1 gap-5 lg:grid-cols-[310px_1fr]">
          <aside className="rounded-[34px] border border-black/5 bg-white/90 p-5 shadow-xl backdrop-blur-sm">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-neutral-400">
                Filtex Studio
              </p>
              <h1 className="mt-3 text-4xl font-black leading-[0.92] tracking-[-0.07em]">
                Comencemos
              </h1>
              
            </div>

            <StepRail currentStep={step} setStep={setStep} />

            <div className="mt-8 rounded-[28px] border border-black/5 bg-[#f7f7f4] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
                Estado actual
              </p>
              <div className="mt-5 space-y-4">
                <Metric label="Producto" value={selectedProduct.name} />
                <Metric label="Unidades" value={`${totalUnits}`} />
                <Metric label="Aplicaciones" value={`${decorations.length}`} />
                <Metric label="Paso actual" value={steps[step]} />
              </div>
            </div>
          </aside>

          <section
            ref={contentRef}
            className="rounded-[34px] border border-black/5 bg-white/90 p-4 shadow-2xl backdrop-blur-sm md:p-6"
          >
            <div className="mb-6 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-400">
                    Paso {step + 1} de {steps.length}
                  </p>
                  <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] md:text-6xl">
                    {getStepTitle(step)}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                    {getStepMessage(step)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={prevStep}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-5 py-3 font-black transition hover:bg-neutral-200 disabled:opacity-30"
                  >
                    <ArrowLeft size={18} weight="bold" />
                    Atrás
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={step === steps.length - 1}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-black text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    Siguiente
                    <ArrowRight size={18} weight="bold" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#8bb748]/15 bg-[#8bb748]/6 px-4 py-3 text-sm font-bold text-[#6f9935]">
                {getCompanionPhrase(step)}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.22 }}
              >
                {step === 0 && <ClientStep client={client} setClient={setClient} />}

                {step === 1 && (
                  <ProductStep
                    products={products}
                    selectedProductId={selectedProductId}
                    setSelectedProductId={setSelectedProductId}
                  />
                )}

                {step === 2 && (
                  <QuantityStep
                    product={selectedProduct}
                    combos={combos}
                    setCombos={setCombos}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                  />
                )}

                {step === 3 && (
                  <LogoStudio
                    product={selectedProduct}
                    selectedColor={selectedColor}
                    decorations={decorations}
                    selectedDecorationId={selectedDecorationId}
                    setSelectedDecorationId={setSelectedDecorationId}
                    selectedDecoration={selectedDecoration}
                    updateDecoration={updateDecoration}
                    addDecoration={addDecoration}
                    removeDecoration={removeDecoration}
                  />
                )}

                {step === 4 && (
                  <SummaryStep
                    client={client}
                    product={selectedProduct}
                    selectedColor={selectedColor}
                    combos={combos}
                    decorations={decorations}
                    totalUnits={totalUnits}
                  />
                )}

                {step < steps.length - 1 && (
                  <StepCompanion
                    step={step}
                    onNext={nextStep}
                    onPrev={prevStep}
                    disablePrev={step === 0}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </section>
      </div>

      <FloatingStepButton
        step={step}
        totalSteps={steps.length}
        onNext={nextStep}
      />
    </main>
  );
}

function FloatingStepButton({
  step,
  totalSteps,
  onNext,
}: {
  step: number;
  totalSteps: number;
  onNext: () => void;
}) {
  if (step >= totalSteps - 1) return null;

  const nextLabel = steps[step + 1];
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <button
      onClick={onNext}
      className="filtex-floating-action group"
      aria-label={`Ir al paso ${step + 2}: ${nextLabel}`}
    >
      <span
        className="filtex-floating-ring"
        style={{
          background: `conic-gradient(#22f6c5 ${progress}%, rgba(255,255,255,0.16) ${progress}%)`,
        }}
      />

      <span className="filtex-floating-core">
        <ArrowRight size={26} weight="bold" />
      </span>

      <span className="filtex-floating-label">
        <span>Siguiente</span>
        <strong>{nextLabel}</strong>
      </span>
    </button>
  );
}

function AnimatedThreadsBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="thread-bg">
        <span className="thread-line thread-1" />
        <span className="thread-line thread-2" />
        <span className="thread-line thread-3" />
        <span className="thread-line thread-4" />
        <span className="thread-line thread-5" />
        <span className="thread-line thread-6" />
      </div>
    </div>
  );
}

function TopBar(_props: { totalUnits: number; decorationCount: number }) {
  return (
    <header className="filtex-thread-logo-header">
      <svg
        className="filtex-curved-threads"
        viewBox="0 0 1600 140"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="thread thread-a"
          d="M0 68 C120 8, 245 126, 410 62 S760 18, 1040 64 S1380 118, 1600 54"
        />
        <path
          className="thread thread-b"
          d="M0 92 C160 132, 280 22, 455 78 S820 118, 1085 46 S1400 14, 1600 76"
        />
        <path
          className="thread thread-c"
          d="M0 42 C150 82, 288 26, 440 42 S765 86, 1030 38 S1360 10, 1600 34"
        />
        <path
          className="thread thread-d"
          d="M0 112 C180 58, 332 116, 500 90 S840 34, 1125 88 S1425 126, 1600 86"
        />
        <path
          className="thread thread-e"
          d="M0 58 C190 32, 330 104, 520 64 S900 12, 1180 58 S1450 98, 1600 52"
        />

        <g className="thread-needle">
          <line className="needle-body" x1="-10" y1="0" x2="10" y2="0" />
          <circle className="needle-eye" cx="10" cy="0" r="1.7" />
          <line className="needle-tail" x1="10" y1="0" x2="28" y2="0" />
          <animateMotion
            dur="10s"
            repeatCount="indefinite"
            rotate="auto"
            path="M0 68 C120 8, 245 126, 410 62 S760 18, 1040 64 S1380 118, 1600 54"
          />
        </g>
      </svg>

      <div className="filtex-thread-logo-wrap">
        <img
          src={filtexLogo}
          alt="Filtex"
          className="filtex-thread-logo-image"
        />
      </div>
    </header>
  );
}

function StepRail({
  currentStep,
  setStep,
}: {
  currentStep: number;
  setStep: (step: number) => void;
}) {
  const icons = [
    <Buildings size={22} weight="duotone" />,
    <CoatHanger size={22} weight="duotone" />,
    <Package size={22} weight="duotone" />,
    <PenNib size={22} weight="duotone" />,
    <CheckCircle size={22} weight="duotone" />,
  ];

  return (
    <nav className="space-y-2">
      {steps.map((item, index) => {
        const active = currentStep === index;

        return (
          <button
            key={item}
            onClick={() => setStep(index)}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition ${
              active
                ? "bg-black text-white shadow-md"
                : "bg-[#f7f7f4] text-neutral-500 hover:bg-neutral-100 hover:text-black"
            }`}
          >
            <span
              className={`grid size-10 place-items-center rounded-xl ${
                active ? "bg-white text-black" : "bg-white text-black"
              }`}
            >
              {icons[index]}
            </span>
            <span>
              <span className="block text-sm font-black">{item}</span>
              <span className="text-xs opacity-70">Paso {index + 1}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 font-black text-black">{value}</p>
    </div>
  );
}

function StepCompanion({
  step,
  onNext,
  onPrev,
  disablePrev,
}: {
  step: number;
  onNext: () => void;
  onPrev: () => void;
  disablePrev: boolean;
}) {
  return (
    <div className="mt-6 rounded-[28px] border border-[#8bb748]/15 bg-[#8bb748]/7 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7b9f43]">
            Seguimos
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">
            {getCompanionPhrase(step)}
          </h3>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Si querés, podés seguir libremente desde el menú lateral o avanzar con este botón.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPrev}
            disabled={disablePrev}
            className="rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-neutral-100 disabled:opacity-30"
          >
            Atrás
          </button>

          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-black text-white transition hover:scale-[1.02]"
          >
            Siguiente paso
            <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientStep({
  client,
  setClient,
}: {
  client: ClientData;
  setClient: Dispatch<SetStateAction<ClientData>>;
}) {
  function update<K extends keyof ClientData>(key: K, value: ClientData[K]) {
    setClient((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[30px] border border-black/5 bg-[#fafaf8] p-5 md:p-6">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
            Información del cliente
          </p>
          <h3 className="mt-2 text-3xl font-black tracking-[-0.06em]">
            ¿Quién hace el pedido?
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Empresa"
            value={client.company}
            placeholder="Ej: Clínica Olavarría"
            onChange={(value) => update("company", value)}
          />

          <Input
            label="Contacto"
            value={client.contact}
            placeholder="Nombre y apellido"
            onChange={(value) => update("contact", value)}
          />

          <Input
            label="WhatsApp"
            value={client.whatsapp}
            placeholder="2284..."
            onChange={(value) => update("whatsapp", value)}
          />

          <Input
            label="Email"
            value={client.email}
            placeholder="correo@empresa.com"
            onChange={(value) => update("email", value)}
          />

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-black">Observaciones iniciales</span>
            <textarea
              value={client.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Fecha estimada, rubro, uso de la prenda, detalles importantes..."
              className="min-h-40 rounded-[26px] border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[22px] border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
      />
    </label>
  );
}

function ProductStep({
  products,
  selectedProductId,
  setSelectedProductId,
}: {
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => setSelectedProductId(product.id)}
          className={`group rounded-[30px] border p-5 text-left transition ${
            selectedProductId === product.id
              ? "border-black bg-black text-white shadow-2xl"
              : "border-neutral-200 bg-[#fafaf8] hover:-translate-y-1 hover:border-black hover:bg-white hover:shadow-xl"
          }`}
        >
          <div className="mb-5 flex h-36 items-center justify-center rounded-[24px] bg-white text-black">
            <ProductIcon type={product.icon} size={72} />
          </div>

          <p
            className={`mb-2 text-xs font-black uppercase tracking-[0.2em] ${
              selectedProductId === product.id ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            {product.line}
          </p>

          <h3 className="text-2xl font-black tracking-[-0.05em]">{product.name}</h3>

          <p
            className={`mt-1 text-sm ${
              selectedProductId === product.id ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            SKU {product.sku}
          </p>

          <p
            className={`mt-4 text-sm leading-6 ${
              selectedProductId === product.id ? "text-neutral-300" : "text-neutral-500"
            }`}
          >
            {product.material}
          </p>
        </button>
      ))}
    </div>
  );
}

function ProductIcon({ type, size = 56 }: { type: Product["icon"]; size?: number }) {
  const props = { size, weight: "duotone" as const };

  if (type === "shirt") return <TShirt {...props} />;
  if (type === "hoodie") return <Hoodie {...props} />;
  if (type === "office") return <CoatHanger {...props} />;
  if (type === "pants") return <Pants {...props} />;
  return <CoatHanger {...props} />;
}

function QuantityStep({
  product,
  combos,
  setCombos,
  selectedColor,
  setSelectedColor,
}: {
  product: Product;
  combos: Combo[];
  setCombos: Dispatch<SetStateAction<Combo[]>>;
  selectedColor: string;
  setSelectedColor: Dispatch<SetStateAction<string>>;
}) {
  const [size, setSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(10);

  useEffect(() => {
    setSelectedColor(product.colors[0]);
    setSize(product.sizes[0]);
  }, [product, setSelectedColor]);

  function addCombo() {
    if (!quantity || quantity < 1) return;

    setCombos((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        color: selectedColor,
        size,
        quantity,
      },
    ]);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <section className="rounded-[30px] bg-black p-6 text-white">
        <Package size={42} weight="duotone" />
        <h3 className="mt-5 text-3xl font-black tracking-[-0.06em]">
          Cargá combinaciones
        </h3>
        <p className="mt-4 text-sm leading-6 text-neutral-400">
          Podés dividir el pedido por color, talle y cantidad sin perder claridad.
        </p>

        <div className="mt-8 grid gap-4">
          <Select
            label="Color"
            value={selectedColor}
            options={product.colors}
            onChange={setSelectedColor}
          />
          <Select label="Talle" value={size} options={product.sizes} onChange={setSize} />

          <label className="grid gap-2">
            <span className="text-sm font-black">Cantidad</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="rounded-[22px] border border-white/10 bg-white px-5 py-4 text-black outline-none"
            />
          </label>

          <button
            onClick={addCombo}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-4 font-black text-black transition hover:scale-[1.02]"
          >
            <Plus size={20} weight="bold" />
            Agregar combinación
          </button>
        </div>
      </section>

      <section className="rounded-[30px] border border-neutral-200 bg-[#fafaf8] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
              Matriz del pedido
            </p>
            <h3 className="text-3xl font-black tracking-[-0.06em]">{product.name}</h3>
          </div>
          <div className="rounded-full bg-black px-5 py-3 font-black text-white">
            {combos.reduce((sum, combo) => sum + combo.quantity, 0)} u.
          </div>
        </div>

        <div className="grid gap-3">
          {combos.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-500">
              Todavía no agregaste combinaciones.
            </div>
          )}

          {combos.map((combo) => (
            <div
              key={combo.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-black">
                  {combo.quantity} unidades · {combo.productName}
                </p>
                <p className="text-sm text-neutral-500">
                  {combo.color} · Talle {combo.size} · SKU {combo.sku}
                </p>
              </div>

              <button
                onClick={() =>
                  setCombos((current) => current.filter((item) => item.id !== combo.id))
                }
                className="grid size-11 place-items-center rounded-full bg-neutral-100 transition hover:bg-black hover:text-white"
              >
                <Trash size={18} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[22px] border border-white/10 bg-white px-5 py-4 text-black outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function LogoStudio({
  product,
  selectedColor,
  decorations,
  selectedDecorationId,
  setSelectedDecorationId,
  selectedDecoration,
  updateDecoration,
  addDecoration,
  removeDecoration,
}: {
  product: Product;
  selectedColor: string;
  decorations: Decoration[];
  selectedDecorationId: string;
  setSelectedDecorationId: (id: string) => void;
  selectedDecoration: Decoration;
  updateDecoration: (id: string, updates: Partial<Decoration>) => void;
  addDecoration: (area?: LogoArea) => Decoration;
  removeDecoration: (id: string) => void;
}) {

  const [manualSide, setManualSide] = useState<GarmentSide>(selectedDecoration.side);
  const [showModelPreview, setShowModelPreview] = useState(false);

  const visibleSide = manualSide;

  function updateSelected(updates: Partial<Decoration>) {
    updateDecoration(selectedDecoration.id, updates);
  }

  function changeArea(area: LogoArea) {
    const preset = getAreaPreset(area);

    updateSelected({
      name: area,
      area,
      side: preset.side,
      x: preset.x,
      y: preset.y,
      sizeCm: preset.sizeCm,
      rotation: 0,
    });

    setManualSide(preset.side);
  }

  function handleFile(file?: File) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      updateSelected({
        fileName: file.name,
        imageUrl: String(reader.result),
      });
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <section className="rounded-[34px] bg-[#f4f4f1] p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-400">
              Estudio de personalización
            </p>
            <h3 className="text-4xl font-black tracking-[-0.06em]">{product.name}</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Arrastrá el logo sobre la prenda y definí exactamente su ubicación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-full bg-white p-1 shadow-sm">
              {(["Delantera", "Espalda"] as GarmentSide[]).map((side) => (
                <button
                  key={side}
                  onClick={() => {
                    const existingDecoration = decorations.find((item) => item.side === side);

                    if (existingDecoration) {
                      setSelectedDecorationId(existingDecoration.id);
                      setManualSide(side);
                      return;
                    }

                    const newDecoration = addDecoration(
                      side === "Espalda" ? "Espalda centro" : "Pecho izquierdo",
                    );

                    setSelectedDecorationId(newDecoration.id);
                    setManualSide(side);
                  }}
                  className={`rounded-full px-5 py-3 text-sm font-black transition ${
                    visibleSide === side ? "bg-black text-white" : "text-black hover:bg-neutral-100"
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowModelPreview(true)}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white shadow-sm transition hover:scale-[1.02]"
            >
              <Eye size={18} weight="bold" />
              Ver en modelo
            </button>
          </div>
        </div>

        <GarmentCanvas
          product={product}
          selectedColor={selectedColor}
          side={visibleSide}
          decorations={decorations.filter((item) => item.side === visibleSide)}
          selectedDecorationId={selectedDecorationId}
          setSelectedDecorationId={setSelectedDecorationId}
          updateDecoration={updateDecoration}
        />
      </section>

      <section className="rounded-[34px] bg-black p-5 text-white">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
              Aplicaciones
            </p>
            <h3 className="text-2xl font-black tracking-[-0.05em]">
              Logos y ubicaciones
            </h3>
          </div>

          <button
            onClick={() => {
              const newDecoration = addDecoration("Espalda centro");
              setSelectedDecorationId(newDecoration.id);
              setManualSide("Espalda");
            }}
            className="grid size-11 place-items-center rounded-full bg-white text-black transition hover:scale-105"
            title="Agregar otra ubicación"
          >
            <Plus size={20} weight="bold" />
          </button>
        </div>

        <div className="mb-5 grid gap-2">
          {decorations.map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedDecorationId(item.id);
                setManualSide(item.side);
              }}
              className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition ${
                selectedDecorationId === item.id
                  ? "bg-white text-black"
                  : "bg-white/[0.07] text-neutral-300 hover:bg-white/[0.12]"
              }`}
            >
              <span>
                <strong className="block text-sm">Logo {index + 1}</strong>
                <span className="text-xs opacity-70">
                  {item.area} · {item.technique} · {item.sizeCm} cm
                </span>
              </span>

              {decorations.length > 1 && (
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    removeDecoration(item.id);
                  }}
                  className="grid size-8 place-items-center rounded-full bg-black/10"
                >
                  <Trash size={16} weight="bold" />
                </span>
              )}
            </button>
          ))}
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-white/[0.06] p-7 text-center transition hover:bg-white/[0.1]">
          <CloudArrowUp size={40} weight="duotone" />
          <strong className="mt-3">Subir logo para esta ubicación</strong>
          <span className="mt-1 text-sm text-neutral-400">PNG, JPG o imagen del diseño</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>

        {selectedDecoration.fileName && (
          <p className="mt-3 rounded-2xl bg-white/[0.08] px-4 py-3 text-sm text-neutral-300">
            {selectedDecoration.fileName}
          </p>
        )}

        <div className="mt-6 grid gap-4">
          <ButtonGroup
            label="Área"
            options={[
              "Pecho izquierdo",
              "Pecho centro",
              "Espalda centro",
              "Manga derecha",
              "Manga izquierda",
            ]}
            value={selectedDecoration.area}
            onChange={(value) => changeArea(value as LogoArea)}
          />

          <ButtonGroup
            label="Técnica"
            options={["Bordado", "Estampa", "DTF", "Serigrafía"]}
            value={selectedDecoration.technique}
            onChange={(value) => updateSelected({ technique: value as Technique })}
          />

          <Range
            label="Tamaño del logo en cm"
            value={selectedDecoration.sizeCm}
            min={10}
            max={20}
            step={1}
            onChange={(value) => updateSelected({ sizeCm: value })}
          />

          <Range
            label="Horizontal"
            value={selectedDecoration.x}
            min={8}
            max={92}
            onChange={(value) => updateSelected({ x: value })}
          />

          <Range
            label="Vertical"
            value={selectedDecoration.y}
            min={8}
            max={92}
            onChange={(value) => updateSelected({ y: value })}
          />

          <Range
            label="Rotación"
            value={selectedDecoration.rotation}
            min={-30}
            max={30}
            onChange={(value) => updateSelected({ rotation: value })}
          />
        </div>
      </section>

      {showModelPreview && (
        <ModelPreviewModal
          product={product}
          selectedColor={selectedColor}
          decorations={decorations.filter((item) => item.side === "Delantera")}
          onClose={() => setShowModelPreview(false)}
        />
      )}
    </div>
  );
}

function ModelPreviewModal({
  product,
  selectedColor,
  decorations,
  onClose,
}: {
  product: Product;
  selectedColor: string;
  decorations: Decoration[];
  onClose: () => void;
}) {
  const garmentImage = getProductViews(product, selectedColor)?.front;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[36px] bg-[#f4f4f1] p-5 shadow-2xl">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-400">
              Preview en modelo
            </p>
            <h3 className="text-4xl font-black tracking-[-0.06em]">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Vista aproximada para mostrar cómo se vería la prenda puesta.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-black px-6 py-3 font-black text-white transition hover:scale-[1.02]"
          >
            Cerrar
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="relative min-h-[520px] overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-neutral-100 to-neutral-300 sm:min-h-[720px]">
            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:34px_34px]" />

            <img
              src={modelFront}
              alt="Modelo frontal"
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain"
            />

            <div className="absolute left-1/2 top-[55%] h-[320px] w-[250px] -translate-x-1/2 -translate-y-1/2 sm:h-[470px] sm:w-[390px]">
              {garmentImage ? (
                <img
                  src={garmentImage}
                  alt={`${product.name} sobre modelo`}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center rounded-[32px] bg-white/80 text-center text-sm font-black text-neutral-400">
                  Falta imagen frontal de producto
                </div>
              )}

              {decorations.map((decoration) => (
                <div
                  key={decoration.id}
                  className="absolute z-20 grid min-h-10 min-w-16 place-items-center border-2 border-dashed border-white/80 bg-white/5 p-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-[1px]"
                  style={{
                    left: `${decoration.x}%`,
                    top: `${decoration.y}%`,
                    transform: `translate(-50%, -50%) scale(${getVisualScale(decoration.sizeCm)}) rotate(${decoration.rotation}deg)`,
                  }}
                >
                  {decoration.imageUrl ? (
                    <img
                      src={decoration.imageUrl}
                      className="max-h-20 max-w-32 object-contain"
                    />
                  ) : (
                    <span>{decoration.sizeCm} cm</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[32px] bg-black p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
              Aplicaciones delanteras
            </p>

            <div className="mt-5 grid gap-3">
              {decorations.length === 0 && (
                <div className="rounded-2xl bg-white/[0.08] p-4 text-sm text-neutral-400">
                  No hay logos cargados en la delantera.
                </div>
              )}

              {decorations.map((item, index) => (
                <div key={item.id} className="rounded-2xl bg-white/[0.08] p-4">
                  <p className="font-black">Logo {index + 1}</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {item.area} · {item.technique} · {item.sizeCm} cm
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function GarmentCanvas({
  product,
  selectedColor,
  side,
  decorations,
  selectedDecorationId,
  setSelectedDecorationId,
  updateDecoration,
}: {
  product: Product;
  selectedColor: string;
  side: GarmentSide;
  decorations: Decoration[];
  selectedDecorationId: string;
  setSelectedDecorationId: (id: string) => void;
  updateDecoration: (id: string, updates: Partial<Decoration>) => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  function getPoint(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) return null;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    return {
      x: Math.max(5, Math.min(95, Math.round(x))),
      y: Math.max(5, Math.min(95, Math.round(y))),
    };
  }

  function moveDecoration(event: ReactPointerEvent<HTMLDivElement>, id: string) {
    const point = getPoint(event);

    if (!point) return;

    updateDecoration(id, point);
  }

  const productViews = getProductViews(product, selectedColor);

  const garmentImage =
    productViews
      ? side === "Delantera"
        ? productViews.front
        : productViews.back
      : null;

  return (
    <div className="relative min-h-[620px] overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-neutral-100 to-neutral-300">
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:34px_34px]" />

      <div className="absolute left-6 top-6 z-20 rounded-full bg-white/90 px-4 py-2 text-sm font-black shadow">
        Vista {side.toLowerCase()}
      </div>

      <div className="absolute right-6 top-6 z-20 rounded-full bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
        {product.sku}
      </div>

      <div className="absolute inset-0 flex touch-none items-center justify-center p-8">
        <div
          ref={canvasRef}
          className="relative h-[540px] w-[470px]"
          onPointerDown={(event) => {
            if (event.target !== event.currentTarget) return;

            const selected = decorations.find((item) => item.id === selectedDecorationId);

            if (selected) {
              moveDecoration(event, selected.id);
            }
          }}
        >
          {garmentImage ? (
            <img
              src={garmentImage}
              alt={`${product.name} ${side}`}
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center rounded-[32px] bg-white/80 text-center text-sm font-black text-neutral-400">
              Falta imagen de producto
            </div>
          )}

          {decorations.map((decoration) => (
            <DraggableLogo
              key={decoration.id}
              decoration={decoration}
              active={decoration.id === selectedDecorationId}
              setSelectedDecorationId={setSelectedDecorationId}
              updateDecoration={updateDecoration}
              canvasRef={canvasRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DraggableLogo({
  decoration,
  active,
  setSelectedDecorationId,
  updateDecoration,
  canvasRef,
}: {
  decoration: Decoration;
  active: boolean;
  setSelectedDecorationId: (id: string) => void;
  updateDecoration: (id: string, updates: Partial<Decoration>) => void;
  canvasRef: RefObject<HTMLDivElement | null>;
}) {
  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    setSelectedDecorationId(decoration.id);

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    function move(pointerEvent: PointerEvent) {
      const rect = canvasRef.current?.getBoundingClientRect();

      if (!rect) return;

      const x = ((pointerEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((pointerEvent.clientY - rect.top) / rect.height) * 100;

      updateDecoration(decoration.id, {
        x: Math.max(5, Math.min(95, Math.round(x))),
        y: Math.max(5, Math.min(95, Math.round(y))),
      });
    }

    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`absolute z-30 grid min-h-12 min-w-20 touch-none select-none place-items-center border-2 bg-white/5 p-2 text-xs font-black uppercase tracking-widest text-white backdrop-blur-[1px] transition ${
        active ? "border-white shadow-[0_0_0_6px_rgba(0,0,0,0.18)]" : "border-white/45"
      }`}
      style={{
        left: `${decoration.x}%`,
        top: `${decoration.y}%`,
        transform: `translate(-50%, -50%) scale(${getVisualScale(decoration.sizeCm)}) rotate(${decoration.rotation}deg)`,
        cursor: "grab",
      }}
    >
      {decoration.imageUrl ? (
        <img src={decoration.imageUrl} className="max-h-20 max-w-32 object-contain" />
      ) : (
        <span>{decoration.sizeCm} cm</span>
      )}
    </div>
  );
}

function ButtonGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-black">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-2xl px-3 py-3 text-sm font-black transition ${
              value === option
                ? "bg-white text-black"
                : "bg-white/[0.08] text-neutral-300 hover:bg-white/[0.12]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 rounded-2xl bg-white/[0.06] p-4">
      <span className="flex justify-between text-sm font-black">
        {label}
        <span className="text-neutral-400">{value}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-white"
      />
    </label>
  );
}

function SummaryStep({
  client,
  product,
  selectedColor,
  combos,
  decorations,
  totalUnits,
}: {
  client: ClientData;
  product: Product;
  selectedColor: string;
  combos: Combo[];
  decorations: Decoration[];
  totalUnits: number;
}) {
  const [phase, setPhase] = useState<"idle" | "processing" | "done">("idle");
  const [confirmProgress, setConfirmProgress] = useState(0);
  const [currentCheck, setCurrentCheck] = useState(0);
  const orderRef = useRef<HTMLDivElement | null>(null);

  const frontDecorations = decorations.filter((item) => item.side === "Delantera");
  const backDecorations = decorations.filter((item) => item.side === "Espalda");
  const productViews = getProductViews(product, selectedColor);

  const companyName = client.company || "Cliente sin completar";
  const contactName = client.contact || "Contacto sin completar";
  const createdAt = new Date().toLocaleString("es-AR");
  const orderNumber = `FILTEX-${Date.now().toString().slice(-6)}`;

  const checks = [
    "Validando datos del cliente",
    "Revisando cantidades y combinaciones",
    "Preparando guía visual del taller",
    "Habilitando descarga y envío",
  ];

  useEffect(() => {
    if (phase !== "processing") return;

    setConfirmProgress(0);
    setCurrentCheck(0);

    const startedAt = Date.now();
    const duration = 2600;

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const ratio = Math.min(elapsed / duration, 1);
      const nextProgress = Math.round(ratio * 100);

      setConfirmProgress(nextProgress);
      setCurrentCheck(Math.min(checks.length - 1, Math.floor(ratio * checks.length)));

      if (ratio >= 1) {
        window.clearInterval(timer);
        setConfirmProgress(100);
        setCurrentCheck(checks.length - 1);

        window.setTimeout(() => {
          setPhase("done");
        }, 280);
      }
    }, 90);

    return () => window.clearInterval(timer);
  }, [phase]);

  function startConfirmation() {
    setPhase("processing");
  }

  function cleanFileName(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function downloadJpg() {
    if (!orderRef.current) return;

    const fileName = `orden-${cleanFileName(companyName)}-${orderNumber}.jpg`;

    const dataUrl = await toJpeg(orderRef.current, {
      quality: 0.96,
      pixelRatio: 2,
      backgroundColor: "#f4f4f1",
      cacheBust: true,
    });

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  }

  function buildMessage() {
    return [
      `Orden Filtex ${orderNumber}`,
      `Cliente: ${companyName}`,
      `Contacto: ${contactName}`,
      `Producto: ${product.name}`,
      `Color visual: ${selectedColor}`,
      `Total: ${totalUnits} unidades`,
      `Aplicaciones: ${decorations.length}`,
      "",
      "Adjunto la orden visual JPG para usar como guía de producción.",
    ].join("\n");
  }

  async function sendByWhatsapp() {
    await downloadJpg();
    const message = encodeURIComponent(buildMessage());
    window.open(`https://wa.me/?text=${message}`, "_blank");
  }

  async function sendByEmail() {
    await downloadJpg();
    const subject = encodeURIComponent(`Orden Filtex ${orderNumber} - ${companyName}`);
    const body = encodeURIComponent(buildMessage());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  if (phase === "idle") {
    return (
      <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
        <section className="confirm-console rounded-[34px] p-6 text-white">
          <div className="flex items-start gap-5">
            <div
              className="confirm-knob-ring"
              style={{
                background:
                  "conic-gradient(#9cff1a 72%, rgba(255,255,255,0.14) 72%)",
              }}
            >
              <div className="confirm-knob-core">
                <span>{totalUnits || 0}</span>
                <small>u.</small>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="confirm-mini-label">Centro de control</p>
              <h3 className="mt-2 text-4xl font-black tracking-[-0.07em]">
                Confirmar orden
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Revisá la orden y generá una ficha visual clara para producción.
                La validación se hace en un paso guiado y visual.
              </p>
            </div>
          </div>

          <div className="confirm-console-grid mt-7">
            <div className="confirm-stat-tile">
              <span>Producto</span>
              <strong>{product.name}</strong>
            </div>
            <div className="confirm-stat-tile">
              <span>Color</span>
              <strong>{selectedColor}</strong>
            </div>
            <div className="confirm-stat-tile">
              <span>Aplicaciones</span>
              <strong>{decorations.length}</strong>
            </div>
            <div className="confirm-stat-tile">
              <span>Cliente</span>
              <strong>{client.company || "Sin cargar"}</strong>
            </div>
          </div>

          <div className="confirm-equalizer mt-7">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="confirm-check-list mt-6">
            {checks.map((item, index) => (
              <div
                key={item}
                className={`confirm-check-item ${index === 0 ? "done" : ""}`}
              >
                <span className="confirm-check-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={startConfirmation} className="confirm-cta mt-8">
            Generar orden visual
          </button>
        </section>

        <section className="rounded-[34px] border border-neutral-200 bg-[#fafaf8] p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-400">
              Revisión previa
            </p>
            <h3 className="mt-2 text-4xl font-black tracking-[-0.06em]">
              Resumen del pedido
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ReviewCard label="Empresa" value={companyName} />
            <ReviewCard label="Contacto" value={contactName} />
            <ReviewCard label="WhatsApp" value={client.whatsapp || "Sin completar"} />
            <ReviewCard label="Email" value={client.email || "Sin completar"} />
            <ReviewCard label="Producto" value={product.name} />
            <ReviewCard label="Color visual" value={selectedColor} />
            <ReviewCard label="Total unidades" value={`${totalUnits}`} />
            <ReviewCard label="Aplicaciones" value={`${decorations.length}`} />
          </div>

          <div className="mt-5 rounded-[28px] bg-white p-5">
            <p className="mb-3 text-sm font-black">Combinaciones</p>

            {combos.length === 0 ? (
              <p className="text-sm text-neutral-500">No hay combinaciones cargadas.</p>
            ) : (
              <div className="grid gap-2">
                {combos.map((combo) => (
                  <div
                    key={combo.id}
                    className="flex flex-wrap justify-between gap-3 rounded-2xl bg-neutral-100 px-4 py-3 text-sm"
                  >
                    <strong>{combo.quantity} unidades</strong>
                    <span className="text-neutral-500">
                      {combo.productName} · {combo.color} · Talle {combo.size}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {client.notes && (
            <div className="mt-5 rounded-[28px] bg-white p-5">
              <p className="mb-2 text-sm font-black">Observaciones</p>
              <p className="text-sm leading-6 text-neutral-600">{client.notes}</p>
            </div>
          )}
        </section>
      </div>
    );
  }

  if (phase === "processing") {
    return (
      <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
        <section className="confirm-console confirm-console-processing rounded-[34px] p-6 text-white">
          <div className="flex flex-col items-center text-center">
            <div
              className="confirm-knob-ring confirm-knob-ring-processing"
              style={{
                background: `conic-gradient(#9cff1a ${confirmProgress}%, rgba(255,255,255,0.12) ${confirmProgress}%)`,
              }}
            >
              <div className="confirm-knob-core">
                <span>{confirmProgress}%</span>
                <small>scan</small>
              </div>
            </div>

            <p className="confirm-mini-label mt-6">Procesando</p>
            <h3 className="mt-2 text-4xl font-black tracking-[-0.07em]">
              Generando orden
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
              Estamos validando la información y preparando una orden visual lista
              para el taller.
            </p>
          </div>

          <div className="confirm-signal mt-8">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="confirm-check-list mt-7">
            {checks.map((item, index) => {
              const done = index < currentCheck || confirmProgress === 100;
              const active = index === currentCheck && confirmProgress < 100;

              return (
                <div
                  key={item}
                  className={`confirm-check-item ${done ? "done" : ""} ${active ? "active" : ""}`}
                >
                  <span className="confirm-check-dot" />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[34px] border border-neutral-200 bg-[#fafaf8] p-5">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-400">
              Estado de validación
            </p>
            <h3 className="mt-2 text-4xl font-black tracking-[-0.06em]">
              Orden en preparación
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ReviewCard label="Empresa" value={companyName} />
            <ReviewCard label="Producto" value={product.name} />
            <ReviewCard label="Color visual" value={selectedColor} />
            <ReviewCard label="Total unidades" value={`${totalUnits}`} />
          </div>

          <div className="mt-6 rounded-[28px] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-black">Avance</p>
              <span className="text-sm font-black text-[#58b300]">{confirmProgress}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="confirm-progress-bar"
                style={{ width: `${confirmProgress}%` }}
              />
            </div>

            <p className="mt-4 text-sm text-neutral-500">
              {checks[currentCheck] ?? checks[checks.length - 1]}
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-[34px] border border-neutral-200 bg-neutral-50 p-4">
        <div
          ref={orderRef}
          className="mx-auto w-full max-w-5xl rounded-[24px] bg-[#f4f4f1] p-4 text-black sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8"
        >
          <div className="order-success-hero mb-6">
            <div className="order-success-icon">
              <CheckCircle size={26} weight="fill" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="order-success-kicker">Orden generada correctamente</p>
              <h3 className="order-success-title">
                La ficha visual está lista
              </h3>
              <p className="order-success-text">
                Podés descargarla en JPG o enviarla como guía de producción.
              </p>
            </div>
          </div>

          <header className="order-sheet-header mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-start md:gap-5">
            <div className="flex items-start gap-4">
              <div className="hidden h-16 w-20 items-center justify-center rounded-[18px] border border-black/10 bg-white p-2 shadow-sm sm:flex">
                <img
                  src={filtexLogo}
                  alt="Filtex"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-neutral-500">
                  Filtex · Orden de trabajo
                </p>
                <h3 className="mt-3 text-3xl font-black tracking-[-0.08em] sm:text-4xl md:text-5xl">
                  {orderNumber}
                </h3>
                <p className="mt-2 text-sm text-neutral-500">{createdAt}</p>
              </div>
            </div>

            <div className="order-total-display">
              <p>Total</p>
              <strong>{totalUnits}</strong>
              <span>unidades</span>
            </div>
          </header>

          <section className="order-production-summary mb-6">
            <div>
              <span>Cliente</span>
              <strong>{companyName}</strong>
            </div>
            <div>
              <span>Producto</span>
              <strong>{product.name}</strong>
            </div>
            <div>
              <span>Color visual</span>
              <strong>{selectedColor}</strong>
            </div>
            <div>
              <span>Aplicaciones</span>
              <strong>{decorations.length} logos</strong>
            </div>
          </section>

          <section className="mb-6 grid gap-3 sm:grid-cols-2 md:mb-8 lg:grid-cols-4">
            <InfoBlock label="Empresa" value={companyName} />
            <InfoBlock label="Contacto" value={contactName} />
            <InfoBlock label="WhatsApp" value={client.whatsapp || "Sin completar"} />
            <InfoBlock label="Email" value={client.email || "Sin completar"} />
          </section>

          <section className="mb-6 rounded-[22px] bg-white p-4 sm:rounded-[28px] sm:p-5 md:mb-8">
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-400">
                  Producto
                </p>
                <h4 className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">
                  {product.name}
                </h4>
                <p className="mt-1 text-sm text-neutral-500">SKU {product.sku}</p>
                <p className="mt-1 text-sm font-black text-neutral-700">
                  Color visual: {selectedColor}
                </p>
              </div>

              <p className="max-w-md text-sm leading-6 text-neutral-500">
                {product.material}
              </p>
            </div>

            <div className="overflow-x-auto rounded-[18px] border border-neutral-200 sm:rounded-[22px]">
              <table className="w-full min-w-[560px] border-collapse text-xs sm:text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Prenda</th>
                    <th className="px-4 py-3 text-left">Color</th>
                    <th className="px-4 py-3 text-left">Talle</th>
                    <th className="px-4 py-3 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {combos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-5 text-center text-neutral-500">
                        Sin combinaciones cargadas.
                      </td>
                    </tr>
                  ) : (
                    combos.map((combo) => (
                      <tr key={combo.id} className="border-b border-neutral-200 last:border-0">
                        <td className="px-4 py-3 font-bold">{combo.productName}</td>
                        <td className="px-4 py-3 text-neutral-600">{combo.color}</td>
                        <td className="px-4 py-3 text-neutral-600">{combo.size}</td>
                        <td className="px-4 py-3 text-right font-black">
                          {combo.quantity}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6 grid gap-4 md:mb-8 xl:grid-cols-2">
            <OrderGarmentView
              title="Vista delantera"
              image={productViews?.front}
              productName={product.name}
              decorations={frontDecorations}
            />

            <OrderGarmentView
              title="Vista espalda"
              image={productViews?.back}
              productName={product.name}
              decorations={backDecorations}
            />
          </section>

          <section className="mb-6 rounded-[22px] bg-white p-4 sm:rounded-[28px] sm:p-5 md:mb-8">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-neutral-400">
              Aplicaciones
            </p>

            {decorations.length === 0 ? (
              <p className="text-sm text-neutral-500">Sin aplicaciones cargadas.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {decorations.map((item, index) => (
                  <div key={item.id} className="rounded-[22px] bg-neutral-100 p-4">
                    <p className="font-black">Logo {index + 1}</p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {item.side} · {item.area}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {item.technique} · {item.sizeCm} cm
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Posición X {item.x} · Y {item.y} · Rotación {item.rotation}°
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {client.notes && (
            <section className="rounded-[28px] bg-white p-5">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-neutral-400">
                Observaciones
              </p>
              <p className="text-sm leading-6 text-neutral-600">{client.notes}</p>
            </section>
          )}
        </div>
      </section>

      <aside className="confirm-success-panel order-action-console rounded-[34px] p-6 text-white">
        <div className="confirm-success-orb">
          <CheckCircle size={42} weight="fill" />
        </div>

        <p className="confirm-mini-label mt-6">Orden lista</p>
        <h3 className="mt-2 text-3xl font-black tracking-[-0.07em] sm:text-4xl">
          Siguiente acción
        </h3>
        <p className="mt-4 text-sm leading-6 text-white/72">
          La orden visual ya fue generada. Elegí cómo querés compartirla o descargala para enviarla manualmente.
        </p>

        <div className="order-action-status mt-6">
          <span className="order-action-led" />
          <div>
            <strong>Ficha disponible</strong>
            <small>JPG listo para producción</small>
          </div>
        </div>

        <div className="confirm-console-grid mt-7">
          <div className="confirm-stat-tile">
            <span>Orden</span>
            <strong>{orderNumber}</strong>
          </div>
          <div className="confirm-stat-tile">
            <span>Cliente</span>
            <strong>{companyName}</strong>
          </div>
          <div className="confirm-stat-tile">
            <span>Producto</span>
            <strong>{product.name}</strong>
          </div>
          <div className="confirm-stat-tile">
            <span>Total</span>
            <strong>{totalUnits} u.</strong>
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          <button onClick={downloadJpg} className="confirm-cta">
            Descargar orden JPG
          </button>

          <button onClick={sendByWhatsapp} className="confirm-cta-secondary">
            Enviar por WhatsApp
          </button>

          <button onClick={sendByEmail} className="confirm-cta-secondary">
            Enviar por email
          </button>

          <button
            onClick={() => {
              setPhase("idle");
              setConfirmProgress(0);
              setCurrentCheck(0);
            }}
            className="confirm-cta-ghost"
          >
            Volver a revisar
          </button>
        </div>
      </aside>
    </div>
  );
}

function ReviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p className="mt-2 font-black">{value}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-black">{value}</p>
    </div>
  );
}

function OrderGarmentView({
  title,
  image,
  productName,
  decorations,
}: {
  title: string;
  image?: string;
  productName: string;
  decorations: Decoration[];
}) {
  return (
    <div className="rounded-[22px] bg-white p-4 sm:rounded-[28px] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-400">
          {title}
        </p>
        <span className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">
          {decorations.length} logos
        </span>
      </div>

      <div className="relative h-[300px] overflow-hidden rounded-[22px] bg-gradient-to-br from-neutral-50 to-neutral-200 sm:h-[360px] md:h-[430px] sm:rounded-[26px]">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:30px_30px]" />

        <div className="absolute left-1/2 top-1/2 h-[270px] w-[230px] -translate-x-1/2 -translate-y-1/2 sm:h-[330px] sm:w-[280px] md:h-[390px] md:w-[330px]">
          {image ? (
            <img
              src={image}
              alt={`${productName} ${title}`}
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center rounded-[24px] bg-white/80 text-center text-xs font-black text-neutral-400">
              Falta imagen
            </div>
          )}

          {decorations.map((decoration) => (
            <div
              key={decoration.id}
              className="absolute z-20 grid min-h-10 min-w-16 place-items-center border-2 border-dashed border-white/85 bg-white/5 p-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-[1px]"
              style={{
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                transform: `translate(-50%, -50%) scale(${getVisualScale(decoration.sizeCm)}) rotate(${decoration.rotation}deg)`,
              }}
            >
              {decoration.imageUrl ? (
                <img
                  src={decoration.imageUrl}
                  className="max-h-20 max-w-32 object-contain"
                />
              ) : (
                <span>{decoration.sizeCm} cm</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}






























