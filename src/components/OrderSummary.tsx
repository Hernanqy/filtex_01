import type { ClientData, LogoPlacement, OrderCombo, Product } from "../types/order";
import { Download } from "lucide-react";

type OrderSummaryProps = {
  client: ClientData;
  product: Product;
  combos: OrderCombo[];
  logo: LogoPlacement;
};

export function OrderSummary({ client, product, combos, logo }: OrderSummaryProps) {
  const total = combos.reduce((sum, combo) => sum + combo.quantity, 0);

  const order = {
    createdAt: new Date().toLocaleString("es-AR"),
    client,
    selectedProduct: product,
    combos,
    totalUnits: total,
    customization: {
      fileName: logo.fileName || "Sin archivo cargado",
      technique: logo.technique,
      area: logo.area,
      placement: {
        x: logo.x,
        y: logo.y,
        scale: logo.scale,
        rotation: logo.rotation,
      },
    },
  };

  function downloadJson() {
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
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[2rem] bg-black p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
          Total del pedido
        </p>
        <h3 className="mt-3 text-6xl font-black tracking-[-0.08em]">{total}</h3>
        <p className="mt-1 text-neutral-400">unidades cargadas</p>

        <div className="mt-8 space-y-4 text-sm">
          <SummaryLine label="Empresa" value={client.company || "Sin completar"} />
          <SummaryLine label="Contacto" value={client.contact || "Sin completar"} />
          <SummaryLine label="WhatsApp" value={client.whatsapp || "Sin completar"} />
          <SummaryLine label="Producto base" value={product.name} />
          <SummaryLine label="Técnica" value={logo.technique} />
          <SummaryLine label="Ubicación" value={logo.area} />
        </div>

        <button
          onClick={downloadJson}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 font-black text-black transition hover:scale-[1.02]"
        >
          <Download size={18} />
          Descargar orden JSON
        </button>
      </section>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
          Orden técnica
        </p>

        <pre className="max-h-[520px] overflow-auto rounded-[1.5rem] bg-neutral-950 p-5 text-xs leading-5 text-neutral-100">
          {JSON.stringify(order, null, 2)}
        </pre>
      </section>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-3">
      <p className="text-neutral-500">{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
