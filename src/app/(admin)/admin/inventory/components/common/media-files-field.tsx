import { FormField } from './form-field';

type MediaFilesFieldProps = {
  label: string;
  hint: string;
  files: File[];
  accept: string;
  removeLabel: string;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  inputClassName: string;
};

export function MediaFilesField({
  label,
  hint,
  files,
  accept,
  removeLabel,
  onAddFiles,
  onRemoveFile,
  inputClassName,
}: MediaFilesFieldProps) {
  return (
    <FormField label={label}>
      <input
        type="file"
        accept={accept}
        multiple
        onChange={(event) => {
          const selectedFiles = [...(event.target.files ?? [])];

          if (selectedFiles.length > 0) {
            onAddFiles(selectedFiles);
          }

          event.target.value = '';
        }}
        className={inputClassName}
      />
      <p className="text-xs text-slate-400">{hint}</p>

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
            >
              <span className="truncate pr-3">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="font-semibold text-rose-500 hover:text-rose-600"
              >
                {removeLabel}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </FormField>
  );
}
