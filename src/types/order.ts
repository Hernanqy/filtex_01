export type Product = {
  id: string;
  name: string;
  line: string;
  sku: string;
  material: string;
  sizes: string[];
  colors: string[];
};

export type ClientData = {
  company: string;
  contact: string;
  whatsapp: string;
  email: string;
  notes: string;
};

export type OrderCombo = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
};

export type LogoPlacement = {
  fileName: string;
  imageUrl: string;
  technique: "Bordado" | "Estampa" | "DTF" | "Serigrafía";
  area: "Delantera" | "Espalda" | "Manga";
  x: number;
  y: number;
  scale: number;
  rotation: number;
};
