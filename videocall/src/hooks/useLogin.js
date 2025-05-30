import { useState } from "react";
import { setUser } from "./accessUser";
import { useAuthContext } from "./useAuthContext";
export const useLogin = () => {
    const [error, setError] = useState(null);
    const {user, dispatch} = useAuthContext()

    const login = async (email, password) => {
        const response = await fetch("http://localhost:3000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const user = await response.json();
        console.log(user)

        if (!response.ok) {
            setError(user.error);
        }

        if (response.ok) {
            setUser(user)
            dispatch({type: 'LOGIN', payload: user})
        }
    };
    return { user, login, error };
};
//