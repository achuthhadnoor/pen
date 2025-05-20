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
import useLocalStorage from "../hooks/useLocalStorage";

export const colors = [
    { name: "pink", base: "bg-pink-500", ring: "ring-pink-800", darkRing: "dark:peer-checked:ring-pink-200" },
    { name: "yellow", base: "bg-yellow-500", ring: "ring-yellow-800", darkRing: "dark:peer-checked:ring-yellow-200" },
    { name: "green", base: "bg-green-500", ring: "ring-green-800", darkRing: "dark:peer-checked:ring-green-200" },
];

export const tools = [
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

export type ToolbarOptions = typeof defaultOptions;

function Toolbar() {
    const [options, setOptions] = useLocalStorage<ToolbarOptions>("toolbarOptions", defaultOptions);

    const updateOption = (key: keyof ToolbarOptions, value: any) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

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
                        onClick={() => updateOption("shapeType", name)}
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
