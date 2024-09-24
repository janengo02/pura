import { yup } from '../../utils'

export const dashboardSchema = yup.object({
   title: yup.string(),
   schedule: yup.date()
})
