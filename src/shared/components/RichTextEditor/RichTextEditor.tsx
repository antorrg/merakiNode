import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { ButtonGroup, Button } from 'react-bootstrap';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {//eslint-disable-line
  if (!editor) return null;

  return (
    <div className="rich-text-toolbar mb-2 border rounded bg-light p-1">
      <ButtonGroup size="sm" className="me-2">
        <Button 
          variant={editor.isActive('bold') ? 'secondary' : 'outline-secondary'}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrita"
        >
          <strong>B</strong>
        </Button>
        <Button 
          variant={editor.isActive('italic') ? 'secondary' : 'outline-secondary'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Cursiva"
        >
          <em>I</em>
        </Button>
        <Button 
          variant={editor.isActive('underline') ? 'secondary' : 'outline-secondary'}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Subrayado"
        >
          <u>U</u>
        </Button>
        <Button 
          variant={editor.isActive('strike') ? 'secondary' : 'outline-secondary'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Tachado"
        >
          <s>S</s>
        </Button>
      </ButtonGroup>
      
      <ButtonGroup size="sm" className="me-2">
        <Button 
          variant={editor.isActive('bulletList') ? 'secondary' : 'outline-secondary'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Viñetas"
        >
          • Lista
        </Button>
        <Button 
          variant={editor.isActive('orderedList') ? 'secondary' : 'outline-secondary'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista Numerada"
        >
          1. Lista
        </Button>
      </ButtonGroup>

      <ButtonGroup size="sm">
        <Button 
          variant="outline-secondary"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Deshacer"
        >
          ↶
        </Button>
        <Button 
          variant="outline-secondary"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rehacer"
        >
          ↷
        </Button>
      </ButtonGroup>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'form-control rich-text-content',
        style: 'min-height: 250px; cursor: text;'
      }
    }
  });

  // Sincronizar contenido si cambia desde afuera (e.g. al cambiar de pestaña de paciente)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, (false as any));//eslint-disable-line
    } // false evita que se dispare onUpdate de nuevo
  }, [content, editor]);

  return (
    <div className="rich-text-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
