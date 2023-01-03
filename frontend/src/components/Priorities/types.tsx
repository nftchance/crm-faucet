import type { DraggableId, DraggableLocation } from 'react-beautiful-dnd';

type Id = string;

interface AuthorColors {
    soft: string,
    hard: string
}

interface Author {
    id: Id,
    name: string,
    avatarUrl: string,
    url: string,
    colors: AuthorColors
}

interface Quote {
    id: Id,
    content: string,
    author: Author
}

interface Dragging {
    id: DraggableId,
    location: DraggableLocation
}

interface QuoteMap {
    [key: string]: Quote[]
}

interface Task {
    id: Id,
    content: string
}

interface Column {
    id: Id,
    title: string,
    taskIds: Id[]
}

interface ColumnMap {
    [columnId: Id]: Column
}

interface TaskMap {
    [taskId: Id]: Task
}

interface Entities {
    columnOrder: Id[],
    columns: ColumnMap,
    tasks: TaskMap
}

export type { Id, AuthorColors, Author, Quote, Dragging, QuoteMap, Task, Column, ColumnMap, TaskMap, Entities };