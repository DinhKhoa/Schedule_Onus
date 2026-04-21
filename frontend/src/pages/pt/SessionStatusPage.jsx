import { Navigate, useParams } from 'react-router-dom';

// This page redirects to SessionDetailPage — using <Navigate> component (React-safe)
function SessionStatusPage() {
  const { id } = useParams();
  return <Navigate to={`/pt/session/${id}`} replace />;
}

export default SessionStatusPage;
