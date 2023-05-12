import { useState, useEffect } from 'react';
import './App.css'
import { io } from 'socket.io-client'
import Board from './Board';

const socket = io('http://localhost:3000');

function App() {
  const [name, setName] = useState('');
  const [opponent, setOpponent] = useState({ name: '', type: 0 });
  const [room, setRoom] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [gameReady, setGameReady] = useState(false);
  const [turn, setTurn] = useState(false);
  const [play, setPlay] = useState('');
  const [decision, setDecision] = useState('');
  const [color, setColor] = useState('');

  const createRoom = () => {
    if (name != '') {
      socket.emit('createRoom', {
        socket_id: socket.id,
        name: name,
      });
      setWaiting(true);
    }
  }

  const connectToRoom = () => {
    if (name != '' && room != '') {
      socket.emit('connectToRoom', {
        socket_id: socket.id,
        room_id: room,
        name: name,
      })
    }
  }

  const selectPlay = (play: string) => {
    setPlay(play);
    socket.emit('selectPlay', {
      room_id: room,
      name: name,
      play: play,
    });
    setTurn(false);
  }

  useEffect(() => {
    socket.on('createdRoom', (data) => {
      setRoom(data.room);
    })
    socket.on('playerJoined', (data) => {
      setWaiting(false);
      setOpponent({ name: data.name, type: data.type });
      setGameReady(true);
      setTurn(true);
      setColor(data.type == 1 ? "yellow" : data.type == 2 ? "red" : "gray")
    })
    socket.on('joinedToGame', (data) => {
      setOpponent({ name: data.name, type: data.type });
      setGameReady(true);
      setColor(data.type == 1 ? "yellow" : data.type == 2 ? "red" : "gray")
    })
    socket.on('turn', () => {
      setTurn(true);
    })
    socket.on('decision', (data) => {
      setDecision(data.decision);
    })
  }, [])

  return (
    <>
      {/* FIRST */}
      <img src="https://i.ibb.co/bNcLsSY/logo.png" className="logo" alt="logo" />
      <p>Policía, Ladrón y Dinero</p>
      {!waiting ? (
        <>
          <input type="text" placeholder='Nombre' value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={() => createRoom()}>Crear sala de juego</button>
          <br />
          <br />
          <input type="text" placeholder='Sala' value={room} disabled={waiting} onChange={(e) => setRoom(e.target.value)} />
          <button disabled={waiting} onClick={() => connectToRoom()}>Unirse a una sala</button>
        </>) : null}
      {/* MESSAGES */}
      {waiting ? (<><p>Esperando al oponente...</p><p>Sala de juego: {room}</p></>) :
        (<p>{opponent.type == 1 ? `${opponent.name} se ha unido` : opponent.type == 2 ? `Te has unido a la sala de ${opponent.name}` : null}</p>)}
      {/* PDL */}
      {gameReady && turn && decision == '' ? (
        <>
          <p>Selecciona tu jugada:</p>
          <button onClick={() => selectPlay('policia')}>Policía</button>
          <button onClick={() => selectPlay('ladron')}>Ladrón</button>
          <button onClick={() => selectPlay('dinero')}>Dinero</button>
        </>
      ) : play != '' ? (<p>Jugada seleccionada: {play}</p>) : null}
      {/* DECISION */}
      {decision != '' ? (<p>{decision}!</p>) : null}
      {decision.includes(name) && decision != '' ? (<p>Agrega tu ficha al tablero!</p>) : null}
      {/* BOARD */}
      {decision.includes(name) && decision != '' ? (<Board socket={socket} color={color} room={room} />) : null}
      <br />
      <button onClick={() => window.location.href = "/"}>Reinciar juego</button>
    </>
  )
}

export default App
