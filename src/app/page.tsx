"use client";

import { useAppState } from "@/hooks/use-app-state.hook";
import { Transformer } from "@/types/transformer.type";
import { useEffect, useState } from "react";

const Home = () => {
    const [transformers, setTransformers] = useState<Transformer[]>([]);
    const [showDataSourceSelector, setShowDataSourceSelector] = useState(true);
    const { state, updateState, isLoaded } = useAppState();

    const handleDataLoad = (data: Transformer[]) => {
        setTransformers(data);
        // Reset selected transformers when new data is loaded
        updateState({ selectedTransformers: data.map((t) => t.assetId) });
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
                .then((data) => {
                    handleDataLoad(data);
                })
                .catch((error) => {
                    console.error("Failed to load sample data:", error);
                });
        }
    }, [isLoaded, state.dataSource, transformers.length, updateState]);

    // Initialise selected transformers if none are selected
    useEffect(() => {
        if (
            isLoaded &&
            transformers.length > 0 &&
            state.selectedTransformers.length === 0
        ) {
            updateState({
                selectedTransformers: transformers.map((t) => t.assetId),
            });
        }
    }, [
        isLoaded,
        transformers,
        state.selectedTransformers.length,
        updateState,
    ]);

    const stats = {
        total: transformers.length,
        critical: transformers.filter((t) => t.health === "Critical").length,
        regions: new Set(transformers.map((t) => t.region)).size,
        avgVoltage: Math.round(
            transformers.reduce((sum, t) => {
                const latestReading = t.lastTenVoltageReadings[0];
                return (
                    sum + (latestReading ? parseInt(latestReading.voltage) : 0)
                );
            }, 0) / transformers.length
        ),
    };
    return <div>Home</div>;
};

export default Home;
