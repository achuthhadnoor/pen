// import React, { useState } from "react";
// import {
//     ShuffleIcon,
//     PenIcon,
//     LineIcon,
//     SquareIcon,
//     CircleIcon,
//     ArrowIcon,
//     SearchIcon,
//     BackIcon,
//     TextIcon,
//     PinIcon,
//     DeleteIcon,
// } from "../components/Icons"; // Assume all icons are in a file named icons.tsx

// const colors = [
//     { name: "pink", base: "bg-pink-500", ring: "ring-pink-800", darkRing: "dark:peer-checked:ring-pink-200" },
//     { name: "yellow", base: "bg-yellow-500", ring: "ring-yellow-800", darkRing: "dark:peer-checked:ring-yellow-200" },
//     { name: "green", base: "bg-green-500", ring: "ring-green-800", darkRing: "dark:peer-checked:ring-green-200" },
// ];

// const tools = [
//     { name: "shuffle", icon: ShuffleIcon },
//     { name: "pen", icon: PenIcon },
//     { name: "line", icon: LineIcon },
//     { name: "square", icon: SquareIcon },
//     { name: "circle", icon: CircleIcon },
//     { name: "arrow", icon: ArrowIcon },
//     { name: "search", icon: SearchIcon },
//     { name: "back", icon: BackIcon },
//     { name: "text", icon: TextIcon },
//     { name: "pin", icon: PinIcon },
// ];

// function Toolbar() {
//     const [stroke, setStroke] = useState<number>(1);
//     const [isToggled, setIsToggled] = useState<boolean>(false);
//     const [selectedColor, setSelectedColor] = useState<string>("pink");
//     const [selectedTool, setSelectedTool] = useState<string | null>(null);

//     return (
//         <div className="flex p-1 items-center h-full drag gap-1 text-neutral-500">
//             {/* Toggle Switch */}
//             <label className="inline-flex items-center cursor-pointer no-drag">
//                 <input
//                     type="checkbox"
//                     className="sr-only peer"
//                     checked={isToggled}
//                     onChange={() => setIsToggled(!isToggled)}
//                 />
//                 <div className="relative w-11 h-6 bg-black/10 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-lime-600 dark:peer-checked:bg-lime-600" />
//             </label>

//             {/* Color Picker */}
//             <div className="flex gap-3 border-r-2 dark:border-white/20 border-black/10 px-2 items-center">
//                 {colors.map((color) => (
//                     <label key={color.name} className="no-drag">
//                         <input
//                             type="radio"
//                             name="color"
//                             className="sr-only peer"
//                             checked={selectedColor === color.name}
//                             onChange={() => setSelectedColor(color.name)}
//                         />
//                         <div
//                             className={`h-5 w-5 relative rounded-full ring-2 ring-transparent ${color.base} ${selectedColor === color.name ? color.ring : ""} ${color.darkRing}`}
//                         />
//                     </label>
//                 ))}
//             </div>

//             {/* Tool Buttons */}
//             <div className="flex gap-1 px-2 items-center">
//                 {tools.map(({ name, icon: Icon }) => (
//                     <button
//                         key={name}
//                         className={`p-2 rounded-lg no-drag hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5 ${selectedTool === name ? "bg-black/10  text-neutral-800 dark:text-neutral-200 dark:bg-white/5" : ""}`}
//                         onClick={() => setSelectedTool(name)}
//                     >
//                         <Icon />
//                     </button>
//                 ))}
//             </div>

//             {/* Stroke Slider */}
//             <div className="border-l-2 dark:border-white/20 border-black/10 flex items-center px-2">
//                 <span className="h-5 w-5 px-2 flex justify-center items-center">
//                     {stroke}
//                 </span>
//                 <input
//                     type="range"
//                     min={1}
//                     max={10}
//                     className="no-drag accent-lime-400"
//                     value={stroke}
//                     onChange={(e) => setStroke(Number(e.target.value))}
//                 />
//             </div>

//             {/* Delete Button */}
//             <div className="p-1 hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5 rounded-lg no-drag">
//                 <DeleteIcon />
//             </div>
//         </div>
//     );
// }

// export default Toolbar;

import { useEffect, useState } from "react";
import cl from 'classnames';
import {
    PenIcon,
    LineIcon,
    SquareIcon,
    CircleIcon,
    ArrowIcon,
    SearchIcon,
    BackIcon,
    MoveIcon,
    PinIcon,
    DeleteIcon,
    RandomColorIcon,
} from "../components/Icons";


const colors = [
    { name: "pink", base: "bg-pink-500", ring: "ring-pink-800", darkRing: "dark:peer-checked:ring-pink-200" },
    { name: "yellow", base: "bg-yellow-500", ring: "ring-yellow-800", darkRing: "dark:peer-checked:ring-yellow-200" },
    { name: "green", base: "bg-green-500", ring: "ring-green-800", darkRing: "dark:peer-checked:ring-green-200" },
];

const tools = [
    { name: "pen", icon: PenIcon },
    { name: "line", icon: LineIcon },
    { name: "square", icon: SquareIcon },
    { name: "circle", icon: CircleIcon },
    { name: "arrow", icon: ArrowIcon },
];

