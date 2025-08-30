import { baseApi } from './baseApi'

export const pageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFirstPage: builder.query({
      query: () => '/page',
      providesTags: ['Page']
    }),
    
    getPage: builder.query({
      query: (pageId) => `/page/${pageId}`,
      providesTags: ['Page']
    }),
    
    // Progress Management
    createProgress: builder.mutation({
      query: ({ pageId, ...progressData }) => ({
        url: `/progress/new/${pageId}`,
        method: 'POST',
        body: progressData
      }),
      invalidatesTags: ['Page']
    }),
    
    updateProgress: builder.mutation({
      query: ({ pageId, progressId, ...updates }) => ({
        url: `/progress/${pageId}/${progressId}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: ['Page']
    }),
    
    deleteProgress: builder.mutation({
      query: ({ pageId, progressId }) => ({
        url: `/progress/${pageId}/${progressId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Page']
    }),
    
    // Group Management
    createGroup: builder.mutation({
      query: ({ pageId, ...groupData }) => ({
        url: `/group/new/${pageId}`,
        method: 'POST',
        body: groupData
      }),
      invalidatesTags: ['Page']
    }),
    
    updateGroup: builder.mutation({
      query: ({ pageId, groupId, ...updates }) => ({
        url: `/group/${pageId}/${groupId}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: ['Page']
    }),
    
    deleteGroup: builder.mutation({
      query: ({ pageId, groupId }) => ({
        url: `/group/${pageId}/${groupId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Page']
    })
  })
})

export const {
  useGetFirstPageQuery,
  useLazyGetFirstPageQuery,
  useGetPageQuery,
  useCreateProgressMutation,
  useUpdateProgressMutation,
  useDeleteProgressMutation,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation
} = pageApi