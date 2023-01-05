import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Navbar from "../components/Navbar/Navbar"

const NotFound = () => { 
    return (
        <>
        <div className="hero blue">
            <div className="content">
                <div className="container">
                    <Navbar />

                    <h1>Woah! You found a page that doesn't exist.</h1>

                    <Link to="/" className="button">
                        <button className="cta">
                            <FontAwesomeIcon icon={['fas', 'arrow-left']} style={{ marginRight: 10 }}/>
                            Go Home
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    </>
    )
}

export default NotFound;