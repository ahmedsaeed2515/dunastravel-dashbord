"use client";

import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartWrapperProps {
  data: any[];
  config: any;
  title: string;
  description?: string;
  type?: "area" | "bar" | "pie";
  dataKey: string;
  nameKey?: string;
  height?: number;
}

export function ChartWrapper({ data, config, title, description, type = "area", dataKey, nameKey = "name", height = 300 }: ChartWrapperProps) {
  const chartContent = useMemo(() => {
    switch (type) {
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey={nameKey} tickLine={false} axisLine={false} tickMargin={10} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {Object.keys(config).map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={config[key].color}
                fill={config[key].color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey={nameKey} tickLine={false} axisLine={false} tickMargin={10} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {Object.keys(config).map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={config[key].color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={config[entry[nameKey]]?.color || "hsl(var(--primary))"} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  }, [data, config, type, dataKey, nameKey]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ChartContainer config={config} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartContent}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
