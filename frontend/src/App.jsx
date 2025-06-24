import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
        </Routes>
    );
}

export default App;
