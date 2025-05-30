import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { setUser } from "./accessUser";

export const useSignup = () => {
    const [error, setError] = useState(null)
    const {user, dispatch} = useAuthContext()

    const signup = async (email, password) => {
        const response = await fetch(
            "https://call-intern-code-api.onrender.com/api/users/signup",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            }
        );
        const json = await response.json()
        console.log(json)

        if (!response.ok) {
            setError(json.error)
        }
        if (response.ok) {
            setUser(json)
            dispatch({type:'LOGIN', payload: json})
        }
    }
    return { user, signup, error }
}//