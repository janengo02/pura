import yup from '../../../shared/utils/yup';

export const dashboardSchema = yup.object({
   title: yup.string(),
   schedule: yup.date()
})
