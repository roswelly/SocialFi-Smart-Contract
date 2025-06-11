import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LogoutButton = () => {
    const { logout, isAuthenticated } = useAuth0();

    return (
        isAuthenticated && (
            <button
                style={{ width: "130px", outline: "none", border: "0" }}
                className="bg-red-700 hover:bg-red-500 text-white font-bold py-2 px-4 rounded"
                onClick={() => logout()}>
                Log Out
            </button>
        )
    )
}

export default LogoutButton