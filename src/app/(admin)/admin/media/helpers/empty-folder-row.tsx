export function EmptyFolderRow() {
  return (
    <tr>
      <td
        className="px-3 py-12 text-center text-slate-500 dark:text-slate-400"
        colSpan={4}
      >
        No files in this folder.
      </td>
    </tr>
  );
}
