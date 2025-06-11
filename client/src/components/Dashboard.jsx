import React, { useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
// import JSONPretty from 'react-json-pretty';
import Game from './Game';
import LogoutButton from './LogoutButton';
import { GameOverScreen } from './GameOverScreen';
import GameCompletedAudio from "../assets/Completed.wav"
import LeaderBoard from "../components/LeaderBoard"
import HomeScreen from "../components/HomeScreen"
import RoboLogo from "../assets/R2.svg"
// import GameOverAudio from "../assets/GameOver.wav"


const Profile = () => {
    const { isAuthenticated, user } = useAuth0();
    const [finalScore, setFinalScore] = useState(null)
    const [showGame, setShowGame] = useState(true)
    const [showLeaderBoard, setShowLeaderBoard] = useState(false)
    const [showHomeScreen, setShowHomeScreen] = useState(true)
    const SuccessAudio = new Audio(GameCompletedAudio)

    // const FailAudio = new Audio(GameOverAudio)

    // function ExportScore(score) {
    //     setFinalScore(score)
    //     console.log(finalScore);
    // }

    // useEffect(() => {
    //     if (countDown < 1) return
    //     const timer = setInterval(() => {
    //         setCountDowm(() =>
    //             countDown - 1)
    //     }, 1000)
    //     // if (countDown < 1)
    //     return () => clearInterval(timer)
    // }, [countDown])

    function displayGame() {
        setShowGame(true)
        setShowLeaderBoard(false)
    }

    function displayLeaderBoard() {
        setShowLeaderBoard(true)
        setShowGame(false)
    }


    return (
        isAuthenticated && (
            <>
                <header
                    className="flex justify-between items-center font-semibold text-xl px-5 py-3"
                    style={{ backgroundColor: "#393e46" }}>
                    <h1
                        className="text-2xl cursor-pointer"
                        onClick={() => setShowHomeScreen(true)}
                    >
                        <span className="flex font-bold items-center"
                        >
                            RoboDash
                            <p className="lg:hidden">
                                ⚡
                            </p>
                            <img
                                className="hidden lg:block"
                                src={RoboLogo}
                                draggable={false}
                                alt="logo"
                                width="40px"

                            />
                        </span>
                    </h1>
                    <span className="flex items-center align-center justify-center text-xl gap-2">

                        <img
                            className="mr-2 lg:mr-0"
                            src={user.picture}
                            alt={user.nickname}
                            draggable={false}
                            width="35px"
                            style={{ borderRadius: "50%" }} />

                        <div className="hidden lg:block">
                            <LogoutButton />
                        </div>
                        {/* <p className="hidden lg:block">
                            {user.name}
                        </p> */}
                    </span>
                </header>
                <div className="flex flex-col align-center items-center justify-center">
                    {showHomeScreen ? (
                        <HomeScreen
                            RenderGame={() => {
                                setShowHomeScreen(false)
                                displayGame()
                            }}

                            RenderLeaderBoard={() => {
                                setShowHomeScreen(false)
                                displayLeaderBoard()
                            }}
                        />

                    ) : showGame && !showLeaderBoard ? (
                        <>
                            <Game
                                ExportScore={(score) => {
                                    setFinalScore(score)
                                    setShowGame(false)
                                    SuccessAudio.play()
                                }
                                }
                            />

                            <div className="flex flex-col lg:flex-row gap-2 mt-2">

                                <button
                                    className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded align-center"
                                    style={{ width: "200px", outline: "none", border: "0" }}
                                    onClick={() => {
                                        setShowHomeScreen(true)
                                        displayGame()
                                    }}>
                                    Leave Game
                                </button>

                                <button
                                    className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded align-center"
                                    style={{ width: "200px", outline: "none", border: "0" }}
                                    onClick={() => {
                                        displayLeaderBoard()
                                    }}>
                                    ShowLeaderboard
                                </button>

                            </div>


                            <div className="mt-3 lg:hidden">
                                <LogoutButton />
                            </div>
                        </>
                    ) : showLeaderBoard && !showGame ? (

                        <>

                            <LeaderBoard
                                renderBoard={() => {
                                    displayGame()
                                }}
                                RenderHome={() => {
                                    setShowHomeScreen(true)
                                    displayGame()
                                }}
                            />

                        </>
                    ) : !showGame && !showLeaderBoard ? (
                        <>

                            <GameOverScreen
                                score={finalScore}
                                AlterRender={() => {
                                    displayGame()
                                }}
                                LeaderBoards={() => {
                                    displayLeaderBoard()
                                }}

                                RenderHome={() => {
                                    setShowHomeScreen(true)
                                    displayGame()
                                }}
                            />
                        </>
                    ) : null}

                </div>

            </>
        )
    )
}

export default Profile



