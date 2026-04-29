import { Navigate, useParams } from 'react-router-dom';

function SessionStatusPage() {
  const { id } = useParams();
  return <Navigate to={`/pt/session/${id}`} replace />;
}

export default SessionStatusPage;
