"use server";

import { prisma } from "../prisma";

export interface MonthlyStockData {
    month: string;
    stockIn: number;
    stockOut: number;
}

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

/**
 * Fetches monthly stock in and stock out data for a given user and year.
 * Aggregates completed StockInTransactions and all StockOutTransactions by month.
 */
export async function getMonthlyStockActivity(
    userId: string,
    year: number
): Promise<MonthlyStockData[]> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    // Fetch aggregated stock in transactions (only COMPLETED status)
    const stockInData = await prisma.stockInTransaction.groupBy({
        by: ["transactionDate"],
        where: {
            userId,
            status: "COMPLETED",
            transactionDate: {
                gte: startOfYear,
                lt: endOfYear,
            },
        },
        _sum: {
            quantity: true,
        },
    });

    // Fetch aggregated stock out transactions
    const stockOutData = await prisma.stockOutTransaction.groupBy({
        by: ["transactionDate"],
        where: {
            userId,
            transactionDate: {
                gte: startOfYear,
                lt: endOfYear,
            },
        },
        _sum: {
            quantity: true,
        },
    });

    // Initialize monthly totals
    const monthlyTotals: Record<number, { stockIn: number; stockOut: number }> = {};
    for (let i = 0; i < 12; i++) {
        monthlyTotals[i] = { stockIn: 0, stockOut: 0 };
    }

    // Aggregate stock in by month
    for (const record of stockInData) {
        const month = record.transactionDate.getMonth();
        monthlyTotals[month].stockIn += record._sum.quantity ?? 0;
    }

    // Aggregate stock out by month
    for (const record of stockOutData) {
        const month = record.transactionDate.getMonth();
        monthlyTotals[month].stockOut += record._sum.quantity ?? 0;
    }

    // Convert to array format
    return MONTH_NAMES.map((month, index) => ({
        month,
        stockIn: monthlyTotals[index].stockIn,
        stockOut: monthlyTotals[index].stockOut,
    }));
}

/**
 * Returns the available years that have transaction data for a user.
 * Includes current year and future years up to +3 years.
 */
export async function getAvailableTransactionYears(userId: string): Promise<number[]> {
    const currentYear = new Date().getFullYear();

    // Get distinct years from stock in transactions
    const stockInYears = await prisma.stockInTransaction.findMany({
        where: { userId },
        select: { transactionDate: true },
        distinct: ["transactionDate"],
    });

    // Get distinct years from stock out transactions
    const stockOutYears = await prisma.stockOutTransaction.findMany({
        where: { userId },
        select: { transactionDate: true },
        distinct: ["transactionDate"],
    });

    const yearsSet = new Set<number>();

    // Always include current year and future years (+3 years)
    for (let i = 0; i <= 3; i++) {
        yearsSet.add(currentYear + i);
    }

    for (const record of stockInYears) {
        yearsSet.add(record.transactionDate.getFullYear());
    }

    for (const record of stockOutYears) {
        yearsSet.add(record.transactionDate.getFullYear());
    }

    // Sort years in ascending order
    return Array.from(yearsSet).sort((a, b) => a - b);
}
