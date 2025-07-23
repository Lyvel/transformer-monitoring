import { AppState } from "@/types/app-state.type";

const STORAGE_KEY = "transformer-app-state";

export const saveState = (state: AppState): void => {
    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            // Also broadcast to other tabs
            window.dispatchEvent(
                new CustomEvent("state-change", { detail: state })
            );
        } catch (error) {
            console.error("Failed to save state:", error);
        }
    }
};

export const loadState = (): AppState | null => {
    if (typeof window !== "undefined") {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error("Failed to load state:", error);
            return null;
        }
    }
    return null;
};

export const getDefaultState = (): AppState => ({
    selectedTransformers: [],
    searchTerm: "",
    regionFilter: "",
    healthFilter: "",
    dataSource: "sample",
});
