import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FeedbackForm from './components/FeedbackForm';
import AdminPage from './components/AdminPage';
import LoginForm from './components/LoginForm';
import { api, useAddFeedbackMutation, useGetMeQuery } from './store/apiSlice';
import { logout } from './store/authActions';
import { selectToken, selectUser } from './store/authSlice';

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const [view, setView] = useState('submit');
  const [addFeedback] = useAddFeedbackMutation();

  // After a page reload we have a stored token but no user; verify it with the server.
  const { isLoading: checkingSession } = useGetMeQuery(undefined, { skip: !token || !!user });

  function handleLogout() {
    dispatch(logout());
    dispatch(api.util.resetApiState()); // clear cached admin data
    setView('submit');
  }

  function renderAdmin() {
    if (!token) return <LoginForm />;
    if (!user && checkingSession) return <section className="view"><p className="lede">Checking session…</p></section>;
    if (!user) return <LoginForm />;
    return <AdminPage />;
  }

  return (
    <div className="app">
      <nav className="rail">
        <div>
          <div className="brand">
            <span className="brand-mark" />
            <span className="brand-name">Loop</span>
          </div>
          <div className="brand-sub">feedback, handled</div>
        </div>
        <div className="tabs">
          <button
            className={'tab-btn' + (view === 'submit' ? ' active' : '')}
            onClick={() => setView('submit')}
          >
            Give feedback
          </button>
          <button
            className={'tab-btn' + (view === 'admin' ? ' active' : '')}
            onClick={() => setView('admin')}
          >
            Admin dashboard
          </button>
        </div>
        <div className="rail-foot">
          {user ? (
            <>
              Signed in as {user.email}
              <br />
              <button className="link-btn" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            'Admin area requires sign in.'
          )}
        </div>
      </nav>

      <main className="main">
        {view === 'submit' ? (
          <FeedbackForm onSubmit={(entry) => addFeedback(entry).unwrap()} />
        ) : (
          renderAdmin()
        )}
      </main>
    </div>
  );
}
