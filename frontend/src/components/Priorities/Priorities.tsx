import { Droppable, DroppableProvided, DroppableStateSnapshot } from "react-beautiful-dnd";

const Priorities = ({
    entities,
    selectedTaskIds,
    draggingTaskId,
}: {
    entities: Priority[],
    selectedTaskIds: string[],
    draggingTaskId: string | null,
}) => {
    return (
        <>
            <h1>Priorities</h1>
            <Droppable droppableId={"1"}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    // <TaskList
                    //     ref={provided.innerRef}
                    //     isDraggingOver={snapshot.isDraggingOver}
                    //     {...provided.droppableProps}
                    // >
                    //     {tasks.map((task: TaskType, index: number) => {
                    //         const isSelected: boolean = Boolean(
                    //             getSelectedMap(selectedTaskIds)[task.id],
                    //         );
                    //         const isGhosting: boolean =
                    //             isSelected &&
                    //             Boolean(draggingTaskId) &&
                    //             draggingTaskId !== task.id;
                    //         return (
                    //             <Task
                    //                 task={task}
                    //                 index={index}
                    //                 key={task.id}
                    //                 isSelected={isSelected}
                    //                 isGhosting={isGhosting}
                    //                 selectionCount={selectedTaskIds.length}
                    //                 toggleSelection={props.toggleSelection}
                    //                 toggleSelectionInGroup={props.toggleSelectionInGroup}
                    //                 multiSelectTo={props.multiSelectTo}
                    //             />
                    //         );
                    //     })}
                    //     {provided.placeholder}
                    // </TaskList>
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {/* TODO: Use the priority here. */}
                        <>
                            {entities.map((priority: TaskType, index: number) => {
                                return (
                                    <></>
                                    // <Priority
                                    //     task={priority}
                                    //     index={index}
                                    //     // key={priority.id}
                                    // />
                                )
                            })}
                        </>
                    </div>
                )}
            </Droppable>
        </>
    )
}

export default Priorities