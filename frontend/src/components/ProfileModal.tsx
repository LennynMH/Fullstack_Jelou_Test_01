import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { profileService, Profile } from '../services/profileService';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

interface ProfileModalProps {
  profile: Profile | null;
  onClose: () => void;
}

interface ProfileFormData {
  name: string;
  description?: string;
}

const ProfileModal = ({ profile, onClose }: ProfileModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        description: profile.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (profile) {
        await profileService.update(profile.id, data);
        toast.success('Perfil actualizado exitosamente');
      } else {
        await profileService.create(data);
        toast.success('Perfil creado exitosamente');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar perfil');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {profile ? 'Editar Perfil' : 'Nuevo Perfil'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              id="name"
              type="text"
              {...register('name', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres',
                },
                maxLength: {
                  value: 50,
                  message: 'El nombre no puede exceder 50 caracteres',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: administrador"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              {...register('description', {
                maxLength: {
                  value: 255,
                  message: 'La descripción no puede exceder 255 caracteres',
                },
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Descripción del perfil"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              {profile ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;

