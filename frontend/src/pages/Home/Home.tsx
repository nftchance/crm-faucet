import Navbar from "../../components/Navbar/Navbar";
import Form from "../../components/Form/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Home = () => {
    return (
        <>
            <div className="hero blue">
                <div className="content">
                    <div className="container">
                        <Navbar />

                        <h1>Grow faster with instant access to contact information and user behavior of ideal users for your Web3 product.</h1>

                        <Form />
                    </div>
                </div>
            </div>

            <div className="import">
                <div className="container">
                    <div className="content">
                        <div>
                            <h2>Import your new audience contacts into your favorite CRM.</h2>
                            <p>We provide the leads, you turn them into evangelists. Export all the contacts in a single click and take them with you.</p>
                            <button className="cta" onClick={() => window.scrollTo(0, 0)}>
                                <FontAwesomeIcon icon={['fas', 'plus']} style={{ marginRight: 10 }}/>
                                Export Contacts</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;