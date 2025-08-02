import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UsageChartProps, ChartDataSeries } from "./types";
import type { TimeRangeFilter } from "./types";

/**
 * UsageChart component displays time-based usage data in various chart formats
 * 
 * @param title - The title of the chart
 * @param data - The chart data series
 * @param type - The type of chart (line, bar, area)
 * @param height - The height of the chart in pixels
 * @param loading - Whether the chart is in loading state
 * @param className - Additional CSS classes
 * @param onTimeRangeChange - Callback for time range changes
 * @param timeRange - Current selected time range
 * @param showLegend - Whether to show the legend
 * @param showGrid - Whether to show the grid
 * @param showTooltip - Whether to show tooltips
 * @param currency - Currency code for formatting
 */
export function UsageChart({
  title,
  data,
  type = "line",
  height = 300,
  loading = false,
  className,
  onTimeRangeChange,
  timeRange,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  currency = "USD",
}: UsageChartProps) {
  const formatValue = (value: number) => {
    if (currency) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMaxValue = () => {
    let max = 0;
    data.forEach((series) => {
      series.data.forEach((point) => {
        if (point.value > max) max = point.value;
      });
    });
    return max;
  };

  const getMinValue = () => {
    let min = Infinity;
    data.forEach((series) => {
      series.data.forEach((point) => {
        if (point.value < min) min = point.value;
      });
    });
    return min === Infinity ? 0 : min;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <div className="flex justify-center space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex h-[200px] items-center justify-center text-muted-foreground">
          No data available
        </div>
      );
    }

    const maxValue = getMaxValue();
    const minValue = getMinValue();
    const valueRange = maxValue - minValue;
    const chartHeight = height - 40; // Account for labels

    // Get all unique dates from all series
    const allDates = Array.from(
      new Set(data.flatMap((series) => series.data.map((point) => point.date)))
    ).sort();

    return (
      <div className="space-y-4">
        <div className="relative" style={{ height: `${height}px` }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs text-muted-foreground">
            <span>{formatValue(maxValue)}</span>
            <span>{formatValue(minValue + valueRange / 2)}</span>
            <span>{formatValue(minValue)}</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 h-full">
            {/* Grid lines */}
            {showGrid && (
              <div className="absolute inset-0 ml-8">
                <div className="h-full border-r border-border" />
                <div className="absolute top-1/2 h-px w-full border-t border-border" />
                <div className="absolute bottom-0 h-px w-full border-t border-border" />
              </div>
            )}

            {/* Chart content */}
            <div className="relative h-full">
              {data.map((series, seriesIndex) => (
                <div key={series.name} className="absolute inset-0">
                  {series.data.map((point, pointIndex) => {
                    const xPosition = (pointIndex / (series.data.length - 1)) * 100;
                    const yPosition = ((maxValue - point.value) / valueRange) * 100;
                    
                    return (
                      <React.Fragment key={`${series.name}-${point.date}`}>
                        {/* Line/Area */}
                        {type !== "bar" && pointIndex > 0 && (
                          <div
                            className={cn(
                              "absolute h-px bg-current",
                              type === "area" && "opacity-20"
                            )}
                            style={{
                              left: `${((pointIndex - 1) / (series.data.length - 1)) * 100}%`,
                              top: `${((maxValue - series.data[pointIndex - 1].value) / valueRange) * 100}%`,
                              width: `${xPosition - ((pointIndex - 1) / (series.data.length - 1)) * 100}%`,
                              transform: `rotate(${Math.atan2(
                                ((maxValue - point.value) / valueRange) * 100 - ((maxValue - series.data[pointIndex - 1].value) / valueRange) * 100,
                                xPosition - ((pointIndex - 1) / (series.data.length - 1)) * 100
                              ) * (180 / Math.PI)}deg)`,
                              transformOrigin: "left center",
                              color: series.color || `hsl(${seriesIndex * 60}, 70%, 50%)`,
                            }}
                          />
                        )}
                        
                        {/* Bar */}
                        {type === "bar" && (
                          <div
                            className="absolute bottom-0 bg-current opacity-70"
                            style={{
                              left: `${xPosition - 2}%`,
                              top: `${yPosition}%`,
                              width: "4%",
                              color: series.color || `hsl(${seriesIndex * 60}, 70%, 50%)`,
                            }}
                          />
                        )}
                        
                        {/* Data point */}
                        <div
                          className={cn(
                            "absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background",
                            showTooltip && "cursor-pointer hover:scale-110 transition-transform"
                          )}
                          style={{
                            left: `${xPosition}%`,
                            top: `${yPosition}%`,
                            backgroundColor: series.color || `hsl(${seriesIndex * 60}, 70%, 50%)`,
                          }}
                          title={`${series.name}: ${formatValue(point.value)}`}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-muted-foreground">
              {allDates.map((date, index) => (
                <span key={date}>{formatDate(date)}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-wrap justify-center gap-4">
            {data.map((series, index) => (
              <div key={series.name} className="flex items-center space-x-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: series.color || `hsl(${index * 60}, 70%, 50%)` }}
                />
                <span className="text-sm">{series.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {timeRange && onTimeRangeChange && (
          <div className="flex space-x-1">
            {["7d", "30d", "90d"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeRangeChange(range)}
                className="h-8 px-3"
              >
                {range}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}

/**
 * TimeRangeFilter component for selecting time ranges
 */
export interface TimeRangeFilterProps {
  filters: TimeRangeFilter[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
  className?: string;
}

export function TimeRangeFilter({
  filters,
  selectedRange,
  onRangeChange,
  className,
}: TimeRangeFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedRange === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onRangeChange(filter.value)}
          className="h-8 px-3"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * ChartLegend component for displaying chart legends
 */
export interface ChartLegendProps {
  series: ChartDataSeries[];
  className?: string;
}

export function ChartLegend({ series, className }: ChartLegendProps) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-4", className)}>
      {series.map((item, index) => (
        <div key={item.name} className="flex items-center space-x-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
          />
          <span className="text-sm">{item.name}</span>
        </div>
      ))}
    </div>
  );
}