import "tailwindcss/tailwind.css"
import {useEffect, useState} from "react"

const fetchCards = async (setCards: Function, setError: Function) => {
    fetch("https://rickandmortyapi.com/api/character")
    .then(data => data.json())
    .then(data => setCards(data.results.map((card: {image: string}) => card.image)))
    .catch(error => {
        setError(error)
        throw error
    })
}

const selectPairs = (cards: string[]) => {
    let selectedCards = cards.sort(() => Math.floor(Math.random() * 2 - 1)).slice(0, 10),
        pairs = [...selectedCards, ...selectedCards].sort(() => Math.floor(Math.random() * 2 - 1))
    return pairs.map(image => ({image, selected: false}))
}

export default function App() {
    let [loaded, setLoaded] = useState<boolean>(false),
        [cards, setCards] = useState([]),
        [error, setError] = useState<boolean>(false),
        [currentPairs, setCurrentPairs] = useState<any[]>([]),
        [activeCards, setActiveCards] = useState<number[]>([]),
        [wrongPairs, setWrongPairs] = useState<number>(0),
        [ended, setEnded] = useState<boolean>(false)

    useEffect(() => {
        fetchCards(setCards, setError)
    }, [])

    const loadPairs = () => setCurrentPairs(selectPairs(cards))

    useEffect(function initGame () {
        if(cards.length > 0) {
            loadPairs()
            setTimeout(() => setLoaded(true), 500)
        }
    }, [cards])

    const selectCard = (index: number) => setActiveCards(prevActiveCards => ([...prevActiveCards, index]))

    const selectPair = (indexes: number[]) => setCurrentPairs(prevPairs => {
        let newPairs:any[] = [...prevPairs]
        newPairs[indexes[0]].selected = true
        newPairs[indexes[1]].selected = true
        return newPairs
    })

    useEffect(function verifyPair () {
        if(activeCards.length <= 1) return
        if(currentPairs[activeCards[0]].image === currentPairs[activeCards[1]].image) {
            selectPair(activeCards)
        } else {
            setWrongPairs(prevPairs => prevPairs + 1)
        }
        setTimeout(() => setActiveCards([]), 500)
    }, [activeCards])

    useEffect(function endGame () {
        loaded && currentPairs.every(pair => pair.selected) && setEnded(true)
    }, [currentPairs])

    const restartGame = () => {
        loadPairs()
        setWrongPairs(0)
        setEnded(false)
    }

    return (
        <main className="fixed top-0 bottom-0 left-0 right-0 grid place-content-center">
            {!loaded && (
                <div className={"fixed top-0 bottom-0 left-0 right-0 z-20 flex items-center justify-center " + (error ? "bg-red-500" : "bg-gray-200")}>
                    {error ?
                        <h1 className="text-white text-2xl">Something went wrong :(</h1> :
                        <h1 className="text-gray-500 text-2xl">Loading...</h1>
                    }
                </div>
            )}
            {ended && (
                <div className={"fixed top-0 bottom-0 left-0 right-0 z-20 flex flex-col gap-4 items-center justify-center bg-white"}>
                    <h1 className="text-gray-500 text-2xl">You were wrong {wrongPairs} times!</h1>
                    <button onClick={restartGame} className="bg-blue-500 px-8 py-2 text-xl text-white rounded hover:shadow">Play again</button>
                </div>
            )}
            {currentPairs.length > 0 && (
                <ul className="grid grid-cols-4 sm:grid-cols-5 p-4 gap-2">
                    {currentPairs.map(({image, selected}, index:number) => {
                        let active:Boolean = activeCards[0] === index || activeCards[1] === index
                        return (
                            <li
                                key={"card-" + index}
                                onClick={() => !active && !selected && selectCard(index)}
                                className={"duration-200 flex items-center justify-center" + (!active && !selected ? " hover:shadow-md cursor-pointer" : "")}
                            >
                                <img
                                    className={"size-28 rounded duration-200" + (active && !selected ? " border-4 border-blue-500 opacity-100" : " opacity-0")}
                                    src={image}
                                    alt={"Pair #" + (index + 1)}
                                />
                                <img
                                    className={"absolute size-28 rounded duration-200 " + (active || selected ? "opacity-0" : "opacity-100")}
                                    src={"default-card.jpeg"}
                                    alt="Default card"
                                />
                            </li>
                        )
                    })}
                </ul>
            )}
        </main>
    )
}