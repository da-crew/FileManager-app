import React, { createContext, useContext, useState } from "react";

// กำหนดประเภทข้อมูลสำหรับฟังก์ชัน callback เมื่อสิ้นสุดการทำงาน
export type onQuitEvent = () => void;

// กำหนดโครงสร้างข้อมูลสถานะความคืบหน้า
interface ProgressState {
    progress: number;      // ค่าความคืบหน้าปัจจุบัน
    maxProgress: number;   // ค่าความคืบหน้าสูงสุด
    actionTitle: string;   // ชื่อการกระทำที่กำลังทำ
    onQuit?: onQuitEvent;  // ฟังก์ชันที่จะเรียกเมื่อสิ้นสุดการทำงาน
    onCancel?: onQuitEvent; // ฟังก์ชันที่จะเรียกเมื่อยกเลิกการทำงาน
}

// กำหนดโครงสร้าง Context สำหรับจัดการความคืบหน้า
interface ProgressContextProps {
    progressState: ProgressState | null;  // สถานะความคืบหน้าปัจจุบัน
    startProgress: (progress: number, maxProgress: number, actionTitle: string, onCancel?: onQuitEvent, onQuit?: onQuitEvent) => void;  // เริ่มต้นการแสดงความคืบหน้า
    incrementProgress: () => void;         // เพิ่มค่าความคืบหน้าทีละ 1
    updateProgress: (progress: number) => void;  // อัพเดทค่าความคืบหน้าเป็นค่าที่กำหนด
    quitProgress: () => void;              // สิ้นสุดการแสดงความคืบหน้า (สำเร็จ)
    cancelProgress: () => void;            // ยกเลิกการแสดงความคืบหน้า
}

// สร้าง Context สำหรับจัดการความคืบหน้า
const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

/**
 * Provider สำหรับจัดการและแสดงผลความคืบหน้าของการทำงาน
 * ใช้ครอบส่วนของแอปที่ต้องการเข้าถึงการจัดการความคืบหน้า
 */
export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // สถานะความคืบหน้าปัจจุบัน
    const [progressState, setProgressState] = useState<ProgressState | null>(null);

    // เริ่มต้นการแสดงความคืบหน้า
    const startProgress = (progress: number, maxProgress: number, actionTitle: string, onCancel?: onQuitEvent, onQuit?: onQuitEvent) => {
        setProgressState({ progress, maxProgress, actionTitle, onQuit, onCancel });
    };

    // เพิ่มค่าความคืบหน้าทีละ 1
    const incrementProgress = () => {
        setProgressState((prev) => {
            if (!prev) return null;
            const newProgress = prev.progress + 1;
            // ปิดความคืบหน้าอัตโนมัติเมื่อถึงค่าสูงสุด
            if (newProgress >= prev.maxProgress && prev.maxProgress > 0) return null;
            return { ...prev, progress: newProgress };
        });
    };

    // อัพเดทค่าความคืบหน้าเป็นค่าที่กำหนด
    const updateProgress = (progress: number) => {
        setProgressState((prev) => {
            if (!prev) return null;
            // ปิดความคืบหน้าอัตโนมัติเมื่อถึงค่าสูงสุด
            if (progress >= prev.maxProgress && prev.maxProgress > 0) return null;
            return { ...prev, progress };
        });
    };

    // สิ้นสุดการแสดงความคืบหน้า (สำเร็จ)
    const quitProgress = () => {
        if (progressState && progressState.onQuit) progressState.onQuit();
        setProgressState(null);
    };

    // ยกเลิกการแสดงความคืบหน้า
    const cancelProgress = () => {
        if (progressState && progressState.onCancel) progressState.onCancel();
        setProgressState(null);
    };

    return (
        <ProgressContext.Provider value={{ progressState, startProgress, incrementProgress, updateProgress, quitProgress, cancelProgress }}>
            {children}
        </ProgressContext.Provider>
    );
};

/**
 * Hook สำหรับเข้าถึงค่าและฟังก์ชันจัดการความคืบหน้า
 * ใช้ในคอมโพเนนต์ที่ต้องการแสดงผลหรือจัดการความคืบหน้า
 */
export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error("useProgress must be used within a ProgressProvider");
    }
    return context;
};