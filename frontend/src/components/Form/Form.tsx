import { useEffect, useMemo, useState, useCallback } from "react"
import { useDebounce } from 'use-debounce'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { FormControl, Select, MenuItem } from "@mui/material";
import { DragDropContext, DragStart, DraggableLocation, DropResult } from 'react-beautiful-dnd';

import { ethers } from "ethers";
import {
    useAccount,
    useProvider,
    usePrepareContractWrite,
    useContractWrite,
    useContractRead,
    useWaitForTransaction
} from 'wagmi'

import Priorities from "../Priorities/Priorities"
import { mutliDragAwareReorder } from '../Priorities/utils';
import { entities as initialEntities, sizes } from "../Priorities/data"

import Tooltip from "../Tooltip/Tooltip"
import { tooltips } from "./data"

import { FAUCET_ABI } from "../../abi/Faucet";

import type { Task, Id, Entities } from '../Priorities/types';
import type { Result as ReorderResult } from '../Priorities/utils';

import {
    Multicall,
    ContractCallResults,
    ContractCallContext,
} from 'ethereum-multicall';

import "./Form.css"

interface BodyHashProps {
    isConnected: boolean;
    nonce: number;
    size: number;
    referrer: string | undefined;
    tail: string;
}

interface SignatureProps {
    caller: `0x${string}` | undefined;
    nonce: number;
    size: number;
    referrer: string | undefined;
    tail: string;
}

interface MultiCallProps {
    caller: `0x${string}` | undefined;
    size: number;
    referrer: string | undefined;
    tail: string;
}

interface TransactionArgs {
    args: string[],
    overrides: {
        value: ethers.BigNumber;
    }
}

const FAUCET_CONTRACT = {
    address: '0x4b759EC94AF514bb846aC3D4Dd1934e8E2Bc73C6',
    abi: FAUCET_ABI,
}

const FAUCET_INTERFACE = new ethers.utils.Interface(FAUCET_CONTRACT.abi)

const getTasks = (entities: Entities, columnId: Id): Task[] =>
    entities.columns[columnId].taskIds.map((taskId: Id): Task => entities.tasks[taskId]);

const getBodyHash = ({ isConnected, nonce, size, referrer, tail }: BodyHashProps) => {
    if (!isConnected) return "0x"

    return ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256", "address", "bytes"],
        [
            nonce,
            size,
            referrer,
            tail
        ]
    );
}

const getSignature = async ({ caller, nonce, size, referrer, tail }: SignatureProps) => {
    const data = {
        caller,
        nonce,
        size,
        referrer,
        tail
    }

    const response = await fetch("http://localhost:8000/spout/authorize/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })


    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const res = await response.json()

    return res.signature;
}

const getTail = () => {
    return "0x"
}

const Form = () => {
    const { address, isConnected } = useAccount()
    const provider = useProvider()
    const multicall = new Multicall({
        ethersProvider: provider,
        tryAggregate: true
    });

    const [size, setSize] = useState(sizes.Sample);
    const [entities, setEntities] = useState<Entities>(initialEntities);
    const [draggingTaskId, setDraggingTaskId] = useState<Id | null>(null);

    const [referrerCollapsed, setReferrerCollapsed] = useState<boolean>(true);
    const [referrer, setReferrer] = useState<string>("");

    const [debouncedSize] = useDebounce(size, 500)
    const [debouncedEntities] = useDebounce(entities, 500)
    const [debouncedReferrer] = useDebounce(referrer, 500)

    const [transactionArgs, setTransactionArgs] = useState<TransactionArgs | undefined>();

    const tail = getTail();

    const referrerIsEthereumAddress = debouncedReferrer.length === 42 && debouncedReferrer.startsWith("0x");

    // TODO: Figure out how to get value working
    // TODO: Build the tail
    // TODO: Right now when you change accounts, it's borked

    const { config } = usePrepareContractWrite({
        ...FAUCET_CONTRACT,
        functionName: 'drip',
        enabled: isConnected && transactionArgs !== undefined,
        // args: transactionArgs,
        ...transactionArgs
    })

    const contractWrite = useContractWrite(config)

    const { data: txData, isLoading: isLoadingTx, isError: isErrorTx } = useWaitForTransaction({
        hash: contractWrite.data?.hash,
    })

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
        const getMulticall = async ({ caller, size, referrer, tail }: MultiCallProps) => {
            const faucetMulticalls: ContractCallContext[] = [
                {
                    reference: 'faucet',
                    contractAddress: FAUCET_CONTRACT.address,
                    abi: [
                        FAUCET_INTERFACE.getFunction('price').format('full'),
                        FAUCET_INTERFACE.getFunction('nonces').format('full')
                    ],
                    calls: [
                        {
                            reference: 'price',
                            methodName: 'price',
                            methodParameters: [
                                caller,
                                size,
                                referrer,
                                tail
                            ],
                        },
                        {
                            reference: 'nonce',
                            methodName: 'nonces',
                            methodParameters: [
                                caller
                            ],
                        }
                    ]
                }
            ]

            const results: ContractCallResults = await multicall.call(faucetMulticalls)

            const priceRead = ethers.utils.formatEther(
                results.results.faucet.callsReturnContext[0].returnValues.toString()
            )

            const nonceRead = parseInt(
                results.results.faucet.callsReturnContext[1].returnValues.toString()
            )

            return {
                readPrice: priceRead,
                readNonce: nonceRead
            }
        }

        const onFormStateChange = async () => {
            const referrerAddress = referrerIsEthereumAddress ? debouncedReferrer : address || undefined

            const { readPrice, readNonce } = await getMulticall({
                caller: address,
                size: debouncedSize,
                referrer: referrerAddress,
                tail
            })

            const signature = await getSignature({
                caller: address,
                nonce: readNonce + 1,
                size: debouncedSize,
                referrer: referrerAddress,
                tail
            })

            const newTransactionArgs: TransactionArgs = {
                args: [
                    getBodyHash({
                        isConnected,
                        nonce: readNonce + 1,
                        size: debouncedSize,
                        referrer: referrerAddress,
                        tail
                    }),
                    signature,
                ],
                overrides: {
                    value: ethers.utils.parseEther(readPrice)
                }
            }

            setTransactionArgs(newTransactionArgs)
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
                disabled={!contractWrite.write}
                onClick={() => contractWrite.write?.()}
            >
                <span>{
                    ethers.utils.formatEther(transactionArgs?.overrides?.value ?? ethers.BigNumber.from(0))
                } <small>ETH</small> | Export Contacts</span>
            </button>
        </div>
    )
}

export default Form;