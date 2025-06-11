import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Logo from "../assets/Logo2.jpg"


const LoginButton = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();

    return (
        !isAuthenticated && (
            <div className="flex flex-col items-center align-center justify-center h-screen gap-3">

                <h1 className="flex text-2xl justify-center align-center mb-2 font-semibold">Welcome to
                    <span className="flex">
                        RoboDash
                        <span className="lg:hidden">
                            ⚡
                        </span>
                        <span className="hidden lg:block">
                            !
                        </span>
                    </span>
                </h1>
                {/* <h1 className="flex text-center text-xl mb-2">Login to continue to
                    <span className="flex">
                         RoboDash
                        <span className="lg:hidden">
                            ⚡
                        </span>
                    </span>
                </h1> */}
                <button
                    className="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded align-center"
                    style={{ width: "250px", outline: "none", border: "0" }}
                    onClick={() => loginWithRedirect()}>

                    <span className="flex align-center items-center justify-center gap-2">
                        <img src={Logo} alt="google" width="30px" draggable={false} style={{ borderRadius: "50%", }} />
                        Log In With Google
                    </span>

                </button>
            </div>
        )
    )
}

export default LoginButton