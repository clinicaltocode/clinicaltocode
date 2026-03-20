import { defineType, defineField } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'credential',
      type: 'string',
      title: 'Credential (e.g. MD, PhD, RN)',
    }),
    defineField({
      name: 'bio',
      type: 'text',
      title: 'Bio',
    }),
    defineField({
      name: 'avatar',
      type: 'image',
      title: 'Avatar',
      options: { hotspot: true },
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'name' },
    }),
  ],
})
