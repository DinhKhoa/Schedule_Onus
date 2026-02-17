import deleteIcon from '../icon/delete.png';

function DataTable({ columns, data, onDelete, renderActions }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          {(onDelete || renderActions) && <th>Thao tác</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (onDelete || renderActions ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
              Không có dữ liệu
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr key={row._id || idx}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                </td>
              ))}
              {(onDelete || renderActions) && (
                <td>
                  {renderActions ? renderActions(row) : (
                    <button
                      className="btn-icon-delete"
                      onClick={() => onDelete(row._id)}
                      title="Xóa"
                    >
                      <img src={deleteIcon} alt="delete" style={{ width: 20, height: 20 }} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>

      <style>{`
        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--color-border, #e5e7eb);
        }
        .data-table thead tr {
          background: #e2e8f0;
        }
        .data-table th {
          text-align: center;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          color: #000;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
        }
        .data-table td {
          padding: 12px 16px;
          font-size: 14px;
          color: #374151;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
          text-align: center;
        }
        .data-table tbody tr:hover {
          background: #f9fafb;
        }
        .btn-icon-delete {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 4px 8px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .btn-icon-delete:hover {
          opacity: 1;
        }
      `}</style>
    </table>
  );
}

export default DataTable;
