const dummyData = {
   tasks: {
      'task-1': { id: 'task-1', content: 'This is task 1' },
      'task-2': { id: 'task-2', content: 'This is task 2' },
      'task-3': { id: 'task-3', content: 'This is task 3' },
      'task-4': { id: 'task-4', content: 'This is task 4' }
   },
   columns: {
      'column-1': {
         taskIds: ['task-1', 'task-2', 'task-3', 'task-4']
      },
      'column-2': {
         taskIds: []
      },
      'column-3': {
         taskIds: []
      }
   },
   columnOrder: [
      {
         id: 'column-1',
         title: 'To do',
         color: 'red.100'
      },
      {
         id: 'column-2',
         title: 'In progress',
         color: 'orange.100'
      },
      {
         id: 'column-3',
         title: 'Done',
         color: 'green.100'
      }
   ]
}

export default dummyData

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
   taskMap: {
      group1: {
         progress1: ['task-1', 'task-2'],
         progress2: [],
         progress3: []
      },
      group2: {
         progress1: ['task-3'],
         progress2: ['task-4'],
         progress3: []
      }
   }
}

export { tasksDummy }
export { pagesDummy }
