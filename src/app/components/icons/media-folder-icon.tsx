/** Renders the Folder icon. */
export function FolderIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d={
          open
            ? 'M3.75 8.25h16.5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5v-9.5ZM4.5 8.25l1.6-3h4.25l1.6 3'
            : 'M3.75 7.75a1.5 1.5 0 0 1 1.5-1.5h4.1l1.75 2h7.65a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-10Z'
        }
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
