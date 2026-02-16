import { useNavigate, useParams } from 'react-router-dom';

// This page redirects to SessionDetailPage since the complete action is handled there
function SessionStatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Redirect to session detail which has the complete button
  navigate(`/pt/session/${id}`, { replace: true });

  return null;
}

export default SessionStatusPage;
