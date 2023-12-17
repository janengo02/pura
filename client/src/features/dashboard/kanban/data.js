const page = {
   id: 'page-1',
   user: '',
   title: '',
   sync_accounts: [
      {
         tool: '',
         email: ''
      }
   ],
   progress_order: [
      {
         _id: 'progress1',
         title: 'To do',
         title_color: 'red.700',
         color: 'red.100',
         visibility: true
      },
      {
         _id: 'progress2',
         title: 'In progress',
         title_color: 'orange.700',
         color: 'orange.100',
         visibility: true
      },
      {
         _id: 'progress3',
         title: 'Done',
         title_color: 'green.700',
         color: 'green.100',
         visibility: true
      }
   ],
   group_order: [
      {
         _id: 'group1',
         title: 'SCHOOL',
         color: 'purple.300',
         visibility: true
      },
      {
         _id: 'group2',
         title: 'WORK',
         color: 'blue.300',
         visibility: true
      }
   ],
   task_map: [
      {
         group:{_id:'group1'},
         progress:{_id:'progress1'},
         tasks:[
            {
               _id: 'task-1',
               title: 'Task 1',
               schedule: [],
            },
            {
               _id: 'task-2',
               title: 'Task 2',
               schedule: [],
            },
         ],
      },
      {
         group:{_id:'group1'},
         progress:{_id:'progress2'},
         tasks:[]
      },
      {
         group:{_id:'group1'},
         progress:{_id:'progress3'},
         tasks:[]
      },
      {
         group:{_id:'group2'},
         progress:{_id:'progress1'},
         tasks:[
            {
               _id: 'task-3',
               title: 'Task 3',
               schedule: [],
            },
         ],
      },
      {
         group:{_id:'group2'},
         progress:{_id:'progress2'},
         tasks:[
            {
               _id: 'task-4',
               title: 'Task 4',
               schedule: [],
            }
         ],
      },
      {
         group:{_id:'group2'},
         progress:{_id:'progress3'},
         tasks:[],
      },
   ]
}

export { page }
