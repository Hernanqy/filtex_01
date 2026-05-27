import { Plus, Trash2 } from "lucide-react";
import type { OrderCombo, Product } from "../types/order";
import { useState } from "react";

type QuantityMatrixProps = {
  product: Product;
  combos: OrderCombo[];
  setCombos: React.Dispatch<React.SetStateAction<OrderCombo[]>>;
};

export function QuantityMatrix({ product, combos, setCombos }: QuantityMatrixProps) {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(10);

  function addCombo() {
    if (quantity < 1) return;

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

  function removeCombo(id: string) {
    setCombos((current) => current.filter((combo) => combo.id !== id));
  }

  const total = combos.reduce((sum, combo) => sum + combo.quantity, 0);

  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
            Producto seleccionado
          </p>
          <h3 className="mt-1 text-2xl font-black tracking-[-0.05em]">{product.name}</h3>
          <p className="mt-1 text-sm text-neutral-500">SKU {product.sku}</p>
        </div>

        <div className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">
          Total: {total} u.
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
        <label className="grid gap-2 text-sm font-bold">
          Color
          <select
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 outline-none focus:border-black"
          >
            {product.colors.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Talle
          <select
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 outline-none focus:border-black"
          >
            {product.sizes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Cantidad
          <input
            value={quantity}
            min={1}
            type="number"
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 outline-none focus:border-black"
          />
        </label>

        <button
          onClick={addCombo}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 font-black text-white transition hover:scale-[1.02]"
        >
          <Plus size={18} />
          Agregar
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        {combos.length === 0 && (
          <div className="rounded-3xl bg-neutral-100 p-5 text-sm font-medium text-neutral-500">
            Todavía no agregaste combinaciones. Podés cargar, por ejemplo, 20 remeras negras talle M,
            15 talle L y 15 blancas talle S.
          </div>
        )}

        {combos.map((combo) => (
          <div
            key={combo.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white p-4"
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
              onClick={() => removeCombo(combo.id)}
              className="grid size-10 place-items-center rounded-full bg-neutral-100 text-black transition hover:bg-black hover:text-white"
              aria-label="Quitar combinación"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
