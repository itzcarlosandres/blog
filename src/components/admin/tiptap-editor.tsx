"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from "@/components/ui/button"
import {
    Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2,
    Link as LinkIcon, Image as ImageIcon, Undo, Redo, Code
} from "lucide-react"

interface TiptapEditorProps {
    content: string
    onChange: (content: string) => void
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null

    const addImage = () => {
        const url = window.prompt('URL de la imagen')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL del enlace', previousUrl)

        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/20 sticky top-0 z-10 backdrop-blur-md rounded-t-2xl">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-muted' : ''}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-muted' : ''}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={editor.isActive('code') ? 'bg-muted' : ''}
            >
                <Code className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 self-center" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 self-center" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-muted' : ''}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 self-center" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={setLink}
                className={editor.isActive('link') ? 'bg-muted' : ''}
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addImage}
            >
                <ImageIcon className="h-4 w-4" />
            </Button>
            <div className="w-px h-10 flex-grow" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    )
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Placeholder.configure({
                placeholder: 'Escribe aquí el cuerpo del artículo...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[400px] p-6 max-w-none',
            },
        },
    })

    return (
        <div className="bg-background/50 border border-border rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
