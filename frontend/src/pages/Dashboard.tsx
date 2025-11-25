import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsService } from '../services/statsService';
import { FiFolder, FiCheckSquare, FiTrendingUp, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Stats {
  projects: {
    total: number;
    asOwner: number;
    asCollaborator: number;
  };
  tasks: {
    total: number;
    byStatus: {
      pendiente: number;
      'en progreso': number;
      completada: number;
    };
    byPriority: {
      baja: number;
      media: number;
      alta: number;
    };
    assignedToMe: number;
    unassigned: number;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await statsService.getStats();
      setStats(response.data);
    } catch (error: any) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Resumen de tus proyectos y tareas</p>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiFolder className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Proyectos</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.projects.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tareas</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.tasks.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiTrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tareas Completadas</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.tasks.byStatus.completada}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Asignadas a Mí</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.tasks.assignedToMe}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tareas por estado */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tareas por Estado</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Pendiente</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.tasks.byStatus.pendiente}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.tasks.total > 0
                        ? (stats.tasks.byStatus.pendiente / stats.tasks.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">En Progreso</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.tasks.byStatus['en progreso']}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.tasks.total > 0
                        ? (stats.tasks.byStatus['en progreso'] / stats.tasks.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Completada</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.tasks.byStatus.completada}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.tasks.total > 0
                        ? (stats.tasks.byStatus.completada / stats.tasks.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tareas por prioridad */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tareas por Prioridad</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Baja</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.tasks.byPriority.baja}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.tasks.total > 0
                        ? (stats.tasks.byPriority.baja / stats.tasks.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Media</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.tasks.byPriority.media}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.tasks.total > 0
                        ? (stats.tasks.byPriority.media / stats.tasks.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Alta</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.tasks.byPriority.alta}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.tasks.total > 0
                        ? (stats.tasks.byPriority.alta / stats.tasks.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/projects"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <FiFolder className="h-8 w-8 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Ver Proyectos</h3>
            <p className="text-sm text-gray-500 mt-1">Gestiona tus proyectos</p>
          </Link>
          <Link
            to="/tasks"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <FiCheckSquare className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Ver Tareas</h3>
            <p className="text-sm text-gray-500 mt-1">Gestiona tus tareas</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

