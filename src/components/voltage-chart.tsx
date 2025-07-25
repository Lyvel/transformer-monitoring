"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { Transformer } from "@/types/transformer.type";
import { TrendingUp } from "lucide-react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type ComponentProps = {
    transformers: Transformer[];
    selectedTransformers: number[];
    onSelectionChange: (transformerIds: number[]) => void;
};

const COLOURS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff00",
    "#ff00ff",
    "#00ffff",
    "#ff0000",
];

export const VoltageChart = ({
    transformers,
    selectedTransformers,
    onSelectionChange,
}: ComponentProps) => {
    const chartData = useMemo(() => {
        // Get all unique timestamps and sort them
        const allTimestamps = new Set<string>();
        transformers.forEach((transformer) => {
            transformer.lastTenVoltgageReadings.forEach((reading) => {
                allTimestamps.add(reading.timestamp);
            });
        });

        const sortedTimestamps = Array.from(allTimestamps).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        // Create chart data structure
        return sortedTimestamps.map((timestamp) => {
            const dataPoint: {
                timestamp: string;
                fullTimestamp: string;
                [key: string]: number | string | undefined;
            } = {
                timestamp: new Date(timestamp).toLocaleDateString("en-GB", {
                    month: "short",
                    day: "numeric",
                }),
                fullTimestamp: timestamp,
            };

            transformers.forEach((transformer) => {
                const reading = transformer.lastTenVoltgageReadings.find(
                    (r) => r.timestamp === timestamp
                );
                dataPoint[transformer.name] = reading
                    ? parseInt(reading.voltage)
                    : undefined;
            });

            return dataPoint;
        });
    }, [transformers]);

    const handleTransformerToggle = (
        transformerId: number,
        checked: boolean
    ) => {
        if (checked) {
            onSelectionChange([...selectedTransformers, transformerId]);
        } else {
            onSelectionChange(
                selectedTransformers.filter((id) => id !== transformerId)
            );
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(transformers.map((t) => t.assetId));
        } else {
            onSelectionChange([]);
        }
    };

    // Calculate if all transformers are selected
    const allSelected =
        transformers.length > 0 &&
        selectedTransformers.length === transformers.length;

    // Calculate if some but not all transformers are selected
    const someSelected =
        selectedTransformers.length > 0 &&
        selectedTransformers.length < transformers.length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Voltage Readings Over Time
                </CardTitle>
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="select-all"
                            checked={
                                allSelected
                                    ? true
                                    : someSelected
                                    ? "indeterminate"
                                    : false
                            }
                            onCheckedChange={handleSelectAll}
                        />
                        <label
                            htmlFor="select-all"
                            className="text-sm font-medium"
                        >
                            Select All Transformers
                        </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {transformers.map((transformer, index) => (
                            <div
                                key={transformer.assetId}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={`transformer-${transformer.assetId}`}
                                    checked={selectedTransformers.includes(
                                        transformer.assetId
                                    )}
                                    onCheckedChange={(checked) =>
                                        handleTransformerToggle(
                                            transformer.assetId,
                                            checked as boolean
                                        )
                                    }
                                />
                                <label
                                    htmlFor={`transformer-${transformer.assetId}`}
                                    className="text-sm font-medium flex items-center gap-2"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                COLOURS[index % COLOURS.length],
                                        }}
                                    />
                                    {transformer.name}
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {transformer.health}
                                    </Badge>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {selectedTransformers.length === 0 ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                No Transformers Selected
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Select transformers above to view their voltage
                                readings over time
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    label={{
                                        value: "Voltage (V)",
                                        angle: -90,
                                        position: "insideLeft",
                                    }}
                                />
                                <Tooltip
                                    labelFormatter={(value, payload) => {
                                        if (payload && payload[0]) {
                                            const fullTimestamp =
                                                payload[0].payload
                                                    .fullTimestamp;
                                            return new Date(
                                                fullTimestamp
                                            ).toLocaleString("en-GB");
                                        }
                                        return value;
                                    }}
                                    formatter={(value, name) => [
                                        value !== undefined
                                            ? `${value.toLocaleString()} V`
                                            : "No data",
                                        name,
                                    ]}
                                />
                                <Legend />
                                {transformers.map((transformer, index) => (
                                    <Line
                                        key={transformer.assetId}
                                        type="monotone"
                                        dataKey={transformer.name}
                                        stroke={COLOURS[index % COLOURS.length]}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        connectNulls={true}
                                        hide={
                                            !selectedTransformers.includes(
                                                transformer.assetId
                                            )
                                        }
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
