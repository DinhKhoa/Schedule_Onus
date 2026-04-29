import { useState } from 'react';
import deleteIcon from '../icon/delete.png';

function DataTable({ columns, data, onDelete, renderActions }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width ? col.width : 'auto' }}>{col.label}</th>
            ))}
            {(onDelete || renderActions) && <th>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {currentData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onDelete || renderActions ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            currentData.map((row, idx) => (
              <tr key={row._id || startIndex + idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row, startIndex + idx) : row[col.key]}
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
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, data.length)} trong tổng số {data.length}
          </div>
          <div className="pagination-controls">
            <button 
              className="page-btn" 
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              &laquo;
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button 
              className="page-btn" 
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              &raquo;
            </button>
          </div>
        </div>
      )}

      <style>{`
        .table-wrapper {
          background: white;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          overflow: hidden;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table thead tr {
          background: #F8FAFC;
        }
        .data-table th {
          text-align: center;
          padding: 14px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          border-bottom: 1px solid #E5E7EB;
        }
        .data-table td {
          padding: 14px 16px;
          font-size: 14px;
          color: #1E293B;
          border-bottom: 1px solid #F1F5F9;
          text-align: center;
        }
        .data-table tbody tr:hover {
          background: #F8FAFC;
        }
        .btn-icon-delete {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          opacity: 0.6;
          transition: all 0.2s;
        }
        .btn-icon-delete:hover {
          opacity: 1;
          transform: scale(1.1);
        }
        
        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #F8FAFC;
          border-top: 1px solid #E5E7EB;
        }
        .pagination-info {
          font-size: 14px;
          color: #64748B;
        }
        .pagination-controls {
          display: flex;
          gap: 6px;
        }
        .page-btn {
          min-width: 32px;
          height: 32px;
          padding: 0 6px;
          border-radius: 6px;
          border: 1px solid #E2E8F0;
          background: white;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .page-btn:hover:not(:disabled) {
          border-color: #3B82F6;
          color: #3B82F6;
          background: #EFF6FF;
        }
        .page-btn.active {
          background: #3B82F6;
          border-color: #3B82F6;
          color: white;
        }
        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #F1F5F9;
        }
      `}</style>
    </div>
  );
}

export default DataTable;
