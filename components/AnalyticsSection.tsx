"use client";

import { useState } from "react";
import { formatCOP } from "@/lib/utils";
import MaterialIcon from "./MaterialIcon";

type SalesData = {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
};

type ProductPerformance = {
  id: number;
  name: string;
  revenue: number;
  unitsSold: number;
  growth: number;
};

type CustomerSegment = {
  segment: string;
  count: number;
  revenue: number;
  avgOrderValue: number;
};

type AnalyticsSectionProps = {
  salesData: SalesData[];
  topProducts: ProductPerformance[];
  customerSegments: CustomerSegment[];
  timeRange: "week" | "month" | "quarter" | "year";
  onTimeRangeChange: (range: "week" | "month" | "quarter" | "year") => void;
  onShowAlert?: (title: string, message: React.ReactNode) => void;
};

const TIME_RANGE_OPTIONS = [
  { value: "week", label: "Última Semana" },
  { value: "month", label: "Último Mes" },
  { value: "quarter", label: "Último Trimestre" },
  { value: "year", label: "Último Año" },
];

const SEGMENT_COLORS = [
  "bg-primary",
  "bg-secondary",
  "bg-tertiary",
  "bg-error",
  "bg-surface-container-highest",
];

export default function AnalyticsSection({
  salesData,
  topProducts,
  customerSegments,
  timeRange,
  onTimeRangeChange,
  onShowAlert,
}: AnalyticsSectionProps) {
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "orders" | "customers">("revenue");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  // Calcular métricas principales
  const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0);
  const totalOrders = salesData.reduce((sum, data) => sum + data.orders, 0);
  const totalCustomers = salesData.reduce((sum, data) => sum + data.customers, 0);
  
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const revenueGrowth = salesData.length > 1 
    ? ((salesData[salesData.length - 1].revenue - salesData[0].revenue) / salesData[0].revenue) * 100
    : 0;

  // Encontrar el día con mayor ventas
  const peakDay = salesData.reduce((max, data) => 
    data.revenue > max.revenue ? data : max, 
    { date: "", revenue: 0, orders: 0, customers: 0 }
  );

  // Calcular métricas por segmento
  const segmentRevenue = customerSegments.reduce((sum, segment) => sum + segment.revenue, 0);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "revenue": return "Ingresos";
      case "orders": return "Pedidos";
      case "customers": return "Clientes";
      default: return metric;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
  };

  const getChartData = () => {
    return salesData.map(data => ({
      date: formatDate(data.date),
      value: data[selectedMetric],
    }));
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="space-y-xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Ingresos Totales
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {formatCOP(totalRevenue)}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="trending_up" />
            </div>
          </div>
          <p className="text-caption text-secondary flex items-center gap-unit">
            {revenueGrowth >= 0 ? (
              <span className="text-primary font-bold">↑ {revenueGrowth.toFixed(1)}%</span>
            ) : (
              <span className="text-error font-bold">↓ {Math.abs(revenueGrowth).toFixed(1)}%</span>
            )}{" "}
            vs período anterior
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Pedidos Totales
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {totalOrders}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="shopping_bag" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            {avgOrderValue > 0 ? formatCOP(avgOrderValue) : "$0"} por pedido
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Nuevos Clientes
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {totalCustomers}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="person_add" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            Tasa de crecimiento: +12.5%
          </p>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <div className="flex justify-between items-center mb-md">
            <div>
              <p className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Día Pico
              </p>
              <h3 className="font-headline-lg text-headline-lg mt-unit text-on-surface">
                {formatCOP(peakDay.revenue)}
              </h3>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg text-primary">
              <MaterialIcon name="star" />
            </div>
          </div>
          <p className="text-caption text-secondary">
            {formatDate(peakDay.date)} • {peakDay.orders} pedidos
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/10 overflow-hidden">
        <div className="p-lg border-b border-surface-variant/10 flex flex-col md:flex-row justify-between items-center gap-md">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Tendencias de Ventas
          </h2>
          
          <div className="flex flex-wrap gap-sm">
            <div className="flex rounded-lg overflow-hidden border border-outline">
              {TIME_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onTimeRangeChange(option.value as any)}
                  className={`px-sm py-xs text-caption transition-colors ${
                    timeRange === option.value
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-secondary hover:bg-surface-container-highest"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <div className="flex rounded-lg overflow-hidden border border-outline">
              {["revenue", "orders", "customers"].map((metric) => (
                <button
                  key={metric}
                  type="button"
                  onClick={() => setSelectedMetric(metric as any)}
                  className={`px-sm py-xs text-caption transition-colors ${
                    selectedMetric === metric
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-secondary hover:bg-surface-container-highest"
                  }`}
                >
                  {getMetricLabel(metric)}
                </button>
              ))}
            </div>
            
            <div className="flex rounded-lg overflow-hidden border border-outline">
              <button
                type="button"
                onClick={() => setViewMode("chart")}
                className={`px-sm py-xs text-caption transition-colors ${
                  viewMode === "chart"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-secondary hover:bg-surface-container-highest"
                }`}
              >
                <MaterialIcon name="bar_chart" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-sm py-xs text-caption transition-colors ${
                  viewMode === "table"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-secondary hover:bg-surface-container-highest"
                }`}
              >
                <MaterialIcon name="table_chart" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-lg">
          {viewMode === "chart" ? (
            <div className="space-y-md">
              <div className="flex justify-between items-end h-48">
                {chartData.map((data, index) => {
                  const height = (data.value / maxValue) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="text-caption text-secondary mb-xs">
                        {data.date}
                      </div>
                      <div className="relative w-full flex justify-center">
                        <div
                          className="w-3/4 bg-primary rounded-t-lg transition-all duration-300 hover:opacity-80"
                          style={{ height: `${height}%`, minHeight: "4px" }}
                          title={`${getMetricLabel(selectedMetric)}: ${
                            selectedMetric === "revenue" 
                              ? formatCOP(data.value)
                              : data.value.toLocaleString()
                          }`}
                        />
                      </div>
                      <div className="text-[10px] text-secondary mt-xs text-center">
                        {selectedMetric === "revenue" 
                          ? formatCOP(data.value).replace("$", "")
                          : data.value}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center text-secondary">
                <div className="text-caption">
                  <span className="font-bold text-primary">●</span> {getMetricLabel(selectedMetric)}
                </div>
                <div className="text-caption">
                  Período: {TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label}
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="p-md font-label-md text-label-md text-secondary">
                      Fecha
                    </th>
                    <th className="p-md font-label-md text-label-md text-secondary">
                      Ingresos
                    </th>
                    <th className="p-md font-label-md text-label-md text-secondary">
                      Pedidos
                    </th>
                    <th className="p-md font-label-md text-label-md text-secondary">
                      Clientes
                    </th>
                    <th className="p-md font-label-md text-label-md text-secondary">
                      Valor Promedio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10">
                  {salesData.map((data, index) => (
                    <tr key={index} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-md font-body-md text-on-surface">
                        {formatDate(data.date)}
                      </td>
                      <td className="p-md font-body-md text-on-surface">
                        {formatCOP(data.revenue)}
                      </td>
                      <td className="p-md font-body-md text-on-surface">
                        {data.orders}
                      </td>
                      <td className="p-md font-body-md text-on-surface">
                        {data.customers}
                      </td>
                      <td className="p-md font-body-md text-on-surface">
                        {data.orders > 0 ? formatCOP(data.revenue / data.orders) : "$0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">
            Productos Más Rentables
          </h3>
          
          <div className="space-y-md">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-md border border-surface-variant/10 rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-md flex-1">
                  <span className="text-primary font-bold w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-on-surface truncate">
                      {product.name}
                    </p>
                    <p className="text-caption text-secondary">
                      {product.unitsSold} unidades vendidas
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-body-md text-primary">
                    {formatCOP(product.revenue)}
                  </p>
                  <p className={`text-caption ${product.growth >= 0 ? "text-primary" : "text-error"}`}>
                    {product.growth >= 0 ? "↑" : "↓"} {Math.abs(product.growth).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            className="w-full mt-lg py-sm border border-surface-variant/20 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-all text-center"
            onClick={() => {
              if (onShowAlert) onShowAlert("En Desarrollo", "Ver análisis completo de productos");
              else alert("Ver análisis completo de productos");
            }}
          >
            Ver Análisis Completo de Productos
          </button>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-variant/10">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">
            Segmentación de Clientes
          </h3>
          
          <div className="space-y-md">
            {customerSegments.map((segment, index) => {
              const percentage = segmentRevenue > 0 ? (segment.revenue / segmentRevenue) * 100 : 0;
              
              return (
                <div key={segment.segment} className="space-y-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-sm">
                      <div 
                        className={`w-3 h-3 rounded-full ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`}
                      />
                      <span className="text-caption text-secondary">{segment.segment}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-caption font-bold">{segment.count} clientes</span>
                      <span className="text-caption text-secondary ml-sm">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-surface-variant h-1 rounded-full">
                    <div
                      className={`h-1 rounded-full ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-caption text-secondary">
                    <span>Ingresos: {formatCOP(segment.revenue)}</span>
                    <span>Valor promedio: {formatCOP(segment.avgOrderValue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-lg pt-lg border-t border-surface-variant/20">
            <button
              type="button"
              className="w-full py-sm bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-container transition-colors text-center mb-sm"
              onClick={() => {
                if (onShowAlert) onShowAlert("Marketing", "Crear campaña segmentada");
                else alert("Crear campaña segmentada");
              }}
            >
              Crear Campaña Segmentada
            </button>
            <button
              type="button"
              className="w-full py-sm border border-primary text-primary rounded-lg font-label-md hover:bg-primary hover:text-on-primary transition-colors text-center"
              onClick={() => {
                if (onShowAlert) onShowAlert("En Desarrollo", "Exportar datos de segmentación");
                else alert("Exportar datos de segmentación");
              }}
            >
              Exportar Datos de Segmentación
            </button>
          </div>
        </div>
      </div>

      <div className="bg-primary-container p-lg rounded-xl text-on-primary-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div>
            <h3 className="font-headline-md text-headline-md mb-md">
              Insights de Rendimiento
            </h3>
            <p className="text-body-md opacity-90">
              Basado en el análisis de datos del período seleccionado
            </p>
          </div>
          
          <div className="space-y-sm">
            <div className="flex items-center gap-sm">
              <MaterialIcon name="trending_up" className="text-on-primary-container" />
              <div>
                <p className="font-label-md">Crecimiento de Ingresos</p>
                <p className="text-caption opacity-80">
                  {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}% vs período anterior
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-sm">
              <MaterialIcon name="people" className="text-on-primary-container" />
              <div>
                <p className="font-label-md">Adquisición de Clientes</p>
                <p className="text-caption opacity-80">
                  Tasa de crecimiento: +12.5%
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-sm">
            <div className="flex items-center gap-sm">
              <MaterialIcon name="star" className="text-on-primary-container" />
              <div>
                <p className="font-label-md">Producto Estrella</p>
                <p className="text-caption opacity-80">
                  {topProducts[0]?.name || "N/A"} - {formatCOP(topProducts[0]?.revenue || 0)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-sm">
              <MaterialIcon name="schedule" className="text-on-primary-container" />
              <div>
                <p className="font-label-md">Mejor Momento</p>
                <p className="text-caption opacity-80">
                  {formatDate(peakDay.date)} - {formatCOP(peakDay.revenue)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <button
          type="button"
          className="w-full mt-lg py-sm bg-on-primary-container text-primary-container rounded-lg font-label-md hover:opacity-90 transition-opacity text-center"
          onClick={() => {
            if (onShowAlert) onShowAlert("Reportes", "Generar reporte ejecutivo");
            else alert("Generar reporte ejecutivo");
          }}
        >
          <MaterialIcon name="description" className="inline mr-sm" />
          Generar Reporte Ejecutivo PDF
        </button>
      </div>
    </div>
  );
}