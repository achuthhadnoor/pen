import { Routes, Route, HashRouter } from "react-router-dom";
import { electronAPIType } from "./preload";
import License from "./screens/license";
import Toolbar from "./screens/toolbar";
import Settings from "./screens/settings";
import Canvas from "./screens/canvas";

declare global {
    interface Window {
        api: electronAPIType;
    }
}

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Toolbar />} />
                <Route path="/canvas" element={<Canvas />} />
                <Route path="/license" element={<License />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </HashRouter>
    );
}

export default App;
