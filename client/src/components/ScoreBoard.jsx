import React from 'react'

const ScoreBoard = ({ score }) => {
    return (
        <div >
            <span className="font-semibold "> Your Score : {score}</span>
        </div>
    )
}

export default ScoreBoard
