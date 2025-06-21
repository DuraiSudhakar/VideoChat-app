import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
    const { user } = useAuthContext()
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();
    const removeUser = () => {
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
        navigate("/login");
    }
    //
    return (
        <>
            {user && <Navigate to="/home" />}
            <nav
                style={{
                    height: "10vh",
                    margin: "0px 15px",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <h2>Call Intern</h2>
                {user && (
                    <>
                        <div style={{ margin: "13px" }}>
                            <button onClick={removeUser}>Log out</button>
                        </div>
                    </>
                )}
                {!user && (
                    <div
                        style={{
                            width: "200px",
                            margin: "13px",
                            display: "flex",
                            justifyContent: "space-evenly",
                            alignItems: "center",
                        }}
                    >
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Sign Up</Link>
                    </div>
                )}
            </nav>
            <Outlet />
        </>
    );
}

export default Navbar