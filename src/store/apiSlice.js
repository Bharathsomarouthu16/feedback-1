import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authActions';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

// If the server says our token is bad/expired, drop the session.
// (Login failures also return 401 but happen when there's no token yet, so they're ignored.)
const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && api.getState().auth.token) {
    api.dispatch(logout());
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Feedback'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
    }),
    getFeedback: builder.query({
      query: () => '/feedback',
      providesTags: ['Feedback'],
    }),
    addFeedback: builder.mutation({
      query: (body) => ({ url: '/feedback', method: 'POST', body }),
      invalidatesTags: ['Feedback'],
    }),
    updateStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/feedback/${id}/status`, method: 'PATCH', body: { status } }),
      // Optimistic update: change the cached list immediately, roll back on failure.
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getFeedback', undefined, (draft) => {
            const item = draft.find((f) => f.id === id);
            if (item) item.status = status;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useGetFeedbackQuery,
  useAddFeedbackMutation,
  useUpdateStatusMutation,
} = api;
