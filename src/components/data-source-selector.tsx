"use client";

import { Transformer } from "@/types/transformer.type";
import { VoltageReading } from "@/types/voltage-reading.type";
import { Label } from "@radix-ui/react-label";
import { AlertCircle, CheckCircle, Database, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

type ComponentProps = {
    onDataLoad: (data: Transformer[]) => void;
    currentDataSource: "sample" | "uploaded";
    isVisible: boolean;
    onToggleVisibility: () => void;
};

export function DataSourceSelector({
    onDataLoad,
    currentDataSource,
    isVisible,
    onToggleVisibility,
}: ComponentProps) {
    const [uploadStatus, setUploadStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadSampleData = async () => {
        try {
            setUploadStatus("loading");
            const response = await fetch("/sampledata.json");
            if (!response.ok) {
                throw new Error("Failed to load sample data");
            }
            const data = await response.json();

            // Validate the data structure
            if (!Array.isArray(data)) {
                throw new Error("Data must be an array of transformers");
            }

            // Basic validation of transformer structure
            const isValidData = data.every(
                (item) =>
                    item.assetId &&
                    item.name &&
                    item.region &&
                    item.health &&
                    Array.isArray(item.lastTenVoltgageReadings)
            );

            if (!isValidData) {
                throw new Error("Invalid transformer data structure");
            }

            onDataLoad(data);
            setUploadStatus("success");
            setErrorMessage("");
        } catch (error) {
            setUploadStatus("error");
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to load sample data"
            );
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/json") {
            setUploadStatus("error");
            setErrorMessage("Please select a JSON file");
            return;
        }

        setUploadStatus("loading");
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                // Validate the data structure
                if (!Array.isArray(data)) {
                    throw new Error("Data must be an array of transformers");
                }

                // Basic validation of transformer structure
                const isValidData = data.every(
                    (item) =>
                        item.assetId &&
                        item.name &&
                        item.region &&
                        item.health &&
                        Array.isArray(item.lastTenVoltageReadings) &&
                        item.lastTenVoltageReadings.every(
                            (reading: VoltageReading) =>
                                reading.timestamp && reading.voltage
                        )
                );

                if (!isValidData) {
                    throw new Error(
                        "Invalid transformer data structure. Each transformer must have: assetId, name, region, health, and lastTenVoltgageReadings array with timestamp and voltage fields"
                    );
                }

                onDataLoad(data);
                setUploadStatus("success");
                setErrorMessage("");
            } catch (error) {
                setUploadStatus("error");
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to parse JSON file"
                );
            }
        };

        reader.onerror = () => {
            setUploadStatus("error");
            setErrorMessage("Failed to read file");
        };

        reader.readAsText(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (!isVisible) {
        return (
            <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        Using{" "}
                        {currentDataSource === "sample"
                            ? "sample data"
                            : "uploaded data"}
                    </span>
                </div>
                <Button
                    onClick={onToggleVisibility}
                    variant="outline"
                    size="sm"
                >
                    Change Data Source
                </Button>
            </div>
        );
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Data Source
                    </div>
                    <Button
                        onClick={onToggleVisibility}
                        variant="ghost"
                        size="sm"
                    >
                        Hide
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sample Data Option */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">
                            Use Sample Data
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Load the included sample dataset with 5 transformers
                        </p>
                        <Button
                            onClick={loadSampleData}
                            disabled={uploadStatus === "loading"}
                            variant={
                                currentDataSource === "sample"
                                    ? "default"
                                    : "outline"
                            }
                            className="w-full"
                        >
                            <Database className="h-4 w-4 mr-2" />
                            {uploadStatus === "loading" &&
                            currentDataSource === "sample"
                                ? "Loading..."
                                : "Load Sample Data"}
                        </Button>
                    </div>

                    {/* File Upload Option */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">
                            Upload JSON File
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Upload your own transformer data in JSON format
                        </p>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            onClick={triggerFileInput}
                            disabled={uploadStatus === "loading"}
                            variant={
                                currentDataSource === "uploaded"
                                    ? "default"
                                    : "outline"
                            }
                            className="w-full"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadStatus === "loading" &&
                            currentDataSource === "uploaded"
                                ? "Processing..."
                                : "Upload JSON File"}
                        </Button>
                    </div>
                </div>

                {/* Status Messages */}
                {uploadStatus === "success" && (
                    <Alert className="mt-4">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            Data loaded successfully!{" "}
                            {currentDataSource === "sample"
                                ? "Using sample data."
                                : "Using uploaded data."}
                        </AlertDescription>
                    </Alert>
                )}

                {uploadStatus === "error" && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Data Format Help */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">
                        Expected JSON Format:
                    </h4>
                    <pre className="text-xs text-muted-foreground overflow-x-auto">
                        {`[
  {
    "assetId": 1,
    "name": "Transformer Name",
    "region": "Region Name",
    "health": "Good|Excellent|Fair|Poor|Critical",
    "lastTenVoltgageReadings": [
      {
        "timestamp": "2024-07-21T00:00:00Z",
        "voltage": "35234"
      }
    ]
  }
]`}
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
}
