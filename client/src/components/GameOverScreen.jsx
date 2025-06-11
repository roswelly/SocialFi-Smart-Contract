import React, { useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react"
import axios from 'axios'
// import LeaderBoard from './LeaderBoard'
const baseUrl = "https://robo-dash.onrender.com"
// const baseUrl = "http://localhost:5000"

export const GameOverScreen = ({ AlterRender, score, LeaderBoards, RenderHome }) => {
    const { user } = useAuth0()

    // eslint-disable-next-line
    async function uploadScoreToDB() {

        const scoreSchema = {
            userImage: user.picture,
            userName: user.name,
            userScore: score
        }

        try {
            await axios.post(`${baseUrl}/userScores`, scoreSchema)
            console.log("Updated the scores to the database")
        } catch (Err) {
            console.log(Err.message)
        }
    }

    useEffect(() => {
        uploadScoreToDB()
    }, [uploadScoreToDB])

    return (
        <div className="flex flex-col align-center justify-center items-center h-screen gap-5">
            <h1 className="text-center text-2xl">Game over! Your Score is {score}</h1>
            <button
                className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded align-center"
                style={{ width: "250px", outline: "none", border: "0" }}
                onClick={() => AlterRender()}
            >
                Play Again
            </button>

            <button
                className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded align-center"
                style={{ width: "250px", outline: "none", border: "0" }}
                onClick={() => LeaderBoards()}
            >
                LeaderBoard
            </button>

            <button
                className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded align-center"
                style={{ width: "250px", outline: "none", border: "0" }}
                onClick={() => RenderHome()}
            >
                Home
            </button>
        </div>
    )
}