const defaultOptions = {
    transparentMode: false,
    shapeType: "pen",
    highlightCursor: false,
    strokeThickness: 2,
    fadeLines: false,
    fillShape: false,
    randomColorMode: false,
    moveShapes: false,
    fadeSpeed: 1,
    color: "pink",
};

function Toolbar() {
    const [options, setOptions] = useState(() => {
        const stored = localStorage.getItem("toolbarOptions");
        return stored ? JSON.parse(stored) : defaultOptions;
    });

    const updateOption = (key: keyof typeof defaultOptions, value: any) => {
        setOptions((prev: any) => ({ ...prev, [key]: value }));
    };

    // Save to localStorage when options change
    useEffect(() => {
        localStorage.setItem("toolbarOptions", JSON.stringify(options));
    }, [options]);
    const clearCanvas = () => {
        console.log("Canvas cleared"); // Replace with real logic
    };

    const handleColorClick = (color: string) => {
        console.log("Color selected:", color); // Replace with actual logic
    };

    return (
        <div className="flex p-1 items-center h-full drag gap-1 text-neutral-500">
            {/* Random Color Mode Toggle */}
            <label className="inline-flex items-center cursor-pointer no-drag">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={options.transparentMode}
                    onChange={() => updateOption("transparentMode", !options.transparentMode)}
                />
                <div className="relative w-11 h-6 bg-black/10 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-lime-600 dark:peer-checked:bg-lime-600" />
            </label>

            {/* Color Buttons */}
            <div className="flex gap-2 border-r-2 dark:border-white/20 border-black/10 px-2 items-center">
                {colors.map((color) => (
                    <label key={color.name} className="no-drag">
                        <input
                            type="radio"
                            name="color"
                            className="sr-only peer"
                            onChange={() => handleColorClick(color.name)}
                        />
                        <div
                            className={`h-5 w-5 relative rounded-full ring-2 ring-transparent ${color.base} ${color.ring} ${color.darkRing}`}
                        />
                    </label>
                ))}
            </div>

            {/* Shape Tool Buttons */}
            <div className="flex gap-1 px-2 items-center">
                <button
                    className={cl("p-2 rounded-lg no-drag hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5", options.randomColorMode ? "bg-black/10 dark:bg-white/10 text-neutral-800 dark:text-neutral-200" : "")}
                    onClick={() => updateOption("randomColorMode", !options.randomColorMode)}
                >
                    <RandomColorIcon />
                </button>
                {tools.map(({ name, icon: Icon }) => (
                    <button
                        key={name}
                        className={`p-2 rounded-lg no-drag hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5 ${options.shapeType === name ? "bg-black/10 dark:bg-white/10 text-neutral-800 dark:text-neutral-200" : ""
                            }`}
                        onClick={() => updateOption("color", name)}
                    >
                        <Icon />
                    </button>
                ))}
                <button
                    className={`p-2 rounded-lg no-drag hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5 ${options.fadeLines ? "bg-black/10 dark:bg-white/10 text-neutral-800 dark:text-neutral-200" : ""
                        }`}
                    onClick={() => updateOption("fadeLines", !options.fadeLines)}
                >
                    <BackIcon />
                </button>
                <button
                    className={`p-2 rounded-lg no-drag hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5 ${options.highlightCursor ? "bg-black/10 dark:bg-white/10 text-neutral-800 dark:text-neutral-200" : ""
                        }`}
                    onClick={() => updateOption("highlightCursor", !options.highlightCursor)}
                >
                    <SearchIcon />
                </button>
                <button
                    className={`p-2 rounded-lg no-drag hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5 ${options.moveShapes ? "bg-black/10 dark:bg-white/10 text-neutral-800 dark:text-neutral-200" : ""
                        }`}
                    onClick={() => updateOption("moveShapes", !options.moveShapes)}
                >
                    <MoveIcon />
                </button>
                <button
                    className={`p-2 rounded-lg no-drag hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5 ${options.fillShape ? "bg-black/10 dark:bg-white/10 text-neutral-800 dark:text-neutral-200" : ""
                        }`}
                    onClick={() => updateOption("fillShape", !options.fillShape)}
                >
                    <PinIcon />
                </button>
            </div>

            {/* Stroke Thickness */}
            <div className="border-l-2 dark:border-white/20 border-black/10 flex items-center pl-2">
                <span className="h-5 w-5 px-2 flex justify-center items-center">
                    {options.strokeThickness}
                </span>
                <input
                    type="range"
                    min={1}
                    max={10}
                    className="no-drag accent-lime-400"
                    value={options.strokeThickness}
                    onChange={(e) => updateOption("strokeThickness", Number(e.target.value))}
                />
            </div>

            <div className="flex ">
                <button
                    onClick={clearCanvas}
                    className="p-2 hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5 rounded-lg no-drag"
                    title="Clear Canvas"
                >
                    <DeleteIcon />
                </button>
                <button
                    onClick={clearCanvas}
                    className="p-2 hover:bg-black/5 hover:text-neutral-800 dark:hover:text-neutral-200 dark:hover:bg-white/5 rounded-lg "
                    title="Clear Canvas"
                >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
                </button>
            </div>
        </div>
    );
}

export default Toolbar;
