import { yup } from '../../utils'

export const dashboardSchema = yup.object({
   title: yup.string().max(255)
})
