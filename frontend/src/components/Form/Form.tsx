import { useState } from "react"

import { Input, FormControl, Select, MenuItem, OutlinedInput } from "@mui/material";
import { DragDropContext, DragStart, DraggableLocation, DropResult } from 'react-beautiful-dnd';

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
                    <label htmlFor="size">Size</label>
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
                        />
                    )
                })}
            </DragDropContext>

            <button className="primary">{10.2} <small>ETH</small> | Export Contacts</button>
        </div>
    )
}

export default Form;