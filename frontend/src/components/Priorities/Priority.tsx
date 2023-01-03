import styled from '@emotion/styled';
import { Draggable } from 'react-beautiful-dnd';
import type { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

import { grid, borderRadius } from './constants';
import type { Id, Task as TaskType } from './types';

const primaryButton = 0;

interface Props {
    task: TaskType;
    index: number;
    isSelected: boolean;
    isGhosting: boolean;
    selectionCount: number;
    toggleSelection: (id: Id) => void;
    toggleSelectionInGroup: (id: Id) => void;
    multiSelectTo: (id: Id) => void;
}

interface GetBackgroundColorArgs {
    isDragging: boolean;
    isSelected: boolean;
    isGhosting: boolean;
}

const getBackgroundColor = ({
    isSelected,
    isDragging,
}: GetBackgroundColorArgs): string => {
    if (isDragging) {
        return 'lightgreen';
    }
    if (isSelected) {
        return 'lightblue';
    }
    return 'white';
}

const getColor = ({ isDragging }: { isDragging: boolean }): string => {
    if (isDragging) {
        return 'white';
    }
    return 'inherit';
}

const Container = styled.div<{
    isDragging: boolean;
    isSelected: boolean;
    isGhosting: boolean;
}>`
    user-select: none;
    padding: ${grid}px;
    margin-bottom: ${grid}px;
    border-radius: ${borderRadius}px;
    background-color: ${(props) => getBackgroundColor(props)};
    color: ${(props) => getColor(props)};
    border: 1px solid lightgrey;
    box-shadow: ${(props) =>
        props.isDragging ? '2px 2px 1px lightgrey' : 'none'};
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
`;

const Priority = ({
    task,
    index,
    isSelected,
    isGhosting,
    selectionCount,
    toggleSelection,
    toggleSelectionInGroup,
    multiSelectTo,
}: Props) => {
    const handleMouseDown = (event: React.MouseEvent) => {
        if (event.button !== primaryButton) {
            return;
        }

        if (isSelected) {
            toggleSelection(task.id);
            return;
        }

        if (event.shiftKey) {
            multiSelectTo(task.id);
            return;
        }

        if (event.metaKey || event.ctrlKey) {
            toggleSelectionInGroup(task.id);
            return;
        }

        toggleSelection(task.id);
    };

    return (
        <Draggable draggableId={`${task.id}`} index={index}>
            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                <Container
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    isDragging={snapshot.isDragging}
                    isSelected={isSelected}
                    isGhosting={isGhosting}
                    onMouseDown={handleMouseDown}
                    style={provided.draggableProps.style}
                >
                    {task.content}
                </Container>
            )}
        </Draggable>
    );
};

export default Priority;