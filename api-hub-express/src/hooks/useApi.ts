import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type API, type APISummary, type Category, type PricingPlan, type Documentation, type User, type UserProfile } from '@/lib/api';
import { toast } from 'sonner';

// Categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });
};

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => apiService.getCategory(id),
    enabled: !!id,
  });
};

export const useCategoryApis = (id: number) => {
  return useQuery({
    queryKey: ['category', id, 'apis'],
    queryFn: () => apiService.getCategoryApis(id),
    enabled: !!id,
  });
};

// APIs
export const useAPIs = (params?: {
  search?: string;
  category?: number;
  featured?: boolean;
  popular?: boolean;
  ordering?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['apis', params],
    queryFn: () => apiService.getAPIs(params),
  });
};

export const useAPI = (id: number | string) => {
  return useQuery({
    queryKey: ['api', id],
    queryFn: () => apiService.getAPI(id),
    enabled: !!id,
  });
};

export const useSimilarAPIs = (id: number) => {
  return useQuery({
    queryKey: ['api', id, 'similar'],
    queryFn: () => apiService.getSimilarAPIs(id),
    enabled: !!id,
  });
};

export const useRateAPI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, rating }: { id: number; rating: number }) =>
      apiService.rateAPI(id, rating),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api', variables.id] });
      toast.success('امتیاز شما ثبت شد');
    },
    onError: () => {
      toast.error('خطا در ثبت امتیاز');
    },
  });
};

// Pricing Plans
export const usePricingPlans = (apiId?: number) => {
  return useQuery({
    queryKey: ['pricing-plans', apiId],
    queryFn: () => apiService.getPricingPlans(apiId),
  });
};

// Documentation
export const useDocumentations = (apiId?: number) => {
  return useQuery({
    queryKey: ['documentations', apiId],
    queryFn: () => apiService.getDocumentations(apiId),
  });
};

// Authentication
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      apiService.login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('ورود موفقیت‌آمیز بود');
    },
    onError: (error: any) => {
      const message = error.response?.data?.non_field_errors?.[0] || 'خطا در ورود';
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      username: string;
      email: string;
      password: string;
      password_confirm: string;
      first_name?: string;
      last_name?: string;
    }) => apiService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('ثبت‌نام موفقیت‌آمیز بود');
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      let message = 'خطا در ثبت‌نام';
      
      if (error.response?.data) {
        // Handle validation errors
        const data = error.response.data;
        if (data.username) {
          message = `نام کاربری: ${Array.isArray(data.username) ? data.username[0] : data.username}`;
        } else if (data.email) {
          message = `ایمیل: ${Array.isArray(data.email) ? data.email[0] : data.email}`;
        } else if (data.password) {
          message = `رمز عبور: ${Array.isArray(data.password) ? data.password[0] : data.password}`;
        } else if (data.password_confirm) {
          message = `تأیید رمز عبور: ${Array.isArray(data.password_confirm) ? data.password_confirm[0] : data.password_confirm}`;
        } else if (data.detail) {
          message = data.detail;
        } else if (data.message) {
          message = data.message;
        } else if (typeof data === 'string') {
          message = data;
        } else {
          // Show first error found
          const firstError = Object.values(data)[0];
          message = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('خروج موفقیت‌آمیز بود');
    },
    onError: () => {
      toast.error('خطا در خروج');
    },
  });
};

// User
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => apiService.getCurrentUser(),
    enabled: !!localStorage.getItem('auth_token'),
    retry: false,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<User>) => apiService.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('اطلاعات کاربری به‌روزرسانی شد');
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی اطلاعات');
    },
  });
};

// User Profile
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiService.getProfile(),
    enabled: !!localStorage.getItem('auth_token'),
    retry: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => apiService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('پروفایل به‌روزرسانی شد');
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی پروفایل');
    },
  });
};

export const useGenerateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiService.generateApiKey(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('کلید API جدید با موفقیت ساخته شد');
      // Copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(data.api_key);
        toast.success('کلید API در کلیپ‌بورد کپی شد');
      }
    },
    onError: (error: any) => {
      console.error('API Key generation error:', error);
      if (error.response?.status === 401 || error.message === 'Authentication required. Please log in first.') {
        toast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
        localStorage.removeItem('auth_token');
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      } else {
        const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'خطا در ساخت کلید API';
        toast.error(message);
      }
    },
  });
};

// API Usage
export const useUsage = () => {
  return useQuery({
    queryKey: ['usage'],
    queryFn: () => apiService.getUsage(),
    enabled: !!localStorage.getItem('auth_token'),
  });
};

export const useUsageStats = () => {
  return useQuery({
    queryKey: ['usage', 'stats'],
    queryFn: () => apiService.getUsageStats(),
    enabled: !!localStorage.getItem('auth_token'),
  });
};

