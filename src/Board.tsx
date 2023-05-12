import './Board.css'
import { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";

interface Props {
    socket: Socket;
    color: string,
    room: string,
}

function Board(props: Props) {
    const [board, setBoard] = useState(Array(6).fill(Array(7).fill('gray')));
    const [setted, setSetted] = useState(-1);

    const updateBoard = (indexC: number, indexR: number) => {
        if (props.room != '') {
            props.socket.emit('setBoard', {
                socket_id: props.socket.id,
                room_id: props.room,
                board: board,
                column: indexC,
                row: indexR,
                color: props.color,
            });
            setSetted(indexR);
        }
    }

    useEffect(() => {
        props.socket.on('newBoard', (data) => {
            setBoard(data.board);
        })
    }, [setted])

    return (
        <>
            <p>Tablero:</p>
            {board.map((circle: [], indexC) => {
                return (
                    <div className='columns'>
                        {circle.map((circle: string, indexR) => {
                            return (
                                <div onClick={() => updateBoard(indexC, indexR)} className="circle" style={{ backgroundColor: `${circle}` }} >
                                </div >
                            )
                        })}
                    </div>
                )
            })}
        </>
    )
}

export default Board
