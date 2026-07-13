import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSetting, updateSetting } from '../api/settings';
import { toast } from 'sonner';

export const useSetting = (key: string, defaultValue: any = null) => {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: async () => {
      try {
        const data = await getSetting(key);
        return data.value !== undefined && data.value !== null ? data.value : defaultValue;
      } catch (e: any) {
        if (e.response?.status === 404) {
          return defaultValue;
        }
        throw e;
      }
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => updateSetting(key, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', variables.key] });
      toast.success('Setting updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update setting');
    },
  });
};
