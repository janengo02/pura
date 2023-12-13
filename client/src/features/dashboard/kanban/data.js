const tasksDummy = [
   {
      id: 'task-1',
      title: 'Task 1',
      schedule: { datetime_from: '', datetime_to: '' },
      content: 'This is task 1',
      archive: false
   },
   {
      id: 'task-2',
      title: 'Task 2',
      schedule: { datetime_from: '', datetime_to: '' },
      content: 'This is task 2',
      archive: false
   },
   {
      id: 'task-3',
      title: 'Task 3',
      schedule: { datetime_from: '', datetime_to: '' },
      content: 'This is task 3',
      archive: false
   },
   {
      id: 'task-4',
      title: 'Task 4',
      schedule: { datetime_from: '', datetime_to: '' },
      content: 'This is task 4',
      archive: false
   }
]
const pagesDummy = {
   id: 'page-1',
   user: '',
   title: '',
   sync_accounts: [
      {
         tool: '',
         email: ''
      }
   ],
   progressOrder: [
      {
         id: 'progress1',
         title: 'To do',
         title_color: 'red.700',
         color: 'red.100',
         visibility: true
      },
      {
         id: 'progress2',
         title: 'In progress',
         title_color: 'orange.700',
         color: 'orange.100',
         visibility: true
      },
      {
         id: 'progress3',
         title: 'Done',
         title_color: 'green.700',
         color: 'green.100',
         visibility: true
      }
   ],
   groupOrder: [
      {
         id: 'group1',
         title: 'SCHOOL',
         color: 'purple.300',
         visibility: true
      },
      {
         id: 'group2',
         title: 'WORK',
         color: 'blue.300',
         visibility: true
      }
   ],
}

export { tasksDummy }
export { pagesDummy }
