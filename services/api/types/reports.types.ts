// ==================== Reports Types ====================

export interface RevenueByClient {
  clientId: string;
  clientName: string;
  clientEmail?: string;
  totalRevenue: string;
  invoiceCount: number;
  averageInvoiceAmount: string;
  currency: string;
}

export interface RevenueByMonth {
  month: number;
  year: number;
  revenue: string;
  invoiceCount: number;
  currency: string;
}

export interface RevenueByProduct {
  productId?: string;
  productName?: string;
  description: string;
  totalRevenue: string;
  quantitySold: string;
  invoiceCount: number;
  currency: string;
}

export interface TopClient {
  clientId: string;
  clientName: string;
  clientEmail?: string;
  totalRevenue: string;
  invoiceCount: number;
  lastInvoiceDate?: string;
  currency: string;
}

export interface RevenueEvolutionData {
  month: number;
  year: number;
  revenue: string;
  invoiceCount: number;
  growthRate?: string;
}

export interface RevenueEvolution {
  data: RevenueEvolutionData[];
  averageRevenue: string;
  totalRevenue: string;
  growthTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface RevenueForecastMonth {
  month: number;
  year: number;
  forecastedRevenue: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RevenueForecast {
  forecastMonths: RevenueForecastMonth[];
  averageMonthlyRevenue: string;
  projectedAnnualRevenue: string;
  currency: string;
}

export interface ReportsQueryParams {
  month?: number;
  year?: number;
  months?: number;
  groupBy?: 'client' | 'product' | 'month';
  limit?: number;
}
