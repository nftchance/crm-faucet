import { useEffect, useState } from "react"

import { DragDropContext, DragStart, DraggableLocation, DropResult } from 'react-beautiful-dnd';

import { mutliDragAwareReorder, multiSelectTo as multiSelect } from '../Priorities/utils';
import initial from "../Priorities/data"

import Priorities from "../Priorities/Priorities"

import type { Task, Id, Entities } from '../Priorities/types';
import type { Result as ReorderResult } from '../Priorities/utils';

import "./Form.css"

const getTasks = (entities: Entities, columnId: Id): Task[] =>
    entities.columns[columnId].taskIds.map((taskId: Id): Task => entities.tasks[taskId]);

const Form = () => {
    const [entities, setEntities] = useState<Entities>(initial);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Id[]>([]);
    const [draggingTaskId, setDraggingTaskId] = useState<Id | null>(null);

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

        const processed: ReorderResult = mutliDragAwareReorder({
            entities,
            selectedTaskIds,
            source,
            destination,
        });

        setEntities(processed.entities);
        setSelectedTaskIds(processed.selectedTaskIds);
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

    const onWindowClick = (event: MouseEvent) => {
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

    const toggleSelection = () => { }

    const toggleSelectionInGroup = (taskId: Id) => { }

    const multiSelectTo = (newTaskId: Id) => { }

    const unselect = () => {
        setSelectedTaskIds([]);
    };

    const unselectAll = () => {
        setSelectedTaskIds([]);
    };

    useEffect(() => {
        // Enable the ability to use keyboard shortcuts and better UX controls.
        window.addEventListener('keydown', onWindowKeyDown);
        window.addEventListener('click', onWindowClick);
        window.addEventListener('touchend', onWindowTouchEnd);

        return () => {
            window.removeEventListener('keydown', onWindowKeyDown);
            window.removeEventListener('click', onWindowClick);
            window.removeEventListener('touchend', onWindowTouchEnd);
        };
    })

    return (
        <div className="form">
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
                            selectedTaskIds={selectedTaskIds}
                            draggingTaskId={draggingTaskId}
                            toggleSelection={toggleSelection}
                            toggleSelectionInGroup={toggleSelectionInGroup}
                            multiSelectTo={multiSelectTo}
                            // unselect={unselect}
                        />
                    )
                })}
            </DragDropContext>

            {/* <button className="cta">{totalPrice} <small>ETH</small> | Export Contacts</button> */}
        </div>
    )
}

export default Form;