import { Course, Category, Announcement } from './types';

export const CATEGORIES: Category[] = [
  { id: 'chinese', label: 'ភាសាចិន (Chinese)', labelEn: 'Chinese', iconName: 'Globe', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30' },
  { id: 'english', label: 'ភាសាអង់គ្លេស (English)', labelEn: 'English', iconName: 'Languages', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
  { id: 'computer', label: 'កុំព្យូទ័រ (Computer)', labelEn: 'Computer', iconName: 'Cpu', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30' },
  { id: 'general', label: 'ការអប់រំទូទៅ (General Ed)', labelEn: 'General Education', iconName: 'BookOpen', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30' }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'ស្វាគមន៍មកកាន់ប្រព័ន្ធសិក្សាថ្មី SABBAY REAN - E-Learning Platform!',
    content: 'យើងបានធ្វើការអាប់ដេតប្រព័ន្ធសិក្សាឱ្យកាន់តែមានភាពរលូន រហ័ស និងគាំទ្រមុខងារ PWA ពេញលេញ។ លោកអ្នកអាចដំឡើងកម្មវិធីលើទូរស័ព្ទដៃរបស់លោកអ្នកបាន!',
    date: '2026-07-16',
    category: 'system'
  },
  {
    id: 'ann-2',
    title: 'វគ្គសិក្សាថ្មី៖ មូលដ្ឋានគ្រឹះបញ្ញាសិប្បនិម្មិត (AI) និង ChatGPT',
    content: 'សិក្សាអំពីការប្រើប្រាស់ Prompt Engineering ដើម្បីបង្កើនផលិតភាពការងារ និងជំនាញដោះស្រាយបញ្ហាប្រចាំថ្ងៃ។ ចូលរៀនឥឡូវនេះដោយសេរី!',
    date: '2026-07-15',
    category: 'new_course'
  },
  {
    id: 'ann-3',
    title: 'ការថែទាំប្រព័ន្ធម៉ាស៊ីនបម្រើ (Server Maintenance)',
    content: 'ប្រព័ន្ធនឹងធ្វើការអាប់ដេតនៅថ្ងៃអាទិត្យ វេលាម៉ោង ២:០០ ព្រឹក ដល់ ៤:០០ ព្រឹក។ ការប្រើប្រាស់អាចនឹងមានការរំខានបន្តិចបន្តួចក្នុងអំឡុងពេលនេះ។',
    date: '2026-07-10',
    category: 'maintenance'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-prog-1',
    title: 'មូលដ្ឋានគ្រឹះការសរសេរកូដ Python សម្រាប់អ្នកចាប់ផ្តើមដំបូង',
    description: 'រៀនពីគោលគំនិតនៃការសរសេរកូដ ក្បួនដោះស្រាយ ជាមួយភាសា Python ដែលជាភាសាងាយស្រួលយល់ និងពេញនិយមបំផុតទូទាំងពិភពលោក។',
    category: 'computer',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600',
    level: 'មូលដ្ឋាន',
    author: 'លោកគ្រូ ចាន់ វាសនា',
    studentCount: 1450,
    rating: 4.8,
    lastUpdated: '2026-07-12',
    requirements: [
      'មានកុំព្យូទ័រផ្ទាល់ខ្លួន (Windows, macOS ឬ Linux)',
      'មិនត្រូវការចំណេះដឹងសរសេរកូដពីមុនមកទេ'
    ],
    learningOutcomes: [
      'យល់ដឹងពី Variables, Loops, functions និង OOP មូលដ្ឋាន',
      'អាចសរសេរកម្មវិធីគណនា និងហ្គេមសាមញ្ញៗដោយខ្លួនឯង',
      'មានមូលដ្ឋានរឹងមាំសម្រាប់បន្តទៅកាន់ Data Science ឬ Web Dev'
    ],
    lessons: [
      {
        id: 'lesson-py-1',
        courseId: 'course-prog-1',
        title: 'មេរៀនទី ១៖ ការណែនាំអំពី Python និងការដំឡើងប្រព័ន្ធ',
        description: 'យល់ដឹងពីអ្វីទៅជា Python និងរបៀបដំឡើង Python IDLE រួមជាមួយ VS Code នៅលើកុំព្យូទ័ររបស់អ្នក។',
        videoUrl: 'https://res.cloudinary.com/dzivaqghe/video/upload/v1766926891/Introduction_bittzw.mp4',
        duration: '12:40',
        order: 1,
        notes: 'សូមកុំភ្លេចធិកយក "Add Python to PATH" ពេលដំឡើងនៅលើ Windows ដើម្បីចៀសវាងបញ្ហាក្នុង Command Prompt។',
        documents: [
          {
            id: 'doc-py-1-1',
            title: 'សន្លឹកណែនាំការដំឡើង Python និង VS Code.pdf',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileType: 'PDF',
            fileSize: '1.4 MB'
          }
        ]
      },
      {
        id: 'lesson-py-2',
        courseId: 'course-prog-1',
        title: 'មេរៀនទី ២៖ Variables, Data Types និងការបង្ហាញលទ្ធផល (print)',
        description: 'សិក្សាអំពីការបង្កើតប្រអប់ផ្ទុកទិន្នន័យ (Variables) និងស្វែងយល់ពីប្រភេទ String, Integer, Float និង Boolean។',
        videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
        duration: '15:20',
        order: 2,
        notes: 'កូដសាកល្បង៖\nx = 5\ny = "Hello Master IT"\nprint(x)\nprint(y)',
        documents: [
          {
            id: 'doc-py-2-1',
            title: 'លំហាត់អនុវត្តន៍មេរៀនទី២ - Variables.pdf',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileType: 'PDF',
            fileSize: '820 KB'
          }
        ]
      },
      {
        id: 'lesson-py-3',
        courseId: 'course-prog-1',
        title: 'មេរៀនទី ៣៖ ការប្រើប្រាស់លក្ខខណ្ឌ (If-Else Conditions)',
        description: 'រៀនពីរបៀបធ្វើឱ្យកម្មវិធីមានភាពឆ្លាតវៃក្នុងការសម្រេចចិត្តដោយផ្អែកលើលក្ខខណ្ឌផ្សេងៗ។',
        videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
        duration: '18:15',
        order: 3,
        notes: 'សូមប្រយ័ត្នលើ "Indentation" (ការខិតចូលបន្ទាត់) នៅក្នុងភាសា Python ព្រោះវាជាក្បួនវាក្យសព្ទដាច់ខាត។',
        documents: [
          {
            id: 'doc-py-3-1',
            title: 'សន្លឹកសង្ខេបក្បួនគន្លឹះ If-Else.pdf',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileType: 'PDF',
            fileSize: '650 KB'
          }
        ]
      }
    ]
  }
];
