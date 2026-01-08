import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type API, type APISummary, type Category, type PricingPlan, type Documentation, type User, type UserProfile } from '@/lib/api';
import { toast } from 'sonner';

import {
  API,
  APISummary,
  Category,
  Documentation,
  PaginatedResponse,
  PricingPlan,
  APIReleaseInput,
  SubscriptionCheckout,
  SubscriptionPlan,
  apiService,
  getErrorMessage,
  SessionResponse,
  User,
  UserProfile,
} from "@/lib/api";

interface QueryBootstrapOptions<T> {
  initialData?: T;
}


export const useSession = () =>
  useQuery({
    queryKey: ["session"],
    queryFn: () => apiService.getSession(),
    retry: false,
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
  owned?: boolean;
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


export const useReleaseAPI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: APIReleaseInput) => apiService.releaseAPI(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["apis"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.setQueryData(["api", data.api.slug], data.api);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "انتشار API انجام نشد."));
    },
  });
};


export const usePricingPlans = (
  apiSlug?: string,
  page?: number,
  options?: QueryBootstrapOptions<PaginatedResponse<PricingPlan>>,
) =>
  useQuery({
    queryKey: ["pricing-plans", apiSlug, page],
    queryFn: () => apiService.getPricingPlans(apiSlug, page),
    initialData: options?.initialData,
  });
};


export const useSubscriptionPlans = (options?: QueryBootstrapOptions<PaginatedResponse<SubscriptionPlan>>) =>
  useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => apiService.getSubscriptionPlans(),
    initialData: options?.initialData,
  });


export const useCurrentSubscription = () => {
  const session = useSession();
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => apiService.getCurrentSubscription(),
    enabled: session.data?.authenticated === true,
    retry: false,
  });
};


export const useSubscribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: number) => {
      const checkout = await apiService.subscribe(planId);
      return apiService.confirmSubscriptionCheckout(checkout.checkout.id);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["subscription"], { subscription: data.subscription });
      queryClient.invalidateQueries({ queryKey: ["access-grants"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "فعال‌سازی اشتراک انجام نشد."));
    },
  });
};


export const useCreateSubscriptionCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: number) => apiService.subscribe(planId),
    onSuccess: (data) => {
      queryClient.setQueryData(["subscription-checkout", data.checkout.id], { checkout: data.checkout });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "ایجاد پرداخت اشتراک انجام نشد."));
    },
  });
};


export const useSubscriptionCheckout = (checkoutId: number | undefined, initialCheckout?: SubscriptionCheckout | null) =>
  useQuery({
    queryKey: ["subscription-checkout", checkoutId],
    queryFn: () => apiService.getSubscriptionCheckout(checkoutId as number),
    enabled: Boolean(checkoutId),
    initialData: initialCheckout ? { checkout: initialCheckout } : undefined,
    retry: false,
  });


export const useConfirmSubscriptionCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkoutId: number) => apiService.confirmSubscriptionCheckout(checkoutId),
    onSuccess: (data) => {
      queryClient.setQueryData(["subscription"], { subscription: data.subscription });
      queryClient.setQueryData(["subscription-checkout", data.checkout.id], { checkout: data.checkout });
      queryClient.invalidateQueries({ queryKey: ["access-grants"] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "تایید پرداخت اشتراک انجام نشد."));
    },
  });
};


export const useCancelSubscriptionCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkoutId: number) => apiService.cancelSubscriptionCheckout(checkoutId),
    onSuccess: (data) => {
      queryClient.setQueryData(["subscription-checkout", data.checkout.id], { checkout: data.checkout });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "لغو پرداخت اشتراک انجام نشد."));
    },
  });
};


export const useDocumentations = (
  apiSlug?: string,
  page?: number,
  options?: QueryBootstrapOptions<PaginatedResponse<Documentation>>,
) =>
  useQuery({
    queryKey: ["documentations", apiSlug, page],
    queryFn: () => apiService.getDocumentations(apiSlug, page),
    initialData: options?.initialData,
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


export const useGenerateLegacyAPIKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiService.generateLegacyAPIKey(),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data.profile);
      queryClient.setQueryData(["session"], (current: SessionResponse | undefined) =>
        current ? { ...current, profile: data.profile } : current,
      );
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "API key rotation failed."));
    },
  });
};


export const useAccessGrants = () => {
  const session = useSession();
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

