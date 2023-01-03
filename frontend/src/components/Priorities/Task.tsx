import styled from '@emotion/styled';
import { Draggable } from 'react-beautiful-dnd';

import { grid, borderRadius } from './constants';

import type { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import type { Id, Task as TaskType } from './types';

const primaryButton = 0;

interface Props {
    task: TaskType;
    index: number;
    isSelected: boolean;
    isGhosting: boolean;
    selectionCount: number;
    toggleSelection: (taskId: Id) => void;
    toggleSelectionInGroup: (taskId: Id) => void;
    multiSelectTo: (taskId: Id) => void;
}

interface GetBackgroundColorArgs {
    isSelected: boolean;
    isDragging: boolean;
    isGhosting: boolean;
};

const getBackgroundColor = ({
    isSelected,
    isGhosting,
}: GetBackgroundColorArgs): string => {
    if (isGhosting) {
        return "red";
    }

    if (isSelected) {
        return "yellow";
    }

    return "rgba(255,255,255,.3)";
};

const getColor = ({ isSelected, isGhosting }: GetBackgroundColorArgs): string => {
    if (isGhosting) {
        return 'darkgrey';
    }
    if (isSelected) {
        return 'white';
    }

    return "rgba(255,255,255,.65)";
};

const Container = styled.div`
  background-color: ${(props: GetBackgroundColorArgs) => getBackgroundColor(props)};
  color: ${(props: GetBackgroundColorArgs) => getColor(props)};
  padding: 5px 30px;
  margin-bottom: ${grid}px;
  border-radius: ${borderRadius}px;
  user-select: none;
  font-size: 18px;
  border: 1px solid rgba(255,255,255,.3);
  /* needed for SelectionCount */
  position: relative;

  /* avoid default outline which looks lame with the position: absolute; */
  &:hover,
  &:active {
    outline: none;
    border-color: white;
  }

  &:focus { 
    outline: none;
  }
`;

const Content = styled.div``;
const size: number = 30;

const SelectionCount = styled.div`
  right: -${grid}px;
  top: -${grid}px;
  color: black;
  background: pin;
  border-radius: 50%;
  height: ${size}px;
  width: ${size}px;
  line-height: ${size}px;
  position: absolute;
  text-align: center;
  font-size: 0.8rem;
`;

const keyCodes = {
    enter: 13,
    escape: 27,
    arrowDown: 40,
    arrowUp: 38,
    tab: 9,
};

const Task = (props: Props) => {
    const onKeyDown = (
        event: KeyboardEvent,
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
    ) => {
        if (event.defaultPrevented) {
            return;
        }

        if (snapshot.isDragging) {
            return;
        }

        if (event.keyCode !== keyCodes.enter) {
            return;
        }

        // we are using the event for selection
        event.preventDefault();

        performAction(event);
    };

    // Using onClick as it will be correctly
    // preventing if there was a drag
    const onClick = (event: MouseEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        if (event.button !== primaryButton) {
            return;
        }

        // marking the event as used
        event.preventDefault();

        performAction(event);
    };

    const onTouchEnd = (event: TouchEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        // marking the event as used
        // we would also need to add some extra logic to prevent the click
        // if this element was an anchor
        event.preventDefault();
        props.toggleSelectionInGroup(props.task.id);
    };

    // Determines if the platform specific toggle selection in group key was used
    const wasToggleInSelectionGroupKeyUsed = (event: MouseEvent | KeyboardEvent) => {
        const isUsingWindows = navigator.platform.indexOf('Win') >= 0;
        return isUsingWindows ? event.ctrlKey : event.metaKey;
    };

    // Determines if the multiSelect key was used
    const wasMultiSelectKeyUsed = (event: MouseEvent | KeyboardEvent) => event.shiftKey;

    const performAction = (event: MouseEvent | KeyboardEvent) => {
        const {
            task,
            toggleSelection,
            toggleSelectionInGroup,
            multiSelectTo,
        } = props;

        if (wasToggleInSelectionGroupKeyUsed(event)) {
            toggleSelectionInGroup(task.id);
            return;
        }

        if (wasMultiSelectKeyUsed(event)) {
            multiSelectTo(task.id);
            return;
        }

        toggleSelection(task.id);
    };

    return (
        <Draggable draggableId={props.task.id} index={props.index}>
            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                const shouldShowSelection: boolean =
                    snapshot.isDragging && props.selectionCount > 1;

                return (
                    <Container
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                        isSelected={props.isSelected}
                        isGhosting={props.isGhosting}
                        onClick={onClick as any}
                        onKeyDown={(event: KeyboardEvent) =>
                            onKeyDown(event, provided, snapshot)
                        }
                        onTouchEnd={onTouchEnd as any}
                        tabIndex={0}
                        role="button"
                        aria-roledescription="Press space bar to lift the task"
                        aria-label={props.task.content}
                    >
                        <Content>{props.task.content}</Content>
                        {shouldShowSelection && (
                            <SelectionCount>{props.selectionCount}</SelectionCount>
                        )}
                    </Container>
                );
            }}
        </Draggable>
    )
}

export default Task;