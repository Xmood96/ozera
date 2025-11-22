import React from "react";
import { Product, CartItem } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="product-card bg-base-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <div className="product-image relative h-64 bg-base-300 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="product-content p-5">
        <h3 className="product-name text-lg font-bold text-base-content mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="product-description text-sm text-base-content opacity-75 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="product-footer flex items-center justify-between">
          <span className="product-price text-2xl font-bold text-primary">
            {product.price} ج.م
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="btn-add-to-cart btn btn-sm btn-primary rounded-lg"
            aria-label={`إضافة ${product.name} إلى السلة`}
          >
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
