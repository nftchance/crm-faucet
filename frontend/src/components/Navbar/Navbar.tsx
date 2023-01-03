import drop from '../../assets/white-drop.svg';

import "./Navbar.css"

const Navbar = () => {
    return (
        <nav>
            <h3>
                <img src={drop} alt="drop" />
                Faucet
            </h3>
        </nav>
    )
}

export default Navbar;