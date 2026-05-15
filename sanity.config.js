import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'

export default defineConfig({
  name: 'default',
  title: 'Ziyomap Admin',

  projectId: '25lh4m7u',
  dataset: 'production',

  // MUHIM: Admin panel endi faqat /admin manzilida ochiladi
  // Asosiy saytingiz esa bo'shab, o'z holiga qaytadi
  basePath: '/admin', 

  plugins: [deskTool()],

  schema: {
    types: [
      {
        name: 'post',
        type: 'document',
        title: 'Maqolalar',
        fields: [
          { name: 'title', type: 'string', title: 'Sarlavha' },
          { name: 'category', type: 'string', title: 'Kategoriya' },
          { name: 'preview', type: 'text', title: 'Qisqa ta\'rif' },
          { name: 'telegramLink', type: 'url', title: 'Telegram Havolasi' },
          { 
            name: 'mainImage', 
            type: 'image', 
            title: 'Muqova rasmi',
            options: {
              hotspot: true // Rasmni qirqish (crop) imkoniyati uchun
            }
          }
        ]
      }
    ],
  },
})
