import React, { useState, useEffect } from 'react'
import '../styles/TableStyles.css'
import axios from 'axios'
import ScaleLoader from "react-spinners/ScaleLoader";
import LogoutButton from './LogoutButton';
// import { useAuth0 } from "@auth0/auth0-react"
const baseUrl = "https://robo-dash.onrender.com"
// const baseUrl = "http://localhost:5000"



const LeaderBoard = ({ renderBoard, RenderHome }) => {
    const [leaderBoardData, SetLeaderBoardData] = useState([])
    // const { user } = useAuth0();

    useEffect(() => {
        axios.get(`${baseUrl}/ScoreBoard`)
            .then((response) => {
                SetLeaderBoardData(response.data)
                // console.log(leaderBoardData)

            })
    }, [])


    return (


        <div
            className="mt-12 lg:mt-8"

        //  className="flex flex-col items-center justify-center h-screen gap-2"
        >

            <p className="text-center font-semibold mb-4 text-2xl lg:mb-10">Top Players</p>

            <div>
                {leaderBoardData.length !== 0 ?

                    <table className=" flex flex-col rounded-lg lg:rounded-lg overflow-hidden lg:table-auto ">
                        <thead style={{ backgroundColor: "#393e46" }}>
                            <tr className='text-white p-2'
                                style={{ backgroundColor: "#393e46" }}
                            >
                                <th
                                    id="position"
                                >Position</th>
                                <th
                                    id="image"
                                >User</th>
                                <th
                                    id="name"
                                >Name</th>
                                <th
                                    id="score" >Score</th>
                            </tr>
                        </thead>

                        {leaderBoardData.map((scoreInfo, index) => {

                            return (
                                <tbody>
                                    <tr
                                        key={index}
                                        className={index % 2 === 0 ? "bg-white text-black" : "bg-gray-300 text-black"}>
                                        <td id="position">{parseInt(index) + 1}</td>
                                        <td id="image" className="flex align-center items-center justify-center">
                                            <img src={scoreInfo.UserImage}
                                                alt="data"
                                                draggable={false} />
                                        </td>
                                        <td id="name"
                                        // className={scoreInfo.UserName === user.name ? "text-red-700" : null}
                                        >
                                            {scoreInfo.UserName}
                                        </td>
                                        <td id="score">{scoreInfo.UserScore}</td>
                                    </tr>
                                </tbody>
                            )
                        })}

                    </table>
                    : (
                        <div className="flex align-center justify-center">
                            <ScaleLoader
                                color="#393e46" />
                        </div>
                    )}
            </div>



            <div className="flex flex-col lg:flex-row align-center justify-center items-center gap-4 mt-4 mb-8">

                <button
                    className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded align-center"
                    style={{ width: "250px", outline: "none", border: "0" }}
                    onClick={() => renderBoard()}>
                    Play Again
                </button>

                <button
                    className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded align-center"
                    style={{ width: "250px", outline: "none", border: "0" }}
                    onClick={() => RenderHome()}>
                    Home
                </button>

                <div className="mt-8 lg:hidden">
                    <LogoutButton />
                </div>
            </div>

            {leaderBoardData.length === 0 ?
                <h1 className="mt-20 mx-3 lg:mx-40 text-center lg:text-xl">As the server is hosted on a free heroku account, it enters "sleep mode" when not in use for 60 minutes.
                    If you notice a delay please allow a few seconds for the server to wake up.</h1>
                : null}

        </div>
    )
}

export default LeaderBoard
