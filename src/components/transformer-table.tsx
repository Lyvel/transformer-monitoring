"use client";

import { Transformer } from "@/types/transformer.type";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Filter, Search } from "lucide-react";

type ComponentProps = {
    transformers: Transformer[];
    searchTerm: string;
    regionFilter: string;
    healthFilter: string;
    onSearchChange: (value: string) => void;
    onRegionFilterChange: (value: string) => void;
    onHealthFilterChange: (value: string) => void;
};

const getHealthBadgeVariant = (health: string) => {
    switch (health.toLowerCase()) {
        case "excellent":
            return "default";
        case "good":
            return "secondary";
        case "fair":
            return "outline";
        case "poor":
            return "destructive";
        case "critical":
            return "destructive";
        default:
            return "outline";
    }
};

export const TransformerTable = ({
    transformers,
    searchTerm,
    regionFilter,
    healthFilter,
    onSearchChange,
    onRegionFilterChange,
    onHealthFilterChange,
}: ComponentProps) => {
    const regions = useMemo(() => {
        const uniqueRegions = [...new Set(transformers.map((t) => t.region))];
        return uniqueRegions.sort();
    }, [transformers]);

    const healthStatuses = useMemo(() => {
        const uniqueHealth = [...new Set(transformers.map((t) => t.health))];
        return uniqueHealth.sort();
    }, [transformers]);

    const filteredTransformers = useMemo(() => {
        return transformers.filter((transformer) => {
            const matchesSearch =
                transformer.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                transformer.region
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                transformer.health
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesRegion =
                !regionFilter || transformer.region === regionFilter;
            const matchesHealth =
                !healthFilter || transformer.health === healthFilter;

            return matchesSearch && matchesRegion && matchesHealth;
        });
    }, [transformers, searchTerm, regionFilter, healthFilter]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Transformer Assets
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transformers..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={regionFilter}
                        onValueChange={onRegionFilterChange}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All regions</SelectItem>
                            {regions.map((region) => (
                                <SelectItem key={region} value={region}>
                                    {region}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={healthFilter}
                        onValueChange={onHealthFilterChange}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by health" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All health statuses
                            </SelectItem>
                            {healthStatuses.map((health) => (
                                <SelectItem key={health} value={health}>
                                    {health}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead>Health Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransformers.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        No transformers found matching your
                                        criteria
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransformers.map((transformer) => (
                                    <TableRow
                                        key={transformer.assetId}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="font-medium">
                                            {transformer.name}
                                        </TableCell>
                                        <TableCell>
                                            {transformer.region}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getHealthBadgeVariant(
                                                    transformer.health
                                                )}
                                            >
                                                {transformer.health}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                    Showing {filteredTransformers.length} of{" "}
                    {transformers.length} transformers
                </div>
            </CardContent>
        </Card>
    );
};
