import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type { TaskInput, TaskItem, TaskPriority } from '../types/task';
import { validateTaskInput } from '../utils/taskUtils';
import { db, handleFirestoreError, OperationType } from './firebaseConfig';

const TASKS_COLLECTION = 'tasks';

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (value && typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  return Date.now();
}

export function subscribeToUserTasks(
  userId: string,
  onTasks: (tasks: TaskItem[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const tasksQuery = query(collection(db, TASKS_COLLECTION), where('userId', '==', userId));

  return onSnapshot(
    tasksQuery,
    (snapshot) => {
      const items: TaskItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: typeof data.title === 'string' ? data.title : '',
          description: typeof data.description === 'string' ? data.description : '',
          priority: (['Low', 'Medium', 'High'].includes(data.priority) ? data.priority : 'Medium') as TaskPriority,
          dueDate: typeof data.dueDate === 'string' ? data.dueDate : '',
          completed: Boolean(data.completed),
          userId: typeof data.userId === 'string' ? data.userId : userId,
          createdAtMs: toMillis(data.createdAt),
          updatedAtMs: toMillis(data.updatedAt),
        };
      });
      onTasks(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, TASKS_COLLECTION);
      } catch (wrappedError) {
        onError(wrappedError instanceof Error ? wrappedError : new Error(String(wrappedError)));
      }
    }
  );
}

export async function createTaskInFirestore(userId: string, input: TaskInput): Promise<string> {
  const validation = validateTaskInput(input);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid task input.');
  }

  try {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      title: validation.sanitized.title,
      description: validation.sanitized.description,
      priority: validation.sanitized.priority,
      dueDate: validation.sanitized.dueDate,
      completed: false,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, TASKS_COLLECTION);
  }
}

export async function updateTaskInFirestore(taskId: string, input: TaskInput): Promise<void> {
  const validation = validateTaskInput(input);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid task input.');
  }

  const path = `${TASKS_COLLECTION}/${taskId}`;
  try {
    await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
      title: validation.sanitized.title,
      description: validation.sanitized.description,
      priority: validation.sanitized.priority,
      dueDate: validation.sanitized.dueDate,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleTaskCompletedInFirestore(taskId: string, completed: boolean): Promise<void> {
  const path = `${TASKS_COLLECTION}/${taskId}`;
  try {
    await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
      completed,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTaskInFirestore(taskId: string): Promise<void> {
  const path = `${TASKS_COLLECTION}/${taskId}`;
  try {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearCompletedTasksInFirestore(taskIds: string[]): Promise<void> {
  if (taskIds.length === 0) return;

  try {
    const batch = writeBatch(db);
    for (const id of taskIds) {
      batch.delete(doc(db, TASKS_COLLECTION, id));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, TASKS_COLLECTION);
  }
}
