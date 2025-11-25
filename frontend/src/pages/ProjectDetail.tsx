import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService, Project } from '../services/projectService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit, FiTrash2, FiUserPlus, FiUserMinus, FiUsers } from 'react-icons/fi';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getById(parseInt(id!));
      setProject(response.data);
    } catch (error: any) {
      toast.error('Error al cargar proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCollaboratorById = async (userId: number) => {
    if (!userId || isNaN(userId)) {
      toast.error('ID de usuario inválido');
      return;
    }

    try {
      setIsAddingCollaborator(true);
      await projectService.addCollaborator(parseInt(id!), userId);
      toast.success('Colaborador añadido exitosamente');
      loadProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al añadir colaborador');
    } finally {
      setIsAddingCollaborator(false);
    }
  };

  const handleRemoveCollaborator = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este colaborador?')) {
      return;
    }

    try {
      await projectService.removeCollaborator(parseInt(id!), userId);
      toast.success('Colaborador eliminado exitosamente');
      loadProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar colaborador');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto?')) {
      return;
    }

    try {
      await projectService.delete(parseInt(id!));
      toast.success('Proyecto eliminado exitosamente');
      window.location.href = '/projects';
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar proyecto');
    }
  };

  const isOwner = project?.ownerId.toString() === user?.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Proyecto no encontrado</p>
        <Link to="/projects" className="text-primary-600 hover:text-primary-700">
          Volver a proyectos
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <Link
        to="/projects"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <FiArrowLeft className="mr-2" />
        Volver a proyectos
      </Link>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-gray-600">{project.description}</p>
            )}
          </div>
          {isOwner && (
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-primary-600">
                <FiEdit />
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600"
              >
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Creado por:</span>
              <span className="ml-2 font-medium text-gray-900">{project.owner.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Fecha de creación:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Colaboradores */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FiUsers className="mr-2" />
            Colaboradores ({project.collaborators.length})
          </h2>
          {isOwner && (
            <button
              onClick={() => {
                const userId = prompt('Ingresa el ID del usuario a añadir como colaborador:');
                if (userId) {
                  handleAddCollaboratorById(parseInt(userId));
                }
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <FiUserPlus className="mr-2" />
              Añadir Colaborador
            </button>
          )}
        </div>

        {isOwner && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">
              Nota: Para añadir colaboradores, necesitas el ID del usuario. Esta funcionalidad se puede mejorar con búsqueda por email.
            </p>
          </div>
        )}

        {project.collaborators.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay colaboradores en este proyecto</p>
        ) : (
          <div className="space-y-2">
            {project.collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{collab.name}</p>
                  <p className="text-sm text-gray-500">{collab.email}</p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveCollaborator(collab.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Eliminar colaborador"
                  >
                    <FiUserMinus />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;

