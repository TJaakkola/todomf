import { Authenticator } from '@aws-amplify/ui-react';
import { TodoLists } from './components/TodoLists';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { awsConfig } from './config';

Amplify.configure(awsConfig);

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Todo Lists</h1>
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
          
          <TodoLists userEmail={user?.signInDetails?.loginId || ''} />
        </div>
      )}
    </Authenticator>
  );
}

export default App;