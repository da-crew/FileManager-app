import React, { createContext, useContext, useState } from "react";

export type onQuitEvent = (done: boolean, progress: number) => void;

interface ProgressState {
    progress: number;
    maxProgress: number;
    actionTitle: string;
    onQuit: onQuitEvent;
}

interface ProgressContextProps {
    progressState: ProgressState | null;
    startProgress: (progress: number, maxProgress: number, actionTitle: string, onQuit: onQuitEvent) => void;
    incrementProgress: () => void;
    quitProgress: onQuitEvent;
}

const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [progressState, setProgressState] = useState<ProgressState | null>(null);

    const startProgress = (progress: number, maxProgress: number, actionTitle: string, onQuit: onQuitEvent) => {
        setProgressState({ progress, maxProgress, actionTitle, onQuit });
    };

    const incrementProgress = () => {
        setProgressState((prev) => {
            if (!prev) return null;
            const newProgress = prev.progress + 1;
            if (newProgress >= prev.maxProgress && prev.maxProgress > 0) return null; // Automatically clear progress when done
            return { ...prev, progress: newProgress };
        });
    };

    const quitProgress = (done: boolean) => {
        if (progressState) progressState.onQuit(done, progressState.progress);
        setProgressState(null);
    };

    return (
        <ProgressContext.Provider value={{ progressState, startProgress, incrementProgress, quitProgress }}>
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