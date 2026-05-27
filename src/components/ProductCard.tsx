import type { Product } from "../types/order";
import { Check } from "lucide-react";

type ProductCardProps = {
  product: Product;
  active: boolean;
  onSelect: () => void;
};

export function ProductCard({ product, active, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`group relative rounded-[2rem] border p-4 text-left transition-all duration-300 ${
        active
          ? "border-black bg-black text-white shadow-2xl"
          : "border-neutral-200 bg-white text-black hover:-translate-y-1 hover:border-black hover:shadow-xl"
      }`}
    >
      {active && (
        <div className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white text-black">
          <Check size={17} strokeWidth={3} />
        </div>
      )}

      <div
        className={`mb-5 h-36 overflow-hidden rounded-[1.5rem] ${
          active ? "bg-neutral-800" : "bg-neutral-100"
        }`}
      >
        <div className="flex h-full items-center justify-center">
          <div
            className={`relative h-24 w-20 rounded-b-2xl rounded-t-[2rem] ${
              active ? "bg-white" : "bg-black"
            }`}
          >
            <div
              className={`absolute -left-6 top-5 h-14 w-9 rotate-12 rounded-2xl ${
                active ? "bg-white" : "bg-black"
              }`}
            />
            <div
              className={`absolute -right-6 top-5 h-14 w-9 -rotate-12 rounded-2xl ${
                active ? "bg-white" : "bg-black"
              }`}
            />
          </div>
        </div>
      </div>

      <p className={`mb-2 text-xs font-black uppercase tracking-[0.18em] ${active ? "text-neutral-300" : "text-neutral-500"}`}>
        {product.line}
      </p>
      <h3 className="mb-1 text-xl font-black tracking-[-0.04em]">{product.name}</h3>
      <p className={`text-sm ${active ? "text-neutral-300" : "text-neutral-500"}`}>
        SKU {product.sku}
      </p>
      <p className={`mt-3 text-sm leading-5 ${active ? "text-neutral-300" : "text-neutral-500"}`}>
        {product.material}
      </p>
    </button>
  );
}
