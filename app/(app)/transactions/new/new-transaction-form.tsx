"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import PriceInput from "@/components/price-input";
import { createTransaction } from "@/lib/actions/transactions";
import type { SupplierOption } from "@/types/supplier";

type ProductOption = {
    id: string;
    name: string;
    price: number;
    unit: string;
};

const PAYMENT_METHOD_OPTIONS = [
    { value: "CASH", label: "Cash" },
    { value: "TRANSFER", label: "Transfer" },
    { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pending" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
];

export function NewTransactionForm({
    products,
    suppliers,
    defaultDate,
    hasProducts,
}: {
    products: ProductOption[];
    suppliers: SupplierOption[];
    defaultDate: string;
    hasProducts: boolean;
}) {
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [, startTransition] = useTransition();

    const selectedProduct = useMemo(
        () => products.find((p) => p.id === productId),
        [products, productId],
    );
    const unitPrice = selectedProduct?.price ?? 0;
    const quantityValue = useMemo(() => {
        const parsed = Number.parseInt(quantity || "0", 10);
        if (Number.isNaN(parsed) || parsed < 0) return 0;
        return parsed;
    }, [quantity]);
    const totalPrice = useMemo(() => {
        if (!selectedProduct) return 0;
        return Math.max(0, selectedProduct.price * quantityValue);
    }, [selectedProduct, quantityValue]);

    const handleQuantityChange = useCallback((value: string) => {
        if (value === "") {
            setQuantity("");
            return;
        }
        if (/^\d+$/.test(value)) {
            setQuantity(value.replace(/^0+(?=\d)/, "") || "0");
        }
    }, []);

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            await createTransaction(formData);
        });
    };

    return (
        <form className="space-y-6" action={handleSubmit}>
            <div className="space-y-2">
                <label htmlFor="transactionName" className="text-sm font-medium text-gray-700">
                    Transaction Name *
                </label>
                <input
                    type="text"
                    id="transactionName"
                    name="transactionName"
                    required
                    placeholder="Enter transaction name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    disabled={!hasProducts}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="productId" className="text-sm font-medium text-gray-700">
                        Product *
                    </label>
                    <select
                        id="productId"
                        name="productId"
                        required
                        defaultValue=""
                        disabled={!hasProducts}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                        onChange={(e) => setProductId(e.target.value)}
                    >
                        <option value="" disabled>
                            Select product
                        </option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="supplierId" className="text-sm font-medium text-gray-700">
                        Supplier
                    </label>
                    <select
                        id="supplierId"
                        name="supplierId"
                        defaultValue=""
                        disabled={!hasProducts}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    >
                        <option value="">No supplier</option>
                        {suppliers.map((supplier: SupplierOption) => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                        Quantity *
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        required
                        min={0}
                        placeholder="0"
                        disabled={!hasProducts}
                        inputMode="numeric"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="no-spinner w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Unit Price (Rp)
                    </label>
                    <PriceInput
                        min={0}
                        readOnly
                        disabled
                        value={Math.round(unitPrice)}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="totalAmount" className="text-sm font-medium text-gray-700">
                    Total Price (Rp) *
                </label>
                <PriceInput
                    id="totalAmount"
                    name="totalAmount"
                    min={0}
                    required
                    placeholder="0"
                    value={Number.isFinite(totalPrice) ? Math.round(totalPrice) : 0}
                    readOnly
                    className="w-full"
                    disabled={!hasProducts}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="transactionDate" className="text-sm font-medium text-gray-700">
                        Transaction Date *
                    </label>
                    <input
                        type="datetime-local"
                        id="transactionDate"
                        name="transactionDate"
                        required
                        defaultValue={defaultDate}
                        disabled={!hasProducts}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                        Payment Method *
                    </label>
                    <select
                        id="paymentMethod"
                        name="paymentMethod"
                        required
                        defaultValue="CASH"
                        disabled={!hasProducts}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    >
                        {PAYMENT_METHOD_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status *
                </label>
                <select
                    id="status"
                    name="status"
                    required
                    defaultValue="COMPLETED"
                    disabled={!hasProducts}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap gap-4">
                <button
                    type="submit"
                    disabled={!hasProducts}
                    className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    + Add transaction
                </button>
                <Link
                    href="/transactions"
                    className="rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow hover:bg-gray-300"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
