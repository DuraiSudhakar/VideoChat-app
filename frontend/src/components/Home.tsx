import { useState } from "react";
import Caller from "./Caller";
import props from "../WebRTC-Utilities/Type_Props";

const Home = ({ socket }: props) => {
    const [userN, setUserN] = useState<string>('');
    const [redirect, setRedirect] = useState(false);

    const sendUser = () => {
        socket.emit('new-user', userN);
        setRedirect(true);
    }

    return (
        <>
            {!redirect && <>
                <p>userName</p>
                <input type="text" value={userN} onChange={(e) => {
                    setUserN(e.target.value);
                }} />
                <input type="button" value="Connect" onClick={sendUser} />
            </>}
            {redirect && <>
                <p>{userN}</p>
                <Caller socket={socket} userN={userN} />
            </>}
        </>
    )
}

export default Home;