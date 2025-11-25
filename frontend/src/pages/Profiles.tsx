import { useEffect, useState } from 'react';
import { profileService, Profile } from '../services/profileService';
import { FiPlus, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProfileModal from '../components/ProfileModal';

const Profiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      const profilesData = await profileService.getAll();
      setProfiles(profilesData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar perfiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este perfil?')) {
      return;
    }

    try {
      await profileService.delete(id);
      toast.success('Perfil eliminado exitosamente');
      loadProfiles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar perfil');
    }
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProfile(null);
    loadProfiles();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perfiles</h1>
          <p className="mt-2 text-sm text-gray-600">Gestiona los perfiles de usuario del sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FiPlus className="mr-2" />
          Nuevo Perfil
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {profiles.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              No hay perfiles registrados
            </li>
          ) : (
            profiles.map((profile) => (
              <li key={profile.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiUsers className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                      {profile.description && (
                        <p className="text-sm text-gray-500">{profile.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(profile)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Editar"
                    >
                      <FiEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {isModalOpen && (
        <ProfileModal
          profile={editingProfile}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Profiles;

