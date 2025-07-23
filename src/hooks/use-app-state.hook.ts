"use client";

import { getDefaultState, loadState, saveState } from "@/lib/storage.lib";
import { AppState } from "@/types/app-state.type";
import { useCallback, useEffect, useState } from "react";

export const useAppState = () => {
    const [state, setState] = useState<AppState>(getDefaultState());
    const [isLoaded, setIsLoaded] = useState(false);

    // Load initial state
    useEffect(() => {
        const savedState = loadState();
        if (savedState) {
            setState(savedState);
        }
        setIsLoaded(true);
    }, []);

    // Listen for state changes from other tabs
    useEffect(() => {
        const handleStateChange = (event: CustomEvent<AppState>) => {
            setState(event.detail);
        };

        window.addEventListener(
            "state-change",
            handleStateChange as EventListener
        );

        // Also listen for storage events (fallback)
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "transformer-app-state" && event.newValue) {
                try {
                    const newState = JSON.parse(event.newValue);
                    setState(newState);
                } catch (error) {
                    console.error(
                        "Failed to parse state from storage event:",
                        error
                    );
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener(
                "state-change",
                handleStateChange as EventListener
            );
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const updateState = useCallback((updates: Partial<AppState>) => {
        setState((prevState) => {
            const newState = { ...prevState, ...updates };
            saveState(newState);
            return newState;
        });
    }, []);

    return {
        state,
        updateState,
        isLoaded,
    };
};
