import { NoteWidgetSettings } from '../../../../../../domain/types/widget/NoteWidgetSettings';
import { Spinner } from '@heroui/react';
import JoditEditor from 'jodit-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface NotesEditProps {
  settings: NoteWidgetSettings;
  onSettingsChange: (settings: NoteWidgetSettings, valid: boolean) => void;
  onHideSaveButton: (hide: boolean) => void;
}

const NotesEdit = memo(({ settings, onSettingsChange }: NotesEditProps) => {
  const [content, setContent] = useState(settings.content || '');
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const editorRef = useRef<any>(null);

  // Wenn sich die settings.content ändern, den Content des Editors aktualisieren
  useEffect(() => {
    if (settings.content !== content) {
      setContent(settings.content);
    }
  }, [settings.content]);

  // Sicherstellen, dass der Editor sofort nach der Initialisierung geladen wird
  useEffect(() => {
    setIsEditorLoading(false);
  }, []);

  // Den Content bei jeder Änderung speichern
  const handleEditorChange = useCallback(
    (value: string) => {
      setContent(value);
      onSettingsChange({ ...settings, content: value }, true);
    },
    [settings, onSettingsChange],
  );

  const config = useMemo(
    () => ({
      readonly: false,
      buttons: [
        'bold',
        'italic',
        'underline',
        'brush', // Textfarbe
        'fontsize', // Schriftgröße
        'ul',
        'ol',
        'link',
        'unlink',
        'paragraph',
        'video', // Video einfügen
      ],
      height: 500,
      style: {
        color: 'black',
      },
    }),
    [],
  );
  if (isEditorLoading) {
    return <Spinner />;
  }

  return (
    <div className="w-full h-full" style={{ zIndex: 99999 }}>
      <JoditEditor
        value={content}
        config={config}
        onBlur={handleEditorChange}
        ref={editorRef}
      />
    </div>
  );
});

export default NotesEdit;
