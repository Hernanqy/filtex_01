import { useMemo, useRef, useState } from "react";
import type {
  Dispatch,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
  SetStateAction,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Buildings,
  CheckCircle,
  ClipboardText,
  CloudArrowUp,
  Eye,
  CoatHanger,
  Hoodie,
  Package,
  Pants,
  PenNib,
  Plus,
  Sparkle,
  TShirt,
  Trash,
} from "@phosphor-icons/react";

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

export default function App() {
  const [step, setStep] = useState(0);
  const [client, setClient] = useState<ClientData>(initialClient);
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([
    createDecoration("Pecho izquierdo"),
  ]);
  const [selectedDecorationId, setSelectedDecorationId] = useState(decorations[0].id);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) ?? products[0];
  }, [selectedProductId]);

  const selectedDecoration =
    decorations.find((item) => item.id === selectedDecorationId) ?? decorations[0];

  const totalUnits = combos.reduce((sum, item) => sum + item.quantity, 0);

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

  function downloadOrder() {
    const order = {
      createdAt: new Date().toLocaleString("es-AR"),
      client,
      product: selectedProduct,
      combos,
      totalUnits,
      decorations: decorations.map((item) => ({
        name: item.name,
        area: item.area,
        side: item.side,
        technique: item.technique,
        logoFile: item.fileName || "Sin archivo cargado",
        placement: {
          x: item.x,
          y: item.y,
          sizeCm: item.sizeCm,
          rotation: item.rotation,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(order, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orden-filtex-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f4f4f1] text-black">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col p-4 md:p-6">
        <TopBar totalUnits={totalUnits} decorationCount={decorations.length} />

        <section className="grid flex-1 gap-5 lg:grid-cols-[310px_1fr]">
          <aside className="rounded-[34px] bg-black p-5 text-white shadow-2xl">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-neutral-500">
                Filtex Studio
              </p>
              <h1 className="mt-3 text-4xl font-black leading-[0.9] tracking-[-0.07em]">
                Pedido visual guiado
              </h1>
              <p className="mt-4 text-sm leading-6 text-neutral-400">
                Una experiencia clara para convertir una consulta en una orden de trabajo lista para producción.
              </p>
            </div>

            <StepRail currentStep={step} setStep={setStep} />

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
                Orden actual
              </p>
              <div className="mt-5 space-y-4">
                <Metric label="Producto" value={selectedProduct.name} />
                <Metric label="Unidades" value={`${totalUnits}`} />
                <Metric label="Aplicaciones" value={`${decorations.length}`} />
                <Metric label="Vista activa" value={selectedDecoration?.side ?? "Delantera"} />
              </div>
            </div>
          </aside>

          <section className="rounded-[34px] border border-black/5 bg-white p-4 shadow-2xl md:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-400">
                  Paso {step + 1} de {steps.length}
                </p>
                <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] md:text-6xl">
                  {getStepTitle(step)}
                </h2>
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

                {step < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-black text-white transition hover:scale-[1.02]"
                  >
                    Continuar
                    <ArrowRight size={18} weight="bold" />
                  </button>
                ) : (
                  <button
                    onClick={downloadOrder}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-black text-white transition hover:scale-[1.02]"
                  >
                    Descargar orden
                    <ClipboardText size={18} weight="bold" />
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
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
                  />
                )}

                {step === 3 && (
                  <LogoStudio
                    product={selectedProduct}
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
                    combos={combos}
                    decorations={decorations}
                    totalUnits={totalUnits}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </section>
      </div>
    </main>
  );
}

function TopBar({
  totalUnits,
  decorationCount,
}: {
  totalUnits: number;
  decorationCount: number;
}) {
  return (
    <header className="mb-5 flex flex-col justify-between gap-4 rounded-[30px] bg-white px-5 py-4 shadow-sm md:flex-row md:items-center">
      <div className="flex items-center gap-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-black text-xl font-black text-white">
          F
        </div>
        <div>
          <p className="text-lg font-black tracking-[-0.04em]">Filtex Pedidos</p>
          <p className="text-sm text-neutral-500">
            Sistema visual para órdenes de indumentaria
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge icon={<Sparkle size={17} weight="fill" />} text="Studio visual" />
        <Badge icon={<Package size={17} weight="fill" />} text={`${totalUnits} unidades`} />
        <Badge icon={<PenNib size={17} weight="fill" />} text={`${decorationCount} logos`} />
      </div>
    </header>
  );
}

function Badge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-bold">
      {icon}
      {text}
    </div>
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
                ? "bg-white text-black"
                : "bg-white/[0.05] text-neutral-400 hover:bg-white/[0.1] hover:text-white"
            }`}
          >
            <span
              className={`grid size-10 place-items-center rounded-xl ${
                active ? "bg-black text-white" : "bg-white/[0.08]"
              }`}
            >
              {icons[index]}
            </span>
            <span>
              <span className="block text-sm font-black">{item}</span>
              <span className="text-xs opacity-60">Paso {index + 1}</span>
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
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
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
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
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
            className="min-h-44 rounded-[26px] border border-neutral-200 bg-neutral-50 px-5 py-4 outline-none transition focus:border-black focus:bg-white"
          />
        </label>
      </div>

      <div className="rounded-[30px] bg-black p-6 text-white">
        <Buildings size={42} weight="duotone" />
        <h3 className="mt-5 text-3xl font-black tracking-[-0.06em]">
          Primero identificamos la orden.
        </h3>
        <p className="mt-4 text-sm leading-6 text-neutral-400">
          La app tiene que pedir datos sin sentirse como un formulario largo.
          Cada paso tiene una intención clara.
        </p>
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
        className="rounded-[22px] border border-neutral-200 bg-neutral-50 px-5 py-4 outline-none transition focus:border-black focus:bg-white"
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
              : "border-neutral-200 bg-neutral-50 hover:-translate-y-1 hover:border-black hover:bg-white hover:shadow-xl"
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
}: {
  product: Product;
  combos: Combo[];
  setCombos: Dispatch<SetStateAction<Combo[]>>;
}) {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(10);

  function addCombo() {
    if (!quantity || quantity < 1) return;

    setCombos((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        color,
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
          Cargá combinaciones.
        </h3>
        <p className="mt-4 text-sm leading-6 text-neutral-400">
          Ideal para pedidos reales: 50 prendas divididas por talle, color y cantidad.
        </p>

        <div className="mt-8 grid gap-4">
          <Select label="Color" value={color} options={product.colors} onChange={setColor} />
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

      <section className="rounded-[30px] border border-neutral-200 bg-neutral-50 p-5">
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
  decorations,
  selectedDecorationId,
  setSelectedDecorationId,
  selectedDecoration,
  updateDecoration,
  addDecoration,
  removeDecoration,
}: {
  product: Product;
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
              Arrastrá el logo directamente sobre la prenda. Podés tener más de una aplicación.
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
          decorations={decorations.filter((item) => item.side === "Delantera")}
          onClose={() => setShowModelPreview(false)}
        />
      )}
    </div>
  );
}

function ModelPreviewModal({
  product,
  decorations,
  onClose,
}: {
  product: Product;
  decorations: Decoration[];
  onClose: () => void;
}) {
  const garmentImage = product.views?.front;

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
          <div className="relative min-h-[720px] overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-neutral-100 to-neutral-300">
            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:34px_34px]" />

            <img
              src={modelFront}
              alt="Modelo frontal"
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain"
            />

            <div className="absolute left-1/2 top-[55%] h-[470px] w-[390px] -translate-x-1/2 -translate-y-1/2">
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
  side,
  decorations,
  selectedDecorationId,
  setSelectedDecorationId,
  updateDecoration,
}: {
  product: Product;
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

  const garmentImage =
    product.views
      ? side === "Delantera"
        ? product.views.front
        : product.views.back
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
  combos,
  decorations,
  totalUnits,
}: {
  client: ClientData;
  product: Product;
  combos: Combo[];
  decorations: Decoration[];
  totalUnits: number;
}) {
  const order = {
    client,
    product,
    combos,
    totalUnits,
    decorations: decorations.map((item) => ({
      name: item.name,
      side: item.side,
      area: item.area,
      technique: item.technique,
      logoFile: item.fileName || "Sin archivo cargado",
      placement: {
        x: item.x,
        y: item.y,
        sizeCm: item.sizeCm,
        rotation: item.rotation,
      },
    })),
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <section className="rounded-[34px] bg-black p-6 text-white">
        <CheckCircle size={48} weight="duotone" />
        <h3 className="mt-5 text-5xl font-black tracking-[-0.08em]">{totalUnits}</h3>
        <p className="text-neutral-400">unidades totales</p>

        <div className="mt-8 space-y-4">
          <SummaryLine label="Empresa" value={client.company || "Sin completar"} />
          <SummaryLine label="Contacto" value={client.contact || "Sin completar"} />
          <SummaryLine label="Producto" value={product.name} />
          <SummaryLine label="Aplicaciones" value={`${decorations.length}`} />
        </div>
      </section>

      <section className="rounded-[34px] bg-neutral-950 p-5 text-white">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
          JSON de orden de trabajo
        </p>
        <pre className="max-h-[620px] overflow-auto rounded-[24px] bg-black p-5 text-xs leading-5 text-neutral-300">
          {JSON.stringify(order, null, 2)}
        </pre>
      </section>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  );
}

function getStepTitle(step: number) {
  if (step === 0) return "Datos del cliente";
  if (step === 1) return "Elegí la prenda";
  if (step === 2) return "Armá el pedido";
  if (step === 3) return "Ubicá los logos";
  return "Orden final";
}

