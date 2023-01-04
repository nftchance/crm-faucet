import drop from '../../assets/white-drop.svg';

import "./Navbar.css"

const Navbar = () => {
    return (
        <nav>
            <h3><a href="/">
                <img src={drop} alt="drop" />
                Faucet
            </a></h3>
        </nav>
    )
}

export default Navbar;