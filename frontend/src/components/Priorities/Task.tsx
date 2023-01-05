import styled from '@emotion/styled';
import { Draggable } from 'react-beautiful-dnd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { DraggableProvided } from 'react-beautiful-dnd';
import type { Task as TaskType } from './types';

const primaryButton = 0;

interface Props {
    task: TaskType;
    index: number;
}

const Container = styled.div`
  background-color: rgba(255,255,255,.15);
  color: rgba(255,255,255,.65);
  padding: 5px 30px;
  margin-bottom: 10px;
  border-radius: 9px;
  user-select: none;
  border: 1px solid rgba(255,255,255,.3);
  position: relative;
  backdrop-filter: blur(10px);

  &:hover,
  &:active {
    outline: none;
    border-color: white;
    color: white;
  }

  &:focus { 
    outline: none;
    color: white;
  }

  &::after {
    content: '';
    position: absolute;
    top: calc(50% - 6px);
    right: 15px;
    width: 12px;
    height: 12px;
    pointer-events: none;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 12px;
    // make hamburger bars
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(255,255,255,.65)' width='18px' height='18px'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'/%3E%3C/svg%3E");
}

  &:focus::after,
  &:hover::after {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='18px' height='18px'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'/%3E%3C/svg%3E");
  }
`;

const Task = (props: Props) => {
    const onClick = (event: MouseEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        if (event.button !== primaryButton) {
            return;
        }

        event.preventDefault();
    };

    const onTouchEnd = (event: TouchEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        event.preventDefault();
    };

    return (
        <Draggable draggableId={props.task.id} index={props.index}>
            {(provided: DraggableProvided) => {
                const icon = props.task.id === 'email' ? ['fas', 'envelope'] : ['fab', props.task.id as any];

                return (
                    <Container
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={onClick as any}
                        onTouchEnd={onTouchEnd as any}
                        tabIndex={0}
                        role="button"
                        aria-label={props.task.content}
                    >
                        <div>
                            <FontAwesomeIcon icon={icon as any} style={{
                                marginRight: "10px",
                                width: "12px",
                            }} />
                            {props.task.content}
                        </div>
                    </Container>
                );
            }}
        </Draggable>
    )
}

export default Task;