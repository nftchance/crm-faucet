// @flow
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { Droppable } from 'react-beautiful-dnd'

import Task from './Task';

import Tooltip from '../Tooltip/Tooltip';

import type { DroppableProvided } from 'react-beautiful-dnd';
import type { Column as ColumnType, Task as TaskType, Id } from './types';

interface Props {
    column: ColumnType;
    tasks: TaskType[];
    draggingTaskId: Id | null;
    tooltip: string;
}

const Container = styled.div`
  border-radius: none;
  border: none;
  background-color: none;
  display: flex;
  flex-direction: column;
`;

const Title = styled.label``;

const TaskList = styled.div`
  min-height: 200px;
  flex-grow: 1;
`;

const Priorities = (props: Props) => {
    const { column, tasks, tooltip } = props;

    return (
        <Container>
            <Title>{column.title}  <Tooltip text={tooltip} /></Title>

            <Droppable droppableId={column.id}>
                {(provided: DroppableProvided) => (
                    <TaskList
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {tasks.map((task: TaskType, index: number) => {
                            return (
                                <Task
                                    task={task}
                                    index={index}
                                    key={task.id}
                                />
                            );
                        })}
                        {provided.placeholder}
                    </TaskList>
                )}
            </Droppable>
        </Container>
    );
}

export default Priorities;