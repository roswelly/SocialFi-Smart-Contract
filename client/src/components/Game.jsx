import React, { useEffect, useState } from 'react'
// import { useAuth0 } from "@auth0/auth0-react";

import '../styles/GameStyles.css'
import R1 from '../assets/R1.svg'
import R2 from '../assets/R2.svg'
import R3 from '../assets/R3.svg'
import R4 from '../assets/R4.svg'
import R5 from '../assets/R5.svg'
import R6 from '../assets/R6.svg'
import blank from '../assets/blank.png'
import ScoreBoard from './ScoreBoard'
// import TickSound from '../assets/timer.mp3'
// import PointIncreaseSound from '../assets/points.mp3'


const width = 8
const candyColours = [R1, R2, R3, R4, R5, R6]


const Game = ({ ExportScore }) => {

    // const { user } = useAuth0();
    const [currentColour, setCurrentColour] = useState([])
    const [squareBeingDragged, setSquareBeingDragged] = useState(null)
    const [squareBeingReplaced, setSquareBeingReplaced] = useState(null)
    const [score, setScore] = useState(0)
    const [countDown, setCountDowm] = useState(60)
    // const audio = new Audio(TickSound)
    // const pointAudio = new Audio(PointIncreaseSound)



    // eslint-disable-next-line
    function checkForColumnOfFour() {
        for (let i = 0; i <= 39; i++) {
            const columnOfFour = [i, i + width, i + width * 2, i + width * 3]
            const deceidedColour = currentColour[i]
            const isBlank = currentColour[i] === blank

            if (columnOfFour.every(square => currentColour[square] === deceidedColour && !isBlank)) {
                setScore((score) => score + 4)
                columnOfFour.forEach(square => currentColour[square] = blank)
                return true
            }
        }
    }

    // eslint-disable-next-line
    function checkForRowOfFour() {
        for (let i = 0; i < 64; i++) {
            const rowOfFour = [i, i + 1, i + 2, i + 3]
            const deceidedColour = currentColour[i]
            const notValid = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55, 62, 63, 64]
            const isBlank = currentColour[i] === blank

            if (notValid.includes(i)) continue

            if (rowOfFour.every(square => currentColour[square] === deceidedColour && !isBlank)) {
                setScore((score) => score + 4)
                rowOfFour.forEach(square => currentColour[square] = blank)
                return true

            }
        }
    }

    // eslint-disable-next-line
    function checkForColumnOfThree() {
        for (let i = 0; i <= 47; i++) {
            const columnOfThree = [i, i + width, i + width * 2]
            const deceidedColour = currentColour[i]
            const isBlank = currentColour[i] === blank

            if (columnOfThree.every(square => currentColour[square] === deceidedColour && !isBlank)) {
                setScore((score) => score + 3)
                columnOfThree.forEach(square => currentColour[square] = blank)
                return true
            }
        }
    }


    // eslint-disable-next-line
    function checkForRowOfThree() {
        for (let i = 0; i < 64; i++) {
            const rowOfThree = [i, i + 1, i + 2]
            const deceidedColour = currentColour[i]
            const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 63, 64]
            const isBlank = currentColour[i] === blank

            if (notValid.includes(i)) continue

            if (rowOfThree.every(square => currentColour[square] === deceidedColour && !isBlank)) {
                setScore((score) => score + 3)
                rowOfThree.forEach(square => currentColour[square] = blank)
                return true
            }
        }
    }


    // eslint-disable-next-line
    function moveIntoSquareBelow() {
        for (let i = 0; i <= 55; i++) {
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7]
            const isFirstRow = firstRow.includes(i)

            if (isFirstRow && currentColour[i] === blank) {
                let randomNumber = Math.floor(Math.random() * candyColours.length)
                currentColour[i] = candyColours[randomNumber]
            }

            if ((currentColour[i + width]) === blank) {
                currentColour[i + width] = currentColour[i]
                currentColour[i] = blank
            }
        }
    }

    function dragStart(e) {
        //console.log(e.target)
        //console.log('started')
        setSquareBeingDragged(e.target)

    }

    function dragDrop(e) {
        //console.log(e.target)
        //console.log('dropped')
        setSquareBeingReplaced(e.target)
    }
    function dragEnd(e) {
        //console.log(e.target)
        //console.log('end')

        const squareBeingDraggedId = parseInt(squareBeingDragged.getAttribute('data-id'))
        const squareBeingReplacedId = parseInt(squareBeingReplaced.getAttribute('data-id'))

        currentColour[squareBeingReplacedId] = squareBeingDragged.getAttribute('src')
        currentColour[squareBeingDraggedId] = squareBeingReplaced.getAttribute('src')

        // console.log(squareBeingDraggedId, squareBeingReplacedId)

        const validMoves = [
            squareBeingDraggedId - 1,
            squareBeingDraggedId - width,
            squareBeingDraggedId + 1,
            squareBeingDraggedId + width,
        ]

        const validMMove = validMoves.includes(squareBeingReplacedId)


        const isAColOfFour = checkForColumnOfFour()
        const isARowOfFour = checkForRowOfFour()
        const isAColOfThree = checkForColumnOfThree()
        const isARowOfThree = checkForRowOfThree()

        if (squareBeingReplacedId &&
            validMMove &&
            (isAColOfFour || isARowOfFour || isAColOfThree || isARowOfThree)) {
            setSquareBeingDragged(null)
            setSquareBeingReplaced(null)
        } else {
            //  setCurrentColour[squareBeingReplacedId] = squareBeingReplaced.getAttribute('src')
            currentColour[squareBeingReplacedId] = squareBeingReplaced.getAttribute('src')
            currentColour[squareBeingDraggedId] = squareBeingDragged.getAttribute('src')
            setCurrentColour([...currentColour])

        }
    }

    function CreateBoard() {
        const randomColorArrangement = []
        for (let i = 0; i < width * width; i++) {
            const randomColor = candyColours[Math.floor(Math.random() * candyColours.length)]
            randomColorArrangement.push(randomColor)
        }
        setCurrentColour(randomColorArrangement)
    }

    // Renders board
    useEffect(() => {
        CreateBoard()
        // console.log(currentColour)
    }, [])

    // Checks for matches every 250ms
    useEffect(() => {

        const timer = setInterval(() => {
            checkForColumnOfFour()
            checkForRowOfFour()
            checkForColumnOfThree()
            checkForRowOfThree()
            moveIntoSquareBelow()
            setCurrentColour([...currentColour])
        }, 250)
        return () => clearInterval(timer)
    }, [checkForColumnOfFour, checkForRowOfFour, checkForColumnOfThree, checkForRowOfThree, moveIntoSquareBelow, currentColour])


    // timer
    useEffect(() => {
        if (countDown < 1) {
            ExportScore(score)
            // console.log("Game Score", score);
            return
        }


        const timer = setInterval(() => {
            setCountDowm(() =>
                countDown - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [countDown, ExportScore, score])



    return (
        <div className="container text-center mt-1 lg:mt-3">
            <div
                className="flex p-3 text-center justify-center">
                <div
                    id="game-box"
                    className="mt-10 lg:mt-0"

                >
                    {currentColour.map((clr, index) => {

                        return (
                            <img
                                key={index}
                                src={clr}
                                alt="clr"
                                data-id={index}
                                draggable={true}
                                onDragStart={dragStart}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={(e) => e.preventDefault()}
                                onDragLeave={(e) => e.preventDefault()}
                                onDrop={dragDrop}
                                onDragEnd={dragEnd}
                                style={{ cursor: "pointer" }}
                            />

                        )
                    })}
                </div>
            </div>
            <div className="flex align-center justify-center items-center gap-10">
                {/* <p>
                    <span className="flex align-center justify-center items-center">
                        <img src={user.picture} alt={user.name} width="50px" />
                        {user.name}
                    </span>
                </p> */}
                <ScoreBoard
                    score={score} />

                <div className="font-semibold">
                    Time Left : {countDown}s
                </div>


            </div>
        </div>

    )
}

export default Game
