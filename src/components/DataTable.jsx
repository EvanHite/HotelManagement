import { EmptyState } from "./ui";

export function DataTable({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
  onRowClick,
  rowClassName,
  compact = false,
  tableClassName = "",
}) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="table-shell overflow-x-auto">
      <table className={`w-full min-w-max text-sm ${tableClassName}`}>
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${compact ? "px-4 py-2.5" : "px-4 py-3"} text-left text-[11px] font-medium leading-5 text-slate-500 ${column.minWidthClass ?? ""} ${column.nowrap ? "whitespace-nowrap" : ""} ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((row, index) => (
            <tr
              key={row.id ?? index}
              className={`border-b border-slate-200 align-middle last:border-b-0 ${onRowClick ? "cursor-pointer hover:bg-slate-50" : ""} ${rowClassName ? rowClassName(row, index) : ""}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => {
                const content = column.render ? column.render(row, index) : row[column.key];

                return (
                  <td
                    key={column.key}
                    className={`${compact ? "px-4 py-2.5" : "px-4 py-3"} text-sm leading-5 text-slate-700 ${column.minWidthClass ?? ""} ${column.nowrap ? "whitespace-nowrap" : ""} ${column.truncate ? "max-w-0" : ""} ${column.cellClassName ?? ""}`}
                  >
                    {column.truncate ? <div className="truncate">{content}</div> : content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
