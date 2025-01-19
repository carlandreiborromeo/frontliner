import { useState, useEffect } from "react";
import "./Game.css";

const cardsImg = [
    { src: "/img/Xavier.png", matched: false },
    { src: "/img/jorel.png", matched: false },
    { src: "/img/boholbg2.png", matched: false },
    { src: "/img/oner.png", matched: false },
    { src: "/img/kalvin.png", matched: false },
    { src: "/img/rhojem.png", matched: false },
];

function Project() {
    const [cards, setCards] = useState([]);
    const [turns, setTurns] = useState(0);
    const [choiceOne, setChoiceOne] = useState(null);
    const [choiceTwo, setChoiceTwo] = useState(null);
    const [disabled, setDisabled] = useState(false);
    const [timer, setTimer] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [playerName, setPlayerName] = useState("");
    const [intervalId, setIntervalId] = useState(null);
    
    const matchSound = new Audio('/img/gss1.mp3');
    const wrongSound = new Audio('/img/gsf1.mp3');
    const start = new Audio('/img/start.mp3');
    
    // Shuffle the cards using math Random giving + or - value to each 
    // card and giving them unique id by using map
    const shuffleCards = () => {
        const shuffledCards = [...cardsImg, ...cardsImg]
            .sort(() => Math.random() - 0.5)
            .map((card) => ({ ...card, id: Math.random() }));

        setCards(shuffledCards);
        setTurns(0);
        setChoiceOne(null);
        setChoiceTwo(null);
        setGameEnded(false);
        setTimer(0);
        setGameStarted(true);
        start.play()
        

        clearInterval(intervalId);
    };
    
//  !disabled: Ensures that the player cannot click more cards while the game is checking if two selected cards match.
// !(card === choiceOne || card === choiceTwo): Prevents the player from clicking the same card twice.
// !card.matched: Ensures that already matched cards cannot be clicked again
// First Click: card get stored in setchoiceone since it null{false}
// Second Click: cart get stored in setChoice2 since choice one is now updated and true 
// choiceOne now contains the first selected card. now this will trigger the effect choice1 === choice2
    const handleClick = (card) => {
        if (!disabled && !(card === choiceOne || card === choiceTwo || card.matched)) {
            choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
        }
    };

// check for match and update cards array by 1st iterating on all 
// the object(card) and returns a new array if a match was made 
    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true);
            if (choiceOne.src === choiceTwo.src) {
                setCards((cards) =>
                    cards.map((card) =>
                        card.src === choiceOne.src ? { ...card, matched: true } : card
                    )
                );
                matchSound.play();
                resetTurn();
            } else {
                wrongSound.play();
                setTimeout(() => resetTurn(), 1000);
            }
        }
    }, [choiceOne, choiceTwo]);

    const resetTurn = () => {
        setChoiceOne(null);
        setChoiceTwo(null);
        setTurns((turns) => turns + 1);
        setDisabled(false);
    };

    useEffect(() => {
        if (gameStarted && !gameEnded) {
            const id = setInterval(() => setTimer((timer) => timer + 1), 1500);
            setIntervalId(id);

            return () => clearInterval(id);
        }
    }, [gameStarted, gameEnded]);

    useEffect(() => {
        if (cards.length > 0 && cards.every((card) => card.matched)) {
            setGameEnded(true);
            setGameStarted(false);
            clearInterval(intervalId);
        }
    }, [cards]);

// this part handle's the play name
    const handleNameChange = (e) => {
        setPlayerName(e.target.value);
    };

    const saveGameData = async () => {
        if (!playerName || playerName.trim() === "") {
            alert("Name is required");
        } else {
            try {
                const response = await fetch("https://borromeo-gkeafza8gzfaebe0.southeastasia-01.azurewebsites.net/save-game", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: playerName,
                        turns,
                        time: timer,
                    }),
                });

                const result = await response.json();
                if (result.msg === "Game data saved") {
                    alert("Game data saved successfully!");
                } else {
                    alert("Failed to save game data");
                }
            } catch (error) {
                console.error("Error saving game data:", error);
                alert("Error saving game data");
            }
        }
    };

    return (
        <div className="project">
            <h1>Memory Card Game</h1>
            <h3>By: Carl Andrei DC. Borromeo</h3>
            <button onClick={shuffleCards} disabled={gameStarted && !gameEnded}>
                Start Game
            </button>
            {gameStarted && (
                <>
                    <p>Turns: {turns}</p>
                    <p className="timer">Time: {timer}s</p>
                </>
            )}

{/* this shows all the card by iterating on every card in the cards array and 
with the help also of key or id given to each card */}
            <div className="card-grid">               
{/* using map() each card is check or compare based on the condition if
 the 1st or 2nd click card mathes the card then it will flip and when match it will remain flip */}
                {cards.map((card) => (
                    <div
                        className={`card ${card === choiceOne || card === choiceTwo || card.matched ? "flipped" : ""}`}
                        key={card.id}
                    >
                        <img className="front" src={card.src} alt="card front" />
                        <img className="back" src="/img/back.png" onClick={() => handleClick(card)} alt="card back" />
                    </div>
                ))}
            </div>
            
{/* if the gameEnded becomes true the code after && gets executed  */}
            {gameEnded && (
                <div className="modal">
                    <h2>Game Over Kupal</h2>
                    <p>Turns: {turns}</p>
                    <p>Time: {timer}s</p>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={handleNameChange}
                        required
                    />
                    <button
                        onClick={() => {
                            if (!playerName || playerName.trim() === "") {
                                alert("Please enter your name before restarting the game.");
                            } else {
                                saveGameData();
                                shuffleCards();
                                setPlayerName(""); // Clear the player name
                            }
                        }}
                    >
                        Bagal mo Boss isa pa!
                    </button>
                </div>
            )}
        </div>
    );
}

export default Project;
