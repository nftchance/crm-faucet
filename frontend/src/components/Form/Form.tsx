import { useEffect, useMemo, useState } from "react"
import { useDebounce } from 'use-debounce'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { FormControl, Select, MenuItem } from "@mui/material";
import { DragDropContext, DragStart, DraggableLocation, DropResult } from 'react-beautiful-dnd';

import { ethers } from "ethers";
import { useAccount, usePrepareContractWrite, useContractWrite } from 'wagmi'

import Priorities from "../Priorities/Priorities"
import { mutliDragAwareReorder } from '../Priorities/utils';
import { entities as initialEntities, sizes } from "../Priorities/data"

import Tooltip from "../Tooltip/Tooltip"
import { tooltips } from "./data"

import type { Task, Id, Entities } from '../Priorities/types';
import type { Result as ReorderResult } from '../Priorities/utils';

import "./Form.css"

const getTasks = (entities: Entities, columnId: Id): Task[] =>
    entities.columns[columnId].taskIds.map((taskId: Id): Task => entities.tasks[taskId]);

const Form = () => {
    const { address, isConnected } = useAccount()

    const [size, setSize] = useState(sizes.Sample);
    const [entities, setEntities] = useState<Entities>(initialEntities);
    const [draggingTaskId, setDraggingTaskId] = useState<Id | null>(null);

    const [referrerCollapsed, setReferrerCollapsed] = useState<boolean>(true);
    const [referrer, setReferrer] = useState<string>("");


    const [debouncedSize] = useDebounce(size, 500)
    const [debouncedEntities] = useDebounce(entities, 500)
    const [debouncedReferrer] = useDebounce(referrer, 500)

    const [signature, setSignature] = useState<string>("");

    const nonce = 1;
    const tail = "0x"

    const referrerIsEthereumAddress = referrer.length === 42 && referrer.startsWith("0x");

    const free = 5;
    const base = 0.0005;
    const price = size > free ? size * base : 0;

    const bodyHash = useMemo(() => {
        if (!isConnected) return "0x"

        return ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "address", "bytes"],
            [
                nonce,
                debouncedSize,
                referrerIsEthereumAddress ? debouncedReferrer : address,
                tail
            ]
        );
    }, [isConnected])

    // TODO: Read nonce from the contract
    // TODO: Read price from the contract
    // TODO: Figure out how to get value working
    // TODO: Build the tail

    const { config } = usePrepareContractWrite({
        address: '0x711Ce9ea77B7f3B7A2718066133DC3C1888F4Bbe',
        abi: [
            {
                "inputs": [
                    {
                        "internalType": "bytes",
                        "name": "_body",
                        "type": "bytes"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_signature",
                        "type": "bytes"
                    }
                ],
                "name": "drip",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ],
        functionName: 'drip',
        args: [
            bodyHash as any,
            signature as any
        ],
        enabled: isConnected && signature != "",
        overrides: {
            value: ethers.utils.parseEther(price.toString())
        }
    })

    const { write } = useContractWrite(config)

    const onDragStart = (start: DragStart) => {
        setDraggingTaskId(start.draggableId);
    }

    const onDragEnd = (result: DropResult) => {
        const destination: DraggableLocation | null | undefined = result.destination;
        const source: DraggableLocation = result.source;

        // nothing to do
        if (!destination || result.reason === 'CANCEL') {
            setDraggingTaskId(null);
            return;
        }

        const processed: ReorderResult = mutliDragAwareReorder({
            entities,
            selectedTaskIds: [draggingTaskId as Id],
            source,
            destination,
        });

        setEntities(processed.entities);
        setDraggingTaskId(null);
    };

    useEffect(() => {
        const onFormStateChange = () => {
            const data = {
                caller: address,
                nonce,
                size: debouncedSize,
                referrer: referrerIsEthereumAddress ? debouncedReferrer : address,
                tail
            }

            fetch("http://localhost:8000/spout/authorize/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }

                    return response;
                })
                .then(async (response) => {
                    const res = await response.json()

                    console.log('Signature:', res.signature)

                    setSignature(res.signature)
                });
        }

        if (!isConnected) return

        onFormStateChange()
    }, [isConnected, address, debouncedSize, debouncedEntities, debouncedReferrer])

    return (
        <div className="form">
            <div className="form__input">
                <FormControl fullWidth>
                    <label htmlFor="size">
                        Size
                        <Tooltip text={tooltips.size} />
                    </label>
                    <Select
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="select"
                    >
                        {Object.entries(sizes).map(([name, value]) => (
                            <MenuItem key={value} value={value}>
                                <div className="select__option">
                                    <span>{name}:</span>
                                    <span>{value}</span>
                                </div>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <DragDropContext
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                {entities.columnOrder.map((columnId: Id) => {
                    const column: any = entities.columns[columnId];
                    const tasks: Task[] = getTasks(entities, columnId);

                    return (
                        <Priorities
                            key={column.id}
                            column={column}
                            tasks={tasks}
                            draggingTaskId={draggingTaskId}
                            tooltip={tooltips.priorities}
                        />
                    )
                })}
            </DragDropContext>

            <div className="form__input">
                <FormControl fullWidth>
                    <label htmlFor="referrer">
                        Referral Code
                        <Tooltip text={tooltips.referrer} />

                        <span
                            className="form__input__collapse"
                            onClick={() => setReferrerCollapsed(!referrerCollapsed)}
                            style={{ float: "right", cursor: "pointer" }}
                        >
                            {referrerCollapsed ? (
                                <FontAwesomeIcon icon={['fas', 'plus']} />
                            ) : (
                                <FontAwesomeIcon icon={['fas', 'minus']} />
                            )}
                        </span>
                    </label>
                    {!referrerCollapsed && (
                        <>
                            <input
                                type="text"
                                id="referrer"
                                value={referrer}
                                onChange={(e) => setReferrer(e.target.value)}
                                placeholder="0x0000....0000"
                            />

                            {/* If the address provided is invalid, show an error message */}
                            {referrer && !referrerIsEthereumAddress && (
                                <span className="form__input__error">
                                    <small>Please enter a valid referral code in the form of an Ethereum address.</small>
                                </span>
                            )}
                        </>
                    )}
                </FormControl>
            </div>

            <button
                className="primary"
                disabled={!write}
            ><span>{price} <small>ETH</small> | Export Contacts</span></button>
        </div>
    )
}

export default Form;