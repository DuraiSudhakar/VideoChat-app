import { BrowserRouter, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import Home from "./pages/Home";
import './App.css';
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { AuthContextProvider } from "./context/authContext";
import Navbar from "./components/Navbar";

function App() {
    const socket = io("http://localhost:3000");

    return (
        <AuthContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navbar/>}>
                        <Route path="/home" element={<Home socket={socket} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthContextProvider>
    );
}

export default App;
