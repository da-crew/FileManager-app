import React, { createContext, useContext, useState } from "react";

export type onQuitEvent = () => void;

interface ProgressState {
    progress: number;
    maxProgress: number;
    actionTitle: string;
    onQuit?: onQuitEvent;
    onCancel?: onQuitEvent;
}

interface ProgressContextProps {
    progressState: ProgressState | null;
    startProgress: (progress: number, maxProgress: number, actionTitle: string, onCancel?: onQuitEvent, onQuit?: onQuitEvent) => void;
    incrementProgress: () => void;
    quitProgress: () => void;
    cancelProgress: () => void;
}

const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [progressState, setProgressState] = useState<ProgressState | null>(null);

    const startProgress = (progress: number, maxProgress: number, actionTitle: string, onCancel?: onQuitEvent, onQuit?: onQuitEvent) => {
        setProgressState({ progress, maxProgress, actionTitle, onQuit, onCancel });
    };

    const incrementProgress = () => {
        setProgressState((prev) => {
            if (!prev) return null;
            const newProgress = prev.progress + 1;
            if (newProgress >= prev.maxProgress && prev.maxProgress > 0) return null; // Automatically clear progress when done
            return { ...prev, progress: newProgress };
        });
    };

    const quitProgress = () => {
        if (progressState && progressState.onQuit) progressState.onQuit();
        setProgressState(null);
    };

    const cancelProgress = () => {
        if (progressState && progressState.onCancel) progressState.onCancel();
        setProgressState(null);
    };

    return (
        <ProgressContext.Provider value={{ progressState, startProgress, incrementProgress, quitProgress, cancelProgress }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error("useProgress must be used within a ProgressProvider");
    }
    return context;
};