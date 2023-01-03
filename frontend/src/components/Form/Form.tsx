import { useState } from "react"

import { FormControl, MenuItem, Select } from "@mui/material"

import { DragDropContext, DragStart, DraggableLocation, DropResult } from 'react-beautiful-dnd';

import Priorities from "../Priorities/Priorities"

import "./Form.css"

const Form = () => {
    const initial: {
        [key: string]: {
            id: string,
            title: string,
            tasks: {
                id: string,
                content: string,
                priority: string,
                price: number
            }[]
        }
    } = {
        "1": {
            id: "1",
            title: "First Priority",
            tasks: [
                {
                    id: "1",
                    content: "First Task",
                    priority: "1",
                    price: 1
                },
                {
                    id: "2",
                    content: "Second Task",
                    priority: "1",
                    price: 2
                },
            ]
        }
    };

    const [entities, setEntities] = useState(initial);
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

    const onDragStart = (start: DragStart) => {
        const id: string = start.draggableId;
        const selected: string | undefined = selectedTaskIds.find(
            (taskId: string): boolean => taskId === id,
        );

        // if dragging an item that is not selected - unselect all items
        if (!selected) {
            unselectAll();
        }
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

        // TODO: Implement the logic to handle 
        // const processed: ReorderResult = mutliDragAwareReorder({
        //     entities: entities,
        //     selectedTaskIds: selectedTaskIds,
        //     source,
        //     destination,
        // });

        // TODO: Enable 
        // setEntities(processed.entities);
        setDraggingTaskId(null);
    };

    const onWindowKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        if (event.key === 'Escape') {
            unselectAll();
        }
    };

    const onWindowClick = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
            return;
        }
        unselectAll();
    };

    const onWindowTouchEnd = (event: TouchEvent) => {
        if (event.defaultPrevented) {
            return;
        }
        unselectAll();
    };

    // TODO: Implement custom drag controls.

    const unselect = () => {
        setSelectedTaskIds([]);
    };

    const unselectAll = () => {
        setSelectedTaskIds([]);
    };

    return (
        <div className="form">
            <DragDropContext
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                <Priorities 
                    entities={entities}
                    selectedTaskIds={selectedTaskIds}
                    draggingTaskId={draggingTaskId}
                />
            </DragDropContext>

            {/* <button className="cta">{totalPrice} <small>ETH</small> | Export Contacts</button> */}
        </div>
    )
}

export default Form;