import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactNode;
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

/* ✅ FIX PRINCIPAL AQUI */
function ChartTooltipContent(props: any) {
  const {
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
  } = props;

  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;

    const [item] = payload;

    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = config[key];

    const value =
      typeof label === "string"
        ? config[label]?.label || label
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) return null;

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    payload,
    hideLabel,
    label,
    labelFormatter,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "bg-background border rounded-lg p-2 text-xs shadow-xl",
        className
      )}
    >
      {!hideLabel ? tooltipLabel : null}

      <div className="grid gap-1">
        {payload.map((item: any, index: number) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = config[key];

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-2"
            >
              {!hideIndicator && (
                <span
                  className="h-2 w-2 rounded"
                  style={{ background: item.color || color }}
                />
              )}

              <span className="text-muted-foreground">
                {itemConfig?.label || item.name}
              </span>

              <span className="font-mono">
                {item.value?.toLocaleString?.() ?? item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({ payload }: any) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div className="flex gap-4 justify-center pt-2">
      {payload.map((item: any, index: number) => {
        const key = item.dataKey;
        const itemConfig = config[key];

        return (
          <div key={index} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded"
              style={{ background: item.color }}
            />
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

function ChartTooltipContentWrapper() {
  return ChartTooltipContent as any;
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  return config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};