import { Link } from 'react-router-dom';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import drop from '../../assets/white-drop.svg';

import "./Navbar.css"

const Navbar = () => {
    return (
        <nav>
            <h3><Link to="/">
                <img src={drop} alt="drop" />
                Faucet
            </Link></h3>

            <div className="links">
                <Link to="/buckets">Your Buckets</Link>

                <div>
                    <ConnectButton
                        label="Connect"
                        accountStatus={"address"}
                        chainStatus={"icon"}
                    />
                </div>
            </div>
        </nav>
    )
}

export default Navbar;