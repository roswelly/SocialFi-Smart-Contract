// import Game from "./components/Game";
import LoginButton from "./components/LoginButton";
import Dashboard from "./components/Dashboard";
import { useAuth0 } from '@auth0/auth0-react';
import ScaleLoader from "react-spinners/ScaleLoader";


function App() {
  const { isAuthenticated } = useAuth0()
  const { isLoading } = useAuth0();

  if (isLoading) return <div className="flex flex-col items-center justify-center h-screen">
    <ScaleLoader
      color="#393e46"
    // color="rgb(38, 39, 48)"
    />
  </div>

  return (
    <>
      <LoginButton />
      {isAuthenticated &&
        <Dashboard />
      }
    </>);
}

export default App;
