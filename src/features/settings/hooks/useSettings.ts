import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSetting, updateSetting } from '../api/settings';
import { toast } from 'sonner';
import { ApiError, normalizeApiError } from '@/lib/api-types';
import { SettingValue } from '../api/settings';

export const useSetting = (key: string, defaultValue: SettingValue = null) => {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: async () => {
      try {
        const data = await getSetting(key);
        return data.value !== undefined && data.value !== null ? data.value : defaultValue;
      } catch (error: unknown) {
        const normalized = normalizeApiError(error);
        if (normalized.status === 404) return defaultValue;
        throw error;
      }
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: SettingValue }) => updateSetting(key, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', variables.key] });
      toast.success('Setting updated successfully');
    },
    onError: (error: unknown) => {
      const normalized: ApiError = normalizeApiError(error);
      toast.error(normalized.message);
    },
  });
};
