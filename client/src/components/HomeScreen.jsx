import React from 'react'
import LogoutButton from "./LogoutButton"
const HomeScreen = ({ RenderGame, RenderLeaderBoard }) => {
    return (
        <div className="flex flex-col items-center justify-center align-center gap-3 mt-32 lg:mt-40">
            {/* <h1>Welcome to RoboDash</h1> */}
            <p className="text-center font-semibold lg:text-xl mx-8 lg:mx-32 lg:mb-4">RoboDash is a match three puzzle game.
                Once the game starts, you will have sixty seconds to score as much as possible
                by matching three or four robots horizontally or vertically. The top ten scores will be featured on the leaderboard.
                <br /> All the best!</p>

            <div className="flex flex-col lg:flex-row gap-4 mt-4">

                <button
                    className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded align-center"
                    style={{ width: "250px", outline: "none", border: "0" }}
                    onClick={() => RenderGame()}

                >
                    Start Game
                </button>

                <button
                    className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded align-center"
                    style={{ width: "250px", outline: "none", border: "0" }}
                    onClick={() => RenderLeaderBoard()}

                >
                    LeaderBoard
                </button>

            </div>
            <div className="mt-10 lg:hidden">
                <LogoutButton />
            </div>

        </div>
    )
}

export default HomeScreen
