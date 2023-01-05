import { useState } from "react"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { FormControl, Select, MenuItem } from "@mui/material";
import { DragDropContext, DragStart, DraggableLocation, DropResult } from 'react-beautiful-dnd';

import Tooltip from "../Tooltip/Tooltip"

import { tooltips } from "./data"

import { mutliDragAwareReorder } from '../Priorities/utils';
import { entities as initialEntities, sizes } from "../Priorities/data"
import Priorities from "../Priorities/Priorities"

import type { Task, Id, Entities } from '../Priorities/types';
import type { Result as ReorderResult } from '../Priorities/utils';

import "./Form.css"

const getTasks = (entities: Entities, columnId: Id): Task[] =>
    entities.columns[columnId].taskIds.map((taskId: Id): Task => entities.tasks[taskId]);

const Form = () => {
    const [size, setSize] = useState(sizes.Sample);
    const [entities, setEntities] = useState<Entities>(initialEntities);
    const [draggingTaskId, setDraggingTaskId] = useState<Id | null>(null);

    const [referrerCollapsed, setReferrerCollapsed] = useState<boolean>(true);
    const [referrer, setReferrer] = useState<string>("");

    const referrerIsEthereumAddress = referrer.length === 42 && referrer.startsWith("0x");

    const price = size > 5 ? size * 0.0005 : 0; // 0.0005 is the price per unit

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

    console.log(entities, draggingTaskId)

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
                        {/* Create select options with the name and then size value */}
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

                            {/* // If the address provided is invalid, show an error message */}
                            {referrer && !referrerIsEthereumAddress && (
                                <span className="form__input__error">
                                    <small>Please enter a valid referral code in the form of an Ethereum address.</small>
                                </span>
                            )}
                        </>
                    )}
                </FormControl>
            </div>

            <button className="primary">{price} <small>ETH</small> | Export Contacts</button>
        </div>
    )
}

export default Form;