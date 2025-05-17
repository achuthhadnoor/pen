
import { useEffect, useState } from "react";

export const defaultState = {
    "shapeType": "square",
    "highlightCursor": false,
    "strokeThickness": 2,
    "fadeLines": true,
    "fillShape": false,
    "randomColorMode": true,
    "moveShapes": true,
    "fadeSpeed": 1,
    "color": "square",
    "transparentMode": true
}

export type IDefaultState = typeof defaultState;

const useSyncStorage = () => {
    const [appState, setAppState] = useState(() => {
        const stored = localStorage.getItem("toolbarOptions");
        return stored ? JSON.parse(stored) : defaultState;
    });

    const onStorageUpdate = (e: any) => {
        const { key, newValue } = e;
        if (key === "toolbarOptions") {
            setAppState(JSON.parse(newValue));
        }
    };

    const updateState = (key: keyof IDefaultState, value: any) => {
        setAppState((prev: any) => ({ ...prev, [key]: value }));
    };

    const setSyncState = (newState: IDefaultState) => {
        window.localStorage.setItem("toolbarOptions", JSON.stringify(newState));
        setAppState(newState);
    };
    // useEffect(() => {
    //     console.log('====================================');
    //     console.log(appState);
    //     console.log('====================================');
    //     localStorage.setItem("toolbarOptions", JSON.stringify(appState));
    // }, [appState]);

    useEffect(() => {
        localStorage.clear();
        // setAppState(JSON.parse(localStorage.getItem("toolbarOptions")) || defaultState);
        window.addEventListener("storage", onStorageUpdate);
        return () => {
            window.removeEventListener("storage", onStorageUpdate);
        };
    }, []);

    return {
        appState,
        updateState,
        setAppState: setSyncState,
    };
};
export default useSyncStorage;