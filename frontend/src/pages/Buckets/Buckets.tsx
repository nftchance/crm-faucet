import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar/Navbar";

import "./Buckets.css";

const Buckets = () => {
    const buckets = [
        {
            id: 1,
            size: 100,
            status: "Loading",
        },
        {
            id: 2,
            size: 200,
            status: "Loading",
        }
    ]

    const fetchBucket = (id: number) => {
        console.log(id)
    }

    const [secondsPassed, setSecondsPassed] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsPassed(secondsPassed + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [secondsPassed])

    return (
        <>
            <div className="hero blue">
                <div className="content">
                    <div className="container">
                        <Navbar />

                        <h1>Download your contact buckets at any time! They’re not going to go anywhere without you knowing.</h1>

                        <div className="buckets">
                            {buckets.map((bucket) => (
                                <div className="bucket" key={bucket.id}>
                                    <p>#{bucket.id}</p>
                                    <p>{bucket.size} Contacts</p>
                                    <p>// {bucket.status} {
                                        // if loading show ellipsis that animate with seconds passed
                                        // if ready show download button

                                        bucket.status === "Loading" && (
                                            <span className="loading">
                                                {secondsPassed % 3 === 0 ? (
                                                    <span>.</span>
                                                ) : secondsPassed % 3 === 1 ? (
                                                    <span>..</span>
                                                ) : (
                                                    <span>...</span>
                                                )}
                                            </span>
                                        )
                                    }</p>
                                    
                                    {bucket.status === "Ready" && (
                                        <button onClick={() => fetchBucket(bucket.id)}>Download</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Buckets;