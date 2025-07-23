import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type ComponentProps = {
    title: string;
    icon: React.ReactNode;
    value: number | string;
    description: string;
};

export const StatCard = ({
    title,
    icon,
    value,
    description,
}: ComponentProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
};
