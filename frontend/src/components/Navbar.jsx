import { Link, Outlet } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const Navbar = () => {
    const { user, dispatch } = useAuthContext();

    const removeUser = () => {
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
    };

    return (
        <>
            <nav
                style={{
                    margin: "0px 15px",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <h2>Call Intern</h2>
                {user ? (
                    <div style={{ margin: "13px" }}>
                        <button onClick={removeUser}>Log out</button>
                    </div>
                ) : (
                    <div style={{ margin: "13px" }}>
                        <Link to="/login">Login</Link>{" "}
                        <Link to="/signup">Sign Up</Link>
                    </div>
                )}
            </nav>
            <Outlet />
        </>
    );
};

export default Navbar;
