import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { taskService, Task } from '../services/taskService';
import { Project } from '../services/projectService';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projects: Project[];
}

interface TaskFormData {
  title: string;
  description: string;
  status: 'pendiente' | 'en progreso' | 'completada';
  priority: 'baja' | 'media' | 'alta';
  project: number;
  assignedTo: number | '';
  dueDate: string;
}

const TaskModal = ({ isOpen, onClose, task, projects }: TaskModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>();

  const selectedProjectId = watch('project');
  const selectedProject = projects.find((p) => p.id === parseInt(selectedProjectId?.toString() || '0'));

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        project: task.projectId,
        assignedTo: task.assignedToId || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'pendiente',
        priority: 'media',
        project: projects[0]?.id || 0,
        assignedTo: '',
        dueDate: '',
      });
    }
  }, [task, reset, isOpen, projects]);

  if (!isOpen) return null;

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        priority: data.priority,
        project: data.project,
        assignedTo: data.assignedTo ? parseInt(data.assignedTo.toString()) : undefined,
        dueDate: data.dueDate || undefined,
      };

      if (task) {
        await taskService.update(task.id, taskData);
        toast.success('Tarea actualizada exitosamente');
      } else {
        await taskService.create(taskData);
        toast.success('Tarea creada exitosamente');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar tarea');
    }
  };

  const availableUsers = selectedProject
    ? [
        { id: selectedProject.ownerId, name: selectedProject.owner.name },
        ...selectedProject.collaborators.map((c) => ({ id: c.id, name: c.name })),
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {task ? 'Editar Tarea' : 'Nueva Tarea'}
                </h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title', {
                      required: 'El título es requerido',
                      minLength: {
                        value: 3,
                        message: 'El título debe tener al menos 3 caracteres',
                      },
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    {...register('description')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                      Proyecto *
                    </label>
                    <select
                      id="project"
                      {...register('project', { required: 'El proyecto es requerido' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      id="status"
                      {...register('status')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en progreso">En Progreso</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Prioridad
                    </label>
                    <select
                      id="priority"
                      {...register('priority')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                      Asignar a
                    </label>
                    <select
                      id="assignedTo"
                      {...register('assignedTo')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Sin asignar</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                    Fecha de vencimiento
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    {...register('dueDate')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {task ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

