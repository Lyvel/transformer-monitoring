"use client";

import { DataSourceSelector } from "@/components/data-source-selector";
import { StatCard } from "@/components/stat-card";
import { TransformerTable } from "@/components/transformer-table";
import { VoltageChart } from "@/components/voltage-chart";
import { useAppState } from "@/hooks/use-app-state.hook";
import { Transformer } from "@/types/transformer.type";
import { Activity, AlertTriangle, MapPin, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const Home = () => {
    const [transformers, setTransformers] = useState<Transformer[]>([]);
    const [showDataSourceSelector, setShowDataSourceSelector] = useState(true);
    const [hasInitialisedSelection, setHasInitialisedSelection] =
        useState(false);
    const { state, updateState, isLoaded } = useAppState();

    const handleDataLoad = (data: Transformer[]) => {
        setTransformers(data);
        // Reset selected transformers when new data is loaded
        updateState({ selectedTransformers: data.map((t) => t.assetId) });
        // Mark that we've initialised the selection for this dataset
        setHasInitialisedSelection(true);
        // Hide data source selector after loading data
        setShowDataSourceSelector(false);
    };

    // Load sample data automatically when sample data source is selected
    useEffect(() => {
        if (
            isLoaded &&
            state.dataSource === "sample" &&
            transformers.length === 0
        ) {
            fetch("/sampledata.json")
                .then((response) => response.json())
                .then((data: Transformer[]) => {
                    setTransformers(data);
                    // Reset selected transformers when new data is loaded
                    updateState({
                        selectedTransformers: data.map((t) => t.assetId),
                    });
                    // Mark that we've initialized the selection for this dataset
                    setHasInitialisedSelection(true);
                })
                .catch((error) => {
                    console.error("Failed to load sample data:", error);
                });
        }
    }, [isLoaded, state.dataSource, transformers.length, updateState]);

    // Initialise selected transformers if none are selected (only once per dataset)
    useEffect(() => {
        if (isLoaded && transformers.length > 0 && !hasInitialisedSelection) {
            updateState({
                selectedTransformers: transformers.map((t) => t.assetId),
            });
            setHasInitialisedSelection(true);
        }
    }, [isLoaded, transformers.length, hasInitialisedSelection, updateState]);

    const stats = {
        total: transformers.length,
        critical: transformers.filter((t) => t.health === "Critical").length,
        regions: new Set(transformers.map((t) => t.region)).size,
        avgVoltage: Math.round(
            transformers.reduce((sum, t) => {
                const latestReading = t.lastTenVoltgageReadings[0];
                return (
                    sum + (latestReading ? parseInt(latestReading.voltage) : 0)
                );
            }, 0) / transformers.length
        ),
    };

    // Show loading spinner while app is initialising
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Initialising application...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Transformer Asset Monitor
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Real-time monitoring and analysis of electrical
                        transformer assets
                    </p>
                </div>

                {/* Data source selector */}
                <DataSourceSelector
                    onDataLoad={(data: Transformer[]) => {
                        handleDataLoad(data);
                        updateState({ dataSource: "uploaded" });
                    }}
                    currentDataSource={
                        state.dataSource as "sample" | "uploaded"
                    }
                    isVisible={showDataSourceSelector}
                    onToggleVisibility={() =>
                        setShowDataSourceSelector(!showDataSourceSelector)
                    }
                />

                {/* Stats */}
                {transformers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Assets"
                            icon={
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            }
                            value={stats.total}
                            description="Active transformers"
                        />
                        <StatCard
                            title="Critical Status"
                            icon={
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                            }
                            value={stats.critical}
                            description="Require immediate attention"
                        />
                        <StatCard
                            title="Regions"
                            icon={
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                            }
                            value={stats.regions}
                            description="Geographic coverage"
                        />
                        <StatCard
                            title="Avg Voltage"
                            icon={
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            }
                            value={stats.avgVoltage.toLocaleString()}
                            description="Volts (latest readings)"
                        />
                    </div>
                )}

                {/* Main Content */}
                {transformers.length > 0 && (
                    <div className="space-y-8">
                        <TransformerTable
                            transformers={transformers}
                            searchTerm={state.searchTerm}
                            regionFilter={state.regionFilter}
                            healthFilter={state.healthFilter}
                            onSearchChange={(value) =>
                                updateState({ searchTerm: value })
                            }
                            onRegionFilterChange={(value) =>
                                updateState({
                                    regionFilter: value === "all" ? "" : value,
                                })
                            }
                            onHealthFilterChange={(value) =>
                                updateState({
                                    healthFilter: value === "all" ? "" : value,
                                })
                            }
                        />
                        <VoltageChart
                            transformers={transformers}
                            selectedTransformers={state.selectedTransformers}
                            onSelectionChange={(value) =>
                                updateState({ selectedTransformers: value })
                            }
                        />
                    </div>
                )}
                <footer className="mt-16 text-center text-sm text-muted-foreground">
                    <p>
                        Transformer Asset Monitoring System - Built with
                        Next.js, shadcn/ui, and Recharts by{" "}
                        <a
                            href="https://dawidmleczko.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Dawid Mleczko
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Home;
